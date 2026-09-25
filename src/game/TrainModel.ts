/**
 * TrainModel.ts
 * Procedural 3D model of a classic 1880s Wild West Steam Locomotive ("Iron Horse").
 * Features rotating spoked driver wheels, moving piston rods, brass fittings,
 * cowcatcher, kerosene headlight with volumetric beam, and tender car with coal.
 */

import * as THREE from 'three';

export class TrainModel {
  public group: THREE.Group;
  public smokestackTopPosition: THREE.Vector3 = new THREE.Vector3();
  public headlight: THREE.SpotLight | null = null;

  // Wheel animation references
  private wheels: THREE.Mesh[] = [];
  private pistonRods: THREE.Mesh[] = [];
  private wheelRotation: number = 0;

  // Horn recoil/vibration effect state
  private hornVibrationIntensity: number = 0;

  // Materials
  private ironMaterial: THREE.MeshStandardMaterial;
  private woodMaterial: THREE.MeshStandardMaterial;
  private brassMaterial: THREE.MeshStandardMaterial;
  private darkMetalMaterial: THREE.MeshStandardMaterial;
  private coalMaterial: THREE.MeshStandardMaterial;
  private redPaintMaterial: THREE.MeshStandardMaterial;

  constructor() {
    this.group = new THREE.Group();

    // Reusable materials with western palette
    this.ironMaterial = new THREE.MeshStandardMaterial({
      color: 0x222226,
      roughness: 0.55,
      metalness: 0.75,
    });

    this.darkMetalMaterial = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      roughness: 0.7,
      metalness: 0.5,
    });

    this.woodMaterial = new THREE.MeshStandardMaterial({
      color: 0x5c3317,
      roughness: 0.85,
      metalness: 0.05,
    });

    this.brassMaterial = new THREE.MeshStandardMaterial({
      color: 0xdfab39,
      roughness: 0.35,
      metalness: 0.85,
    });

    this.coalMaterial = new THREE.MeshStandardMaterial({
      color: 0x111111,
      roughness: 0.95,
      metalness: 0.1,
    });

    this.redPaintMaterial = new THREE.MeshStandardMaterial({
      color: 0x8f221a,
      roughness: 0.45,
      metalness: 0.3,
    });

    this.buildLocomotive();
  }

  private buildLocomotive(): void {
    // === CHASSIS BASE ===
    const chassisGeo = new THREE.BoxGeometry(1.6, 0.3, 5.2);
    const chassis = new THREE.Mesh(chassisGeo, this.ironMaterial);
    chassis.position.set(0, 0.75, 0);
    chassis.castShadow = true;
    chassis.receiveShadow = true;
    this.group.add(chassis);

    // === MAIN CYLINDRICAL BOILER ===
    const boilerGeo = new THREE.CylinderGeometry(0.68, 0.68, 3.2, 20);
    const boiler = new THREE.Mesh(boilerGeo, this.ironMaterial);
    boiler.rotation.x = Math.PI / 2;
    boiler.position.set(0, 1.45, -0.6);
    boiler.castShadow = true;
    this.group.add(boiler);

    // Front boiler cap (hemisphere/dome)
    const capGeo = new THREE.SphereGeometry(0.68, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2);
    const boilerCap = new THREE.Mesh(capGeo, this.darkMetalMaterial);
    boilerCap.rotation.x = -Math.PI / 2;
    boilerCap.position.set(0, 1.45, -2.2);
    boilerCap.castShadow = true;
    this.group.add(boilerCap);

    // Brass boiler retention straps
    [-1.8, -1.0, -0.2].forEach((zPos) => {
      const ringGeo = new THREE.TorusGeometry(0.69, 0.03, 8, 24);
      const ring = new THREE.Mesh(ringGeo, this.brassMaterial);
      ring.position.set(0, 1.45, zPos);
      this.group.add(ring);
    });

    // === STEAM DOME & SAND DOME ===
    [-1.4, -0.2].forEach((zPos, idx) => {
      const domeBase = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, 0.35, 12), this.brassMaterial);
      domeBase.position.set(0, 2.2, zPos);
      const domeCap = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), this.brassMaterial);
      domeCap.position.set(0, 2.37, zPos);
      this.group.add(domeBase);
      this.group.add(domeCap);
    });

    // === BRASS BELL ===
    const bellStand = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.3, 8), this.brassMaterial);
    bellStand.position.set(0, 2.25, -0.8);
    const bell = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.22, 10, 1, true), this.brassMaterial);
    bell.rotation.x = Math.PI;
    bell.position.set(0, 2.35, -0.8);
    this.group.add(bellStand);
    this.group.add(bell);

    // === CLASSIC BALLOON / DIAMOND SMOKESTACK ===
    const stackStem = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.25, 0.7, 14), this.ironMaterial);
    stackStem.position.set(0, 2.35, -1.85);
    const stackFunnel = new THREE.Mesh(new THREE.ConeGeometry(0.48, 0.6, 16), this.ironMaterial);
    stackFunnel.position.set(0, 2.8, -1.85);
    const stackRing = new THREE.Mesh(new THREE.TorusGeometry(0.48, 0.05, 8, 20), this.brassMaterial);
    stackRing.rotation.x = Math.PI / 2;
    stackRing.position.set(0, 3.1, -1.85);

    this.group.add(stackStem);
    this.group.add(stackFunnel);
    this.group.add(stackRing);

    // Save world position target for particle emission
    this.smokestackTopPosition.set(0, 3.15, -1.85);

    // === ENGINEER CABIN ===
    const cabWidth = 1.75;
    const cabHeight = 1.5;
    const cabDepth = 1.5;

    const cabGeo = new THREE.BoxGeometry(cabWidth, cabHeight, cabDepth);
    const cab = new THREE.Mesh(cabGeo, this.woodMaterial);
    cab.position.set(0, 1.7, 1.35);
    cab.castShadow = true;
    this.group.add(cab);

    // Cabin roof with curved wooden overhang
    const roofGeo = new THREE.BoxGeometry(cabWidth + 0.2, 0.1, cabDepth + 0.3);
    const roof = new THREE.Mesh(roofGeo, this.redPaintMaterial);
    roof.position.set(0, 2.47, 1.35);
    this.group.add(roof);

    // Cabin front/side windows
    const windowMat = new THREE.MeshStandardMaterial({
      color: 0xffe6a3,
      emissive: 0x332205,
      roughness: 0.2,
      metalness: 0.1,
    });
    [-0.55, 0.55].forEach((xPos) => {
      const win = new THREE.Mesh(new THREE.PlaneGeometry(0.35, 0.45), windowMat);
      win.position.set(xPos, 1.85, 0.59);
      win.rotation.y = Math.PI;
      this.group.add(win);
    });

    // === COWCATCHER (PILOT) ===
    const cowcatcher = new THREE.Group();
    const cowcatcherMat = this.redPaintMaterial;

    // Wedge base
    for (let i = 0; i < 5; i++) {
      const barH = 0.5 - i * 0.08;
      const barGeo = new THREE.BoxGeometry(0.08, barH, 0.9 - i * 0.12);
      const barLeft = new THREE.Mesh(barGeo, cowcatcherMat);
      barLeft.position.set(-0.65 + i * 0.15, 0.45, -2.6 - (4 - i) * 0.1);
      barLeft.rotation.x = -0.3;
      barLeft.rotation.y = 0.35;
      cowcatcher.add(barLeft);

      const barRight = new THREE.Mesh(barGeo, cowcatcherMat);
      barRight.position.set(0.65 - i * 0.15, 0.45, -2.6 - (4 - i) * 0.1);
      barRight.rotation.x = -0.3;
      barRight.rotation.y = -0.35;
      cowcatcher.add(barRight);
    }
    this.group.add(cowcatcher);

    // === FRONT HEADLIGHT WITH LIGHT SOURCE ===
    const lampBody = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.55, 0.45), this.brassMaterial);
    lampBody.position.set(0, 2.1, -2.35);
    lampBody.castShadow = true;
    this.group.add(lampBody);

    const lensGeo = new THREE.CircleGeometry(0.18, 16);
    const lensMat = new THREE.MeshBasicMaterial({ color: 0xfffae0 });
    const lens = new THREE.Mesh(lensGeo, lensMat);
    lens.position.set(0, 2.1, -2.58);
    lens.rotation.y = Math.PI;
    this.group.add(lens);

    // Active spotlight projecting along tracks
    this.headlight = new THREE.SpotLight(0xffdf88, 3.5, 38, Math.PI / 6, 0.4, 1.2);
    this.headlight.position.set(0, 2.1, -2.6);
    const lightTarget = new THREE.Object3D();
    lightTarget.position.set(0, 0.5, -20);
    this.group.add(lightTarget);
    this.headlight.target = lightTarget;
    this.group.add(this.headlight);

    // === WHEELS & PISTONS ===
    this.buildWheels();

    // === TENDER CAR (COAL CAR) ===
    this.buildTender();

    // Scale group to comfortable proportions
    this.group.scale.set(0.9, 0.9, 0.9);
  }

  private buildWheels(): void {
    const wheelGeo = new THREE.CylinderGeometry(0.52, 0.52, 0.12, 16);
    const smallWheelGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.1, 14);

    // 4 Large driver wheels (Z: 0.2 and 1.3)
    const driverZ = [0.2, 1.3];
    driverZ.forEach((z) => {
      [-0.85, 0.85].forEach((x) => {
        const wheel = new THREE.Mesh(wheelGeo, this.ironMaterial);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(x, 0.55, z);
        wheel.castShadow = true;

        // Rim accent
        const rim = new THREE.Mesh(new THREE.TorusGeometry(0.52, 0.03, 6, 16), this.brassMaterial);
        wheel.add(rim);

        this.group.add(wheel);
        this.wheels.push(wheel);
      });
    });

    // 4 Small leading wheels in front (Z: -1.3, -1.9)
    [-1.3, -1.9].forEach((z) => {
      [-0.75, 0.75].forEach((x) => {
        const smallWheel = new THREE.Mesh(smallWheelGeo, this.ironMaterial);
        smallWheel.rotation.z = Math.PI / 2;
        smallWheel.position.set(x, 0.35, z);
        smallWheel.castShadow = true;
        this.group.add(smallWheel);
        this.wheels.push(smallWheel);
      });
    });

    // Side connecting piston rods
    [-0.95, 0.95].forEach((x) => {
      const rodGeo = new THREE.BoxGeometry(0.06, 0.09, 1.4);
      const rod = new THREE.Mesh(rodGeo, this.brassMaterial);
      rod.position.set(x, 0.55, 0.75);
      this.group.add(rod);
      this.pistonRods.push(rod);

      // Steam cylinder
      const cylGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.8, 12);
      const cyl = new THREE.Mesh(cylGeo, this.ironMaterial);
      cyl.rotation.x = Math.PI / 2;
      cyl.position.set(x * 0.9, 0.55, -0.7);
      this.group.add(cyl);
    });
  }

  private buildTender(): void {
    const tender = new THREE.Group();
    tender.position.set(0, 0, 3.2);

    // Coupling link
    const link = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.1, 0.6), this.ironMaterial);
    link.position.set(0, 0.7, -0.6);
    tender.add(link);

    // Tender body (wooden and metal cargo)
    const bodyGeo = new THREE.BoxGeometry(1.6, 1.1, 2.0);
    const body = new THREE.Mesh(bodyGeo, this.woodMaterial);
    body.position.set(0, 1.15, 0.4);
    body.castShadow = true;
    tender.add(body);

    // Coal mound inside tender
    const coalGeo = new THREE.DodecahedronGeometry(0.65, 1);
    const coal = new THREE.Mesh(coalGeo, this.coalMaterial);
    coal.position.set(0, 1.6, 0.4);
    coal.scale.set(1.1, 0.4, 1.3);
    tender.add(coal);

    // Tender wheels (4 small wheels)
    const tWheelGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.1, 14);
    [-0.1, 0.9].forEach((z) => {
      [-0.75, 0.75].forEach((x) => {
        const tw = new THREE.Mesh(tWheelGeo, this.ironMaterial);
        tw.rotation.z = Math.PI / 2;
        tw.position.set(x, 0.35, z);
        tender.add(tw);
        this.wheels.push(tw);
      });
    });

    this.group.add(tender);
  }

  /**
   * Update wheel rotation, piston cycle, and horn vibration based on movement delta
   */
  public update(deltaSpeed: number, deltaTime: number = 0.016): void {
    this.wheelRotation -= deltaSpeed * 2.2;

    this.wheels.forEach((w) => {
      w.rotation.x = this.wheelRotation;
    });

    // Piston rods reciprocating motion
    this.pistonRods.forEach((rod) => {
      rod.position.z = 0.75 + Math.sin(this.wheelRotation) * 0.18;
      rod.position.y = 0.55 + Math.cos(this.wheelRotation) * 0.08;
    });

    // Horn vibration / scaling pulse effect
    if (this.hornVibrationIntensity > 0) {
      this.hornVibrationIntensity = Math.max(0, this.hornVibrationIntensity - deltaTime * 3.0);
      const vibrationOffset = Math.sin(performance.now() * 0.05) * 0.04 * this.hornVibrationIntensity;
      const scaleSwell = 1.0 + Math.sin(performance.now() * 0.04) * 0.06 * this.hornVibrationIntensity;

      // Apply subtle vibration displacement to locomotive parts
      this.group.position.y += vibrationOffset;
      this.group.scale.x = 0.9 * scaleSwell;
      this.group.scale.y = 0.9 * (1.0 + (scaleSwell - 1.0) * 0.8);
    }
  }

  /**
   * Trigger a recoil vibration and physical puff pulse when the horn sounds
   */
  public triggerHornVibration(): void {
    this.hornVibrationIntensity = 1.0;
  }

  public getSmokestackWorldPosition(): THREE.Vector3 {
    return this.group.localToWorld(this.smokestackTopPosition.clone());
  }
}
