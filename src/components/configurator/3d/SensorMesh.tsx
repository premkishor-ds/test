"use client";

import React from "react";
import * as THREE from "three";
import { industrialMaterials } from "./IndustrialMaterials";
import { ComponentItem } from "@/types/configurator";
import { useConfiguratorStore } from "@/lib/configurator/configurator-store";

interface SensorMeshProps {
  component: ComponentItem;
  isGhost?: boolean;
}

export const SensorMesh: React.FC<SensorMeshProps> = ({ component, isGhost = false }) => {
  const wireframeMode = useConfiguratorStore((s) => s.wireframeMode);
  const isIP67 = component.partNumber === "SEN-002";

  let matCasing: THREE.Material = isIP67 ? industrialMaterials.polishedChrome : industrialMaterials.cabinetGrey;
  if (isGhost) matCasing = industrialMaterials.ghostPreviewMat;
  if (wireframeMode) matCasing = industrialMaterials.wireframeMat;

  const matBracket = isGhost ? industrialMaterials.ghostPreviewMat : industrialMaterials.brushedAluminum;
  const matEmitter = isGhost ? industrialMaterials.ghostPreviewMat : industrialMaterials.laserEmitter;
  const matBeam = industrialMaterials.laserBeam;

  return (
    <group name={`SENSOR_${component.partNumber}`}>
      {/* Aluminum Angle Mounting Bracket Clamped to Frame */}
      <group position={[0, -0.08, 0]}>
        {/* Vertical bracket stem */}
        <mesh position={[0, 0.04, 0]} material={matBracket} castShadow>
          <boxGeometry args={[0.04, 0.12, 0.006]} />
        </mesh>
        {/* Horizontal clamping flange with bolt */}
        <mesh position={[0, -0.02, -0.03]} material={matBracket} castShadow>
          <boxGeometry args={[0.05, 0.008, 0.06]} />
        </mesh>
        <mesh position={[0, -0.015, -0.03]} material={industrialMaterials.chassisSteel}>
          <cylinderGeometry args={[0.008, 0.008, 0.02, 12]} />
        </mesh>
      </group>

      {!isIP67 ? (
        /* Standard Rectangular Photoelectric Sensor (SEN-001) */
        <group position={[0, 0, 0]}>
          <mesh material={matCasing} castShadow>
            <boxGeometry args={[0.035, 0.06, 0.03]} />
          </mesh>
          {/* Optical Emitter & Receiver Lens (Facing inward toward conveyor track) */}
          <mesh position={[0, 0.01, -0.016]} material={matEmitter} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.007, 0.007, 0.004, 16]} />
          </mesh>
          {/* Top Status LED (Green = Power/Output Active) */}
          <mesh position={[0, 0.031, 0]} material={industrialMaterials.mountPointValid}>
            <boxGeometry args={[0.008, 0.003, 0.008]} />
          </mesh>
          {/* M12 Connector Cable Lead */}
          <mesh position={[0, -0.035, 0]} material={industrialMaterials.chassisSteel}>
            <cylinderGeometry args={[0.005, 0.005, 0.03, 12]} />
          </mesh>
        </group>
      ) : (
        /* IP67 Stainless Steel Threaded Barrel Sensor (SEN-002) */
        <group position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <mesh material={matCasing} castShadow>
            <cylinderGeometry args={[0.016, 0.016, 0.08, 20]} />
          </mesh>
          {/* Hex Locknuts */}
          <mesh position={[0, -0.01, 0]} material={matBracket} castShadow>
            <cylinderGeometry args={[0.022, 0.022, 0.01, 6]} />
          </mesh>
          <mesh position={[0, 0.01, 0]} material={matBracket} castShadow>
            <cylinderGeometry args={[0.022, 0.022, 0.01, 6]} />
          </mesh>
          {/* Optical Sapphire Laser Lens */}
          <mesh position={[0, 0.041, 0]} material={matEmitter}>
            <cylinderGeometry args={[0.01, 0.01, 0.003, 16]} />
          </mesh>
        </group>
      )}

      {/* Subtle Holographic Laser Detection Beam spanning across conveyor track */}
      {!isGhost && !wireframeMode && (
        <group position={[0, 0.01, -0.3]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} material={matBeam}>
            <cylinderGeometry args={[0.002, 0.008, 0.6, 12]} />
          </mesh>
        </group>
      )}
    </group>
  );
};
