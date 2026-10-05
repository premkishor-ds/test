"use client";

import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { OrbitControls, Grid, GizmoHelper, GizmoViewport } from "@react-three/drei";
import { useThree, useFrame } from "@react-three/fiber";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { useConfiguratorStore } from "@/lib/configurator/configurator-store";

export const SceneEnvironment: React.FC = () => {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const { camera } = useThree();

  const cameraPreset = useConfiguratorStore((s) => s.cameraPreset);
  const cameraFitTrigger = useConfiguratorStore((s) => s.cameraFitTrigger);
  const cameraResetTrigger = useConfiguratorStore((s) => s.cameraResetTrigger);

  // Handle Preset Camera Views
  useEffect(() => {
    if (!controlsRef.current) return;
    const controls = controlsRef.current;

    switch (cameraPreset) {
      case "TOP":
        camera.position.set(0, 6.5, 0.01);
        controls.target.set(0, 0.85, 0);
        break;
      case "FRONT":
        camera.position.set(0, 1.4, 5.0);
        controls.target.set(0, 0.9, 0);
        break;
      case "SIDE":
        camera.position.set(-5.5, 1.4, 0);
        controls.target.set(0, 0.9, 0);
        break;
      case "ISOMETRIC":
        camera.position.set(-4.0, 3.0, 4.0);
        controls.target.set(0, 0.85, 0);
        break;
      case "DEFAULT":
      default:
        camera.position.set(-4.0, 2.6, 3.8);
        controls.target.set(0, 0.85, 0);
        break;
    }
    controls.update();
  }, [cameraPreset, camera]);

  // Handle Camera Reset
  useEffect(() => {
    if (cameraResetTrigger === 0 || !controlsRef.current) return;
    camera.position.set(-4.0, 2.6, 3.8);
    controlsRef.current.target.set(0, 0.85, 0);
    controlsRef.current.update();
  }, [cameraResetTrigger, camera]);

  // Handle Camera Fit
  useEffect(() => {
    if (cameraFitTrigger === 0 || !controlsRef.current) return;
    camera.position.set(-4.5, 2.5, 4.2);
    controlsRef.current.target.set(0, 0.85, 0);
    controlsRef.current.update();
  }, [cameraFitTrigger, camera]);

  return (
    <>
      {/* Precision Orbit Controls */}
      <OrbitControls
        ref={controlsRef}
        makeDefault
        enableDamping
        dampingFactor={0.06}
        minDistance={1.2}
        maxDistance={14}
        maxPolarAngle={Math.PI / 2 + 0.05} // Do not allow camera below floor
        target={[0, 0.85, 0]}
      />

      {/* Luminous Studio Lighting Rig */}
      <ambientLight intensity={1.4} />

      {/* Key Sun Light with High Quality Shadow */}
      <directionalLight
        position={[-6, 10, 7]}
        intensity={2.0}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0001}
        shadow-camera-near={0.5}
        shadow-camera-far={25}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
      />

      {/* Front Face Illuminator Light */}
      <directionalLight position={[0, 4, 8]} intensity={1.2} color="#ffffff" />

      {/* Cool Sky Fill Light */}
      <directionalLight position={[7, 6, -4]} intensity={1.0} color="#bae6fd" />

      {/* Silhouette Cyan Rim Light */}
      <directionalLight position={[-3, 6, -7]} intensity={0.9} color="#38bdf8" />

      {/* Technical Floor CAD Grid */}
      <Grid
        position={[0, -0.001, 0]}
        args={[16, 16]}
        cellSize={0.5}
        cellThickness={1}
        cellColor="#1e293b"
        sectionSize={2.0}
        sectionThickness={1.5}
        sectionColor="#06b6d4"
        fadeDistance={12}
        fadeStrength={1.5}
      />

      {/* Shadow Catcher Plane on Floor */}
      <mesh position={[0, -0.002, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <shadowMaterial opacity={0.4} />
      </mesh>

      {/* CAD Orientation Gizmo with Interactive Orbiting */}
      <GizmoHelper alignment="bottom-right" margin={[64, 64]}>
        <GizmoViewport
          axisColors={["#ef4444", "#22c55e", "#3b82f6"]}
          labelColor="#ffffff"
        />
      </GizmoHelper>
    </>
  );
};
