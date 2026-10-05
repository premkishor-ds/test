"use client";

import React, { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useConfiguratorStore } from "@/lib/configurator/configurator-store";
import { MotorMesh } from "./MotorMesh";
import { ConveyorMesh } from "./ConveyorMesh";
import { SensorMesh } from "./SensorMesh";
import { ControlCabinetMesh } from "./ControlCabinetMesh";
import { SafetyGuardMesh } from "./SafetyGuardMesh";
import { EstopMesh } from "./EstopMesh";

export const GhostDraggingMesh: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  const draggingComponent = useConfiguratorStore((s) => s.draggingComponent);
  const dragHoverMountingPointId = useConfiguratorStore((s) => s.dragHoverMountingPointId);
  const dragPosition3D = useConfiguratorStore((s) => s.dragPosition3D);
  const dragRotationY = useConfiguratorStore((s) => s.dragRotationY);
  const mountingPoints = useConfiguratorStore((s) => s.mountingPoints);

  const hoverMP = mountingPoints.find((mp) => mp.id === dragHoverMountingPointId);

  useFrame(() => {
    if (!groupRef.current) return;
    if (hoverMP) {
      // Snapped onto mounting point: float slightly above it with mounting point rotation
      groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, hoverMP.posX, 0.3);
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, hoverMP.posY + 0.15, 0.3);
      groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, hoverMP.posZ, 0.3);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, hoverMP.rotX, 0.3);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, hoverMP.rotY + dragRotationY, 0.3);
      groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, hoverMP.rotZ, 0.3);
    } else if (dragPosition3D) {
      // Free 3D space tracking along ground raycast plane
      groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, dragPosition3D[0], 0.3);
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, dragPosition3D[1] + 0.25, 0.3);
      groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, dragPosition3D[2], 0.3);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, 0, 0.3);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, dragRotationY, 0.3);
      groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, 0, 0.3);
    }
  });

  if (!draggingComponent || (!hoverMP && !dragPosition3D)) return null;

  const renderGhost = () => {
    const catSlug = draggingComponent.category?.slug || "";
    if (catSlug === "motors") return <MotorMesh component={draggingComponent} isGhost />;
    if (catSlug === "conveyors") return <ConveyorMesh component={draggingComponent} isGhost />;
    if (catSlug === "sensors") return <SensorMesh component={draggingComponent} isGhost />;
    if (catSlug === "controls") return <ControlCabinetMesh component={draggingComponent} isGhost />;
    if (catSlug === "safety") {
      if (draggingComponent.partNumber === "SFT-002") return <EstopMesh component={draggingComponent} isGhost />;
      return <SafetyGuardMesh component={draggingComponent} isGhost />;
    }
    return <MotorMesh component={draggingComponent} isGhost />;
  };

  return (
    <group ref={groupRef} name="GHOST_DRAG_PREVIEW">
      {renderGhost()}
    </group>
  );
};
