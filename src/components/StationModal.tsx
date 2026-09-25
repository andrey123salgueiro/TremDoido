/**
 * StationModal.tsx
 * Modal interativo de faroeste ao acionar 2 BUZINADAS na Estação de Trem.
 * Apresenta o nome da estação, descrição temática, link customizado oficial,
 * e botão para retornar à viagem nos trilhos.
 */

import React from 'react';
import { ExternalLink, Play, Sparkles, MapPin, Compass } from 'lucide-react';
import { StationData } from '../config/stationsConfig';

interface StationModalProps {
  station: StationData;
  onDepartStation: () => void;
}

export const StationModal: React.FC<StationModalProps> = ({ station, onDepartStation }) => {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/85 backdrop-blur-md select-none animate-in fade-in duration-300">
      {/* Western Parchment / Saloon Board Frame */}
      <div
        className="relative w-full max-w-lg rounded-2xl border-4 border-amber-950/85 p-6 md:p-8 text-stone-900 shadow-2xl overflow-hidden"
        style={{
          backgroundImage: `url('/src/assets/images/parchment_wanted_texture_1790334032609.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.9), inset 0 0 50px rgba(60, 30, 10, 0.65)',
        }}
      >
        {/* Inner Ornamental Border */}
        <div className="border-2 border-stone-800/80 p-5 rounded-xl flex flex-col items-center text-center">
          {/* Header Banner */}
          <div className="flex items-center gap-2 text-xs font-saloon tracking-widest text-amber-950 uppercase font-bold">
            <Compass className="w-4 h-4 text-amber-900" />
            <span>{station.badge}</span>
            <Compass className="w-4 h-4 text-amber-900" />
          </div>

          {/* Station Icon & Title */}
          <div className="my-2 flex flex-col items-center">
            <span className="text-4xl drop-shadow-sm mb-1">{station.icone}</span>
            <h2 className="font-western text-3xl md:text-4xl text-stone-950 font-extrabold tracking-wide drop-shadow-sm">
              {station.nome}
            </h2>
            <span className="font-saloon text-sm md:text-base text-stone-800 font-semibold italic mt-0.5">
              {station.subtitulo}
            </span>
          </div>

          <div className="w-full flex items-center justify-center gap-2 text-xs font-western tracking-widest text-stone-800 uppercase border-y border-stone-800/50 py-1 my-2">
            <span>★</span>
            <span>PARADA AUTORIZADA DA FERROVIA</span>
            <span>★</span>
          </div>

          {/* Station Description Card */}
          <div className="my-3 p-4 bg-amber-950/10 rounded-lg border border-stone-800/30 text-stone-800 text-sm md:text-base leading-relaxed text-left font-medium">
            <p>{station.descricao}</p>
          </div>

          {/* Station External Custom Link Button */}
          <div className="w-full my-2 flex flex-col gap-2.5">
            <a
              href={station.link}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 hover:from-amber-600 hover:to-amber-800 text-amber-100 font-western text-lg py-3.5 px-6 shadow-xl border border-amber-500/50 transition-all active:scale-[0.98] font-bold tracking-wide"
            >
              <span>{station.textoBotao}</span>
              <ExternalLink className="w-5 h-5 text-amber-300" />
            </a>

            <span className="text-[11px] text-stone-600 font-mono">
              Link de destino: <span className="font-semibold">{station.link}</span>
            </span>
          </div>

          {/* Depart Station & Resume Run */}
          <div className="w-full pt-4 mt-2 border-t border-stone-800/40 flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={onDepartStation}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-stone-900/90 hover:bg-stone-900 text-amber-200 font-western text-base py-3 px-5 transition-all border border-stone-700 active:scale-[0.98] shadow-md"
            >
              <Play className="w-4 h-4 fill-amber-300" />
              <span>Partir da Estação (Retomar Corrida)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
