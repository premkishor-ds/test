import * as THREE from "three";

// Pre-configured PBR materials for high visual fidelity and 60 FPS performance
export const industrialMaterials = {
  // Machine structural frame (dark charcoal powder-coated steel)
  chassisSteel: new THREE.MeshStandardMaterial({
    color: new THREE.Color("#1e2530"),
    roughness: 0.35,
    metalness: 0.85,
  }),

  // Brushed aluminum extrusions & structural profiles
  brushedAluminum: new THREE.MeshStandardMaterial({
    color: new THREE.Color("#94a3b8"),
    roughness: 0.25,
    metalness: 0.9,
  }),

  // Chrome rollers & precision drive shafts
  polishedChrome: new THREE.MeshStandardMaterial({
    color: new THREE.Color("#e2e8f0"),
    roughness: 0.1,
    metalness: 0.98,
  }),

  // Industrial safety yellow (RAL 1018 Zinc Yellow)
  safetyYellow: new THREE.MeshStandardMaterial({
    color: new THREE.Color("#eab308"),
    roughness: 0.4,
    metalness: 0.2,
  }),

  // Emergency stop red (RAL 3000 Flame Red)
  emergencyRed: new THREE.MeshStandardMaterial({
    color: new THREE.Color("#dc2626"),
    roughness: 0.3,
    metalness: 0.3,
  }),

  // Motor cast iron casing (industrial blue / teal)
  motorTeal: new THREE.MeshStandardMaterial({
    color: new THREE.Color("#0284c7"),
    roughness: 0.45,
    metalness: 0.7,
  }),

  // Heavy duty 10HP motor casing (graphite / dark blue)
  motorHeavyDuty: new THREE.MeshStandardMaterial({
    color: new THREE.Color("#0f172a"),
    roughness: 0.3,
    metalness: 0.8,
  }),

  // Conveyor green PVC belt
  conveyorBeltPvc: new THREE.MeshStandardMaterial({
    color: new THREE.Color("#166534"),
    roughness: 0.7,
    metalness: 0.1,
  }),

  // Conveyor black PU belt
  conveyorBeltBlack: new THREE.MeshStandardMaterial({
    color: new THREE.Color("#0f172a"),
    roughness: 0.8,
    metalness: 0.05,
  }),

  // Control cabinet paint (RAL 7035 Light Grey)
  cabinetGrey: new THREE.MeshStandardMaterial({
    color: new THREE.Color("#cbd5e1"),
    roughness: 0.3,
    metalness: 0.5,
  }),

  // Illuminated HMI Touchscreen Glass
  hmiScreen: new THREE.MeshStandardMaterial({
    color: new THREE.Color("#0284c7"),
    emissive: new THREE.Color("#0369a1"),
    emissiveIntensity: 0.6,
    roughness: 0.1,
    metalness: 0.2,
  }),

  // Laser sensor beam / glowing emitter
  laserEmitter: new THREE.MeshStandardMaterial({
    color: new THREE.Color("#ef4444"),
    emissive: new THREE.Color("#f87171"),
    emissiveIntensity: 1.0,
    roughness: 0.1,
    metalness: 0.1,
  }),

  // Semi-transparent laser cone
  laserBeam: new THREE.MeshBasicMaterial({
    color: new THREE.Color("#ef4444"),
    transparent: true,
    opacity: 0.35,
    side: THREE.DoubleSide,
  }),

  // Wireframe preview material
  wireframeMat: new THREE.MeshStandardMaterial({
    color: new THREE.Color("#06b6d4"),
    wireframe: true,
  }),

  // Ghost dragging preview material (semi-transparent holographic)
  ghostPreviewMat: new THREE.MeshStandardMaterial({
    color: new THREE.Color("#06b6d4"),
    transparent: true,
    opacity: 0.45,
    roughness: 0.2,
    metalness: 0.8,
    emissive: new THREE.Color("#0891b2"),
    emissiveIntensity: 0.4,
  }),

  // Holographic mounting point (Ready / Idle)
  mountPointReady: new THREE.MeshStandardMaterial({
    color: new THREE.Color("#06b6d4"),
    emissive: new THREE.Color("#0891b2"),
    emissiveIntensity: 0.8,
    transparent: true,
    opacity: 0.75,
  }),

  // Holographic mounting point (Valid drop target)
  mountPointValid: new THREE.MeshStandardMaterial({
    color: new THREE.Color("#10b981"),
    emissive: new THREE.Color("#059669"),
    emissiveIntensity: 1.2,
    transparent: true,
    opacity: 0.85,
  }),

  // Holographic mounting point (Incompatible drop target)
  mountPointInvalid: new THREE.MeshStandardMaterial({
    color: new THREE.Color("#ef4444"),
    emissive: new THREE.Color("#b91c1c"),
    emissiveIntensity: 1.2,
    transparent: true,
    opacity: 0.85,
  }),

  // Polished Black Granite (for CMM Metrology)
  graniteBlack: new THREE.MeshStandardMaterial({
    color: new THREE.Color("#0f172a"),
    roughness: 0.15,
    metalness: 0.3,
  }),

  // Carbon Fiber Composite
  carbonFiber: new THREE.MeshStandardMaterial({
    color: new THREE.Color("#18181b"),
    roughness: 0.35,
    metalness: 0.6,
  }),

  // Industrial Orange (Robotic Arms & Welders)
  industrialOrange: new THREE.MeshStandardMaterial({
    color: new THREE.Color("#ea580c"),
    roughness: 0.35,
    metalness: 0.5,
  }),

  // Heavy Hydraulic Gunmetal Steel
  hydraulicDark: new THREE.MeshStandardMaterial({
    color: new THREE.Color("#334155"),
    roughness: 0.3,
    metalness: 0.8,
  }),

  // Glowing Cyan Laser / Sensor Emitter
  laserCyan: new THREE.MeshStandardMaterial({
    color: new THREE.Color("#06b6d4"),
    emissive: new THREE.Color("#22d3ee"),
    emissiveIntensity: 1.2,
    roughness: 0.1,
  }),
};
