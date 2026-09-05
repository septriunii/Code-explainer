import React from 'react';
import { Sparkles, Sliders, RefreshCw } from 'lucide-react';
import { PresetExample } from '../types';

interface HeaderProps {
  presets: PresetExample[];
  activePresetId: string;
  onSelectPreset: (presetId: string) => void;
  onOpenCustomModal: () => void;
  onAnnotateWithAi: () => void;
  isAnnotating: boolean;
  activeTab: 'visualizer' | 'json';
  onTabChange: (tab: 'visualizer' | 'json') => void;
  annotationSource: 'gemini' | 'cached' | 'fallback';
}

export const Header: React.FC<HeaderProps> = ({
  presets,
  activePresetId,
  onSelectPreset,
  onOpenCustomModal,
  onAnnotateWithAi,
  isAnnotating,
  activeTab,
  onTabChange,
  annotationSource,
}) => {
  return (
    <header className="h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 sm:px-6 shrink-0 sticky top-0 z-30">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center text-white font-bold text-sm shadow-xs">
          C
        </div>
        <div className="flex items-center">
          <h1 className="text-base sm:text-lg font-semibold tracking-tight text-slate-100">
            CodeTrace AI
          </h1>
          <span className="hidden sm:inline text-slate-400 font-normal ml-2 text-xs sm:text-sm">
            / Execution Annotation
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-2.5">
        {/* Presets dropdown */}
        <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-md px-2.5 py-1 shadow-xs">
          <span className="text-xs font-medium text-slate-400 hidden md:inline">Example:</span>
          <select
            value={activePresetId}
            onChange={(e) => onSelectPreset(e.target.value)}
            className="text-xs font-medium text-slate-200 bg-slate-950 border-none outline-hidden cursor-pointer"
          >
            {presets.map((p) => (
              <option key={p.id} value={p.id} className="bg-slate-900 text-slate-200">
                {p.title} ({p.language})
              </option>
            ))}
            <option value="custom" className="bg-slate-900 text-slate-200">Custom Input & Trace</option>
          </select>
        </div>

        {/* Custom Input Button */}
        <button
          onClick={onOpenCustomModal}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 border border-slate-700 rounded-md hover:bg-slate-750 hover:border-slate-600 transition-colors shadow-xs"
          title="Edit code and trace JSON"
        >
          <Sliders className="w-3.5 h-3.5 text-slate-400" />
          <span>Input & Trace</span>
        </button>

        {/* AI Annotate Button */}
        <button
          onClick={onAnnotateWithAi}
          disabled={isAnnotating}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded shadow-xs hover:bg-indigo-500 disabled:opacity-50 transition-colors"
          title="Generate fresh annotations with Gemini API"
        >
          {isAnnotating ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
          )}
          <span>{isAnnotating ? 'Annotating...' : 'AI Annotate'}</span>
        </button>

        {/* Source indicator badge */}
        <div className="hidden lg:flex items-center text-[11px] font-mono text-slate-400 px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
          <span
            className={`inline-block w-2 h-2 rounded-full mr-1.5 ${
              annotationSource === 'gemini'
                ? 'bg-indigo-500'
                : annotationSource === 'cached'
                ? 'bg-emerald-500'
                : 'bg-amber-500'
            }`}
          />
          <span className="capitalize">{annotationSource}</span>
        </div>

        <div className="h-6 w-px bg-slate-800 hidden sm:block"></div>

        {/* Trace View vs JSON Schema View Tabs */}
        <div className="flex bg-slate-950 border border-slate-800 rounded-md p-1">
          <button
            onClick={() => onTabChange('visualizer')}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
              activeTab === 'visualizer'
                ? 'bg-slate-800 rounded shadow-xs text-slate-100 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Trace View
          </button>
          <button
            onClick={() => onTabChange('json')}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
              activeTab === 'json'
                ? 'bg-slate-800 rounded shadow-xs text-slate-100 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Schema JSON
          </button>
        </div>
      </div>
    </header>
  );
};


