"use client";

import React from "react";
import * as THREE from "three";
import { industrialMaterials } from "./IndustrialMaterials";
import { ComponentItem } from "@/types/configurator";
import { useConfiguratorStore } from "@/lib/configurator/configurator-store";

interface SafetyGuardMeshProps {
  component: ComponentItem;
  isGhost?: boolean;
}

export const SafetyGuardMesh: React.FC<SafetyGuardMeshProps> = ({ component, isGhost = false }) => {
  const wireframeMode = useConfiguratorStore((s) => s.wireframeMode);

  let matYellow: THREE.Material = isGhost ? industrialMaterials.ghostPreviewMat : industrialMaterials.safetyYellow;
  if (wireframeMode) matYellow = industrialMaterials.wireframeMat;

  const matSteel = isGhost ? industrialMaterials.ghostPreviewMat : industrialMaterials.chassisSteel;
  const matChrome = isGhost ? industrialMaterials.ghostPreviewMat : industrialMaterials.polishedChrome;

  const width = 0.42;
  const height = 0.38;
  const depth = 0.32;
  const wireRadius = 0.004;

  return (
    <group name={`SAFETY_GUARD_${component.partNumber}`}>
      {/* Structural Outer Tubular Yellow Frame */}
      <mesh position={[0, height / 2, depth / 2]} material={matYellow} castShadow>
        <boxGeometry args={[width, 0.02, 0.02]} />
      </mesh>
      <mesh position={[0, -height / 2, depth / 2]} material={matYellow} castShadow>
        <boxGeometry args={[width, 0.02, 0.02]} />
      </mesh>
      <mesh position={[0, height / 2, -depth / 2]} material={matYellow} castShadow>
        <boxGeometry args={[width, 0.02, 0.02]} />
      </mesh>
      <mesh position={[0, -height / 2, -depth / 2]} material={matYellow} castShadow>
        <boxGeometry args={[width, 0.02, 0.02]} />
      </mesh>

      {/* 4 Vertical Corner Struts */}
      {[
        [-width / 2, 0, -depth / 2],
        [-width / 2, 0, depth / 2],
        [width / 2, 0, -depth / 2],
        [width / 2, 0, depth / 2],
      ].map(([x, y, z], i) => (
        <mesh key={`post-${i}`} position={[x, y, z]} material={matYellow} castShadow>
          <boxGeometry args={[0.02, height, 0.02]} />
        </mesh>
      ))}

      {/* Heavy Steel Wire Mesh Infill Grille (Front face) */}
      {Array.from({ length: 9 }).map((_, i) => {
        const yPos = -height / 2 + 0.04 + (i * (height - 0.08)) / 8;
        return (
          <mesh key={`h-wire-${i}`} position={[0, yPos, depth / 2]} material={matSteel}>
            <boxGeometry args={[width - 0.02, wireRadius * 2, wireRadius * 2]} />
          </mesh>
        );
      })}
      {Array.from({ length: 9 }).map((_, i) => {
        const xPos = -width / 2 + 0.04 + (i * (width - 0.08)) / 8;
        return (
          <mesh key={`v-wire-${i}`} position={[xPos, 0, depth / 2]} material={matSteel}>
            <boxGeometry args={[wireRadius * 2, height - 0.02, wireRadius * 2]} />
          </mesh>
        );
      })}

      {/* Quick-Release Knurled Fasteners */}
      <mesh position={[-width / 2, 0, depth / 2 + 0.015]} material={matChrome} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 0.01, 16]} />
      </mesh>
      <mesh position={[width / 2, 0, depth / 2 + 0.015]} material={matChrome} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 0.01, 16]} />
      </mesh>

      {/* Safety Interlock Contact Switch Housing */}
      <mesh position={[width / 2 + 0.015, height * 0.3, 0]} material={industrialMaterials.emergencyRed}>
        <boxGeometry args={[0.025, 0.05, 0.03]} />
      </mesh>
    </group>
  );
};
