export type Lang = 'pt' | 'en';

export type MascotMood = 'idle' | 'running' | 'warning' | 'error' | 'success';

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export interface LocalizedText {
  pt: string;
  en: string;
}

export interface Challenge {
  id: string;
  moduleId: string;
  number: string; // e.g. "1.1", "12.4"
  difficulty: Difficulty;
  title: LocalizedText;
  description: LocalizedText;
  theory: LocalizedText;
  hint: LocalizedText;
  starterCode: string;
  solutionCode: string;
  testInput: string[]; // lines passed to input()
  expectedOutput: string;
}

export interface LearningModule {
  id: string;
  title: LocalizedText;
  difficulty: Difficulty;
  icon: string;
  challenges: Challenge[];
}

export interface FreeProgram {
  id: string;
  name: string;
  code: string;
  testInput: string;
  updatedAt: number;
}

export interface SerializedValue {
  type: 'int' | 'float' | 'str' | 'bool' | 'none' | 'list' | 'tuple' | 'dict' | 'set' | 'other';
  repr: string;
  items?: SerializedValue[];
  entries?: { key: string; value: SerializedValue }[];
  isMatrix?: boolean;
}

export interface VariableEntry {
  name: string;
  value: SerializedValue;
  changed?: boolean;
  prevRepr?: string;
}

export interface ScopeFrame {
  name: string; // e.g., "<module>" or function name
  variables: VariableEntry[];
}

export interface VarDiff {
  name: string;
  oldRepr: string;
  newRepr: string;
}

export interface CalcSubStep {
  order: number;
  opLabel: LocalizedText;
  reason?: LocalizedText;
  beforeExpr?: string;
  highlightPart?: string;
  computation: string;
  afterExpr: string;
}

export interface StepBreakdown {
  formula: string;
  substituted: string;
  result: string;
  kind: 'assign' | 'condition' | 'loop' | 'output' | 'call' | 'control';
  subSteps?: CalcSubStep[];
}

export interface TraceStep {
  stepIndex: number;
  line: number;
  codeLine: string;
  event: 'line' | 'call' | 'return' | 'exception';
  explanation: LocalizedText;
  breakdown?: StepBreakdown;
  loopBadge?: LocalizedText;
  diffs: VarDiff[];
  scopes: ScopeFrame[];
  stdout: string; // cumulative stdout up to this step
  stepOutput?: string; // new output produced in this step
}

export interface TraceError {
  type: string;
  line: number | null;
  rawMessage: string;
  friendlyMessage: LocalizedText;
}

export interface ExecutionResult {
  ok: boolean;
  steps: TraceStep[];
  finalStdout: string;
  error?: TraceError;
  truncated?: boolean;
}

export interface DraftVariable {
  name: string;
  inferredType: string;
  previewValue: string;
  scope: string;
}

export interface StaticAnalysisResult {
  variables: DraftVariable[];
  syntaxError?: TraceError;
}

export type CursorStyle = 'python' | 'wand' | 'pixel' | 'system';

export type SnakeHat = 'auto' | 'crown' | 'grad' | 'glasses';

export type SnakeTrick = 'none' | 'backflip' | 'spin' | 'boop' | 'dance';

export interface AppSettings {
  lang: Lang;
  soundEnabled: boolean;
  speed: 0.5 | 1 | 2 | 4;
  showIntroAnimation: boolean;
  cursorStyle: CursorStyle;
  cursorTrail: boolean;
  snakeHat: SnakeHat;
}
