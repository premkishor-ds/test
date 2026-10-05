"use client";

import React from "react";
import * as THREE from "three";
import { industrialMaterials } from "./IndustrialMaterials";
import { ComponentItem } from "@/types/configurator";
import { useConfiguratorStore } from "@/lib/configurator/configurator-store";

interface RoboticArmMeshProps {
  component: ComponentItem;
  isGhost?: boolean;
}

export const RoboticArmMesh: React.FC<RoboticArmMeshProps> = ({ component, isGhost = false }) => {
  const wireframeMode = useConfiguratorStore((s) => s.wireframeMode);

  let matOrange: THREE.Material = isGhost ? industrialMaterials.ghostPreviewMat : industrialMaterials.industrialOrange;
  let matCarbon: THREE.Material = isGhost ? industrialMaterials.ghostPreviewMat : industrialMaterials.carbonFiber;
  let matSteel: THREE.Material = isGhost ? industrialMaterials.ghostPreviewMat : industrialMaterials.chassisSteel;
  let matChrome: THREE.Material = isGhost ? industrialMaterials.ghostPreviewMat : industrialMaterials.polishedChrome;

  if (wireframeMode) {
    matOrange = industrialMaterials.wireframeMat;
    matCarbon = industrialMaterials.wireframeMat;
    matSteel = industrialMaterials.wireframeMat;
    matChrome = industrialMaterials.wireframeMat;
  }

  const isDelta = component.partNumber.includes("DEL");

  if (isDelta) {
    // High-speed parallel kinematic Delta Robot
    return (
      <group name={`ROBOT_DELTA_${component.partNumber}`}>
        {/* Overhead Triangular Base Plate */}
        <mesh position={[0, 0.45, 0]} material={matSteel} castShadow>
          <cylinderGeometry args={[0.38, 0.38, 0.05, 6]} />
        </mesh>
        {/* 3 Upper Direct-Drive Torque Servo Motors */}
        {[0, (2 * Math.PI) / 3, (4 * Math.PI) / 3].map((angle, i) => {
          const r = 0.28;
          return (
            <group key={`delta-leg-${i}`} position={[Math.cos(angle) * r, 0.45, Math.sin(angle) * r]}>
              {/* Motor */}
              <mesh position={[0, 0.08, 0]} material={matOrange} castShadow>
                <cylinderGeometry args={[0.06, 0.06, 0.12, 16]} />
              </mesh>
              {/* Upper Bicep Arm (Aluminum) */}
              <mesh
                position={[0, -0.15, 0]}
                rotation={[0.4 * Math.sin(angle), 0, 0.4 * Math.cos(angle)]}
                material={matOrange}
                castShadow
              >
                <boxGeometry args={[0.04, 0.35, 0.04]} />
              </mesh>
              {/* Carbon Fiber Dual Parallel Rods */}
              <mesh
                position={[0, -0.42, 0]}
                rotation={[-0.3 * Math.sin(angle), 0, -0.3 * Math.cos(angle)]}
                material={matCarbon}
              >
                <cylinderGeometry args={[0.008, 0.008, 0.45, 8]} />
              </mesh>
            </group>
          );
        })}
        {/* Lower Mobile End-Effector Delta Star Platform */}
        <mesh position={[0, -0.22, 0]} material={matChrome} castShadow>
          <cylinderGeometry args={[0.12, 0.12, 0.03, 6]} />
        </mesh>
      </group>
    );
  }

  // 6-Axis Articulated Robot Arm
  return (
    <group name={`ROBOT_6AXIS_${component.partNumber}`}>
      {/* Base Pedestal (Axis 1 J1) */}
      <mesh position={[0, 0.1, 0]} material={matSteel} castShadow>
        <cylinderGeometry args={[0.22, 0.25, 0.2, 24]} />
      </mesh>
      {/* Rotating Turret Shoulder */}
      <mesh position={[0, 0.28, 0]} material={matOrange} castShadow>
        <boxGeometry args={[0.26, 0.18, 0.28]} />
      </mesh>
      {/* Lower Arm Boom (Axis 2 J2) */}
      <mesh position={[0.08, 0.6, 0]} rotation={[0, 0, -0.2]} material={matOrange} castShadow>
        <boxGeometry args={[0.16, 0.55, 0.18]} />
      </mesh>
      {/* Elbow Joint (Axis 3 J3) */}
      <mesh position={[0.15, 0.9, 0]} rotation={[Math.PI / 2, 0, 0]} material={matSteel} castShadow>
        <cylinderGeometry args={[0.09, 0.09, 0.22, 20]} />
      </mesh>
      {/* Upper Forearm (Axis 4 J4) */}
      <mesh position={[0.35, 0.98, 0]} rotation={[0, 0, 0.7]} material={matOrange} castShadow>
        <boxGeometry args={[0.12, 0.48, 0.14]} />
      </mesh>
      {/* Wrist Roll & Pitch (Axis 5 & 6) */}
      <mesh position={[0.55, 0.82, 0]} rotation={[0, 0, -0.6]} material={matSteel} castShadow>
        <cylinderGeometry args={[0.065, 0.065, 0.18, 16]} />
      </mesh>
      {/* Tool Mounting Faceplate Flange */}
      <mesh position={[0.62, 0.75, 0]} rotation={[0, 0, -0.6]} material={matChrome} castShadow>
        <cylinderGeometry args={[0.055, 0.055, 0.03, 20]} />
      </mesh>
    </group>
  );
};
