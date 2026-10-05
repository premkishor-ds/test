"use client";

import React, { Suspense, useState, useRef, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { useConfiguratorStore } from "@/lib/configurator/configurator-store";
import { BaseMachineMesh } from "./BaseMachineMesh";
import { ComponentRenderer } from "./ComponentRenderer";
import { MountingPointMarker } from "./MountingPointMarker";
import { GhostDraggingMesh } from "./GhostDraggingMesh";
import { SceneEnvironment } from "./SceneEnvironment";
import { CADWorkspaceToolbar } from "../CADWorkspaceToolbar";
import {
  RotateCcw,
  Maximize2,
  Minimize2,
  Box,
  Eye,
  Grid3X3,
  Play,
  Pause,
  Layers,
  Compass,
} from "lucide-react";

const RaycastDragPlane: React.FC = () => {
  const draggingComponent = useConfiguratorStore((s) => s.draggingComponent);
  const setDragPosition3D = useConfiguratorStore((s) => s.setDragPosition3D);
  const setDragHover = useConfiguratorStore((s) => s.setDragHover);
  const mountingPoints = useConfiguratorStore((s) => s.mountingPoints);
  const isSnappingActive = useConfiguratorStore((s) => s.isSnappingActive);
  const snapDistance = useConfiguratorStore((s) => s.snapDistance);
  const installComponent = useConfiguratorStore((s) => s.installComponent);
  const setDraggingComponent = useConfiguratorStore((s) => s.setDraggingComponent);

  if (!draggingComponent) return null;

  return (
    <mesh
      position={[0, 0.6, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      onPointerMove={(e) => {
        e.stopPropagation();
        const pt = e.point;
        setDragPosition3D([pt.x, pt.y, pt.z]);

        if (isSnappingActive) {
          let closest: typeof mountingPoints[0] | null = null;
          let minD = snapDistance;
          for (const mp of mountingPoints) {
            const dist = Math.hypot(pt.x - mp.posX, pt.z - mp.posZ);
            if (dist < minD) {
              minD = dist;
              closest = mp;
            }
          }
          setDragHover(closest ? closest.id : null);
        }
      }}
      onPointerUp={(e) => {
        e.stopPropagation();
        const state = useConfiguratorStore.getState();
        if (state.dragHoverMountingPointId && state.draggingComponent) {
          state.installComponent(state.dragHoverMountingPointId, state.draggingComponent);
        } else {
          state.setDraggingComponent(null);
        }
      }}
    >
      <planeGeometry args={[60, 60]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>
  );
};

interface ViewerCanvasProps {
  showCADToolbar?: boolean;
}

export const ViewerCanvas: React.FC<ViewerCanvasProps> = ({ showCADToolbar = false }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasWebGLError, setHasWebGLError] = useState(false);

  // Store state
  const machine = useConfiguratorStore((s) => s.machine);
  const mountingPoints = useConfiguratorStore((s) => s.mountingPoints);
  const installedComponents = useConfiguratorStore((s) => s.installedComponents);
  const showComponents = useConfiguratorStore((s) => s.showComponents);
  const exploded = useConfiguratorStore((s) => s.exploded);
  const explodedProgress = useConfiguratorStore((s) => s.explodedProgress);
  const assemblyAnimationPlaying = useConfiguratorStore((s) => s.assemblyAnimationPlaying);
  const wireframeMode = useConfiguratorStore((s) => s.wireframeMode);
  const draggingComponent = useConfiguratorStore((s) => s.draggingComponent);

  // Store actions
  const triggerResetCamera = useConfiguratorStore((s) => s.triggerResetCamera);
  const triggerFitCamera = useConfiguratorStore((s) => s.triggerFitCamera);
  const toggleExploded = useConfiguratorStore((s) => s.toggleExploded);
  const setExplodedProgress = useConfiguratorStore((s) => s.setExplodedProgress);
  const startAssemblyAnimation = useConfiguratorStore((s) => s.startAssemblyAnimation);
  const stopAssemblyAnimation = useConfiguratorStore((s) => s.stopAssemblyAnimation);
  const toggleWireframe = useConfiguratorStore((s) => s.toggleWireframe);
  const toggleShowComponents = useConfiguratorStore((s) => s.toggleShowComponents);
  const setCameraPreset = useConfiguratorStore((s) => s.setCameraPreset);
  const setDragHover = useConfiguratorStore((s) => s.setDragHover);

  // Fullscreen toggle handler
  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFSChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFSChange);
    return () => document.removeEventListener("fullscreenchange", handleFSChange);
  }, []);

  // Assembly animation automated timeline
  useEffect(() => {
    if (!assemblyAnimationPlaying) return;
    const interval = setInterval(() => {
      // Step assembly forward or complete
    }, 1200);
    return () => clearInterval(interval);
  }, [assemblyAnimationPlaying]);

  if (hasWebGLError) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 p-8 text-center border border-slate-800">
        <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-4 text-amber-400">
          <Layers className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">3D Graphics Hardware Acceleration Unavailable</h3>
        <p className="text-sm text-slate-400 max-w-md mb-6">
          3D model rendering is running in fallback mode. You can still customize components, review live pricing, generate BOMs, and request quotes normally.
        </p>
        <button
          onClick={() => setHasWebGLError(false)}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-medium text-sm transition"
        >
          Retry 3D Viewer
        </button>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full select-none overflow-hidden bg-radial from-[#0e172a] via-[#090d16] to-[#05080e]"
      onPointerLeave={() => setDragHover(null)}
    >
      {/* CAD Overlay Grid Lines */}
      <div className="absolute inset-0 pointer-events-none cad-grid-pattern opacity-40 z-0" />

      {/* Crosshair Center Marking */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-10 z-0">
        <div className="w-24 h-[1px] bg-cyan-400" />
        <div className="h-24 w-[1px] bg-cyan-400 absolute" />
      </div>

      {/* Main R3F Canvas */}
      <Canvas
        shadows
        camera={{ position: [-3.2, 2.2, 2.8], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        className="w-full h-full cursor-grab active:cursor-grabbing z-10"
        onError={() => setHasWebGLError(true)}
      >
        <Suspense fallback={null}>
          <SceneEnvironment />

          {/* Base Machine Chassis */}
          <BaseMachineMesh />

          {/* Installed Components */}
          {showComponents &&
            Object.values(installedComponents).map((installed, idx) => {
              const mp = mountingPoints.find((p) => p.id === installed.mountingPointId);
              if (!mp) return null;
              return (
                <ComponentRenderer
                  key={`${installed.mountingPointId}-${installed.component.id}`}
                  installed={installed}
                  mountingPoint={mp}
                  index={idx}
                />
              );
            })}

          {/* Holographic Mounting Point Targets */}
          {mountingPoints.map((mp) => (
            <MountingPointMarker
              key={mp.id}
              mountingPoint={mp}
              isOccupied={!!installedComponents[mp.id]}
            />
          ))}

          {/* Ghost Dragging Preview Mesh */}
          <GhostDraggingMesh />

          {/* Invisible 3D Ground Raycast Plane for Pick-and-Drop */}
          <RaycastDragPlane />
        </Suspense>
      </Canvas>

      {/* TOP CENTER: CAD Workspace Engineering Toolbar (when CAD mode active) */}
      {showCADToolbar && <CADWorkspaceToolbar />}

      {/* TOP LEFT: Machine Model Badge & Coordinate HUD */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-1 pointer-events-none">
        <div className="px-3.5 py-1.5 rounded-full bg-slate-900/85 backdrop-blur-md border border-slate-700/60 shadow-xl flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-xs font-mono font-bold text-white tracking-wider">
            {machine?.modelNumber || "MX-500"}
          </span>
          <span className="text-slate-600">•</span>
          <span className="text-[11px] text-slate-300 font-sans font-medium">
            3D Interactive Preview
          </span>
        </div>
      </div>

      {/* TOP RIGHT: Floating Camera & View Controls Toolbar */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 p-1 rounded-lg hud-panel shadow-2xl">
        <button
          onClick={triggerResetCamera}
          title="Reset Camera View"
          className="p-2 rounded hover:bg-white/10 text-slate-300 hover:text-white transition flex items-center gap-1 text-xs"
        >
          <RotateCcw className="w-4 h-4" />
          <span className="hidden sm:inline">Reset</span>
        </button>

        <button
          onClick={triggerFitCamera}
          title="Fit Machine to Screen"
          className="p-2 rounded hover:bg-white/10 text-slate-300 hover:text-white transition flex items-center gap-1 text-xs"
        >
          <Box className="w-4 h-4" />
          <span className="hidden sm:inline">Fit</span>
        </button>

        <div className="w-[1px] h-5 bg-slate-700 mx-0.5" />

        {/* Camera Angles Menu */}
        <div className="flex items-center gap-0.5">
          {(["ISOMETRIC", "TOP", "FRONT", "SIDE"] as const).map((preset) => (
            <button
              key={preset}
              onClick={() => setCameraPreset(preset)}
              className="px-2 py-1 rounded text-[11px] font-mono text-slate-400 hover:text-cyan-300 hover:bg-white/5 transition"
            >
              {preset === "ISOMETRIC" ? "ISO" : preset}
            </button>
          ))}
        </div>

        <div className="w-[1px] h-5 bg-slate-700 mx-0.5" />

        <button
          onClick={toggleWireframe}
          title="Toggle Wireframe CAD Mode"
          className={`p-2 rounded transition ${
            wireframeMode ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40" : "hover:bg-white/10 text-slate-300"
          }`}
        >
          <Grid3X3 className="w-4 h-4" />
        </button>

        <button
          onClick={toggleShowComponents}
          title="Toggle Components Visibility"
          className={`p-2 rounded transition ${
            !showComponents ? "bg-amber-500/20 text-amber-300" : "hover:bg-white/10 text-slate-300"
          }`}
        >
          <Eye className="w-4 h-4" />
        </button>

        <button
          onClick={handleToggleFullscreen}
          title="Fullscreen Mode"
          className="p-2 rounded hover:bg-white/10 text-slate-300 hover:text-white transition"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* BOTTOM CENTER: Exploded View & Assembly Animation Floating Controls */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-wrap items-center gap-3 px-4 py-2 rounded-xl hud-panel shadow-2xl border border-cyan-500/20">
        {/* Exploded View Toggle & Slider */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => toggleExploded()}
            className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition ${
              exploded
                ? "bg-cyan-600 text-white shadow-lg shadow-cyan-500/30"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Exploded View
          </button>

          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={explodedProgress}
            onChange={(e) => setExplodedProgress(parseFloat(e.target.value))}
            className="w-24 sm:w-32 accent-cyan-400 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
            title="Explosion Distance Slider"
          />
          <span className="text-[11px] font-mono text-slate-400 min-w-[32px]">
            {Math.round(explodedProgress * 100)}%
          </span>
        </div>

        <div className="w-[1px] h-5 bg-slate-700 hidden sm:block" />

        {/* Assembly Animation */}
        <button
          onClick={() => {
            if (assemblyAnimationPlaying) {
              stopAssemblyAnimation();
            } else {
              startAssemblyAnimation();
            }
          }}
          className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition ${
            assemblyAnimationPlaying
              ? "bg-amber-600 text-white animate-pulse"
              : "bg-slate-800 text-slate-300 hover:bg-slate-700"
          }`}
        >
          {assemblyAnimationPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          {assemblyAnimationPlaying ? "Assembling..." : "Show Assembly"}
        </button>
      </div>

      {/* BOTTOM LEFT: Navigation Legend */}
      <div className="absolute bottom-6 left-4 z-20 hidden md:flex items-center gap-3 text-[11px] text-slate-400/80 pointer-events-none">
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 rounded bg-slate-800/80 border border-slate-700 font-mono text-[10px] text-slate-300">
            L-Click
          </kbd>{" "}
          Rotate / Select
        </span>
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 rounded bg-slate-800/80 border border-slate-700 font-mono text-[10px] text-slate-300">
            R-Click
          </kbd>{" "}
          Pan
        </span>
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 rounded bg-slate-800/80 border border-slate-700 font-mono text-[10px] text-slate-300">
            Scroll
          </kbd>{" "}
          Zoom
        </span>
      </div>
    </div>
  );
};
