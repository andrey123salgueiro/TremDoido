/**
 * VintageFilmOverlay.tsx
 * Authentically styles the screen with an 1880s silent film / wild west effect:
 * Sepia tone, vignette shadows, dynamic film grain, and subtle scratches.
 */

import React from 'react';

interface VintageFilmOverlayProps {
  enabled: boolean;
  grain: boolean;
}

export const VintageFilmOverlay: React.FC<VintageFilmOverlayProps> = ({ enabled, grain }) => {
  if (!enabled) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden mix-blend-multiply select-none">
      {/* 1. Heavy Vignette edges */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(160, 100, 40, 0.05) 45%, rgba(40, 20, 8, 0.45) 85%, rgba(15, 6, 2, 0.75) 100%)',
        }}
      />

      {/* 2. Warm Sepia / Amber photo tint */}
      <div className="absolute inset-0 bg-amber-900/10 mix-blend-color" />

      {/* 3. Film grain layer */}
      {grain && (
        <div
          className="vintage-film-grain absolute inset-0 opacity-15"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.7'/%3E%3C/svg%3E")`,
          }}
        />
      )}

      {/* 4. Occasional vertical film projector scratch */}
      <div className="vintage-film-scratch pointer-events-none absolute top-0 bottom-0 w-[1px] bg-amber-100/20 left-1/3" />
      <div className="vintage-film-scratch pointer-events-none absolute top-0 bottom-0 w-[2px] bg-stone-900/25 left-2/3" />
    </div>
  );
};
