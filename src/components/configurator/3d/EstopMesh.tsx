"use client";

import React from "react";
import * as THREE from "three";
import { industrialMaterials } from "./IndustrialMaterials";
import { ComponentItem } from "@/types/configurator";
import { useConfiguratorStore } from "@/lib/configurator/configurator-store";

interface EstopMeshProps {
  component: ComponentItem;
  isGhost?: boolean;
}

export const EstopMesh: React.FC<EstopMeshProps> = ({ component, isGhost = false }) => {
  const wireframeMode = useConfiguratorStore((s) => s.wireframeMode);

  let matYellow: THREE.Material = isGhost ? industrialMaterials.ghostPreviewMat : industrialMaterials.safetyYellow;
  if (wireframeMode) matYellow = industrialMaterials.wireframeMat;

  const matRed = isGhost ? industrialMaterials.ghostPreviewMat : industrialMaterials.emergencyRed;
  const matChrome = isGhost ? industrialMaterials.ghostPreviewMat : industrialMaterials.polishedChrome;
  const matPost = isGhost ? industrialMaterials.ghostPreviewMat : industrialMaterials.chassisSteel;

  return (
    <group name={`ESTOP_${component.partNumber}`}>
      {/* Supporting Pedestal Post bolted to frame rail */}
      <mesh position={[0, -0.22, 0]} material={matPost} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 0.35, 16]} />
      </mesh>
      {/* Mounting flange */}
      <mesh position={[0, -0.38, 0]} material={matPost}>
        <cylinderGeometry args={[0.045, 0.045, 0.015, 16]} />
      </mesh>

      {/* Die-Cast Yellow Station Enclosure Box */}
      <mesh position={[0, 0, 0]} material={matYellow} castShadow>
        <boxGeometry args={[0.09, 0.09, 0.07]} />
      </mesh>

      {/* Yellow / Black Legend Plate Disc around button */}
      <mesh position={[0, 0, 0.036]} material={matYellow} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.038, 0.038, 0.003, 24]} />
      </mesh>

      {/* Chrome Button Collar Stem */}
      <mesh position={[0, 0, 0.045]} material={matChrome} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.014, 0.014, 0.018, 20]} />
      </mesh>

      {/* Prominent Red Mushroom Operator Head (40mm palm button) */}
      <group position={[0, 0, 0.065]} rotation={[Math.PI / 2, 0, 0]}>
        <mesh material={matRed} castShadow>
          <cylinderGeometry args={[0.028, 0.022, 0.022, 24]} />
        </mesh>
        {/* Top Dome of Mushroom Button */}
        <mesh position={[0, 0.011, 0]} material={matRed} castShadow>
          <sphereGeometry args={[0.028, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        </mesh>
      </group>
    </group>
  );
};
