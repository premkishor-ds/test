"use client";

import React from "react";
import * as THREE from "three";
import { industrialMaterials } from "./IndustrialMaterials";
import { ComponentItem } from "@/types/configurator";
import { useConfiguratorStore } from "@/lib/configurator/configurator-store";

interface MotorMeshProps {
  component: ComponentItem;
  isGhost?: boolean;
  customSettings?: Record<string, any>;
}

export const MotorMesh: React.FC<MotorMeshProps> = ({
  component,
  isGhost = false,
  customSettings,
}) => {
  const wireframeMode = useConfiguratorStore((s) => s.wireframeMode);

  // Determine scale and details from customSettings or part number
  const is10HP = component.partNumber === "MTR-010";
  const is5HP = component.partNumber === "MTR-005";

  const scale = customSettings?.powerHp
    ? 0.75 + (Number(customSettings.powerHp) / 10) * 0.6
    : is10HP
    ? 1.35
    : is5HP
    ? 1.15
    : 0.95;
  const statorRadius = 0.12 * scale;
  const statorLength = 0.3 * scale;

  let matCasing: THREE.Material = is10HP ? industrialMaterials.motorHeavyDuty : industrialMaterials.motorTeal;
  if (isGhost) matCasing = industrialMaterials.ghostPreviewMat;
  if (wireframeMode) matCasing = industrialMaterials.wireframeMat;

  const matChrome = isGhost ? industrialMaterials.ghostPreviewMat : industrialMaterials.polishedChrome;
  const matAluminum = isGhost ? industrialMaterials.ghostPreviewMat : industrialMaterials.brushedAluminum;
  const matYellow = isGhost ? industrialMaterials.ghostPreviewMat : industrialMaterials.safetyYellow;

  return (
    <group name={`MOTOR_${component.partNumber}`}>
      {/* Base mounting footplate */}
      <mesh position={[0, -statorRadius - 0.03, 0]} material={matCasing} castShadow>
        <boxGeometry args={[0.22 * scale, 0.04 * scale, 0.28 * scale]} />
      </mesh>

      {/* 4 Footplate bolt holes/lugs */}
      {[-0.09 * scale, 0.09 * scale].map((x) =>
        [-0.11 * scale, 0.11 * scale].map((z) => (
          <mesh
            key={`bolt-${x}-${z}`}
            position={[x, -statorRadius - 0.03, z]}
            material={matChrome}
            castShadow
          >
            <cylinderGeometry args={[0.015, 0.015, 0.05 * scale, 8]} />
          </mesh>
        ))
      )}

      {/* Main Cylindrical Stator Casing (aligned along X-axis) */}
      <mesh rotation={[0, 0, Math.PI / 2]} material={matCasing} castShadow>
        <cylinderGeometry args={[statorRadius, statorRadius, statorLength, 24]} />
      </mesh>

      {/* Radial Stator Cooling Fins (Heat Sink Ribs) */}
      {Array.from({ length: is10HP ? 14 : 10 }).map((_, i) => {
        const angle = (i * Math.PI) / (is10HP ? 7 : 5);
        return (
          <mesh
            key={`fin-${i}`}
            rotation={[angle, 0, 0]}
            position={[0, 0, 0]}
            material={matCasing}
            castShadow
          >
            <boxGeometry args={[statorLength * 0.9, statorRadius * 2 + 0.03, 0.008 * scale]} />
          </mesh>
        );
      })}

      {/* Front End Bell Flange (Drive End) */}
      <mesh
        position={[statorLength / 2 + 0.02 * scale, 0, 0]}
        rotation={[0, 0, Math.PI / 2]}
        material={matAluminum}
        castShadow
      >
        <cylinderGeometry args={[statorRadius * 1.1, statorRadius * 1.1, 0.04 * scale, 24]} />
      </mesh>

      {/* Output Drive Shaft (Connected to conveyor drive axle) */}
      <mesh
        position={[statorLength / 2 + 0.08 * scale, 0, 0]}
        rotation={[0, 0, Math.PI / 2]}
        material={matChrome}
        castShadow
      >
        <cylinderGeometry args={[0.022 * scale, 0.022 * scale, 0.12 * scale, 20]} />
      </mesh>

      {/* Shaft Keyway coupling / Sprocket */}
      <mesh
        position={[statorLength / 2 + 0.12 * scale, 0, 0]}
        rotation={[0, 0, Math.PI / 2]}
        material={matYellow}
        castShadow
      >
        <cylinderGeometry args={[0.035 * scale, 0.035 * scale, 0.03 * scale, 16]} />
      </mesh>

      {/* Rear Non-Drive End Bell & Fan Cowl */}
      <mesh
        position={[-statorLength / 2 - 0.04 * scale, 0, 0]}
        rotation={[0, 0, Math.PI / 2]}
        material={matAluminum}
        castShadow
      >
        <cylinderGeometry args={[statorRadius * 0.98, statorRadius * 0.95, 0.08 * scale, 24]} />
      </mesh>

      {/* Top Terminal Connection Box (Conduit wiring junction) */}
      <group position={[0, statorRadius + 0.04 * scale, 0]}>
        <mesh material={matCasing} castShadow>
          <boxGeometry args={[0.12 * scale, 0.08 * scale, 0.1 * scale]} />
        </mesh>
        {/* Terminal box lid */}
        <mesh position={[0, 0.045 * scale, 0]} material={matAluminum}>
          <boxGeometry args={[0.13 * scale, 0.01 * scale, 0.11 * scale]} />
        </mesh>
        {/* Conduit cable gland */}
        <mesh
          position={[0, 0, 0.055 * scale]}
          rotation={[Math.PI / 2, 0, 0]}
          material={matChrome}
        >
          <cylinderGeometry args={[0.015, 0.015, 0.025 * scale, 12]} />
        </mesh>
      </group>

      {/* Top Lifting Eyebolt (For crane rigging on 5HP / 10HP) */}
      {(is5HP || is10HP) && (
        <mesh
          position={[0, statorRadius + 0.11 * scale, 0]}
          rotation={[0, Math.PI / 2, 0]}
          material={matChrome}
          castShadow
        >
          <torusGeometry args={[0.022 * scale, 0.006 * scale, 8, 20]} />
        </mesh>
      )}

      {/* High-Torque 10HP Secondary Terminal / Encoder Housing */}
      {is10HP && (
        <mesh
          position={[-statorLength / 2 - 0.08 * scale, 0, 0]}
          rotation={[0, 0, Math.PI / 2]}
          material={matYellow}
          castShadow
        >
          <cylinderGeometry args={[0.04 * scale, 0.04 * scale, 0.04 * scale, 16]} />
        </mesh>
      )}
    </group>
  );
};
