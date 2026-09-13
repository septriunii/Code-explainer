import React from 'react';
import { Flame, ArrowRight, CheckCircle2 } from 'lucide-react';
import { StepNoteAnnotation, TraceStep } from '../types';

interface StepNotesCardProps {
  currentStep: TraceStep | null;
  currentStepIndex: number;
  stepNotes: StepNoteAnnotation[];
  allSteps: TraceStep[];
  onJumpToStep: (stepIndex: number) => void;
}

export const StepNotesCard: React.FC<StepNotesCardProps> = ({
  currentStep,
  currentStepIndex,
  stepNotes,
  allSteps,
  onJumpToStep,
}) => {
  if (stepNotes.length === 0) {
    return (
      <div
        className="p-6 text-center text-xs rounded-xl border"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-main)',
          color: 'var(--text-dim)',
        }}
      >
        No specific milestone anomalies or custom notes recorded for this trace.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      <div className="text-xs px-1" style={{ color: 'var(--text-muted)' }}>
        Click any milestone to jump directly to that point in execution:
      </div>

      <div className="space-y-2">
        {stepNotes.map((sn, idx) => {
          // Find which step in the trace matches this line
          const targetStepIdx = allSteps.findIndex((s) => s.line === sn.line);
          const isCurrent = currentStep?.line === sn.line;

          return (
            <div
              key={idx}
              onClick={() => targetStepIdx >= 0 && onJumpToStep(targetStepIdx)}
              className="p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3"
              style={{
                backgroundColor: isCurrent ? 'var(--bg-card)' : 'var(--bg-panel)',
                borderColor: isCurrent ? 'var(--accent-border)' : 'var(--border-main)',
              }}
            >
              <div className="pt-0.5">
                {isCurrent ? (
                  <Flame className="w-4 h-4 text-amber-400 shrink-0" />
                ) : (
                  <div
                    className="w-4 h-4 rounded-full border flex items-center justify-center text-[10px] font-mono shrink-0"
                    style={{
                      backgroundColor: 'var(--bg-subtle)',
                      borderColor: 'var(--border-main)',
                      color: 'var(--text-muted)',
                    }}
                  >
                    {idx + 1}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-mono text-xs font-semibold" style={{ color: 'var(--accent-text)' }}>
                    Line {sn.line}
                  </span>
                  {targetStepIdx >= 0 && (
                    <span className="text-[11px] font-mono" style={{ color: 'var(--text-dim)' }}>
                      Step #{targetStepIdx + 1}
                    </span>
                  )}
                </div>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-main)' }}>
                  {sn.note}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
