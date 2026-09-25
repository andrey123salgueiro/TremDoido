/**
 * PauseModal.tsx
 * Western-styled pause overlay.
 */

import React from 'react';
import { Play, RotateCcw, Home, Volume2, VolumeX, Film } from 'lucide-react';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onHome: () => void;
  isMuted: boolean;
  vintageFilter: boolean;
  onToggleMute: () => void;
  onToggleVintage: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onHome,
  isMuted,
  vintageFilter,
  onToggleMute,
  onToggleVintage,
}) => {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-xl border-2 border-amber-800/70 bg-stone-900/95 p-6 shadow-2xl backdrop-blur-xl text-stone-100 flex flex-col items-center text-center">
        <span className="font-saloon text-sm text-amber-500 uppercase tracking-widest">
          Trem Parado na Estação
        </span>
        <h2 className="font-western text-3xl text-amber-100 tracking-wide font-bold mt-1 mb-5">
          JOGO PAUSADO
        </h2>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5 w-full">
          <button
            onClick={onResume}
            className="flex items-center justify-center gap-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 font-western text-base py-3 px-4 shadow-lg font-bold transition-all active:scale-[0.98]"
          >
            <Play className="w-4 h-4 fill-stone-950" />
            <span>Continuar Viagem</span>
          </button>

          <button
            onClick={onRestart}
            className="flex items-center justify-center gap-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-amber-200 font-western text-sm py-2.5 px-4 transition-colors border border-stone-700"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reiniciar da Partida</span>
          </button>

          <button
            onClick={onHome}
            className="flex items-center justify-center gap-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 font-western text-sm py-2.5 px-4 transition-colors border border-stone-700"
          >
            <Home className="w-4 h-4" />
            <span>Menu Principal</span>
          </button>
        </div>

        {/* Quick Toggles */}
        <div className="mt-5 pt-4 border-t border-stone-800 flex items-center justify-around w-full text-xs text-stone-400">
          <button
            onClick={onToggleMute}
            className="flex items-center gap-1.5 hover:text-amber-300 transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
            <span>{isMuted ? 'Desmutar' : 'Som Ativo'}</span>
          </button>

          <span className="text-stone-700">·</span>

          <button
            onClick={onToggleVintage}
            className="flex items-center gap-1.5 hover:text-amber-300 transition-colors"
          >
            <Film className={`w-4 h-4 ${vintageFilter ? 'text-amber-400' : 'text-stone-500'}`} />
            <span>{vintageFilter ? 'Filme Antigo: Ligado' : 'Filme Antigo: Desligado'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
