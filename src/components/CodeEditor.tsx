import React, { useMemo, useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { oneDark } from '@codemirror/theme-one-dark';
import { Decoration, EditorView } from '@codemirror/view';
import { StateEffect, StateField } from '@codemirror/state';
import type { DraftVariable, Lang, MascotMood, TraceStep } from '../types';
import { inspectHoveredToken, type HoverInspection } from '../utils/codeInspector';

interface CodeEditorProps {
  value: string;
  onChange: (val: string) => void;
  activeLine: number | null;
  errorLine: number | null;
  mood: MascotMood;
  lang: Lang;
  currentStep: TraceStep | null;
  allSteps: TraceStep[];
  draftVars: DraftVariable[];
  onHoverInspect?: (info: HoverInspection | null) => void;
}

const setLineHighlight = StateEffect.define<{ line: number | null; kind: 'run' | 'err' | 'ok' }>();

function createHighlightField() {
  return StateField.define({
    create() {
      return Decoration.none;
    },
    update(decorations, tr) {
      for (const eff of tr.effects) {
        if (eff.is(setLineHighlight)) {
          const { line, kind } = eff.value;
          if (!line || line < 1 || line > tr.state.doc.lines) {
            return Decoration.none;
          }
          const lineInfo = tr.state.doc.line(line);
          const cls =
            kind === 'err'
              ? 'cm-pyaurea-err-line'
              : kind === 'ok'
                ? 'cm-pyaurea-ok-line'
                : 'cm-pyaurea-run-line';
          return Decoration.set([Decoration.line({ class: cls }).range(lineInfo.from)]);
        }
      }
      return decorations.map(tr.changes);
    },
    provide: (f) => EditorView.decorations.from(f),
  });
}

// Extract word or operator at column offset inside a code line
function extractTokenAtCol(lineText: string, col: number): string | null {
  if (col < 0 || col > lineText.length) return null;

  // 1. Check multi-char operators around col (`//=`, `//`, `**`, `==`, `!=`, `+=`, `-=`, `*=`, `%`)
  const ops = ['//=', '//', '**', '==', '!=', '+=', '-=', '*=', '%'];
  for (const op of ops) {
    const startMin = Math.max(0, col - op.length);
    const startMax = Math.min(lineText.length - op.length, col);
    for (let s = startMin; s <= startMax; s++) {
      if (lineText.slice(s, s + op.length) === op) {
        return op;
      }
    }
  }

  // 2. Check identifier word `[a-zA-Z_][a-zA-Z0-9_]*`
  const wordRegex = /[a-zA-Z_][a-zA-Z0-9_]*/g;
  let match: RegExpExecArray | null;
  while ((match = wordRegex.exec(lineText)) !== null) {
    const start = match.index;
    const end = start + match[0].length;
    if (col >= start && col <= end) {
      return match[0];
    }
  }

  return null;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  activeLine,
  errorLine,
  mood,
  lang,
  currentStep,
  allSteps,
  draftVars,
  onHoverInspect,
}) => {
  const viewRef = React.useRef<EditorView | null>(null);
  const highlightField = useMemo(() => createHighlightField(), []);
  const [hoverBox, setHoverBox] = useState<{
    info: HoverInspection;
    x: number;
    y: number;
  } | null>(null);

  const extensions = useMemo(
    () => [
      python(),
      highlightField,
      EditorView.theme({
        '&': {
          height: '100%',
          fontSize: '14px',
          backgroundColor: 'transparent',
        },
        '.cm-scroller': {
          fontFamily: "'JetBrains Mono', 'Fira Code', ui-monospace, SFMono-Regular, monospace",
          lineHeight: '1.65',
        },
        '.cm-gutters': {
          backgroundColor: 'transparent',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          color: '#64748b',
        },
        '.cm-pyaurea-run-line': {
          backgroundColor: 'rgba(55, 118, 171, 0.25)',
          borderLeft: '3px solid #FFD43B',
        },
        '.cm-pyaurea-err-line': {
          backgroundColor: 'rgba(244, 63, 94, 0.22)',
          borderLeft: '3px solid #f43f5e',
        },
        '.cm-pyaurea-ok-line': {
          backgroundColor: 'rgba(16, 185, 129, 0.16)',
          borderLeft: '3px solid #10b981',
        },
      }),
    ],
    [highlightField]
  );

  React.useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const targetLine = errorLine ?? activeLine;
    const kind = errorLine ? 'err' : mood === 'success' ? 'ok' : 'run';
    view.dispatch({
      effects: setLineHighlight.of({ line: targetLine, kind }),
    });
  }, [activeLine, errorLine, mood, value]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const view = viewRef.current;
    if (!view) return;
    const pos = view.posAtCoords({ x: e.clientX, y: e.clientY });
    if (pos === null) {
      if (hoverBox) {
        setHoverBox(null);
        onHoverInspect?.(null);
      }
      return;
    }

    const lineObj = view.state.doc.lineAt(pos);
    const col = pos - lineObj.from;
    const token = extractTokenAtCol(lineObj.text, col);
    if (!token) {
      if (hoverBox) {
        setHoverBox(null);
        onHoverInspect?.(null);
      }
      return;
    }

    const info = inspectHoveredToken(
      token,
      lineObj.text,
      lang,
      currentStep,
      allSteps,
      draftVars
    );

    if (!info) {
      if (hoverBox) {
        setHoverBox(null);
        onHoverInspect?.(null);
      }
      return;
    }

    const clampedX = Math.min(window.innerWidth - 330, Math.max(16, e.clientX + 14));
    const clampedY = Math.min(window.innerHeight - 200, Math.max(16, e.clientY + 18));

    setHoverBox({ info, x: clampedX, y: clampedY });
    onHoverInspect?.(info);
  };

  const handleMouseLeave = () => {
    setHoverBox(null);
    onHoverInspect?.(null);
  };

  const bgTint =
    mood === 'error'
      ? 'bg-[#1a0d13]'
      : mood === 'success'
        ? 'bg-[#0b1914]'
        : 'bg-[#0b101b]';

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative h-full w-full overflow-hidden transition-colors duration-300 ${bgTint}`}
    >
      <CodeMirror
        value={value}
        height="100%"
        theme={oneDark}
        extensions={extensions}
        onChange={onChange}
        onCreateEditor={(view) => {
          viewRef.current = view;
        }}
        basicSetup={{
          lineNumbers: true,
          highlightActiveLineGutter: true,
          highlightActiveLine: true,
          foldGutter: false,
          autocompletion: true,
          indentOnInput: true,
          tabSize: 4,
        }}
        className="h-full"
      />

      {/* Floating Tactile Code Hover Inspector Card */}
      {hoverBox && (
        <div
          style={{ left: hoverBox.x, top: hoverBox.y }}
          className="pointer-events-none fixed z-50 w-80 rounded-xl border-2 border-[#05070c] bg-[#162033] p-3 text-left shadow-[0_6px_0_#05070c]"
        >
          <div className="flex items-center justify-between gap-2">
            <span
              className={`rounded border border-[#05070c] px-2 py-0.5 font-mono text-[9px] font-black uppercase ${
                hoverBox.info.category === 'variable'
                  ? 'bg-[#FFD43B] text-[#05070c]'
                  : hoverBox.info.category === 'range'
                    ? 'bg-emerald-400 text-[#05070c]'
                    : 'bg-[#3776AB] text-white'
              }`}
            >
              {hoverBox.info.badge}
            </span>
          </div>

          <div className="mt-1.5 font-mono text-sm font-black text-white">
            {hoverBox.info.title}
          </div>

          {hoverBox.info.historyChain && (
            <div className="mt-1.5 flex flex-wrap items-center gap-1 rounded-lg border border-[#05070c] bg-[#0b101b] px-2 py-1 font-mono text-[10px]">
              <span className="font-bold text-slate-400">
                {lang === 'pt' ? 'Evolução:' : 'History:'}
              </span>
              {hoverBox.info.historyChain.map((val, idx) => (
                <React.Fragment key={idx}>
                  <span
                    className={
                      idx === hoverBox.info.historyChain!.length - 1
                        ? 'font-black text-[#FFD43B]'
                        : 'text-slate-300'
                    }
                  >
                    {val}
                  </span>
                  {idx < hoverBox.info.historyChain!.length - 1 && (
                    <span className="text-[#5AA9E6]">➔</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          )}

          <p className="mt-1.5 text-xs font-medium leading-relaxed text-slate-200">
            {hoverBox.info.explanation}
          </p>

          {hoverBox.info.extraTip && (
            <div className="mt-2 rounded-lg border border-[#05070c] bg-[#0b101b] px-2.5 py-1.5 text-[11px] font-semibold text-[#FFD43B]">
              {hoverBox.info.extraTip}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
