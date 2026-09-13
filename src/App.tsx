import React, { useState, useEffect, useRef } from 'react';
import { PRESETS } from './presets';
import { PresetExample, AnnotationResponse, TraceStep } from './types';
import { Header } from './components/Header';
import { CodeViewer } from './components/CodeViewer';
import { ExplainPanel } from './components/ExplainPanel';
import { TraceControls } from './components/TraceControls';
import { StepNotesCard } from './components/StepNotesCard';
import { VariableInspector } from './components/VariableInspector';
import { OutputTerminal } from './components/OutputTerminal';
import { AnnotationJsonView } from './components/AnnotationJsonView';
import { CustomTraceModal } from './components/CustomTraceModal';
import { Sparkles, AlertCircle, CheckCircle2, Database, Terminal, Flame } from 'lucide-react';

export default function App() {
  const [activePresetId, setActivePresetId] = useState<string>(PRESETS[0].id);
  const [sourceCode, setSourceCode] = useState<string>(PRESETS[0].sourceCode);
  const [language, setLanguage] = useState<string>(PRESETS[0].language);
  const [trace, setTrace] = useState<TraceStep[]>(PRESETS[0].trace);
  const [annotations, setAnnotations] = useState<AnnotationResponse>(
    PRESETS[0].cachedAnnotations || { lines: [], variables: [], step_notes: [] }
  );

  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'visualizer' | 'json'>('visualizer');
  const [secondaryTab, setSecondaryTab] = useState<'variables' | 'output' | 'milestones'>('variables');
  const [isAnnotating, setIsAnnotating] = useState<boolean>(false);
  const [annotationSource, setAnnotationSource] = useState<'gemini' | 'cached' | 'fallback'>('cached');
  const [isCustomModalOpen, setIsCustomModalOpen] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Playback timer effect
  const playTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isPlaying) {
      const intervalMs = Math.round(1000 / playbackSpeed);
      playTimerRef.current = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev >= trace.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, intervalMs);
    } else {
      if (playTimerRef.current) {
        clearInterval(playTimerRef.current);
      }
    }
    return () => {
      if (playTimerRef.current) {
        clearInterval(playTimerRef.current);
      }
    };
  }, [isPlaying, playbackSpeed, trace.length]);

  // Preset switching
  const handleSelectPreset = (presetId: string) => {
    if (presetId === 'custom') {
      setIsCustomModalOpen(true);
      return;
    }
    const found = PRESETS.find((p) => p.id === presetId);
    if (!found) return;

    setActivePresetId(found.id);
    setSourceCode(found.sourceCode);
    setLanguage(found.language);
    setTrace(found.trace);
    setCurrentStepIndex(0);
    setIsPlaying(false);
    if (found.cachedAnnotations) {
      setAnnotations(found.cachedAnnotations);
      setAnnotationSource('cached');
    } else {
      setAnnotations({ lines: [], variables: [], step_notes: [] });
    }
    showToast(`Loaded "${found.title}" preset.`, 'info');
  };

  // Run AI Annotation Engine via /api/annotate
  const handleAnnotateWithAi = async () => {
    setIsAnnotating(true);
    showToast('Annotation engine analyzing code and trace...', 'info');

    try {
      const res = await fetch('/api/annotate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceCode,
          language,
          trace,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const result = await res.json();
      if (result.data) {
        setAnnotations(result.data);
        setAnnotationSource(result.source || 'gemini');
        showToast(
          result.source === 'gemini'
            ? 'Explanations generated with Gemini API.'
            : 'Explanations generated with heuristic engine.',
          'success'
        );
      }
    } catch (err: any) {
      console.error('Annotation failed:', err);
      showToast('Annotation request failed. Check server logs.', 'error');
    } finally {
      setIsAnnotating(false);
    }
  };

  // Custom code & trace submission
  const handleCustomSubmit = (code: string, lang: string, newTrace: TraceStep[]) => {
    setActivePresetId('custom');
    setSourceCode(code);
    setLanguage(lang);
    setTrace(newTrace);
    setCurrentStepIndex(0);
    setIsPlaying(false);
    showToast('Custom code and trace loaded. Requesting AI annotations...', 'info');

    setIsAnnotating(true);
    fetch('/api/annotate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sourceCode: code,
        language: lang,
        trace: newTrace,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.data) {
          setAnnotations(data.data);
          setAnnotationSource(data.source || 'gemini');
          showToast('Annotations ready for custom trace.', 'success');
        }
      })
      .catch((err) => {
        console.error(err);
        showToast('Annotation request failed.', 'error');
      })
      .finally(() => {
        setIsAnnotating(false);
      });
  };

  const showToast = (message: string, type: 'success' | 'info' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification((curr) => (curr?.message === message ? null : curr));
    }, 4000);
  };

  const currentStep = trace[currentStepIndex] || null;
  const previousStep = currentStepIndex > 0 ? trace[currentStepIndex - 1] : null;

  const lines = sourceCode.split('\n');
  const currentLineText = currentStep && currentStep.line <= lines.length ? lines[currentStep.line - 1] : '';
  const lineAnnotation = currentStep ? (annotations.lines.find((l) => l.line === currentStep.line) || null) : null;
  const stepNote = currentStep ? (annotations.step_notes.find((sn) => sn.line === currentStep.line) || null) : null;

  const inScopeCount = Object.keys(currentStep?.variables || {}).length;

  return (
    <div
      className="h-screen max-h-screen w-full overflow-hidden flex flex-col font-sans transition-colors duration-200"
      style={{
        backgroundColor: 'var(--bg-main)',
        color: 'var(--text-main)',
      }}
    >
      
      {/* 1. App Header */}
      <Header
        presets={PRESETS}
        activePresetId={activePresetId}
        onSelectPreset={handleSelectPreset}
      />

      {/* Notification Toast */}
      {notification && (
        <div className="fixed bottom-4 right-4 z-50 transition-all">
          <div
            className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl shadow-xl border text-xs font-medium ${
              notification.type === 'success'
                ? 'bg-slate-900 text-slate-100 border-slate-700'
                : notification.type === 'error'
                ? 'bg-rose-950 text-rose-200 border-rose-800'
                : 'bg-slate-900 text-slate-100 border-slate-700 shadow-lg'
            }`}
          >
            {notification.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            {notification.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400" />}
            {notification.type === 'info' && <Sparkles className="w-4 h-4 text-indigo-400" />}
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* 2. Main Content Workspace (Strictly 1 Page - no page scroll) */}
      <main className="flex-1 min-h-0 max-w-7xl w-full mx-auto px-3 sm:px-4 py-2.5 flex flex-col gap-2.5 overflow-hidden">
        {activeTab === 'visualizer' ? (
          <>
            {/* Primary Two-Column Workspace */}
            <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3 overflow-hidden">
              
              {/* Left Column (7 cols): IDE Source Code Viewer - Only the code lines scroll when long */}
              <div className="lg:col-span-7 h-full flex flex-col min-h-0 overflow-hidden">
                <CodeViewer
                  sourceCode={sourceCode}
                  language={language}
                  currentStep={currentStep}
                  annotations={annotations.lines}
                  variableRoles={annotations.variables}
                  onSelectLineStep={(stepIdx) => setCurrentStepIndex(stepIdx)}
                  allSteps={trace}
                />
              </div>

              {/* Right Column (5 cols): Explanation & Inspection Panels */}
              <div className="lg:col-span-5 h-full flex flex-col gap-2.5 min-h-0 overflow-hidden">
                
                {/* Prominent Explain Panel */}
                <ExplainPanel
                  currentStep={currentStep}
                  previousStep={previousStep}
                  currentStepIndex={currentStepIndex}
                  totalSteps={trace.length}
                  lineAnnotation={lineAnnotation}
                  stepNote={stepNote}
                  variableRoles={annotations.variables}
                  sourceLineText={currentLineText}
                  onJumpToStep={(stepIdx) => setCurrentStepIndex(stepIdx)}
                  onSelectVariableTab={() => setSecondaryTab('variables')}
                />

                {/* Secondary Panels (Variables / Console Output / Milestones) */}
                <div
                  className="border rounded-2xl p-3 shadow-sm flex flex-col flex-1 min-h-0 overflow-hidden transition-colors duration-200"
                  style={{
                    backgroundColor: 'var(--bg-panel)',
                    borderColor: 'var(--border-main)',
                  }}
                >
                  
                  {/* Secondary Tab Switcher */}
                  <div className="flex items-center justify-between border-b pb-2 mb-2 shrink-0" style={{ borderColor: 'var(--border-main)' }}>
                    <div
                      className="flex items-center gap-1 p-1 rounded-xl border"
                      style={{
                        backgroundColor: 'var(--bg-card)',
                        borderColor: 'var(--border-main)',
                      }}
                    >
                      <button
                        onClick={() => setSecondaryTab('variables')}
                        className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer"
                        style={
                          secondaryTab === 'variables'
                            ? {
                                backgroundColor: 'var(--accent-subtle)',
                                color: 'var(--accent-text)',
                                border: '1px solid var(--accent-border)',
                              }
                            : { color: 'var(--text-muted)' }
                        }
                      >
                        <Database className="w-3.5 h-3.5" style={{ color: 'var(--accent-text)' }} />
                        <span>Variables</span>
                        <span
                          className="text-[10px] font-mono px-1.5 py-0.2 rounded-full ml-0.5"
                          style={{
                            backgroundColor: 'var(--bg-subtle)',
                            color: 'var(--text-muted)',
                          }}
                        >
                          {inScopeCount}
                        </span>
                      </button>

                      <button
                        onClick={() => setSecondaryTab('output')}
                        className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer"
                        style={
                          secondaryTab === 'output'
                            ? {
                                backgroundColor: 'var(--accent-subtle)',
                                color: 'var(--accent-text)',
                                border: '1px solid var(--accent-border)',
                              }
                            : { color: 'var(--text-muted)' }
                        }
                      >
                        <Terminal className="w-3.5 h-3.5" style={{ color: 'var(--accent-text)' }} />
                        <span>Output</span>
                        {currentStep?.output && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        )}
                      </button>

                      <button
                        onClick={() => setSecondaryTab('milestones')}
                        className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer"
                        style={
                          secondaryTab === 'milestones'
                            ? {
                                backgroundColor: 'var(--accent-subtle)',
                                color: 'var(--accent-text)',
                                border: '1px solid var(--accent-border)',
                              }
                            : { color: 'var(--text-muted)' }
                        }
                      >
                        <Flame className="w-3.5 h-3.5 text-amber-400" />
                        <span>Milestones</span>
                        <span
                          className="text-[10px] font-mono px-1.5 py-0.2 rounded-full ml-0.5"
                          style={{
                            backgroundColor: 'var(--bg-subtle)',
                            color: 'var(--text-muted)',
                          }}
                        >
                          {annotations.step_notes.length}
                        </span>
                      </button>
                    </div>

                    <span className="text-[11px] hidden sm:inline" style={{ color: 'var(--text-dim)' }}>
                      Inspect program state
                    </span>
                  </div>

                  {/* Secondary Panel Viewport */}
                  <div className="flex-1 min-h-0 overflow-y-auto pr-1">
                    {secondaryTab === 'variables' && (
                      <VariableInspector
                        currentStep={currentStep}
                        previousStep={previousStep}
                        variableRoles={annotations.variables}
                        allSteps={trace}
                        onSelectStep={(sIdx) => setCurrentStepIndex(sIdx)}
                      />
                    )}

                    {secondaryTab === 'output' && (
                      <OutputTerminal output={currentStep?.output || ''} />
                    )}

                    {secondaryTab === 'milestones' && (
                      <StepNotesCard
                        currentStep={currentStep}
                        currentStepIndex={currentStepIndex}
                        stepNotes={annotations.step_notes}
                        allSteps={trace}
                        onJumpToStep={(stepIdx) => setCurrentStepIndex(stepIdx)}
                      />
                    )}
                  </div>

                </div>

              </div>

            </div>

            {/* 3. Execution Dock / Controls Bar (Docked at bottom) */}
            <TraceControls
              currentStepIndex={currentStepIndex}
              totalSteps={trace.length}
              onStepChange={(idx) => setCurrentStepIndex(idx)}
              isPlaying={isPlaying}
              onTogglePlay={() => setIsPlaying(!isPlaying)}
              playbackSpeed={playbackSpeed}
              onChangeSpeed={setPlaybackSpeed}
              currentStep={currentStep}
            />
          </>
        ) : (
          /* JSON Schema Output Tab */
          <div className="flex-1 min-h-0 overflow-y-auto">
            <AnnotationJsonView
              annotations={annotations}
              sourceCode={sourceCode}
              trace={trace}
              annotationSource={annotationSource}
            />
          </div>
        )}
      </main>

      {/* Slim Status Footer */}
      <footer
        className="h-7 border-t flex items-center px-4 shrink-0 justify-between text-[11px] select-none transition-colors duration-200"
        style={{
          backgroundColor: 'var(--bg-header)',
          borderColor: 'var(--border-main)',
          color: 'var(--text-muted)',
        }}
      >
        <div className="flex items-center space-x-2">
          <span className="font-semibold" style={{ color: 'var(--text-main)' }}>CodeTrace</span>
          <span style={{ color: 'var(--text-dim)' }}>•</span>
          <span className="hidden sm:inline" style={{ color: 'var(--text-muted)' }}>Effortless code comprehension through ground-truth execution traces</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>Ground Truth Verified</span>
        </div>
      </footer>

      {/* Custom Trace Modal */}
      <CustomTraceModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        onSubmit={handleCustomSubmit}
        initialCode={sourceCode}
        initialLanguage={language}
        initialTrace={trace}
      />

    </div>
  );
}
