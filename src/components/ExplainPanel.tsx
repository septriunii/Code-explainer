import React from 'react';
import { 
  Sparkles, 
  HelpCircle, 
  ArrowRight, 
  Info, 
  Compass, 
  CheckCircle2, 
  Tag, 
  CornerDownRight,
  TrendingUp,
  Flame
} from 'lucide-react';
import { LineAnnotation, StepNoteAnnotation, TraceStep, VariableAnnotation } from '../types';

interface ExplainPanelProps {
  currentStep: TraceStep | null;
  previousStep: TraceStep | null;
  currentStepIndex: number;
  totalSteps: number;
  lineAnnotation: LineAnnotation | null;
  stepNote: StepNoteAnnotation | null;
  variableRoles: VariableAnnotation[];
  sourceLineText: string;
  onJumpToStep?: (stepIndex: number) => void;
  onSelectVariableTab?: () => void;
}

export const ExplainPanel: React.FC<ExplainPanelProps> = ({
  currentStep,
  previousStep,
  currentStepIndex,
  totalSteps,
  lineAnnotation,
  stepNote,
  variableRoles,
  sourceLineText,
  onJumpToStep,
  onSelectVariableTab,
}) => {
  if (!currentStep) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
        <HelpCircle className="w-8 h-8 text-slate-600 mx-auto mb-3" />
        <p className="text-sm font-medium text-slate-300">No active execution step</p>
        <p className="text-xs text-slate-500 mt-1">Press Play or Step Forward to start tracing execution.</p>
      </div>
    );
  }

  // Detect which variables changed in this step
  const currentVars = currentStep.variables || {};
  const prevVars = previousStep ? (previousStep.variables || {}) : {};
  const changedVars: { name: string; oldVal: any; newVal: any; role?: string; isNew: boolean }[] = [];

  Object.keys(currentVars).forEach((key) => {
    const newVal = currentVars[key];
    const hadKey = Object.prototype.hasOwnProperty.call(prevVars, key);
    const oldVal = hadKey ? prevVars[key] : undefined;

    const isChanged = !hadKey || JSON.stringify(oldVal) !== JSON.stringify(newVal);
    if (isChanged) {
      const roleObj = variableRoles.find((vr) => vr.name === key);
      changedVars.push({
        name: key,
        oldVal,
        newVal,
        role: roleObj?.role,
        isNew: !hadKey,
      });
    }
  });

  // Synthesize educational "Why it matters" context
  const getContextualInsight = (): { title: string; explanation: string } => {
    if (stepNote) {
      return {
        title: 'Algorithmic Milestone',
        explanation: stepNote.note,
      };
    }

    const trimmed = sourceLineText.trim();
    if (trimmed.startsWith('def ') || trimmed.startsWith('function ')) {
      return {
        title: 'Function Definition',
        explanation: 'Declares the reusable logic block and sets up parameter bindings.',
      };
    }
    if (trimmed.startsWith('while ') || trimmed.startsWith('for ')) {
      return {
        title: 'Loop Condition Evaluation',
        explanation: 'Decides whether another iteration should run based on the current state.',
      };
    }
    if (trimmed.startsWith('if ') || trimmed.startsWith('elif ') || trimmed.startsWith('else:')) {
      return {
        title: 'Branch Decision',
        explanation: 'Evaluates state to select the correct execution path.',
      };
    }
    if (trimmed.startsWith('return ')) {
      return {
        title: 'Function Completion',
        explanation: 'Produces the final return value and transfers control back to the caller.',
      };
    }
    if (trimmed.includes('print(') || trimmed.includes('console.log(')) {
      return {
        title: 'Standard Output',
        explanation: 'Communicates runtime results to stdout for inspection.',
      };
    }
    if (changedVars.length > 0) {
      return {
        title: 'State Progression',
        explanation: `Progresses the algorithm by updating ${changedVars.map((v) => `\`${v.name}\``).join(', ')} to advance towards termination.`,
      };
    }

    return {
      title: 'Context & Purpose',
      explanation: 'Executes this statement as part of the normal sequential flow of the algorithm.',
    };
  };

  const insight = getContextualInsight();

  const formatValue = (val: any) => {
    if (val === undefined) return 'undefined';
    if (val === null) return 'null';
    if (typeof val === 'string') return `"${val}"`;
    if (Array.isArray(val)) return `[${val.join(', ')}]`;
    if (typeof val === 'object') return JSON.stringify(val);
    return String(val);
  };

  return (
    <div
      className="border rounded-2xl p-3.5 shadow-md flex flex-col gap-2.5 relative overflow-hidden shrink-0 max-h-[50%] overflow-y-auto transition-colors duration-200"
      style={{
        backgroundColor: 'var(--bg-panel)',
        borderColor: 'var(--border-main)',
      }}
    >
      
      {/* Decorative subtle gradient background glow */}
      <div
        className="absolute -top-24 -right-24 w-60 h-60 rounded-full blur-3xl pointer-events-none opacity-20"
        style={{ backgroundColor: 'var(--accent-primary)' }}
      />

      {/* Header: Current Line & Status */}
      <div className="flex items-center justify-between gap-2 border-b pb-2" style={{ borderColor: 'var(--border-main)' }}>
        <div className="flex items-center gap-2">
          <span
            className="px-2 py-0.5 rounded-md border font-mono text-xs font-bold tracking-wide"
            style={{
              backgroundColor: 'var(--accent-subtle)',
              borderColor: 'var(--accent-border)',
              color: 'var(--accent-text)',
            }}
          >
            Line {currentStep.line}
          </span>
          <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
            Step {currentStepIndex + 1} of {totalSteps}
          </span>
        </div>

        {stepNote && (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-semibold">
            <Flame className="w-3 h-3 text-amber-400" />
            <span>Key Milestone</span>
          </div>
        )}
      </div>

      {/* Code statement snippet preview */}
      <div
        className="border rounded-lg px-3 py-1.5 font-mono text-xs flex items-center gap-2 overflow-x-auto shrink-0"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-main)',
        }}
      >
        <span className="select-none text-[11px]" style={{ color: 'var(--text-dim)' }}>{currentStep.line}</span>
        <span className="font-semibold truncate" style={{ color: 'var(--text-main)' }}>{sourceLineText.trim() || '—'}</span>
      </div>

      {/* Primary Explanation (The Focal Point) */}
      <div className="space-y-1">
        <h2 className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
          <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--accent-text)' }} />
          <span>What this line does</span>
        </h2>
        <p className="text-sm sm:text-[15px] font-medium leading-snug" style={{ color: 'var(--text-main)' }}>
          {lineAnnotation?.explanation || (
            <span className="font-normal italic" style={{ color: 'var(--text-muted)' }}>
              Executing line {currentStep.line} of the program.
            </span>
          )}
        </p>
      </div>

      {/* Why it matters / Contextual Insight */}
      <div
        className="p-2.5 rounded-xl border space-y-0.5"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-main)',
        }}
      >
        <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: 'var(--accent-text)' }}>
          <Compass className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--accent-text)' }} />
          <span>Why it matters: {insight.title}</span>
        </div>
        <p className="text-xs leading-relaxed pl-5" style={{ color: 'var(--text-main)' }}>
          {insight.explanation}
        </p>
      </div>

      {/* What Changed in This Step */}
      {changedVars.length > 0 && (
        <div className="space-y-1.5 pt-0.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold flex items-center gap-1.5" style={{ color: 'var(--text-main)' }}>
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>Variable changes in this step</span>
            </span>
            {onSelectVariableTab && (
              <button
                onClick={onSelectVariableTab}
                className="text-[11px] transition-colors font-medium cursor-pointer"
                style={{ color: 'var(--accent-text)' }}
              >
                All variables ({Object.keys(currentVars).length}) →
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-1.5">
            {changedVars.map((v) => (
              <div
                key={v.name}
                className="p-2 rounded-lg border shadow-xs flex flex-col gap-1 text-xs"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderColor: 'var(--border-main)',
                }}
              >
                <div className="flex items-center justify-between flex-wrap gap-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-indigo-300 text-xs">
                      {v.name}
                    </span>
                    <span className="text-[10px] uppercase font-semibold px-1.5 py-0.2 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/60">
                      {v.isNew ? 'Initialized' : 'Updated'}
                    </span>
                  </div>

                  {/* Value transition */}
                  <div className="flex items-center gap-1.5 font-mono text-xs">
                    {!v.isNew && (
                      <>
                        <span className="text-slate-500 line-through">
                          {formatValue(v.oldVal)}
                        </span>
                        <ArrowRight className="w-3 h-3 text-slate-600" />
                      </>
                    )}
                    <span className="font-semibold text-emerald-300 px-1.5 py-0.2 rounded bg-emerald-950/40 border border-emerald-800/40">
                      {formatValue(v.newVal)}
                    </span>
                  </div>
                </div>

                {v.role && (
                  <p className="text-[11px] text-slate-400 leading-tight">
                    {v.role}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Function Arguments Breakdown (if line has function call with >=2 args) */}
      {lineAnnotation?.arguments && lineAnnotation.arguments.length >= 2 && (
        <div className="space-y-1.5 pt-0.5">
          <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-indigo-400" />
            <span>Call Arguments Breakdown</span>
          </div>
          <div className="grid grid-cols-1 gap-1">
            {lineAnnotation.arguments.map((arg, idx) => (
              <div
                key={idx}
                className="flex items-baseline gap-2 p-1.5 rounded-lg border text-xs"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderColor: 'var(--border-main)',
                }}
              >
                <code
                  className="font-mono text-xs font-bold px-1 py-0.2 rounded border shrink-0"
                  style={{
                    backgroundColor: 'var(--accent-subtle)',
                    borderColor: 'var(--accent-border)',
                    color: 'var(--accent-text)',
                  }}
                >
                  {arg.name}
                </code>
                <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{arg.meaning}</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
