"use client";

import React from "react";
import * as THREE from "three";
import { industrialMaterials } from "./IndustrialMaterials";
import { ComponentItem } from "@/types/configurator";
import { useConfiguratorStore } from "@/lib/configurator/configurator-store";

interface ToolingMeshProps {
  component: ComponentItem;
  isGhost?: boolean;
}

export const ToolingMesh: React.FC<ToolingMeshProps> = ({ component, isGhost = false }) => {
  const wireframeMode = useConfiguratorStore((s) => s.wireframeMode);

  let matSteel: THREE.Material = isGhost ? industrialMaterials.ghostPreviewMat : industrialMaterials.chassisSteel;
  let matChrome: THREE.Material = isGhost ? industrialMaterials.ghostPreviewMat : industrialMaterials.polishedChrome;
  let matAluminum: THREE.Material = isGhost ? industrialMaterials.ghostPreviewMat : industrialMaterials.brushedAluminum;
  let matYellow: THREE.Material = isGhost ? industrialMaterials.ghostPreviewMat : industrialMaterials.safetyYellow;
  let matCyan: THREE.Material = isGhost ? industrialMaterials.ghostPreviewMat : industrialMaterials.laserCyan;

  if (wireframeMode) {
    matSteel = industrialMaterials.wireframeMat;
    matChrome = industrialMaterials.wireframeMat;
    matAluminum = industrialMaterials.wireframeMat;
    matYellow = industrialMaterials.wireframeMat;
  }

  const pNum = component.partNumber;

  // 1. High Speed Milling Spindle
  if (pNum.startsWith("SPN")) {
    return (
      <group name={`TOOLING_SPINDLE_${pNum}`}>
        {/* Main Cylindrical Spindle Housing */}
        <mesh position={[0, 0.25, 0]} material={matChrome} castShadow>
          <cylinderGeometry args={[0.09, 0.1, 0.5, 24]} />
        </mesh>
        {/* Upper Motor Housing Ribs */}
        <mesh position={[0, 0.55, 0]} material={matSteel} castShadow>
          <cylinderGeometry args={[0.11, 0.11, 0.2, 24]} />
        </mesh>
        {/* HSK Tool Taper & Collet Chuck */}
        <mesh position={[0, -0.05, 0]} material={matChrome} castShadow>
          <cylinderGeometry args={[0.06, 0.04, 0.12, 20]} />
        </mesh>
        {/* Endmill Cutting Bit */}
        <mesh position={[0, -0.15, 0]} material={matSteel}>
          <cylinderGeometry args={[0.012, 0.012, 0.1, 16]} />
        </mesh>
        {/* Dual Flexible Coolant Mist Nozzles */}
        {[-0.08, 0.08].map((x, i) => (
          <group key={`nozzle-${i}`} position={[x, 0.05, 0]}>
            <mesh material={matCyan}>
              <cylinderGeometry args={[0.008, 0.008, 0.15, 8]} />
            </mesh>
          </group>
        ))}
      </group>
    );
  }

  // 2. Automatic Tool Changer (ATC Carousel)
  if (pNum.startsWith("ATC")) {
    return (
      <group name={`TOOLING_ATC_${pNum}`}>
        {/* Carousel Central Revolving Hub */}
        <mesh position={[0, 0, 0]} material={matSteel} castShadow>
          <cylinderGeometry args={[0.35, 0.35, 0.06, 32]} />
        </mesh>
        {/* Drive Motor on Hub */}
        <mesh position={[0, 0.12, 0]} material={matAluminum} castShadow>
          <cylinderGeometry args={[0.08, 0.08, 0.18, 16]} />
        </mesh>
        {/* 12 Tool Holder Pockets Array around rim */}
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i * Math.PI * 2) / 12;
          const r = 0.32;
          return (
            <group key={`atc-pocket-${i}`} position={[Math.cos(angle) * r, -0.06, Math.sin(angle) * r]}>
              <mesh material={matChrome} castShadow>
                <cylinderGeometry args={[0.025, 0.02, 0.09, 12]} />
              </mesh>
              <mesh position={[0, -0.07, 0]} material={matYellow}>
                <boxGeometry args={[0.03, 0.015, 0.03]} />
              </mesh>
            </group>
          );
        })}
      </group>
    );
  }

  // 3. Robotic Vacuum or Mechanical Gripper
  if (pNum.startsWith("GRP")) {
    const isVacuum = pNum.includes("VAC");
    return (
      <group name={`TOOLING_GRIPPER_${pNum}`}>
        {/* Robot Wrist Tool Mounting Flange */}
        <mesh position={[0, 0.08, 0]} material={matAluminum} castShadow>
          <cylinderGeometry args={[0.06, 0.06, 0.03, 20]} />
        </mesh>
        {/* Main Gripper Cross-Bracket */}
        <mesh position={[0, 0.03, 0]} material={matSteel} castShadow>
          <boxGeometry args={[0.22, 0.04, 0.12]} />
        </mesh>

        {isVacuum ? (
          /* Vacuum Bellows Cups (x4) */
          [
            [-0.08, -0.04],
            [0.08, -0.04],
            [-0.08, 0.04],
            [0.08, 0.04],
          ].map(([x, z], i) => (
            <group key={`cup-${i}`} position={[x, -0.03, z]}>
              {/* Cup Stem */}
              <mesh material={matChrome}>
                <cylinderGeometry args={[0.008, 0.008, 0.06, 8]} />
              </mesh>
              {/* Rubber Suction Bellows */}
              <mesh position={[0, -0.04, 0]} material={matCyan}>
                <cylinderGeometry args={[0.03, 0.025, 0.03, 16]} />
              </mesh>
            </group>
          ))
        ) : (
          /* Two-Finger Parallel Mechanical Jaws */
          <group position={[0, -0.05, 0]}>
            <mesh position={[-0.05, 0, 0]} material={matChrome} castShadow>
              <boxGeometry args={[0.015, 0.1, 0.03]} />
            </mesh>
            <mesh position={[0.05, 0, 0]} material={matChrome} castShadow>
              <boxGeometry args={[0.015, 0.1, 0.03]} />
            </mesh>
          </group>
        )}
      </group>
    );
  }

  // Default fallback tooling block
  return (
    <group name={`TOOLING_DEFAULT_${pNum}`}>
      <mesh position={[0, 0.1, 0]} material={matSteel} castShadow>
        <boxGeometry args={[0.2, 0.18, 0.2]} />
      </mesh>
      <mesh position={[0, -0.05, 0]} material={matChrome} castShadow>
        <cylinderGeometry args={[0.04, 0.03, 0.12, 16]} />
      </mesh>
    </group>
  );
};
