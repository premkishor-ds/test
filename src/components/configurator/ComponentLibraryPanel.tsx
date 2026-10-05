"use client";

import React, { useState, useMemo } from "react";
import { useConfiguratorStore } from "@/lib/configurator/configurator-store";
import { ComponentItem } from "@/types/configurator";
import { formatCurrency } from "@/lib/configurator/pricing-bom-engine";
import {
  Zap,
  Boxes,
  Activity,
  Cpu,
  ShieldAlert,
  Search,
  CheckCircle2,
  Plus,
  ArrowRightLeft,
  GripVertical,
  SlidersHorizontal,
  Info,
  FolderTree,
} from "lucide-react";
import { AssemblyHierarchyTree } from "./AssemblyHierarchyTree";

export const ComponentLibraryPanel: React.FC = () => {
  const categories = useConfiguratorStore((s) => s.categories);
  const componentsLibrary = useConfiguratorStore((s) => s.componentsLibrary);
  const installedComponents = useConfiguratorStore((s) => s.installedComponents);
  const mountingPoints = useConfiguratorStore((s) => s.mountingPoints);
  const currency = useConfiguratorStore((s) => s.currency);

  const draggingComponent = useConfiguratorStore((s) => s.draggingComponent);
  const setDraggingComponent = useConfiguratorStore((s) => s.setDraggingComponent);
  const installComponent = useConfiguratorStore((s) => s.installComponent);
  const selectMountingPoint = useConfiguratorStore((s) => s.selectMountingPoint);
  const activeLeftTab = useConfiguratorStore((s) => s.activeLeftTab);
  const setActiveLeftTab = useConfiguratorStore((s) => s.setActiveLeftTab);

  const [activeCategorySlug, setActiveCategorySlug] = useState<string>("motors");
  const [searchQuery, setSearchQuery] = useState("");

  // Map category slug to lucide icon
  const getCategoryIcon = (slug: string) => {
    switch (slug) {
      case "motors":
        return <Zap className="w-4 h-4" />;
      case "conveyors":
        return <Boxes className="w-4 h-4" />;
      case "sensors":
        return <Activity className="w-4 h-4" />;
      case "controls":
        return <Cpu className="w-4 h-4" />;
      case "safety":
        return <ShieldAlert className="w-4 h-4" />;
      default:
        return <Boxes className="w-4 h-4" />;
    }
  };

  // Filtered components
  const filteredComponents = useMemo(() => {
    return componentsLibrary.filter((comp) => {
      const matchesCategory =
        !activeCategorySlug || comp.category?.slug === activeCategorySlug;
      const matchesSearch =
        !searchQuery ||
        comp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comp.partNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comp.manufacturer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [componentsLibrary, activeCategorySlug, searchQuery]);

  // Find which mounting point is compatible for quick install
  const findCompatibleMountingPoint = (comp: ComponentItem) => {
    const catSlug = comp.category?.slug || "";
    return mountingPoints.find((mp) => {
      try {
        const allowedCats: string[] = JSON.parse(mp.allowedCategorySlugsJson || "[]");
        if (!allowedCats.includes(catSlug)) return false;
        if (mp.allowedPartNumbersJson) {
          const allowedParts: string[] = JSON.parse(mp.allowedPartNumbersJson);
          if (allowedParts.length > 0 && !allowedParts.includes(comp.partNumber)) return false;
        }
        return true;
      } catch {
        return false;
      }
    });
  };

  // Check if component is already installed
  const getInstalledMountingPoint = (comp: ComponentItem) => {
    return Object.values(installedComponents).find(
      (inst) => inst.component.id === comp.id || inst.component.partNumber === comp.partNumber
    );
  };

  return (
    <aside className="w-80 sm:w-96 flex flex-col border-r border-slate-800 bg-[#0b101c]/95 backdrop-blur z-20 select-none h-full">
      {/* Top Left Navigation Mode Switcher: Parts Library vs Assembly Tree */}
      <div className="flex border-b border-slate-800 bg-slate-950/80">
        <button
          type="button"
          onClick={() => setActiveLeftTab("CATALOG")}
          className={`flex-1 py-2.5 px-3 flex items-center justify-center gap-2 text-xs font-semibold border-b-2 transition ${
            activeLeftTab === "CATALOG"
              ? "border-cyan-400 text-cyan-300 bg-cyan-950/20"
              : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40"
          }`}
        >
          <Boxes className="w-3.5 h-3.5" />
          <span>Parts Library</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveLeftTab("ASSEMBLY_TREE")}
          className={`flex-1 py-2.5 px-3 flex items-center justify-center gap-2 text-xs font-semibold border-b-2 transition ${
            activeLeftTab === "ASSEMBLY_TREE"
              ? "border-cyan-400 text-cyan-300 bg-cyan-950/20"
              : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40"
          }`}
        >
          <FolderTree className="w-3.5 h-3.5 text-cyan-400" />
          <span>Assembly Tree</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-400 font-mono">
            {Object.keys(installedComponents).length}
          </span>
        </button>
      </div>

      {activeLeftTab === "ASSEMBLY_TREE" ? (
        <AssemblyHierarchyTree />
      ) : (
        <>
          {/* Search Header */}
          <div className="p-3 border-b border-slate-800 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
                Component Catalog
              </span>
              <span className="text-[11px] font-mono text-slate-500">
                {filteredComponents.length} items
              </span>
            </div>

        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search part #, specs, motor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-2 text-xs text-slate-400 hover:text-white"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Category Navigation Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-950/60 overflow-x-auto scrollbar-none">
        {categories.map((cat) => {
          const isActive = activeCategorySlug === cat.slug;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategorySlug(cat.slug)}
              className={`flex-1 min-w-[70px] py-2.5 px-2 flex flex-col items-center gap-1 text-[11px] font-medium border-b-2 transition relative ${
                isActive
                  ? "border-cyan-400 text-cyan-300 bg-cyan-950/20"
                  : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40"
              }`}
            >
              {getCategoryIcon(cat.slug)}
              <span className="truncate max-w-[65px]">{cat.name.split(" ")[0]}</span>
            </button>
          );
        })}
      </div>

      {/* Dragging Active Notice Banner */}
      {draggingComponent && (
        <div className="p-2.5 bg-cyan-950/80 border-b border-cyan-800 flex items-center justify-between text-xs text-cyan-200">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="font-semibold truncate max-w-[200px]">
              Dragging: {draggingComponent.partNumber}
            </span>
          </div>
          <button
            onClick={() => setDraggingComponent(null)}
            className="text-[11px] text-cyan-400 hover:text-white underline"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Component Cards List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {filteredComponents.map((comp) => {
          const installedInfo = getInstalledMountingPoint(comp);
          const isInstalled = !!installedInfo;
          const targetMP = findCompatibleMountingPoint(comp);
          const isCurrentlyDragging = draggingComponent?.id === comp.id;

          // Parse specs
          let specs: Record<string, string> = {};
          try {
            specs = JSON.parse(comp.technicalSpecsJson || "{}");
          } catch {
            specs = {};
          }

          return (
            <div
              key={comp.id}
              className={`rounded-xl border transition-all duration-200 relative overflow-hidden group ${
                isCurrentlyDragging
                  ? "border-cyan-400 bg-cyan-950/30 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-400"
                  : isInstalled
                  ? "border-emerald-600/40 bg-emerald-950/10"
                  : "border-slate-800/90 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900/90"
              }`}
            >
              {/* Card Header: Part Number, Category & Status */}
              <div className="p-3 pb-2 flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-cyan-300 border border-slate-700">
                      {comp.partNumber}
                    </span>
                    <span className="text-[10px] text-slate-400">{comp.manufacturer}</span>
                  </div>
                  <h3 className="text-xs font-semibold text-white leading-snug group-hover:text-cyan-200 transition">
                    {comp.name}
                  </h3>
                </div>

                {isInstalled && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    Active
                  </span>
                )}
              </div>

              {/* Technical Specifications Highlights */}
              <div className="px-3 py-1.5 border-t border-b border-slate-800/60 bg-slate-950/40 text-[11px] grid grid-cols-2 gap-x-2 gap-y-1 text-slate-400 font-mono">
                {comp.powerRating && (
                  <div>
                    Power: <span className="text-slate-200">{comp.powerRating} kW</span>
                  </div>
                )}
                {comp.voltage && (
                  <div>
                    Supply: <span className="text-slate-200">{comp.voltage}</span>
                  </div>
                )}
                <div>
                  Weight: <span className="text-slate-200">{comp.weight} kg</span>
                </div>
                <div>
                  Size: <span className="text-slate-200 truncate">{comp.dimensions.split(" ")[0]}mm</span>
                </div>
              </div>

              {/* Card Footer: Price & Install / Drag Triggers */}
              <div className="p-3 pt-2.5 flex items-center justify-between gap-2">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Unit Price</span>
                  <span className="text-xs font-mono font-bold text-white">
                    {formatCurrency(comp.price, currency)}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Pick / Drag Button */}
                  <button
                    onClick={() => {
                      if (isCurrentlyDragging) {
                        setDraggingComponent(null);
                      } else {
                        setDraggingComponent(comp);
                      }
                    }}
                    title="Pick component to drag onto 3D mounting point"
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
                      isCurrentlyDragging
                        ? "bg-cyan-500 text-slate-950 font-bold"
                        : "bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700"
                    }`}
                  >
                    <GripVertical className="w-3.5 h-3.5" />
                    <span>{isCurrentlyDragging ? "Drop in 3D" : "Pick & Place"}</span>
                  </button>

                  {/* Direct Install / Replace Button */}
                  {targetMP && (
                    <button
                      onClick={() => {
                        installComponent(targetMP.id, comp);
                      }}
                      title={
                        isInstalled
                          ? "Re-snap or configure"
                          : `Install directly onto ${targetMP.name}`
                      }
                      className="px-2.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1 shadow-md shadow-cyan-600/20 transition active:scale-95"
                    >
                      {isInstalled ? (
                        <>
                          <ArrowRightLeft className="w-3 h-3" />
                          <span>Snap</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3 h-3" />
                          <span>Install</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filteredComponents.length === 0 && (
          <div className="py-12 text-center text-slate-500 text-xs">
            No components match your search criteria.
          </div>
        )}
      </div>
      </>
      )}
    </aside>
  );
};
