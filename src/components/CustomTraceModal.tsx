import React, { useState } from 'react';
import { X, Play, Code2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { TraceStep } from '../types';

interface CustomTraceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (code: string, language: string, trace: TraceStep[]) => void;
  initialCode?: string;
  initialLanguage?: string;
  initialTrace?: TraceStep[];
}

export const CustomTraceModal: React.FC<CustomTraceModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialCode = '',
  initialLanguage = 'python',
  initialTrace = [],
}) => {
  const [code, setCode] = useState(initialCode);
  const [language, setLanguage] = useState(initialLanguage);
  const [traceText, setTraceText] = useState(() => JSON.stringify(initialTrace, null, 2));
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleValidateAndSubmit = () => {
    setError(null);
    if (!code.trim()) {
      setError('Please provide the source code.');
      return;
    }

    try {
      const parsedTrace = JSON.parse(traceText);
      if (!Array.isArray(parsedTrace)) {
        setError('Trace must be a JSON array of steps: [{ line: number, variables: {}, output: "" }]');
        return;
      }
      if (parsedTrace.length === 0) {
        setError('Trace array must contain at least one step.');
        return;
      }
      for (let i = 0; i < parsedTrace.length; i++) {
        const step = parsedTrace[i];
        if (typeof step.line !== 'number') {
          setError(`Step #${i + 1} is missing a numeric "line" property.`);
          return;
        }
      }

      onSubmit(code, language, parsedTrace);
      onClose();
    } catch (e: any) {
      setError(`Invalid JSON trace: ${e.message}`);
    }
  };

  const loadSimpleExample = () => {
    setCode(`def countdown(n):
    while n > 0:
        print(n)
        n -= 1
    return "Blastoff!"

result = countdown(3)
print(result)`);
    setLanguage('python');
    setTraceText(
      JSON.stringify(
        [
          { line: 7, variables: {}, output: '' },
          { line: 1, variables: { n: 3 }, output: '' },
          { line: 2, variables: { n: 3 }, output: '' },
          { line: 3, variables: { n: 3 }, output: '3\n' },
          { line: 4, variables: { n: 2 }, output: '3\n' },
          { line: 2, variables: { n: 2 }, output: '3\n' },
          { line: 3, variables: { n: 2 }, output: '3\n2\n' },
          { line: 4, variables: { n: 1 }, output: '3\n2\n' },
          { line: 2, variables: { n: 1 }, output: '3\n2\n' },
          { line: 3, variables: { n: 1 }, output: '3\n2\n1\n' },
          { line: 4, variables: { n: 0 }, output: '3\n2\n1\n' },
          { line: 2, variables: { n: 0 }, output: '3\n2\n1\n' },
          { line: 5, variables: { n: 0 }, output: '3\n2\n1\n' },
          { line: 7, variables: { result: 'Blastoff!' }, output: '3\n2\n1\n' },
          { line: 8, variables: { result: 'Blastoff!' }, output: '3\n2\n1\nBlastoff!\n' }
        ],
        null,
        2
      )
    );
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-xs p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)' }}>
      <div
        className="rounded-2xl border shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden transition-colors"
        style={{
          backgroundColor: 'var(--bg-panel)',
          borderColor: 'var(--border-main)',
          color: 'var(--text-main)',
        }}
      >
        
        {/* Modal Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b shrink-0"
          style={{
            backgroundColor: 'var(--bg-header)',
            borderColor: 'var(--border-main)',
          }}
        >
          <div>
            <h2 className="text-base font-semibold" style={{ color: 'var(--text-main)' }}>
              Provide Code & Execution Trace
            </h2>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Supply ground-truth execution trace produced from a sandbox run
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadSimpleExample}
              className="text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors cursor-pointer"
              style={{
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border-main)',
                color: 'var(--text-main)',
              }}
            >
              Load Countdown Demo
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg transition-colors cursor-pointer hover:opacity-80"
              style={{ color: 'var(--text-muted)' }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          
          {error && (
            <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-200 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Source code input */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold" style={{ color: 'var(--text-main)' }}>
                  1. Source Code
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="text-xs font-mono font-medium border rounded px-2 py-0.5 outline-hidden"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    borderColor: 'var(--border-main)',
                    color: 'var(--text-main)',
                  }}
                >
                  <option value="python">Python</option>
                  <option value="javascript">JavaScript</option>
                  <option value="typescript">TypeScript</option>
                  <option value="java">Java</option>
                  <option value="c">C / C++</option>
                </select>
              </div>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="// Enter original source code here..."
                rows={16}
                className="w-full p-3 font-mono text-xs rounded-xl border focus:outline-hidden"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderColor: 'var(--border-main)',
                  color: 'var(--text-main)',
                }}
              />
            </div>

            {/* Trace JSON input */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold" style={{ color: 'var(--text-main)' }}>
                  2. Execution Trace (JSON array)
                </label>
                <span className="text-[11px] font-mono" style={{ color: 'var(--text-dim)' }}>
                  [&#123; line, variables, output &#125;]
                </span>
              </div>
              <textarea
                value={traceText}
                onChange={(e) => setTraceText(e.target.value)}
                placeholder="[ { &quot;line&quot;: 1, &quot;variables&quot;: {}, &quot;output&quot;: &quot;&quot; } ]"
                rows={16}
                className="w-full p-3 font-mono text-xs rounded-xl border focus:outline-hidden"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderColor: 'var(--border-main)',
                  color: 'var(--text-main)',
                }}
              />
            </div>

          </div>

          <div
            className="p-3 rounded-xl border text-xs flex items-start gap-2"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-main)',
              color: 'var(--text-muted)',
            }}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
            <div>
              <span className="font-semibold" style={{ color: 'var(--text-main)' }}>Ground Truth Principle:</span> The annotation engine will never recompute, alter, or contradict values in the trace. Every line, variable snapshot, and printed output is treated as immutable fact.
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div
          className="flex items-center justify-end gap-3 px-6 py-4 border-t shrink-0"
          style={{
            backgroundColor: 'var(--bg-header)',
            borderColor: 'var(--border-main)',
          }}
        >
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium transition-colors cursor-pointer hover:opacity-80"
            style={{ color: 'var(--text-muted)' }}
          >
            Cancel
          </button>
          <button
            onClick={handleValidateAndSubmit}
            className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white rounded-lg transition-opacity cursor-pointer shadow-xs hover:opacity-90"
            style={{ backgroundColor: 'var(--accent-primary)' }}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Apply Trace & Annotate</span>
          </button>
        </div>

      </div>
    </div>
  );
};
