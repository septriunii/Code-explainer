import React from 'react';
import { Terminal } from 'lucide-react';

interface OutputTerminalProps {
  output: string;
}

export const OutputTerminal: React.FC<OutputTerminalProps> = ({ output }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-xs text-slate-100 flex flex-col gap-2">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-xs font-mono font-medium text-slate-200">
            Standard Output
          </span>
        </div>
        <span className="text-[10px] font-mono text-slate-400">
          stdout (cumulative)
        </span>
      </div>

      <div className="font-mono text-xs leading-relaxed min-h-[44px] max-h-[120px] overflow-y-auto whitespace-pre-wrap select-text p-1 text-emerald-400">
        {output ? output : <span className="text-slate-500 italic">// No output produced yet</span>}
      </div>
    </div>
  );
};
