/**
 * ObstacleManager.ts
 * Spawns and manages static & dynamic railroad obstacles:
 * - Boulders and fallen desert cacti
 * - Wooden railway barricades
 * - Oncoming enemy/cargo trains steaming towards player
 * - Stationary cargo boxcars (some with ramps to ride over the top)
 * - Overhead telegraph / bridge clearance beams (slide under)
 */

import * as THREE from 'three';
import { LANES } from './EnvironmentBuilder';
import { ObstacleType, BiomeType } from '../types/game';

export interface ObstacleInstance {
  type: ObstacleType;
  lane: number; // -1, 0, 1
  group: THREE.Group;
  collider: THREE.Box3;
  width: number;
  height: number;
  depth: number;
  hasRamp?: boolean;
  rampCollider?: THREE.Box3;
  roofCollider?: THREE.Box3;
  speedZ?: number; // For dynamic oncoming trains
  active: boolean;
}

export class ObstacleManager {
  public group: THREE.Group;
  public obstacles: ObstacleInstance[] = [];

  // Materials
  private woodMat: THREE.MeshStandardMaterial;
  private redWoodMat: THREE.MeshStandardMaterial;
  private rockMat: THREE.MeshStandardMaterial;
  private cactusMat: THREE.MeshStandardMaterial;
  private ironMat: THREE.MeshStandardMaterial;
  private rustMat: THREE.MeshStandardMaterial;
  private yellowSignMat: THREE.MeshStandardMaterial;

  constructor() {
    this.group = new THREE.Group();

    this.woodMat = new THREE.MeshStandardMaterial({
      color: 0x4d321d,
      roughness: 0.85,
    });

    this.redWoodMat = new THREE.MeshStandardMaterial({
      color: 0x7a221b,
      roughness: 0.8,
    });

    this.rockMat = new THREE.MeshStandardMaterial({
      color: 0x9e5239,
      roughness: 0.9,
    });

    this.cactusMat = new THREE.MeshStandardMaterial({
      color: 0x245729,
      roughness: 0.8,
    });

    this.ironMat = new THREE.MeshStandardMaterial({
      color: 0x222226,
      roughness: 0.6,
      metalness: 0.7,
    });

    this.rustMat = new THREE.MeshStandardMaterial({
      color: 0x5a2d1a,
      roughness: 0.9,
      metalness: 0.2,
    });

    this.yellowSignMat = new THREE.MeshStandardMaterial({
      color: 0xdd9922,
      roughness: 0.5,
    });
  }

  /**
   * Update obstacle materials to match active biome
   */
  public setBiome(biome: BiomeType): void {
    // Reset emissive values to clean default
    this.rockMat.emissive.setHex(0x000000);
    this.woodMat.emissive.setHex(0x000000);
    this.redWoodMat.emissive.setHex(0x000000);
    this.cactusMat.emissive.setHex(0x000000);
    this.ironMat.emissive.setHex(0x000000);
    this.rustMat.emissive.setHex(0x000000);
    this.yellowSignMat.emissive.setHex(0x000000);

    switch (biome) {
      case 'GALAXY':
        // Obstáculos clareados com excelente contraste, luminosidade estelar e brilho suave
        this.rockMat.color.setHex(0xc084fc); // Asteroides/rochas em lilás/violeta estelar bem claro
        this.rockMat.emissive.setHex(0x4c1d95); // Leve luminescência cósmica
        this.woodMat.color.setHex(0x818cf8); // Postes, suportes e rampas em índigo-néon claro
        this.woodMat.emissive.setHex(0x312e81);
        this.redWoodMat.color.setHex(0x38bdf8); // Tábuas de aviso e vigas em ciano elétrico brilhante
        this.redWoodMat.emissive.setHex(0x0284c7);
        this.cactusMat.color.setHex(0x67e8f9); // Barreiras de plasma / espinhos de cristal celeste
        this.cactusMat.emissive.setHex(0x0891b2);
        this.ironMat.color.setHex(0xa5b4fc); // Estrutura metálica e rodas em prateado azulado claro
        this.ironMat.emissive.setHex(0x1e1b4b);
        this.rustMat.color.setHex(0x8b5cf6); // Vagões de carga em violeta espacial vívido e nítido
        this.rustMat.emissive.setHex(0x3b0764);
        this.yellowSignMat.color.setHex(0xfde047); // Placas amarelas elétricas fluorescentes
        this.yellowSignMat.emissive.setHex(0x854d0e);
        break;

      case 'UNICORN':
        this.rockMat.color.setHex(0xf472b6);
        this.woodMat.color.setHex(0xfbcfe8);
        this.redWoodMat.color.setHex(0xf43f5e);
        this.cactusMat.color.setHex(0x86efac);
        this.ironMat.color.setHex(0xfef08a);
        this.rustMat.color.setHex(0xf472b6);
        this.yellowSignMat.color.setHex(0xfbbf24);
        break;

      case 'VOLCANO':
        this.rockMat.color.setHex(0x292524);
        this.woodMat.color.setHex(0x44403c);
        this.redWoodMat.color.setHex(0xef4444);
        this.cactusMat.color.setHex(0xf97316);
        this.ironMat.color.setHex(0x78350f);
        this.rustMat.color.setHex(0x571c0c);
        this.yellowSignMat.color.setHex(0xf97316);
        break;

      case 'ICE_AGE':
        this.rockMat.color.setHex(0x7dd3fc);
        this.woodMat.color.setHex(0x0369a1);
        this.redWoodMat.color.setHex(0x38bdf8);
        this.cactusMat.color.setHex(0xbae6fd);
        this.ironMat.color.setHex(0x0c4a6e);
        this.rustMat.color.setHex(0x0284c7);
        this.yellowSignMat.color.setHex(0x67e8f9);
        break;

      case 'CYBERPUNK':
        this.rockMat.color.setHex(0x18181b);
        this.woodMat.color.setHex(0x27272a);
        this.redWoodMat.color.setHex(0xf43f5e);
        this.cactusMat.color.setHex(0x06b6d4);
        this.ironMat.color.setHex(0x312e81);
        this.rustMat.color.setHex(0x3f3f46);
        this.yellowSignMat.color.setHex(0xf43f5e);
        break;

      case 'UNDERWATER':
        this.rockMat.color.setHex(0x0e7490);
        this.woodMat.color.setHex(0x134e4a);
        this.redWoodMat.color.setHex(0x0d9488);
        this.cactusMat.color.setHex(0x2dd4bf);
        this.ironMat.color.setHex(0x115e59);
        this.rustMat.color.setHex(0x0f766e);
        this.yellowSignMat.color.setHex(0x2dd4bf);
        break;

      case 'CANDY_LAND':
        this.rockMat.color.setHex(0xf43f5e);
        this.woodMat.color.setHex(0x451a03);
        this.redWoodMat.color.setHex(0xef4444);
        this.cactusMat.color.setHex(0xec4899);
        this.ironMat.color.setHex(0xf59e0b);
        this.rustMat.color.setHex(0xdb2777);
        this.yellowSignMat.color.setHex(0xfbbf24);
        break;

      case 'WESTERN':
      default:
        this.rockMat.color.setHex(0x9e5239);
        this.woodMat.color.setHex(0x4d321d);
        this.redWoodMat.color.setHex(0x7a221b);
        this.cactusMat.color.setHex(0x245729);
        this.ironMat.color.setHex(0x222226);
        this.rustMat.color.setHex(0x5a2d1a);
        this.yellowSignMat.color.setHex(0xdd9922);
        break;
    }
  }

  /**
   * Spawn a procedural obstacle cluster ahead of the player at target Z
   */
  public spawnObstacleCluster(targetZ: number, difficultyFactor: number): void {
    const laneChoices = [-1, 0, 1];
    const roll = Math.random();

    // With higher difficulty, allow 2-lane blocks or oncoming trains
    if (roll < 0.28) {
      // 1. Wooden Railway Construction Barricade
      const lane = laneChoices[Math.floor(Math.random() * laneChoices.length)];
      this.createBarricade(lane, targetZ);
    } else if (roll < 0.52) {
      // 2. Giant Boulder / Fallen Cactus
      const lane = laneChoices[Math.floor(Math.random() * laneChoices.length)];
      if (Math.random() > 0.5) {
        this.createBoulder(lane, targetZ);
      } else {
        this.createCactusBarrier(lane, targetZ);
      }
    } else if (roll < 0.75) {
      // 3. Stationary Boxcar (50% chance to have a wooden ramp to run onto!)
      const lane = laneChoices[Math.floor(Math.random() * laneChoices.length)];
      const hasRamp = Math.random() > 0.45;
      this.createStationaryWagon(lane, targetZ, hasRamp);
    } else if (roll < 0.88) {
      // 4. Oncoming Cargo Train (dynamic moving obstacle!)
      const lane = laneChoices[Math.floor(Math.random() * laneChoices.length)];
      this.createOncomingTrain(lane, targetZ, difficultyFactor);
    } else {
      // 5. Overhead clearance beam (requires sliding or lane change)
      const lane = laneChoices[Math.floor(Math.random() * laneChoices.length)];
      this.createOverheadBeam(lane, targetZ);
    }

    // High difficulty: occasionally add a secondary obstacle in an adjacent lane
    if (difficultyFactor > 1.4 && Math.random() < 0.35) {
      const freeLanes = laneChoices.filter(
        (l) => !this.obstacles.some((o) => o.active && o.lane === l && Math.abs(o.group.position.z - targetZ) < 8)
      );
      if (freeLanes.length > 1) {
        // Leave at least ONE lane strictly open for skill escape!
        const secondLane = freeLanes[Math.floor(Math.random() * freeLanes.length)];
        this.createBarricade(secondLane, targetZ);
      }
    }
  }

  /**
   * 1. Wooden Railway Barricade with "DANGER" sign
   */
  private createBarricade(lane: number, z: number): void {
    const group = new THREE.Group();
    const x = LANES[lane];

    // Left and right wooden posts
    const postGeo = new THREE.BoxGeometry(0.2, 1.8, 0.2);
    const p1 = new THREE.Mesh(postGeo, this.woodMat);
    p1.position.set(-1.0, 0.9, 0);
    p1.castShadow = true;
    group.add(p1);

    const p2 = new THREE.Mesh(postGeo, this.woodMat);
    p2.position.set(1.0, 0.9, 0);
    p2.castShadow = true;
    group.add(p2);

    // Diagonal support legs
    [-1.0, 1.0].forEach((posX) => {
      const legGeo = new THREE.BoxGeometry(0.15, 1.6, 0.15);
      const leg = new THREE.Mesh(legGeo, this.woodMat);
      leg.position.set(posX, 0.8, -0.4);
      leg.rotation.x = -0.5;
      group.add(leg);
    });

    // Horizontal warning planks
    const plankGeo = new THREE.BoxGeometry(2.3, 0.3, 0.08);
    [0.6, 1.2].forEach((posY) => {
      const plank = new THREE.Mesh(plankGeo, this.redWoodMat);
      plank.position.set(0, posY, 0);
      plank.castShadow = true;
      group.add(plank);
    });

    // Warning sign in center
    const signGeo = new THREE.BoxGeometry(1.2, 0.5, 0.06);
    const sign = new THREE.Mesh(signGeo, this.yellowSignMat);
    sign.position.set(0, 1.45, 0.05);
    group.add(sign);

    group.position.set(x, 0, z);
    this.group.add(group);

    this.obstacles.push({
      type: 'WOODEN_BARRIER',
      lane,
      group,
      collider: new THREE.Box3(),
      width: 2.3,
      height: 1.8,
      depth: 1.0,
      active: true,
    });
  }

  /**
   * 2. Giant Desert Boulder
   */
  private createBoulder(lane: number, z: number): void {
    const group = new THREE.Group();
    const x = LANES[lane];

    const geo = new THREE.DodecahedronGeometry(1.3, 1);
    const rock = new THREE.Mesh(geo, this.rockMat);
    rock.position.set(0, 1.1, 0);
    rock.scale.set(1.1, 0.9, 1.1);
    rock.rotation.set(Math.random(), Math.random(), 0);
    rock.castShadow = true;
    group.add(rock);

    group.position.set(x, 0, z);
    this.group.add(group);

    this.obstacles.push({
      type: 'BOULDER',
      lane,
      group,
      collider: new THREE.Box3(),
      width: 2.2,
      height: 2.0,
      depth: 2.0,
      active: true,
    });
  }

  /**
   * 3. Fallen Cactus Barrier
   */
  private createCactusBarrier(lane: number, z: number): void {
    const group = new THREE.Group();
    const x = LANES[lane];

    // Horizontal fallen trunk across track
    const trunkGeo = new THREE.CylinderGeometry(0.35, 0.4, 2.6, 8);
    const trunk = new THREE.Mesh(trunkGeo, this.cactusMat);
    trunk.rotation.z = Math.PI / 2;
    trunk.position.set(0, 0.55, 0);
    trunk.castShadow = true;
    group.add(trunk);

    // Spiky broken branches
    const branchGeo = new THREE.CylinderGeometry(0.2, 0.2, 1.0, 6);
    const b1 = new THREE.Mesh(branchGeo, this.cactusMat);
    b1.position.set(-0.7, 0.9, 0.2);
    b1.rotation.x = 0.6;
    group.add(b1);

    group.position.set(x, 0, z);
    this.group.add(group);

    this.obstacles.push({
      type: 'CACTUS_BLOCK',
      lane,
      group,
      collider: new THREE.Box3(),
      width: 2.6,
      height: 1.4,
      depth: 1.2,
      active: true,
    });
  }

  /**
   * 4. Stationary Cargo Boxcar (with optional wooden ramp)
   */
  private createStationaryWagon(lane: number, z: number, hasRamp: boolean): void {
    const group = new THREE.Group();
    const x = LANES[lane];

    const wagonLength = 8.0;
    const wagonWidth = 2.1;
    const wagonHeight = 2.5;

    // Wagon Box Body
    const bodyGeo = new THREE.BoxGeometry(wagonWidth, wagonHeight, wagonLength);
    const body = new THREE.Mesh(bodyGeo, this.rustMat);
    body.position.set(0, wagonHeight / 2 + 0.6, 0);
    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);

    // Roof walkway planks
    const roofGeo = new THREE.BoxGeometry(wagonWidth + 0.1, 0.1, wagonLength + 0.1);
    const roof = new THREE.Mesh(roofGeo, this.woodMat);
    roof.position.set(0, wagonHeight + 0.65, 0);
    group.add(roof);

    // Undercarriage wheels
    const wheelGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.15, 12);
    [-wagonLength * 0.35, wagonLength * 0.35].forEach((posZ) => {
      [-wagonWidth * 0.45, wagonWidth * 0.45].forEach((posX) => {
        const w = new THREE.Mesh(wheelGeo, this.ironMat);
        w.rotation.z = Math.PI / 2;
        w.position.set(posX, 0.4, posZ);
        group.add(w);
      });
    });

    // Wooden Ramp in front allowing player to ride onto the roof!
    let rampCollider: THREE.Box3 | undefined;
    let roofCollider: THREE.Box3 | undefined;

    if (hasRamp) {
      const rampLength = 6.0;
      const rampGeo = new THREE.BoxGeometry(wagonWidth, 0.15, rampLength);
      const ramp = new THREE.Mesh(rampGeo, this.woodMat);
      // Slope up from ground (Z: wagonLength/2 + rampLength/2) to wagon roof
      ramp.position.set(0, (wagonHeight + 0.6) / 2 + 0.1, wagonLength / 2 + rampLength / 2 - 0.2);
      // Angle: rise wagonHeight / run rampLength
      const angle = Math.atan2(wagonHeight + 0.3, rampLength);
      ramp.rotation.x = angle;
      ramp.castShadow = true;
      group.add(ramp);

      // Support pillars under ramp
      const pillarGeo = new THREE.BoxGeometry(0.15, 1.4, 0.15);
      const pL = new THREE.Mesh(pillarGeo, this.woodMat);
      pL.position.set(-wagonWidth * 0.4, 0.7, wagonLength / 2 + rampLength * 0.4);
      group.add(pL);
      const pR = new THREE.Mesh(pillarGeo, this.woodMat);
      pR.position.set(wagonWidth * 0.4, 0.7, wagonLength / 2 + rampLength * 0.4);
      group.add(pR);

      rampCollider = new THREE.Box3();
      roofCollider = new THREE.Box3();
    }

    group.position.set(x, 0, z);
    this.group.add(group);

    this.obstacles.push({
      type: hasRamp ? 'RAMP_WAGON' : 'STATIONARY_WAGON',
      lane,
      group,
      collider: new THREE.Box3(),
      width: wagonWidth,
      height: wagonHeight + 0.6,
      depth: wagonLength + (hasRamp ? 6.0 : 0),
      hasRamp,
      rampCollider,
      roofCollider,
      active: true,
    });
  }

  /**
   * 5. Oncoming Wild West Cargo Train (dynamic moving obstacle!)
   */
  private createOncomingTrain(lane: number, z: number, difficultyFactor: number): void {
    const group = new THREE.Group();
    const x = LANES[lane];

    // Engine boiler
    const boilerGeo = new THREE.CylinderGeometry(0.8, 0.8, 4.0, 16);
    const boiler = new THREE.Mesh(boilerGeo, this.ironMat);
    boiler.rotation.x = Math.PI / 2;
    boiler.position.set(0, 1.5, 0);
    boiler.castShadow = true;
    group.add(boiler);

    // Front smokestack
    const stackGeo = new THREE.ConeGeometry(0.5, 0.8, 12);
    const stack = new THREE.Mesh(stackGeo, this.ironMat);
    stack.position.set(0, 2.7, 1.2);
    group.add(stack);

    // Front Headlight (glows brightly toward player)
    const lampGeo = new THREE.BoxGeometry(0.5, 0.5, 0.4);
    const lamp = new THREE.Mesh(lampGeo, this.yellowSignMat);
    lamp.position.set(0, 2.0, 2.1);
    group.add(lamp);

    const glowMat = new THREE.MeshBasicMaterial({ color: 0xffef99 });
    const lens = new THREE.Mesh(new THREE.CircleGeometry(0.2, 12), glowMat);
    lens.position.set(0, 2.0, 2.32);
    group.add(lens);

    // Point light shining toward player
    const light = new THREE.PointLight(0xffdd77, 2.5, 20);
    light.position.set(0, 2.0, 2.5);
    group.add(light);

    // Sharp cowcatcher in front
    const cowcatcherGeo = new THREE.ConeGeometry(0.9, 1.2, 4);
    const cowcatcher = new THREE.Mesh(cowcatcherGeo, this.redWoodMat);
    cowcatcher.rotation.x = Math.PI / 2;
    cowcatcher.rotation.z = Math.PI / 4;
    cowcatcher.position.set(0, 0.5, 2.4);
    group.add(cowcatcher);

    // Wheels
    const wGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.15, 12);
    [-1.2, 0.5].forEach((posZ) => {
      [-0.9, 0.9].forEach((posX) => {
        const w = new THREE.Mesh(wGeo, this.ironMat);
        w.rotation.z = Math.PI / 2;
        w.position.set(posX, 0.5, posZ);
        group.add(w);
      });
    });

    group.position.set(x, 0, z);
    this.group.add(group);

    // Oncoming train drives towards player (positive Z direction)
    const oncomingSpeed = 12 + difficultyFactor * 4;

    this.obstacles.push({
      type: 'CARGO_TRAIN',
      lane,
      group,
      collider: new THREE.Box3(),
      width: 2.2,
      height: 3.2,
      depth: 5.5,
      speedZ: oncomingSpeed,
      active: true,
    });
  }

  /**
   * 6. Overhead Clearance Beam (requires sliding or lane change)
   */
  private createOverheadBeam(lane: number, z: number): void {
    const group = new THREE.Group();
    const x = LANES[lane];

    // Left and right tall posts
    const postGeo = new THREE.BoxGeometry(0.2, 4.0, 0.2);
    const p1 = new THREE.Mesh(postGeo, this.woodMat);
    p1.position.set(-1.4, 2.0, 0);
    group.add(p1);

    const p2 = new THREE.Mesh(postGeo, this.woodMat);
    p2.position.set(1.4, 2.0, 0);
    group.add(p2);

    // Low hanging horizontal beam (at Y = 2.1 - standard train is 2.8 high, so must slide!)
    const beamGeo = new THREE.BoxGeometry(3.0, 0.45, 0.35);
    const beam = new THREE.Mesh(beamGeo, this.redWoodMat);
    beam.position.set(0, 2.1, 0);
    beam.castShadow = true;
    group.add(beam);

    // Hanging sign
    const signGeo = new THREE.BoxGeometry(1.4, 0.4, 0.05);
    const sign = new THREE.Mesh(signGeo, this.yellowSignMat);
    sign.position.set(0, 1.7, 0);
    group.add(sign);

    group.position.set(x, 0, z);
    this.group.add(group);

    this.obstacles.push({
      type: 'OVERHEAD_BEAM',
      lane,
      group,
      collider: new THREE.Box3(),
      width: 2.6,
      height: 0.8,
      depth: 0.6,
      active: true,
    });
  }

  /**
   * Update moving obstacles and colliders
   */
  public update(delta: number, playerZ: number): void {
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      if (!obs.active) continue;

      // Move oncoming trains toward player (increasing Z)
      if (obs.speedZ) {
        obs.group.position.z += obs.speedZ * delta;
      }

      // Update bounding box collider
      const pos = obs.group.position;
      const hw = obs.width / 2;
      const hd = obs.depth / 2;

      if (obs.type === 'OVERHEAD_BEAM') {
        // High collision box (between Y=1.5 and Y=2.5)
        obs.collider.min.set(pos.x - hw, 1.5, pos.z - hd);
        obs.collider.max.set(pos.x + hw, 2.5, pos.z + hd);
      } else if (obs.type === 'RAMP_WAGON') {
        // Front ramp collider (sloped volume)
        // Main wagon block:
        obs.collider.min.set(pos.x - hw, 0, pos.z - hd);
        obs.collider.max.set(pos.x + hw, obs.height, pos.z + 1.0); // Only back part is solid wall

        if (obs.rampCollider) {
          // Ramp zone in front
          obs.rampCollider.min.set(pos.x - hw, 0, pos.z + 0.8);
          obs.rampCollider.max.set(pos.x + hw, 3.2, pos.z + hd);
        }
        if (obs.roofCollider) {
          // Roof top zone
          obs.roofCollider.min.set(pos.x - hw, 3.0, pos.z - hd);
          obs.roofCollider.max.set(pos.x + hw, 3.5, pos.z + 1.0);
        }
      } else {
        // Standard full ground obstacle
        obs.collider.min.set(pos.x - hw, 0.2, pos.z - hd);
        obs.collider.max.set(pos.x + hw, obs.height, pos.z + hd);
      }

      // Clean up obstacles that are far behind player (e.g. 25 units behind)
      if (pos.z > playerZ + 25) {
        this.group.remove(obs.group);
        obs.active = false;
        this.obstacles.splice(i, 1);
      }
    }
  }

  public reset(): void {
    this.obstacles.forEach((obs) => {
      this.group.remove(obs.group);
    });
    this.obstacles = [];
  }
}
