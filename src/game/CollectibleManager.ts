/**
 * CollectibleManager.ts
 * Spawns and manages spinning gold coins and Wild West power-ups:
 * - Gold Coins (lines, jumping arcs, and roof clusters)
 * - Golden Horseshoe (Coin Magnet)
 * - Sheriff's Star (Invincible Ghost Train)
 * - Saloon Tonic (2x Multiplier)
 */

import * as THREE from 'three';
import { LANES } from './EnvironmentBuilder';
import { PowerUpType, BiomeType } from '../types/game';
import { BIOME_CONFIGS } from '../config/stationsConfig';

export interface CoinInstance {
  mesh: THREE.Mesh;
  lane: number;
  initialY: number;
  active: boolean;
}

export interface PowerUpItemInstance {
  type: PowerUpType;
  group: THREE.Group;
  lane: number;
  active: boolean;
}

export class CollectibleManager {
  public group: THREE.Group;
  public coins: CoinInstance[] = [];
  public powerUps: PowerUpItemInstance[] = [];

  // Materials & Geometries
  private coinGeo: THREE.CylinderGeometry;
  private coinMat: THREE.MeshStandardMaterial;

  private horseshoeMat: THREE.MeshStandardMaterial;
  private starMat: THREE.MeshStandardMaterial;
  private bottleMat: THREE.MeshStandardMaterial;

  constructor() {
    this.group = new THREE.Group();

    // High quality gold coin
    this.coinGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.08, 16);
    this.coinMat = new THREE.MeshStandardMaterial({
      color: 0xffcc00,
      metalness: 0.9,
      roughness: 0.25,
      emissive: 0x443300,
    });

    this.horseshoeMat = new THREE.MeshStandardMaterial({
      color: 0xeeaa22,
      metalness: 0.95,
      roughness: 0.2,
      emissive: 0x664400,
    });

    this.starMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.8,
      roughness: 0.2,
      emissive: 0x886600,
    });

    this.bottleMat = new THREE.MeshStandardMaterial({
      color: 0xcc6611,
      roughness: 0.3,
      metalness: 0.4,
      transparent: true,
      opacity: 0.85,
    });
  }

  public setBiome(biome: BiomeType): void {
    const config = BIOME_CONFIGS[biome];
    if (config) {
      this.coinMat.color.setHex(config.collectibleColor);
      this.coinMat.emissive.setHex(config.collectibleEmissive);
    }
  }

  /**
   * Spawn a line or arc of gold coins
   */
  public spawnCoinLine(lane: number, startZ: number, count: number = 6, arc: boolean = false): void {
    const x = LANES[lane];
    const spacing = 2.4;

    for (let i = 0; i < count; i++) {
      const z = startZ - i * spacing;
      let y = 1.0;

      // Parabolic jump arc: rises in the middle
      if (arc) {
        const t = (i / (count - 1)) * 2 - 1; // -1 to 1
        y = 1.0 + (1 - t * t) * 2.2; // peak at ~3.2 units height
      }

      const coin = new THREE.Mesh(this.coinGeo, this.coinMat);
      coin.rotation.x = Math.PI / 2;
      coin.position.set(x, y, z);
      coin.castShadow = true;
      this.group.add(coin);

      this.coins.push({
        mesh: coin,
        lane,
        initialY: y,
        active: true,
      });
    }
  }

  /**
   * Spawn a line of coins along the roof of a wagon
   */
  public spawnRoofCoins(lane: number, wagonZ: number, wagonLength: number): void {
    const x = LANES[lane];
    const count = 4;
    const startZ = wagonZ + wagonLength * 0.3;
    const step = (wagonLength * 0.6) / count;

    for (let i = 0; i < count; i++) {
      const z = startZ - i * step;
      const coin = new THREE.Mesh(this.coinGeo, this.coinMat);
      coin.rotation.x = Math.PI / 2;
      coin.position.set(x, 3.5, z); // Above roof
      this.group.add(coin);

      this.coins.push({
        mesh: coin,
        lane,
        initialY: 3.5,
        active: true,
      });
    }
  }

  /**
   * Spawn a rare power-up item
   */
  public spawnPowerUp(lane: number, z: number, type: PowerUpType): void {
    const group = new THREE.Group();
    const x = LANES[lane];

    if (type === 'MAGNET') {
      // Golden Horseshoe
      const torusGeo = new THREE.TorusGeometry(0.45, 0.12, 8, 16, Math.PI * 1.5);
      const shoe = new THREE.Mesh(torusGeo, this.horseshoeMat);
      shoe.rotation.z = Math.PI * 0.75;
      group.add(shoe);
    } else if (type === 'INVINCIBLE') {
      // 6-Point Sheriff's Star Badge
      const starGeo = new THREE.OctahedronGeometry(0.5, 0);
      const star = new THREE.Mesh(starGeo, this.starMat);
      star.scale.set(1.2, 1.2, 0.4);
      group.add(star);
    } else if (type === 'DOUBLE_SCORE') {
      // Vintage Elixir / Tonic Bottle
      const botBody = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.7, 10), this.bottleMat);
      const botNeck = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.3, 10), this.bottleMat);
      botNeck.position.y = 0.5;
      group.add(botBody);
      group.add(botNeck);
    }

    // Floating aura light
    const aura = new THREE.PointLight(
      type === 'MAGNET' ? 0xffbb22 : type === 'INVINCIBLE' ? 0xffffff : 0xff7711,
      1.5,
      6
    );
    group.add(aura);

    group.position.set(x, 1.4, z);
    this.group.add(group);

    this.powerUps.push({
      type,
      group,
      lane,
      active: true,
    });
  }

  /**
   * Update coin spinning, hover bobbing, and magnet attraction
   */
  public update(
    delta: number,
    playerPos: THREE.Vector3,
    isMagnetActive: boolean,
    onCoinCollected: (pos: THREE.Vector3) => void,
    onPowerUpCollected: (type: PowerUpType) => void
  ): void {
    const time = performance.now() * 0.003;

    // Coins update
    for (let i = this.coins.length - 1; i >= 0; i--) {
      const c = this.coins[i];
      if (!c.active) continue;

      // Continuous spin
      c.mesh.rotation.y += delta * 3.5;
      c.mesh.position.y = c.initialY + Math.sin(time + c.mesh.position.z * 0.5) * 0.12;

      // Distance to player
      const dist = c.mesh.position.distanceTo(playerPos);

      // Magnet pull effect
      if (isMagnetActive && dist < 16 && c.mesh.position.z < playerPos.z + 2) {
        c.mesh.position.lerp(playerPos, delta * 8.5);
      }

      // Check pickup collision
      if (dist < 1.7) {
        c.active = false;
        onCoinCollected(c.mesh.position.clone());
        this.group.remove(c.mesh);
        this.coins.splice(i, 1);
        continue;
      }

      // Despawn if far behind player
      if (c.mesh.position.z > playerPos.z + 18) {
        c.active = false;
        this.group.remove(c.mesh);
        this.coins.splice(i, 1);
      }
    }

    // Power-ups update
    for (let i = this.powerUps.length - 1; i >= 0; i--) {
      const p = this.powerUps[i];
      if (!p.active) continue;

      p.group.rotation.y += delta * 2.2;
      p.group.position.y = 1.4 + Math.sin(time * 1.5) * 0.18;

      const dist = p.group.position.distanceTo(playerPos);
      if (dist < 2.0) {
        p.active = false;
        onPowerUpCollected(p.type);
        this.group.remove(p.group);
        this.powerUps.splice(i, 1);
        continue;
      }

      if (p.group.position.z > playerPos.z + 18) {
        p.active = false;
        this.group.remove(p.group);
        this.powerUps.splice(i, 1);
      }
    }
  }

  public reset(): void {
    this.coins.forEach((c) => this.group.remove(c.mesh));
    this.powerUps.forEach((p) => this.group.remove(p.group));
    this.coins = [];
    this.powerUps = [];
  }
}
