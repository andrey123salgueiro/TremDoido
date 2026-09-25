/**
 * GameEngine.ts
 * Core 3D game loop, procedural generation, train physics, and collision logic.
 */

import * as THREE from 'three';
import { TrainModel } from './TrainModel';
import { EnvironmentBuilder, LANES } from './EnvironmentBuilder';
import { ObstacleManager, ObstacleInstance } from './ObstacleManager';
import { CollectibleManager } from './CollectibleManager';
import { ParticleSystem } from './ParticleSystem';
import { IInputSource } from '../input/InputHandler';
import { soundEngine } from '../audio/SoundEffects';
import { GameAction, GameState, Lane, PowerUpType, ActivePowerUp, GameStats, BiomeType } from '../types/game';
import { ESTACOES_CONFIG, StationData, INTERVALO_ENTRE_ESTACOES_METROS, BIOME_CONFIGS } from '../config/stationsConfig';

const CHUNK_LENGTH = 80;
const INITIAL_SPEED = 28.0;
const MAX_SPEED = 68.0;
const GRAVITY = 32.0;
const JUMP_FORCE = 12.5;

export interface EngineCallbacks {
  onStatsUpdate: (stats: GameStats) => void;
  onGameOver: (finalStats: GameStats) => void;
  onActivePowerUpsChange: (powerUps: ActivePowerUp[]) => void;
  onStationReached?: (station: StationData) => void;
  onStationHornCountChange?: (count: number) => void;
  onStationModalOpen?: (station: StationData) => void;
  onStationDepart?: () => void;
  onBiomeChange?: (biome: BiomeType, station: StationData) => void;
}

export class GameEngine {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private inputSource: IInputSource;
  private callbacks: EngineCallbacks;

  // Biome & Atmosphere Transition
  private currentBiome: BiomeType = 'WESTERN';
  private targetSkyColor: THREE.Color = new THREE.Color(0xd68953);
  private currentSkyColor: THREE.Color = new THREE.Color(0xd68953);
  private targetFogColor: THREE.Color = new THREE.Color(0xd68953);
  private currentFogColor: THREE.Color = new THREE.Color(0xd68953);
  private sunLight!: THREE.DirectionalLight;
  private hemiLight!: THREE.HemisphereLight;
  private ambientLight!: THREE.AmbientLight;
  private ambientParticleTimer: number = 0;

  // Subsystems
  private train: TrainModel;
  private envBuilder: EnvironmentBuilder;
  private obstacleManager: ObstacleManager;
  private collectibleManager: CollectibleManager;
  private particleSystem: ParticleSystem;

  // Track chunks
  private activeChunks: { chunk: THREE.Group; startZ: number }[] = [];
  private nextChunkZ: number = 0;

  // Player state
  private currentLane: Lane = 0;
  private targetX: number = 0;
  private currentX: number = 0;
  private playerY: number = 0;
  private playerZ: number = 0;
  private velocityY: number = 0;
  private isGrounded: boolean = true;
  private groundHeight: number = 0; // 0 on ground, 2.8 on boxcar roof

  private isSliding: boolean = false;
  private slideTimer: number = 0;
  private readonly slideDuration: number = 0.7; // seconds

  // Game metrics
  private gameState: GameState = 'MENU';
  private currentSpeed: number = INITIAL_SPEED;
  private distanceTraveled: number = 0;
  private score: number = 0;
  private coinsCollected: number = 0;
  private highScore: number = 0;
  private multiplier: number = 1;

  // Active power-ups
  private activePowerUps: Map<PowerUpType, { duration: number; maxDuration: number }> = new Map();

  // Station System State
  private nextStationIndex: number = 0;
  private stationApproaching: boolean = false;
  private currentStationData: StationData | null = null;
  private stationDecelerationProgress: number = 0;
  private stationHornCount: number = 0;
  private stationHornTimer: number | null = null;
  private stationDeparting: boolean = false;

  // Animation frame & timing
  private lastTime: number = 0;
  private animationFrameId: number | null = null;
  private smokeTimer: number = 0;
  private cameraShake: number = 0;

  // Unsubscribe from input
  private unsubscribeInput: (() => void) | null = null;

  constructor(container: HTMLElement, inputSource: IInputSource, callbacks: EngineCallbacks) {
    this.container = container;
    this.inputSource = inputSource;
    this.callbacks = callbacks;

    // Load high score
    const saved = localStorage.getItem('wild_west_train_high_score');
    this.highScore = saved ? parseInt(saved, 10) : 0;

    // 1. Scene & Atmosphere
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xd68953); // Warm sunset orange
    this.scene.fog = new THREE.FogExp2(0xd68953, 0.012);

    // 2. Camera
    const aspect = container.clientWidth / container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 350);
    this.camera.position.set(0, 5.0, 8.8);

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({
      powerPreference: 'high-performance',
      antialias: true,
    });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.container.appendChild(this.renderer.domElement);

    // 4. Lighting
    this.setupLighting();

    // 5. Load Skybox texture if available
    this.setupSkybox();

    // 6. Subsystems
    this.envBuilder = new EnvironmentBuilder();
    this.obstacleManager = new ObstacleManager();
    this.collectibleManager = new CollectibleManager();
    this.particleSystem = new ParticleSystem();
    this.train = new TrainModel();

    this.scene.add(this.train.group);
    this.scene.add(this.obstacleManager.group);
    this.scene.add(this.collectibleManager.group);
    this.scene.add(this.particleSystem.group);

    // 7. Bind input actions
    this.unsubscribeInput = this.inputSource.onAction(this.handleAction.bind(this));

    // 8. Window resize
    window.addEventListener('resize', this.handleResize);

    // Pre-seed initial chunks for menu view
    this.seedInitialWorld();

    // Start render loop
    this.lastTime = performance.now();
    this.animate();
  }

  private setupLighting(): void {
    // Warm sunset directional key light (casting long shadows)
    this.sunLight = new THREE.DirectionalLight(0xffeedd, 2.2);
    this.sunLight.position.set(30, 45, 25);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 1024;
    this.sunLight.shadow.mapSize.height = 1024;
    this.sunLight.shadow.camera.near = 0.5;
    this.sunLight.shadow.camera.far = 120;
    this.sunLight.shadow.camera.left = -22;
    this.sunLight.shadow.camera.right = 22;
    this.sunLight.shadow.camera.top = 22;
    this.sunLight.shadow.camera.bottom = -22;
    this.scene.add(this.sunLight);

    // Warm ambient fill
    this.hemiLight = new THREE.HemisphereLight(0xff8844, 0x6e482d, 1.1);
    this.scene.add(this.hemiLight);

    this.ambientLight = new THREE.AmbientLight(0x73482a, 0.8);
    this.scene.add(this.ambientLight);
  }

  private setupSkybox(): void {
    // Load generated sunset backdrop
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
      '/src/assets/images/skybox_wild_west_sunset_1790334020957.jpg',
      (texture) => {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        this.scene.background = texture;
      },
      undefined,
      (err) => {
        console.warn('Sunset skybox texture fallback to procedural color gradient', err);
      }
    );
  }

  private seedInitialWorld(): void {
    this.nextChunkZ = 0;
    for (let i = 0; i < 4; i++) {
      const chunk = this.envBuilder.createChunk(CHUNK_LENGTH);
      chunk.position.z = this.nextChunkZ;
      this.scene.add(chunk);
      this.activeChunks.push({ chunk, startZ: this.nextChunkZ });
      this.nextChunkZ -= CHUNK_LENGTH;
    }
  }

  /**
   * Start a new game run
   */
  public start(): void {
    this.resetState();
    this.gameState = 'PLAYING';
    soundEngine.startTrainChuff();
    soundEngine.playWhistle();
  }

  /**
   * Pause game
   */
  public pause(): void {
    if (this.gameState === 'PLAYING') {
      this.gameState = 'PAUSED';
      soundEngine.stopTrainChuff();
    }
  }

  /**
   * Resume game
   */
  public resume(): void {
    if (this.gameState === 'PAUSED') {
      this.gameState = 'PLAYING';
      this.lastTime = performance.now();
      soundEngine.startTrainChuff();
    }
  }

  /**
   * Reset game elements for restart
   */
  private resetState(): void {
    this.currentLane = 0;
    this.targetX = 0;
    this.currentX = 0;
    this.playerY = 0;
    this.playerZ = 0;
    this.velocityY = 0;
    this.isGrounded = true;
    this.groundHeight = 0;
    this.isSliding = false;
    this.slideTimer = 0;

    this.currentSpeed = INITIAL_SPEED;
    this.distanceTraveled = 0;
    this.score = 0;
    this.coinsCollected = 0;
    this.multiplier = 1;
    this.activePowerUps.clear();
    this.cameraShake = 0;

    // Reset station system
    this.nextStationIndex = 0;
    this.stationApproaching = false;
    this.currentStationData = null;
    this.stationDecelerationProgress = 0;
    this.stationHornCount = 0;
    if (this.stationHornTimer !== null) {
      window.clearTimeout(this.stationHornTimer);
      this.stationHornTimer = null;
    }
    this.stationDeparting = false;

    // Reset models & camera
    this.train.group.position.set(0, 0, 0);
    this.train.group.rotation.set(0, 0, 0);
    this.train.group.scale.set(0.9, 0.9, 0.9);
    this.camera.position.set(0, 5.0, 8.8);
    this.camera.lookAt(0, 1.8, -13.5);

    // Reset obstacles & collectibles & particles
    this.obstacleManager.reset();
    this.collectibleManager.reset();
    this.particleSystem.reset();

    // Rebuild chunks
    this.activeChunks.forEach((c) => this.scene.remove(c.chunk));
    this.activeChunks = [];
    this.seedInitialWorld();

    // Reset biome to Western starting realm
    this.currentBiome = 'WESTERN';
    this.transitionToBiome('WESTERN', ESTACOES_CONFIG[0]);

    this.notifyStats();
    this.notifyPowerUps();
  }

  /**
   * Handle generic input actions emitted by InputHandler
   */
  private handleAction(action: GameAction): void {
    if (this.gameState === 'STATION') {
      // In Station mode, only HORN triggers action decisions
      if (action === 'HORN') {
        this.handleStationHorn();
      }
      return;
    }

    if (this.gameState !== 'PLAYING') return;

    switch (action) {
      case 'MOVE_LEFT':
        if (this.currentLane > -1) {
          this.currentLane = (this.currentLane - 1) as Lane;
          this.targetX = LANES[this.currentLane];
          soundEngine.playLaneChangeSound();
        }
        break;

      case 'MOVE_RIGHT':
        if (this.currentLane < 1) {
          this.currentLane = (this.currentLane + 1) as Lane;
          this.targetX = LANES[this.currentLane];
          soundEngine.playLaneChangeSound();
        }
        break;

      case 'JUMP':
        // Jump only if grounded on tracks or on a wagon roof
        if (this.isGrounded) {
          this.velocityY = JUMP_FORCE;
          this.isGrounded = false;
          this.isSliding = false;
          soundEngine.playJumpSound();
        }
        break;

      case 'SLIDE':
        // Quick duck down / slide
        this.isSliding = true;
        this.slideTimer = this.slideDuration;

        // If in air, pull down faster (quick drop)
        if (!this.isGrounded) {
          this.velocityY = -18;
        }

        soundEngine.playSlideSound();
        break;

      case 'HORN':
        this.triggerHornEffect();
        break;
    }
  }

  /**
   * Decision handler for HORN in station:
   * 1 Horn  -> Depart station and continue running
   * 2 Horns -> Open Station GUI / Modal with external link
   */
  private handleStationHorn(): void {
    this.triggerHornEffect();
    this.stationHornCount++;

    if (this.callbacks.onStationHornCountChange) {
      this.callbacks.onStationHornCountChange(this.stationHornCount);
    }

    if (this.stationHornTimer !== null) {
      window.clearTimeout(this.stationHornTimer);
      this.stationHornTimer = null;
    }

    if (this.stationHornCount === 1) {
      // Wait briefly (650ms) to see if player presses a second time
      this.stationHornTimer = window.setTimeout(() => {
        if (this.stationHornCount === 1 && this.gameState === 'STATION') {
          // Exactly 1 Horn -> Depart station!
          this.departStation();
        }
      }, 650);
    } else if (this.stationHornCount >= 2) {
      // 2 Horns -> Open Station Modal!
      this.openStationModal();
    }
  }

  /**
   * Depart the station, cross the portal, and resume running into the next biome
   */
  public departStation(): void {
    if (this.stationHornTimer !== null) {
      window.clearTimeout(this.stationHornTimer);
      this.stationHornTimer = null;
    }

    this.stationHornCount = 0;
    if (this.callbacks.onStationHornCountChange) {
      this.callbacks.onStationHornCountChange(0);
    }
    this.stationApproaching = false;
    this.stationDeparting = true;
    this.gameState = 'PLAYING';

    // Transition into the next biome across the interdimensional portal!
    const nextStation = ESTACOES_CONFIG[this.nextStationIndex % ESTACOES_CONFIG.length];
    this.transitionToBiome(nextStation.biome, nextStation);

    // Train gives a departure whistle and starts chuffing again
    soundEngine.playWhistle();
    soundEngine.startTrainChuff();

    if (this.callbacks.onStationDepart) {
      this.callbacks.onStationDepart();
    }
  }

  /**
   * Smoothly switch biome atmosphere, lighting, rails, obstacles, collectibles, and particles
   */
  public transitionToBiome(biome: BiomeType, station: StationData): void {
    this.currentBiome = biome;
    const config = BIOME_CONFIGS[biome];

    // 1. Update subsystem materials
    this.envBuilder.setBiome(biome);
    this.obstacleManager.setBiome(biome);
    this.collectibleManager.setBiome(biome);
    this.particleSystem.setBiome(biome);

    // 2. Burst interdimensional portal warp
    const warpPos = new THREE.Vector3(this.currentX, 2.5, this.playerZ - 8);
    this.particleSystem.emitPortalWarp(warpPos, station.portalColor);
    this.cameraShake = 0.55;

    // 3. Atmosphere and lighting transition
    if (config) {
      this.targetSkyColor.setHex(config.skyColor);
      this.targetFogColor.setHex(config.fogColor);
      this.scene.background = this.targetSkyColor;

      if (this.scene.fog instanceof THREE.FogExp2) {
        this.scene.fog.color.setHex(config.fogColor);
        this.scene.fog.density = config.fogDensity;
      }

      if (this.sunLight) {
        this.sunLight.color.setHex(config.sunColor);
        this.sunLight.intensity = config.sunIntensity;
      }
      if (this.ambientLight) {
        this.ambientLight.color.setHex(config.ambientColor);
        this.ambientLight.intensity = config.ambientIntensity;
      }
    }

    // 4. Notify app callbacks
    if (this.callbacks.onBiomeChange) {
      this.callbacks.onBiomeChange(biome, station);
    }
  }

  /**
   * Open the interactive Station Modal
   */
  public openStationModal(): void {
    if (this.stationHornTimer !== null) {
      window.clearTimeout(this.stationHornTimer);
      this.stationHornTimer = null;
    }

    this.gameState = 'STATION_MODAL';
    soundEngine.stopTrainChuff();

    if (this.currentStationData && this.callbacks.onStationModalOpen) {
      this.callbacks.onStationModalOpen(this.currentStationData);
    }
  }

  /**
   * Sound the classic steam horn, emit explosive white steam burst, and trigger recoil vibration
   */
  public triggerHornEffect(): void {
    soundEngine.playWhistle();

    // Billowing white steam eruption from smokestack
    const stackPos = this.train.getSmokestackWorldPosition();
    this.particleSystem.emitHornSteamBurst(stackPos, this.currentSpeed);

    // Locomotive physical recoil / vibration & scale swell
    this.train.triggerHornVibration();

    // Subtle screen shake for visceral feel
    this.cameraShake = Math.max(this.cameraShake, 0.25);
  }

  /**
   * Main game loop
   */
  private animate = (): void => {
    this.animationFrameId = requestAnimationFrame(this.animate);

    const now = performance.now();
    let delta = (now - this.lastTime) / 1000;
    this.lastTime = now;

    // Clamp delta to avoid huge physics spikes after tab switch
    if (delta > 0.1) delta = 0.1;

    if (this.gameState === 'PLAYING') {
      this.updateStationApproaching(delta);
      this.updatePhysics(delta);
      this.updateProceduralWorld();
      this.checkCollisions();
      this.updatePowerUps(delta);
      this.updateScore(delta);
    } else if (this.gameState === 'STATION') {
      this.updateStationResting(delta);
    } else if (this.gameState === 'MENU') {
      // Gentle cinematic camera pan in menu
      const time = now * 0.0006;
      this.camera.position.x = Math.sin(time) * 1.8;
      this.camera.position.y = 3.6 + Math.cos(time * 0.8) * 0.4;
      this.camera.lookAt(0, 1.5, -4);
    }

    // Always update visual particles and train model
    this.particleSystem.update(delta);
    this.train.update(this.gameState === 'PLAYING' ? this.currentSpeed * delta : delta * 5, delta);

    // Update sound engine speed tempo
    soundEngine.setSpeedFactor(this.currentSpeed / INITIAL_SPEED);

    // Render 3D scene
    this.renderer.render(this.scene, this.camera);
  };

  /**
   * Physics, speed progression, and player positioning
   */
  private updatePhysics(delta: number): void {
    // 1. Difficulty progression: speed ramps up with distance
    const baseTargetSpeed = Math.min(MAX_SPEED, INITIAL_SPEED + Math.sqrt(this.distanceTraveled) * 0.55);

    if (this.stationApproaching) {
      // Smoothly decelerate as station approaches
      this.currentSpeed = THREE.MathUtils.lerp(this.currentSpeed, 4.0, delta * 1.8);
      if (this.currentSpeed < 5.5) {
        // Stop completely at the station platform!
        this.currentSpeed = 0;
        this.arriveAtStation();
        return;
      }
    } else if (this.stationDeparting) {
      // Accelerating away from station back to cruising speed
      this.currentSpeed = THREE.MathUtils.lerp(this.currentSpeed, baseTargetSpeed, delta * 1.5);
      if (Math.abs(this.currentSpeed - baseTargetSpeed) < 3.0) {
        this.stationDeparting = false;
        this.currentSpeed = baseTargetSpeed;
      }
    } else {
      this.currentSpeed = baseTargetSpeed;
    }

    // 2. Advance train forward (negative Z)
    const moveZ = this.currentSpeed * delta;
    this.playerZ -= moveZ;
    this.distanceTraveled += moveZ;

    // 3. Smooth lane transition (lerp)
    this.currentX = THREE.MathUtils.lerp(this.currentX, this.targetX, delta * 14);

    // Train leans into turns
    const leanAngle = (this.targetX - this.currentX) * 0.12;

    // 4. Vertical physics & Ramp Riding
    // Check if player is currently above a ramp wagon
    this.evaluateRampElevation();

    if (!this.isGrounded) {
      this.velocityY -= GRAVITY * delta;
      this.playerY += this.velocityY * delta;

      if (this.playerY <= this.groundHeight) {
        this.playerY = this.groundHeight;
        this.velocityY = 0;
        this.isGrounded = true;
      }
    } else {
      this.playerY = THREE.MathUtils.lerp(this.playerY, this.groundHeight, delta * 12);
    }

    // 5. Slide timer
    if (this.isSliding) {
      this.slideTimer -= delta;
      if (this.slideTimer <= 0) {
        this.isSliding = false;
      }
    }

    // 6. Apply position & rotations to train
    const baseScaleY = this.isSliding ? 0.55 : 0.9;
    this.train.group.scale.set(0.9, baseScaleY, 0.9);
    this.train.group.position.set(this.currentX, this.playerY, this.playerZ);
    this.train.group.rotation.z = -leanAngle;

    // 7. Emit smoke particles from smokestack
    this.smokeTimer += delta;
    const smokeRate = Math.max(0.04, 0.09 - (this.currentSpeed / MAX_SPEED) * 0.05);
    if (this.smokeTimer >= smokeRate) {
      this.smokeTimer = 0;
      const stackPos = this.train.getSmokestackWorldPosition();
      this.particleSystem.emitSmokestackPuff(stackPos, this.currentSpeed);
    }

    // Emit atmospheric ambient particles for the current biome (snow, bubbles, space stars, sparks, etc.)
    this.ambientParticleTimer += delta;
    if (this.ambientParticleTimer >= 0.12) {
      this.ambientParticleTimer = 0;
      this.particleSystem.emitBiomeAmbient(
        new THREE.Vector3(this.currentX, this.playerY, this.playerZ),
        this.currentSpeed
      );
    }

    // 8. Dynamic Camera Follow (ergue a câmera para visão estratégica elevada sobre o trem)
    let targetCamX = this.currentX * 0.45;
    let targetCamY = this.playerY + 5.0; // Elevada para ampla visão dos 3 trilhos e obstáculos
    let targetCamZ = this.playerZ + 8.2;

    // Camera shake on impacts/high speed
    if (this.cameraShake > 0) {
      targetCamX += (Math.random() - 0.5) * this.cameraShake;
      targetCamY += (Math.random() - 0.5) * this.cameraShake;
      this.cameraShake = Math.max(0, this.cameraShake - delta * 3.5);
    }

    this.camera.position.x = THREE.MathUtils.lerp(this.camera.position.x, targetCamX, delta * 8);
    this.camera.position.y = THREE.MathUtils.lerp(this.camera.position.y, targetCamY, delta * 8);
    this.camera.position.z = THREE.MathUtils.lerp(this.camera.position.z, targetCamZ, delta * 12);

    // Look point slightly ahead of train
    const lookTarget = new THREE.Vector3(
      this.currentX * 0.2,
      this.playerY + 1.8,
      this.playerZ - 13.5
    );
    this.camera.lookAt(lookTarget);

    // FOV expands slightly as train speeds up
    const targetFov = 60 + ((this.currentSpeed - INITIAL_SPEED) / (MAX_SPEED - INITIAL_SPEED)) * 10;
    this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, targetFov, delta * 3);
    this.camera.updateProjectionMatrix();

    // 9. Update moving obstacles & items
    this.obstacleManager.update(delta, this.playerZ);

    const isMagnetActive = this.activePowerUps.has('MAGNET');
    this.collectibleManager.update(
      delta,
      new THREE.Vector3(this.currentX, this.playerY + 1.2, this.playerZ),
      isMagnetActive,
      (coinPos) => this.handleCoinCollected(coinPos),
      (powerUpType) => this.handlePowerUpCollected(powerUpType)
    );
  }

  /**
   * Monitor distance and trigger station approach every INTERVALO_ENTRE_ESTACOES_METROS
   */
  private updateStationApproaching(delta: number): void {
    if (this.stationApproaching || this.stationDeparting) return;

    const nextStation = ESTACOES_CONFIG[this.nextStationIndex % ESTACOES_CONFIG.length];
    const targetMilestone = (this.nextStationIndex + 1) * INTERVALO_ENTRE_ESTACOES_METROS;

    // Trigger deceleration when within 60 meters of the station milestone
    if (this.distanceTraveled >= targetMilestone - 60 && !this.stationApproaching) {
      this.stationApproaching = true;
      this.currentStationData = nextStation;
      this.stationHornCount = 0;
    }
  }

  /**
   * Called when train comes to a full stop at the station platform
   */
  private arriveAtStation(): void {
    this.gameState = 'STATION';
    this.currentSpeed = 0;
    soundEngine.stopTrainChuff();

    // Whistle to announce arrival at the platform
    soundEngine.playWhistle();

    // Emit gentle resting steam cloud
    const stackPos = this.train.getSmokestackWorldPosition();
    this.particleSystem.emitSmokestackPuff(stackPos, 1);

    if (this.currentStationData && this.callbacks.onStationReached) {
      this.callbacks.onStationReached(this.currentStationData);
    }

    this.nextStationIndex++;
  }

  /**
   * When resting at station: slow camera breathing and gentle steam puffs
   */
  private updateStationResting(delta: number): void {
    // Gentle idling steam puffs
    this.smokeTimer += delta;
    if (this.smokeTimer >= 0.35) {
      this.smokeTimer = 0;
      const stackPos = this.train.getSmokestackWorldPosition();
      this.particleSystem.emitSmokestackPuff(stackPos, 2);
    }

    // Station cinematic camera angle looking at train and platform
    const targetCamX = this.currentX + 3.8;
    const targetCamY = 3.2;
    const targetCamZ = this.playerZ + 6.5;

    this.camera.position.x = THREE.MathUtils.lerp(this.camera.position.x, targetCamX, delta * 3);
    this.camera.position.y = THREE.MathUtils.lerp(this.camera.position.y, targetCamY, delta * 3);
    this.camera.position.z = THREE.MathUtils.lerp(this.camera.position.z, targetCamZ, delta * 4);

    this.camera.lookAt(this.currentX, 1.4, this.playerZ - 2.0);
  }

  /**
   * Check if player is on a ramp or top of a boxcar
   */
  private evaluateRampElevation(): void {
    let targetGround = 0;

    for (const obs of this.obstacleManager.obstacles) {
      if (!obs.active) continue;

      if (obs.hasRamp && obs.lane === this.currentLane) {
        const wagonZ = obs.group.position.z;
        const rampStart = wagonZ + 7.0; // Front of ramp
        const rampEnd = wagonZ + 4.0; // Top of ramp
        const roofEnd = wagonZ - 4.0; // Back of wagon

        if (this.playerZ <= rampStart && this.playerZ >= rampEnd) {
          // Walking up the ramp
          const rampProgress = (rampStart - this.playerZ) / (rampStart - rampEnd);
          targetGround = THREE.MathUtils.lerp(0, 3.1, Math.min(1, Math.max(0, rampProgress)));
          break;
        } else if (this.playerZ < rampEnd && this.playerZ >= roofEnd) {
          // On the wagon roof!
          targetGround = 3.1;
          break;
        }
      }
    }

    this.groundHeight = targetGround;

    // If train was running on roof and wagon ended, trigger fall!
    if (this.groundHeight === 0 && this.playerY > 0.5 && this.isGrounded) {
      this.isGrounded = false;
      this.velocityY = 0; // Natural drop off roof edge
    }
  }

  /**
   * Check bounding box collisions against active obstacles
   */
  private checkCollisions(): void {
    // Calculate player bounding box
    const trainWidth = 1.3;
    const trainHeight = this.isSliding ? 1.4 : 2.5;
    const trainDepth = 3.2;

    const playerBox = new THREE.Box3(
      new THREE.Vector3(
        this.currentX - trainWidth / 2,
        this.playerY,
        this.playerZ - trainDepth / 2
      ),
      new THREE.Vector3(
        this.currentX + trainWidth / 2,
        this.playerY + trainHeight,
        this.playerZ + trainDepth / 2
      )
    );

    const isInvincible = this.activePowerUps.has('INVINCIBLE');

    for (const obs of this.obstacleManager.obstacles) {
      if (!obs.active) continue;

      // Quick distance culling
      if (Math.abs(obs.group.position.z - this.playerZ) > 10) continue;

      // If riding up a ramp wagon, ignore main wagon box collision if height is safe
      if (obs.hasRamp && obs.lane === this.currentLane && this.playerY >= 2.6) {
        continue;
      }

      // Check collision
      if (playerBox.intersectsBox(obs.collider)) {
        if (isInvincible) {
          // Smash obstacle into pieces!
          this.particleSystem.emitCrashExplosion(obs.group.position);
          soundEngine.playCrashSound();
          obs.active = false;
          this.obstacleManager.group.remove(obs.group);
          this.cameraShake = 0.4;
          this.score += 250;
        } else {
          // Deadly crash!
          this.triggerGameOver(obs);
          return;
        }
      }
    }
  }

  /**
   * Handle coin collection
   */
  private handleCoinCollected(pos: THREE.Vector3): void {
    const isDouble = this.activePowerUps.has('DOUBLE_SCORE');
    const coinValue = isDouble ? 2 : 1;

    this.coinsCollected += coinValue;
    this.score += 50 * coinValue * this.multiplier;

    soundEngine.playCoinSound();
    this.particleSystem.emitCoinSparkles(pos);
  }

  /**
   * Handle power-up collection
   */
  private handlePowerUpCollected(type: PowerUpType): void {
    soundEngine.playPowerUpSound();

    let duration = 10;
    if (type === 'INVINCIBLE') duration = 8;
    if (type === 'DOUBLE_SCORE') duration = 12;

    this.activePowerUps.set(type, { duration, maxDuration: duration });
    this.notifyPowerUps();
  }

  /**
   * Update active power-up timers
   */
  private updatePowerUps(delta: number): void {
    let changed = false;

    for (const [type, data] of this.activePowerUps.entries()) {
      data.duration -= delta;
      if (data.duration <= 0) {
        this.activePowerUps.delete(type);
        changed = true;
      } else {
        changed = true;
      }
    }

    if (changed) {
      this.notifyPowerUps();
    }
  }

  /**
   * Score and distance calculations
   */
  private updateScore(delta: number): void {
    const isDouble = this.activePowerUps.has('DOUBLE_SCORE');
    const multiplierBonus = isDouble ? 2 : 1;

    // Multiplier grows with speed
    const baseMult = 1 + Math.floor((this.currentSpeed - INITIAL_SPEED) / 10);
    this.multiplier = baseMult * multiplierBonus;

    // Distance points
    this.score += Math.round(this.currentSpeed * delta * 2.5 * this.multiplier);

    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem('wild_west_train_high_score', this.highScore.toString());
    }

    this.notifyStats();
  }

  /**
   * Procedural infinite world generation
   */
  private updateProceduralWorld(): void {
    // Check if player has passed through chunks
    const firstChunk = this.activeChunks[0];
    if (firstChunk && this.playerZ < firstChunk.startZ - CHUNK_LENGTH - 20) {
      // Remove old chunk
      this.scene.remove(firstChunk.chunk);
      this.activeChunks.shift();

      // Check if this chunk coincides with a station milestone
      const stationData = this.stationApproaching && this.currentStationData ? this.currentStationData : null;
      let newChunk: THREE.Group;

      if (this.stationApproaching && stationData) {
        // Build dedicated Wild West Station chunk with depot, platform and lanterns
        newChunk = this.envBuilder.createStationChunk(CHUNK_LENGTH, stationData.nome);
      } else {
        // Standard procedural desert track chunk
        newChunk = this.envBuilder.createChunk(CHUNK_LENGTH);
      }

      newChunk.position.z = this.nextChunkZ;
      this.scene.add(newChunk);
      this.activeChunks.push({ chunk: newChunk, startZ: this.nextChunkZ });

      // Spawn obstacles on this new chunk (suppressed or cleared if station is approaching)
      if (!this.stationApproaching) {
        const difficulty = this.currentSpeed / INITIAL_SPEED;
        this.populateChunkGameplay(this.nextChunkZ, difficulty);
      } else {
        // Safe station approach: No dangerous obstacle barricades, just a gentle line of golden coins on central track!
        this.collectibleManager.spawnCoinLine(0, this.nextChunkZ - 20, 8, false);
      }

      this.nextChunkZ -= CHUNK_LENGTH;
    }
  }

  /**
   * Populate obstacles and collectibles on a newly generated chunk
   */
  private populateChunkGameplay(chunkStartZ: number, difficulty: number): void {
    // Generate 3 obstacle clusters per chunk
    const zOffsets = [-20, -45, -70];

    zOffsets.forEach((offset, idx) => {
      const obstacleZ = chunkStartZ + offset;
      this.obstacleManager.spawnObstacleCluster(obstacleZ, difficulty);

      // Spawn coins along adjacent lanes
      const availableLanes = [-1, 0, 1];
      const coinLane = availableLanes[Math.floor(Math.random() * availableLanes.length)];

      const isArc = idx === 1; // Middle cluster has jumping arc
      this.collectibleManager.spawnCoinLine(coinLane, obstacleZ + 12, 6, isArc);

      // Rare power-up spawn (15% chance per cluster)
      if (Math.random() < 0.15) {
        const types: PowerUpType[] = ['MAGNET', 'INVINCIBLE', 'DOUBLE_SCORE'];
        const pType = types[Math.floor(Math.random() * types.length)];
        const pLane = availableLanes[Math.floor(Math.random() * availableLanes.length)];
        this.collectibleManager.spawnPowerUp(pLane, obstacleZ - 10, pType);
      }
    });
  }

  /**
   * Game Over sequence
   */
  private triggerGameOver(culprit: ObstacleInstance): void {
    this.gameState = 'GAME_OVER';
    soundEngine.stopTrainChuff();
    soundEngine.playCrashSound();

    // Particle explosion
    this.particleSystem.emitCrashExplosion(this.train.group.position);
    this.cameraShake = 0.8;

    // Train flips/derails dramatically
    this.train.group.rotation.z = Math.PI / 4;
    this.train.group.rotation.x = -Math.PI / 8;
    this.train.group.position.y += 0.5;

    let reason = 'Batida violenta nos trilhos!';
    if (culprit.type === 'CARGO_TRAIN') {
      reason = 'Colisão frontal com o Trem de Carga!';
    } else if (culprit.type === 'BOULDER') {
      reason = 'Desmoronamento de rocha no canyon!';
    } else if (culprit.type === 'CACTUS_BLOCK') {
      reason = 'Cacto gigante bloqueando a linha!';
    } else if (culprit.type === 'OVERHEAD_BEAM') {
      reason = 'Choque contra viga baixa do telégrafo!';
    } else if (culprit.type === 'WOODEN_BARRIER') {
      reason = 'Descarrilamento em obra ferroviária!';
    } else if (culprit.type === 'STATIONARY_WAGON') {
      reason = 'Impacto contra vagão de carga parado!';
    }

    const finalStats: GameStats = {
      score: this.score,
      coins: this.coinsCollected,
      distance: Math.round(this.distanceTraveled),
      speedMph: Math.round(this.currentSpeed * 1.5),
      highScore: this.highScore,
      multiplier: this.multiplier,
      deathReason: reason,
    };

    this.callbacks.onGameOver(finalStats);
  }

  private notifyStats(): void {
    this.callbacks.onStatsUpdate({
      score: this.score,
      coins: this.coinsCollected,
      distance: Math.round(this.distanceTraveled),
      speedMph: Math.round(this.currentSpeed * 1.5),
      highScore: this.highScore,
      multiplier: this.multiplier,
      deathReason: '',
    });
  }

  private notifyPowerUps(): void {
    const list: ActivePowerUp[] = [];
    for (const [type, data] of this.activePowerUps.entries()) {
      list.push({
        type,
        duration: Math.max(0, data.duration),
        maxDuration: data.maxDuration,
      });
    }
    this.callbacks.onActivePowerUpsChange(list);
  }

  private handleResize = (): void => {
    if (!this.container) return;
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  };

  public destroy(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    window.removeEventListener('resize', this.handleResize);
    soundEngine.stopTrainChuff();

    if (this.unsubscribeInput) {
      this.unsubscribeInput();
    }

    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
    this.renderer.dispose();
  }
}
