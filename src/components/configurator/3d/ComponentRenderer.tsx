"use client";

import React, { useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useGLTF, TransformControls } from "@react-three/drei";
import { InstalledComponent, MountingPoint } from "@/types/configurator";
import { useConfiguratorStore } from "@/lib/configurator/configurator-store";
import { MotorMesh } from "./MotorMesh";
import { ConveyorMesh } from "./ConveyorMesh";
import { SensorMesh } from "./SensorMesh";
import { ControlCabinetMesh } from "./ControlCabinetMesh";
import { SafetyGuardMesh } from "./SafetyGuardMesh";
import { EstopMesh } from "./EstopMesh";
import { ToolingMesh } from "./ToolingMesh";
import { RoboticArmMesh } from "./RoboticArmMesh";
import { OpticsLaserMesh } from "./OpticsLaserMesh";
import { ActuatorMesh } from "./ActuatorMesh";

interface ComponentRendererProps {
  installed: InstalledComponent;
  mountingPoint: MountingPoint;
  index: number;
}

// Optional GLB Loader wrapper with fallback
const GLBLoader: React.FC<{ url: string; fallback: React.ReactNode }> = ({ url, fallback }) => {
  try {
    const { scene } = useGLTF(url);
    return <primitive object={scene.clone()} />;
  } catch {
    return <>{fallback}</>;
  }
};

export const ComponentRenderer: React.FC<ComponentRendererProps> = ({
  installed,
  mountingPoint,
  index,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const comp = installed.component;

  const exploded = useConfiguratorStore((s) => s.exploded);
  const explodedProgress = useConfiguratorStore((s) => s.explodedProgress);
  const assemblyAnimationPlaying = useConfiguratorStore((s) => s.assemblyAnimationPlaying);
  const selectMountingPoint = useConfiguratorStore((s) => s.selectMountingPoint);
  const selectedMountingPointId = useConfiguratorStore((s) => s.selectedMountingPointId);
  const hiddenMountingPointIds = useConfiguratorStore((s) => s.hiddenMountingPointIds);
  const isolatedMountingPointId = useConfiguratorStore((s) => s.isolatedMountingPointId);
  const transformMode = useConfiguratorStore((s) => s.transformMode);
  const updateComponentCustomSettings = useConfiguratorStore((s) => s.updateComponentCustomSettings);

  const isSelected = selectedMountingPointId === mountingPoint.id;
  const isTransforming = isSelected && (transformMode === "translate" || transformMode === "rotate");

  // Snapping animation state (lerp into position on mount or replacement)
  const [animProgress, setAnimProgress] = useState(0);

  // Target base coordinates
  const targetX = mountingPoint.posX;
  const targetY = mountingPoint.posY;
  const targetZ = mountingPoint.posZ;

  // Exploded offsets
  const expX = mountingPoint.explodedX || 0;
  const expY = mountingPoint.explodedY || 0;
  const expZ = mountingPoint.explodedZ || 0;

  // Trigger smooth snap interpolation when component changes
  useEffect(() => {
    setAnimProgress(0);
  }, [comp.id, mountingPoint.id]);

  // Frame loop for smooth lerp snapping and exploded view position
  useFrame((_, delta) => {
    if (!groupRef.current) return;
    if (isTransforming) return; // Do not overwrite position while actively manipulating with transform gizmo

    // Smooth entrance / snap lerp
    if (animProgress < 1) {
      const nextProgress = Math.min(1, animProgress + delta * 3.5);
      setAnimProgress(nextProgress);
    }

    // Exploded view progression
    const curExp = exploded ? explodedProgress : 0;
    const finalExpX = expX * curExp;
    const finalExpY = expY * curExp;
    const finalExpZ = expZ * curExp;

    // Smooth snap: start slightly above and rotate into place
    const entranceOffsetY = (1 - animProgress) * 0.4;
    const entranceOffsetRot = (1 - animProgress) * 0.3;

    groupRef.current.position.x = THREE.MathUtils.lerp(
      groupRef.current.position.x,
      targetX + finalExpX,
      0.2
    );
    groupRef.current.position.y = THREE.MathUtils.lerp(
      groupRef.current.position.y,
      targetY + finalExpY + entranceOffsetY,
      0.2
    );
    groupRef.current.position.z = THREE.MathUtils.lerp(
      groupRef.current.position.z,
      targetZ + finalExpZ,
      0.2
    );

    // Rotation alignment
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      mountingPoint.rotX + entranceOffsetRot,
      0.2
    );
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      mountingPoint.rotY,
      0.2
    );
    groupRef.current.rotation.z = THREE.MathUtils.lerp(
      groupRef.current.rotation.z,
      mountingPoint.rotZ,
      0.2
    );
  });

  const handleClick = (e: any) => {
    e.stopPropagation();
    selectMountingPoint(mountingPoint.id);
  };

  const isHidden =
    hiddenMountingPointIds.includes(mountingPoint.id) ||
    (isolatedMountingPointId !== null && isolatedMountingPointId !== mountingPoint.id);

  if (isHidden) return null;

  // Render appropriate 3D Mesh
  const renderMesh = () => {
    const catSlug = comp.category?.slug || "";

    if (catSlug === "motors") {
      return <MotorMesh component={comp} customSettings={installed.customSettings} />;
    }
    if (catSlug === "conveyors") {
      return <ConveyorMesh component={comp} customSettings={installed.customSettings} />;
    }
    if (catSlug === "sensors") {
      return <SensorMesh component={comp} />;
    }
    if (catSlug === "controls") {
      return <ControlCabinetMesh component={comp} />;
    }
    if (catSlug === "tooling") {
      return <ToolingMesh component={comp} />;
    }
    if (catSlug === "robotics") {
      return <RoboticArmMesh component={comp} />;
    }
    if (catSlug === "optics-laser") {
      return <OpticsLaserMesh component={comp} />;
    }
    if (catSlug === "actuators" || catSlug === "material-feed") {
      return <ActuatorMesh component={comp} />;
    }
    if (catSlug === "safety") {
      if (comp.partNumber === "SFT-002") {
        return <EstopMesh component={comp} />;
      }
      return <SafetyGuardMesh component={comp} />;
    }

    // Default fallback
    return <MotorMesh component={comp} customSettings={installed.customSettings} />;
  };

  return (
    <group
      ref={groupRef}
      position={[targetX, targetY + 0.3, targetZ]}
      onClick={handleClick}
      name={`INSTALLED_${comp.partNumber}_AT_${mountingPoint.pointId}`}
    >
      {/* If GLB URL provided and valid, try to render GLB; otherwise procedural */}
      {comp.modelGlbUrl ? (
        <GLBLoader url={comp.modelGlbUrl} fallback={renderMesh()} />
      ) : (
        renderMesh()
      )}

      {/* Selected Component Subtle Holographic Bounding Indicator */}
      {isSelected && (
        <mesh position={[0, 0, 0]} visible={true}>
          <boxGeometry args={[0.3, 0.3, 0.3]} />
          <meshBasicMaterial
            color="#06b6d4"
            wireframe
            transparent
            opacity={0.35}
          />
        </mesh>
      )}

      {/* CAD Transform Gizmo when selected and in Move / Rotate mode */}
      {isTransforming && (
        <TransformControls
          object={groupRef as any}
          mode={transformMode as "translate" | "rotate"}
          size={0.65}
          onMouseUp={() => {
            if (groupRef.current) {
              const pos = groupRef.current.position;
              const rot = groupRef.current.rotation;
              updateComponentCustomSettings(mountingPoint.id, {
                transformOffset: {
                  x: Number(pos.x.toFixed(3)),
                  y: Number(pos.y.toFixed(3)),
                  z: Number(pos.z.toFixed(3)),
                  rotY: Number(rot.y.toFixed(3)),
                },
              });
            }
          }}
        />
      )}
    </group>
  );
};
