import React from 'react';
import { Lightbulb, BookmarkCheck, ArrowRight } from 'lucide-react';
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
  if (!currentStep) return null;

  // Check if current step line has a step note
  const activeNote = stepNotes.find((sn) => sn.line === currentStep.line);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xs flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          Step Notes
        </h3>
        <span className="text-[11px] text-slate-400 font-mono">
          {stepNotes.length} milestone{stepNotes.length === 1 ? '' : 's'}
        </span>
      </div>

      {stepNotes.length === 0 ? (
        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 text-xs">
          No notable anomalies or special milestone notes recorded for this trace.
        </div>
      ) : (
        <div className="relative pl-6 border-l-2 border-slate-800 space-y-3.5 my-1">
          {stepNotes.map((sn, idx) => {
            const targetStepIdx = allSteps.findIndex((s) => s.line === sn.line);
            const isCurrent = targetStepIdx === currentStepIndex || currentStep.line === sn.line;

            return (
              <div
                key={idx}
                onClick={() => targetStepIdx >= 0 && onJumpToStep(targetStepIdx)}
                className={`relative cursor-pointer transition-all ${
                  isCurrent ? 'opacity-100' : 'opacity-60 hover:opacity-100'
                }`}
              >
                {/* Timeline node circle */}
                <div
                  className={`absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-4 border-slate-900 ${
                    isCurrent ? 'bg-indigo-500 shadow-xs' : 'bg-slate-700'
                  }`}
                />

                <div className="text-[11px] font-bold text-slate-400 mb-1 flex items-center justify-between">
                  <span>Line {sn.line}</span>
                  {targetStepIdx >= 0 && (
                    <span className="text-[10px] font-mono text-slate-500">
                      Step #{targetStepIdx + 1}
                    </span>
                  )}
                </div>

                {/* Box */}
                {isCurrent ? (
                  <div className="bg-indigo-600 text-white p-3 rounded-lg text-xs shadow-xs leading-relaxed">
                    {sn.note}
                  </div>
                ) : (
                  <div className="bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-xs text-slate-300 hover:border-slate-700 hover:bg-slate-800/60 transition-colors leading-relaxed">
                    {sn.note}
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
