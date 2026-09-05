export interface TraceStep {
  line: number;
  variables: Record<string, any>;
  output: string;
}

export interface LineArgumentAnnotation {
  name: string;
  meaning: string;
}

export interface LineAnnotation {
  line: number;
  explanation: string;
  arguments?: LineArgumentAnnotation[];
}

export interface VariableAnnotation {
  name: string;
  role: string;
}

export interface StepNoteAnnotation {
  line: number;
  note: string;
}

export interface AnnotationResponse {
  lines: LineAnnotation[];
  variables: VariableAnnotation[];
  step_notes: StepNoteAnnotation[];
}

export interface PresetExample {
  id: string;
  title: string;
  language: string;
  description: string;
  sourceCode: string;
  trace: TraceStep[];
  cachedAnnotations?: AnnotationResponse;
}
