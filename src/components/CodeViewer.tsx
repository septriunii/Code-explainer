import React, { useState, useRef, useEffect } from 'react';
import { ChevronRight, Sparkles, X, Clock, Compass } from 'lucide-react';
import { LineAnnotation, TraceStep, VariableAnnotation } from '../types';

interface CodeViewerProps {
  sourceCode: string;
  language: string;
  currentStep: TraceStep | null;
  annotations: LineAnnotation[];
  variableRoles?: VariableAnnotation[];
  onSelectLineStep?: (stepIndex: number) => void;
  allSteps: TraceStep[];
}

export const CodeViewer: React.FC<CodeViewerProps> = ({
  sourceCode,
  language,
  currentStep,
  annotations,
  variableRoles = [],
  onSelectLineStep,
  allSteps,
}) => {
  const [hoveredLine, setHoveredLine] = useState<number | null>(null);
  const [inspectedLine, setInspectedLine] = useState<number | null>(null);
  const [activeVarTooltip, setActiveVarTooltip] = useState<{
    name: string;
    value: any;
    role?: string;
    changed: boolean;
    x: number;
    y: number;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const activeLineRef = useRef<HTMLDivElement>(null);
  const lines = sourceCode.split('\n');
  const activeLine = currentStep?.line ?? null;

  // Auto-scroll IDE so the executing line is always visible without page scroll
  useEffect(() => {
    if (activeLineRef.current) {
      activeLineRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [activeLine]);

  // Build lookup maps
  const annotationMap = new Map<number, LineAnnotation>();
  annotations.forEach((a) => annotationMap.set(a.line, a));

  const roleMap = new Map<string, string>();
  variableRoles.forEach((v) => roleMap.set(v.name, v.role));

  const lineStepsMap = new Map<number, number[]>();
  allSteps.forEach((s, idx) => {
    if (!lineStepsMap.has(s.line)) lineStepsMap.set(s.line, []);
    lineStepsMap.get(s.line)!.push(idx);
  });

  const currentVars = currentStep?.variables || {};

  const formatValue = (val: any): string => {
    if (val === null) return 'null';
    if (val === undefined) return 'undefined';
    if (typeof val === 'string') return `"${val}"`;
    if (Array.isArray(val)) return `[${val.join(', ')}]`;
    if (typeof val === 'object') return JSON.stringify(val);
    return String(val);
  };

  const handleVarHover = (
    e: React.MouseEvent,
    varName: string,
    val: any
  ) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect() || { top: 0, left: 0 };

    setActiveVarTooltip({
      name: varName,
      value: val,
      role: roleMap.get(varName),
      changed: false,
      x: rect.left - containerRect.left,
      y: rect.bottom - containerRect.top + 6,
    });
  };

  // Render line tokens with interactive variables
  const renderLineTokens = (lineText: string, isCurrentLine: boolean) => {
    if (!lineText) return <span>&nbsp;</span>;

    // Split line into words and delimiters
    const tokens = lineText.split(/([a-zA-Z_][a-zA-Z0-9_]*|[^\w\s]+|\s+)/g).filter(Boolean);

    return tokens.map((token, i) => {
      const isKnownVar = Object.prototype.hasOwnProperty.call(currentVars, token);

      if (isKnownVar) {
        const val = currentVars[token];
        return (
          <span
            key={i}
            onMouseEnter={(e) => handleVarHover(e, token, val)}
            onMouseLeave={() => setActiveVarTooltip(null)}
            className={`cursor-pointer rounded px-0.5 transition-colors font-semibold ${
              isCurrentLine
                ? 'text-indigo-300 hover:text-white bg-indigo-500/20 hover:bg-indigo-500/40'
                : 'text-indigo-400 hover:text-indigo-200 hover:bg-slate-800'
            }`}
            title={`Variable: ${token} = ${formatValue(val)}`}
          >
            {token}
          </span>
        );
      }

      // Syntax styling
      if (/^(def|function|return|while|for|if|elif|else|const|let|var|in|import|from|class)$/.test(token)) {
        return <span key={i} className="text-purple-400 font-semibold">{token}</span>;
      }
      if (/^(print|console|len|range|append|push)$/.test(token)) {
        return <span key={i} className="text-sky-400">{token}</span>;
      }
      if (/^\d+$/.test(token)) {
        return <span key={i} className="text-amber-300">{token}</span>;
      }
      if (/^["'].*["']$/.test(token) || token.startsWith('"') || token.startsWith("'")) {
        return <span key={i} className="text-emerald-300">{token}</span>;
      }

      return <span key={i} className="text-slate-200">{token}</span>;
    });
  };

  const selectedLineDetails = inspectedLine ? annotationMap.get(inspectedLine) : null;
  const inspectedSteps = inspectedLine ? (lineStepsMap.get(inspectedLine) || []) : [];

  return (
    <div 
      ref={containerRef}
      className="flex flex-col h-full border rounded-2xl overflow-hidden shadow-md relative min-h-0 transition-colors duration-200"
      style={{
        backgroundColor: 'var(--bg-panel)',
        borderColor: 'var(--border-main)',
      }}
    >
      
      {/* Code Header Bar */}
      <div
        className="h-10 border-b px-4 flex items-center justify-between shrink-0"
        style={{
          backgroundColor: 'var(--bg-header)',
          borderColor: 'var(--border-main)',
        }}
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold capitalize" style={{ color: 'var(--text-main)' }}>
            {language} Source Code
          </span>
          <span style={{ color: 'var(--text-dim)' }}>•</span>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {lines.length} lines
          </span>
        </div>

        <div className="flex items-center gap-2">
          {activeLine ? (
            <div
              className="flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-xs font-mono font-medium"
              style={{
                backgroundColor: 'var(--accent-subtle)',
                borderColor: 'var(--accent-border)',
                color: 'var(--accent-text)',
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ backgroundColor: 'var(--accent-primary)' }}
              />
              <span>Executing Line {activeLine}</span>
            </div>
          ) : (
            <span className="text-xs font-mono" style={{ color: 'var(--text-dim)' }}>Ready</span>
          )}
        </div>
      </div>

      {/* Code Lines Editor Viewport - Only this scrolls when code is long */}
      <div
        className="flex-1 min-h-0 overflow-y-auto overflow-x-auto font-mono text-[13px] leading-relaxed p-3 select-text scroll-smooth"
        style={{ backgroundColor: 'var(--bg-panel)' }}
      >
        {lines.map((codeText, index) => {
          const lineNum = index + 1;
          const isCurrent = activeLine === lineNum;
          const isInspected = inspectedLine === lineNum;
          const isHovered = hoveredLine === lineNum;
          const stepsCount = (lineStepsMap.get(lineNum) || []).length;

          return (
            <div
              key={lineNum}
              ref={isCurrent ? activeLineRef : undefined}
              onClick={() => setInspectedLine(inspectedLine === lineNum ? null : lineNum)}
              onMouseEnter={() => setHoveredLine(lineNum)}
              onMouseLeave={() => setHoveredLine(null)}
              className={`flex items-center rounded-md px-2 py-0.5 transition-all cursor-pointer group ${
                isCurrent
                  ? 'ring-1'
                  : isInspected
                  ? 'bg-slate-800/80 border-l-4 border-l-slate-400'
                  : isHovered
                  ? 'bg-slate-800/40'
                  : ''
              }`}
              style={
                isCurrent
                  ? {
                      backgroundColor: 'var(--active-line-bg)',
                      borderLeftColor: 'var(--active-line-border)',
                      borderLeftWidth: '4px',
                    }
                  : undefined
              }
            >
              {/* Active step indicator glyph */}
              <div className="w-4 shrink-0 flex items-center justify-center text-xs">
                {isCurrent && (
                  <ChevronRight
                    className="w-4 h-4 stroke-[3]"
                    style={{ color: 'var(--accent-text)' }}
                  />
                )}
              </div>

              {/* Line number */}
              <span
                className={`w-8 shrink-0 text-right pr-3 select-none text-xs ${
                  isInspected
                    ? 'font-medium'
                    : 'text-slate-500 group-hover:text-slate-300'
                }`}
                style={
                  isCurrent
                    ? { color: 'var(--accent-light)', fontWeight: 700 }
                    : isInspected
                    ? { color: 'var(--text-main)' }
                    : { color: 'var(--text-dim)' }
                }
              >
                {String(lineNum).padStart(2, '0')}
              </span>

              {/* Code content */}
              <div className="flex-1 min-w-0 pr-2 whitespace-pre overflow-x-auto">
                {renderLineTokens(codeText, isCurrent)}
              </div>

              {/* Step count badge on hover */}
              {stepsCount > 0 && (
                <span
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-sans px-1.5 py-0.5 rounded border shrink-0"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    borderColor: 'var(--border-main)',
                    color: 'var(--text-muted)',
                  }}
                >
                  {stepsCount}x
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Floating Variable Hover Tooltip */}
      {activeVarTooltip && (
        <div
          className="absolute z-40 border rounded-xl p-3 shadow-2xl text-xs max-w-xs pointer-events-none transition-all"
          style={{
            top: Math.min(activeVarTooltip.y, 420),
            left: Math.min(activeVarTooltip.x, 320),
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--accent-border)',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
          }}
        >
          <div className="flex items-center justify-between gap-2 border-b pb-1.5 mb-1.5" style={{ borderColor: 'var(--border-main)' }}>
            <span className="font-mono font-bold" style={{ color: 'var(--accent-text)' }}>
              {activeVarTooltip.name}
            </span>
            <span
              className="text-[10px] font-mono px-1.5 py-0.2 rounded border"
              style={{
                backgroundColor: 'var(--bg-subtle)',
                borderColor: 'var(--border-main)',
                color: 'var(--text-muted)',
              }}
            >
              {Array.isArray(activeVarTooltip.value) ? 'list' : typeof activeVarTooltip.value}
            </span>
          </div>

          <div className="font-mono text-xs font-semibold mb-1" style={{ color: 'var(--text-main)' }}>
            = {formatValue(activeVarTooltip.value)}
          </div>

          {activeVarTooltip.role && (
            <p className="text-[11px] leading-snug" style={{ color: 'var(--text-muted)' }}>
              {activeVarTooltip.role}
            </p>
          )}
        </div>
      )}

      {/* Inspected Line Drawer (when user clicks a line to inspect) */}
      {selectedLineDetails && (
        <div
          className="p-3 border-t text-xs shrink-0 flex flex-col gap-2"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-main)',
          }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <span
                className="font-mono font-bold px-2 py-0.5 rounded border"
                style={{
                  backgroundColor: 'var(--accent-subtle)',
                  borderColor: 'var(--accent-border)',
                  color: 'var(--accent-text)',
                }}
              >
                Line {inspectedLine}
              </span>
              <span className="font-medium leading-snug" style={{ color: 'var(--text-main)' }}>
                {selectedLineDetails.explanation}
              </span>
            </div>

            <button
              onClick={() => setInspectedLine(null)}
              className="p-1 rounded hover:opacity-80 cursor-pointer"
              style={{ color: 'var(--text-muted)' }}
              title="Close inspection"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Jump to step instances */}
          {inspectedSteps.length > 0 && onSelectLineStep && (
            <div className="flex items-center gap-2 pt-1 border-t text-[11px]" style={{ borderColor: 'var(--border-main)' }}>
              <span className="font-medium" style={{ color: 'var(--text-muted)' }}>Executed in trace:</span>
              <div className="flex flex-wrap gap-1">
                {inspectedSteps.map((sIdx) => (
                  <button
                    key={sIdx}
                    onClick={() => onSelectLineStep(sIdx)}
                    className="px-2 py-0.5 rounded border font-mono text-[11px] transition-colors cursor-pointer"
                    style={{
                      backgroundColor: 'var(--bg-panel)',
                      borderColor: 'var(--border-main)',
                      color: 'var(--text-main)',
                    }}
                  >
                    Step #{sIdx + 1}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Subtle footer instructions */}
      <div
        className="h-6 border-t px-3 flex items-center justify-between text-[10px] shrink-0 select-none"
        style={{
          backgroundColor: 'var(--bg-header)',
          borderColor: 'var(--border-main)',
          color: 'var(--text-dim)',
        }}
      >
        <span>Click any line to inspect step history</span>
        <span>Hover variable names to inspect values</span>
      </div>

    </div>
  );
};
