/**
 * MobileControlsOverlay.tsx
 * Subtle touch buttons on mobile screens for players who prefer tapping
 * in addition to full swipe gesture support, including dedicated HORN button.
 */

import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Megaphone } from 'lucide-react';
import { GameAction } from '../types/game';

interface MobileControlsOverlayProps {
  onAction: (action: GameAction) => void;
  visible: boolean;
}

export const MobileControlsOverlay: React.FC<MobileControlsOverlayProps> = ({
  onAction,
  visible,
}) => {
  const [hornActive, setHornActive] = useState(false);

  if (!visible) return null;

  const handleHorn = () => {
    setHornActive(true);
    onAction('HORN');
    setTimeout(() => setHornActive(false), 250);
  };

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-4 z-30 flex items-end justify-between px-4 sm:hidden select-none">
      {/* Left/Right Directional Pads */}
      <div className="pointer-events-auto flex items-center gap-2.5">
        <button
          onClick={() => onAction('MOVE_LEFT')}
          className="flex h-13 w-13 items-center justify-center rounded-2xl border border-amber-900/40 bg-stone-950/75 text-amber-200 shadow-xl backdrop-blur-md active:bg-amber-700/60 active:scale-95 transition-all"
          aria-label="Pista Esquerda"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <button
          onClick={() => onAction('MOVE_RIGHT')}
          className="flex h-13 w-13 items-center justify-center rounded-2xl border border-amber-900/40 bg-stone-950/75 text-amber-200 shadow-xl backdrop-blur-md active:bg-amber-700/60 active:scale-95 transition-all"
          aria-label="Pista Direita"
        >
          <ArrowRight className="w-6 h-6" />
        </button>
      </div>

      {/* Center Horn / Whistle Button */}
      <div className="pointer-events-auto flex flex-col items-center pb-1">
        <button
          onClick={handleHorn}
          className={`flex h-15 w-15 flex-col items-center justify-center rounded-full border-2 border-yellow-500/80 bg-gradient-to-tr from-amber-700 via-yellow-500 to-amber-600 text-stone-950 shadow-2xl backdrop-blur-md active:scale-90 transition-all font-western ${
            hornActive ? 'ring-4 ring-yellow-400 scale-105 brightness-125' : ''
          }`}
          aria-label="Buzina / Apito do Trem"
          title="Buzinar Trem"
        >
          <Megaphone className="w-6 h-6 fill-stone-950 -rotate-12" />
          <span className="text-[9px] font-bold uppercase tracking-wider leading-none mt-0.5">
            Buzina
          </span>
        </button>
      </div>

      {/* Jump/Slide Action Pads */}
      <div className="pointer-events-auto flex flex-col gap-2 items-center">
        <button
          onClick={() => onAction('JUMP')}
          className="flex h-13 w-13 items-center justify-center rounded-2xl border border-amber-600/40 bg-amber-900/70 text-amber-100 shadow-xl backdrop-blur-md active:bg-amber-600 active:scale-95 transition-all"
          aria-label="Pular"
        >
          <ArrowUp className="w-6 h-6" />
        </button>

        <button
          onClick={() => onAction('SLIDE')}
          className="flex h-11 w-13 items-center justify-center rounded-2xl border border-amber-900/40 bg-stone-950/75 text-amber-200 shadow-xl backdrop-blur-md active:bg-amber-700/60 active:scale-95 transition-all"
          aria-label="Agachar"
        >
          <ArrowDown className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
