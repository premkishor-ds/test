"use client";

import React, { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { MountingPoint } from "@/types/configurator";
import { useConfiguratorStore } from "@/lib/configurator/configurator-store";
import { industrialMaterials } from "./IndustrialMaterials";

interface MountingPointMarkerProps {
  mountingPoint: MountingPoint;
  isOccupied: boolean;
}

export const MountingPointMarker: React.FC<MountingPointMarkerProps> = ({
  mountingPoint,
  isOccupied,
}) => {
  const meshRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  const draggingComponent = useConfiguratorStore((s) => s.draggingComponent);
  const dragHoverMountingPointId = useConfiguratorStore((s) => s.dragHoverMountingPointId);
  const dragStatus = useConfiguratorStore((s) => s.dragStatus);
  const dragValidationReason = useConfiguratorStore((s) => s.dragValidationReason);
  const selectedMountingPointId = useConfiguratorStore((s) => s.selectedMountingPointId);
  const exploded = useConfiguratorStore((s) => s.exploded);
  const explodedProgress = useConfiguratorStore((s) => s.explodedProgress);

  const setDragHover = useConfiguratorStore((s) => s.setDragHover);
  const installComponent = useConfiguratorStore((s) => s.installComponent);
  const selectMountingPoint = useConfiguratorStore((s) => s.selectMountingPoint);

  const isTargeted = dragHoverMountingPointId === mountingPoint.id;
  const isSelected = selectedMountingPointId === mountingPoint.id;
  const isValidDrop = isTargeted && dragStatus === "VALID_DROP";
  const isInvalidDrop = isTargeted && dragStatus === "INVALID_DROP";

  // Calculate position with exploded offset if exploded view active
  const curPosX = mountingPoint.posX + (exploded ? mountingPoint.explodedX * explodedProgress : 0);
  const curPosY = mountingPoint.posY + (exploded ? mountingPoint.explodedY * explodedProgress : 0);
  const curPosZ = mountingPoint.posZ + (exploded ? mountingPoint.explodedZ * explodedProgress : 0);

  // Subtle pulsing animation on the holographic ring
  useFrame(({ clock }) => {
    if (ringRef.current) {
      const t = clock.getElapsedTime();
      const scaleBase = isTargeted ? 1.25 : 1.0;
      const pulse = Math.sin(t * 4) * 0.08;
      ringRef.current.scale.set(scaleBase + pulse, scaleBase + pulse, 1);
      ringRef.current.rotation.z += 0.015;
    }
  });

  // Determine material based on state
  let markerMaterial = industrialMaterials.mountPointReady;
  if (isValidDrop) markerMaterial = industrialMaterials.mountPointValid;
  if (isInvalidDrop) markerMaterial = industrialMaterials.mountPointInvalid;

  const handlePointerOver = (e: any) => {
    e.stopPropagation();
    setDragHover(mountingPoint.id);
  };

  const handlePointerOut = (e: any) => {
    e.stopPropagation();
    setDragHover(null);
  };

  const handleClick = (e: any) => {
    e.stopPropagation();
    if (draggingComponent) {
      // Install or replace component
      installComponent(mountingPoint.id, draggingComponent);
    } else {
      // Select this mounting point
      selectMountingPoint(mountingPoint.id);
    }
  };

  return (
    <group
      ref={meshRef}
      position={[curPosX, curPosY, curPosZ]}
      rotation={[mountingPoint.rotX, mountingPoint.rotY, mountingPoint.rotZ]}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      name={`MARKER_${mountingPoint.pointId}`}
    >
      {/* Invisible Raycast Hit Box for Easy Clicking & Hovering */}
      <mesh visible={false}>
        <sphereGeometry args={[0.2, 12, 12]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Holographic Glowing Target Rings */}
      <group rotation={[-Math.PI / 2, 0, 0]}>
        {/* Outer segmented ring */}
        <mesh ref={ringRef} material={markerMaterial}>
          <ringGeometry args={[0.09, 0.11, 24]} />
        </mesh>
        {/* Inner solid bullseye dot */}
        <mesh material={markerMaterial}>
          <circleGeometry args={[0.03, 16]} />
        </mesh>
        {/* Coordinate Crosshairs */}
        <mesh material={markerMaterial}>
          <planeGeometry args={[0.24, 0.008]} />
        </mesh>
        <mesh material={markerMaterial}>
          <planeGeometry args={[0.008, 0.24]} />
        </mesh>
      </group>

      {/* Vertical holographic laser marker pin */}
      <mesh position={[0, 0.06, 0]} material={markerMaterial}>
        <cylinderGeometry args={[0.003, 0.003, 0.12, 8]} />
      </mesh>

      {/* Floating 3D HUD Tooltip Label */}
      <Html
        position={[0, 0.16, 0]}
        center
        distanceFactor={6}
        style={{
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        <div
          className={`flex flex-col items-center transition-all duration-200 ${
            isTargeted || isSelected || draggingComponent ? "opacity-100 scale-100" : "opacity-0 scale-90"
          }`}
        >
          <div
            className={`px-2 py-1 rounded text-[11px] font-mono whitespace-nowrap shadow-lg flex items-center gap-1.5 border ${
              isValidDrop
                ? "bg-emerald-950/90 text-emerald-300 border-emerald-500/80 shadow-emerald-500/20"
                : isInvalidDrop
                ? "bg-red-950/90 text-red-300 border-red-500/80 shadow-red-500/20"
                : isSelected
                ? "bg-cyan-950/90 text-cyan-300 border-cyan-500 shadow-cyan-500/20"
                : "bg-slate-900/85 text-slate-300 border-slate-700/80"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isValidDrop
                  ? "bg-emerald-400 animate-pulse"
                  : isInvalidDrop
                  ? "bg-red-500 animate-ping"
                  : isOccupied
                  ? "bg-amber-400"
                  : "bg-cyan-400"
              }`}
            />
            <span className="font-semibold">{mountingPoint.pointId}</span>
            {isOccupied && !draggingComponent && (
              <span className="text-[9px] text-slate-400 font-sans">(Installed)</span>
            )}
            {isValidDrop && (
              <span className="text-[10px] text-emerald-400 font-sans font-bold">
                ✓ Click or Drop to Snap
              </span>
            )}
          </div>

          {/* Validation error message tooltip */}
          {isInvalidDrop && dragValidationReason && (
            <div className="mt-1 max-w-[220px] px-2 py-1 bg-red-900/95 border border-red-500 text-white text-[10px] rounded leading-tight text-center shadow-xl">
              {dragValidationReason}
            </div>
          )}
        </div>
      </Html>
    </group>
  );
};
