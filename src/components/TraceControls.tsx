import React, { useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, RotateCcw } from 'lucide-react';
import { TraceStep } from '../types';

interface TraceControlsProps {
  currentStepIndex: number;
  totalSteps: number;
  onStepChange: (index: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  playbackSpeed: number;
  onChangeSpeed: (speed: number) => void;
  currentStep: TraceStep | null;
}

export const TraceControls: React.FC<TraceControlsProps> = ({
  currentStepIndex,
  totalSteps,
  onStepChange,
  isPlaying,
  onTogglePlay,
  playbackSpeed,
  onChangeSpeed,
  currentStep,
}) => {
  const canPrev = currentStepIndex > 0;
  const canNext = currentStepIndex < totalSteps - 1;

  // Keyboard navigation shortcuts: Left / Right arrows
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }
      if (e.key === 'ArrowLeft' && canPrev) {
        onStepChange(currentStepIndex - 1);
      } else if (e.key === 'ArrowRight' && canNext) {
        onStepChange(currentStepIndex + 1);
      } else if (e.key === ' ') {
        e.preventDefault();
        onTogglePlay();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canPrev, canNext, currentStepIndex, onStepChange, onTogglePlay]);

  const percentage = totalSteps > 0 ? Math.round(((currentStepIndex + 1) / totalSteps) * 100) : 0;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-xs flex flex-col gap-3">
      {/* Top row: Playback buttons, stepper counter, and speed */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        
        {/* Playback action buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onStepChange(0)}
            disabled={!canPrev}
            className="w-8 h-8 flex items-center justify-center border border-slate-700 bg-slate-800/80 rounded text-slate-300 hover:bg-slate-700 disabled:opacity-30 transition-colors"
            title="Reset to beginning"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onStepChange(Math.max(0, currentStepIndex - 1))}
            disabled={!canPrev}
            className="w-8 h-8 flex items-center justify-center border border-slate-700 bg-slate-800/80 rounded text-slate-300 hover:bg-slate-700 disabled:opacity-30 transition-colors"
            title="Previous step (Left arrow)"
          >
            <SkipBack className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onTogglePlay}
            className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
            title="Play / Pause (Spacebar)"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{isPlaying ? 'Pause' : 'Play'}</span>
          </button>
          <button
            onClick={() => onStepChange(Math.min(totalSteps - 1, currentStepIndex + 1))}
            disabled={!canNext}
            className="w-8 h-8 flex items-center justify-center border border-slate-700 rounded bg-indigo-950/70 text-indigo-300 font-bold hover:bg-indigo-900/80 disabled:opacity-30 disabled:bg-transparent disabled:text-slate-600 transition-colors"
            title="Next step (Right arrow)"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Step position counter badge */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-slate-400 tracking-wider">STEP</span>
          <span className="px-3 py-1 font-mono text-sm font-bold bg-slate-950 border border-slate-800 rounded-md text-slate-100">
            {totalSteps > 0 ? String(currentStepIndex + 1).padStart(2, '0') : '00'}
            <span className="text-slate-600 mx-1.5">/</span>
            {String(totalSteps).padStart(2, '0')}
          </span>
          {currentStep && (
            <div className="text-xs font-mono text-slate-400 hidden sm:block">
              Line <span className="font-semibold text-indigo-400">{currentStep.line}</span>
            </div>
          )}
        </div>

        {/* Playback speed selector */}
        <div className="flex items-center gap-1 text-xs">
          <span className="text-slate-400 font-medium text-[11px]">Speed:</span>
          {[0.5, 1, 2].map((s) => (
            <button
              key={s}
              onClick={() => onChangeSpeed(s)}
              className={`px-1.5 py-0.5 rounded text-[11px] font-mono font-medium transition-colors ${
                playbackSpeed === s
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>

      </div>

      {/* Scrubber slider bar */}
      <div className="flex flex-col gap-1.5">
        <input
          type="range"
          min={0}
          max={Math.max(0, totalSteps - 1)}
          value={currentStepIndex}
          onChange={(e) => onStepChange(Number(e.target.value))}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
        />
        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
          <div className="flex items-center space-x-2">
            <div className="w-28 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 transition-all duration-150"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
              {percentage}% Analyzed
            </span>
          </div>
          <div>
            Trace Verified: <span className="text-emerald-400 font-bold">SANDBOX SECURE</span>
          </div>
        </div>
      </div>

    </div>
  );
};
