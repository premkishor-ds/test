"use client";

import React, { useMemo } from "react";
import * as THREE from "three";
import { industrialMaterials } from "./IndustrialMaterials";
import { useConfiguratorStore } from "@/lib/configurator/configurator-store";

interface BaseMachineMeshProps {
  wireframe?: boolean;
}

export const BaseMachineMesh: React.FC<BaseMachineMeshProps> = ({ wireframe = false }) => {
  const storeWireframe = useConfiguratorStore((s) => s.wireframeMode);
  const isWire = wireframe || storeWireframe;

  // Frame dimensions
  const length = 3.2; // 3.2 meters in 3D units
  const width = 0.85;
  const height = 0.75;
  const beamThickness = 0.08;

  const matChassis = isWire ? industrialMaterials.wireframeMat : industrialMaterials.chassisSteel;
  const matAluminum = isWire ? industrialMaterials.wireframeMat : industrialMaterials.brushedAluminum;
  const matChrome = isWire ? industrialMaterials.wireframeMat : industrialMaterials.polishedChrome;
  const matYellow = isWire ? industrialMaterials.wireframeMat : industrialMaterials.safetyYellow;

  return (
    <group position={[0, 0, 0]} name="BASE_MACHINE_FRAME">
      {/* 4 Vertical Structural Legs */}
      {[
        [-length / 2 + 0.2, 0, -width / 2 + 0.05],
        [-length / 2 + 0.2, 0, width / 2 - 0.05],
        [length / 2 - 0.2, 0, -width / 2 + 0.05],
        [length / 2 - 0.2, 0, width / 2 - 0.05],
        [0, 0, -width / 2 + 0.05], // Center support legs
        [0, 0, width / 2 - 0.05],
      ].map(([x, y, z], idx) => (
        <group key={`leg-${idx}`} position={[x, height / 2, z]}>
          {/* Main upright column */}
          <mesh material={matChassis} castShadow receiveShadow>
            <boxGeometry args={[beamThickness, height, beamThickness]} />
          </mesh>
          {/* Adjustable Leveling Foot pad */}
          <mesh position={[0, -height / 2 + 0.02, 0]} material={matChrome} castShadow>
            <cylinderGeometry args={[0.07, 0.08, 0.04, 16]} />
          </mesh>
          {/* Threaded stud */}
          <mesh position={[0, -height / 2 + 0.06, 0]} material={matChrome}>
            <cylinderGeometry args={[0.02, 0.02, 0.06, 12]} />
          </mesh>
          {/* Leg gusset plate */}
          <mesh position={[0, height / 4, 0]} material={matYellow}>
            <boxGeometry args={[beamThickness * 1.05, 0.04, beamThickness * 1.05]} />
          </mesh>
        </group>
      ))}

      {/* Main Longitudinal Side Rails (I-beams) */}
      {/* Front rail */}
      <mesh
        position={[0, height - beamThickness / 2, width / 2 - 0.05]}
        material={matChassis}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[length, beamThickness, beamThickness]} />
      </mesh>
      {/* Back rail */}
      <mesh
        position={[0, height - beamThickness / 2, -width / 2 + 0.05]}
        material={matChassis}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[length, beamThickness, beamThickness]} />
      </mesh>

      {/* Lower Longitudinal Tie Bars */}
      <mesh
        position={[0, height * 0.25, width / 2 - 0.05]}
        material={matAluminum}
        castShadow
      >
        <boxGeometry args={[length - 0.4, 0.04, 0.04]} />
      </mesh>
      <mesh
        position={[0, height * 0.25, -width / 2 + 0.05]}
        material={matAluminum}
        castShadow
      >
        <boxGeometry args={[length - 0.4, 0.04, 0.04]} />
      </mesh>

      {/* Transverse Cross-members (Struts) */}
      {[-length / 2 + 0.2, -length / 4, 0, length / 4, length / 2 - 0.2].map((xPos, idx) => (
        <group key={`cross-${idx}`} position={[xPos, 0, 0]}>
          {/* Upper cross strut */}
          <mesh position={[0, height - beamThickness / 2, 0]} material={matChassis} castShadow>
            <boxGeometry args={[beamThickness, beamThickness, width - 0.1]} />
          </mesh>
          {/* Lower cross strut */}
          <mesh position={[0, height * 0.25, 0]} material={matAluminum} castShadow>
            <boxGeometry args={[0.04, 0.04, width - 0.1]} />
          </mesh>
        </group>
      ))}

      {/* Primary Drive Axle Pillow Block Bearings (At -1.45m) */}
      <group position={[-1.45, height - 0.02, 0]}>
        {/* Drive shaft spanning across frame */}
        <mesh rotation={[Math.PI / 2, 0, 0]} material={matChrome} castShadow>
          <cylinderGeometry args={[0.025, 0.025, width + 0.1, 24]} />
        </mesh>
        {/* Left pillow block */}
        <mesh position={[0, 0, width / 2]} material={matChassis} castShadow>
          <boxGeometry args={[0.1, 0.08, 0.05]} />
        </mesh>
        {/* Right pillow block */}
        <mesh position={[0, 0, -width / 2]} material={matChassis} castShadow>
          <boxGeometry args={[0.1, 0.08, 0.05]} />
        </mesh>
        {/* Motor Mounting Cantilever Shelf (for MOTOR_MOUNT_01) */}
        <mesh position={[0, -0.15, width / 2 + 0.15]} material={matChassis} castShadow>
          <boxGeometry args={[0.35, 0.04, 0.35]} />
        </mesh>
        {/* Cantilever diagonal brace */}
        <mesh
          position={[0, -0.3, width / 2 + 0.08]}
          rotation={[0.5, 0, 0]}
          material={matAluminum}
          castShadow
        >
          <boxGeometry args={[0.04, 0.25, 0.04]} />
        </mesh>
      </group>

      {/* Outfeed Idler Axle (At +1.45m) */}
      <group position={[1.45, height - 0.02, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} material={matChrome} castShadow>
          <cylinderGeometry args={[0.02, 0.02, width, 24]} />
        </mesh>
      </group>

      {/* Safety Yellow High-Visibility Edge Stripes */}
      <mesh
        position={[0, height + 0.005, width / 2 - 0.01]}
        material={matYellow}
      >
        <boxGeometry args={[length, 0.015, 0.015]} />
      </mesh>
      <mesh
        position={[0, height + 0.005, -width / 2 + 0.01]}
        material={matYellow}
      >
        <boxGeometry args={[length, 0.015, 0.015]} />
      </mesh>
    </group>
  );
};
