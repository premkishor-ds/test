"use client";

import React from "react";
import * as THREE from "three";
import { industrialMaterials } from "./IndustrialMaterials";
import { ComponentItem } from "@/types/configurator";
import { useConfiguratorStore } from "@/lib/configurator/configurator-store";

interface ControlCabinetMeshProps {
  component: ComponentItem;
  isGhost?: boolean;
}

export const ControlCabinetMesh: React.FC<ControlCabinetMeshProps> = ({
  component,
  isGhost = false,
}) => {
  const wireframeMode = useConfiguratorStore((s) => s.wireframeMode);
  const isHighCapacity = component.partNumber === "CTL-002";

  const width = isHighCapacity ? 0.45 : 0.35;
  const height = isHighCapacity ? 0.55 : 0.42;
  const depth = isHighCapacity ? 0.22 : 0.16;

  let matCabinet: THREE.Material = isHighCapacity ? industrialMaterials.cabinetGrey : industrialMaterials.cabinetGrey;
  if (isGhost) matCabinet = industrialMaterials.ghostPreviewMat;
  if (wireframeMode) matCabinet = industrialMaterials.wireframeMat;

  const matScreen = isGhost ? industrialMaterials.ghostPreviewMat : industrialMaterials.hmiScreen;
  const matChrome = isGhost ? industrialMaterials.ghostPreviewMat : industrialMaterials.polishedChrome;
  const matYellow = isGhost ? industrialMaterials.ghostPreviewMat : industrialMaterials.safetyYellow;
  const matRed = isGhost ? industrialMaterials.ghostPreviewMat : industrialMaterials.emergencyRed;

  return (
    <group name={`CONTROL_${component.partNumber}`}>
      {/* Supporting Vertical Stand Post from Conveyor Frame */}
      <mesh position={[0, -height / 2 - 0.25, 0]} material={industrialMaterials.chassisSteel} castShadow>
        <boxGeometry args={[0.06, 0.5, 0.06]} />
      </mesh>
      {/* Stand mounting flange */}
      <mesh position={[0, -height / 2 - 0.48, 0]} material={industrialMaterials.chassisSteel}>
        <boxGeometry args={[0.12, 0.02, 0.12]} />
      </mesh>

      {/* Main NEMA / IP54 Sheet Metal Enclosure */}
      <mesh position={[0, 0, 0]} material={matCabinet} castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
      </mesh>

      {/* Cabinet Door Bevel Lip */}
      <mesh position={[0, 0, depth / 2 + 0.005]} material={matCabinet}>
        <boxGeometry args={[width * 0.96, height * 0.96, 0.01]} />
      </mesh>

      {/* Illuminated Color HMI Touchscreen (Facing Forward) */}
      <group position={[0, height * 0.15, depth / 2 + 0.012]}>
        {/* Screen bezel */}
        <mesh material={industrialMaterials.chassisSteel}>
          <boxGeometry args={[width * 0.65, height * 0.35, 0.006]} />
        </mesh>
        {/* Active glowing display glass */}
        <mesh position={[0, 0, 0.004]} material={matScreen}>
          <boxGeometry args={[width * 0.58, height * 0.28, 0.002]} />
        </mesh>
      </group>

      {/* Rotary Main Power Disconnect Switch (Red handle on Yellow escutcheon) */}
      <group position={[width * 0.28, -height * 0.18, depth / 2 + 0.012]}>
        <mesh material={matYellow} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 0.005, 16]} />
        </mesh>
        <mesh position={[0, 0, 0.012]} material={matRed}>
          <boxGeometry args={[0.01, 0.035, 0.02]} />
        </mesh>
      </group>

      {/* Industrial Pushbutton Operators (Start / Stop / Reset) */}
      {[-0.04, 0, 0.04].map((xOffset, i) => (
        <mesh
          key={`btn-${i}`}
          position={[xOffset, -height * 0.18, depth / 2 + 0.012]}
          rotation={[Math.PI / 2, 0, 0]}
          material={
            i === 0
              ? industrialMaterials.mountPointValid
              : i === 1
              ? industrialMaterials.emergencyRed
              : matYellow
          }
        >
          <cylinderGeometry args={[0.01, 0.01, 0.01, 16]} />
        </mesh>
      ))}

      {/* High-Capacity Dual Door Seam or Top Warning Andon Stack Light */}
      {isHighCapacity && (
        <group position={[0, height / 2 + 0.08, 0]}>
          {/* Stack light aluminum mast */}
          <mesh material={matChrome}>
            <cylinderGeometry args={[0.008, 0.008, 0.12, 12]} />
          </mesh>
          {/* Green tier */}
          <mesh position={[0, 0.08, 0]} material={industrialMaterials.mountPointValid}>
            <cylinderGeometry args={[0.016, 0.016, 0.025, 16]} />
          </mesh>
          {/* Amber tier */}
          <mesh position={[0, 0.11, 0]} material={matYellow}>
            <cylinderGeometry args={[0.016, 0.016, 0.025, 16]} />
          </mesh>
          {/* Red tier */}
          <mesh position={[0, 0.14, 0]} material={matRed}>
            <cylinderGeometry args={[0.016, 0.016, 0.025, 16]} />
          </mesh>
        </group>
      )}

      {/* Door Keylock Latches */}
      <mesh position={[-width * 0.42, 0.1, depth / 2 + 0.01]} material={matChrome} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.008, 0.008, 0.006, 12]} />
      </mesh>
      <mesh position={[-width * 0.42, -0.1, depth / 2 + 0.01]} material={matChrome} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.008, 0.008, 0.006, 12]} />
      </mesh>
    </group>
  );
};
