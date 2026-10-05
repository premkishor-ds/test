"use client";

import React from "react";
import { useConfiguratorStore } from "@/lib/configurator/configurator-store";
import { formatCurrency } from "@/lib/configurator/pricing-bom-engine";
import {
  ShieldCheck,
  AlertOctagon,
  AlertTriangle,
  Trash2,
  Cpu,
  Layers,
  Wrench,
  CheckCircle,
  Flame,
  Factory,
  Compass,
  Zap,
  Sliders,
  Move,
} from "lucide-react";

export const PropertiesInspectorPanel: React.FC = () => {
  const machine = useConfiguratorStore((s) => s.machine);
  const mountingPoints = useConfiguratorStore((s) => s.mountingPoints);
  const componentsLibrary = useConfiguratorStore((s) => s.componentsLibrary);
  const installedComponents = useConfiguratorStore((s) => s.installedComponents);
  const selectedMountingPointId = useConfiguratorStore((s) => s.selectedMountingPointId);
  const environment = useConfiguratorStore((s) => s.environment);
  const setEnvironment = useConfiguratorStore((s) => s.setEnvironment);
  const currency = useConfiguratorStore((s) => s.currency);
  const validation = useConfiguratorStore((s) => s.validation);
  const pricing = useConfiguratorStore((s) => s.pricingSummary);

  const removeComponent = useConfiguratorStore((s) => s.removeComponent);
  const installComponent = useConfiguratorStore((s) => s.installComponent);
  const selectMountingPoint = useConfiguratorStore((s) => s.selectMountingPoint);
  const updateComponentCustomSettings = useConfiguratorStore((s) => s.updateComponentCustomSettings);

  // Selected mounting point data
  const selectedMP = mountingPoints.find(
    (mp) => mp.id === selectedMountingPointId || mp.pointId === selectedMountingPointId
  );
  const selectedInstalled = selectedMP ? installedComponents[selectedMP.id] : null;

  // Technical specs parsed
  let specsObj: Record<string, string> = {};
  if (selectedInstalled?.component.technicalSpecsJson) {
    try {
      specsObj = JSON.parse(selectedInstalled.component.technicalSpecsJson);
    } catch {
      specsObj = {};
    }
  }

  // Auto-resolve helper for validation violations
  const handleAutoResolve = (partNumberToInstall: string) => {
    const compToInstall = componentsLibrary.find((c) => c.partNumber === partNumberToInstall);
    if (!compToInstall) return;

    // Find compatible mounting point
    const catSlug = compToInstall.category?.slug || "";
    const mp = mountingPoints.find((p) => {
      try {
        const allowedCats: string[] = JSON.parse(p.allowedCategorySlugsJson || "[]");
        return allowedCats.includes(catSlug);
      } catch {
        return false;
      }
    });

    if (mp) {
      installComponent(mp.id, compToInstall);
    }
  };

  return (
    <aside className="w-80 sm:w-96 flex flex-col border-l border-slate-800 bg-[#0b101c]/95 backdrop-blur z-20 select-none h-full overflow-y-auto">
      {/* SECTION 1: Operating Environment Selector */}
      <div className="p-3.5 border-b border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Factory className="w-3.5 h-3.5 text-cyan-400" />
            Operating Environment
          </span>
          <span className="text-[10px] text-slate-400 font-mono">ISO 14120</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setEnvironment("STANDARD")}
            className={`px-3 py-2 rounded-lg text-xs font-medium border flex items-center justify-center gap-1.5 transition ${
              environment === "STANDARD"
                ? "bg-cyan-950/80 border-cyan-500 text-cyan-300 shadow-md shadow-cyan-500/20"
                : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Factory className="w-3.5 h-3.5" />
            <span>Standard Floor</span>
          </button>

          <button
            onClick={() => setEnvironment("HAZARDOUS")}
            className={`px-3 py-2 rounded-lg text-xs font-medium border flex items-center justify-center gap-1.5 transition ${
              environment === "HAZARDOUS"
                ? "bg-amber-950/80 border-amber-500 text-amber-300 shadow-md shadow-amber-500/20"
                : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Washdown IP67</span>
          </button>
        </div>
      </div>

      {/* SECTION 2: Rules & Compatibility Engine Status Box */}
      <div className="p-3.5 border-b border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Compatibility Engine
          </span>
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
              validation.valid
                ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                : "bg-red-950 text-red-300 border border-red-800"
            }`}
          >
            {validation.valid ? "PASSED" : "VIOLATION"}
          </span>
        </div>

        {validation.valid && validation.warnings.length === 0 ? (
          <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-900/60 flex items-start gap-2.5 text-xs text-emerald-300">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-white">Full Engineering Compliance</div>
              <p className="text-[11px] text-emerald-400/90 mt-0.5">
                All mounting points, torque specifications, and electrical capacities meet safety standards.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Critical Errors */}
            {validation.errors.map((err, idx) => (
              <div
                key={`err-${idx}`}
                className="p-2.5 rounded-lg bg-red-950/40 border border-red-800/80 flex flex-col gap-2"
              >
                <div className="flex items-start gap-2 text-xs text-red-200">
                  <AlertOctagon className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div className="leading-snug">
                    <span className="font-bold text-red-300 block font-mono text-[10px]">
                      {err.code}
                    </span>
                    <span className="text-[11px]">{err.message}</span>
                  </div>
                </div>

                {/* Auto-Resolve Buttons */}
                {err.code === "DIMENSION_INCOMPATIBLE" && (
                  <button
                    onClick={() => handleAutoResolve("CVY-004")}
                    className="self-end px-2.5 py-1 rounded bg-red-900/80 hover:bg-red-800 text-white text-[11px] font-semibold transition"
                  >
                    Equip 4m Conveyor
                  </button>
                )}
                {err.code === "POWER_INCOMPATIBLE" && (
                  <button
                    onClick={() => handleAutoResolve("CTL-002")}
                    className="self-end px-2.5 py-1 rounded bg-red-900/80 hover:bg-red-800 text-white text-[11px] font-semibold transition"
                  >
                    Equip High-Power VFD
                  </button>
                )}
                {err.code === "SAFETY_MANDATORY_ESTOP" && (
                  <button
                    onClick={() => handleAutoResolve("SFT-002")}
                    className="self-end px-2.5 py-1 rounded bg-red-900/80 hover:bg-red-800 text-white text-[11px] font-semibold transition"
                  >
                    Install Emergency Stop
                  </button>
                )}
                {err.code === "ENVIRONMENT_INCOMPATIBLE" && (
                  <button
                    onClick={() => handleAutoResolve("SEN-002")}
                    className="self-end px-2.5 py-1 rounded bg-red-900/80 hover:bg-red-800 text-white text-[11px] font-semibold transition"
                  >
                    Upgrade to IP67 Sensor
                  </button>
                )}
              </div>
            ))}

            {/* Warnings */}
            {validation.warnings.map((warn, idx) => (
              <div
                key={`warn-${idx}`}
                className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-800/80 flex items-start justify-between gap-2"
              >
                <div className="flex items-start gap-2 text-xs text-amber-200">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span className="text-[11px] leading-snug">{warn.message}</span>
                </div>
                {warn.code === "SAFETY_GUARD_MISSING" && (
                  <button
                    onClick={() => handleAutoResolve("SFT-001")}
                    className="px-2 py-1 rounded bg-amber-800/80 hover:bg-amber-700 text-white text-[10px] font-semibold transition shrink-0"
                  >
                    Add Guard
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 3: Selected Mounting Point & Component Inspector */}
      <div className="p-3.5 border-b border-slate-800 flex-1">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            Mounting Inspector
          </span>
          {selectedMP && (
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
              {selectedMP.pointId}
            </span>
          )}
        </div>

        {selectedMP ? (
          <div className="space-y-3">
            {/* Mounting Point CAD Coordinates */}
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
              <div className="font-semibold text-white mb-1">{selectedMP.name}</div>
              <p className="text-[11px] text-slate-400 mb-2">{selectedMP.description}</p>
              <div className="grid grid-cols-3 gap-1 font-mono text-[11px] text-slate-300 bg-slate-950 p-1.5 rounded">
                <div>X: {selectedMP.posX.toFixed(2)}m</div>
                <div>Y: {selectedMP.posY.toFixed(2)}m</div>
                <div>Z: {selectedMP.posZ.toFixed(2)}m</div>
              </div>
            </div>

            {/* Currently Installed Component Details */}
            {selectedInstalled ? (
              <div className="p-3 rounded-lg bg-slate-900/90 border border-cyan-500/30 shadow-md">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                      {selectedInstalled.component.partNumber}
                    </span>
                    <h4 className="text-xs font-bold text-white mt-1">
                      {selectedInstalled.component.name}
                    </h4>
                  </div>
                  <button
                    onClick={() => removeComponent(selectedMP.id)}
                    className="p-1.5 rounded text-slate-400 hover:text-red-400 hover:bg-slate-800 transition"
                    title="Remove component from this mounting point"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-xs font-mono font-bold text-cyan-300 mb-3">
                  {formatCurrency(selectedInstalled.component.price, currency)}
                </div>

                {/* Parametric Conveyor Controls */}
                {selectedInstalled.component.category?.slug === "conveyors" && (
                  <div className="p-2.5 rounded-lg bg-cyan-950/30 border border-cyan-800/60 my-2.5 space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-cyan-300">
                      <span className="flex items-center gap-1.5">
                        <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                        Parametric Conveyor Bed
                      </span>
                      <span className="font-mono text-[11px] text-white">
                        {(selectedInstalled.customSettings?.length || 4.0).toFixed(1)}m
                      </span>
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                        <span>Bed Length</span>
                        <span>1.5m – 6.0m</span>
                      </div>
                      <input
                        type="range"
                        min="1.5"
                        max="6.0"
                        step="0.25"
                        value={selectedInstalled.customSettings?.length || 4.0}
                        onChange={(e) =>
                          updateComponentCustomSettings(selectedMP.id, {
                            length: parseFloat(e.target.value),
                          })
                        }
                        className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                        <span>Belt Width</span>
                        <span>{selectedInstalled.customSettings?.width || 0.65}m</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        {[0.45, 0.65, 0.85].map((w) => (
                          <button
                            key={w}
                            type="button"
                            onClick={() =>
                              updateComponentCustomSettings(selectedMP.id, { width: w })
                            }
                            className={`py-1 px-1 rounded text-[10px] font-mono border transition ${
                              (selectedInstalled.customSettings?.width || 0.65) === w
                                ? "bg-cyan-500/20 border-cyan-400 text-cyan-300"
                                : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                            }`}
                          >
                            {Math.round(w * 1000)} mm
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Parametric Motor Controls */}
                {selectedInstalled.component.category?.slug === "motors" && (
                  <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-800/60 my-2.5 space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-amber-300">
                      <span className="flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-amber-400" />
                        Parametric Motor Power
                      </span>
                      <span className="font-mono text-[11px] text-white">
                        {selectedInstalled.customSettings?.powerHp || 5} HP (
                        {((selectedInstalled.customSettings?.powerHp || 5) * 0.7457).toFixed(1)} kW)
                      </span>
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                        <span>Rated Power</span>
                        <span>1 HP – 15 HP</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="15"
                        step="1"
                        value={selectedInstalled.customSettings?.powerHp || 5}
                        onChange={(e) =>
                          updateComponentCustomSettings(selectedMP.id, {
                            powerHp: parseInt(e.target.value, 10),
                          })
                        }
                        className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                      />
                    </div>
                  </div>
                )}

                {/* CAD Transformation Alignment */}
                <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 my-2.5 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300">
                    <span className="flex items-center gap-1">
                      <Move className="w-3 h-3 text-cyan-400" />
                      Fine Position Offset
                    </span>
                    {selectedInstalled.customSettings?.transformOffset && (
                      <button
                        type="button"
                        onClick={() =>
                          updateComponentCustomSettings(selectedMP.id, {
                            transformOffset: undefined,
                          })
                        }
                        className="text-[10px] text-slate-400 hover:text-cyan-300"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-1 font-mono text-[10px] text-slate-400">
                    <div>
                      <span>X: </span>
                      <span className="text-white">
                        {(
                          selectedMP.posX +
                          (selectedInstalled.customSettings?.transformOffset?.x || 0)
                        ).toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span>Y: </span>
                      <span className="text-white">
                        {(
                          selectedMP.posY +
                          (selectedInstalled.customSettings?.transformOffset?.y || 0)
                        ).toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span>Z: </span>
                      <span className="text-white">
                        {(
                          selectedMP.posZ +
                          (selectedInstalled.customSettings?.transformOffset?.z || 0)
                        ).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Technical Specifications Sheet */}
                <div className="space-y-1.5 text-[11px] border-t border-slate-800 pt-2 text-slate-300">
                  <div className="flex justify-between py-0.5 border-b border-slate-800/40">
                    <span className="text-slate-400">Weight</span>
                    <span className="font-mono">
                      {selectedInstalled.customSettings?.length && selectedInstalled.component.category?.slug === "conveyors"
                        ? `${Math.round((selectedInstalled.component.weight || 100) * (selectedInstalled.customSettings.length / 4.0))} kg (Scaled)`
                        : selectedInstalled.customSettings?.powerHp && selectedInstalled.component.category?.slug === "motors"
                        ? `${Math.round(selectedInstalled.customSettings.powerHp * 6.2)} kg (Scaled)`
                        : `${selectedInstalled.component.weight} kg`}
                    </span>
                  </div>
                  <div className="flex justify-between py-0.5 border-b border-slate-800/40">
                    <span className="text-slate-400">Dimensions</span>
                    <span className="font-mono">
                      {selectedInstalled.customSettings?.length && selectedInstalled.component.category?.slug === "conveyors"
                        ? `${Math.round(selectedInstalled.customSettings.length * 1000)} x ${Math.round((selectedInstalled.customSettings.width || 0.65) * 1000)} x 120 mm`
                        : selectedInstalled.customSettings?.powerHp && selectedInstalled.component.category?.slug === "motors"
                        ? `${Math.round(300 + selectedInstalled.customSettings.powerHp * 15)} x ${Math.round(180 + selectedInstalled.customSettings.powerHp * 10)} x ${Math.round(200 + selectedInstalled.customSettings.powerHp * 10)} mm`
                        : selectedInstalled.component.dimensions}
                    </span>
                  </div>
                  {Object.entries(specsObj).map(([key, val]) => (
                    <div
                      key={key}
                      className="flex justify-between py-0.5 border-b border-slate-800/40"
                    >
                      <span className="text-slate-400">{key}</span>
                      <span className="font-mono text-right truncate max-w-[160px]">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-slate-900/40 border border-dashed border-slate-700 text-center text-xs text-slate-400">
                <p className="font-medium text-slate-300 mb-1">Mounting Point Unoccupied</p>
                <p className="text-[11px] text-slate-500">
                  Pick and drag a compatible component from the library or click an item in the left catalog to mount.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="py-8 text-center text-slate-500 text-xs">
            <Compass className="w-8 h-8 mx-auto text-slate-600 mb-2" />
            Click on any holographic marker or component on the 3D machine to inspect specifications.
          </div>
        )}
      </div>

      {/* SECTION 4: Cost Breakdown Summary */}
      <div className="p-3.5 bg-slate-950/80 border-t border-slate-800 space-y-1.5 text-xs">
        <div className="flex justify-between text-slate-400">
          <span>Base Machine Chassis</span>
          <span className="font-mono text-slate-200">
            {formatCurrency(pricing.baseMachinePrice, currency)}
          </span>
        </div>
        <div className="flex justify-between text-slate-400">
          <span>Components ({pricing.componentCount})</span>
          <span className="font-mono text-slate-200">
            {formatCurrency(pricing.componentsSubtotal, currency)}
          </span>
        </div>
        <div className="flex justify-between text-slate-400">
          <span>Factory Assembly & QA</span>
          <span className="font-mono text-slate-200">
            {formatCurrency(pricing.installationAndCalibrationCost, currency)}
          </span>
        </div>
        <div className="flex justify-between text-slate-400">
          <span>Tax / GST (18%)</span>
          <span className="font-mono text-slate-200">
            {formatCurrency(pricing.taxAmount, currency)}
          </span>
        </div>
        <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-slate-800">
          <span>Grand Total</span>
          <span className="font-mono text-emerald-400">
            {formatCurrency(pricing.grandTotal, currency)}
          </span>
        </div>
      </div>
    </aside>
  );
};
