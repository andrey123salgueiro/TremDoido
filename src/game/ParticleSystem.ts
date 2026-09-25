/**
 * ParticleSystem.ts
 * High-performance procedural particle manager for steam smoke, fire embers,
 * dust clouds, coin collection sparkles, and crash splinters.
 */

import * as THREE from 'three';
import { BiomeType } from '../types/game';

interface SmokeParticle {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
  initialScale: number;
  maxScale: number;
}

interface SparkleParticle {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
}

interface AmbientParticle {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
  isBubble?: boolean;
  isSnow?: boolean;
}

export class ParticleSystem {
  public group: THREE.Group;
  private smokeParticles: SmokeParticle[] = [];
  private sparkles: SparkleParticle[] = [];
  private ambientParticles: AmbientParticle[] = [];
  private currentBiome: BiomeType = 'WESTERN';

  // Shared geometries and materials
  private smokeGeo: THREE.DodecahedronGeometry;
  private smokeMatLight: THREE.MeshLambertMaterial;
  private smokeMatDark: THREE.MeshLambertMaterial;
  private steamWhiteMat: THREE.MeshLambertMaterial;
  private emberMat: THREE.MeshBasicMaterial;
  private coinSparkleMat: THREE.MeshBasicMaterial;
  private splinterMat: THREE.MeshLambertMaterial;

  // Biome specific materials
  private snowMat: THREE.MeshBasicMaterial;
  private bubbleMat: THREE.MeshBasicMaterial;
  private cosmicStarMat: THREE.MeshBasicMaterial;
  private rainbowSparkleMat: THREE.MeshBasicMaterial;
  private cyberSparkMat: THREE.MeshBasicMaterial;
  private sugarSprinkleMat: THREE.MeshBasicMaterial;
  private portalEnergyMat: THREE.MeshBasicMaterial;

  constructor() {
    this.group = new THREE.Group();

    this.smokeGeo = new THREE.DodecahedronGeometry(0.35, 1);

    this.smokeMatLight = new THREE.MeshLambertMaterial({
      color: 0x999086,
      transparent: true,
      opacity: 0.65,
      depthWrite: false,
    });

    this.smokeMatDark = new THREE.MeshLambertMaterial({
      color: 0x383431,
      transparent: true,
      opacity: 0.75,
      depthWrite: false,
    });

    this.steamWhiteMat = new THREE.MeshLambertMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.88,
      depthWrite: false,
    });

    this.emberMat = new THREE.MeshBasicMaterial({
      color: 0xff7722,
    });

    this.coinSparkleMat = new THREE.MeshBasicMaterial({
      color: 0xffdd33,
    });

    this.splinterMat = new THREE.MeshLambertMaterial({
      color: 0x6e3c1b,
    });

    // Biome materials
    this.snowMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.85,
    });

    this.bubbleMat = new THREE.MeshBasicMaterial({
      color: 0x67e8f9,
      transparent: true,
      opacity: 0.7,
    });

    this.cosmicStarMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
    });

    this.rainbowSparkleMat = new THREE.MeshBasicMaterial({
      color: 0xf472b6,
    });

    this.cyberSparkMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
    });

    this.sugarSprinkleMat = new THREE.MeshBasicMaterial({
      color: 0xfbbf24,
    });

    this.portalEnergyMat = new THREE.MeshBasicMaterial({
      color: 0xa855f7,
    });
  }

  public setBiome(biome: BiomeType): void {
    this.currentBiome = biome;
  }

  /**
   * Emit biome specific ambient atmospheric particles around player
   */
  public emitBiomeAmbient(playerPos: THREE.Vector3, trainSpeed: number): void {
    if (this.ambientParticles.length > 50) return; // Performance cap

    const x = playerPos.x + (Math.random() - 0.5) * 26;
    const y = 0.5 + Math.random() * 8;
    const z = playerPos.z - 10 - Math.random() * 35; // Ahead of train

    let mat = this.cosmicStarMat;
    let size = 0.08 + Math.random() * 0.12;
    let isBubble = false;
    let isSnow = false;
    let vel = new THREE.Vector3(0, 0, 0);
    let maxLife = 2.5 + Math.random() * 1.5;

    switch (this.currentBiome) {
      case 'GALAXY':
        mat = Math.random() > 0.4 ? this.cosmicStarMat : this.rainbowSparkleMat;
        vel.set((Math.random() - 0.5) * 0.6, (Math.random() - 0.5) * 0.6, (Math.random() - 0.5) * 0.6);
        break;

      case 'UNICORN':
        mat = Math.random() > 0.5 ? this.rainbowSparkleMat : this.sugarSprinkleMat;
        vel.set((Math.random() - 0.5) * 0.8, 0.4 + Math.random() * 0.8, 0.2);
        break;

      case 'VOLCANO':
        mat = this.emberMat;
        vel.set((Math.random() - 0.5) * 1.5, 2.0 + Math.random() * 3.0, (Math.random() - 0.5) * 1.5);
        size = 0.1 + Math.random() * 0.15;
        break;

      case 'ICE_AGE':
        mat = this.snowMat;
        vel.set((Math.random() - 0.5) * 2.0, -1.8 - Math.random() * 1.5, (Math.random() - 0.5) * 1.0);
        isSnow = true;
        size = 0.12 + Math.random() * 0.14;
        break;

      case 'CYBERPUNK':
        mat = Math.random() > 0.5 ? this.cyberSparkMat : this.rainbowSparkleMat;
        vel.set((Math.random() - 0.5) * 2.5, (Math.random() - 0.5) * 2.0, (Math.random() - 0.5) * 2.0);
        maxLife = 1.0 + Math.random() * 0.8;
        break;

      case 'UNDERWATER':
        mat = this.bubbleMat;
        vel.set((Math.random() - 0.5) * 0.5, 1.8 + Math.random() * 2.2, (Math.random() - 0.5) * 0.5);
        isBubble = true;
        size = 0.15 + Math.random() * 0.22;
        break;

      case 'CANDY_LAND':
        mat = this.sugarSprinkleMat;
        vel.set((Math.random() - 0.5) * 1.2, -0.8 - Math.random() * 1.0, 0);
        size = 0.12 + Math.random() * 0.1;
        break;

      case 'WESTERN':
      default:
        if (Math.random() > 0.3) return; // sparser in desert
        mat = this.emberMat;
        vel.set((Math.random() - 0.5) * 1.2, 0.4 + Math.random() * 0.8, (Math.random() - 0.5) * 1.0);
        break;
    }

    const geo = isBubble
      ? new THREE.SphereGeometry(size, 8, 8)
      : new THREE.BoxGeometry(size, size, size);

    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    this.group.add(mesh);

    this.ambientParticles.push({
      mesh,
      velocity: vel,
      life: 0,
      maxLife,
      isBubble,
      isSnow,
    });
  }

  /**
   * Dramatic burst of portal energy when passing through station portal into next biome
   */
  public emitPortalWarp(position: THREE.Vector3, portalColor: number = 0xa855f7): void {
    const count = 40;
    const warpMat = new THREE.MeshBasicMaterial({ color: portalColor });
    const starGeo = new THREE.OctahedronGeometry(0.25, 0);

    for (let i = 0; i < count; i++) {
      const mesh = new THREE.Mesh(starGeo, warpMat);
      mesh.position.copy(position);
      mesh.position.x += (Math.random() - 0.5) * 3.5;
      mesh.position.y += Math.random() * 4.0;
      mesh.position.z += (Math.random() - 0.5) * 2.0;

      const angle = Math.random() * Math.PI * 2;
      const speed = 6.0 + Math.random() * 8.0;

      this.group.add(mesh);
      this.sparkles.push({
        mesh,
        velocity: new THREE.Vector3(
          Math.cos(angle) * speed,
          (Math.random() - 0.5) * 6.0,
          Math.sin(angle) * speed - 10.0 // streaks backwards
        ),
        life: 0,
        maxLife: 1.2 + Math.random() * 0.6,
      });
    }
  }

  /**
   * Emit a puff of smoke from the smokestack
   */
  public emitSmokestackPuff(position: THREE.Vector3, trainSpeed: number): void {
    const isDark = Math.random() > 0.4;
    const mesh = new THREE.Mesh(this.smokeGeo, isDark ? this.smokeMatDark : this.smokeMatLight);

    mesh.position.copy(position);
    mesh.position.x += (Math.random() - 0.5) * 0.15;
    mesh.position.y += (Math.random() - 0.5) * 0.1;
    mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);

    const initScale = 0.4 + Math.random() * 0.25;
    mesh.scale.setScalar(initScale);
    this.group.add(mesh);

    this.smokeParticles.push({
      mesh,
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 0.8,
        1.6 + Math.random() * 1.2,
        trainSpeed * 0.35 + (Math.random() - 0.5) * 1.5 // Drifts backwards relative to train
      ),
      life: 0,
      maxLife: 0.85 + Math.random() * 0.4,
      initialScale: initScale,
      maxScale: 1.8 + Math.random() * 1.2,
    });

    // Occasionally emit an ember
    if (Math.random() > 0.6) {
      const emberGeo = new THREE.SphereGeometry(0.06, 6, 6);
      const ember = new THREE.Mesh(emberGeo, this.emberMat);
      ember.position.copy(position);
      this.group.add(ember);

      this.sparkles.push({
        mesh: ember,
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 1.5,
          2.5 + Math.random() * 1.8,
          trainSpeed * 0.4 + Math.random() * 2.0
        ),
        life: 0,
        maxLife: 0.5 + Math.random() * 0.3,
      });
    }
  }

  /**
   * Explosive burst of billowing white steam when train horn is pulled
   */
  public emitHornSteamBurst(position: THREE.Vector3, trainSpeed: number): void {
    const steamCount = 14;
    for (let i = 0; i < steamCount; i++) {
      const mesh = new THREE.Mesh(this.smokeGeo, this.steamWhiteMat);
      mesh.position.copy(position);
      mesh.position.x += (Math.random() - 0.5) * 0.4;
      mesh.position.y += Math.random() * 0.3;
      mesh.position.z += (Math.random() - 0.5) * 0.3;
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);

      const initScale = 0.6 + Math.random() * 0.5;
      mesh.scale.setScalar(initScale);
      this.group.add(mesh);

      // Shoots high up into the air with intense steam pressure
      this.smokeParticles.push({
        mesh,
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 2.8,
          4.5 + Math.random() * 3.8,
          trainSpeed * 0.3 + (Math.random() - 0.5) * 2.0
        ),
        life: 0,
        maxLife: 1.1 + Math.random() * 0.5,
        initialScale: initScale,
        maxScale: 2.8 + Math.random() * 1.5,
      });
    }
  }

  /**
   * Burst of golden stars when coin is collected
   */
  public emitCoinSparkles(position: THREE.Vector3): void {
    const count = 7;
    const starGeo = new THREE.BoxGeometry(0.12, 0.12, 0.12);

    for (let i = 0; i < count; i++) {
      const mesh = new THREE.Mesh(starGeo, this.coinSparkleMat);
      mesh.position.copy(position);
      this.group.add(mesh);

      const angle = (i / count) * Math.PI * 2;
      const speed = 2.5 + Math.random() * 2;

      this.sparkles.push({
        mesh,
        velocity: new THREE.Vector3(
          Math.cos(angle) * speed,
          1.8 + Math.random() * 2.5,
          Math.sin(angle) * speed
        ),
        life: 0,
        maxLife: 0.4 + Math.random() * 0.25,
      });
    }
  }

  /**
   * Burst of debris when hitting an obstacle
   */
  public emitCrashExplosion(position: THREE.Vector3): void {
    const count = 25;
    for (let i = 0; i < count; i++) {
      const isWood = Math.random() > 0.4;
      const geo = isWood
        ? new THREE.BoxGeometry(0.15, 0.15, 0.6 + Math.random() * 0.5)
        : new THREE.DodecahedronGeometry(0.25 + Math.random() * 0.2);

      const mesh = new THREE.Mesh(geo, isWood ? this.splinterMat : this.smokeMatDark);
      mesh.position.copy(position);
      mesh.position.x += (Math.random() - 0.5) * 1.5;
      mesh.position.y += Math.random() * 1.2;
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      this.group.add(mesh);

      this.sparkles.push({
        mesh,
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 14,
          4 + Math.random() * 9,
          (Math.random() - 0.5) * 12
        ),
        life: 0,
        maxLife: 1.2 + Math.random() * 0.6,
      });
    }
  }

  /**
   * Advance particles
   */
  public update(delta: number): void {
    // Update smoke
    for (let i = this.smokeParticles.length - 1; i >= 0; i--) {
      const p = this.smokeParticles[i];
      p.life += delta;

      if (p.life >= p.maxLife) {
        this.group.remove(p.mesh);
        p.mesh.geometry.dispose();
        this.smokeParticles.splice(i, 1);
        continue;
      }

      const progress = p.life / p.maxLife;

      // Position update
      p.mesh.position.x += p.velocity.x * delta;
      p.mesh.position.y += p.velocity.y * delta;
      p.mesh.position.z += p.velocity.z * delta;

      // Expansion
      const currentScale = THREE.MathUtils.lerp(p.initialScale, p.maxScale, progress);
      p.mesh.scale.setScalar(currentScale);

      // Fade out
      p.mesh.rotation.y += delta * 0.5;
      p.mesh.rotation.z += delta * 0.3;
    }

    // Update sparkles/debris
    for (let i = this.sparkles.length - 1; i >= 0; i--) {
      const s = this.sparkles[i];
      s.life += delta;

      if (s.life >= s.maxLife) {
        this.group.remove(s.mesh);
        this.sparkles.splice(i, 1);
        continue;
      }

      s.mesh.position.x += s.velocity.x * delta;
      s.mesh.position.y += s.velocity.y * delta;
      s.mesh.position.z += s.velocity.z * delta;

      // Gravity pulls debris down
      s.velocity.y -= 14 * delta;

      s.mesh.rotation.x += delta * 5;
      s.mesh.rotation.y += delta * 4;

      const progress = s.life / s.maxLife;
      s.mesh.scale.setScalar(Math.max(0.01, 1 - progress));
    }

    // Update biome ambient particles (snow, bubbles, stars, embers, etc.)
    for (let i = this.ambientParticles.length - 1; i >= 0; i--) {
      const a = this.ambientParticles[i];
      a.life += delta;

      if (a.life >= a.maxLife) {
        this.group.remove(a.mesh);
        this.ambientParticles.splice(i, 1);
        continue;
      }

      a.mesh.position.x += a.velocity.x * delta;
      a.mesh.position.y += a.velocity.y * delta;
      a.mesh.position.z += a.velocity.z * delta;

      if (a.isBubble) {
        // Slight horizontal wobble
        a.mesh.position.x += Math.sin(a.life * 4) * 0.01;
      } else if (a.isSnow) {
        // Gentle sway
        a.mesh.position.x += Math.cos(a.life * 2.5) * 0.02;
      }

      const progress = a.life / a.maxLife;
      if (progress > 0.7) {
        const fade = (1 - progress) / 0.3;
        a.mesh.scale.setScalar(Math.max(0.01, fade));
      }
    }
  }

  public reset(): void {
    this.smokeParticles.forEach((p) => this.group.remove(p.mesh));
    this.sparkles.forEach((s) => this.group.remove(s.mesh));
    this.ambientParticles.forEach((a) => this.group.remove(a.mesh));
    this.smokeParticles = [];
    this.sparkles = [];
    this.ambientParticles = [];
  }
}
