/**
 * EnvironmentBuilder.ts
 * Procedural generation of 3-lane railroad tracks and multi-biome scenery:
 * 1. Velho Oeste Clássico (Desert, Cacti, Sandstone Canyons, Telegraphs)
 * 2. Galáxia / Espaço (Cosmic Star Grid, Glowing Crystals, Asteroids, Alien Spires)
 * 3. Mundo dos Unicórnios (Fairytale Meadows, Cloud Mounds, Rainbow Arches, Castle Spires)
 * 4. Vulcão / Terra do Fogo (Basalt Rocks, Glowing Lava Cracks, Volcanic Vents)
 * 5. Era Glacial (Pack Ice, Translucent Crystals, Snowy Pines, Frozen Caverns)
 * 6. Cyberpunk 2099 (Dark Asphalt, Neon Billboards, Holograms, High-Tech Monoliths)
 * 7. Debaixo d'Água (Seabed Sand, Vibrant Coral Reefs, Kelp Towers, Sunken Pillars)
 * 8. Mundo Doce (Waffle Ground, Giant Lollipops, Ice Cream Peaks, Donut Trees)
 *
 * Also builds the grand Interdimensional Portal Gate at Railroad Stations!
 */

import * as THREE from 'three';
import { BiomeType } from '../types/game';
import { BIOME_CONFIGS } from '../config/stationsConfig';

export const LANE_WIDTH = 3.2;
export const LANES: { [key: number]: number } = {
  [-1]: -LANE_WIDTH,
  [0]: 0,
  [1]: 3.2,
};

export class EnvironmentBuilder {
  private currentBiome: BiomeType = 'WESTERN';

  // Shared materials for tracks & terrain
  private woodTieMat: THREE.MeshStandardMaterial;
  private steelRailMat: THREE.MeshStandardMaterial;
  private ballastMat: THREE.MeshStandardMaterial;
  private groundMat: THREE.MeshStandardMaterial;

  // Scenery materials
  private propMat1: THREE.MeshStandardMaterial; // Primary biome prop (cactus, crystal, ice, etc.)
  private propMat2: THREE.MeshStandardMaterial; // Secondary biome prop (rock, cloud, lava, neon, etc.)
  private propMat3: THREE.MeshStandardMaterial; // Accent biome prop (structure, castle, tech, candy, etc.)
  private portalRingMat: THREE.MeshBasicMaterial;

  constructor() {
    this.woodTieMat = new THREE.MeshStandardMaterial({
      color: 0x422a1d,
      roughness: 0.9,
      metalness: 0.05,
    });

    this.steelRailMat = new THREE.MeshStandardMaterial({
      color: 0x858994,
      roughness: 0.35,
      metalness: 0.85,
    });

    this.ballastMat = new THREE.MeshStandardMaterial({
      color: 0x6e5d4f,
      roughness: 0.95,
      metalness: 0.05,
    });

    this.groundMat = new THREE.MeshStandardMaterial({
      color: 0xc49666,
      roughness: 0.95,
      metalness: 0.0,
    });

    this.propMat1 = new THREE.MeshStandardMaterial({
      color: 0x2e6633,
      roughness: 0.75,
      metalness: 0.05,
    });

    this.propMat2 = new THREE.MeshStandardMaterial({
      color: 0xa8583b,
      roughness: 0.85,
      metalness: 0.05,
    });

    this.propMat3 = new THREE.MeshStandardMaterial({
      color: 0x3d2b1f,
      roughness: 0.9,
      metalness: 0.1,
    });

    this.portalRingMat = new THREE.MeshBasicMaterial({
      color: 0xa855f7,
      wireframe: false,
    });

    this.applyBiomeMaterials('WESTERN');
  }

  /**
   * Set active biome and refresh track & scenery materials
   */
  public setBiome(biome: BiomeType): void {
    this.currentBiome = biome;
    this.applyBiomeMaterials(biome);
  }

  public getBiome(): BiomeType {
    return this.currentBiome;
  }

  private applyBiomeMaterials(biome: BiomeType): void {
    const config = BIOME_CONFIGS[biome];

    this.groundMat.color.setHex(config.groundColor);
    this.ballastMat.color.setHex(config.ballastColor);
    this.steelRailMat.color.setHex(config.railColor);
    this.steelRailMat.emissive.setHex(config.railEmissive);
    this.woodTieMat.color.setHex(config.tieColor);

    // Prop materials adapted to biome
    switch (biome) {
      case 'GALAXY':
        this.propMat1.color.setHex(0x00ffff); // Glowing Cyan Space Crystals
        this.propMat1.emissive.setHex(0x005577);
        this.propMat2.color.setHex(0x38186b); // Dark Asteroid Rock
        this.propMat2.emissive.setHex(0x10002b);
        this.propMat3.color.setHex(0xa855f7); // Violet Space Relays
        this.propMat3.emissive.setHex(0x4a044e);
        this.portalRingMat.color.setHex(0x38bdf8);
        break;

      case 'UNICORN':
        this.propMat1.color.setHex(0xf472b6); // Cotton Candy Pink
        this.propMat1.emissive.setHex(0x831843);
        this.propMat2.color.setHex(0xffffff); // White Cloud Mounds
        this.propMat2.emissive.setHex(0xfdf2f8);
        this.propMat3.color.setHex(0xfde047); // Golden Rainbow Fairytale Spires
        this.propMat3.emissive.setHex(0x854d0e);
        this.portalRingMat.color.setHex(0xf472b6);
        break;

      case 'VOLCANO':
        this.propMat1.color.setHex(0xf97316); // Molten Orange Lava Crags
        this.propMat1.emissive.setHex(0x7c2d12);
        this.propMat2.color.setHex(0x1c1917); // Scorched Basalt
        this.propMat2.emissive.setHex(0x000000);
        this.propMat3.color.setHex(0xef4444); // Glowing Volcanic Chimneys
        this.propMat3.emissive.setHex(0x991b1b);
        this.portalRingMat.color.setHex(0xf97316);
        break;

      case 'ICE_AGE':
        this.propMat1.color.setHex(0x7dd3fc); // Translucent Ice Crystals
        this.propMat1.emissive.setHex(0x0369a1);
        this.propMat2.color.setHex(0xf0f9ff); // Pure Glacial Snow
        this.propMat2.emissive.setHex(0x0f172a);
        this.propMat3.color.setHex(0x164e63); // Frozen Pine Trees
        this.propMat3.emissive.setHex(0x083344);
        this.portalRingMat.color.setHex(0x38bdf8);
        break;

      case 'CYBERPUNK':
        this.propMat1.color.setHex(0x06b6d4); // Neon Cyan Holograms
        this.propMat1.emissive.setHex(0x0e7490);
        this.propMat2.color.setHex(0x09090b); // Monolith Skyscraper Steel
        this.propMat2.emissive.setHex(0x020617);
        this.propMat3.color.setHex(0xf43f5e); // Hot Pink Neon Billboards
        this.propMat3.emissive.setHex(0x9f1239);
        this.portalRingMat.color.setHex(0x06b6d4);
        break;

      case 'UNDERWATER':
        this.propMat1.color.setHex(0x2dd4bf); // Bioluminescent Sea Anemones
        this.propMat1.emissive.setHex(0x0f766e);
        this.propMat2.color.setHex(0xf43f5e); // Vibrant Coral Reefs
        this.propMat2.emissive.setHex(0x881337);
        this.propMat3.color.setHex(0x0e7490); // Sunken Temple Columns
        this.propMat3.emissive.setHex(0x155e75);
        this.portalRingMat.color.setHex(0x2dd4bf);
        break;

      case 'CANDY_LAND':
        this.propMat1.color.setHex(0xf43f5e); // Peppermint Candy Twirls
        this.propMat1.emissive.setHex(0x881337);
        this.propMat2.color.setHex(0xffedd5); // Soft-serve Vanilla Mountains
        this.propMat2.emissive.setHex(0x7c2d12);
        this.propMat3.color.setHex(0xa855f7); // Grape Donut Trees & Sweets
        this.propMat3.emissive.setHex(0x581c87);
        this.portalRingMat.color.setHex(0xf472b6);
        break;

      case 'WESTERN':
      default:
        this.propMat1.color.setHex(0x2e6633); // Cacti
        this.propMat1.emissive.setHex(0x000000);
        this.propMat2.color.setHex(0xa8583b); // Red Sandstone
        this.propMat2.emissive.setHex(0x000000);
        this.propMat3.color.setHex(0x3d2b1f); // Wood Posts
        this.propMat3.emissive.setHex(0x000000);
        this.portalRingMat.color.setHex(0xd97706);
        break;
    }
  }

  /**
   * Build a modular track chunk of length chunkSize (e.g. 80 units)
   */
  public createChunk(chunkLength: number = 80, overrideBiome?: BiomeType): THREE.Group {
    const biome = overrideBiome || this.currentBiome;
    const chunk = new THREE.Group();

    // 1. Terrain Ground Base
    const groundGeo = new THREE.PlaneGeometry(120, chunkLength, 12, 12);
    const ground = new THREE.Mesh(groundGeo, this.groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(0, 0, -chunkLength / 2);
    ground.receiveShadow = true;
    chunk.add(ground);

    // 2. Track Ballast (Gravel embankment for all 3 tracks)
    const ballastGeo = new THREE.BoxGeometry(11.5, 0.22, chunkLength);
    const ballast = new THREE.Mesh(ballastGeo, this.ballastMat);
    ballast.position.set(0, 0.11, -chunkLength / 2);
    ballast.receiveShadow = true;
    chunk.add(ballast);

    // 3. Railroad Tracks (3 parallel lanes)
    const laneOffsets = [-LANE_WIDTH, 0, LANE_WIDTH];

    laneOffsets.forEach((laneX) => {
      // Steel Rails (two per lane)
      const railGeo = new THREE.BoxGeometry(0.08, 0.15, chunkLength);
      const railLeft = new THREE.Mesh(railGeo, this.steelRailMat);
      railLeft.position.set(laneX - 0.75, 0.32, -chunkLength / 2);
      railLeft.castShadow = true;
      chunk.add(railLeft);

      const railRight = new THREE.Mesh(railGeo, this.steelRailMat);
      railRight.position.set(laneX + 0.75, 0.32, -chunkLength / 2);
      railRight.castShadow = true;
      chunk.add(railRight);

      // Railroad Ties / Sleepers spaced along the chunk
      const tieSpacing = 1.4;
      const numTies = Math.floor(chunkLength / tieSpacing);
      const tieGeo = new THREE.BoxGeometry(1.9, 0.12, 0.35);

      for (let i = 0; i < numTies; i++) {
        const tieZ = -i * tieSpacing - 0.5;
        const tie = new THREE.Mesh(tieGeo, this.woodTieMat);
        tie.position.set(laneX, 0.24, tieZ);
        tie.receiveShadow = true;
        chunk.add(tie);
      }
    });

    // 4. Biome-specific Scenery Props
    this.populateScenery(chunk, chunkLength, biome);

    return chunk;
  }

  /**
   * Populate desert / space / fairytale / volcanic scenery according to active biome
   */
  private populateScenery(chunk: THREE.Group, chunkLength: number, biome: BiomeType): void {
    const minSideDistance = 8.5;

    switch (biome) {
      case 'GALAXY':
        this.populateGalaxyScenery(chunk, chunkLength, minSideDistance);
        break;
      case 'UNICORN':
        this.populateUnicornScenery(chunk, chunkLength, minSideDistance);
        break;
      case 'VOLCANO':
        this.populateVolcanoScenery(chunk, chunkLength, minSideDistance);
        break;
      case 'ICE_AGE':
        this.populateIceAgeScenery(chunk, chunkLength, minSideDistance);
        break;
      case 'CYBERPUNK':
        this.populateCyberpunkScenery(chunk, chunkLength, minSideDistance);
        break;
      case 'UNDERWATER':
        this.populateUnderwaterScenery(chunk, chunkLength, minSideDistance);
        break;
      case 'CANDY_LAND':
        this.populateCandyLandScenery(chunk, chunkLength, minSideDistance);
        break;
      case 'WESTERN':
      default:
        this.populateWesternScenery(chunk, chunkLength, minSideDistance);
        break;
    }
  }

  // ================= BIOME 1: WESTERN =================
  private populateWesternScenery(chunk: THREE.Group, chunkLength: number, minSideDist: number): void {
    for (let i = 0; i < 10; i++) {
      const isLeft = Math.random() > 0.5;
      const x = (isLeft ? -1 : 1) * (minSideDist + Math.random() * 32);
      const z = -Math.random() * chunkLength;
      const cactus = this.createCactus();
      cactus.position.set(x, 0, z);
      chunk.add(cactus);
    }
    for (let i = 0; i < 8; i++) {
      const isLeft = Math.random() > 0.5;
      const x = (isLeft ? -1 : 1) * (minSideDist + 6 + Math.random() * 35);
      const z = -Math.random() * chunkLength;
      const rock = this.createRock();
      rock.position.set(x, 0, z);
      chunk.add(rock);
    }
    for (let z = -10; z > -chunkLength; z -= 24) {
      const pole = this.createTelegraphPole();
      pole.position.set(-6.8, 0, z);
      chunk.add(pole);
    }
  }

  // ================= BIOME 2: GALAXY =================
  private populateGalaxyScenery(chunk: THREE.Group, chunkLength: number, minSideDist: number): void {
    // Glowing alien crystal clusters & floating meteorites
    for (let i = 0; i < 9; i++) {
      const isLeft = Math.random() > 0.5;
      const x = (isLeft ? -1 : 1) * (minSideDist + Math.random() * 28);
      const z = -Math.random() * chunkLength;
      const crystal = this.createCosmicCrystal();
      crystal.position.set(x, 0, z);
      chunk.add(crystal);
    }
    // Giant floating asteroids in the sky
    for (let i = 0; i < 5; i++) {
      const isLeft = Math.random() > 0.5;
      const x = (isLeft ? -1 : 1) * (minSideDist + 12 + Math.random() * 30);
      const y = 8.0 + Math.random() * 12.0;
      const z = -Math.random() * chunkLength;
      const asteroid = this.createRock();
      asteroid.scale.setScalar(2.0 + Math.random() * 2.5);
      asteroid.position.set(x, y, z);
      chunk.add(asteroid);
    }
    // Deep space satellite dish / antennae
    for (let z = -15; z > -chunkLength; z -= 28) {
      const antenna = this.createSpaceAntenna();
      antenna.position.set(8.2, 0, z);
      chunk.add(antenna);
    }
  }

  // ================= BIOME 3: UNICORN =================
  private populateUnicornScenery(chunk: THREE.Group, chunkLength: number, minSideDist: number): void {
    // Fluffy cloud mounds
    for (let i = 0; i < 8; i++) {
      const isLeft = Math.random() > 0.5;
      const x = (isLeft ? -1 : 1) * (minSideDist + Math.random() * 26);
      const z = -Math.random() * chunkLength;
      const cloud = this.createCloudMound();
      cloud.position.set(x, 0.4, z);
      chunk.add(cloud);
    }
    // Giant pastel cotton candy trees
    for (let i = 0; i < 7; i++) {
      const isLeft = Math.random() > 0.5;
      const x = (isLeft ? -1 : 1) * (minSideDist + 4 + Math.random() * 24);
      const z = -Math.random() * chunkLength;
      const tree = this.createCandyTree();
      tree.position.set(x, 0, z);
      chunk.add(tree);
    }
    // Distant fairytale castle spires
    if (Math.random() > 0.4) {
      const castle = this.createCastleSpire();
      castle.position.set(minSideDist + 16, 0, -chunkLength * 0.5);
      chunk.add(castle);
    }
  }

  // ================= BIOME 4: VOLCANO =================
  private populateVolcanoScenery(chunk: THREE.Group, chunkLength: number, minSideDist: number): void {
    // Glowing lava rocks & basalt pillars
    for (let i = 0; i < 9; i++) {
      const isLeft = Math.random() > 0.5;
      const x = (isLeft ? -1 : 1) * (minSideDist + Math.random() * 30);
      const z = -Math.random() * chunkLength;
      const basalt = this.createBasaltPillar();
      basalt.position.set(x, 0, z);
      chunk.add(basalt);
    }
    // Smoking volcanic vents
    for (let i = 0; i < 5; i++) {
      const isLeft = Math.random() > 0.5;
      const x = (isLeft ? -1 : 1) * (minSideDist + 5 + Math.random() * 26);
      const z = -Math.random() * chunkLength;
      const vent = this.createVolcanicVent();
      vent.position.set(x, 0, z);
      chunk.add(vent);
    }
  }

  // ================= BIOME 5: ICE AGE =================
  private populateIceAgeScenery(chunk: THREE.Group, chunkLength: number, minSideDist: number): void {
    // Translucent ice crystal spires
    for (let i = 0; i < 9; i++) {
      const isLeft = Math.random() > 0.5;
      const x = (isLeft ? -1 : 1) * (minSideDist + Math.random() * 28);
      const z = -Math.random() * chunkLength;
      const iceShard = this.createIceShard();
      iceShard.position.set(x, 0, z);
      chunk.add(iceShard);
    }
    // Snow-covered evergreen pine trees
    for (let i = 0; i < 7; i++) {
      const isLeft = Math.random() > 0.5;
      const x = (isLeft ? -1 : 1) * (minSideDist + 4 + Math.random() * 24);
      const z = -Math.random() * chunkLength;
      const pine = this.createSnowyPine();
      pine.position.set(x, 0, z);
      chunk.add(pine);
    }
  }

  // ================= BIOME 6: CYBERPUNK =================
  private populateCyberpunkScenery(chunk: THREE.Group, chunkLength: number, minSideDist: number): void {
    // Dark monolithic skyscrapers with neon billboards
    for (let i = 0; i < 6; i++) {
      const isLeft = Math.random() > 0.5;
      const x = (isLeft ? -1 : 1) * (minSideDist + 8 + Math.random() * 22);
      const z = -Math.random() * chunkLength;
      const tower = this.createCyberBuilding();
      tower.position.set(x, 0, z);
      chunk.add(tower);
    }
    // Neon roadside antenna pillars
    for (let z = -12; z > -chunkLength; z -= 20) {
      const beacon = this.createCyberBeacon();
      beacon.position.set(-6.8, 0, z);
      chunk.add(beacon);
    }
  }

  // ================= BIOME 7: UNDERWATER =================
  private populateUnderwaterScenery(chunk: THREE.Group, chunkLength: number, minSideDist: number): void {
    // Giant coral fan reefs & sea kelp towers
    for (let i = 0; i < 10; i++) {
      const isLeft = Math.random() > 0.5;
      const x = (isLeft ? -1 : 1) * (minSideDist + Math.random() * 28);
      const z = -Math.random() * chunkLength;
      const coral = this.createCoralReef();
      coral.position.set(x, 0, z);
      chunk.add(coral);
    }
    // Ancient sunken temple pillars
    for (let z = -15; z > -chunkLength; z -= 24) {
      const pillar = this.createSunkenPillar();
      pillar.position.set(7.5, 0, z);
      chunk.add(pillar);
    }
  }

  // ================= BIOME 8: CANDY LAND =================
  private populateCandyLandScenery(chunk: THREE.Group, chunkLength: number, minSideDist: number): void {
    // Giant spiral lollipops
    for (let i = 0; i < 8; i++) {
      const isLeft = Math.random() > 0.5;
      const x = (isLeft ? -1 : 1) * (minSideDist + Math.random() * 26);
      const z = -Math.random() * chunkLength;
      const lollipop = this.createLollipop();
      lollipop.position.set(x, 0, z);
      chunk.add(lollipop);
    }
    // Soft-serve ice cream mounds
    for (let i = 0; i < 6; i++) {
      const isLeft = Math.random() > 0.5;
      const x = (isLeft ? -1 : 1) * (minSideDist + 6 + Math.random() * 26);
      const z = -Math.random() * chunkLength;
      const iceCream = this.createIceCreamMountain();
      iceCream.position.set(x, 0, z);
      chunk.add(iceCream);
    }
  }

  // --- PROCEDURAL PROP FACTORIES ---

  private createCactus(): THREE.Group {
    const cactus = new THREE.Group();
    const height = 3.5 + Math.random() * 2.2;
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.36, height, 8), this.propMat1);
    trunk.position.y = height / 2;
    cactus.add(trunk);

    if (Math.random() > 0.25) {
      const armH = 1.2 + Math.random() * 0.8;
      const arm1 = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.9, 6), this.propMat1);
      arm1.rotation.z = Math.PI / 2;
      arm1.position.set(-0.55, height * 0.6, 0);
      cactus.add(arm1);
      const armUp = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, armH, 6), this.propMat1);
      armUp.position.set(-0.95, height * 0.6 + armH / 2, 0);
      cactus.add(armUp);
    }
    cactus.rotation.y = Math.random() * Math.PI * 2;
    return cactus;
  }

  private createRock(): THREE.Mesh {
    const scale = 2.5 + Math.random() * 4.5;
    const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(scale, 1), this.propMat2);
    rock.position.y = scale * 0.55;
    rock.rotation.set(Math.random(), Math.random(), 0);
    return rock;
  }

  private createTelegraphPole(): THREE.Group {
    const pole = new THREE.Group();
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 6.5, 6), this.propMat3);
    post.position.y = 3.25;
    pole.add(post);
    const arm = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.1, 0.1), this.propMat3);
    arm.position.set(0, 6.1, 0);
    pole.add(arm);
    return pole;
  }

  private createCosmicCrystal(): THREE.Group {
    const group = new THREE.Group();
    const count = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i < count; i++) {
      const h = 2.5 + Math.random() * 3.5;
      const shard = new THREE.Mesh(new THREE.ConeGeometry(0.35, h, 5), this.propMat1);
      shard.position.set((Math.random() - 0.5) * 1.2, h / 2, (Math.random() - 0.5) * 1.2);
      shard.rotation.set((Math.random() - 0.5) * 0.4, Math.random() * Math.PI, (Math.random() - 0.5) * 0.4);
      group.add(shard);
    }
    return group;
  }

  private createSpaceAntenna(): THREE.Group {
    const group = new THREE.Group();
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.2, 8.0, 6), this.propMat3);
    mast.position.y = 4.0;
    group.add(mast);
    const dish = new THREE.Mesh(new THREE.ConeGeometry(1.6, 0.5, 8, 1, true), this.propMat1);
    dish.rotation.x = Math.PI / 3;
    dish.position.set(0, 7.5, 0);
    group.add(dish);
    return group;
  }

  private createCloudMound(): THREE.Group {
    const group = new THREE.Group();
    for (let i = 0; i < 4; i++) {
      const s = 1.2 + Math.random() * 1.4;
      const puff = new THREE.Mesh(new THREE.DodecahedronGeometry(s, 1), this.propMat2);
      puff.position.set((i - 1.5) * 1.2, s * 0.7, (Math.random() - 0.5) * 0.8);
      group.add(puff);
    }
    return group;
  }

  private createCandyTree(): THREE.Group {
    const group = new THREE.Group();
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.3, 3.2, 6), this.propMat3);
    trunk.position.y = 1.6;
    group.add(trunk);
    const crown = new THREE.Mesh(new THREE.DodecahedronGeometry(1.8, 1), this.propMat1);
    crown.position.y = 3.8;
    group.add(crown);
    return group;
  }

  private createCastleSpire(): THREE.Group {
    const group = new THREE.Group();
    const base = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 2.2, 9.0, 8), this.propMat2);
    base.position.y = 4.5;
    group.add(base);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(2.4, 4.5, 8), this.propMat3);
    roof.position.y = 11.2;
    group.add(roof);
    return group;
  }

  private createBasaltPillar(): THREE.Group {
    const group = new THREE.Group();
    const h = 4.0 + Math.random() * 5.0;
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1.1, h, 6), this.propMat2);
    pillar.position.y = h / 2;
    group.add(pillar);
    return group;
  }

  private createVolcanicVent(): THREE.Group {
    const group = new THREE.Group();
    const cone = new THREE.Mesh(new THREE.ConeGeometry(1.8, 2.8, 8, 1, true), this.propMat1);
    cone.position.y = 1.4;
    group.add(cone);
    return group;
  }

  private createIceShard(): THREE.Group {
    const group = new THREE.Group();
    const h = 3.5 + Math.random() * 4.5;
    const shard = new THREE.Mesh(new THREE.ConeGeometry(0.7, h, 5), this.propMat1);
    shard.position.y = h / 2;
    shard.rotation.z = (Math.random() - 0.5) * 0.3;
    group.add(shard);
    return group;
  }

  private createSnowyPine(): THREE.Group {
    const group = new THREE.Group();
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.35, 2.5, 6), this.propMat3);
    trunk.position.y = 1.25;
    group.add(trunk);
    [2.2, 3.8, 5.0].forEach((y, i) => {
      const foliage = new THREE.Mesh(new THREE.ConeGeometry(2.0 - i * 0.45, 1.8, 7), this.propMat2);
      foliage.position.y = y;
      group.add(foliage);
    });
    return group;
  }

  private createCyberBuilding(): THREE.Group {
    const group = new THREE.Group();
    const w = 4.0 + Math.random() * 3.0;
    const h = 14.0 + Math.random() * 12.0;
    const d = 4.0 + Math.random() * 3.0;
    const tower = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), this.propMat2);
    tower.position.y = h / 2;
    group.add(tower);

    // Glowing holographic sign strip
    const sign = new THREE.Mesh(new THREE.BoxGeometry(w + 0.1, 1.2, d + 0.1), this.propMat1);
    sign.position.y = h * 0.7;
    group.add(sign);
    return group;
  }

  private createCyberBeacon(): THREE.Group {
    const group = new THREE.Group();
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 7.0, 6), this.propMat2);
    mast.position.y = 3.5;
    group.add(mast);
    const light = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.8, 0.4), this.propMat3);
    light.position.y = 7.0;
    group.add(light);
    return group;
  }

  private createCoralReef(): THREE.Group {
    const group = new THREE.Group();
    const count = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i < count; i++) {
      const h = 2.0 + Math.random() * 2.8;
      const fan = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.6, h, 6), this.propMat2);
      fan.position.set((Math.random() - 0.5) * 1.5, h / 2, (Math.random() - 0.5) * 1.5);
      fan.rotation.z = (Math.random() - 0.5) * 0.5;
      group.add(fan);
    }
    return group;
  }

  private createSunkenPillar(): THREE.Group {
    const group = new THREE.Group();
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.6, 6.5, 8), this.propMat3);
    pillar.position.y = 3.25;
    group.add(pillar);
    const cap = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.4, 1.4), this.propMat3);
    cap.position.y = 6.6;
    group.add(cap);
    return group;
  }

  private createLollipop(): THREE.Group {
    const group = new THREE.Group();
    const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 4.5, 8), this.propMat2);
    stick.position.y = 2.25;
    group.add(stick);
    const candy = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.4, 0.35, 16), this.propMat1);
    candy.rotation.x = Math.PI / 2;
    candy.position.y = 4.8;
    group.add(candy);
    return group;
  }

  private createIceCreamMountain(): THREE.Group {
    const group = new THREE.Group();
    const cone = new THREE.Mesh(new THREE.ConeGeometry(2.4, 3.5, 8), this.propMat2);
    cone.position.y = 1.75;
    group.add(cone);
    const scoop = new THREE.Mesh(new THREE.SphereGeometry(1.6, 8, 8), this.propMat3);
    scoop.position.y = 4.2;
    group.add(scoop);
    return group;
  }

  /**
   * Build a grand Railroad Station chunk with an Interdimensional Portal Gate!
   */
  public createStationChunk(
    chunkLength: number = 80,
    stationName: string = 'ESTAÇÃO INTERDIMENSIONAL',
    portalColorHex: number = 0xa855f7
  ): THREE.Group {
    const chunk = this.createChunk(chunkLength);

    // Station Depot Building along right side
    const stationGroup = new THREE.Group();
    const depotWidth = 7.0;
    const depotHeight = 5.0;
    const depotLength = 28.0;

    const depot = new THREE.Mesh(new THREE.BoxGeometry(depotWidth, depotHeight, depotLength), this.woodTieMat);
    depot.position.set(9.5, depotHeight / 2, -chunkLength / 2);
    depot.castShadow = true;
    depot.receiveShadow = true;
    stationGroup.add(depot);

    const roof = new THREE.Mesh(new THREE.BoxGeometry(depotWidth + 2.5, 0.4, depotLength + 2.0), this.propMat2);
    roof.position.set(8.5, depotHeight + 0.2, -chunkLength / 2);
    stationGroup.add(roof);

    // Boardwalk platform along tracks
    const platform = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.4, depotLength + 10.0), this.woodTieMat);
    platform.position.set(5.5, 0.2, -chunkLength / 2);
    platform.receiveShadow = true;
    stationGroup.add(platform);

    // Platform roof canopy & lanterns
    for (let z = -chunkLength / 2 - 12; z <= -chunkLength / 2 + 12; z += 6) {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.2, 3.6, 0.2), this.woodTieMat);
      post.position.set(4.2, 1.8, z);
      stationGroup.add(post);

      const lantern = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), new THREE.MeshBasicMaterial({ color: portalColorHex }));
      lantern.position.set(4.2, 3.2, z);
      stationGroup.add(lantern);

      const light = new THREE.PointLight(portalColorHex, 1.8, 12);
      light.position.set(4.2, 3.0, z);
      stationGroup.add(light);
    }

    // GRAND INTERDIMENSIONAL PORTAL ARCH OVER TRACKS
    // Located at the departure end of the station chunk (Z: -chunkLength + 6)
    const portalArch = new THREE.Group();
    const portalZ = -chunkLength + 6;

    // Left and right dimensional monolith pillars
    const pillarGeo = new THREE.BoxGeometry(1.2, 8.5, 1.2);
    const pLeft = new THREE.Mesh(pillarGeo, this.propMat3);
    pLeft.position.set(-5.5, 4.25, portalZ);
    portalArch.add(pLeft);

    const pRight = new THREE.Mesh(pillarGeo, this.propMat3);
    pRight.position.set(5.5, 4.25, portalZ);
    portalArch.add(pRight);

    // Top crossbeam arch
    const archBeam = new THREE.Mesh(new THREE.BoxGeometry(12.2, 1.2, 1.2), this.propMat3);
    archBeam.position.set(0, 8.2, portalZ);
    portalArch.add(archBeam);

    // Swirling Energy Portal Ring (spanning all 3 tracks)
    const ringGeo = new THREE.TorusGeometry(4.8, 0.35, 12, 32);
    const ringMesh = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: portalColorHex }));
    ringMesh.position.set(0, 4.5, portalZ);
    portalArch.add(ringMesh);

    // Translucent Glowing Portal Vortex
    const vortexGeo = new THREE.CircleGeometry(4.6, 24);
    const vortexMat = new THREE.MeshBasicMaterial({
      color: portalColorHex,
      transparent: true,
      opacity: 0.55,
      side: THREE.DoubleSide,
    });
    const vortex = new THREE.Mesh(vortexGeo, vortexMat);
    vortex.position.set(0, 4.5, portalZ - 0.1);
    portalArch.add(vortex);

    // Brilliant Portal Beacon Light
    const portalLight = new THREE.PointLight(portalColorHex, 3.5, 30);
    portalLight.position.set(0, 4.5, portalZ);
    portalArch.add(portalLight);

    stationGroup.add(portalArch);
    chunk.add(stationGroup);

    return chunk;
  }
}
