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
        camera.position.set(0, 5, 0.01);
        controls.target.set(0, 0.6, 0);
        break;
      case "FRONT":
        camera.position.set(0, 1.2, 4);
        controls.target.set(0, 0.7, 0);
        break;
      case "SIDE":
        camera.position.set(-4.5, 1.2, 0);
        controls.target.set(0, 0.7, 0);
        break;
      case "ISOMETRIC":
        camera.position.set(-3.2, 2.5, 3.2);
        controls.target.set(0, 0.6, 0);
        break;
      case "DEFAULT":
      default:
        camera.position.set(-3.2, 2.2, 2.8);
        controls.target.set(0, 0.6, 0);
        break;
    }
    controls.update();
  }, [cameraPreset, camera]);

  // Handle Camera Reset
  useEffect(() => {
    if (cameraResetTrigger === 0 || !controlsRef.current) return;
    camera.position.set(-3.2, 2.2, 2.8);
    controlsRef.current.target.set(0, 0.6, 0);
    controlsRef.current.update();
  }, [cameraResetTrigger, camera]);

  // Handle Camera Fit
  useEffect(() => {
    if (cameraFitTrigger === 0 || !controlsRef.current) return;
    camera.position.set(-3.5, 1.8, 3.0);
    controlsRef.current.target.set(0, 0.6, 0);
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
        maxDistance={12}
        maxPolarAngle={Math.PI / 2 + 0.05} // Do not allow camera below floor
        target={[0, 0.6, 0]}
      />

      {/* Lighting Rig */}
      <ambientLight intensity={0.8} />

      {/* Main Key Sun Light (Warm White) with High Quality Shadow */}
      <directionalLight
        position={[-6, 8, 6]}
        intensity={1.4}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0001}
        shadow-camera-near={0.5}
        shadow-camera-far={25}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={4}
        shadow-camera-bottom={-4}
      />

      {/* Fill Light (Soft Cool Blue) */}
      <directionalLight position={[6, 4, -4]} intensity={0.6} color="#93c5fd" />

      {/* Silhouette Rim Light (Cyan Accent) */}
      <directionalLight position={[0, -2, -6]} intensity={0.4} color="#06b6d4" />

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
