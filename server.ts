import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY')
  });
});

const ANNOTATION_SYSTEM_PROMPT = `You are the annotation engine for a code-explainer application. You are given:

1. The original source code and its language.
2. A real execution trace, already produced by actually running the code in a sandbox — this is ground truth. It is a JSON array of steps, each containing: line (the line number that executed), variables (an object of variable name to its value at that moment), and output (anything printed so far).

Your only job is to generate natural-language annotations layered on top of this trace. Never recompute, alter, or contradict any value already present in the trace — treat every value in it as fact, even if it looks surprising.

Respond with a single JSON object and nothing else — no markdown, no code fences, no commentary before or after.

Output schema:
{
  "lines": [
    {
      "line": <line number, matching the source>,
      "explanation": "<one short sentence: what this line does, in plain language>",
      "arguments": [ // include ONLY if this line contains a function call taking 2 or more arguments
        { "name": "<the argument exactly as written>", "meaning": "<what this specific argument represents in this call>" }
      ]
    }
  ],
  "variables": [
    { "name": "<variable name>", "role": "<one short sentence: what this variable represents across the program>" }
  ],
  "step_notes": [
    { "line": <line number>, "note": "<a short remark on what's notable at this specific step, e.g. a value just changed meaningfully. Omit this object entirely for steps with nothing notable>" }
  ]
}

Rules:
- Include one "lines" entry for every line containing executable code. Skip blank lines and lines that are only comments.
- Include one "variables" entry for every distinct variable name that appears anywhere in the trace. Do not invent variables that never appear in the trace.
- Keep every explanation and role short enough to fit a small tooltip — a phrase or one short sentence, never a paragraph.
- "step_notes" is optional per step. Only add an entry where something is genuinely worth pointing out; most steps should be left out of this array entirely.`;

const annotationSchema = {
  type: Type.OBJECT,
  properties: {
    lines: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          line: { type: Type.INTEGER },
          explanation: { type: Type.STRING },
          arguments: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                meaning: { type: Type.STRING }
              },
              required: ['name', 'meaning']
            }
          }
        },
        required: ['line', 'explanation']
      }
    },
    variables: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          role: { type: Type.STRING }
        },
        required: ['name', 'role']
      }
    },
    step_notes: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          line: { type: Type.INTEGER },
          note: { type: Type.STRING }
        },
        required: ['line', 'note']
      }
    }
  },
  required: ['lines', 'variables', 'step_notes']
};

function generateFallbackAnnotations(sourceCode: string, language: string, trace: any[]): any {
  // Collect all distinct variables that actually appear anywhere in the trace
  const varSet = new Set<string>();
  for (const step of trace) {
    if (step.variables && typeof step.variables === 'object') {
      for (const k of Object.keys(step.variables)) {
        varSet.add(k);
      }
    }
  }

  const rawLines = sourceCode.split('\n');
  const lines: any[] = [];

  rawLines.forEach((text, idx) => {
    const lineNum = idx + 1;
    const trimmed = text.trim();
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('//') || trimmed.startsWith('/*')) {
      return;
    }

    let explanation = `Executes statement on line ${lineNum}.`;
    const args: any[] = [];

    // Simple heuristic for explanations and multi-arg detection
    if (trimmed.startsWith('def ') || trimmed.startsWith('function ')) {
      explanation = `Defines function to perform computation.`;
    } else if (trimmed.startsWith('return ')) {
      explanation = `Returns result from the current function scope.`;
    } else if (trimmed.startsWith('for ') || trimmed.startsWith('while ')) {
      explanation = `Iterates over items or conditions.`;
    } else if (trimmed.startsWith('if ') || trimmed.startsWith('elif ') || trimmed.startsWith('else:')) {
      explanation = `Evaluates conditional branch.`;
    } else if (trimmed.includes('print(') || trimmed.includes('console.log(')) {
      explanation = `Outputs formatted result to stdout.`;
    } else if (trimmed.includes('=')) {
      const parts = trimmed.split('=');
      const varName = parts[0].trim();
      explanation = `Assigns evaluated expression to ${varName}.`;
    }

    // Check for function call with 2+ arguments
    const callMatch = trimmed.match(/([a-zA-Z0-9_]+)\(([^()]+)\)/);
    if (callMatch && !trimmed.startsWith('def ') && !trimmed.startsWith('function ')) {
      const argList = callMatch[2].split(',').map(s => s.trim()).filter(Boolean);
      if (argList.length >= 2) {
        argList.forEach(a => {
          args.push({
            name: a,
            meaning: `argument passed to ${callMatch[1]}`
          });
        });
      }
    }

    const item: any = { line: lineNum, explanation };
    if (args.length >= 2) {
      item.arguments = args;
    }
    lines.push(item);
  });

  const variables = Array.from(varSet).map(name => ({
    name,
    role: `Maintains state for "${name}" throughout execution.`
  }));

  // Find steps where variable values change meaningfully
  const step_notes: any[] = [];
  const prevVars: Record<string, any> = {};

  trace.forEach((step, idx) => {
    if (idx === 0) {
      Object.assign(prevVars, step.variables || {});
      return;
    }
    if (step.variables) {
      for (const [k, v] of Object.entries(step.variables)) {
        if (JSON.stringify(v) !== JSON.stringify(prevVars[k])) {
          step_notes.push({
            line: step.line,
            note: `${k} updated to ${typeof v === 'object' ? JSON.stringify(v) : v}.`
          });
          prevVars[k] = v;
          break; // at most one note per notable step
        }
      }
    }
  });

  return {
    lines,
    variables,
    step_notes: step_notes.slice(0, 5)
  };
}

// Annotation API Endpoint
app.post('/api/annotate', async (req, res) => {
  const { sourceCode, language = 'python', trace } = req.body;

  if (!sourceCode || !Array.isArray(trace)) {
    return res.status(400).json({
      error: 'sourceCode (string) and trace (array of steps) are required'
    });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    // Generate high quality fallback structured annotations
    const fallback = generateFallbackAnnotations(sourceCode, language, trace);
    return res.json({
      data: fallback,
      source: 'fallback',
      warning: 'GEMINI_API_KEY not configured in environment; returned heuristic annotations.'
    });
  }

  const candidateModels = ['gemini-3.8-flash', 'gemini-2.5-flash'];
  let lastError: any = null;

  for (const modelName of candidateModels) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const userPrompt = `Language: ${language}

Source Code:
${sourceCode}

Execution Trace:
${JSON.stringify(trace, null, 2)}`;

      const response = await ai.models.generateContent({
        model: modelName,
        contents: userPrompt,
        config: {
          systemInstruction: ANNOTATION_SYSTEM_PROMPT,
          responseMimeType: 'application/json',
          responseSchema: annotationSchema,
          temperature: 0.2
        }
      });

      const responseText = response.text || '{}';
      const parsed = JSON.parse(responseText);

      // Validate parsed output format
      if (!parsed.lines || !parsed.variables || !parsed.step_notes) {
        throw new Error('AI output missing required keys');
      }

      return res.json({
        data: parsed,
        source: 'gemini',
        model: modelName,
        rawText: responseText
      });
    } catch (err: any) {
      console.warn(`Model ${modelName} call failed:`, err?.message || err);
      lastError = err;
      // Continue to next model if available
    }
  }

  // Graceful fallback if all AI models failed or unavailable
  console.error('All Gemini model calls failed, using heuristic engine:', lastError?.message || lastError);
  const fallback = generateFallbackAnnotations(sourceCode, language, trace);
  return res.json({
    data: fallback,
    source: 'fallback',
    error: lastError?.message || 'Gemini API unavailable'
  });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Annotation Engine Server running on http://localhost:${PORT}`);
  });
}

startServer();
