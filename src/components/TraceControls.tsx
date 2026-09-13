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
    <div
      className="border rounded-xl px-3.5 py-2.5 shadow-md flex flex-col gap-2 shrink-0 transition-colors duration-200"
      style={{
        backgroundColor: 'var(--bg-panel)',
        borderColor: 'var(--border-main)',
      }}
    >
      
      {/* Top row: Stepper info, Controls, and Speed */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        
        {/* Step count display */}
        <div className="flex items-center gap-2">
          <div
            className="px-2.5 py-1 rounded-lg border text-xs font-mono font-bold flex items-center gap-1.5 shadow-inner"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-main)',
              color: 'var(--text-main)',
            }}
          >
            <span className="font-sans font-medium text-[10px]" style={{ color: 'var(--text-dim)' }}>Step</span>
            <span style={{ color: 'var(--accent-text)' }}>{String(currentStepIndex + 1).padStart(2, '0')}</span>
            <span style={{ color: 'var(--text-dim)' }}>/</span>
            <span style={{ color: 'var(--text-muted)' }}>{String(totalSteps).padStart(2, '0')}</span>
          </div>
          {currentStep && (
            <span className="text-xs font-mono hidden sm:inline" style={{ color: 'var(--text-muted)' }}>
              Line <strong className="font-semibold" style={{ color: 'var(--accent-text)' }}>{currentStep.line}</strong>
            </span>
          )}
        </div>

        {/* Playback action buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onStepChange(0)}
            disabled={!canPrev}
            className="w-7 h-7 flex items-center justify-center rounded-lg border disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-main)',
              color: 'var(--text-muted)',
            }}
            title="Reset to beginning"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onStepChange(Math.max(0, currentStepIndex - 1))}
            disabled={!canPrev}
            className="px-2.5 py-1 rounded-lg border disabled:opacity-30 disabled:pointer-events-none transition-colors text-xs font-medium flex items-center gap-1.5 cursor-pointer"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-main)',
              color: 'var(--text-main)',
            }}
            title="Previous step (Left Arrow)"
          >
            <SkipBack className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Prev</span>
          </button>

          <button
            onClick={onTogglePlay}
            className="px-3.5 py-1 rounded-lg text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer hover:opacity-90"
            style={{ backgroundColor: 'var(--accent-primary)' }}
            title="Play / Pause (Spacebar)"
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Play</span>
              </>
            )}
          </button>

          <button
            onClick={() => onStepChange(Math.min(totalSteps - 1, currentStepIndex + 1))}
            disabled={!canNext}
            className="px-2.5 py-1 rounded-lg border disabled:opacity-30 disabled:pointer-events-none transition-colors text-xs font-medium flex items-center gap-1.5 cursor-pointer"
            style={{
              backgroundColor: 'var(--accent-subtle)',
              borderColor: 'var(--accent-border)',
              color: 'var(--accent-text)',
            }}
            title="Next step (Right Arrow)"
          >
            <span>Next</span>
            <SkipForward className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Speed Controls */}
        <div
          className="flex items-center gap-1 border rounded-lg p-0.5 text-xs"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-main)',
          }}
        >
          {[0.5, 1, 2].map((s) => (
            <button
              key={s}
              onClick={() => onChangeSpeed(s)}
              className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium transition-colors cursor-pointer"
              style={{
                backgroundColor: playbackSpeed === s ? 'var(--accent-primary)' : 'transparent',
                color: playbackSpeed === s ? '#ffffff' : 'var(--text-muted)',
              }}
            >
              {s}x
            </button>
          ))}
        </div>

      </div>

      {/* Progress timeline scrubber */}
      <div className="flex items-center gap-2 pt-0.5">
        <span className="text-[10px] shrink-0 font-mono" style={{ color: 'var(--text-dim)' }}>1</span>
        <div className="relative flex-1 flex items-center">
          <input
            type="range"
            min={0}
            max={Math.max(0, totalSteps - 1)}
            value={currentStepIndex}
            onChange={(e) => onStepChange(Number(e.target.value))}
            className="w-full h-1.5 rounded-lg appearance-none cursor-pointer border"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-main)',
              accentColor: 'var(--accent-primary)',
            }}
          />
        </div>
        <span className="text-[10px] shrink-0 font-mono" style={{ color: 'var(--text-dim)' }}>{totalSteps}</span>
      </div>

    </div>
  );
};
