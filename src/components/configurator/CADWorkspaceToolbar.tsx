"use client";

import React, { useEffect } from "react";
import { useConfiguratorStore } from "@/lib/configurator/configurator-store";
import {
  MousePointer,
  Move,
  RotateCw,
  Ruler,
  Undo2,
  Redo2,
  Magnet,
  Maximize2,
  RotateCcw,
  Sparkles,
} from "lucide-react";

export const CADWorkspaceToolbar: React.FC = () => {
  const transformMode = useConfiguratorStore((s) => s.transformMode);
  const setTransformMode = useConfiguratorStore((s) => s.setTransformMode);
  const isSnappingActive = useConfiguratorStore((s) => s.isSnappingActive);
  const toggleSnappingActive = useConfiguratorStore((s) => s.toggleSnappingActive);
  const snapDistance = useConfiguratorStore((s) => s.snapDistance);
  const setSnapDistance = useConfiguratorStore((s) => s.setSnapDistance);
  const draggingComponent = useConfiguratorStore((s) => s.draggingComponent);
  const rotateDraggingComponent = useConfiguratorStore((s) => s.rotateDraggingComponent);
  const setDraggingComponent = useConfiguratorStore((s) => s.setDraggingComponent);

  const undo = useConfiguratorStore((s) => s.undo);
  const redo = useConfiguratorStore((s) => s.redo);
  const historyIndex = useConfiguratorStore((s) => s.historyIndex);
  const history = useConfiguratorStore((s) => s.history);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  // Global Keyboard shortcuts:
  // - 'R' key: Rotate dragged component 90°
  // - 'Escape': Cancel drag
  // - Ctrl+Z: Undo
  // - Ctrl+Y or Ctrl+Shift+Z: Redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      if (e.key === "r" || e.key === "R") {
        rotateDraggingComponent(Math.PI / 2);
      }

      if (e.key === "Escape") {
        setDraggingComponent(null);
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        if (e.shiftKey) {
          e.preventDefault();
          redo();
        } else {
          e.preventDefault();
          undo();
        }
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [rotateDraggingComponent, setDraggingComponent, undo, redo]);

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 p-1.5 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700/80 shadow-2xl">
      {/* Transformation Modes */}
      <div className="flex items-center gap-0.5 bg-slate-950/60 p-1 rounded-lg border border-slate-800">
        <button
          type="button"
          onClick={() => setTransformMode("select")}
          title="Select Mode (Click objects or mounting points)"
          className={`p-2 rounded-md text-xs font-semibold flex items-center gap-1.5 transition ${
            transformMode === "select"
              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/20"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
          }`}
        >
          <MousePointer className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Select</span>
        </button>

        <button
          type="button"
          onClick={() => setTransformMode("translate")}
          title="Translate / Move Object"
          className={`p-2 rounded-md text-xs font-semibold flex items-center gap-1.5 transition ${
            transformMode === "translate"
              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/20"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
          }`}
        >
          <Move className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Move</span>
        </button>

        <button
          type="button"
          onClick={() => setTransformMode("rotate")}
          title="Rotate Object"
          className={`p-2 rounded-md text-xs font-semibold flex items-center gap-1.5 transition ${
            transformMode === "rotate"
              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/20"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
          }`}
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Rotate</span>
        </button>

        <button
          type="button"
          onClick={() => setTransformMode("measure")}
          title="CAD Measure Tool"
          className={`p-2 rounded-md text-xs font-semibold flex items-center gap-1.5 transition ${
            transformMode === "measure"
              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/20"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
          }`}
        >
          <Ruler className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Measure</span>
        </button>
      </div>

      <div className="w-[1px] h-6 bg-slate-700/80 mx-1" />

      {/* Magnetic Snapping Controls */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => toggleSnappingActive()}
          title={isSnappingActive ? "Magnetic Snapping Active (auto-aligns to mounting points)" : "Snapping Disabled"}
          className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
            isSnappingActive
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-500/20"
              : "bg-slate-800 text-slate-400 hover:text-slate-200"
          }`}
        >
          <Magnet className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Snap</span>
        </button>

        {isSnappingActive && (
          <select
            value={snapDistance}
            onChange={(e) => setSnapDistance(parseFloat(e.target.value))}
            className="bg-slate-950 border border-slate-700 text-[11px] text-cyan-300 rounded px-1.5 py-1 font-mono focus:outline-none focus:border-cyan-500 cursor-pointer"
            title="Snap Proximity Radius"
          >
            <option value="0.5">0.5m Radius</option>
            <option value="0.75">0.75m Radius</option>
            <option value="1.2">1.2m Radius</option>
          </select>
        )}
      </div>

      {/* Active Drag Quick Rotate Helper */}
      {draggingComponent && (
        <button
          type="button"
          onClick={() => rotateDraggingComponent(Math.PI / 2)}
          title="Rotate Dragging Component 90° (or press 'R' key)"
          className="p-2 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 flex items-center gap-1.5 text-xs font-semibold animate-pulse"
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span>Rotate 90° (R)</span>
        </button>
      )}

      <div className="w-[1px] h-6 bg-slate-700/80 mx-1" />

      {/* Undo / Redo Actions */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={undo}
          disabled={!canUndo}
          title="Undo Assembly Operation (Ctrl+Z)"
          className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
            canUndo
              ? "text-slate-200 hover:bg-white/10"
              : "text-slate-600 cursor-not-allowed opacity-40"
          }`}
        >
          <Undo2 className="w-3.5 h-3.5" />
          <span className="hidden lg:inline text-[11px]">Undo</span>
        </button>

        <button
          type="button"
          onClick={redo}
          disabled={!canRedo}
          title="Redo Assembly Operation (Ctrl+Y)"
          className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
            canRedo
              ? "text-slate-200 hover:bg-white/10"
              : "text-slate-600 cursor-not-allowed opacity-40"
          }`}
        >
          <Redo2 className="w-3.5 h-3.5" />
          <span className="hidden lg:inline text-[11px]">Redo</span>
        </button>
      </div>
    </div>
  );
};
