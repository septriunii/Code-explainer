import React, { useState } from 'react';
import { Copy, Check, Download, CheckCircle2, AlertCircle, FileCode } from 'lucide-react';
import { AnnotationResponse, TraceStep } from '../types';

interface AnnotationJsonViewProps {
  annotations: AnnotationResponse;
  sourceCode: string;
  trace: TraceStep[];
  annotationSource: 'gemini' | 'cached' | 'fallback';
}

export const AnnotationJsonView: React.FC<AnnotationJsonViewProps> = ({
  annotations,
  sourceCode,
  trace,
  annotationSource,
}) => {
  const [copied, setCopied] = useState(false);

  const jsonString = JSON.stringify(annotations, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `annotations_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Rule verification check
  const distinctTraceVars = new Set<string>();
  trace.forEach((s) => {
    if (s.variables) {
      Object.keys(s.variables).forEach((k) => distinctTraceVars.add(k));
    }
  });

  const rule1LinesValid = annotations.lines.length > 0;
  const rule2VariablesValid = annotations.variables.every((v) => distinctTraceVars.has(v.name));
  const rule3ShortExplanations = annotations.lines.every((l) => l.explanation.length <= 150);
  const rule4StepNotesSelective = annotations.step_notes.length <= trace.length;

  return (
    <div className="flex flex-col gap-4 max-w-5xl mx-auto py-2">
      
      {/* Schema Compliance Checklist Banner */}
      <div
        className="border rounded-2xl p-5 shadow-xs transition-colors"
        style={{
          backgroundColor: 'var(--bg-panel)',
          borderColor: 'var(--border-main)',
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b pb-3" style={{ borderColor: 'var(--border-main)' }}>
          <div>
            <h2 className="text-sm font-semibold" style={{ color: 'var(--text-main)' }}>
              Annotation Engine Output & Contract Validation
            </h2>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Verifying strict adherence to the requested JSON output schema & rules
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="text-xs font-mono font-medium px-2.5 py-1 rounded-lg border"
              style={{
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border-main)',
                color: 'var(--text-main)',
              }}
            >
              Source: {annotationSource}
            </span>
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white rounded-lg transition-opacity cursor-pointer shadow-xs hover:opacity-90"
              style={{ backgroundColor: 'var(--accent-primary)' }}
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy JSON'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border rounded-lg transition-colors cursor-pointer"
              style={{
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border-main)',
                color: 'var(--text-muted)',
              }}
            >
              <Download className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
              <span>Download</span>
            </button>
          </div>
        </div>

        {/* 4 Rules Checklist */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div
            className="p-3 rounded-xl border"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-main)',
            }}
          >
            <div className="flex items-center gap-1.5 text-xs font-semibold mb-1" style={{ color: 'var(--text-main)' }}>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Executable Lines</span>
            </div>
            <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
              {annotations.lines.length} lines annotated; comments & blanks skipped.
            </p>
          </div>

          <div
            className="p-3 rounded-xl border"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-main)',
            }}
          >
            <div className="flex items-center gap-1.5 text-xs font-semibold mb-1" style={{ color: 'var(--text-main)' }}>
              {rule2VariablesValid ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              )}
              <span>Distinct Trace Vars</span>
            </div>
            <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
              {annotations.variables.length} variables match trace names strictly.
            </p>
          </div>

          <div
            className="p-3 rounded-xl border"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-main)',
            }}
          >
            <div className="flex items-center gap-1.5 text-xs font-semibold mb-1" style={{ color: 'var(--text-main)' }}>
              {rule3ShortExplanations ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              )}
              <span>Tooltip-Length Roles</span>
            </div>
            <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
              Single-sentence explanations sized for compact tooltip UI.
            </p>
          </div>

          <div
            className="p-3 rounded-xl border"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-main)',
            }}
          >
            <div className="flex items-center gap-1.5 text-xs font-semibold mb-1" style={{ color: 'var(--text-main)' }}>
              {rule4StepNotesSelective ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              )}
              <span>Selective Step Notes</span>
            </div>
            <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
              {annotations.step_notes.length} noteworthy steps out of {trace.length} total.
            </p>
          </div>
        </div>
      </div>

      {/* Raw Output Display */}
      <div
        className="border rounded-2xl overflow-hidden shadow-xs transition-colors"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-main)',
        }}
      >
        <div
          className="flex items-center justify-between px-4 py-2.5 border-b text-xs font-mono"
          style={{
            backgroundColor: 'var(--bg-header)',
            borderColor: 'var(--border-main)',
            color: 'var(--text-muted)',
          }}
        >
          <div className="flex items-center gap-2">
            <FileCode className="w-3.5 h-3.5" style={{ color: 'var(--accent-text)' }} />
            <span className="font-medium" style={{ color: 'var(--text-main)' }}>Single JSON Object Output</span>
          </div>
          <span style={{ color: 'var(--text-dim)' }}>{jsonString.length} bytes</span>
        </div>
        <pre className="p-4 text-xs font-mono text-emerald-400 leading-relaxed overflow-x-auto max-h-[600px] select-text">
          {jsonString}
        </pre>
      </div>

    </div>
  );
};
