import React, { useState } from 'react';
import { Crown, GraduationCap, Glasses, Smile } from 'lucide-react';
import type { Lang, MascotMood, SnakeHat, SnakeTrick } from '../types';
import { Snake3D } from './Snake3D';

interface MascotProps {
  lang?: Lang;
  mood: MascotMood;
  message: string;
  hat?: SnakeHat;
  onChangeHat?: (hat: SnakeHat) => void;
  isTyping?: boolean;
  onBoop?: () => void;
  onPet?: () => void;
  actionButton?: React.ReactNode;
}

export const SnakeLogo: React.FC<{ className?: string }> = ({ className = 'h-10 w-10' }) => (
  <svg viewBox="0 0 80 80" className={className}>
    <path
      d="M58 55 Q69 51 69 41"
      fill="none"
      stroke="#05070c"
      strokeWidth="11"
      strokeLinecap="round"
    />
    <path
      d="M18 57 C18 44, 62 44, 62 57 C62 66, 22 66, 18 57 Z"
      fill="#FFD43B"
      stroke="#05070c"
      strokeWidth="5"
      strokeLinejoin="round"
    />
    <path
      d="M58 55 Q69 51 69 41"
      fill="none"
      stroke="#FFD43B"
      strokeWidth="6"
      strokeLinecap="round"
    />
    <ellipse
      cx="40"
      cy="33"
      rx="20"
      ry="16"
      fill="#3776AB"
      stroke="#05070c"
      strokeWidth="5"
    />
    <ellipse cx="33" cy="23" rx="7" ry="3" fill="#ffffff" opacity="0.28" transform="rotate(-14 33 23)" />
    <circle cx="32" cy="30.5" r="5" fill="#ffffff" stroke="#05070c" strokeWidth="2.5" />
    <circle cx="48" cy="30.5" r="5" fill="#ffffff" stroke="#05070c" strokeWidth="2.5" />
    <circle cx="32.8" cy="30.5" r="2.5" fill="#05070c" />
    <circle cx="48.8" cy="30.5" r="2.5" fill="#05070c" />
    <circle cx="31.5" cy="28.8" r="1.1" fill="#ffffff" />
    <circle cx="47.5" cy="28.8" r="1.1" fill="#ffffff" />
    <path d="M35.5 38.5 Q40 42 44.5 38.5" fill="none" stroke="#05070c" strokeWidth="2.8" strokeLinecap="round" />
  </svg>
);

const TRICKS: SnakeTrick[] = ['backflip', 'spin', 'boop', 'dance'];

export const Mascot: React.FC<MascotProps> = ({
  lang = 'pt',
  mood,
  message,
  hat = 'auto',
  onChangeHat,
  isTyping = false,
  onBoop,
  onPet,
  actionButton,
}) => {
  const [trick, setTrick] = useState<SnakeTrick>('none');
  const [trickIdx, setTrickIdx] = useState(0);
  const [reactionText, setReactionText] = useState<string | null>(null);

  const triggerTrick = () => {
    const nextTrick = TRICKS[trickIdx % TRICKS.length];
    setTrickIdx((i) => i + 1);
    setTrick('none');
    requestAnimationFrame(() => setTrick(nextTrick));
    onBoop?.();

    const reactionsPt: Record<SnakeTrick, string> = {
      none: '',
      backflip: 'Salto mortal 360°!',
      spin: 'Pirueta rápida!',
      boop: 'Boop no nariz!',
      dance: 'Passo de dança!',
    };
    const reactionsEn: Record<SnakeTrick, string> = {
      none: '',
      backflip: '360° Backflip!',
      spin: 'Quick spin!',
      boop: 'Nose boop!',
      dance: 'Dance move!',
    };
    setReactionText(lang === 'pt' ? reactionsPt[nextTrick] : reactionsEn[nextTrick]);
    setTimeout(() => setReactionText(null), 1500);
  };

  const cycleHat = () => {
    if (!onChangeHat) return;
    const order: SnakeHat[] = ['auto', 'crown', 'grad', 'glasses'];
    const next = order[(order.indexOf(hat) + 1) % order.length];
    onChangeHat(next);
  };

  const accentBar =
    mood === 'running'
      ? 'bg-[#3776AB]'
      : mood === 'error'
        ? 'bg-rose-500'
        : mood === 'success'
          ? 'bg-emerald-500'
          : mood === 'warning'
            ? 'bg-[#FFD43B]'
            : 'bg-[#3776AB]';

  return (
    <div className="flex items-stretch gap-3">
      {/* 2D-Outlined Comic Stage for 3D Snake */}
      <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border-2 border-[#05070c] bg-[#162033] shadow-[0_3px_0_#05070c]">
        <Snake3D
          mood={mood}
          hat={hat}
          trick={trick}
          isTyping={isTyping}
          size={80}
          onClick={triggerTrick}
          onPet={onPet}
        />

        {onChangeHat && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              cycleHat();
            }}
            title={lang === 'pt' ? 'Trocar acessório' : 'Switch hat'}
            className="absolute -bottom-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-md border-2 border-[#05070c] bg-[#FFD43B] text-[#05070c] shadow-[0_2px_0_#05070c] transition hover:bg-[#ffe066]"
          >
            {hat === 'crown' ? (
              <Crown className="h-3.5 w-3.5" />
            ) : hat === 'grad' ? (
              <GraduationCap className="h-3.5 w-3.5" />
            ) : hat === 'glasses' ? (
              <Glasses className="h-3.5 w-3.5" />
            ) : (
              <Smile className="h-3.5 w-3.5" />
            )}
          </button>
        )}
      </div>

      {/* Comic / Tactile Speech Box */}
      <div className="relative flex flex-1 overflow-hidden rounded-xl border-2 border-[#05070c] bg-[#111827] shadow-[0_3px_0_#05070c]">
        <div className={`w-1.5 shrink-0 ${accentBar}`} />
        <div className="flex flex-1 flex-wrap items-center justify-between gap-2 px-3.5 py-2.5">
          <p className="text-xs font-semibold leading-relaxed text-slate-100 sm:text-sm">
            {reactionText || message}
          </p>
          {actionButton}
        </div>
      </div>
    </div>
  );
};
