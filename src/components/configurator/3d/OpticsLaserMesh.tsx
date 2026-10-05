"use client";

import React from "react";
import * as THREE from "three";
import { industrialMaterials } from "./IndustrialMaterials";
import { ComponentItem } from "@/types/configurator";
import { useConfiguratorStore } from "@/lib/configurator/configurator-store";

interface OpticsLaserMeshProps {
  component: ComponentItem;
  isGhost?: boolean;
}

export const OpticsLaserMesh: React.FC<OpticsLaserMeshProps> = ({ component, isGhost = false }) => {
  const wireframeMode = useConfiguratorStore((s) => s.wireframeMode);

  let matSteel: THREE.Material = isGhost ? industrialMaterials.ghostPreviewMat : industrialMaterials.chassisSteel;
  let matChrome: THREE.Material = isGhost ? industrialMaterials.ghostPreviewMat : industrialMaterials.polishedChrome;
  let matAluminum: THREE.Material = isGhost ? industrialMaterials.ghostPreviewMat : industrialMaterials.brushedAluminum;
  let matCyan: THREE.Material = isGhost ? industrialMaterials.ghostPreviewMat : industrialMaterials.laserCyan;
  let matRed: THREE.Material = isGhost ? industrialMaterials.ghostPreviewMat : industrialMaterials.emergencyRed;

  if (wireframeMode) {
    matSteel = industrialMaterials.wireframeMat;
    matChrome = industrialMaterials.wireframeMat;
    matAluminum = industrialMaterials.wireframeMat;
    matCyan = industrialMaterials.wireframeMat;
    matRed = industrialMaterials.wireframeMat;
  }

  const pNum = component.partNumber;

  // 1. Fiber Laser Welding Head
  if (pNum.startsWith("WLD-HED") || pNum.startsWith("LSR")) {
    return (
      <group name={`OPTICS_LASER_HEAD_${pNum}`}>
        {/* Collimator Optics Tube */}
        <mesh position={[0, 0.22, 0]} material={matChrome} castShadow>
          <cylinderGeometry args={[0.045, 0.045, 0.25, 20]} />
        </mesh>
        {/* Wobble Galvo Mirror Block */}
        <mesh position={[0, 0.05, 0]} material={matSteel} castShadow>
          <boxGeometry args={[0.12, 0.14, 0.12]} />
        </mesh>
        {/* Gas Nozzle Tip */}
        <mesh position={[0, -0.07, 0]} material={matChrome} castShadow>
          <cylinderGeometry args={[0.025, 0.012, 0.1, 16]} />
        </mesh>
        {/* Focusing Laser Beam Indicator */}
        <mesh position={[0, -0.18, 0]} material={matRed}>
          <cylinderGeometry args={[0.003, 0.012, 0.12, 8]} />
        </mesh>
      </group>
    );
  }

  // 2. 5-Axis CMM Scanning Touch Probe (Renishaw style)
  if (pNum.startsWith("PRB")) {
    return (
      <group name={`OPTICS_TOUCH_PROBE_${pNum}`}>
        {/* Motorized Articulating Head */}
        <mesh position={[0, 0.12, 0]} material={matAluminum} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 0.12, 24]} />
        </mesh>
        {/* Kinematic Probe Body */}
        <mesh position={[0, 0.02, 0]} material={matSteel} castShadow>
          <cylinderGeometry args={[0.03, 0.025, 0.08, 20]} />
        </mesh>
        {/* Carbon Fiber Stylus Stem */}
        <mesh position={[0, -0.06, 0]} material={industrialMaterials.carbonFiber}>
          <cylinderGeometry args={[0.004, 0.004, 0.1, 8]} />
        </mesh>
        {/* Precision Ruby Ball Tip */}
        <mesh position={[0, -0.11, 0]} material={matRed}>
          <sphereGeometry args={[0.012, 16, 16]} />
        </mesh>
      </group>
    );
  }

  // 3. 4K Telecentric Vision Camera & Ring Light
  if (pNum.startsWith("VIS")) {
    return (
      <group name={`OPTICS_VISION_${pNum}`}>
        {/* Camera Sensor Body */}
        <mesh position={[0, 0.14, 0]} material={matSteel} castShadow>
          <boxGeometry args={[0.08, 0.12, 0.08]} />
        </mesh>
        {/* Telecentric Tube Lens */}
        <mesh position={[0, 0.02, 0]} material={matAluminum} castShadow>
          <cylinderGeometry args={[0.038, 0.048, 0.14, 24]} />
        </mesh>
        {/* Circular LED Ring Strobe Light */}
        <mesh position={[0, -0.05, 0]} material={matCyan}>
          <ringGeometry args={[0.025, 0.055, 24]} />
        </mesh>
      </group>
    );
  }

  // 4. AGV Safety LiDAR Scanner
  if (pNum.startsWith("LDR")) {
    return (
      <group name={`OPTICS_LIDAR_${pNum}`}>
        {/* Base Mount Casting */}
        <mesh position={[0, 0.02, 0]} material={matSteel} castShadow>
          <boxGeometry args={[0.11, 0.05, 0.11]} />
        </mesh>
        {/* Rotating Optical Turret Drum */}
        <mesh position={[0, 0.07, 0]} material={matCyan} castShadow>
          <cylinderGeometry args={[0.045, 0.045, 0.06, 24]} />
        </mesh>
        {/* Protective Top Cap */}
        <mesh position={[0, 0.11, 0]} material={matSteel}>
          <cylinderGeometry args={[0.048, 0.048, 0.02, 24]} />
        </mesh>
      </group>
    );
  }

  // Fallback optical sensor
  return (
    <group name={`OPTICS_FALLBACK_${pNum}`}>
      <mesh position={[0, 0.05, 0]} material={matSteel} castShadow>
        <boxGeometry args={[0.1, 0.12, 0.1]} />
      </mesh>
      <mesh position={[0, -0.04, 0]} material={matCyan}>
        <cylinderGeometry args={[0.02, 0.02, 0.05, 16]} />
      </mesh>
    </group>
  );
};
