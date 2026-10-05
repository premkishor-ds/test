"use client";

import React from "react";
import * as THREE from "three";
import { industrialMaterials } from "./IndustrialMaterials";
import { ComponentItem } from "@/types/configurator";
import { useConfiguratorStore } from "@/lib/configurator/configurator-store";

interface ConveyorMeshProps {
  component: ComponentItem;
  isGhost?: boolean;
  customSettings?: Record<string, any>;
}

export const ConveyorMesh: React.FC<ConveyorMeshProps> = ({
  component,
  isGhost = false,
  customSettings,
}) => {
  const wireframeMode = useConfiguratorStore((s) => s.wireframeMode);

  const is6M = component.partNumber === "CVY-006";
  const is4M = component.partNumber === "CVY-004";

  // Dynamic length based on customSettings or conveyor model
  const trackLength = customSettings?.length
    ? Number(customSettings.length)
    : is6M
    ? 5.2
    : is4M
    ? 3.4
    : 2.2;
  const trackWidth = customSettings?.width ? Number(customSettings.width) : 0.65;
  const bedHeight = 0.08;

  let matBelt: THREE.Material = is6M
    ? industrialMaterials.conveyorBeltBlack
    : is4M
    ? industrialMaterials.conveyorBeltBlack
    : industrialMaterials.conveyorBeltPvc;

  if (isGhost) matBelt = industrialMaterials.ghostPreviewMat;
  if (wireframeMode) matBelt = industrialMaterials.wireframeMat;

  const matFrame = isGhost ? industrialMaterials.ghostPreviewMat : industrialMaterials.brushedAluminum;
  const matChrome = isGhost ? industrialMaterials.ghostPreviewMat : industrialMaterials.polishedChrome;
  const matYellow = isGhost ? industrialMaterials.ghostPreviewMat : industrialMaterials.safetyYellow;

  return (
    <group name={`CONVEYOR_${component.partNumber}`}>
      {/* Conveyor Bed Slider Plate */}
      <mesh position={[0, 0, 0]} material={matFrame} castShadow receiveShadow>
        <boxGeometry args={[trackLength, bedHeight, trackWidth]} />
      </mesh>

      {/* Main Top Conveyor Belt Surface (or Steel Rollers for 6m) */}
      {!is6M ? (
        <group position={[0, bedHeight / 2 + 0.008, 0]}>
          <mesh material={matBelt} receiveShadow>
            <boxGeometry args={[trackLength - 0.08, 0.012, trackWidth - 0.06]} />
          </mesh>
          {/* Subtle belt chevron / texture ridges */}
          {Array.from({ length: Math.max(6, Math.floor(trackLength * 6)) }).map((_, i) => {
            const count = Math.max(6, Math.floor(trackLength * 6));
            const xOffset = -trackLength / 2 + 0.2 + (i * (trackLength - 0.4)) / count;
            return (
              <mesh key={`ridge-${i}`} position={[xOffset, 0.007, 0]} material={matBelt}>
                <boxGeometry args={[0.015, 0.004, trackWidth - 0.08]} />
              </mesh>
            );
          })}
        </group>
      ) : (
        /* 6m Heavy-Duty Steel Roller Deck */
        <group position={[0, bedHeight / 2 + 0.02, 0]}>
          {Array.from({ length: Math.max(10, Math.floor(trackLength * 5)) }).map((_, i) => {
            const rollerCount = Math.max(10, Math.floor(trackLength * 5));
            const xPos = -trackLength / 2 + 0.15 + (i * (trackLength - 0.3)) / Math.max(1, rollerCount - 1);
            return (
              <mesh
                key={`roller-${i}`}
                position={[xPos, 0, 0]}
                rotation={[Math.PI / 2, 0, 0]}
                material={matChrome}
                castShadow
              >
                <cylinderGeometry args={[0.03, 0.03, trackWidth - 0.05, 20]} />
              </mesh>
            );
          })}
        </group>
      )}

      {/* Side Guide Rails (Front & Rear) */}
      <mesh
        position={[0, bedHeight / 2 + 0.04, trackWidth / 2 - 0.015]}
        material={matFrame}
        castShadow
      >
        <boxGeometry args={[trackLength, 0.06, 0.025]} />
      </mesh>
      <mesh
        position={[0, bedHeight / 2 + 0.04, -trackWidth / 2 + 0.015]}
        material={matFrame}
        castShadow
      >
        <boxGeometry args={[trackLength, 0.06, 0.025]} />
      </mesh>

      {/* Guide Rail Low-Friction Polymer Strips */}
      <mesh
        position={[0, bedHeight / 2 + 0.045, trackWidth / 2 - 0.03]}
        material={matYellow}
      >
        <boxGeometry args={[trackLength, 0.015, 0.01]} />
      </mesh>
      <mesh
        position={[0, bedHeight / 2 + 0.045, -trackWidth / 2 + 0.03]}
        material={matYellow}
      >
        <boxGeometry args={[trackLength, 0.015, 0.01]} />
      </mesh>

      {/* Head Drive Pulley Drum (at -length/2) */}
      <mesh
        position={[-trackLength / 2 + 0.04, 0, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        material={matChrome}
        castShadow
      >
        <cylinderGeometry args={[0.065, 0.065, trackWidth - 0.02, 24]} />
      </mesh>

      {/* Tail Idler Pulley Drum (at +length/2) */}
      <mesh
        position={[trackLength / 2 - 0.04, 0, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        material={matChrome}
        castShadow
      >
        <cylinderGeometry args={[0.065, 0.065, trackWidth - 0.02, 24]} />
      </mesh>

      {/* Integrated Tension Adjustment Blocks at End */}
      <mesh position={[trackLength / 2 - 0.06, 0, trackWidth / 2 + 0.01]} material={matChrome}>
        <boxGeometry args={[0.08, 0.04, 0.03]} />
      </mesh>
      <mesh position={[trackLength / 2 - 0.06, 0, -trackWidth / 2 - 0.01]} material={matChrome}>
        <boxGeometry args={[0.08, 0.04, 0.03]} />
      </mesh>
    </group>
  );
};
