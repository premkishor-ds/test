"use client";

import React, { useState } from "react";
import { useConfiguratorStore } from "@/lib/configurator/configurator-store";
import {
  Layers,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  Crosshair,
  Trash2,
  Sliders,
  Cpu,
  Boxes,
  Zap,
  ShieldCheck,
  PlusCircle,
  FolderTree,
} from "lucide-react";

export const AssemblyHierarchyTree: React.FC = () => {
  const machine = useConfiguratorStore((s) => s.machine);
  const mountingPoints = useConfiguratorStore((s) => s.mountingPoints);
  const installedComponents = useConfiguratorStore((s) => s.installedComponents);
  const selectedMountingPointId = useConfiguratorStore((s) => s.selectedMountingPointId);
  const selectMountingPoint = useConfiguratorStore((s) => s.selectMountingPoint);
  const removeComponent = useConfiguratorStore((s) => s.removeComponent);
  const hiddenMountingPointIds = useConfiguratorStore((s) => s.hiddenMountingPointIds);
  const toggleComponentVisibility = useConfiguratorStore((s) => s.toggleComponentVisibility);
  const isolatedMountingPointId = useConfiguratorStore((s) => s.isolatedMountingPointId);
  const setIsolatedComponent = useConfiguratorStore((s) => s.setIsolatedComponent);
  const setActiveLeftTab = useConfiguratorStore((s) => s.setActiveLeftTab);

  // Group expansion states
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    root: true,
    chassis: true,
    drive: true,
    conveyance: true,
    electrical: true,
    safety: true,
  });

  const toggleNode = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedNodes((prev) => ({ ...prev, [nodeId]: !prev[nodeId] }));
  };

  // Classify mounting points into subsystems
  const drivePoints = mountingPoints.filter(
    (p) => p.name.toLowerCase().includes("motor") || p.pointId.includes("drive") || p.pointId === "mp-motor-1"
  );
  const conveyancePoints = mountingPoints.filter(
    (p) => p.name.toLowerCase().includes("conveyor") || p.name.toLowerCase().includes("sensor") || p.pointId.includes("cvy") || p.pointId === "mp-conveyor-1" || p.pointId === "mp-sensor-1"
  );
  const electricalPoints = mountingPoints.filter(
    (p) => p.name.toLowerCase().includes("cabinet") || p.name.toLowerCase().includes("panel") || p.pointId.includes("cabinet") || p.pointId === "mp-cabinet-1"
  );
  const safetyPoints = mountingPoints.filter(
    (p) => p.name.toLowerCase().includes("safety") || p.name.toLowerCase().includes("estop") || p.name.toLowerCase().includes("guard") || p.pointId.includes("safety") || p.pointId === "mp-guard-1" || p.pointId === "mp-estop-1"
  );
  const otherPoints = mountingPoints.filter(
    (p) =>
      !drivePoints.includes(p) &&
      !conveyancePoints.includes(p) &&
      !electricalPoints.includes(p) &&
      !safetyPoints.includes(p)
  );

  const renderMountingPointRow = (mp: (typeof mountingPoints)[0]) => {
    const installed = installedComponents[mp.id];
    const isSelected = selectedMountingPointId === mp.id;
    const isHidden = hiddenMountingPointIds.includes(mp.id);
    const isIsolated = isolatedMountingPointId === mp.id;

    return (
      <div
        key={mp.id}
        onClick={() => selectMountingPoint(mp.id)}
        className={`group flex items-center justify-between px-2.5 py-1.5 rounded text-xs transition-colors cursor-pointer border ${
          isSelected
            ? "bg-cyan-950/40 border-cyan-500/50 text-cyan-200"
            : "border-transparent hover:bg-slate-800/60 text-slate-300"
        } ${isHidden ? "opacity-40" : ""}`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div
            className={`w-2 h-2 rounded-full flex-shrink-0 ${
              installed ? "bg-emerald-400 shadow-sm shadow-emerald-500/50" : "bg-slate-600"
            }`}
          />
          <div className="flex flex-col truncate">
            <span className="font-mono text-[11px] font-medium text-slate-200 truncate">
              {installed ? installed.component.name : mp.name}
            </span>
            <span className="text-[10px] text-slate-400 font-mono truncate">
              {installed ? (
                <>
                  <span className="text-cyan-400 font-semibold">{installed.component.partNumber}</span>
                  {installed.customSettings?.length && ` • ${installed.customSettings.length}m`}
                  {installed.customSettings?.powerHp && ` • ${installed.customSettings.powerHp}HP`}
                </>
              ) : (
                <span className="text-amber-400/80 italic">Empty Slot</span>
              )}
            </span>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 flex-shrink-0">
          {installed ? (
            <>
              {/* Visibility eye toggle */}
              <button
                type="button"
                title={isHidden ? "Show component in 3D" : "Hide component in 3D"}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleComponentVisibility(mp.id);
                }}
                className={`p-1 rounded hover:bg-slate-700/80 transition-colors ${
                  isHidden ? "text-amber-400" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {isHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>

              {/* Isolate view */}
              <button
                type="button"
                title={isIsolated ? "Exit isolated view" : "Isolate this component"}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsolatedComponent(isIsolated ? null : mp.id);
                }}
                className={`p-1 rounded hover:bg-slate-700/80 transition-colors ${
                  isIsolated ? "text-cyan-400 bg-cyan-950/60" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Crosshair className="w-3.5 h-3.5" />
              </button>

              {/* Remove */}
              <button
                type="button"
                title="Remove component"
                onClick={(e) => {
                  e.stopPropagation();
                  removeComponent(mp.id);
                }}
                className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <button
              type="button"
              title="Add component from library"
              onClick={(e) => {
                e.stopPropagation();
                selectMountingPoint(mp.id);
                setActiveLeftTab("CATALOG");
              }}
              className="p-1 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-950/50 rounded flex items-center gap-1 text-[10px]"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Select</span>
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderSubsystemGroup = (
    key: string,
    title: string,
    icon: React.ReactNode,
    points: typeof mountingPoints
  ) => {
    if (points.length === 0) return null;
    const isExpanded = expandedNodes[key] !== false;
    const installedCount = points.filter((p) => !!installedComponents[p.id]).length;

    return (
      <div className="border-l border-slate-800 ml-3 pl-2.5 my-1" key={key}>
        <div
          onClick={(e) => toggleNode(key, e)}
          className="flex items-center justify-between py-1 px-1.5 rounded hover:bg-slate-800/40 cursor-pointer text-slate-300 transition-colors select-none"
        >
          <div className="flex items-center gap-1.5">
            {isExpanded ? (
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
            )}
            <span className="text-slate-400">{icon}</span>
            <span className="text-xs font-semibold text-slate-200">{title}</span>
          </div>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
            {installedCount}/{points.length}
          </span>
        </div>

        {isExpanded && (
          <div className="flex flex-col gap-0.5 mt-0.5 ml-1">
            {points.map(renderMountingPointRow)}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-[#0b101c] p-3 overflow-y-auto">
      {/* Header Info */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <FolderTree className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Assembly Hierarchy
          </span>
        </div>
        {isolatedMountingPointId && (
          <button
            onClick={() => setIsolatedComponent(null)}
            className="text-[10px] px-2 py-0.5 rounded bg-cyan-900/60 text-cyan-300 border border-cyan-700/60 hover:bg-cyan-800/60 transition-colors"
          >
            Exit Isolation
          </button>
        )}
      </div>

      {/* Root Machine Node */}
      <div className="mt-2.5">
        <div
          onClick={(e) => toggleNode("root", e)}
          className="flex items-center justify-between p-2 rounded-lg bg-slate-800/50 border border-slate-700/60 cursor-pointer hover:bg-slate-800/80 transition-colors"
        >
          <div className="flex items-center gap-2">
            {expandedNodes.root ? (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-slate-400" />
            )}
            <Boxes className="w-4 h-4 text-cyan-400" />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-white leading-tight">
                {machine?.name || "Industrial Machine"}
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                Model: {machine?.modelNumber || "MX-500"} • Master CAD Root
              </span>
            </div>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 font-mono">
            {Object.keys(installedComponents).length} Installed
          </span>
        </div>

        {/* Tree Sub-assemblies */}
        {expandedNodes.root && (
          <div className="mt-1 flex flex-col">
            {/* Base Chassis Node */}
            <div className="border-l border-slate-800 ml-3 pl-2.5 my-1">
              <div
                onClick={(e) => toggleNode("chassis", e)}
                className="flex items-center justify-between py-1 px-1.5 rounded hover:bg-slate-800/40 cursor-pointer text-slate-300 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  {expandedNodes.chassis ? (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  )}
                  <Layers className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs font-semibold text-slate-200">
                    Primary Chassis & Structural Bed
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 italic">Fixed Bed</span>
              </div>
              {expandedNodes.chassis && (
                <div className="flex flex-col gap-0.5 ml-4 text-[11px] text-slate-400 py-1 font-mono">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                    <span>Welded Box-Girder Sub-Frame</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                    <span>M24 Heavy Vibration Dampener Feet (x4)</span>
                  </div>
                </div>
              )}
            </div>

            {/* Subsystems */}
            {renderSubsystemGroup("drive", "Drive Train Subassembly", <Zap className="w-3.5 h-3.5 text-amber-400" />, drivePoints)}
            {renderSubsystemGroup("conveyance", "Material Handling Subassembly", <Boxes className="w-3.5 h-3.5 text-cyan-400" />, conveyancePoints)}
            {renderSubsystemGroup("electrical", "Control & Power Automation", <Cpu className="w-3.5 h-3.5 text-purple-400" />, electricalPoints)}
            {renderSubsystemGroup("safety", "Safety & Guarding Subassembly", <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />, safetyPoints)}
            {renderSubsystemGroup("other", "Auxiliary Subsystems", <Layers className="w-3.5 h-3.5 text-slate-400" />, otherPoints)}
          </div>
        )}
      </div>

      {/* Assembly Guide Footer */}
      <div className="mt-auto pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex flex-col gap-1">
        <div className="flex items-center gap-1.5 text-slate-300 font-medium">
          <Sliders className="w-3.5 h-3.5 text-cyan-400" />
          <span>Hierarchy Tree Navigation</span>
        </div>
        <p className="text-[10px] text-slate-400 leading-relaxed">
          Click any installed component to inspect its CAD properties, toggle visibility (eye), or isolate it in 3D.
        </p>
      </div>
    </div>
  );
};
