import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Square,
  StepBack,
  StepForward,
  Volume2,
  VolumeX,
  BookOpen,
  ArrowRight,
  Download,
  Lightbulb,
  RotateCcw,
  Eye,
  Check,
  Loader2,
  FileText,
  MousePointer,
  LayoutGrid,
  Wand2,
  Gamepad2,
  Monitor,
} from 'lucide-react';
import type {
  AppSettings,
  Challenge,
  CursorStyle,
  DraftVariable,
  ExecutionResult,
  FreeProgram,
  MascotMood,
} from './types';
import { EXAMPLE_SYSTEMS, LEARNING_MODULES } from './data/curriculum';
import { t } from './i18n/translations';
import { pyodideClient } from './services/pyodideClient';
import { playBoopSound, playErrorSound, playPetSound, playStepTick, playSuccessSound } from './utils/sound';
import { SplashScreen } from './components/SplashScreen';
import { Dashboard } from './components/Dashboard';
import { CodeEditor } from './components/CodeEditor';
import { Mascot, SnakeLogo } from './components/Mascot';
import { MemoryVisualizer } from './components/MemoryVisualizer';
import { CustomCursor } from './components/CustomCursor';
import type { HoverInspection } from './utils/codeInspector';

const STORAGE_SETTINGS = 'pyaurealab_settings_v1';
const STORAGE_COMPLETED = 'pyaurealab_completed_v1';
const STORAGE_FREE_PROGS = 'pyaurealab_free_progs_v1';
const STORAGE_CODE_PREFIX = 'pyaurealab_code_';

const DEFAULT_SETTINGS: AppSettings = {
  lang: 'pt',
  soundEnabled: true,
  speed: 1,
  showIntroAnimation: true,
  cursorStyle: 'python',
  cursorTrail: true,
  snakeHat: 'auto',
};

const INITIAL_FREE_PROGRAMS: FreeProgram[] = [
  {
    id: 'free-1',
    name: 'Meu programa',
    code: 'vetor = [10, 20, 30, 40, 50]\nsoma = 0\n\nfor x in vetor:\n    soma += x\n\nprint("Soma total:", soma)\n',
    testInput: '',
    updatedAt: Date.now(),
  },
];

export function App() {
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_SETTINGS);
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [completedIds, setCompletedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_COMPLETED);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [freePrograms, setFreePrograms] = useState<FreeProgram[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_FREE_PROGS);
      return saved ? JSON.parse(saved) : INITIAL_FREE_PROGRAMS;
    } catch {
      return INITIAL_FREE_PROGRAMS;
    }
  });

  const [showSplash, setShowSplash] = useState(settings.showIntroAnimation);
  const [screen, setScreen] = useState<'dashboard' | 'ide'>('dashboard');
  const [mode, setMode] = useState<'track' | 'free'>('track');

  const allChallenges = useMemo(() => LEARNING_MODULES.flatMap((m) => m.challenges), []);
  const [currentChallengeId, setCurrentChallengeId] = useState<string>(allChallenges[0].id);
  const [currentFreeId, setCurrentFreeId] = useState<string>(freePrograms[0]?.id || 'free-1');

  const currentChallenge: Challenge = useMemo(
    () => allChallenges.find((c) => c.id === currentChallengeId) || allChallenges[0],
    [allChallenges, currentChallengeId]
  );

  const currentFreeProgram: FreeProgram = useMemo(
    () =>
      freePrograms.find((p) => p.id === currentFreeId) ||
      EXAMPLE_SYSTEMS.find((p) => p.id === currentFreeId) ||
      freePrograms[0] ||
      INITIAL_FREE_PROGRAMS[0],
    [freePrograms, currentFreeId]
  );

  const [code, setCode] = useState<string>(currentChallenge.starterCode);
  const [freeTestInput, setFreeTestInput] = useState<string>('');

  const [pyReady, setPyReady] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);
  const [draftVars, setDraftVars] = useState<DraftVariable[]>([]);

  const [execResult, setExecResult] = useState<ExecutionResult | null>(null);
  const [stepIdx, setStepIdx] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState(false);

  const [challengeTab, setChallengeTab] = useState<'prompt' | 'theory' | 'hint'>('prompt');
  const [isTyping, setIsTyping] = useState(false);
  const [hoveredCodeInfo, setHoveredCodeInfo] = useState<HoverInspection | null>(null);
  const typingTimerRef = useRef<number | null>(null);

  const timerRef = useRef<number | null>(null);
  const lang = settings.lang;
  const tr = t(lang);

  const updateSettings = useCallback((patch: Partial<AppSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      localStorage.setItem(STORAGE_SETTINGS, JSON.stringify(next));
      return next;
    });
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_COMPLETED, JSON.stringify(completedIds));
  }, [completedIds]);

  useEffect(() => {
    localStorage.setItem(STORAGE_FREE_PROGS, JSON.stringify(freePrograms));
  }, [freePrograms]);

  useEffect(() => {
    pyodideClient
      .init()
      .then(() => setPyReady(true))
      .catch(() => {});
  }, []);

  const loadChallenge = useCallback((ch: Challenge) => {
    setMode('track');
    setCurrentChallengeId(ch.id);
    const saved = localStorage.getItem(`${STORAGE_CODE_PREFIX}${ch.id}`);
    setCode(saved !== null ? saved : ch.starterCode);
    setExecResult(null);
    setStepIdx(-1);
    setIsPlaying(false);
    setChallengeTab('prompt');
    setScreen('ide');
  }, []);

  const loadFreeProgram = useCallback((prog: FreeProgram) => {
    setMode('free');
    setCurrentFreeId(prog.id);
    setCode(prog.code);
    setFreeTestInput(prog.testInput);
    setExecResult(null);
    setStepIdx(-1);
    setIsPlaying(false);
    setScreen('ide');
  }, []);

  const handleCodeChange = useCallback(
    (newCode: string) => {
      setCode(newCode);
      setIsPlaying(false);
      setExecResult(null);
      setStepIdx(-1);
      setIsTyping(true);
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      typingTimerRef.current = window.setTimeout(() => setIsTyping(false), 750);

      if (mode === 'track') {
        localStorage.setItem(`${STORAGE_CODE_PREFIX}${currentChallenge.id}`, newCode);
      } else {
        setFreePrograms((prev) =>
          prev.map((p) => (p.id === currentFreeId ? { ...p, code: newCode, updatedAt: Date.now() } : p))
        );
      }
    },
    [mode, currentChallenge.id, currentFreeId]
  );

  useEffect(() => {
    if (!pyReady || screen !== 'ide') return;
    const handle = window.setTimeout(() => {
      pyodideClient
        .analyze(code)
        .then((res) => setDraftVars(res.variables || []))
        .catch(() => {});
    }, 280);
    return () => clearTimeout(handle);
  }, [code, pyReady, screen]);

  const stopExecution = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsPlaying(false);
    setExecResult(null);
    setStepIdx(-1);
  }, []);

  const finalizeOutcome = useCallback(
    (res: ExecutionResult) => {
      if (!res.ok) {
        playErrorSound(settings.soundEnabled);
        return;
      }
      if (mode === 'track') {
        const got = res.finalStdout.trim();
        const exp = currentChallenge.expectedOutput.trim();
        if (got === exp) {
          playSuccessSound(settings.soundEnabled);
          confetti({ particleCount: 70, spread: 65, origin: { y: 0.65 } });
          setCompletedIds((prev) => (prev.includes(currentChallenge.id) ? prev : [...prev, currentChallenge.id]));
        } else {
          playErrorSound(settings.soundEnabled);
        }
      } else {
        playSuccessSound(settings.soundEnabled);
      }
    },
    [mode, currentChallenge, settings.soundEnabled]
  );

  const handleRunOrPause = useCallback(async () => {
    if (isPlaying) {
      setIsPlaying(false);
      return;
    }

    if (execResult && execResult.steps.length > 0 && stepIdx < execResult.steps.length - 1) {
      setIsPlaying(true);
      return;
    }

    setIsCompiling(true);
    setExecResult(null);
    setStepIdx(-1);

    try {
      const stdin =
        mode === 'track'
          ? currentChallenge.testInput
          : freeTestInput.split('\n').filter((l) => l.length > 0);
      const res = await pyodideClient.run(code, stdin, 600);
      setExecResult(res);

      if (res.steps.length > 0) {
        setStepIdx(0);
        setIsPlaying(true);
      } else {
        finalizeOutcome(res);
      }
    } finally {
      setIsCompiling(false);
    }
  }, [isPlaying, execResult, stepIdx, mode, currentChallenge, freeTestInput, code, finalizeOutcome]);

  useEffect(() => {
    if (!isPlaying || !execResult) return;

    if (stepIdx >= execResult.steps.length - 1) {
      setIsPlaying(false);
      finalizeOutcome(execResult);
      return;
    }

    const delayMs =
      settings.speed === 4
        ? 120
        : settings.speed === 2
          ? 280
          : settings.speed === 0.5
            ? 1250
            : 620;
    timerRef.current = window.setTimeout(() => {
      playStepTick(settings.soundEnabled);
      setStepIdx((prev) => prev + 1);
    }, delayMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, stepIdx, execResult, settings.speed, settings.soundEnabled, finalizeOutcome]);

  useEffect(() => {
    if (screen !== 'ide') return;
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleRunOrPause();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [screen, handleRunOrPause]);

  const { mood, mascotMessage, showNextBtn } = useMemo((): {
    mood: MascotMood;
    mascotMessage: string;
    showNextBtn: boolean;
  } => {
    if (isCompiling) {
      return { mood: 'running', mascotMessage: tr.loadingPython, showNextBtn: false };
    }
    if (!execResult) {
      if (challengeTab === 'hint' && mode === 'track') {
        return { mood: 'warning', mascotMessage: currentChallenge.hint[lang], showNextBtn: false };
      }
      return {
        mood: 'idle',
        mascotMessage: mode === 'track' ? tr.mascotWelcome : tr.mascotFreeWelcome,
        showNextBtn: false,
      };
    }

    const atEnd = stepIdx >= execResult.steps.length - 1;
    if (isPlaying || (!atEnd && execResult.steps.length > 0)) {
      const curStep = execResult.steps[stepIdx];
      return {
        mood: 'running',
        mascotMessage: curStep ? curStep.explanation[lang] : tr.mascotWelcome,
        showNextBtn: false,
      };
    }

    if (!execResult.ok && execResult.error) {
      return {
        mood: 'error',
        mascotMessage: execResult.error.friendlyMessage[lang],
        showNextBtn: false,
      };
    }

    if (execResult.truncated) {
      return { mood: 'warning', mascotMessage: tr.mascotTruncated, showNextBtn: false };
    }

    if (mode === 'track') {
      const got = execResult.finalStdout.trim();
      const exp = currentChallenge.expectedOutput.trim();
      if (got === exp) {
        return { mood: 'success', mascotMessage: tr.mascotSuccess, showNextBtn: true };
      }
      return {
        mood: 'error',
        mascotMessage: got.length === 0 ? tr.mascotWrongOutputEmpty(exp) : tr.mascotWrongOutput(got, exp),
        showNextBtn: false,
      };
    }

    return { mood: 'success', mascotMessage: tr.mascotFinishRun, showNextBtn: false };
  }, [isCompiling, execResult, stepIdx, isPlaying, challengeTab, mode, currentChallenge, lang, tr]);

  const currentStep = execResult && stepIdx >= 0 ? execResult.steps[stepIdx] || null : null;
  const activeLine = currentStep ? currentStep.line : null;
  const errorLine =
    execResult && !execResult.ok && execResult.error && stepIdx >= execResult.steps.length - 1
      ? execResult.error.line
      : null;

  const terminalOutput = currentStep ? currentStep.stdout : execResult ? execResult.finalStdout : '';

  const currentChallengeIdx = allChallenges.findIndex((c) => c.id === currentChallenge.id);

  const handlePrevChallenge = () => {
    if (currentChallengeIdx > 0) loadChallenge(allChallenges[currentChallengeIdx - 1]);
  };
  const handleNextChallenge = () => {
    if (currentChallengeIdx < allChallenges.length - 1) loadChallenge(allChallenges[currentChallengeIdx + 1]);
  };

  const fileName =
    mode === 'track'
      ? `${currentChallenge.id.replace(/-/g, '_')}.py`
      : `${currentFreeProgram.name.toLowerCase().replace(/\s+/g, '_')}.py`;

  const handleExportPy = () => {
    const blob = new Blob([code], { type: 'text/x-python' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (showSplash) {
    return (
      <>
        <CustomCursor styleType={settings.cursorStyle} trailEnabled={settings.cursorTrail} />
        <SplashScreen lang={lang} onFinish={() => setShowSplash(false)} />
      </>
    );
  }

  if (screen === 'dashboard') {
    return (
      <>
        <CustomCursor styleType={settings.cursorStyle} trailEnabled={settings.cursorTrail} />
        <Dashboard
          settings={settings}
          onUpdateSettings={updateSettings}
          modules={LEARNING_MODULES}
          completedIds={completedIds}
          freePrograms={freePrograms}
          exampleSystems={EXAMPLE_SYSTEMS}
          onContinue={() => {
            const next = allChallenges.find((c) => !completedIds.includes(c.id)) || allChallenges[0];
            loadChallenge(next);
          }}
          onSelectModule={(modId, chId) => {
            const mod = LEARNING_MODULES.find((m) => m.id === modId);
            const target = chId
              ? mod?.challenges.find((c) => c.id === chId)
              : mod?.challenges[0];
            if (target) loadChallenge(target);
          }}
          onSelectFreeProgram={loadFreeProgram}
          onCreateFreeProgram={() => {
            const name = window.prompt(tr.programNamePrompt, `Programa ${freePrograms.length + 1}`);
            if (!name) return;
            const np: FreeProgram = {
              id: `free-${Date.now()}`,
              name,
              code: '# Novo programa Python\nx = 10\ny = 20\nprint(x + y)\n',
              testInput: '',
              updatedAt: Date.now(),
            };
            setFreePrograms((prev) => [...prev, np]);
            loadFreeProgram(np);
          }}
          onDeleteFreeProgram={(id) => {
            setFreePrograms((prev) => prev.filter((p) => p.id !== id));
          }}
        />
      </>
    );
  }

  const cycleCursorStyle = () => {
    const order: CursorStyle[] = ['python', 'wand', 'pixel', 'system'];
    const next = order[(order.indexOf(settings.cursorStyle) + 1) % order.length];
    updateSettings({ cursorStyle: next });
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#0b101b] text-slate-100">
      <CustomCursor styleType={settings.cursorStyle} trailEnabled={settings.cursorTrail} />

      {/* Tactile Top Bar */}
      <header className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-[#05070c] bg-[#111827] px-3 py-2">
        {/* Left: Back to Menu + Challenge Switcher */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              stopExecution();
              setScreen('dashboard');
            }}
            className="btn-tactile flex items-center gap-2 rounded-lg bg-[#162033] px-2.5 py-1.5 text-xs font-bold text-white hover:bg-[#1e2c46]"
            title={tr.homeShortcut}
          >
            <SnakeLogo className="h-5 w-5" />
            <LayoutGrid className="h-3.5 w-3.5 text-[#FFD43B]" />
            <span className="hidden sm:inline">{lang === 'pt' ? 'Capítulos' : 'Chapters'}</span>
          </button>

          {mode === 'track' ? (
            <div className="flex items-center gap-1 rounded-lg border-2 border-[#05070c] bg-[#0b101b] px-1.5 py-1">
              <button
                onClick={handlePrevChallenge}
                disabled={currentChallengeIdx === 0}
                className="rounded p-1 text-slate-400 hover:bg-white/10 hover:text-white disabled:opacity-25"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="flex items-center gap-1.5 px-2 text-xs font-bold">
                <span className="font-mono text-[#FFD43B]">#{currentChallenge.number}</span>
                <span className="hidden text-white sm:inline">{currentChallenge.title[lang]}</span>
                {completedIds.includes(currentChallenge.id) && (
                  <span className="flex h-4 w-4 items-center justify-center rounded bg-emerald-400 text-[#05070c]">
                    <Check className="h-3 w-3 stroke-[3]" />
                  </span>
                )}
              </div>
              <button
                onClick={handleNextChallenge}
                disabled={currentChallengeIdx >= allChallenges.length - 1}
                className="rounded p-1 text-slate-400 hover:bg-white/10 hover:text-white disabled:opacity-25"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <span className="rounded-lg border-2 border-[#05070c] bg-[#FFD43B] px-2.5 py-1 text-xs font-black text-[#05070c]">
              {currentFreeProgram.name}
            </span>
          )}
        </div>

        {/* Center Tactile Mechanical Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={stopExecution}
            disabled={!execResult}
            className="btn-tactile rounded-lg bg-[#162033] p-1.5 text-slate-300 hover:text-white disabled:opacity-30"
            title={tr.stop}
          >
            <Square className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={() => {
              setIsPlaying(false);
              setStepIdx((p) => Math.max(0, p - 1));
            }}
            disabled={!execResult || stepIdx <= 0}
            className="btn-tactile rounded-lg bg-[#162033] p-1.5 text-slate-300 hover:text-white disabled:opacity-30"
            title={tr.stepPrev}
          >
            <StepBack className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={handleRunOrPause}
            disabled={!pyReady || isCompiling}
            className={`btn-tactile inline-flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-black uppercase tracking-wide ${
              isPlaying ? 'btn-py-gold' : 'btn-py-blue'
            }`}
          >
            {!pyReady || isCompiling ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : isPlaying ? (
              <Pause className="h-3.5 w-3.5 fill-current" />
            ) : (
              <Play className="h-3.5 w-3.5 fill-[#FFD43B] text-[#FFD43B]" />
            )}
            <span>{!pyReady ? 'WASM...' : isPlaying ? tr.pause : tr.run}</span>
          </button>

          <button
            onClick={() => {
              setIsPlaying(false);
              if (execResult && stepIdx < execResult.steps.length - 1) {
                playStepTick(settings.soundEnabled);
                setStepIdx((p) => p + 1);
              }
            }}
            disabled={!execResult || stepIdx >= (execResult?.steps.length ?? 0) - 1}
            className="btn-tactile rounded-lg bg-[#162033] p-1.5 text-slate-300 hover:text-white disabled:opacity-30"
            title={tr.stepNext}
          >
            <StepForward className="h-3.5 w-3.5" />
          </button>

          <div className="hidden items-center rounded-lg border-2 border-[#05070c] bg-[#0b101b] p-0.5 font-mono text-[11px] font-bold sm:flex">
            {([0.5, 1, 2, 4] as const).map((sp) => (
              <button
                key={sp}
                onClick={() => updateSettings({ speed: sp })}
                className={`rounded px-2 py-0.5 transition ${
                  settings.speed === sp
                    ? 'bg-[#FFD43B] text-[#05070c]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {sp}x
              </button>
            ))}
          </div>
        </div>

        {/* Right: Cursor + Sound + Lang */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={cycleCursorStyle}
            className="btn-tactile inline-flex items-center gap-1.5 rounded-lg bg-[#162033] px-2.5 py-1.5 text-[11px] font-bold text-slate-200"
            title={lang === 'pt' ? 'Trocar cursor do rato' : 'Change mouse cursor'}
          >
            {settings.cursorStyle === 'python' ? (
              <MousePointer className="h-3.5 w-3.5 text-[#FFD43B]" />
            ) : settings.cursorStyle === 'wand' ? (
              <Wand2 className="h-3.5 w-3.5 text-[#FFD43B]" />
            ) : settings.cursorStyle === 'pixel' ? (
              <Gamepad2 className="h-3.5 w-3.5 text-[#FFD43B]" />
            ) : (
              <Monitor className="h-3.5 w-3.5 text-[#5AA9E6]" />
            )}
            <span className="hidden md:inline">
              {settings.cursorStyle === 'python'
                ? 'Py'
                : settings.cursorStyle === 'wand'
                  ? 'Laser'
                  : settings.cursorStyle === 'pixel'
                    ? 'Toon'
                    : 'OS'}
            </span>
          </button>

          <button
            onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
            className="btn-tactile rounded-lg bg-[#162033] p-1.5 text-slate-300"
            title={tr.sounds}
          >
            {settings.soundEnabled ? <Volume2 className="h-4 w-4 text-[#FFD43B]" /> : <VolumeX className="h-4 w-4 text-slate-500" />}
          </button>

          <div className="flex rounded-lg border-2 border-[#05070c] bg-[#0b101b] p-0.5 text-[11px] font-bold">
            <button
              onClick={() => updateSettings({ lang: 'pt' })}
              className={`rounded px-2 py-0.5 ${lang === 'pt' ? 'bg-[#3776AB] text-white' : 'text-slate-400'}`}
            >
              PT
            </button>
            <button
              onClick={() => updateSettings({ lang: 'en' })}
              className={`rounded px-2 py-0.5 ${lang === 'en' ? 'bg-[#3776AB] text-white' : 'text-slate-400'}`}
            >
              EN
            </button>
          </div>
        </div>
      </header>

      {/* Main Split Workbench */}
      <main className="grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-y-auto p-3 lg:grid-cols-2 lg:overflow-hidden">
        {/* Left: Code Editor Panel (No fake Mac dots, clean file tab) */}
        <section className="flex min-h-[420px] flex-col overflow-hidden rounded-xl border-2 border-[#05070c] bg-[#111827] shadow-[0_4px_0_#05070c] lg:h-full lg:min-h-0">
          <div className="flex items-center justify-between border-b-2 border-[#05070c] bg-[#162033] px-3.5 py-2">
            <div className="flex items-center gap-2">
              <span className="rounded border-2 border-[#05070c] bg-[#FFD43B] px-2 py-0.5 font-mono text-xs font-black text-[#05070c]">
                PY
              </span>
              <span className="font-mono text-xs font-bold text-white">{fileName}</span>
            </div>

            <div className="flex items-center gap-1.5">
              {mode === 'track' && (
                <button
                  onClick={() => {
                    stopExecution();
                    handleCodeChange(currentChallenge.starterCode);
                  }}
                  className="inline-flex items-center gap-1 rounded-md border border-[#24324d] bg-[#0b101b] px-2 py-1 text-[11px] font-bold text-slate-300 hover:border-[#FFD43B] hover:text-white"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span className="hidden sm:inline">{tr.resetCode}</span>
                </button>
              )}
              <button
                onClick={handleExportPy}
                className="inline-flex items-center gap-1 rounded-md border border-[#24324d] bg-[#0b101b] px-2 py-1 text-[11px] font-bold text-slate-300 hover:border-[#5AA9E6] hover:text-white"
              >
                <Download className="h-3 w-3" />
                <span>.py</span>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            <CodeEditor
              value={code}
              onChange={handleCodeChange}
              activeLine={activeLine}
              errorLine={errorLine}
              mood={mood}
              lang={lang}
              currentStep={currentStep}
              allSteps={execResult?.steps ?? []}
              draftVars={draftVars}
              onHoverInspect={setHoveredCodeInfo}
            />
          </div>

          <div className="flex items-center justify-between border-t-2 border-[#05070c] bg-[#0e1422] px-3.5 py-1.5 text-[11px] font-semibold text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${pyReady ? 'bg-emerald-400' : 'bg-[#FFD43B] animate-pulse'}`} />
              {pyReady ? tr.pythonReady : tr.loadingPython}
            </span>
            <span className="font-mono">Python 3.12</span>
          </div>
        </section>

        {/* Right: Challenge + 3D Snake + Memory Bench + Terminal */}
        <section className="flex flex-col gap-3 pb-4 pr-1 lg:h-full lg:min-h-0 lg:overflow-y-auto">
          {mode === 'track' ? (
            <div className="shrink-0 rounded-xl border-2 border-[#05070c] bg-[#111827] p-3.5 shadow-[0_3px_0_#05070c]">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="rounded border-2 border-[#05070c] bg-[#3776AB] px-2 py-0.5 font-mono text-xs font-black text-white">
                    #{currentChallenge.number}
                  </span>
                  <h2 className="text-sm font-black text-white">{currentChallenge.title[lang]}</h2>
                </div>

                <div className="flex items-center gap-1 rounded-lg border-2 border-[#05070c] bg-[#0b101b] p-0.5 text-[11px] font-bold">
                  <button
                    onClick={() => setChallengeTab('prompt')}
                    className={`inline-flex items-center gap-1 rounded px-2 py-1 ${
                      challengeTab === 'prompt' ? 'bg-[#3776AB] text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <FileText className="h-3 w-3" />
                    {lang === 'pt' ? 'Enunciado' : 'Task'}
                  </button>
                  <button
                    onClick={() => setChallengeTab('theory')}
                    className={`inline-flex items-center gap-1 rounded px-2 py-1 ${
                      challengeTab === 'theory' ? 'bg-[#3776AB] text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <BookOpen className="h-3 w-3" />
                    {tr.theory}
                  </button>
                  <button
                    onClick={() => setChallengeTab('hint')}
                    className={`inline-flex items-center gap-1 rounded px-2 py-1 ${
                      challengeTab === 'hint' ? 'bg-[#FFD43B] text-[#05070c]' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Lightbulb className="h-3 w-3" />
                    {lang === 'pt' ? 'Dica' : 'Hint'}
                  </button>
                  <button
                    onClick={() => {
                      stopExecution();
                      handleCodeChange(currentChallenge.solutionCode);
                    }}
                    className="inline-flex items-center gap-1 rounded px-2 py-1 text-emerald-400 hover:bg-emerald-500/15"
                    title={tr.showSolution}
                  >
                    <Eye className="h-3 w-3" />
                  </button>
                </div>
              </div>

              {challengeTab === 'prompt' && (
                <>
                  <p className="mt-2.5 text-xs font-medium leading-relaxed text-slate-200">
                    {currentChallenge.description[lang]}
                  </p>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {currentChallenge.testInput.length > 0 && (
                      <div className="rounded-lg border-2 border-[#05070c] bg-[#0b101b] px-2.5 py-1.5">
                        <span className="text-[10px] font-bold uppercase text-slate-400">{tr.testInput}: </span>
                        <span className="font-mono text-xs font-bold text-[#FFD43B]">
                          {currentChallenge.testInput.join(', ')}
                        </span>
                      </div>
                    )}
                    <div className="rounded-lg border-2 border-[#05070c] bg-[#0b101b] px-2.5 py-1.5">
                      <span className="text-[10px] font-bold uppercase text-slate-400">{tr.expectedOutput}: </span>
                      <span className="font-mono text-xs font-bold text-emerald-400">
                        {currentChallenge.expectedOutput}
                      </span>
                    </div>
                  </div>
                </>
              )}

              {challengeTab === 'theory' && (
                <div className="mt-2.5 rounded-lg border-2 border-[#05070c] bg-[#162033] p-2.5 text-xs leading-relaxed text-slate-200">
                  {currentChallenge.theory[lang]}
                </div>
              )}

              {challengeTab === 'hint' && (
                <div className="mt-2.5 rounded-lg border-2 border-[#05070c] bg-[#0b101b] p-2.5 font-mono text-xs text-[#FFD43B]">
                  {currentChallenge.hint[lang]}
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-xl border-2 border-[#05070c] bg-[#111827] p-3 shadow-[0_3px_0_#05070c]">
              <label className="block text-[10px] font-bold uppercase text-slate-400">
                {tr.customInputLabel}
              </label>
              <textarea
                rows={2}
                value={freeTestInput}
                onChange={(e) => setFreeTestInput(e.target.value)}
                placeholder={tr.customInputPlaceholder}
                className="mt-1.5 w-full rounded-lg border-2 border-[#05070c] bg-[#0b101b] px-2.5 py-1.5 font-mono text-xs text-slate-200 focus:border-[#FFD43B] focus:outline-none"
              />
            </div>
          )}

          {/* 3D Snake Narrator */}
          <Mascot
            lang={lang}
            mood={mood}
            message={
              !isPlaying && hoveredCodeInfo
                ? `[${hoveredCodeInfo.title}] ${hoveredCodeInfo.explanation}${
                    hoveredCodeInfo.extraTip ? ` ${hoveredCodeInfo.extraTip}` : ''
                  }`
                : mascotMessage
            }
            hat={settings.snakeHat}
            onChangeHat={(h) => updateSettings({ snakeHat: h })}
            isTyping={isTyping}
            onBoop={() => playBoopSound(settings.soundEnabled)}
            onPet={() => playPetSound(settings.soundEnabled)}
            actionButton={
              showNextBtn && currentChallengeIdx < allChallenges.length - 1 ? (
                <button
                  onClick={handleNextChallenge}
                  className="btn-tactile btn-py-gold inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-black"
                >
                  {tr.nextChallenge}
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              ) : undefined
            }
          />

          {/* Memory & Execution Visualizer */}
          <MemoryVisualizer
            lang={lang}
            mood={mood}
            currentStep={currentStep}
            allSteps={execResult?.steps ?? []}
            onSeekStep={(idx) => {
              setIsPlaying(false);
              setStepIdx(idx);
            }}
            totalSteps={execResult?.steps.length ?? 0}
            draftVars={draftVars}
            hasRun={Boolean(execResult)}
          />

          {/* Tactile Terminal */}
          <div className="shrink-0 overflow-hidden rounded-xl border-2 border-[#05070c] bg-[#080c14] shadow-[0_3px_0_#05070c]">
            <div className="flex items-center justify-between border-b-2 border-[#05070c] bg-[#162033] px-3 py-1.5 text-[11px] font-bold text-slate-300">
              <span>&gt;_ {tr.terminal}</span>
              {mode === 'track' && currentChallenge.testInput.length > 0 && (
                <span className="font-mono text-[10px] text-[#FFD43B]">
                  stdin: {currentChallenge.testInput.join(' | ')}
                </span>
              )}
            </div>
            <pre className="min-h-14 max-h-24 overflow-y-auto p-3 font-mono text-xs font-bold text-emerald-400 whitespace-pre-wrap">
              {terminalOutput || <span className="animate-pulse text-[#FFD43B]">▋</span>}
            </pre>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
