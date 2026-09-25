/**
 * StartScreen.tsx
 * Atmospheric Wild West title screen with tutorial, high scores, and start trigger.
 */

import React from 'react';
import { Play, ArrowLeftRight, ArrowUp, ArrowDown, Megaphone, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { GameStats } from '../types/game';

interface StartScreenProps {
  stats: GameStats;
  isMuted: boolean;
  onToggleMute: () => void;
  onStart: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  stats,
  isMuted,
  onToggleMute,
  onStart,
}) => {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-stone-950/75 backdrop-blur-sm overflow-y-auto select-none">
      <div className="relative w-full max-w-lg rounded-2xl border-2 border-amber-800/60 bg-stone-900/90 p-6 md:p-8 shadow-2xl backdrop-blur-xl text-stone-100 flex flex-col items-center text-center">
        {/* Top Badge */}
        <div className="flex items-center gap-2 text-xs font-saloon text-amber-400 uppercase tracking-widest mb-1">
          <span>★</span>
          <span>Expresso da Fronteira · 1880</span>
          <span>★</span>
        </div>

        {/* Main Title */}
        <h1 className="font-western text-4xl md:text-5xl text-amber-200 tracking-wider font-bold drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
          IRON HORSE RUSH
        </h1>

        <p className="font-saloon text-base md:text-lg text-amber-400/90 mt-1 max-w-sm">
          Pilote a Locomotiva Mágica através de portais interdimensionais por 8 biomas épicos!
        </p>

        {/* High Score Banner */}
        {stats.highScore > 0 && (
          <div className="mt-3 flex items-center gap-2 rounded-lg border border-amber-700/40 bg-amber-950/50 px-4 py-1.5 text-xs text-amber-200 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            <span>Maior Recompensa:</span>
            <span className="font-western text-sm text-yellow-300 font-bold tabular-nums">
              ${stats.highScore.toLocaleString()}
            </span>
          </div>
        )}

        {/* Controls Instructions Card */}
        <div className="w-full my-5 rounded-xl border border-stone-800 bg-stone-950/70 p-4 text-left">
          <span className="font-saloon text-xs uppercase tracking-wider text-amber-400 font-semibold block mb-2.5">
            Como Pilotar a Locomotiva:
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {/* Lane Switching */}
            <div className="flex flex-col gap-1.5 p-2 rounded-lg bg-stone-900/80 border border-stone-800/80">
              <div className="flex items-center gap-1.5">
                <div className="p-1 rounded bg-amber-950/80 text-amber-400 shrink-0">
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                </div>
                <span className="font-bold text-amber-100">Trilhos</span>
              </div>
              <span className="text-[11px] text-stone-400">Setas ← → / A / D ou Swipe lateral</span>
            </div>

            {/* Jump */}
            <div className="flex flex-col gap-1.5 p-2 rounded-lg bg-stone-900/80 border border-stone-800/80">
              <div className="flex items-center gap-1.5">
                <div className="p-1 rounded bg-amber-950/80 text-amber-400 shrink-0">
                  <ArrowUp className="w-3.5 h-3.5" />
                </div>
                <span className="font-bold text-amber-100">Saltar</span>
              </div>
              <span className="text-[11px] text-stone-400">Seta ↑ / W ou Swipe p/ cima</span>
            </div>

            {/* Slide */}
            <div className="flex flex-col gap-1.5 p-2 rounded-lg bg-stone-900/80 border border-stone-800/80">
              <div className="flex items-center gap-1.5">
                <div className="p-1 rounded bg-amber-950/80 text-amber-400 shrink-0">
                  <ArrowDown className="w-3.5 h-3.5" />
                </div>
                <span className="font-bold text-amber-100">Abaixar</span>
              </div>
              <span className="text-[11px] text-stone-400">Seta ↓ / S / Shift ou Swipe baixo</span>
            </div>

            {/* Horn / Buzina */}
            <div className="flex flex-col gap-1.5 p-2 rounded-lg bg-amber-950/40 border border-amber-700/60 shadow-inner">
              <div className="flex items-center gap-1.5">
                <div className="p-1 rounded bg-yellow-500/20 text-yellow-400 shrink-0">
                  <Megaphone className="w-3.5 h-3.5 fill-current -rotate-12" />
                </div>
                <span className="font-bold text-yellow-300">Buzina</span>
              </div>
              <span className="text-[11px] text-amber-200">ESPAÇO / H ou Botão na tela</span>
            </div>
          </div>

          <div className="mt-2.5 flex flex-col gap-1 text-[11px] text-amber-300/80 pt-2 border-t border-stone-800">
            <div className="flex items-center justify-between">
              <span>🌀 Locomotiva Mágica: A cada 500m um portal transporta o trem para o próximo de 8 biomas!</span>
            </div>
            <div className="text-[10px] text-amber-400 font-semibold">
              🚉 Na Estação: 1 BUZINADA cruza o portal para o próximo mapa | 2 BUZINADAS abre o menu e link oficial.
            </div>
          </div>
        </div>

        {/* Start Button & Audio Toggle */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
          <button
            onClick={onStart}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 hover:from-amber-500 hover:to-amber-500 text-stone-950 font-western text-lg py-3.5 px-6 shadow-xl shadow-amber-900/30 transition-all active:scale-[0.98] font-bold tracking-wide"
          >
            <Play className="w-5 h-5 fill-stone-950" />
            <span>Começar Corrida</span>
          </button>

          <button
            onClick={onToggleMute}
            className="flex items-center justify-center gap-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 py-3.5 px-4 text-xs font-semibold transition-colors shrink-0 border border-stone-700 w-full sm:w-auto"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
            <span>{isMuted ? 'Mudo' : 'Som Ligado'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
