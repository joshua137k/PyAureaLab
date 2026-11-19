import React, { useEffect } from 'react';
import { SkipForward } from 'lucide-react';
import type { Lang } from '../types';
import { t } from '../i18n/translations';
import { Snake3D } from './Snake3D';

interface SplashScreenProps {
  lang: Lang;
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ lang, onFinish }) => {
  const tr = t(lang);

  useEffect(() => {
    const timer = setTimeout(onFinish, 1800);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-[#090d16] via-[#0d1526] to-[#090d16] text-white">
      <div className="relative flex h-32 w-32 items-center justify-center rounded-3xl border border-[#3776AB]/40 bg-[#111827]/90 shadow-[0_0_70px_rgba(55,118,171,0.35)]">
        <Snake3D mood="success" size={120} />
      </div>

      <h1 className="mt-6 text-4xl font-extrabold tracking-tight">
        <span className="text-[#4B8BBE]">Py</span>
        <span className="text-[#FFD43B]">Aurea</span>
        <span className="text-white">Lab</span>
      </h1>
      <p className="mt-2 text-sm text-slate-400">{tr.appTagline}</p>

      <button
        onClick={onFinish}
        className="fixed bottom-6 right-6 inline-flex items-center gap-1.5 rounded-xl border border-[#3776AB]/30 bg-[#111827] px-3.5 py-2 text-xs font-medium text-slate-300 transition hover:border-[#FFD43B]/50 hover:text-white"
      >
        <SkipForward className="h-3.5 w-3.5 text-[#FFD43B]" />
        {tr.skip}
      </button>
    </div>
  );
};
