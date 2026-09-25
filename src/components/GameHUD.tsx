/**
 * GameHUD.tsx
 * Western-styled game HUD showing Score, Coins, Multiplier, Speedometer,
 * active Power-Up durations, and quick controls.
 */

import React, { useState } from 'react';
import { Volume2, VolumeX, Pause, Film, Gauge, Award, Megaphone, Compass } from 'lucide-react';
import { GameStats, ActivePowerUp, BiomeType } from '../types/game';
import { BIOME_CONFIGS, INTERVALO_ENTRE_ESTACOES_METROS } from '../config/stationsConfig';

const BIOME_INFO: Record<BiomeType, { nome: string; icone: string; itemIcon: string }> = {
  WESTERN: { nome: 'Velho Oeste', icone: '🤠', itemIcon: '★' },
  GALAXY: { nome: 'Galáxia', icone: '🚀', itemIcon: '✦' },
  UNICORN: { nome: 'Mundo Unicórnio', icone: '🦄', itemIcon: '♥' },
  VOLCANO: { nome: 'Terra do Fogo', icone: '🌋', itemIcon: '♦' },
  ICE_AGE: { nome: 'Era Glacial', icone: '❄️', itemIcon: '❄' },
  CYBERPUNK: { nome: 'Cyberpunk 2099', icone: '⚡', itemIcon: '◆' },
  UNDERWATER: { nome: 'Subaquático', icone: '🌊', itemIcon: '●' },
  CANDY_LAND: { nome: 'Mundo Doce', icone: '🍭', itemIcon: '🍬' },
};

interface GameHUDProps {
  stats: GameStats;
  powerUps: ActivePowerUp[];
  currentBiome?: BiomeType;
  isMuted: boolean;
  vintageFilter: boolean;
  onToggleMute: () => void;
  onToggleVintage: () => void;
  onPause: () => void;
  onHorn: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  stats,
  powerUps,
  currentBiome = 'WESTERN',
  isMuted,
  vintageFilter,
  onToggleMute,
  onToggleVintage,
  onPause,
  onHorn,
}) => {
  const [hornPulse, setHornPulse] = useState(false);

  const handleHornClick = () => {
    setHornPulse(true);
    onHorn();
    setTimeout(() => setHornPulse(false), 250);
  };

  const biomeData = BIOME_INFO[currentBiome] || BIOME_INFO.WESTERN;
  const biomeVisual = BIOME_CONFIGS[currentBiome] || BIOME_CONFIGS.WESTERN;
  const distToStation = INTERVALO_ENTRE_ESTACOES_METROS - (stats.distance % INTERVALO_ENTRE_ESTACOES_METROS);
  return (
    <div className="pointer-events-none absolute inset-0 z-30 flex flex-col justify-between p-4 md:p-6 select-none">
      {/* Top Bar HUD */}
      <div className="flex items-start justify-between gap-4">
        {/* Left: Score & Distance Plaque */}
        <div className="flex flex-col gap-1.5">
          {/* Main Score Board */}
          <div className="pointer-events-auto flex items-center gap-3 rounded-lg border-2 border-amber-900/60 bg-stone-900/80 px-4 py-2 shadow-xl backdrop-blur-md">
            <div className="flex flex-col">
              <span className="font-saloon text-xs tracking-wider text-amber-500 uppercase">
                Recompensa / Score
              </span>
              <span className="font-western tabular-nums text-2xl md:text-3xl text-amber-100 tracking-wide drop-shadow-md">
                ${stats.score.toLocaleString()}
              </span>
            </div>

            {/* Multiplier Tag */}
            {stats.multiplier > 1 && (
              <div className="flex items-center gap-1 rounded bg-amber-600/90 px-2 py-1 font-western text-sm text-stone-950 font-bold shadow animate-pulse">
                <span>x{stats.multiplier}</span>
              </div>
            )}
          </div>

          {/* Distance and Speed */}
          <div className="flex items-center gap-3 text-xs font-semibold text-amber-200/90 pl-1 drop-shadow">
            <div className="flex items-center gap-1">
              <Gauge className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-mono tabular-nums">{stats.speedMph} MPH</span>
            </div>
            <span className="text-amber-500/60">·</span>
            <div className="flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-mono tabular-nums">{stats.distance}m</span>
            </div>
          </div>
        </div>

        {/* Center: Active Biome & Next Portal Station Countdown */}
        <div className="hidden sm:flex flex-col items-center">
          <div className="pointer-events-auto flex items-center gap-2 rounded-xl border border-amber-500/50 bg-stone-950/85 px-3.5 py-1.5 shadow-xl backdrop-blur-md">
            <span className="text-lg">{biomeData.icone}</span>
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-1.5">
                <span className="font-saloon text-[10px] uppercase tracking-wider text-amber-400 font-bold">
                  Bioma
                </span>
                <span className="text-[10px] text-stone-400">·</span>
                <span className="font-western text-xs text-amber-100 font-bold">
                  {biomeData.nome}
                </span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-stone-300 font-mono">
                <Compass className="w-3 h-3 text-amber-400" />
                <span>Portal em <strong className="text-yellow-300 font-bold">{distToStation}m</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Coins Counter & Action Buttons */}
        <div className="flex items-center gap-3">
          {/* Dynamic Collectibles Counter */}
          <div className="pointer-events-auto flex items-center gap-2.5 rounded-lg border-2 border-amber-900/60 bg-stone-900/80 px-3.5 py-2 shadow-xl backdrop-blur-md">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-200 text-stone-950 shadow-inner font-bold text-xs">
              {biomeData.itemIcon}
            </div>
            <div className="flex flex-col">
              <span className="font-saloon text-[11px] text-amber-400 uppercase tracking-wider truncate max-w-[110px]">
                {biomeVisual.collectibleName}
              </span>
              <span className="font-western tabular-nums text-xl text-yellow-300 drop-shadow">
                {stats.coins.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Quick HUD Buttons */}
          <div className="pointer-events-auto flex items-center gap-1.5 rounded-lg border border-amber-950/70 bg-stone-900/70 p-1 backdrop-blur-md">
            <button
              onClick={handleHornClick}
              title="Buzinar Trem (ESPAÇO ou H)"
              className={`rounded px-2.5 py-1.5 flex items-center gap-1.5 font-western text-xs font-bold transition-all ${
                hornPulse
                  ? 'bg-yellow-500 text-stone-950 scale-105 shadow-md shadow-amber-500/50'
                  : 'bg-amber-800/80 hover:bg-amber-700 text-amber-100 hover:text-white'
              }`}
            >
              <Megaphone className="w-4 h-4 fill-current -rotate-12" />
              <span className="hidden sm:inline">Buzina</span>
            </button>

            <button
              onClick={onToggleVintage}
              title={vintageFilter ? 'Desativar Grão/Filtro Sépia' : 'Ativar Estilo Filme Antigo'}
              className={`rounded p-2 transition-colors ${
                vintageFilter
                  ? 'bg-amber-700/80 text-amber-100'
                  : 'text-stone-400 hover:text-stone-100 hover:bg-stone-800'
              }`}
            >
              <Film className="w-4 h-4" />
            </button>

            <button
              onClick={onToggleMute}
              title={isMuted ? 'Ativar Sons' : 'Silenciar'}
              className={`rounded p-2 transition-colors ${
                isMuted
                  ? 'bg-red-950/80 text-red-300'
                  : 'text-stone-400 hover:text-stone-100 hover:bg-stone-800'
              }`}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <button
              onClick={onPause}
              title="Pausar Jogo (ESC)"
              className="rounded p-2 text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors"
            >
              <Pause className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Active Power-Ups Shelf (Middle-Left) */}
      <div className="flex flex-col gap-2 max-w-xs">
        {powerUps.map((p) => {
          const progress = Math.max(0, Math.min(1, p.duration / p.maxDuration));

          const info = {
            MAGNET: {
              title: 'Ferradura Imã',
              desc: 'Puxa todo o ouro',
              color: 'from-amber-500 to-yellow-300',
              icon: '🧲',
            },
            INVINCIBLE: {
              title: 'Estrela do Xerife',
              desc: 'Invencível!',
              color: 'from-amber-400 to-amber-100',
              icon: '⭐',
            },
            DOUBLE_SCORE: {
              title: 'Elixir do Saloon',
              desc: 'Pontos em Dobro 2x',
              color: 'from-amber-600 to-orange-400',
              icon: '🧪',
            },
          }[p.type];

          return (
            <div
              key={p.type}
              className="pointer-events-auto flex flex-col gap-1 rounded-md border border-amber-900/50 bg-stone-950/85 p-2.5 shadow-lg backdrop-blur-md animate-in slide-in-from-left duration-200"
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-western text-amber-200">
                  <span className="text-base">{info.icon}</span>
                  <span>{info.title}</span>
                </div>
                <span className="font-mono text-[11px] text-amber-400/90 tabular-nums">
                  {p.duration.toFixed(1)}s
                </span>
              </div>

              {/* Countdown progress bar */}
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-stone-800">
                <div
                  className={`h-full bg-gradient-to-r ${info.color} transition-all duration-100`}
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
