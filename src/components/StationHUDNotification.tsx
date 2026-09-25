/**
 * StationHUDNotification.tsx
 * Aviso na tela quando o trem chega em uma Estação de Faroeste.
 * Mostra o status de parada e as instruções de decisão via buzina:
 *  - 1 BUZINADA (HORN x1) -> Partir da estação e acelerar
 *  - 2 BUZINADAS (HORN x2) -> Abrir o menu / modal da estação
 */

import React from 'react';
import { Megaphone, Play, ExternalLink, Compass } from 'lucide-react';
import { StationData } from '../config/stationsConfig';

interface StationHUDNotificationProps {
  station: StationData;
  hornCount: number;
  onHornTrigger: () => void;
  onOpenModal: () => void;
  onDepart: () => void;
}

export const StationHUDNotification: React.FC<StationHUDNotificationProps> = ({
  station,
  hornCount,
  onHornTrigger,
  onOpenModal,
  onDepart,
}) => {
  return (
    <div className="absolute inset-x-0 top-20 z-40 flex flex-col items-center justify-center px-4 pointer-events-none select-none animate-in slide-in-from-top-4 duration-300">
      <div className="pointer-events-auto max-w-lg w-full rounded-2xl border-2 border-yellow-500/70 bg-stone-950/90 p-4 md:p-5 shadow-2xl backdrop-blur-xl text-stone-100 flex flex-col items-center text-center">
        {/* Top Station Badge */}
        <div className="flex items-center gap-2 text-xs font-saloon tracking-widest text-amber-400 uppercase font-bold">
          <Compass className="w-3.5 h-3.5 text-yellow-400 animate-spin" />
          <span>{station.badge}</span>
          <span>·</span>
          <span>TREM PARADO NA ESTAÇÃO</span>
        </div>

        {/* Station Title */}
        <h2 className="font-western text-2xl md:text-3xl text-amber-200 font-bold mt-1 tracking-wide">
          {station.icone} {station.nome}
        </h2>
        <p className="font-saloon text-sm text-stone-300 mt-0.5">
          {station.subtitulo}
        </p>

        {/* Horn Instruction Decision Box */}
        <div className="w-full my-3 p-3 rounded-xl bg-stone-900/90 border border-amber-800/60 flex flex-col gap-2">
          <div className="text-xs font-saloon text-amber-400 uppercase tracking-wider font-semibold">
            Use a BUZINA (Espaço / H ou Botão) para decidir:
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {/* Option 1: 1 Horn */}
            <button
              onClick={onDepart}
              className={`flex flex-col items-center justify-center p-2.5 rounded-lg border transition-all text-center ${
                hornCount === 1
                  ? 'border-yellow-400 bg-yellow-500/20 text-yellow-300 scale-102 ring-2 ring-yellow-400/50'
                  : 'border-stone-700 bg-stone-950/60 text-stone-300 hover:bg-stone-800'
              }`}
            >
              <div className="flex items-center gap-1 font-western text-sm text-amber-300 font-bold">
                <Megaphone className="w-4 h-4 fill-current" />
                <span>1 BUZINADA</span>
              </div>
              <span className="text-[11px] text-stone-300 mt-1">
                Cruzar portal e ir para o próximo mapa
              </span>
            </button>

            {/* Option 2: 2 Horns */}
            <button
              onClick={onOpenModal}
              className={`flex flex-col items-center justify-center p-2.5 rounded-lg border transition-all text-center ${
                hornCount >= 2
                  ? 'border-amber-400 bg-amber-600/30 text-amber-200 scale-102 ring-2 ring-amber-400/50'
                  : 'border-stone-700 bg-stone-950/60 text-stone-300 hover:bg-stone-800'
              }`}
            >
              <div className="flex items-center gap-1 font-western text-sm text-yellow-300 font-bold">
                <Megaphone className="w-4 h-4 fill-current" />
                <Megaphone className="w-4 h-4 fill-current -ml-2" />
                <span>2 BUZINADAS</span>
              </div>
              <span className="text-[11px] text-stone-300 mt-1">
                Abrir Menu Interativo & Link
              </span>
            </button>
          </div>
        </div>

        {/* Quick Clickable Buttons for direct interaction */}
        <div className="flex items-center gap-2 w-full">
          <button
            onClick={onHornTrigger}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-stone-950 font-western text-sm py-2.5 px-4 font-bold shadow-lg active:scale-95 transition-all"
          >
            <Megaphone className="w-4 h-4 fill-stone-950 -rotate-12" />
            <span>Tocar Buzina {hornCount > 0 ? `(${hornCount}x)` : ''}</span>
          </button>

          <button
            onClick={onOpenModal}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-amber-800 hover:bg-amber-700 text-amber-100 font-western text-xs py-2.5 px-3 border border-amber-600/50 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Ver Link</span>
          </button>
        </div>
      </div>
    </div>
  );
};
