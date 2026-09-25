/**
 * WantedPosterGameOver.tsx
 * Authentic 1880s Wild West "WANTED - DEAD OR ALIVE" poster for Game Over.
 * Displays bounty reward (score), crime/accident description, coins looted,
 * distance reached, high score comparison, and instant restart action.
 */

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { RotateCcw, Home, Award, Coins, MapPin } from 'lucide-react';
import { GameStats } from '../types/game';

interface WantedPosterGameOverProps {
  stats: GameStats;
  onRestart: () => void;
  onHome: () => void;
}

export const WantedPosterGameOver: React.FC<WantedPosterGameOverProps> = ({
  stats,
  onRestart,
  onHome,
}) => {
  const isNewRecord = stats.score >= stats.highScore && stats.score > 0;

  useEffect(() => {
    if (isNewRecord) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#d97706', '#b45309', '#fef3c7'],
      });
    }
  }, [isNewRecord]);

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-300">
      {/* Outer Wanted Poster Board */}
      <div
        className="relative w-full max-w-md rounded-xl p-6 md:p-8 shadow-2xl text-stone-900 border-4 border-amber-950/80 overflow-hidden"
        style={{
          backgroundImage: `url('/src/assets/images/parchment_wanted_texture_1790334032609.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), inset 0 0 40px rgba(78, 42, 14, 0.6)',
        }}
      >
        {/* Burned / Weathered inner border */}
        <div className="border-2 border-stone-800/80 p-4 rounded flex flex-col items-center text-center">
          {/* Header Typography */}
          <span className="font-saloon tracking-widest text-base md:text-lg text-amber-950 uppercase font-semibold">
            TERRITÓRIO DO FAROESTE
          </span>

          <h1 className="font-western text-4xl md:text-5xl tracking-wider text-stone-950 font-bold my-1 drop-shadow-sm">
            WANTED
          </h1>

          <div className="w-full flex items-center justify-center gap-2 text-xs md:text-sm font-western tracking-widest text-stone-900 uppercase border-y border-stone-800/60 py-1 my-1">
            <span>★</span>
            <span>DEAD OR ALIVE</span>
            <span>★</span>
          </div>

          {/* Wanted Character / Locomotive Vignette Frame */}
          <div className="relative my-3 w-48 h-32 rounded border-2 border-stone-800 overflow-hidden bg-stone-900/10 shadow-inner flex items-center justify-center">
            <img
              src="/src/assets/images/wild_west_railway_thumb_1790334042252.jpg"
              alt="Locomotiva Descarrilada"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover sepia contrast-125 filter"
            />
            <div className="absolute inset-0 bg-amber-900/20 mix-blend-color" />
            <div className="absolute bottom-1 px-2 py-0.5 bg-stone-900/80 text-[10px] text-amber-200 font-western uppercase tracking-wider rounded">
              O Cavalo de Ferro
            </div>
          </div>

          {/* Reward Bounty */}
          <div className="my-2">
            <span className="font-saloon text-sm md:text-base text-stone-800 uppercase tracking-widest">
              RECOMPENSA ACUMULADA
            </span>
            <div className="font-western text-3xl md:text-4xl text-amber-900 font-black tracking-wide drop-shadow-sm">
              ${stats.score.toLocaleString()}
            </div>
            {isNewRecord && (
              <span className="inline-block mt-1 text-xs font-bold uppercase tracking-wider bg-amber-800 text-amber-100 px-3 py-0.5 rounded-full shadow animate-bounce">
                ★ NOVO RECORDE DO VELHO OESTE! ★
              </span>
            )}
          </div>

          {/* Accident / Death Cause Description */}
          <div className="my-2 px-3 py-1.5 bg-amber-950/10 rounded border border-amber-950/20 w-full text-xs text-stone-800 font-medium italic">
            "{stats.deathReason || 'A locomotiva a vapor não resistiu aos perigos do deserto.'}"
          </div>

          {/* Stats Breakdown */}
          <div className="grid grid-cols-3 gap-2 w-full my-3 pt-2 border-t border-stone-800/40 text-stone-900">
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1 text-[11px] font-saloon uppercase text-stone-700">
                <Coins className="w-3.5 h-3.5 text-amber-800" />
                <span>Ouro</span>
              </div>
              <span className="font-western text-base tabular-nums font-bold">
                {stats.coins}
              </span>
            </div>

            <div className="flex flex-col items-center border-x border-stone-800/30">
              <div className="flex items-center gap-1 text-[11px] font-saloon uppercase text-stone-700">
                <MapPin className="w-3.5 h-3.5 text-stone-800" />
                <span>Distância</span>
              </div>
              <span className="font-western text-base tabular-nums font-bold">
                {stats.distance}m
              </span>
            </div>

            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1 text-[11px] font-saloon uppercase text-stone-700">
                <Award className="w-3.5 h-3.5 text-amber-800" />
                <span>Melhor</span>
              </div>
              <span className="font-western text-base tabular-nums font-bold">
                ${stats.highScore.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full mt-2">
            <button
              onClick={onRestart}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-b from-amber-800 via-amber-900 to-stone-950 text-amber-100 font-western text-base py-3 px-4 shadow-xl hover:from-amber-700 hover:to-stone-900 transition-all active:scale-[0.98] border border-amber-600/50"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Jogar Novamente</span>
            </button>

            <button
              onClick={onHome}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg bg-stone-800/80 text-amber-100 hover:bg-stone-800 py-3 px-4 font-western text-sm transition-all border border-stone-700"
            >
              <Home className="w-4 h-4" />
              <span>Menu</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
