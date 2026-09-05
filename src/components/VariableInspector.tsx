import React, { useState } from 'react';
import { Database, Info, TrendingUp, Sparkles } from 'lucide-react';
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

  // Map variable roles by variable name
  const roleMap = new Map<string, string>();
  variableRoles.forEach((v) => {
    roleMap.set(v.name, v.role);
  });

  const currentVars = currentStep?.variables || {};
  const prevVars = previousStep?.variables || {};
  const varKeys = Object.keys(currentVars);

  // Helper to format values
  const formatValue = (val: any): string => {
    if (val === null) return 'null';
    if (val === undefined) return 'undefined';
    if (typeof val === 'string') return `"${val}"`;
    if (typeof val === 'object') {
      try {
        return JSON.stringify(val);
      } catch {
        return String(val);
      }
    }
    return String(val);
  };

  // Helper to check if a value changed from previous step
  const hasChanged = (key: string): boolean => {
    if (!previousStep) return true;
    return JSON.stringify(currentVars[key]) !== JSON.stringify(prevVars[key]);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xs flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          Variable Roles & State
        </h3>
        <span className="text-[11px] font-mono text-slate-500">
          {varKeys.length} in scope
        </span>
      </div>

      {/* Variables List */}
      {varKeys.length === 0 ? (
        <div className="p-4 text-center text-xs text-slate-500 bg-slate-950 rounded-lg border border-slate-800">
          No variables in scope at this step.
        </div>
      ) : (
        <div className="space-y-2.5">
          {varKeys.map((name) => {
            const val = currentVars[name];
            const changed = hasChanged(name);
            const role = roleMap.get(name) || `State tracked in execution trace for "${name}".`;
            const isHistoryOpen = selectedVarHistory === name;

            return (
              <div
                key={name}
                className={`bg-slate-950 p-3 border rounded-lg shadow-xs transition-colors ${
                  changed
                    ? 'border-indigo-500/60 ring-1 ring-indigo-500/30'
                    : 'border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-sm font-bold text-indigo-400">
                      {name}
                    </span>
                    {changed ? (
                      <span className="text-[10px] bg-emerald-950/60 text-emerald-300 px-1.5 py-0.5 rounded font-medium border border-emerald-800">
                        Updated
                      </span>
                    ) : (
                      <span className="text-[10px] bg-slate-900 text-slate-400 px-1.5 py-0.5 rounded font-medium border border-slate-800">
                        State
                      </span>
                    )}
                  </div>

                  {/* Value representation */}
                  <div className="shrink-0 text-right">
                    <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-900 text-slate-100 max-w-[170px] inline-block truncate shadow-2xs border border-slate-700">
                      {formatValue(val)}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-normal">
                  {role}
                </p>

                {/* History toggle */}
                <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                  <button
                    onClick={() => setSelectedVarHistory(isHistoryOpen ? null : name)}
                    className="inline-flex items-center gap-1 text-slate-400 hover:text-indigo-400 transition-colors font-medium"
                  >
                    <TrendingUp className="w-3 h-3" />
                    <span>{isHistoryOpen ? 'Hide History' : 'View Timeline'}</span>
                  </button>
                  <span className="font-mono text-[10px] text-slate-500">
                    type: {Array.isArray(val) ? 'array' : typeof val}
                  </span>
                </div>

                {/* Variable timeline across trace */}
                {isHistoryOpen && (
                  <div className="mt-2 p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono space-y-1 max-h-36 overflow-y-auto">
                    <div className="text-[10px] font-sans font-bold text-slate-500 uppercase tracking-wide mb-1">
                      Timeline across steps:
                    </div>
                    {allSteps.map((step, sIdx) => {
                      if (step.variables && step.variables[name] !== undefined) {
                        const isThisStep = allSteps.indexOf(currentStep!) === sIdx;
                        return (
                          <div
                            key={sIdx}
                            onClick={() => onSelectStep?.(sIdx)}
                            className={`flex items-center justify-between px-2 py-1 rounded cursor-pointer transition-colors ${
                              isThisStep
                                ? 'bg-indigo-950/70 text-indigo-300 font-bold border border-indigo-800'
                                : 'hover:bg-slate-800 text-slate-300'
                            }`}
                          >
                            <span className="text-[11px]">
                              Step #{sIdx + 1} (Line {step.line}):
                            </span>
                            <span className="truncate max-w-[140px] font-mono">
                              {formatValue(step.variables[name])}
                            </span>
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Global Roster of All Variables In Program */}
      <div className="mt-1 pt-2.5 border-t border-slate-800">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-2">
          <Sparkles className="w-3 h-3 text-indigo-400" />
          <span>All Program Variables ({variableRoles.length})</span>
        </div>
        <div className="space-y-1.5">
          {variableRoles.map((vr) => (
            <div
              key={vr.name}
              className="text-xs p-2 rounded bg-slate-950 border border-slate-800 flex items-baseline gap-1.5"
            >
              <code className="font-mono text-[11px] font-bold text-indigo-400 shrink-0">
                {vr.name}:
              </code>
              <span className="text-slate-300 text-[11px] leading-tight">
                {vr.role}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
