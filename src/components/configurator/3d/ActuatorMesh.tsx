"use client";

import React from "react";
import * as THREE from "three";
import { industrialMaterials } from "./IndustrialMaterials";
import { ComponentItem } from "@/types/configurator";
import { useConfiguratorStore } from "@/lib/configurator/configurator-store";

interface ActuatorMeshProps {
  component: ComponentItem;
  isGhost?: boolean;
}

export const ActuatorMesh: React.FC<ActuatorMeshProps> = ({ component, isGhost = false }) => {
  const wireframeMode = useConfiguratorStore((s) => s.wireframeMode);

  let matSteel: THREE.Material = isGhost ? industrialMaterials.ghostPreviewMat : industrialMaterials.chassisSteel;
  let matChrome: THREE.Material = isGhost ? industrialMaterials.ghostPreviewMat : industrialMaterials.polishedChrome;
  let matHydraulic: THREE.Material = isGhost ? industrialMaterials.ghostPreviewMat : industrialMaterials.hydraulicDark;
  let matYellow: THREE.Material = isGhost ? industrialMaterials.ghostPreviewMat : industrialMaterials.safetyYellow;
  let matCyan: THREE.Material = isGhost ? industrialMaterials.ghostPreviewMat : industrialMaterials.laserCyan;

  if (wireframeMode) {
    matSteel = industrialMaterials.wireframeMat;
    matChrome = industrialMaterials.wireframeMat;
    matHydraulic = industrialMaterials.wireframeMat;
    matYellow = industrialMaterials.wireframeMat;
  }

  const pNum = component.partNumber;

  // 1. Hydraulic Cylinder / Manifold / Injection Screw
  if (pNum.startsWith("HYD") || pNum.startsWith("SCR") || pNum.startsWith("PRS-SRV")) {
    return (
      <group name={`ACTUATOR_HYDRAULIC_${pNum}`}>
        {/* Main Heavy Cylinder Barrel */}
        <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={matHydraulic} castShadow>
          <cylinderGeometry args={[0.14, 0.14, 0.65, 24]} />
        </mesh>
        {/* Chrome Piston Actuator Rod */}
        <mesh position={[0.38, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={matChrome} castShadow>
          <cylinderGeometry args={[0.08, 0.08, 0.45, 20]} />
        </mesh>
        {/* Proportional Solenoid Valve Block on top */}
        <mesh position={[0, 0.18, 0]} material={matSteel} castShadow>
          <boxGeometry args={[0.24, 0.12, 0.16]} />
        </mesh>
        {/* Valve Coils */}
        {[-0.06, 0.06].map((x, i) => (
          <mesh key={`coil-${i}`} position={[x, 0.26, 0]} material={matYellow}>
            <cylinderGeometry args={[0.025, 0.025, 0.08, 12]} />
          </mesh>
        ))}
      </group>
    );
  }

  // 2. Battery Power Module (AGV)
  if (pNum.startsWith("BAT")) {
    return (
      <group name={`ACTUATOR_BATTERY_${pNum}`}>
        {/* Battery Protective Steel Casing */}
        <mesh position={[0, 0.15, 0]} material={matSteel} castShadow>
          <boxGeometry args={[0.42, 0.28, 0.28]} />
        </mesh>
        {/* Carrying Handle */}
        <mesh position={[0, 0.31, 0]} material={matChrome}>
          <boxGeometry args={[0.18, 0.04, 0.03]} />
        </mesh>
        {/* High-Current Anderson Power Connector */}
        <mesh position={[0.19, 0.24, 0]} material={industrialMaterials.emergencyRed}>
          <boxGeometry args={[0.06, 0.05, 0.08]} />
        </mesh>
        {/* SOC Battery State of Charge LED Meter */}
        <mesh position={[0, 0.22, 0.145]} material={matCyan}>
          <boxGeometry args={[0.12, 0.02, 0.005]} />
        </mesh>
      </group>
    );
  }

  // 3. Automatic Pallet Dispenser Magazine
  if (pNum.startsWith("PLT")) {
    return (
      <group name={`ACTUATOR_PALLET_DISPENSER_${pNum}`}>
        {/* 4 Upright Corner Steel Guide Masts */}
        {[
          [-0.55, -0.45],
          [0.55, -0.45],
          [-0.55, 0.45],
          [0.55, 0.45],
        ].map(([x, z], i) => (
          <mesh key={`post-${i}`} position={[x, 0.9, z]} material={matYellow} castShadow>
            <boxGeometry args={[0.06, 1.8, 0.06]} />
          </mesh>
        ))}
        {/* Stack of 4 Wooden Pallets */}
        {Array.from({ length: 4 }).map((_, i) => (
          <mesh key={`pal-${i}`} position={[0, 0.12 + i * 0.16, 0]} material={matSteel} castShadow>
            <boxGeometry args={[1.05, 0.12, 0.85]} />
          </mesh>
        ))}
      </group>
    );
  }

  // 4. Centrifugal Coolant Mist Collector / Filter
  if (pNum.startsWith("FLT") || pNum.startsWith("CHP")) {
    return (
      <group name={`ACTUATOR_FILTER_${pNum}`}>
        {/* Centrifugal Drum Housing */}
        <mesh position={[0, 0.28, 0]} material={industrialMaterials.cabinetGrey} castShadow>
          <cylinderGeometry args={[0.22, 0.22, 0.45, 24]} />
        </mesh>
        {/* Top Motor Cowl */}
        <mesh position={[0, 0.55, 0]} material={matSteel} castShadow>
          <cylinderGeometry args={[0.14, 0.14, 0.18, 20]} />
        </mesh>
        {/* Bottom Suction Duct Flange */}
        <mesh position={[0, 0.03, 0]} material={matChrome}>
          <cylinderGeometry args={[0.12, 0.12, 0.08, 16]} />
        </mesh>
      </group>
    );
  }

  // Fallback actuator
  return (
    <group name={`ACTUATOR_FALLBACK_${pNum}`}>
      <mesh position={[0, 0.12, 0]} material={matSteel} castShadow>
        <boxGeometry args={[0.3, 0.25, 0.3]} />
      </mesh>
    </group>
  );
};
