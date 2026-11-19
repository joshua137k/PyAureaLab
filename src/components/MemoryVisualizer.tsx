import React, { useMemo } from 'react';
import {
  RefreshCw,
  CheckCircle2,
  Cpu,
  ArrowRight,
  GitCommit,
  Network,
  History,
} from 'lucide-react';
import type {
  DraftVariable,
  Lang,
  MascotMood,
  ScopeFrame,
  TraceStep,
  VariableEntry,
} from '../types';
import { t } from '../i18n/translations';

interface MemoryVisualizerProps {
  lang: Lang;
  mood: MascotMood;
  currentStep: TraceStep | null;
  allSteps: TraceStep[];
  onSeekStep: (idx: number) => void;
  totalSteps: number;
  draftVars: DraftVariable[];
  hasRun: boolean;
}

const INDEX_POINTER_NAMES = new Set([
  'i',
  'j',
  'k',
  'esq',
  'dir',
  'meio',
  'pos',
  'idx',
  'left',
  'right',
  'mid',
  'low',
  'high',
  'inicio',
  'fim',
]);

const VALUE_ITER_NAMES = new Set([
  'num',
  'n',
  'x',
  'v',
  'val',
  'item',
  'c',
  'p',
  'nota',
  'alvo',
  'falta',
]);

// Map index pointers AND value iterators (e.g. `for num in numeros:`) to list node indices!
function getListNodePointers(
  listVar: VariableEntry,
  scope: ScopeFrame
): Map<number, { label: string; kind: 'index' | 'iter' }[]> {
  const map = new Map<number, { label: string; kind: 'index' | 'iter' }[]>();
  const items = listVar.value.items || [];

  for (const v of scope.variables) {
    if (v.name === listVar.name) continue;
    const lower = v.name.toLowerCase();

    // 1. Direct index pointer (i = 2)
    if (v.value.type === 'int' && INDEX_POINTER_NAMES.has(lower)) {
      const idx = parseInt(v.value.repr, 10);
      if (!Number.isNaN(idx) && idx >= 0 && idx < items.length) {
        const arr = map.get(idx) || [];
        arr.push({ label: `${v.name} (${idx})`, kind: 'index' });
        map.set(idx, arr);
      }
    }
    // 2. Value iterator pointer (e.g., `for num in numeros:` where num == 7)
    else if (VALUE_ITER_NAMES.has(lower) && ['int', 'float', 'str'].includes(v.value.type)) {
      const matchIdx = items.findIndex((it) => it.repr === v.value.repr);
      if (matchIdx !== -1) {
        const arr = map.get(matchIdx) || [];
        arr.push({ label: `${v.name} = ${v.value.repr}`, kind: 'iter' });
        map.set(matchIdx, arr);
      }
    }
  }
  return map;
}

// Build a linked history chain of values for scalar variables across steps up to currentStep
function buildVariableEvolutionChain(
  allSteps: TraceStep[],
  upToStepIndex: number
): Map<string, { val: string; stepIdx: number; line: number }[]> {
  const history = new Map<string, { val: string; stepIdx: number; line: number }[]>();

  for (let s = 0; s < allSteps.length; s++) {
    const st = allSteps[s];
    if (st.stepIndex > upToStepIndex) break;
    const mainScope = st.scopes[st.scopes.length - 1];
    if (!mainScope) continue;

    for (const v of mainScope.variables) {
      if (['int', 'float', 'str', 'bool'].includes(v.value.type)) {
        const chain = history.get(v.name) || [];
        if (chain.length === 0 || chain[chain.length - 1].val !== v.value.repr) {
          chain.push({ val: v.value.repr, stepIdx: s, line: st.line });
          history.set(v.name, chain);
        }
      }
    }
  }
  return history;
}

export const MemoryVisualizer: React.FC<MemoryVisualizerProps> = ({
  lang,
  mood,
  currentStep,
  allSteps,
  onSeekStep,
  totalSteps,
  draftVars,
  hasRun,
}) => {
  const tr = t(lang);

  const evolutionMap = useMemo(() => {
    if (!currentStep) return new Map<string, { val: string; stepIdx: number; line: number }[]>();
    return buildVariableEvolutionChain(allSteps, currentStep.stepIndex);
  }, [allSteps, currentStep]);

  const frameBorder =
    mood === 'error'
      ? 'border-rose-500'
      : mood === 'success'
        ? 'border-emerald-500'
        : mood === 'running'
          ? 'border-[#3776AB]'
          : 'border-[#05070c]';

  return (
    <div
      className={`flex shrink-0 flex-col overflow-hidden rounded-xl border-2 bg-[#111827] shadow-[0_4px_0_#05070c] transition-colors duration-300 ${frameBorder}`}
    >
      {/* ====================================================================
          1. TOP TIMELINE & OPERATION DATA-FLOW GRAPH
         ==================================================================== */}
      {currentStep ? (
        <div className="space-y-3 border-b-2 border-[#05070c] bg-[#162033] px-4 py-3">
          {/* Interactive Step Timeline Bar */}
          {allSteps.length > 1 && (
            <div className="flex items-center gap-2">
              <span className="shrink-0 font-mono text-[10px] font-black uppercase tracking-wider text-[#FFD43B]">
                {lang === 'pt' ? 'Passos' : 'Steps'}
              </span>
              <div className="flex flex-1 items-center gap-1 overflow-x-auto py-1">
                {allSteps.map((st, idx) => {
                  const isActive = st.stepIndex === currentStep.stepIndex;
                  const isPast = st.stepIndex < currentStep.stepIndex;
                  return (
                    <button
                      key={st.stepIndex}
                      onClick={() => onSeekStep(idx)}
                      title={`${tr.lineLabel(st.line)}: ${st.codeLine}`}
                      className={`h-2.5 flex-1 min-w-2.5 max-w-6 rounded-sm border border-[#05070c] transition-all ${
                        isActive
                          ? 'scale-y-125 bg-[#FFD43B]'
                          : isPast
                            ? 'bg-[#3776AB] hover:bg-[#5AA9E6]'
                            : 'bg-[#0b101b] hover:bg-white/20'
                      }`}
                    />
                  );
                })}
              </div>
              <span className="shrink-0 rounded-md border-2 border-[#05070c] bg-[#0b101b] px-2 py-0.5 font-mono text-[10px] font-black text-[#FFD43B]">
                {tr.stepOf(currentStep.stepIndex, totalSteps)}
              </span>
            </div>
          )}

          {/* Code Line + Loop Iteration Pill */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="shrink-0 rounded-md border-2 border-[#05070c] bg-[#FFD43B] px-2 py-0.5 font-mono text-[11px] font-black text-[#05070c]">
                {tr.lineLabel(currentStep.line)}
              </span>
              <code className="truncate rounded-md border border-[#05070c] bg-[#0b101b] px-2.5 py-0.5 font-mono font-bold text-white">
                {currentStep.codeLine}
              </code>
            </div>

            {currentStep.loopBadge && (
              <span className="inline-flex items-center gap-1 rounded-md border-2 border-[#05070c] bg-[#3776AB] px-2.5 py-0.5 font-mono text-[10px] font-black text-white">
                <RefreshCw className="h-3 w-3 text-[#FFD43B]" />
                {currentStep.loopBadge[lang]}
              </span>
            )}
          </div>

          {/* DATA-FLOW OPERATION GRAPH + STEP-BY-STEP OPERATOR PRECEDENCE TREE */}
          {currentStep.breakdown && (
            <div className="space-y-2.5 rounded-xl border-2 border-[#05070c] bg-[#0b101b] p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-[#5AA9E6]">
                  <Network className="h-3.5 w-3.5 text-[#FFD43B]" />
                  {lang === 'pt'
                    ? 'Raio-X & Ordem de Prioridade da Conta'
                    : 'Calculation X-Ray & Operator Precedence'}
                </div>
                {currentStep.breakdown.subSteps && currentStep.breakdown.subSteps.length > 1 && (
                  <span className="rounded border border-[#FFD43B]/40 bg-[#FFD43B]/10 px-2 py-0.5 font-mono text-[10px] font-bold text-[#FFD43B]">
                    {currentStep.breakdown.subSteps.length}{' '}
                    {lang === 'pt' ? 'etapas de prioridade' : 'precedence steps'}
                  </span>
                )}
              </div>

              {/* Top Summary Row: Formula ──► Substituted Values ──► Final Result */}
              <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                <div className="rounded-lg border-2 border-[#05070c] bg-[#162033] px-2.5 py-1 text-slate-300">
                  <span className="mr-1.5 text-[9px] font-bold uppercase text-slate-400">
                    {lang === 'pt' ? 'Código:' : 'Code:'}
                  </span>
                  <span className="font-bold text-white">{currentStep.breakdown.formula}</span>
                </div>

                <span className="font-bold text-[#5AA9E6]">──►</span>

                <div className="rounded-lg border-2 border-[#05070c] bg-[#1c2a44] px-2.5 py-1 text-[#FFD43B]">
                  <span className="mr-1.5 text-[9px] font-bold uppercase text-sky-300">
                    {lang === 'pt' ? 'Substitui:' : 'Substitute:'}
                  </span>
                  <span className="font-bold">{currentStep.breakdown.substituted}</span>
                </div>

                <span className="font-bold text-[#FFD43B]">──►</span>

                <div
                  className={`rounded-lg border-2 border-[#05070c] px-2.5 py-1 font-black ${
                    currentStep.breakdown.result.includes('True')
                      ? 'bg-emerald-400 text-[#05070c]'
                      : currentStep.breakdown.result.includes('False')
                        ? 'bg-rose-500 text-white'
                        : 'bg-[#FFD43B] text-[#05070c]'
                  }`}
                >
                  {currentStep.breakdown.result}
                </div>
              </div>

              {/* Step-by-Step Precedence Reduction Ladder (when expression has operations) */}
              {currentStep.breakdown.subSteps && currentStep.breakdown.subSteps.length > 0 && (
                <div className="space-y-2 border-t-2 border-[#1c283e] pt-3">
                  {/* Python Precedence Hierarchy Cheat-Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#FFD43B]">
                      {lang === 'pt'
                        ? 'Ordem de Prioridade (Passo a Passo):'
                        : 'Operator Precedence (Step by Step):'}
                    </span>
                    <div className="flex flex-wrap items-center gap-1 font-mono text-[10px] text-slate-400">
                      <span className="rounded bg-[#162033] px-1.5 py-0.5 text-white">1º ( )</span>
                      <span>➔</span>
                      <span className="rounded bg-[#162033] px-1.5 py-0.5 text-white">2º **</span>
                      <span>➔</span>
                      <span className="rounded bg-[#162033] px-1.5 py-0.5 text-[#FFD43B]">3º * // %</span>
                      <span>➔</span>
                      <span className="rounded bg-[#162033] px-1.5 py-0.5 text-[#5AA9E6]">4º + -</span>
                      <span>➔</span>
                      <span className="rounded bg-[#162033] px-1.5 py-0.5 text-emerald-300">5º == &lt; &gt;</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {currentStep.breakdown.subSteps.map((sub) => (
                      <div
                        key={sub.order}
                        className="rounded-xl border-2 border-[#05070c] bg-[#111827] p-2.5 shadow-[0_2px_0_#05070c]"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-xs">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-md border border-[#05070c] bg-[#3776AB] px-2 py-0.5 text-[10px] font-black text-white">
                              {sub.order}º • {sub.opLabel[lang]}
                            </span>
                            <span className="rounded-md border border-[#05070c] bg-[#FFD43B] px-2.5 py-0.5 font-black text-[#05070c]">
                              {sub.computation}
                            </span>
                          </div>

                          {sub.afterExpr && (
                            <div className="flex items-center gap-1.5 text-[11px]">
                              <span className="font-sans font-bold text-slate-400">
                                {lang === 'pt' ? 'a conta fica:' : 'equation becomes:'}
                              </span>
                              <span className="rounded-md border border-[#05070c] bg-[#162033] px-2.5 py-0.5 font-bold text-emerald-300">
                                {sub.afterExpr}
                              </span>
                            </div>
                          )}
                        </div>

                        {sub.reason && (
                          <p className="mt-1.5 text-[11px] font-medium text-slate-300">
                            <span className="font-bold text-[#5AA9E6]">
                              {lang === 'pt' ? 'Porquê agora? ' : 'Why now? '}
                            </span>
                            {sub.reason[lang]}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Teacher Explanation Line */}
          <div className="flex items-start gap-2 text-xs font-semibold text-slate-200">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
            <span className="leading-relaxed">{currentStep.explanation[lang]}</span>
          </div>
        </div>
      ) : (
        <div className="border-b-2 border-[#05070c] bg-[#162033] px-4 py-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
            <Cpu className="h-4 w-4 text-[#FFD43B]" />
            <span>{tr.draftTitle}</span>
            <span className="text-slate-500">•</span>
            <span className="font-normal text-slate-400">
              {draftVars.length > 0 ? tr.draftReadyHint : tr.draftEmptyHint}
            </span>
          </div>
        </div>
      )}

      {/* ====================================================================
          2. LINKED NODES & MEMORY GRAPH WORKBENCH
         ==================================================================== */}
      <div className="p-4 space-y-4">
        {currentStep ? (
          <>
            {currentStep.scopes.map((scope, sIdx) => {
              const isFinished =
                hasRun &&
                currentStep.stepIndex === totalSteps &&
                sIdx === currentStep.scopes.length - 1;

              const listVars = scope.variables.filter((v) =>
                ['list', 'tuple', 'dict'].includes(v.value.type)
              );
              const scalarVars = scope.variables.filter(
                (v) => !['list', 'tuple', 'dict'].includes(v.value.type)
              );

              return (
                <div
                  key={sIdx}
                  className="space-y-4 rounded-xl border-2 border-[#05070c] bg-[#0b101b] p-4 shadow-[0_3px_0_#05070c]"
                >
                  {/* Scope Frame Header */}
                  <div className="flex items-center justify-between border-b border-[#1c283e] pb-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="rounded border-2 border-[#05070c] bg-[#3776AB] px-2 py-0.5 font-mono font-black text-white">
                        FRAME: {scope.name}
                      </span>
                      <span className="font-mono text-[11px] font-bold text-slate-400">
                        {isFinished ? tr.finished : tr.executingNow}
                      </span>
                    </div>
                    <span className="font-mono text-[10px] font-bold text-[#5AA9E6]">
                      {lang === 'pt' ? 'Grafo de Nós & Ponteiros' : 'Nodes & Pointers Graph'}
                    </span>
                  </div>

                  {scope.variables.length === 0 && (
                    <p className="text-xs italic text-slate-500">{tr.noVarsYet}</p>
                  )}

                  {/* A) LINKED-LIST / GRAPH VIEW FOR ARRAYS, LISTS & DICTS */}
                  {listVars.map((lv) => {
                    const nodePointers = getListNodePointers(lv, scope);

                    if (lv.value.type === 'dict') {
                      const entries = lv.value.entries || [];
                      return (
                        <div
                          key={lv.name}
                          className="rounded-xl border-2 border-[#05070c] bg-[#111827] p-3.5"
                        >
                          <div className="mb-2.5 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="rounded border border-[#05070c] bg-[#FFD43B] px-2 py-0.5 font-mono text-xs font-black text-[#05070c]">
                                {lv.name}
                              </span>
                              <span className="font-mono text-[11px] font-bold text-slate-400">
                                Hash Map / Dicionário (Chave ──► Valor)
                              </span>
                            </div>
                          </div>

                          {entries.length === 0 ? (
                            <span className="font-mono text-xs text-slate-500">
                              {'{} (vazio / empty)'}
                            </span>
                          ) : (
                            <div className="flex flex-wrap items-center gap-2.5">
                              {entries.map((entry, eIdx) => (
                                <div
                                  key={eIdx}
                                  className="flex items-center rounded-xl border-2 border-[#05070c] bg-[#162033] p-1.5 shadow-[0_3px_0_#05070c]"
                                >
                                  <span className="rounded-lg bg-[#0b101b] px-2.5 py-1 font-mono text-xs font-black text-[#FFD43B]">
                                    {entry.key}
                                  </span>
                                  <span className="px-1.5 font-mono text-xs font-black text-[#5AA9E6]">
                                    ──►
                                  </span>
                                  <span className="rounded-lg border border-[#05070c] bg-[#3776AB] px-2.5 py-1 font-mono text-xs font-black text-white">
                                    {entry.value.repr}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    }

                    // 2D Matrix View
                    if (lv.value.isMatrix && lv.value.items) {
                      return (
                        <div
                          key={lv.name}
                          className="rounded-xl border-2 border-[#05070c] bg-[#111827] p-3.5"
                        >
                          <div className="mb-2 flex items-center gap-2">
                            <span className="rounded border border-[#05070c] bg-[#FFD43B] px-2 py-0.5 font-mono text-xs font-black text-[#05070c]">
                              {lv.name}
                            </span>
                            <span className="font-mono text-[11px] font-bold text-slate-400">
                              Matriz 2D (linha × coluna)
                            </span>
                          </div>
                          <div className="flex flex-col gap-1.5">
                            {lv.value.items.map((row, rIdx) => (
                              <div key={rIdx} className="flex items-center gap-1.5">
                                <span className="w-8 font-mono text-[10px] font-bold text-[#FFD43B]">
                                  L[{rIdx}] ➔
                                </span>
                                {(row.items || []).map((cell, cIdx) => (
                                  <div
                                    key={cIdx}
                                    className="flex h-8 min-w-8 items-center justify-center rounded-lg border-2 border-[#05070c] bg-[#162033] px-2 font-mono text-xs font-black text-white"
                                  >
                                    {cell.repr}
                                  </div>
                                ))}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }

                    // 1D List / Vector rendered as a Linked Node Chain: [head: numeros] ──► [0| 4] ──► [1| 7] ──► ...
                    const items = lv.value.items || [];
                    return (
                      <div
                        key={lv.name}
                        className="rounded-xl border-2 border-[#05070c] bg-[#111827] p-3.5"
                      >
                        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="rounded-md border-2 border-[#05070c] bg-[#3776AB] px-2.5 py-0.5 font-mono text-xs font-black text-white">
                              {lv.name}
                            </span>
                            <span className="font-mono text-xs font-black text-[#FFD43B]">
                              ──►
                            </span>
                            <span className="font-mono text-[11px] font-bold text-slate-400">
                              {lang === 'pt'
                                ? `Cadeia de ${items.length} nós encadeados na memória`
                                : `Chain of ${items.length} linked nodes in memory`}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-start gap-1.5">
                          {items.map((item, idx) => {
                            const pts = nodePointers.get(idx) || [];
                            const isTarget = pts.length > 0;

                            return (
                              <div key={idx} className="flex items-start">
                                <div className="flex flex-col items-center">
                                  {/* Linked List Node Box: Top = address/index, Bottom = value */}
                                  <div
                                    className={`overflow-hidden rounded-xl border-2 border-[#05070c] transition-transform duration-200 ${
                                      isTarget
                                        ? 'scale-105 bg-[#FFD43B] text-[#05070c] shadow-[0_4px_0_#05070c] ring-2 ring-[#FFD43B]'
                                        : 'bg-[#162033] text-white shadow-[0_3px_0_#05070c]'
                                    }`}
                                  >
                                    <div
                                      className={`border-b border-[#05070c] px-2.5 py-0.5 text-center font-mono text-[9px] font-black ${
                                        isTarget
                                          ? 'bg-[#05070c] text-[#FFD43B]'
                                          : 'bg-[#0b101b] text-slate-400'
                                      }`}
                                    >
                                      nó [{idx}]
                                    </div>
                                    <div className="flex h-8 min-w-10 items-center justify-center px-2.5 font-mono text-sm font-black">
                                      {item.repr}
                                    </div>
                                  </div>

                                  {/* Active Pointer Arrow Connected to this Node! */}
                                  {isTarget && (
                                    <div className="mt-1 flex flex-col items-center">
                                      <span className="font-mono text-xs font-black leading-none text-[#FFD43B]">
                                        ▲
                                      </span>
                                      {pts.map((p, pIdx) => (
                                        <span
                                          key={pIdx}
                                          className={`mt-0.5 rounded-md border-2 border-[#05070c] px-1.5 py-0.5 font-mono text-[10px] font-black shadow-[0_2px_0_#05070c] ${
                                            p.kind === 'iter'
                                              ? 'bg-emerald-400 text-[#05070c]'
                                              : 'bg-[#FFD43B] text-[#05070c]'
                                          }`}
                                        >
                                          {p.label}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                {/* Next Node Link Arrow (──►) */}
                                {idx < items.length - 1 && (
                                  <div className="mt-5 flex items-center px-1 font-mono text-xs font-black text-[#5AA9E6]">
                                    ──►
                                  </div>
                                )}
                              </div>
                            );
                          })}

                          {/* Null / End of list terminator */}
                          {items.length > 0 && (
                            <div className="mt-4 flex items-center pl-1">
                              <span className="font-mono text-xs font-black text-slate-600">
                                ──►
                              </span>
                              <span className="ml-1 rounded border border-dashed border-slate-600 px-1.5 py-0.5 font-mono text-[10px] font-bold text-slate-500">
                                FIM
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* B) SCALAR VARIABLES + LINKED EVOLUTION HISTORY CHAIN! */}
                  {scalarVars.length > 0 && (
                    <div className="space-y-2.5">
                      {scalarVars.map((sv) => {
                        const historyChain = evolutionMap.get(sv.name) || [];
                        return (
                          <div
                            key={sv.name}
                            className={`flex flex-col justify-between gap-3 rounded-xl border-2 border-[#05070c] p-3 sm:flex-row sm:items-center ${
                              sv.changed ? 'bg-[#1a2742]' : 'bg-[#111827]'
                            }`}
                          >
                            {/* Left: Variable Name & Current Value Node */}
                            <div className="flex items-center gap-2.5">
                              <div className="flex flex-col">
                                <span className="font-mono text-xs font-black text-white">
                                  {sv.name}
                                </span>
                                <span className="font-mono text-[10px] text-slate-400">
                                  tipo: {sv.value.type}
                                </span>
                              </div>

                              <span className="font-mono text-xs font-black text-[#5AA9E6]">
                                ──►
                              </span>

                              <div
                                className={`flex h-9 min-w-12 items-center justify-center gap-1.5 rounded-xl border-2 border-[#05070c] px-3 font-mono text-sm font-black shadow-[0_3px_0_#05070c] ${
                                  sv.changed
                                    ? 'bg-[#FFD43B] text-[#05070c]'
                                    : 'bg-[#162033] text-white'
                                }`}
                              >
                                {sv.changed && sv.prevRepr && sv.prevRepr !== sv.value.repr && (
                                  <>
                                    <span className="text-xs font-normal line-through opacity-65">
                                      {sv.prevRepr}
                                    </span>
                                    <ArrowRight className="h-3 w-3" />
                                  </>
                                )}
                                <span>{sv.value.repr}</span>
                              </div>
                            </div>

                            {/* Right: Linked Evolution History Chain (Click any past value to time-travel!) */}
                            {historyChain.length > 1 && (
                              <div className="flex flex-wrap items-center gap-1 border-t border-[#1c283e] pt-2 sm:border-t-0 sm:pt-0">
                                <span className="mr-1 flex items-center gap-1 font-mono text-[10px] font-bold text-slate-400">
                                  <History className="h-3 w-3 text-[#FFD43B]" />
                                  {lang === 'pt' ? 'Evolução:' : 'History:'}
                                </span>
                                {historyChain.map((node, hIdx) => {
                                  const isLatest = hIdx === historyChain.length - 1;
                                  return (
                                    <React.Fragment key={`${node.stepIdx}-${hIdx}`}>
                                      <button
                                        onClick={() => onSeekStep(node.stepIdx)}
                                        title={
                                          lang === 'pt'
                                            ? `Ir para o passo ${node.stepIdx + 1} (linha ${node.line})`
                                            : `Jump to step ${node.stepIdx + 1} (line ${node.line})`
                                        }
                                        className={`rounded-md border border-[#05070c] px-2 py-0.5 font-mono text-[11px] font-black transition ${
                                          isLatest
                                            ? 'bg-[#FFD43B] text-[#05070c]'
                                            : 'bg-[#0b101b] text-slate-300 hover:border-[#FFD43B] hover:text-white'
                                        }`}
                                      >
                                        {node.val}
                                      </button>
                                      {hIdx < historyChain.length - 1 && (
                                        <span className="font-mono text-[10px] font-black text-[#5AA9E6]">
                                          ➔
                                        </span>
                                      )}
                                    </React.Fragment>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </>
        ) : (
          /* Draft Static AST Preview */
          <div className="rounded-xl border-2 border-[#05070c] bg-[#0b101b] p-4">
            <div className="mb-3 flex items-center gap-2 text-xs">
              <span className="rounded border-2 border-[#05070c] bg-[#3776AB] px-2 py-0.5 font-mono font-black text-white">
                <GitCommit className="mr-1 inline h-3.5 w-3.5" />
                FRAME: main()
              </span>
              <span className="text-[11px] font-bold text-slate-400">{tr.draftTitle}</span>
            </div>
            {draftVars.length === 0 ? (
              <p className="text-xs italic text-slate-500">{tr.noVarsYet}</p>
            ) : (
              <div className="flex flex-wrap gap-3">
                {draftVars.map((dv, idx) => (
                  <div
                    key={`${dv.scope}-${dv.name}-${idx}`}
                    className="flex items-center gap-2 rounded-xl border-2 border-dashed border-[#3776AB] bg-[#111827] px-3 py-2"
                  >
                    <span className="font-mono text-xs font-black text-white">{dv.name}</span>
                    <span className="font-mono text-xs text-[#FFD43B]">──►</span>
                    <span className="rounded bg-[#0b101b] px-2 py-0.5 font-mono text-xs font-bold text-[#5AA9E6]">
                      {dv.previewValue}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
