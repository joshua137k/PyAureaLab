import React, { useState } from 'react';
import {
  Play,
  Plus,
  Check,
  Star,
  Trophy,
  Flame,
  Zap,
  Volume2,
  VolumeX,
  FileCode2,
  Map,
  Crown,
  MousePointer,
  Trash2,
  BookOpen,
  Sparkles,
  Lock,
  GraduationCap,
  Glasses,
  Wand2,
  Gamepad2,
  Monitor,
} from 'lucide-react';
import type {
  AppSettings,
  Challenge,
  CursorStyle,
  FreeProgram,
  LearningModule,
  SnakeHat,
  SnakeTrick,
} from '../types';
import { t } from '../i18n/translations';
import { SnakeLogo } from './Mascot';
import { Snake3D } from './Snake3D';
import { playBoopSound, playPetSound } from '../utils/sound';

interface DashboardProps {
  settings: AppSettings;
  onUpdateSettings: (patch: Partial<AppSettings>) => void;
  modules: LearningModule[];
  completedIds: string[];
  freePrograms: FreeProgram[];
  exampleSystems: FreeProgram[];
  onContinue: () => void;
  onSelectModule: (moduleId: string, challengeId?: string) => void;
  onSelectFreeProgram: (prog: FreeProgram) => void;
  onCreateFreeProgram: () => void;
  onDeleteFreeProgram: (id: string) => void;
}

// Horizontal winding offsets (in px from center 260) on the lying terrain board
const PATH_OFFSETS = [0, -85, -110, -25, 85, 110, 30, -75, -105, 0];
const NODE_STEP_Y = 122;
const BOARD_CENTER_X = 260;

const UNIT_THEMES = [
  {
    bg: 'bg-[#3776AB]',
    shadow: 'shadow-[0_6px_0_#1d4261]',
    badge: 'bg-[#234d70] text-[#FFD43B]',
    terrainBg: 'bg-[#10231f]',
    terrainCliff: 'shadow-[0_14px_0_#091412,0_17px_0_#05070c]',
    patchColor: '#16302a',
    biome: 'forest' as const,
  },
  {
    bg: 'bg-[#d99b00]',
    shadow: 'shadow-[0_6px_0_#8a6200]',
    badge: 'bg-[#9c6f00] text-white',
    terrainBg: 'bg-[#131f33]',
    terrainCliff: 'shadow-[0_14px_0_#0a111d,0_17px_0_#05070c]',
    patchColor: '#1b2b45',
    biome: 'river' as const,
  },
  {
    bg: 'bg-[#0d9488]',
    shadow: 'shadow-[0_6px_0_#065f56]',
    badge: 'bg-[#096960] text-[#FFD43B]',
    terrainBg: 'bg-[#122229]',
    terrainCliff: 'shadow-[0_14px_0_#091216,0_17px_0_#05070c]',
    patchColor: '#19303a',
    biome: 'camp' as const,
  },
  {
    bg: 'bg-[#4f46e5]',
    shadow: 'shadow-[0_6px_0_#312e81]',
    badge: 'bg-[#3730a3] text-[#FFD43B]',
    terrainBg: 'bg-[#17182f]',
    terrainCliff: 'shadow-[0_14px_0_#0c0d1a,0_17px_0_#05070c]',
    patchColor: '#222445',
    biome: 'temple' as const,
  },
];

// Build smooth cubic Bezier SVG path string connecting (x, y) points on the ground
function buildGroundRoadPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return '';
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const midY = (p0.y + p1.y) / 2;
    d += ` C ${p0.x} ${midY}, ${p1.x} ${midY}, ${p1.x} ${p1.y}`;
  }
  return d;
}

// Cute 2.5D Isometric Scenery Props planted directly on the terrain board!
const TerrainProp: React.FC<{ kind: string; x: number; y: number }> = ({ kind, x, y }) => {
  return (
    <div
      style={{ left: x, top: y }}
      className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 select-none"
    >
      {kind === 'pine' && (
        <svg width="68" height="76" viewBox="0 0 68 76" className="overflow-visible">
          {/* Ground shadow */}
          <ellipse cx="34" cy="66" rx="22" ry="7" fill="#05070c" opacity="0.45" />
          {/* Trunk */}
          <rect x="28" y="48" width="12" height="18" rx="3" fill="#92400e" stroke="#05070c" strokeWidth="3" />
          {/* 3 Layered Toon Pine Cones */}
          <path d="M10 52 L34 26 L58 52 Z" fill="#059669" stroke="#05070c" strokeWidth="3.2" strokeLinejoin="round" />
          <path d="M14 38 L34 15 L54 38 Z" fill="#10b981" stroke="#05070c" strokeWidth="3.2" strokeLinejoin="round" />
          <path d="M19 25 L34 6 L49 25 Z" fill="#34d399" stroke="#05070c" strokeWidth="3.2" strokeLinejoin="round" />
        </svg>
      )}

      {kind === 'campfire' && (
        <svg width="72" height="72" viewBox="0 0 72 72" className="overflow-visible">
          <ellipse cx="36" cy="58" rx="26" ry="8" fill="#FFD43B" opacity="0.18" />
          <ellipse cx="36" cy="58" rx="20" ry="6" fill="#05070c" opacity="0.5" />
          {/* Crossed wood logs */}
          <rect x="16" y="49" width="40" height="9" rx="4" transform="rotate(14 36 53)" fill="#92400e" stroke="#05070c" strokeWidth="2.8" />
          <rect x="16" y="49" width="40" height="9" rx="4" transform="rotate(-14 36 53)" fill="#b45309" stroke="#05070c" strokeWidth="2.8" />
          {/* Animated Toon Flame */}
          <path
            d="M36 14 C48 26 50 42 36 50 C22 42 24 26 36 14 Z"
            fill="#f97316"
            stroke="#05070c"
            strokeWidth="3"
            className="animate-pulse"
          />
          <path
            d="M36 25 C43 33 44 43 36 49 C28 43 29 33 36 25 Z"
            fill="#FFD43B"
          />
        </svg>
      )}

      {kind === 'coderdesk' && (
        <svg width="82" height="74" viewBox="0 0 82 74" className="overflow-visible">
          <ellipse cx="41" cy="62" rx="32" ry="9" fill="#05070c" opacity="0.45" />
          {/* Stone Table */}
          <rect x="14" y="42" width="54" height="16" rx="4" fill="#334155" stroke="#05070c" strokeWidth="3" />
          <rect x="10" y="36" width="62" height="9" rx="4" fill="#475569" stroke="#05070c" strokeWidth="3" />
          {/* Retro Laptop on table */}
          <rect x="22" y="16" width="26" height="19" rx="3" fill="#1e293b" stroke="#05070c" strokeWidth="2.8" />
          <rect x="25" y="19" width="20" height="13" rx="1.5" fill="#38bdf8" />
          {/* Python Coffee Mug */}
          <rect x="53" y="24" width="11" height="12" rx="2.5" fill="#FFD43B" stroke="#05070c" strokeWidth="2.5" />
          <path d="M56 19 Q58 14 56 10" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" className="animate-bounce" />
        </svg>
      )}

      {kind === 'mushrooms' && (
        <svg width="64" height="60" viewBox="0 0 64 60" className="overflow-visible">
          <ellipse cx="32" cy="50" rx="22" ry="6" fill="#05070c" opacity="0.45" />
          {/* Big Red Toon Mushroom */}
          <rect x="22" y="32" width="10" height="17" rx="4" fill="#fef08a" stroke="#05070c" strokeWidth="2.8" />
          <path d="M11 34 C11 16 43 16 43 34 Z" fill="#f43f5e" stroke="#05070c" strokeWidth="3" />
          <circle cx="21" cy="25" r="3.5" fill="#ffffff" />
          <circle cx="33" cy="27" r="2.8" fill="#ffffff" />
          {/* Small Gold Mushroom */}
          <rect x="43" y="38" width="7" height="11" rx="3" fill="#fef08a" stroke="#05070c" strokeWidth="2.5" />
          <path d="M36 40 C36 28 57 28 57 40 Z" fill="#FFD43B" stroke="#05070c" strokeWidth="2.6" />
        </svg>
      )}

      {kind === 'crystal' && (
        <svg width="64" height="68" viewBox="0 0 64 68" className="overflow-visible">
          <ellipse cx="32" cy="58" rx="20" ry="6" fill="#05070c" opacity="0.45" />
          <polygon points="32,8 48,32 38,54 26,54 16,32" fill="#38bdf8" stroke="#05070c" strokeWidth="3" strokeLinejoin="round" />
          <polygon points="32,8 38,54 26,54" fill="#7dd3fc" opacity="0.5" />
          <polygon points="48,24 58,38 52,54 42,54" fill="#FFD43B" stroke="#05070c" strokeWidth="2.8" strokeLinejoin="round" />
        </svg>
      )}

      {kind === 'signpost' && (
        <svg width="68" height="68" viewBox="0 0 68 68" className="overflow-visible">
          <ellipse cx="34" cy="58" rx="18" ry="5" fill="#05070c" opacity="0.45" />
          <rect x="30" y="20" width="8" height="38" rx="2" fill="#78350f" stroke="#05070c" strokeWidth="2.8" />
          <polygon points="14,22 52,22 58,30 52,38 14,38" fill="#FFD43B" stroke="#05070c" strokeWidth="2.8" strokeLinejoin="round" />
          <line x1="21" y1="30" x2="45" y2="30" stroke="#05070c" strokeWidth="3" strokeLinecap="round" />
        </svg>
      )}
    </div>
  );
};

export const Dashboard: React.FC<DashboardProps> = ({
  settings,
  onUpdateSettings,
  modules,
  completedIds,
  freePrograms,
  exampleSystems,
  onContinue,
  onSelectModule,
  onSelectFreeProgram,
  onCreateFreeProgram,
  onDeleteFreeProgram,
}) => {
  const [activeNav, setActiveNav] = useState<'map' | 'leetcode' | 'sandbox' | 'shop'>('map');
  const [selectedNode, setSelectedNode] = useState<Challenge | null>(null);
  const [heroTrick, setHeroTrick] = useState<SnakeTrick>('none');
  const [heroTrickIdx, setHeroTrickIdx] = useState(0);

  const lang = settings.lang;
  const tr = t(lang);

  const allChallenges = modules.flatMap((m) => m.challenges);
  const totalCount = allChallenges.length;
  const doneCount = allChallenges.filter((c) => completedIds.includes(c.id)).length;
  const totalXP = doneCount * 15;
  const nextChallenge = allChallenges.find((c) => !completedIds.includes(c.id)) ?? allChallenges[0];

  const triggerHeroTrick = () => {
    const order: SnakeTrick[] = ['backflip', 'spin', 'boop', 'dance'];
    const next = order[heroTrickIdx % order.length];
    setHeroTrickIdx((i) => i + 1);
    setHeroTrick('none');
    requestAnimationFrame(() => setHeroTrick(next));
    playBoopSound(settings.soundEnabled);
  };

  const mapModules =
    activeNav === 'leetcode'
      ? modules.filter((m) => m.id === 'leetcode-arena')
      : modules.filter((m) => m.id !== 'leetcode-arena');

  return (
    <div className="flex min-h-screen flex-col bg-[#0b101b] text-slate-100 lg:flex-row">
      {/* ====================================================================
          1. LEFT DUOLINGO-STYLE NAVIGATION BAR
         ==================================================================== */}
      <aside className="sticky top-0 z-30 flex w-full shrink-0 flex-row items-center justify-between border-b-2 border-[#05070c] bg-[#111827] px-4 py-3 lg:h-screen lg:w-64 lg:flex-col lg:items-stretch lg:justify-between lg:border-b-0 lg:border-r-2 lg:p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border-2 border-[#05070c] bg-[#FFD43B] shadow-[0_3px_0_#05070c]">
            <SnakeLogo className="h-8 w-8" />
          </div>
          <div>
            <div className="text-xl font-black tracking-tight">
              <span className="text-[#5AA9E6]">Py</span>
              <span className="text-[#FFD43B]">Aurea</span>
            </div>
            <div className="hidden text-[10px] font-bold uppercase tracking-wider text-slate-400 lg:block">
              Python Quest
            </div>
          </div>
        </div>

        <nav className="flex flex-row gap-2 lg:my-6 lg:flex-1 lg:flex-col lg:gap-2.5">
          <button
            onClick={() => {
              setActiveNav('map');
              setSelectedNode(null);
            }}
            className={`btn-tactile flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-xs font-black uppercase tracking-wider transition lg:px-4 lg:py-3.5 lg:text-sm ${
              activeNav === 'map'
                ? 'bg-[#3776AB] text-white'
                : 'bg-[#162033] text-slate-300 hover:bg-[#1c2942]'
            }`}
          >
            <Map className="h-5 w-5 shrink-0 text-[#FFD43B]" />
            <span className="hidden sm:inline">{lang === 'pt' ? 'Trilha' : 'Learn'}</span>
          </button>

          <button
            onClick={() => {
              setActiveNav('leetcode');
              setSelectedNode(null);
            }}
            className={`btn-tactile flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-xs font-black uppercase tracking-wider transition lg:px-4 lg:py-3.5 lg:text-sm ${
              activeNav === 'leetcode'
                ? 'bg-[#FFD43B] text-[#05070c]'
                : 'bg-[#162033] text-slate-300 hover:bg-[#1c2942]'
            }`}
          >
            <Trophy className={`h-5 w-5 shrink-0 ${activeNav === 'leetcode' ? 'text-[#05070c]' : 'text-[#FFD43B]'}`} />
            <span className="hidden sm:inline">LeetCode</span>
          </button>

          <button
            onClick={() => setActiveNav('sandbox')}
            className={`btn-tactile flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-xs font-black uppercase tracking-wider transition lg:px-4 lg:py-3.5 lg:text-sm ${
              activeNav === 'sandbox'
                ? 'bg-[#3776AB] text-white'
                : 'bg-[#162033] text-slate-300 hover:bg-[#1c2942]'
            }`}
          >
            <FileCode2 className="h-5 w-5 shrink-0 text-emerald-400" />
            <span className="hidden sm:inline">Sandbox</span>
          </button>

          <button
            onClick={() => setActiveNav('shop')}
            className={`btn-tactile flex items-center gap-2.5 whitespace-nowrap rounded-2xl px-3.5 py-2.5 text-xs font-black uppercase tracking-wider transition lg:px-4 lg:py-3.5 ${
              activeNav === 'shop'
                ? 'bg-[#3776AB] text-white'
                : 'bg-[#162033] text-slate-300 hover:bg-[#1c2942]'
            }`}
          >
            <Crown className="h-5 w-5 shrink-0 text-[#FFD43B]" />
            <span className="hidden sm:inline">{lang === 'pt' ? 'Cobrinha & Rato' : 'Snake & Mouse'}</span>
          </button>
        </nav>

        <div className="hidden items-center justify-between gap-2 border-t-2 border-[#1c283e] pt-4 lg:flex">
          <div className="flex rounded-xl border-2 border-[#05070c] bg-[#0b101b] p-0.5 text-xs font-black">
            <button
              onClick={() => onUpdateSettings({ lang: 'pt' })}
              className={`rounded-lg px-2.5 py-1 transition ${
                lang === 'pt' ? 'bg-[#3776AB] text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              PT
            </button>
            <button
              onClick={() => onUpdateSettings({ lang: 'en' })}
              className={`rounded-lg px-2.5 py-1 transition ${
                lang === 'en' ? 'bg-[#3776AB] text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              EN
            </button>
          </div>

          <button
            onClick={() => onUpdateSettings({ soundEnabled: !settings.soundEnabled })}
            className="btn-tactile rounded-xl bg-[#162033] p-2 text-slate-200"
            title={tr.sounds}
          >
            {settings.soundEnabled ? (
              <Volume2 className="h-4 w-4 text-[#FFD43B]" />
            ) : (
              <VolumeX className="h-4 w-4 text-slate-500" />
            )}
          </button>
        </div>
      </aside>

      {/* ====================================================================
          2. CENTER COLUMN — LYING ISOMETRIC TERRAIN BOARDS WITH ROAD & PROPS
         ==================================================================== */}
      <main className="flex-1 overflow-y-auto px-3 py-6 md:px-6 lg:h-screen lg:py-8">
        {(activeNav === 'map' || activeNav === 'leetcode') && (
          <div className="mx-auto max-w-[560px] space-y-12 pb-24">
            {mapModules.map((mod, uIdx) => {
              const theme = UNIT_THEMES[uIdx % UNIT_THEMES.length];
              const modDone = mod.challenges.filter((c) => completedIds.includes(c.id)).length;
              const modTotal = mod.challenges.length;
              const allUnitSolved = modDone === modTotal;

              // Compute exact (x, y) coordinates on the 520px-wide terrain board
              const nodeCoords = mod.challenges.map((ch, nIdx) => {
                const offsetX = PATH_OFFSETS[(uIdx * 3 + nIdx) % PATH_OFFSETS.length];
                return {
                  ch,
                  x: BOARD_CENTER_X + offsetX,
                  y: 72 + nIdx * NODE_STEP_Y,
                  offsetX,
                };
              });

              const trophyCoord = {
                x: BOARD_CENTER_X,
                y: 72 + mod.challenges.length * NODE_STEP_Y,
              };

              const boardHeight = trophyCoord.y + 92;
              const fullRoadPath = buildGroundRoadPath([...nodeCoords, trophyCoord]);

              // Place biome props on the opposite side of the road at each turn!
              const propKinds =
                theme.biome === 'forest'
                  ? ['pine', 'campfire', 'mushrooms', 'pine', 'signpost']
                  : theme.biome === 'river'
                    ? ['pine', 'crystal', 'signpost', 'mushrooms', 'pine']
                    : theme.biome === 'camp'
                      ? ['coderdesk', 'pine', 'campfire', 'mushrooms', 'coderdesk']
                      : ['crystal', 'campfire', 'coderdesk', 'crystal', 'pine'];

              return (
                <section key={mod.id} className="space-y-4">
                  {/* UNIT HEADER BANNER */}
                  <div
                    className={`flex items-center justify-between rounded-3xl border-2 border-[#05070c] ${theme.bg} p-5 ${theme.shadow}`}
                  >
                    <div>
                      <span
                        className={`inline-block rounded-lg px-2.5 py-0.5 font-mono text-xs font-black uppercase tracking-wider ${theme.badge}`}
                      >
                        {activeNav === 'leetcode'
                          ? 'ARENA ESPECIAL'
                          : `${lang === 'pt' ? 'UNIDADE' : 'UNIT'} ${uIdx + 1}`}
                      </span>
                      <h2 className="mt-1.5 text-xl font-black text-white md:text-2xl">
                        {mod.title[lang]}
                      </h2>
                      <p className="mt-0.5 text-xs font-bold text-white/80">
                        {modDone} / {modTotal} {lang === 'pt' ? 'níveis completos' : 'levels completed'}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        const firstUnsolved =
                          mod.challenges.find((c) => !completedIds.includes(c.id)) ||
                          mod.challenges[0];
                        onSelectModule(mod.id, firstUnsolved.id);
                      }}
                      className="btn-tactile flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-xs font-black uppercase text-[#05070c]"
                    >
                      <BookOpen className="h-4 w-4" />
                      <span className="hidden sm:inline">{lang === 'pt' ? 'Praticar' : 'Practice'}</span>
                    </button>
                  </div>

                  {/* ==========================================================
                      THE LYING 3D TERRAIN PLATEAU (ISOMETRIC GAME BOARD)
                     ========================================================== */}
                  <div
                    className={`relative mx-auto w-full overflow-hidden rounded-[38px] border-3 border-[#05070c] ${theme.terrainBg} ${theme.terrainCliff}`}
                  >
                    <div
                      style={{ height: boardHeight }}
                      className="relative mx-auto w-[520px] max-w-full"
                    >
                      {/* 1. GROUND SVG LAYER: Grass patches, River + Wooden Bridge, and Winding Road! */}
                      <svg
                        viewBox={`0 0 520 ${boardHeight}`}
                        className="pointer-events-none absolute inset-0 h-full w-full"
                      >
                        {/* Organic Ground Grass/Stone Patches */}
                        {nodeCoords.map((nc, idx) => (
                          <ellipse
                            key={`patch-${idx}`}
                            cx={nc.offsetX >= 0 ? 110 : 410}
                            cy={nc.y + 10}
                            rx="75"
                            ry="32"
                            fill={theme.patchColor}
                          />
                        ))}

                        {/* Optional River crossing the terrain between Node 1 and Node 2 */}
                        {mod.challenges.length >= 3 && (
                          <g>
                            <path
                              d={`M -20 ${nodeCoords[1].y + 62} Q 260 ${nodeCoords[1].y + 88}, 540 ${nodeCoords[1].y + 52}`}
                              fill="none"
                              stroke="#05070c"
                              strokeWidth="44"
                            />
                            <path
                              d={`M -20 ${nodeCoords[1].y + 62} Q 260 ${nodeCoords[1].y + 88}, 540 ${nodeCoords[1].y + 52}`}
                              fill="none"
                              stroke="#0284c7"
                              strokeWidth="36"
                            />
                            <path
                              d={`M -20 ${nodeCoords[1].y + 62} Q 260 ${nodeCoords[1].y + 88}, 540 ${nodeCoords[1].y + 52}`}
                              fill="none"
                              stroke="#38bdf8"
                              strokeWidth="8"
                              strokeDasharray="18 24"
                            />
                          </g>
                        )}

                        {/* Winding Ground Road: 4-Layer 2D-Outlined Isometric Path */}
                        {/* Road 3D Drop Shadow */}
                        <path
                          d={fullRoadPath}
                          fill="none"
                          stroke="#05070c"
                          strokeWidth="58"
                          strokeLinecap="round"
                          transform="translate(0, 6)"
                          opacity="0.55"
                        />
                        {/* Road Black Ink Border */}
                        <path
                          d={fullRoadPath}
                          fill="none"
                          stroke="#05070c"
                          strokeWidth="52"
                          strokeLinecap="round"
                        />
                        {/* Road Cobblestone / Dirt Surface */}
                        <path
                          d={fullRoadPath}
                          fill="none"
                          stroke="#1e2d45"
                          strokeWidth="42"
                          strokeLinecap="round"
                        />
                        {/* Road Center Dashed Line */}
                        <path
                          d={fullRoadPath}
                          fill="none"
                          stroke={allUnitSolved ? '#FFD43B' : '#3b5275'}
                          strokeWidth="6"
                          strokeLinecap="round"
                          strokeDasharray="12 16"
                        />
                      </svg>

                      {/* 2. SCENERY PROPS PLANTED ON THE TERRAIN (Opposite side of each curve) */}
                      {nodeCoords.map((nc, idx) => {
                        const propX = nc.offsetX > 15 ? 105 : nc.offsetX < -15 ? 415 : idx % 2 === 0 ? 95 : 425;
                        const propKind = propKinds[idx % propKinds.length];
                        return (
                          <TerrainProp
                            key={`prop-${idx}`}
                            kind={propKind}
                            x={propX}
                            y={nc.y - 6}
                          />
                        );
                      })}

                      {/* 3. ISOMETRIC GROUND-PAD LEVEL NODES */}
                      {nodeCoords.map(({ ch, x, y }) => {
                        const solved = completedIds.includes(ch.id);
                        const isCurrent = nextChallenge && nextChallenge.id === ch.id;
                        const isSelected = selectedNode?.id === ch.id;

                        // Tactile Isometric Ground Pad (Elliptical Cylinder lying on the ground!)
                        const padColors = solved
                          ? 'bg-[#FFD43B] text-[#05070c] shadow-[0_8px_0_#9e7b00,0_11px_0_#05070c]'
                          : isCurrent
                            ? 'bg-[#3776AB] text-white shadow-[0_8px_0_#1b3d5c,0_11px_0_#05070c] ring-4 ring-[#FFD43B]'
                            : 'bg-[#1e2c45] text-slate-200 shadow-[0_8px_0_#0f1726,0_11px_0_#05070c] hover:bg-[#283a59]';

                        return (
                          <div
                            key={ch.id}
                            style={{ left: x, top: y }}
                            className={` absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center ${
                              isSelected ? 'z-30' : 'z-10'
                            }`}
                          >
                            {/* Floating "START!" Sign above Current Pad */}
                            {isCurrent && !isSelected && (
                              <div className="mb-1.5 animate-bounce whitespace-nowrap rounded-xl border-2 border-[#05070c] bg-[#FFD43B] px-3 py-0.5 text-[11px] font-black uppercase tracking-wide text-[#05070c] shadow-[0_3px_0_#05070c]">
                                {lang === 'pt' ? 'COMEÇAR!' : 'START!'}
                              </div>
                            )}

                            <div className="relative flex items-center">
                              {/* Lying Elliptical 3D Ground Button */}
                              <button
                                onClick={() => {
                                  playBoopSound(settings.soundEnabled);
                                  if (isSelected) {
                                    onSelectModule(mod.id, ch.id);
                                  } else {
                                    setSelectedNode(ch);
                                  }
                                }}
                                className={`group relative flex h-15 w-22 items-center justify-center rounded-[50%] border-3 border-[#05070c] transition-transform active:translate-y-1.5 ${padColors}`}
                              >
                                {/* Inner perspective ring on top of pad */}
                                <span className="pointer-events-none absolute inset-1.5 rounded-[50%] border-2 border-white/25" />

                                {solved ? (
                                  <Check className="h-7 w-7 stroke-[3.5]" />
                                ) : isCurrent ? (
                                  <Star className="h-7 w-7 fill-[#FFD43B] text-[#FFD43B]" />
                                ) : (
                                  <span className="font-mono text-sm font-black">#{ch.number}</span>
                                )}
                              </button>

                              {/* Snake Guardian standing on the ground right next to Current Level! */}
                              {isCurrent && (
                                <div
                                  onClick={() => onSelectModule(mod.id, ch.id)}
                                  className="ml-3 flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-2xl border-2 border-[#05070c] bg-[#162033] px-2.5 py-1.5 shadow-[0_4px_0_#05070c] transition hover:scale-105"
                                >
                                  <SnakeLogo className="h-7 w-7 shrink-0" />
                                  <div className="pr-1">
                                    <div className="text-[10px] font-black uppercase text-[#FFD43B]">
                                      #{ch.number}
                                    </div>
                                    <div className="max-w-[105px] truncate text-xs font-bold text-white">
                                      {ch.title[lang]}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Opaque Title Plaque on the ground below pad */}
                            {!isCurrent && (
                              <span className="mt-3 max-w-[150px] truncate whitespace-nowrap rounded-lg border-2 border-[#05070c] bg-[#0b101b] px-2.5 py-0.5 text-center text-[11px] font-bold text-slate-200 shadow-[0_2px_0_#05070c]">
                                {ch.title[lang]}
                              </span>
                            )}

                            {/* DUOLINGO POPOVER CARD WHEN PAD IS CLICKED */}
                            {isSelected && (
                              <div className="z-40 mt-3 w-72 rounded-2xl border-2 border-[#05070c] bg-[#162033] p-4 text-left shadow-[0_6px_0_#05070c]">
                                <div className="flex items-center justify-between">
                                  <span className="rounded-md border border-[#05070c] bg-[#FFD43B] px-2 py-0.5 font-mono text-[11px] font-black text-[#05070c]">
                                    {lang === 'pt' ? 'NÍVEL' : 'LEVEL'} {ch.number}
                                  </span>
                                  <span className="font-mono text-xs font-bold text-emerald-400">
                                    +15 XP
                                  </span>
                                </div>
                                <h3 className="mt-2 text-base font-black text-white">
                                  {ch.title[lang]}
                                </h3>
                                <p className="mt-1 line-clamp-2 text-xs text-slate-300">
                                  {ch.description[lang]}
                                </p>
                                <button
                                  onClick={() => onSelectModule(mod.id, ch.id)}
                                  className="btn-tactile btn-py-gold mt-3.5 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-black uppercase tracking-wider"
                                >
                                  <Play className="h-3.5 w-3.5 fill-current" />
                                  {solved
                                    ? lang === 'pt'
                                      ? 'PRATICAR NOVAMENTE'
                                      : 'PRACTICE AGAIN'
                                    : lang === 'pt'
                                      ? 'COMEÇAR NÍVEL'
                                      : 'START LEVEL'}
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {/* 4. UNIT TROPHY ALTAR AT THE END OF THE GROUND ROAD */}
                      <div
                        style={{ left: trophyCoord.x, top: trophyCoord.y }}
                        className="absolute -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center"
                      >
                        <div
                          className={`flex h-16 w-22 items-center justify-center rounded-[50%] border-3 border-[#05070c] ${
                            allUnitSolved
                              ? 'bg-[#FFD43B] text-[#05070c] shadow-[0_8px_0_#9e7b00,0_11px_0_#05070c]'
                              : 'bg-[#111827] text-slate-500 shadow-[0_8px_0_#080c14,0_11px_0_#05070c]'
                          }`}
                        >
                          {allUnitSolved ? <Trophy className="h-7 w-7" /> : <Lock className="h-6 w-6" />}
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              );
            })}
          </div>
        )}

        {/* SANDBOX & EXAMPLES VIEW */}
        {activeNav === 'sandbox' && (
          <div className="mx-auto max-w-2xl space-y-6">
            <div className="flex items-center justify-between rounded-3xl border-2 border-[#05070c] bg-[#3776AB] p-5 shadow-[0_6px_0_#1d4261]">
              <div>
                <h1 className="text-xl font-black text-white">{tr.myPrograms}</h1>
                <p className="text-xs font-bold text-white/80">
                  {lang === 'pt'
                    ? 'Crie programas livres em Python e veja a memória passo a passo.'
                    : 'Create free Python scripts and inspect memory step by step.'}
                </p>
              </div>
              <button
                onClick={onCreateFreeProgram}
                className="btn-tactile btn-py-gold inline-flex items-center gap-1.5 rounded-2xl px-4 py-2.5 text-xs font-black uppercase"
              >
                <Plus className="h-4 w-4" />
                {lang === 'pt' ? 'Novo .py' : 'New .py'}
              </button>
            </div>

            <div className="space-y-3">
              {freePrograms.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-2xl border-2 border-[#05070c] bg-[#111827] px-4 py-3.5 shadow-[0_4px_0_#05070c]"
                >
                  <button
                    onClick={() => onSelectFreeProgram(p)}
                    className="flex flex-1 items-center gap-3 text-left"
                  >
                    <span className="rounded-lg border-2 border-[#05070c] bg-[#FFD43B] px-2.5 py-1 font-mono text-xs font-black text-[#05070c]">
                      .PY
                    </span>
                    <span className="text-sm font-black text-white">{p.name}</span>
                  </button>
                  <div className="flex items-center gap-2">
                    {freePrograms.length > 1 && (
                      <button
                        onClick={() => onDeleteFreeProgram(p.id)}
                        className="rounded-lg p-2 text-slate-400 hover:text-rose-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => onSelectFreeProgram(p)}
                      className="btn-tactile btn-py-blue rounded-xl px-3.5 py-1.5 text-xs font-black uppercase"
                    >
                      {tr.run} →
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <h2 className="pt-4 text-base font-black uppercase tracking-wider text-[#FFD43B]">
              {tr.exampleSystems}
            </h2>
            <div className="space-y-3">
              {exampleSystems.map((ex) => (
                <button
                  key={ex.id}
                  onClick={() => onSelectFreeProgram(ex)}
                  className="flex w-full items-center justify-between rounded-2xl border-2 border-[#05070c] bg-[#111827] px-4 py-3.5 text-left shadow-[0_4px_0_#05070c] transition hover:bg-[#162033]"
                >
                  <div>
                    <div className="text-sm font-black text-white">{ex.name}</div>
                    <div className="mt-0.5 font-mono text-xs text-slate-400">
                      {ex.code.split('\n')[0]}
                    </div>
                  </div>
                  <span className="btn-tactile btn-py-gold rounded-xl px-3.5 py-1.5 text-xs font-black uppercase">
                    {tr.run} →
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* SNAKE & MOUSE CUSTOMIZATION SHOP */}
        {activeNav === 'shop' && (
          <div className="mx-auto max-w-2xl space-y-6">
            <div className="rounded-3xl border-2 border-[#05070c] bg-[#d99b00] p-5 shadow-[0_6px_0_#8a6200]">
              <h1 className="text-xl font-black text-[#05070c]">
                {lang === 'pt' ? 'Personalizar Cobrinha 3D & Rato' : 'Customize 3D Snake & Mouse'}
              </h1>
              <p className="text-xs font-bold text-[#05070c]/80">
                {lang === 'pt'
                  ? 'Escolha o chapéu 3D da sua professora Python e o estilo do ponteiro do rato!'
                  : 'Choose your Python teacher 3D hat and mouse cursor style!'}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="rounded-2xl border-2 border-[#05070c] bg-[#111827] p-5 shadow-[0_4px_0_#05070c] space-y-4">
                <div className="flex items-center gap-2 text-sm font-black uppercase text-[#FFD43B]">
                  <Crown className="h-4 w-4" />
                  {lang === 'pt' ? 'Chapéu 3D da Cobrinha' : '3D Snake Hat'}
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  {(
                    [
                      { id: 'auto', label: 'Óculos Auto', icon: <Sparkles className="h-4 w-4" /> },
                      { id: 'crown', label: 'Coroa Real', icon: <Crown className="h-4 w-4" /> },
                      { id: 'grad', label: 'Chapéu Prof', icon: <GraduationCap className="h-4 w-4" /> },
                      { id: 'glasses', label: 'Óculos Geek', icon: <Glasses className="h-4 w-4" /> },
                    ] as { id: SnakeHat; label: string; icon: React.ReactNode }[]
                  ).map((h) => (
                    <button
                      key={h.id}
                      onClick={() => onUpdateSettings({ snakeHat: h.id })}
                      className={`btn-tactile flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-xs font-black ${
                        settings.snakeHat === h.id
                          ? 'bg-[#FFD43B] text-[#05070c]'
                          : 'bg-[#162033] text-slate-300'
                      }`}
                    >
                      {h.icon}
                      <span>{h.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border-2 border-[#05070c] bg-[#111827] p-5 shadow-[0_4px_0_#05070c] space-y-4">
                <div className="flex items-center gap-2 text-sm font-black uppercase text-[#5AA9E6]">
                  <MousePointer className="h-4 w-4" />
                  {lang === 'pt' ? 'Cursor do Rato' : 'Mouse Cursor'}
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  {(
                    [
                      { id: 'python', label: 'Python Toon', icon: <MousePointer className="h-4 w-4" /> },
                      { id: 'wand', label: 'Varinha Laser', icon: <Wand2 className="h-4 w-4" /> },
                      { id: 'pixel', label: 'Arcade Gold', icon: <Gamepad2 className="h-4 w-4" /> },
                      { id: 'system', label: 'Padrão OS', icon: <Monitor className="h-4 w-4" /> },
                    ] as { id: CursorStyle; label: string; icon: React.ReactNode }[]
                  ).map((c) => (
                    <button
                      key={c.id}
                      onClick={() => onUpdateSettings({ cursorStyle: c.id })}
                      className={`btn-tactile flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-xs font-black ${
                        settings.cursorStyle === c.id
                          ? 'bg-[#3776AB] text-white'
                          : 'bg-[#162033] text-slate-300'
                      }`}
                    >
                      {c.icon}
                      <span>{c.label}</span>
                    </button>
                  ))}
                </div>

                <label className="flex cursor-pointer items-center justify-between border-t border-[#1c283e] pt-3 text-xs font-bold">
                  <span>{lang === 'pt' ? 'Rastro de partículas no rato' : 'Mouse particle trail'}</span>
                  <input
                    type="checkbox"
                    checked={settings.cursorTrail}
                    onChange={(e) => onUpdateSettings({ cursorTrail: e.target.checked })}
                    className="h-4 w-4 accent-[#FFD43B]"
                  />
                </label>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ====================================================================
          3. RIGHT DUOLINGO-STYLE STATS & 3D SNAKE PET SIDEBAR
         ==================================================================== */}
      <aside className="w-full shrink-0 space-y-5 border-t-2 border-[#05070c] bg-[#111827] p-5 lg:w-[340px] lg:border-l-2 lg:border-t-0">
        <div className="grid grid-cols-3 gap-2">
          <div className="flex items-center justify-center gap-1.5 whitespace-nowrap rounded-2xl border-2 border-[#05070c] bg-[#162033] px-2 py-2.5 shadow-[0_3px_0_#05070c]">
            <Flame className="h-4 w-4 shrink-0 fill-orange-500 text-orange-500" />
            <span className="font-mono text-xs font-black text-orange-400">
              {doneCount > 0 ? 1 : 0}
            </span>
          </div>
          <div className="flex items-center justify-center gap-1.5 whitespace-nowrap rounded-2xl border-2 border-[#05070c] bg-[#162033] px-2 py-2.5 shadow-[0_3px_0_#05070c]">
            <Zap className="h-4 w-4 shrink-0 fill-[#FFD43B] text-[#FFD43B]" />
            <span className="font-mono text-xs font-black text-[#FFD43B]">{totalXP} XP</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 whitespace-nowrap rounded-2xl border-2 border-[#05070c] bg-[#162033] px-2 py-2.5 shadow-[0_3px_0_#05070c]">
            <Crown className="h-4 w-4 shrink-0 fill-emerald-400 text-emerald-400" />
            <span className="font-mono text-xs font-black text-emerald-400">
              {doneCount}/{totalCount}
            </span>
          </div>
        </div>

        <div className="rounded-3xl border-2 border-[#05070c] bg-[#162033] p-4 text-center shadow-[0_5px_0_#05070c]">
          <div className="mx-auto flex h-34 w-34 items-center justify-center rounded-2xl border-2 border-[#05070c] bg-[#0b101b]">
            <Snake3D
              mood="idle"
              hat={settings.snakeHat}
              trick={heroTrick}
              size={130}
              onClick={triggerHeroTrick}
              onPet={() => playPetSound(settings.soundEnabled)}
            />
          </div>

          <div className="mt-3 text-sm font-black text-white">
            {lang === 'pt' ? 'Professora PyAurea 3D' : 'Professor PyAurea 3D'}
          </div>
          <p className="mt-0.5 text-[11px] font-medium text-slate-400">
            {lang === 'pt'
              ? 'Passe o rato para fazer carinho ou clique nela para ver truques 3D!'
              : 'Pet her with your mouse or click her for 3D tricks!'}
          </p>

          <div className="mt-3 grid grid-cols-4 gap-1 rounded-xl border-2 border-[#05070c] bg-[#0b101b] p-1 text-[10px] font-black">
            {(
              [
                { id: 'auto', icon: <Sparkles className="h-3.5 w-3.5" />, title: 'Auto' },
                { id: 'crown', icon: <Crown className="h-3.5 w-3.5" />, title: 'Crown' },
                { id: 'grad', icon: <GraduationCap className="h-3.5 w-3.5" />, title: 'Prof' },
                { id: 'glasses', icon: <Glasses className="h-3.5 w-3.5" />, title: 'Glasses' },
              ] as { id: SnakeHat; icon: React.ReactNode; title: string }[]
            ).map((h) => (
              <button
                key={h.id}
                onClick={() => onUpdateSettings({ snakeHat: h.id })}
                title={h.title}
                className={`flex items-center justify-center rounded-lg py-1.5 transition ${
                  settings.snakeHat === h.id
                    ? 'bg-[#FFD43B] text-[#05070c]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {h.icon}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border-2 border-[#05070c] bg-[#162033] p-4 shadow-[0_5px_0_#05070c] space-y-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#FFD43B]">
              <Sparkles className="h-4 w-4" />
              {lang === 'pt' ? 'Próxima Missão' : 'Next Quest'}
            </span>
            <span className="font-mono text-xs font-bold text-slate-400">
              #{nextChallenge?.number}
            </span>
          </div>

          {nextChallenge && (
            <div className="rounded-xl border-2 border-[#05070c] bg-[#0b101b] p-3">
              <div className="text-sm font-black text-white">{nextChallenge.title[lang]}</div>
              <p className="mt-1 line-clamp-2 text-xs text-slate-400">
                {nextChallenge.description[lang]}
              </p>
            </div>
          )}

          <button
            onClick={onContinue}
            className="btn-tactile btn-py-gold flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-xs font-black uppercase tracking-wider"
          >
            <Play className="h-4 w-4 fill-current" />
            {tr.continueWhereLeft}
          </button>
        </div>
      </aside>
    </div>
  );
};
