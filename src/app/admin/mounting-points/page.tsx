"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Grid } from "@react-three/drei";
import * as THREE from "three";
import { BaseMachineMesh } from "@/components/configurator/3d/BaseMachineMesh";
import { SceneEnvironment } from "@/components/configurator/3d/SceneEnvironment";
import { MountingPoint, Machine } from "@/types/configurator";
import {
  Compass,
  Plus,
  Save,
  Trash2,
  CheckCircle2,
  Crosshair,
  RotateCw,
  Layers,
  Sliders,
  ChevronRight,
  Info,
} from "lucide-react";

// Raycast Click-to-Place surface
function ClickableChassisRaycast({ onSurfaceClick }: { onSurfaceClick: (pos: [number, number, number]) => void }) {
  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    if (e.point) {
      onSurfaceClick([
        Math.round(e.point.x * 100) / 100,
        Math.round(e.point.y * 100) / 100,
        Math.round(e.point.z * 100) / 100,
      ]);
    }
  };

  return (
    <group onPointerDown={handlePointerDown}>
      <BaseMachineMesh />
    </group>
  );
}

export default function AdminMountingPointsPage() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [selectedMachineId, setSelectedMachineId] = useState<string>("");
  const [mountingPoints, setMountingPoints] = useState<MountingPoint[]>([]);
  const [selectedPointId, setSelectedPointId] = useState<string | null>(null);

  // Form editing state
  const [editingPoint, setEditingPoint] = useState<Partial<MountingPoint>>({
    pointId: "NEW_MOUNT_01",
    name: "Custom Mounting Bracket",
    description: "",
    posX: 0,
    posY: 0.8,
    posZ: 0,
    rotX: 0,
    rotY: 0,
    rotZ: 0,
    explodedX: 0,
    explodedY: 0.4,
    explodedZ: 0,
    allowedCategorySlugsJson: JSON.stringify(["motors"]),
    defaultPartNumber: "",
  });

  const [isClickToPlaceActive, setIsClickToPlaceActive] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  // Load machines
  useEffect(() => {
    fetch("/api/machines")
      .then((res) => res.json())
      .then((data) => {
        if (data.machines && data.machines.length > 0) {
          setMachines(data.machines);
          setSelectedMachineId(data.machines[0].id);
        }
      })
      .catch(console.error);
  }, []);

  // Load mounting points for selected machine
  useEffect(() => {
    if (!selectedMachineId) return;
    fetch(`/api/mounting-points?machineId=${selectedMachineId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.mountingPoints) {
          setMountingPoints(data.mountingPoints);
          if (data.mountingPoints.length > 0) {
            setSelectedPointId(data.mountingPoints[0].id);
            setEditingPoint(data.mountingPoints[0]);
          }
        }
      })
      .catch(console.error);
  }, [selectedMachineId]);

  const handleSelectPoint = (mp: MountingPoint) => {
    setSelectedPointId(mp.id);
    setEditingPoint(mp);
    setIsClickToPlaceActive(false);
  };

  const handleSurfaceClick = (coords: [number, number, number]) => {
    if (!isClickToPlaceActive) return;
    setEditingPoint((prev) => ({
      ...prev,
      posX: coords[0],
      posY: coords[1],
      posZ: coords[2],
    }));
    setStatusNotice(`Captured 3D Coordinates: [${coords.join(", ")}]`);
    setTimeout(() => setStatusNotice(null), 3000);
  };

  const handleSaveMountingPoint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMachineId) return;
    setIsSaving(true);

    try {
      const isExisting = mountingPoints.some((p) => p.id === selectedPointId);
      const url = "/api/mounting-points";
      const method = isExisting ? "PUT" : "POST";

      const payload = {
        ...editingPoint,
        id: selectedPointId,
        machineId: selectedMachineId,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success && data.mountingPoint) {
        setStatusNotice("Mounting point successfully saved to database!");
        // Refresh list
        const refreshed = await fetch(`/api/mounting-points?machineId=${selectedMachineId}`).then(
          (r) => r.json()
        );
        if (refreshed.mountingPoints) {
          setMountingPoints(refreshed.mountingPoints);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
      setTimeout(() => setStatusNotice(null), 3000);
    }
  };

  const handleAddNew = () => {
    const newId = `MOUNT_${Math.floor(100 + Math.random() * 900)}`;
    setSelectedPointId(null);
    setEditingPoint({
      pointId: newId,
      name: "New Modular Mounting Bracket",
      description: "Custom equipment mounting flange",
      posX: 0,
      posY: 0.85,
      posZ: 0,
      rotX: 0,
      rotY: 0,
      rotZ: 0,
      explodedX: 0,
      explodedY: 0.5,
      explodedZ: 0,
      allowedCategorySlugsJson: JSON.stringify(["sensors"]),
      defaultPartNumber: "",
    });
    setIsClickToPlaceActive(true);
    setStatusNotice("Click anywhere on the 3D machine chassis to set position!");
  };

  return (
    <div className="h-full flex flex-col space-y-4 select-none">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800 shrink-0">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Compass className="w-6 h-6 text-cyan-400" />
            <span>Visual 3D Mounting Point Editor</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Click directly on the 3D machine model or manually input coordinates to configure snap anchors.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedMachineId}
            onChange={(e) => setSelectedMachineId(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
          >
            {machines.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.modelNumber})
              </option>
            ))}
          </select>

          <button
            onClick={handleAddNew}
            className="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 shadow transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Mounting Point</span>
          </button>
        </div>
      </div>

      {statusNotice && (
        <div className="p-2.5 rounded-xl bg-cyan-950 border border-cyan-500/80 text-cyan-200 text-xs flex items-center gap-2 shrink-0 animate-pulse">
          <Info className="w-4 h-4 text-cyan-400" />
          <span>{statusNotice}</span>
        </div>
      )}

      {/* Main Split Editor Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 overflow-hidden min-h-[500px]">
        {/* LEFT: Existing Points List */}
        <div className="w-full lg:w-64 rounded-2xl border border-slate-800 bg-[#0d1424] p-3 flex flex-col shrink-0 overflow-y-auto">
          <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">
            Configured Mounting Points ({mountingPoints.length})
          </span>

          <div className="space-y-1.5 flex-1 overflow-y-auto">
            {mountingPoints.map((mp) => {
              const isSelected = selectedPointId === mp.id;
              return (
                <div
                  key={mp.id}
                  onClick={() => handleSelectPoint(mp)}
                  className={`p-2.5 rounded-xl border text-xs cursor-pointer transition ${
                    isSelected
                      ? "bg-cyan-950/80 border-cyan-500 text-cyan-200 shadow"
                      : "bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  <div className="font-mono font-bold text-white text-xs">{mp.pointId}</div>
                  <div className="text-[11px] text-slate-400 truncate">{mp.name}</div>
                  <div className="text-[10px] font-mono text-cyan-400 mt-1">
                    [{mp.posX.toFixed(2)}, {mp.posY.toFixed(2)}, {mp.posZ.toFixed(2)}]
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CENTER: 3D Visual Machine Canvas */}
        <div className="flex-1 rounded-2xl border border-slate-800 bg-[#070b14] relative overflow-hidden min-h-[350px]">
          {/* Status HUD overlay */}
          <div className="absolute top-3 left-3 z-10 flex items-center gap-2 pointer-events-none">
            <div className="px-3 py-1 rounded bg-slate-900/90 border border-slate-700 text-xs font-mono text-cyan-300 flex items-center gap-1.5 shadow">
              <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
              <span>
                {isClickToPlaceActive ? "CLICK 3D MACHINE TO SET POSITION" : "ORBIT / INSPECT"}
              </span>
            </div>
          </div>

          <Canvas
            shadows
            camera={{ position: [-3, 2, 3], fov: 45 }}
            className={`w-full h-full ${isClickToPlaceActive ? "cursor-crosshair" : "cursor-grab"}`}
          >
            <Suspense fallback={null}>
              <SceneEnvironment />
              <ClickableChassisRaycast onSurfaceClick={handleSurfaceClick} />

              {/* Render Existing Mounting Points */}
              {mountingPoints.map((mp) => (
                <group
                  key={mp.id}
                  position={[mp.posX, mp.posY, mp.posZ]}
                  rotation={[mp.rotX, mp.rotY, mp.rotZ]}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectPoint(mp);
                  }}
                >
                  <mesh>
                    <sphereGeometry args={[0.06, 16, 16]} />
                    <meshStandardMaterial
                      color={selectedPointId === mp.id ? "#06b6d4" : "#10b981"}
                      emissive={selectedPointId === mp.id ? "#0891b2" : "#059669"}
                      emissiveIntensity={0.8}
                    />
                  </mesh>
                  {/* Target crosshair pin */}
                  <mesh position={[0, 0.08, 0]}>
                    <cylinderGeometry args={[0.003, 0.003, 0.16, 8]} />
                    <meshBasicMaterial color="#06b6d4" />
                  </mesh>
                </group>
              ))}

              {/* Editing point preview beacon */}
              {editingPoint && (
                <group
                  position={[editingPoint.posX || 0, editingPoint.posY || 0, editingPoint.posZ || 0]}
                  rotation={[editingPoint.rotX || 0, editingPoint.rotY || 0, editingPoint.rotZ || 0]}
                >
                  <mesh>
                    <ringGeometry args={[0.12, 0.15, 24]} />
                    <meshBasicMaterial color="#f59e0b" side={THREE.DoubleSide} />
                  </mesh>
                  <mesh>
                    <sphereGeometry args={[0.05, 16, 16]} />
                    <meshStandardMaterial color="#f59e0b" emissive="#d97706" emissiveIntensity={1} />
                  </mesh>
                </group>
              )}
            </Suspense>
          </Canvas>
        </div>

        {/* RIGHT: Point Properties Form */}
        <div className="w-full lg:w-80 rounded-2xl border border-slate-800 bg-[#0d1424] p-4 flex flex-col shrink-0 overflow-y-auto">
          <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-3">
            Mounting Point Properties
          </span>

          <form onSubmit={handleSaveMountingPoint} className="space-y-3 flex-1 flex flex-col justify-between">
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Point ID (Unique Code) *
                </label>
                <input
                  type="text"
                  required
                  value={editingPoint.pointId || ""}
                  onChange={(e) => setEditingPoint({ ...editingPoint, pointId: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-cyan-300 font-mono font-bold focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Friendly Name *
                </label>
                <input
                  type="text"
                  required
                  value={editingPoint.name || ""}
                  onChange={(e) => setEditingPoint({ ...editingPoint, name: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* 3D Coordinate X, Y, Z Inputs */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-semibold text-slate-400">
                    Snap Coordinates (X, Y, Z)
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsClickToPlaceActive(!isClickToPlaceActive)}
                    className={`text-[10px] font-mono px-2 py-0.5 rounded transition ${
                      isClickToPlaceActive
                        ? "bg-amber-600 text-white animate-pulse"
                        : "bg-slate-800 text-cyan-400 hover:bg-slate-700"
                    }`}
                  >
                    {isClickToPlaceActive ? "Picking Surface..." : "Pick in 3D"}
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-1.5 font-mono text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500">X:</span>
                    <input
                      type="number"
                      step="0.05"
                      value={editingPoint.posX ?? 0}
                      onChange={(e) => setEditingPoint({ ...editingPoint, posX: parseFloat(e.target.value) || 0 })}
                      className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-700 text-slate-200"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500">Y:</span>
                    <input
                      type="number"
                      step="0.05"
                      value={editingPoint.posY ?? 0}
                      onChange={(e) => setEditingPoint({ ...editingPoint, posY: parseFloat(e.target.value) || 0 })}
                      className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-700 text-slate-200"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500">Z:</span>
                    <input
                      type="number"
                      step="0.05"
                      value={editingPoint.posZ ?? 0}
                      onChange={(e) => setEditingPoint({ ...editingPoint, posZ: parseFloat(e.target.value) || 0 })}
                      className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-700 text-slate-200"
                    />
                  </div>
                </div>
              </div>

              {/* Exploded View Displacements */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Exploded Offsets (X, Y, Z)
                </label>
                <div className="grid grid-cols-3 gap-1.5 font-mono text-xs">
                  <input
                    type="number"
                    step="0.1"
                    placeholder="exp X"
                    value={editingPoint.explodedX ?? 0}
                    onChange={(e) => setEditingPoint({ ...editingPoint, explodedX: parseFloat(e.target.value) || 0 })}
                    className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-700 text-slate-200"
                  />
                  <input
                    type="number"
                    step="0.1"
                    placeholder="exp Y"
                    value={editingPoint.explodedY ?? 0}
                    onChange={(e) => setEditingPoint({ ...editingPoint, explodedY: parseFloat(e.target.value) || 0 })}
                    className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-700 text-slate-200"
                  />
                  <input
                    type="number"
                    step="0.1"
                    placeholder="exp Z"
                    value={editingPoint.explodedZ ?? 0}
                    onChange={(e) => setEditingPoint({ ...editingPoint, explodedZ: parseFloat(e.target.value) || 0 })}
                    className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-700 text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Allowed Category Slugs (JSON array)
                </label>
                <input
                  type="text"
                  required
                  value={editingPoint.allowedCategorySlugsJson || ""}
                  onChange={(e) => setEditingPoint({ ...editingPoint, allowedCategorySlugsJson: e.target.value })}
                  placeholder='["motors"] or ["sensors"]'
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-cyan-300"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Default Part Number (Optional)
                </label>
                <input
                  type="text"
                  value={editingPoint.defaultPartNumber || ""}
                  onChange={(e) => setEditingPoint({ ...editingPoint, defaultPartNumber: e.target.value })}
                  placeholder="e.g. MTR-005"
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/30 transition disabled:opacity-50 mt-4"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? "Saving..." : "Save Mounting Point"}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
