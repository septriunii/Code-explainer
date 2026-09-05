import React, { useState } from 'react';
import { HelpCircle, ChevronRight, CornerDownRight, Tag } from 'lucide-react';
import { LineAnnotation, TraceStep } from '../types';

interface CodeViewerProps {
  sourceCode: string;
  language: string;
  currentStep: TraceStep | null;
  annotations: LineAnnotation[];
  onSelectLineStep?: (stepIndex: number) => void;
  allSteps: TraceStep[];
}

export const CodeViewer: React.FC<CodeViewerProps> = ({
  sourceCode,
  language,
  currentStep,
  annotations,
  onSelectLineStep,
  allSteps,
}) => {
  const [hoveredLine, setHoveredLine] = useState<number | null>(null);
  const [selectedLine, setSelectedLine] = useState<number | null>(null);

  const lines = sourceCode.split('\n');
  const activeLine = currentStep?.line ?? null;

  // Map annotations by line number
  const annotationMap = new Map<number, LineAnnotation>();
  annotations.forEach((a) => {
    annotationMap.set(a.line, a);
  });

  // Calculate step occurrences for each line
  const lineStepsMap = new Map<number, number[]>();
  allSteps.forEach((s, idx) => {
    if (!lineStepsMap.has(s.line)) {
      lineStepsMap.set(s.line, []);
    }
    lineStepsMap.get(s.line)!.push(idx);
  });

  const inspectedLine = selectedLine ?? hoveredLine;
  const inspectedAnnotation = inspectedLine ? annotationMap.get(inspectedLine) : null;

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xs">
      
      {/* Code Header Bar */}
      <div className="h-10 bg-slate-950/90 border-b border-slate-800 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            Source & Line Explanations
          </span>
          <span className="text-slate-700">•</span>
          <span className="text-xs text-slate-500 font-mono">
            {language} ({lines.length} lines)
          </span>
        </div>
        <div className="text-[11px] font-mono">
          {activeLine ? (
            <span className="text-indigo-400 font-semibold">Active: Line {activeLine}</span>
          ) : (
            <span className="text-slate-500">No active step</span>
          )}
        </div>
      </div>

      {/* Code Lines Container */}
      <div className="flex-1 overflow-auto font-mono select-text p-3 space-y-0.5 bg-slate-900">
        {lines.map((codeText, index) => {
          const lineNum = index + 1;
          const isCurrent = activeLine === lineNum;
          const isInspected = inspectedLine === lineNum;
          const annot = annotationMap.get(lineNum);
          const stepsForLine = lineStepsMap.get(lineNum) || [];
          const hasArgs = annot?.arguments && annot.arguments.length > 0;

          return (
            <div key={lineNum} className="group relative">
              <div
                onClick={() => setSelectedLine(selectedLine === lineNum ? null : lineNum)}
                onMouseEnter={() => setHoveredLine(lineNum)}
                onMouseLeave={() => setHoveredLine(null)}
                className={`flex items-start rounded px-2 transition-all cursor-pointer text-[13px] leading-relaxed py-1 ${
                  isCurrent
                    ? 'bg-indigo-950/60 text-slate-100 font-semibold ring-1 ring-indigo-500/50 border-l-2 border-l-indigo-500'
                    : isInspected
                    ? 'bg-slate-800/80 text-slate-100'
                    : 'hover:bg-slate-800/50 text-slate-300'
                }`}
              >
                {/* Step indicator arrow */}
                <div className="w-5 shrink-0 flex items-center justify-center pt-0.5 text-xs text-indigo-400">
                  {isCurrent && <ChevronRight className="w-3.5 h-3.5 stroke-[3]" />}
                </div>

                {/* Line number */}
                <span
                  className={`w-9 shrink-0 select-none text-right pr-3 pt-0.5 text-xs ${
                    isCurrent
                      ? 'text-indigo-400 font-bold'
                      : 'text-slate-600 group-hover:text-slate-400'
                  }`}
                >
                  {lineNum}
                </span>

                {/* Code text */}
                <div className="flex-1 min-w-0 pr-3 overflow-x-auto whitespace-pre">
                  <span className="text-slate-200">
                    {codeText || ' '}
                  </span>
                </div>

                {/* Annotation tags */}
                <div className="shrink-0 flex items-center gap-1.5 pt-0.5">
                  {hasArgs && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-sans font-medium bg-indigo-950/80 text-indigo-300 border border-indigo-800">
                      {annot!.arguments!.length} args
                    </span>
                  )}
                  {annot && (
                    <HelpCircle
                      className={`w-3.5 h-3.5 transition-opacity ${
                        isCurrent
                          ? 'text-indigo-400 opacity-100'
                          : 'text-slate-600 opacity-50 group-hover:opacity-90'
                      }`}
                    />
                  )}
                </div>
              </div>

              {/* Inline Callout when Selected or Active */}
              {(isCurrent || selectedLine === lineNum) && annot && (
                <div className="ml-14 mr-3 my-1.5 p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs font-sans text-slate-200 shadow-md">
                  <div className="flex items-start gap-1.5 font-medium">
                    <CornerDownRight className="w-3.5 h-3.5 text-indigo-400 mt-0.5 shrink-0" />
                    <span className="text-slate-200 leading-normal">{annot.explanation}</span>
                  </div>

                  {/* Arguments breakdown */}
                  {annot.arguments && annot.arguments.length >= 2 && (
                    <div className="mt-2.5 pt-2 border-t border-slate-800 space-y-1.5">
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <Tag className="w-3 h-3 text-indigo-400" />
                        <span>Function Call Arguments</span>
                      </div>
                      <div className="grid grid-cols-1 gap-1.5 mt-1">
                        {annot.arguments.map((arg, argIdx) => (
                          <div
                            key={argIdx}
                            className="flex flex-wrap items-baseline gap-1.5 text-xs bg-slate-900 px-2.5 py-1.5 rounded border border-slate-800"
                          >
                            <code className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 font-semibold border border-indigo-900">
                              {arg.name}
                            </code>
                            <span className="text-slate-600">→</span>
                            <span className="text-slate-300">{arg.meaning}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Execution Trace hits */}
                  {stepsForLine.length > 0 && onSelectLineStep && (
                    <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center gap-1.5 text-[11px] text-slate-400">
                      <span className="font-medium text-slate-300">Executed at step:</span>
                      <div className="flex flex-wrap gap-1">
                        {stepsForLine.map((sIdx) => (
                          <button
                            key={sIdx}
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectLineStep(sIdx);
                            }}
                            className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-750 font-mono text-[10px] text-slate-300 transition-colors"
                          >
                            #{sIdx + 1}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Floating Sticky Explanation Footer if line hovered but not clicked */}
      {inspectedAnnotation && selectedLine !== inspectedLine && (
        <div className="px-4 py-2 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300 shrink-0">
          <div className="flex items-center gap-2 truncate">
            <span className="font-mono font-semibold text-indigo-400">
              Line {inspectedLine}:
            </span>
            <span className="truncate text-slate-300">{inspectedAnnotation.explanation}</span>
          </div>
          <span className="text-[11px] text-slate-500 shrink-0 ml-2">
            Click line to pin details
          </span>
        </div>
      )}

    </div>
  );
};


