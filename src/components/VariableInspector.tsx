import React, { useState } from 'react';
import { Database, TrendingUp, Sparkles, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { VariableAnnotation, TraceStep } from '../types';

interface VariableInspectorProps {
  currentStep: TraceStep | null;
  previousStep: TraceStep | null;
  variableRoles: VariableAnnotation[];
  allSteps: TraceStep[];
  onSelectStep?: (index: number) => void;
}

export const VariableInspector: React.FC<VariableInspectorProps> = ({
  currentStep,
  previousStep,
  variableRoles,
  allSteps,
  onSelectStep,
}) => {
  const [selectedVarHistory, setSelectedVarHistory] = useState<string | null>(null);
  const [showAllRoster, setShowAllRoster] = useState<boolean>(false);

  // Map variable roles by variable name
  const roleMap = new Map<string, string>();
  variableRoles.forEach((v) => {
    roleMap.set(v.name, v.role);
  });

  const currentVars = currentStep?.variables || {};
  const prevVars = previousStep?.variables || {};
  const varKeys = Object.keys(currentVars);

  const formatValue = (val: any): string => {
    if (val === null) return 'null';
    if (val === undefined) return 'undefined';
    if (typeof val === 'string') return `"${val}"`;
    if (Array.isArray(val)) return `[${val.join(', ')}]`;
    if (typeof val === 'object') {
      try {
        return JSON.stringify(val);
      } catch {
        return String(val);
      }
    }
    return String(val);
  };

  const getTypeLabel = (val: any): string => {
    if (Array.isArray(val)) return `list (${val.length})`;
    if (val === null) return 'null';
    if (typeof val === 'object') return 'dict';
    return typeof val;
  };

  const hasChanged = (key: string): boolean => {
    if (!previousStep) return true;
    return JSON.stringify(currentVars[key]) !== JSON.stringify(prevVars[key]);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Scope summary */}
      <div className="flex items-center justify-between text-xs px-1" style={{ color: 'var(--text-muted)' }}>
        <span>
          <strong className="font-semibold" style={{ color: 'var(--text-main)' }}>{varKeys.length}</strong> variable{varKeys.length === 1 ? '' : 's'} in active scope
        </span>
        {variableRoles.length > varKeys.length && (
          <button
            onClick={() => setShowAllRoster(!showAllRoster)}
            className="text-[11px] font-medium flex items-center gap-1 cursor-pointer"
            style={{ color: 'var(--accent-text)' }}
          >
            <span>{showAllRoster ? 'Hide global roster' : `View all program vars (${variableRoles.length})`}</span>
            {showAllRoster ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        )}
      </div>

      {/* Global Roster Accordion (if toggled) */}
      {showAllRoster && (
        <div
          className="p-3 rounded-xl border space-y-2"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-main)',
          }}
        >
          <div className="text-[11px] font-semibold flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
            <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--accent-text)' }} />
            <span>All Defined Program Variables</span>
          </div>
          <div className="grid grid-cols-1 gap-1.5 max-h-48 overflow-y-auto pr-1">
            {variableRoles.map((vr) => (
              <div
                key={vr.name}
                className="p-2 rounded-lg border flex items-baseline gap-2 text-xs"
                style={{
                  backgroundColor: 'var(--bg-panel)',
                  borderColor: 'var(--border-main)',
                }}
              >
                <code className="font-mono font-bold shrink-0" style={{ color: 'var(--accent-text)' }}>{vr.name}</code>
                <span className="text-[11px] leading-snug" style={{ color: 'var(--text-muted)' }}>{vr.role}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Variables List */}
      {varKeys.length === 0 ? (
        <div
          className="p-6 text-center text-xs rounded-xl border"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-main)',
            color: 'var(--text-dim)',
          }}
        >
          No variables initialized in scope at this step.
        </div>
      ) : (
        <div className="space-y-2.5">
          {varKeys.map((name) => {
            const val = currentVars[name];
            const role = roleMap.get(name) || 'Local variable defined in scope.';
            const changed = hasChanged(name);
            const isHistoryOpen = selectedVarHistory === name;

            return (
              <div
                key={name}
                className="p-3.5 rounded-xl border transition-all"
                style={{
                  backgroundColor: changed ? 'var(--bg-card)' : 'var(--bg-panel)',
                  borderColor: changed ? 'var(--accent-border)' : 'var(--border-main)',
                }}
              >
                {/* Top: Name, Tag, Value */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold" style={{ color: 'var(--text-main)' }}>
                      {name}
                    </span>
                    <span
                      className="text-[10px] font-mono px-1.5 py-0.5 rounded border"
                      style={{
                        backgroundColor: 'var(--bg-subtle)',
                        borderColor: 'var(--border-main)',
                        color: 'var(--text-muted)',
                      }}
                    >
                      {getTypeLabel(val)}
                    </span>
                    {changed && (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-950/70 text-emerald-300 border border-emerald-800/60">
                        Updated
                      </span>
                    )}
                  </div>

                  <div className="shrink-0 text-right">
                    <span
                      className="font-mono text-xs font-semibold px-2.5 py-1 rounded-lg border max-w-[200px] inline-block truncate shadow-inner"
                      style={{
                        backgroundColor: 'var(--bg-card)',
                        borderColor: 'var(--border-main)',
                        color: 'var(--accent-text)',
                      }}
                    >
                      {formatValue(val)}
                    </span>
                  </div>
                </div>

                {/* Role / Description */}
                <p className="text-xs leading-relaxed mt-2" style={{ color: 'var(--text-main)' }}>
                  {role}
                </p>

                {/* Footer action: View Timeline */}
                <div className="mt-2.5 pt-2 border-t flex items-center justify-between text-[11px]" style={{ borderColor: 'var(--border-main)' }}>
                  <button
                    onClick={() => setSelectedVarHistory(isHistoryOpen ? null : name)}
                    className="inline-flex items-center gap-1.5 font-medium transition-colors cursor-pointer"
                    style={{ color: 'var(--accent-text)' }}
                  >
                    <Clock className="w-3 h-3" />
                    <span>{isHistoryOpen ? 'Hide value history' : 'Inspect timeline'}</span>
                  </button>
                  <span className="text-[10px]" style={{ color: 'var(--text-dim)' }}>
                    Step {allSteps.filter((s) => s.variables && Object.prototype.hasOwnProperty.call(s.variables, name)).length} of {allSteps.length} recorded
                  </span>
                </div>

                {/* Variable timeline across trace */}
                {isHistoryOpen && (
                  <div
                    className="mt-2.5 p-3 rounded-xl border text-xs font-mono space-y-1.5 max-h-40 overflow-y-auto"
                    style={{
                      backgroundColor: 'var(--bg-card)',
                      borderColor: 'var(--border-main)',
                    }}
                  >
                    <div className="text-[10px] font-sans font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>
                      History of <span style={{ color: 'var(--accent-text)' }}>{name}</span> across steps:
                    </div>
                    {allSteps.map((step, sIdx) => {
                      if (!step.variables || !Object.prototype.hasOwnProperty.call(step.variables, name)) return null;
                      const histVal = step.variables[name];
                      const isThisStep = currentStep === step;

                      return (
                        <div
                          key={sIdx}
                          onClick={() => onSelectStep?.(sIdx)}
                          className={`flex items-center justify-between px-2.5 py-1 rounded-lg cursor-pointer transition-colors ${
                            isThisStep
                              ? 'border font-bold'
                              : 'hover:opacity-80'
                          }`}
                          style={
                            isThisStep
                              ? {
                                  backgroundColor: 'var(--accent-subtle)',
                                  borderColor: 'var(--accent-border)',
                                  color: 'var(--accent-text)',
                                }
                              : {
                                  color: 'var(--text-muted)',
                                }
                          }
                        >
                          <span className="text-[11px]">
                            Step #{sIdx + 1} (Line {step.line}):
                          </span>
                          <span className="font-semibold truncate max-w-[150px]" style={{ color: 'var(--text-main)' }}>
                            {formatValue(histVal)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
