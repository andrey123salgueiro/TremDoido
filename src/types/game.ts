/**
 * Game Types & Event Definitions
 * Iron Horse Rush: Wild West Train Runner
 */

export type GameAction = 'MOVE_LEFT' | 'MOVE_RIGHT' | 'JUMP' | 'SLIDE' | 'HORN';

export type GameState = 'MENU' | 'PLAYING' | 'PAUSED' | 'STATION' | 'STATION_MODAL' | 'GAME_OVER';

export type BiomeType =
  | 'WESTERN'
  | 'GALAXY'
  | 'UNICORN'
  | 'VOLCANO'
  | 'ICE_AGE'
  | 'CYBERPUNK'
  | 'UNDERWATER'
  | 'CANDY_LAND';

export type Lane = -1 | 0 | 1; // Left (-3.2), Center (0), Right (3.2)

export type PowerUpType = 'MAGNET' | 'INVINCIBLE' | 'DOUBLE_SCORE';

export interface ActivePowerUp {
  type: PowerUpType;
  duration: number; // Remaining time in seconds
  maxDuration: number;
}

export type ObstacleType =
  | 'BOULDER'
  | 'WOODEN_BARRIER'
  | 'CACTUS_BLOCK'
  | 'CARGO_TRAIN'
  | 'STATIONARY_WAGON'
  | 'RAMP_WAGON'
  | 'OVERHEAD_BEAM';

export interface GameStats {
  score: number;
  coins: number;
  distance: number; // meters / yards
  speedMph: number;
  highScore: number;
  multiplier: number;
  deathReason: string;
}

export interface SoundConfig {
  soundEnabled: boolean;
  musicEnabled: boolean;
  volume: number;
}

export interface SettingsConfig {
  vintageFilter: boolean;
  filmGrain: boolean;
  soundEnabled: boolean;
  fovEffect: boolean;
}
