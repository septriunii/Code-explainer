import React from 'react';
import { Code2 } from 'lucide-react';
import { PresetExample } from '../types';

interface HeaderProps {
  presets: PresetExample[];
  activePresetId: string;
  onSelectPreset: (presetId: string) => void;
  language?: string;
}

export const Header: React.FC<HeaderProps> = ({
  presets,
  activePresetId,
  onSelectPreset,
}) => {
  return (
    <header
      className="h-13 backdrop-blur-md border-b flex items-center justify-between px-3 sm:px-5 shrink-0 z-30 transition-colors duration-200"
      style={{
        backgroundColor: 'var(--bg-header)',
        borderColor: 'var(--border-main)',
      }}
    >
      {/* Brand & Identity */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-md shrink-0 transition-colors"
          style={{ backgroundColor: 'var(--accent-primary)', color: '#131314' }}
        >
          <Code2 className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm sm:text-base font-bold tracking-tight" style={{ color: 'var(--text-main)' }}>
              CodeTrace
            </h1>
            <span
              className="text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded-full border hidden xs:inline-block"
              style={{
                backgroundColor: 'var(--accent-subtle)',
                borderColor: 'var(--accent-border)',
                color: 'var(--accent-text)',
              }}
            >
              Interactive
            </span>
          </div>
          <p className="text-[10px] hidden sm:block leading-none mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Step-by-step code execution & explanation engine
          </p>
        </div>
      </div>

      {/* Main Actions Bar: Presets Selector */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        <div
          className="flex items-center border rounded-xl px-2.5 py-1.5 shadow-inner"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-main)',
          }}
        >
          <select
            value={activePresetId}
            onChange={(e) => onSelectPreset(e.target.value)}
            className="text-xs font-medium bg-transparent border-none outline-hidden cursor-pointer"
            style={{ color: 'var(--text-main)' }}
          >
            {presets.map((p) => (
              <option key={p.id} value={p.id} style={{ backgroundColor: 'var(--bg-panel)', color: 'var(--text-main)' }}>
                {p.title} ({p.language})
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
};

