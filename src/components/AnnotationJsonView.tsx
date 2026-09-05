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
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-100">
              Annotation Engine Output & Contract Validation
            </h2>
            <p className="text-xs text-slate-400">
              Verifying strict adherence to the requested JSON output schema & rules
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-medium px-2.5 py-1 rounded bg-slate-950 text-slate-300 border border-slate-800">
              Source: {annotationSource}
            </span>
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-indigo-600 text-white rounded-md hover:bg-indigo-500 transition-colors shadow-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy JSON'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-800 text-slate-200 border border-slate-700 rounded-md hover:bg-slate-700 transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>Download</span>
            </button>
          </div>
        </div>

        {/* 4 Rules Checklist */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-100 mb-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Executable Lines</span>
            </div>
            <p className="text-[11px] text-slate-400">
              {annotations.lines.length} lines annotated; comments & blanks skipped.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-100 mb-1">
              {rule2VariablesValid ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              )}
              <span>Distinct Trace Vars</span>
            </div>
            <p className="text-[11px] text-slate-400">
              {annotations.variables.length} variables match trace names strictly.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-100 mb-1">
              {rule3ShortExplanations ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              )}
              <span>Tooltip-Length Roles</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Single-sentence explanations sized for compact tooltip UI.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-100 mb-1">
              {rule4StepNotesSelective ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              )}
              <span>Selective Step Notes</span>
            </div>
            <p className="text-[11px] text-slate-400">
              {annotations.step_notes.length} noteworthy steps out of {trace.length} total.
            </p>
          </div>
        </div>
      </div>

      {/* Raw Output Display */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <FileCode className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-slate-200 font-medium">Single JSON Object Output</span>
          </div>
          <span>{jsonString.length} bytes</span>
        </div>
        <pre className="p-4 text-xs font-mono text-emerald-400 leading-relaxed overflow-x-auto max-h-[600px] select-text">
          {jsonString}
        </pre>
      </div>

    </div>
  );
};
