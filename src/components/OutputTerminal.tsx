import React, { useState } from 'react';
import { Terminal, Copy, Check } from 'lucide-react';

interface OutputTerminalProps {
  output: string;
}

export const OutputTerminal: React.FC<OutputTerminalProps> = ({ output }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="border rounded-xl overflow-hidden shadow-inner flex flex-col"
      style={{
        backgroundColor: 'var(--bg-card)',
        borderColor: 'var(--border-main)',
      }}
    >
      <div
        className="h-9 border-b px-3.5 flex items-center justify-between"
        style={{
          backgroundColor: 'var(--bg-header)',
          borderColor: 'var(--border-main)',
        }}
      >
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5" style={{ color: 'var(--accent-text)' }} />
          <span className="text-xs font-mono font-medium" style={{ color: 'var(--text-main)' }}>
            Console Output
          </span>
          {output && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          )}
        </div>
        
        {output && (
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-[11px] transition-colors cursor-pointer"
            style={{ color: 'var(--text-muted)' }}
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        )}
      </div>

      <div
        className="font-mono text-xs leading-relaxed p-3.5 min-h-[90px] max-h-[160px] overflow-y-auto whitespace-pre-wrap select-text text-emerald-400"
        style={{ backgroundColor: 'var(--bg-card)' }}
      >
        {output ? (
          output
        ) : (
          <span className="italic select-none" style={{ color: 'var(--text-dim)' }}>
            // No output printed yet at this execution step
          </span>
        )}
      </div>
    </div>
  );
};
