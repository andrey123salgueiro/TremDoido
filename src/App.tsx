/**
 * App.tsx
 * Iron Horse Rush: Wild West Train Runner
 * 3D Endless Runner built with Three.js / WebGL.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine } from './game/GameEngine';
import { globalInputHandler } from './input/InputHandler';
import { soundEngine } from './audio/SoundEffects';
import { GameHUD } from './components/GameHUD';
import { WantedPosterGameOver } from './components/WantedPosterGameOver';
import { StartScreen } from './components/StartScreen';
import { PauseModal } from './components/PauseModal';
import { VintageFilmOverlay } from './components/VintageFilmOverlay';
import { MobileControlsOverlay } from './components/MobileControlsOverlay';
import { StationModal } from './components/StationModal';
import { StationHUDNotification } from './components/StationHUDNotification';
import { GameState, GameStats, ActivePowerUp, GameAction, BiomeType } from './types/game';
import { StationData, ESTACOES_CONFIG } from './config/stationsConfig';

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  const [gameState, setGameState] = useState<GameState>('MENU');
  const [currentStation, setCurrentStation] = useState<StationData | null>(null);
  const [currentBiome, setCurrentBiome] = useState<BiomeType>('WESTERN');
  const [stationHornCount, setStationHornCount] = useState<number>(0);
  const [biomeToast, setBiomeToast] = useState<{ nome: string; icone: string; subtitulo: string } | null>(null);
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    coins: 0,
    distance: 0,
    speedMph: 42,
    highScore: 0,
    multiplier: 1,
    deathReason: '',
  });

  const [powerUps, setPowerUps] = useState<ActivePowerUp[]>([]);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [vintageFilter, setVintageFilter] = useState<boolean>(true);

  // Initialize Three.js Game Engine and Input Handler
  useEffect(() => {
    if (!containerRef.current) return;

    // Attach input handler to window
    globalInputHandler.attach(window);

    // Initialize Game Engine
    const engine = new GameEngine(containerRef.current, globalInputHandler, {
      onStatsUpdate: (updatedStats) => {
        setStats(updatedStats);
      },
      onGameOver: (finalStats) => {
        setStats(finalStats);
        setGameState('GAME_OVER');
      },
      onActivePowerUpsChange: (activeList) => {
        setPowerUps(activeList);
      },
      onStationReached: (station) => {
        setCurrentStation(station);
        setStationHornCount(0);
        setGameState('STATION');
      },
      onStationHornCountChange: (count) => {
        setStationHornCount(count);
      },
      onStationModalOpen: (station) => {
        setCurrentStation(station);
        setGameState('STATION_MODAL');
      },
      onStationDepart: () => {
        setCurrentStation(null);
        setStationHornCount(0);
        setGameState('PLAYING');
      },
      onBiomeChange: (biome, station) => {
        setCurrentBiome(biome);
        // Show momentary celebratory portal warp toast
        setBiomeToast({
          nome: station.nome,
          icone: station.icone,
          subtitulo: station.subtitulo,
        });
        setTimeout(() => {
          setBiomeToast(null);
        }, 4500);
      },
    });

    engineRef.current = engine;

    // Global keyboard listener for Pause (Escape / P)
    const handleGlobalKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.code === 'KeyP') {
        setGameState((prev) => {
          if (prev === 'PLAYING') {
            engine.pause();
            return 'PAUSED';
          }
          if (prev === 'PAUSED') {
            engine.resume();
            return 'PLAYING';
          }
          return prev;
        });
      }
    };
    window.addEventListener('keydown', handleGlobalKey);

    return () => {
      window.removeEventListener('keydown', handleGlobalKey);
      globalInputHandler.detach();
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  // Handlers
  const handleStartGame = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.start();
      setGameState('PLAYING');
    }
  }, []);

  const handlePause = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.pause();
      setGameState('PAUSED');
    }
  }, []);

  const handleResume = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.resume();
      setGameState('PLAYING');
    }
  }, []);

  const handleRestart = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.start();
      setGameState('PLAYING');
    }
  }, []);

  const handleHome = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.pause();
      setGameState('MENU');
    }
  }, []);

  const handleToggleMute = useCallback(() => {
    const next = !isMuted;
    setIsMuted(next);
    soundEngine.setMuted(next);
  }, [isMuted]);

  const handleToggleVintage = useCallback(() => {
    setVintageFilter((prev) => !prev);
  }, []);

  const handleMobileAction = useCallback((action: GameAction) => {
    globalInputHandler.emit(action);
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-stone-950 font-body select-none">
      {/* 3D WebGL Canvas Viewport */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Vintage Silent Film & Sepia Overlay */}
      <VintageFilmOverlay enabled={vintageFilter} grain={true} />

      {/* Playing or Station In-Game HUD */}
      {(gameState === 'PLAYING' || gameState === 'STATION') && (
        <>
          <GameHUD
            stats={stats}
            powerUps={powerUps}
            currentBiome={currentBiome}
            isMuted={isMuted}
            vintageFilter={vintageFilter}
            onToggleMute={handleToggleMute}
            onToggleVintage={handleToggleVintage}
            onPause={handlePause}
            onHorn={() => globalInputHandler.emit('HORN')}
          />

          {/* Biome Warp Portal Toast Notification */}
          {biomeToast && (
            <div className="absolute top-24 inset-x-0 z-40 flex justify-center pointer-events-none px-4 animate-in fade-in slide-in-from-top-6 duration-500">
              <div className="rounded-2xl border-2 border-yellow-400/80 bg-stone-950/90 px-6 py-3 shadow-2xl backdrop-blur-xl flex items-center gap-3.5 text-stone-100 max-w-md ring-4 ring-yellow-500/20">
                <span className="text-3xl animate-bounce">{biomeToast.icone}</span>
                <div className="flex flex-col text-left">
                  <span className="font-saloon text-[11px] text-amber-400 uppercase tracking-widest font-bold">
                    ★ Portal Interdimensional Ativado ★
                  </span>
                  <span className="font-western text-xl text-yellow-200 font-extrabold tracking-wide">
                    {biomeToast.nome}
                  </span>
                  <span className="text-xs text-stone-300 font-saloon">
                    {biomeToast.subtitulo}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* On-screen touch buttons for mobile devices */}
          <MobileControlsOverlay
            onAction={handleMobileAction}
            visible={true}
          />
        </>
      )}

      {/* Station Decision HUD Banner (Station Mode) */}
      {gameState === 'STATION' && currentStation && (
        <StationHUDNotification
          station={currentStation}
          hornCount={stationHornCount}
          onHornTrigger={() => {
            setStationHornCount((prev) => prev + 1);
            globalInputHandler.emit('HORN');
          }}
          onOpenModal={() => {
            if (engineRef.current) {
              engineRef.current.openStationModal();
            }
          }}
          onDepart={() => {
            if (engineRef.current) {
              engineRef.current.departStation();
            }
          }}
        />
      )}

      {/* Station Interactive Menu & Custom Link Modal */}
      {gameState === 'STATION_MODAL' && currentStation && (
        <StationModal
          station={currentStation}
          onDepartStation={() => {
            if (engineRef.current) {
              engineRef.current.departStation();
            }
          }}
        />
      )}

      {/* Start / Menu Screen */}
      {gameState === 'MENU' && (
        <StartScreen
          stats={stats}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onStart={handleStartGame}
        />
      )}

      {/* Pause Modal */}
      {gameState === 'PAUSED' && (
        <PauseModal
          onResume={handleResume}
          onRestart={handleRestart}
          onHome={handleHome}
          isMuted={isMuted}
          vintageFilter={vintageFilter}
          onToggleMute={handleToggleMute}
          onToggleVintage={handleToggleVintage}
        />
      )}

      {/* Wanted Poster Game Over Screen */}
      {gameState === 'GAME_OVER' && (
        <WantedPosterGameOver
          stats={stats}
          onRestart={handleRestart}
          onHome={handleHome}
        />
      )}
    </div>
  );
}
