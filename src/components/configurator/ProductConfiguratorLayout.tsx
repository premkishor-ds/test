"use client";

import React, { useState, useMemo, useRef } from "react";
import { useConfiguratorStore } from "@/lib/configurator/configurator-store";
import { ComponentItem, MountingPoint } from "@/types/configurator";
import { formatCurrency } from "@/lib/configurator/pricing-bom-engine";
import { ViewerCanvas } from "./3d/ViewerCanvas";
import { AssemblyHierarchyTree } from "./AssemblyHierarchyTree";
import { CADWorkspaceToolbar } from "./CADWorkspaceToolbar";
import { ComponentVisualPreview } from "./ComponentVisualPreview";
import {
  Check,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Wand2,
  Boxes,
  Zap,
  Layers,
  Activity,
  Cpu,
  ShieldAlert,
  Wrench,
  FileSpreadsheet,
  Save,
  Send,
  Sparkles,
  Hand,
  Settings,
  X,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  SlidersHorizontal,
} from "lucide-react";

interface ProductConfiguratorLayoutProps {
  onOpenSaveModal: () => void;
  onOpenQuoteModal: () => void;
}

export const ProductConfiguratorLayout: React.FC<ProductConfiguratorLayoutProps> = ({
  onOpenSaveModal,
  onOpenQuoteModal,
}) => {
  const machine = useConfiguratorStore((s) => s.machine);
  const categories = useConfiguratorStore((s) => s.categories);
  const componentsLibrary = useConfiguratorStore((s) => s.componentsLibrary);
  const mountingPoints = useConfiguratorStore((s) => s.mountingPoints);
  const installedComponents = useConfiguratorStore((s) => s.installedComponents);
  const currency = useConfiguratorStore((s) => s.currency);
  const pricing = useConfiguratorStore((s) => s.pricingSummary);
  const validation = useConfiguratorStore((s) => s.validation);
  const draggingComponent = useConfiguratorStore((s) => s.draggingComponent);

  const installComponent = useConfiguratorStore((s) => s.installComponent);
  const removeComponent = useConfiguratorStore((s) => s.removeComponent);
  const setDraggingComponent = useConfiguratorStore((s) => s.setDraggingComponent);
  const selectMountingPoint = useConfiguratorStore((s) => s.selectMountingPoint);
  const toggleBOMDrawer = useConfiguratorStore((s) => s.toggleBOMDrawer);
  const autoFixAllIssues = useConfiguratorStore((s) => s.autoFixAllIssues);
  const loadRecommendedBaseline = useConfiguratorStore((s) => s.loadRecommendedBaseline);

  // Active numbered step (0 to 6)
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  // Expandable technical specifications card map
  const [expandedSpecId, setExpandedSpecId] = useState<string | null>(null);
  // CAD Studio Tools drawer toggle for power users
  const [showCADStudioDrawer, setShowCADStudioDrawer] = useState(false);
  // Expandable summary list of installed components
  const [showConfiguredItemsList, setShowConfiguredItemsList] = useState(false);
  // Toast feedback state
  const [toastFeedback, setToastFeedback] = useState<string | null>(null);

  // Scroll container ref for options panel
  const optionsPanelRef = useRef<HTMLDivElement>(null);

  // 1. Definition of the 7 Sequential Numbered Steps
  const configSteps = useMemo(() => {
    return [
      {
        id: "step-platform",
        stepNumber: "01",
        title: "Base Platform",
        shortTitle: "Base",
        subtitle: "Industrial machine base chassis, structural envelope, and foundation mounting.",
        icon: Boxes,
        categorySlugs: [], // Base machine overview
      },
      {
        id: "step-drive",
        stepNumber: "02",
        title: "Drive & Powertrain",
        shortTitle: "Drive",
        subtitle: "Electric induction motors, direct-drive axles, and servo actuation.",
        icon: Zap,
        categorySlugs: ["motors"],
      },
      {
        id: "step-conveyor",
        stepNumber: "03",
        title: "Conveyor & Bed",
        shortTitle: "Conveyor",
        subtitle: "Modular link belts, heavy-duty roller decks, and workpiece tables.",
        icon: Layers,
        categorySlugs: ["conveyors"],
      },
      {
        id: "step-sensors",
        stepNumber: "04",
        title: "Sensors & Telemetry",
        shortTitle: "Sensors",
        subtitle: "Optical proximity, laser ToF distance telemetry, and inspection probes.",
        icon: Activity,
        categorySlugs: ["sensors", "optics-laser"],
      },
      {
        id: "step-controls",
        stepNumber: "05",
        title: "Controls & Automation",
        shortTitle: "Controls",
        subtitle: "Touchscreen HMIs, NEMA 12 PLC enclosures, and VFD power cabinets.",
        icon: Cpu,
        categorySlugs: ["controls"],
      },
      {
        id: "step-safety",
        stepNumber: "06",
        title: "Safety & Guarding",
        shortTitle: "Safety",
        subtitle: "OSHA safety enclosures, interlocking cages, and emergency stop consoles.",
        icon: ShieldAlert,
        categorySlugs: ["safety"],
      },
      {
        id: "step-tooling",
        stepNumber: "07",
        title: "Tooling & Robotics",
        shortTitle: "Tooling",
        subtitle: "High-RPM spindles, articulated arms, grippers, laser optics, and dispensers.",
        icon: Wrench,
        categorySlugs: ["tooling", "robotics", "actuators", "material-feed"],
      },
    ];
  }, []);

  const currentStep = configSteps[activeStepIndex] || configSteps[0];

  // Components available for current step
  const stepComponents = useMemo(() => {
    if (currentStep.categorySlugs.length === 0) return [];
    return componentsLibrary.filter((c) =>
      currentStep.categorySlugs.includes(c.category?.slug || "")
    );
  }, [componentsLibrary, currentStep]);

  // Check if a component is currently selected/installed
  const isComponentSelected = (comp: ComponentItem) => {
    return Object.values(installedComponents).some(
      (inst) => inst.component.id === comp.id || inst.component.partNumber === comp.partNumber
    );
  };

  // Find the mounting point that matches this component
  const findTargetMountingPoint = (comp: ComponentItem): MountingPoint | undefined => {
    const catSlug = comp.category?.slug || "";

    // 1. Check if it's already installed on a mounting point
    for (const [mpId, inst] of Object.entries(installedComponents)) {
      if (inst.component.id === comp.id || inst.component.partNumber === comp.partNumber) {
        return mountingPoints.find((mp) => mp.id === mpId);
      }
    }

    // 2. Unoccupied mounting point that explicitly allows this partNumber
    let mp = mountingPoints.find((p) => {
      if (installedComponents[p.id]) return false;
      if (!p.allowedPartNumbersJson) return false;
      try {
        const parts: string[] = JSON.parse(p.allowedPartNumbersJson);
        return parts.includes(comp.partNumber);
      } catch {
        return false;
      }
    });

    // 3. Unoccupied mounting point that allows this category
    if (!mp) {
      mp = mountingPoints.find((p) => {
        if (installedComponents[p.id]) return false;
        try {
          const cats: string[] = JSON.parse(p.allowedCategorySlugsJson || "[]");
          return cats.includes(catSlug);
        } catch {
          return false;
        }
      });
    }

    // 4. ANY mounting point that allows this partNumber (for replacement)
    if (!mp) {
      mp = mountingPoints.find((p) => {
        if (!p.allowedPartNumbersJson) return false;
        try {
          const parts: string[] = JSON.parse(p.allowedPartNumbersJson);
          return parts.includes(comp.partNumber);
        } catch {
          return false;
        }
      });
    }

    // 5. ANY mounting point that allows this category
    if (!mp) {
      mp = mountingPoints.find((p) => {
        try {
          const cats: string[] = JSON.parse(p.allowedCategorySlugsJson || "[]");
          return cats.includes(catSlug);
        } catch {
          return false;
        }
      });
    }

    return mp;
  };

  // Calculate relative price difference for option card
  const getPriceDifferenceDisplay = (comp: ComponentItem) => {
    const isSelected = isComponentSelected(comp);
    if (isSelected) {
      return { text: "✓ Included in Build", isPositive: false, isZero: true };
    }

    const targetMP = findTargetMountingPoint(comp);
    if (targetMP && installedComponents[targetMP.id]) {
      const currentPrice = installedComponents[targetMP.id].component.price;
      const diff = comp.price - currentPrice;
      if (diff === 0) {
        return { text: "Same Price", isPositive: false, isZero: true };
      }
      if (diff > 0) {
        return { text: `+ ${formatCurrency(diff, currency)} Upgrade`, isPositive: true, isZero: false };
      }
      return { text: `- ${formatCurrency(Math.abs(diff), currency)} Savings`, isPositive: false, isZero: false };
    }

    return { text: `+ ${formatCurrency(comp.price, currency)}`, isPositive: true, isZero: false };
  };

  // Handle Option Card Selection (1-Click Instant Equip in 3D)
  const handleSelectOption = (comp: ComponentItem) => {
    const targetMP = findTargetMountingPoint(comp);
    if (targetMP) {
      installComponent(targetMP.id, comp);
      selectMountingPoint(targetMP.id);
      setToastFeedback(`✓ Equipped ${comp.name}`);
      setTimeout(() => setToastFeedback(null), 2500);
    }
  };

  // Handle Pick & Place initiation (secondary action)
  const handlePickAndPlace = (e: React.MouseEvent, comp: ComponentItem) => {
    e.stopPropagation();
    setDraggingComponent(comp);
    setToastFeedback(`Hover over 3D markers to place ${comp.name}`);
    setTimeout(() => setToastFeedback(null), 3500);
  };

  // Step Navigation Handlers
  const handleStepChange = (index: number) => {
    setActiveStepIndex(index);
    if (optionsPanelRef.current) {
      optionsPanelRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const goToNextStep = () => {
    if (activeStepIndex < configSteps.length - 1) {
      handleStepChange(activeStepIndex + 1);
    }
  };

  const goToPrevStep = () => {
    if (activeStepIndex > 0) {
      handleStepChange(activeStepIndex - 1);
    }
  };

  // Auto-Fix All Handler
  const handleAutoFixAll = () => {
    const res = autoFixAllIssues();
    if (res.fixedCount > 0) {
      setToastFeedback(`✓ Automatically fixed ${res.fixedCount} issue${res.fixedCount > 1 ? "s" : ""} in 1 click!`);
      setTimeout(() => setToastFeedback(null), 4000);
    }
  };

  const installedCount = Object.keys(installedComponents).length;

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-auto lg:h-[calc(100vh-4rem)] overflow-hidden bg-[#070b14]">
      {/* ======================================================== */}
      {/* 1. LEFT / CENTER: DOMINANT 3D PRODUCT VISUAL STAGE      */}
      {/* Always visible on desktop so user sees live changes!   */}
      {/* ======================================================== */}
      <section className="w-full lg:w-[58%] xl:w-[60%] h-[48vh] sm:h-[54vh] lg:h-full relative border-b lg:border-b-0 lg:border-r border-slate-800/80 bg-gradient-to-b from-[#090d18] via-[#0b1122] to-[#070b14] overflow-hidden select-none shrink-0">
        {/* Subtle Ambient Radial Highlight */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-950/20 via-transparent to-transparent" />

        {/* The 3D Scene Viewport Canvas */}
        <div className="w-full h-full">
          <ViewerCanvas />
        </div>

        {/* Top-Center Holographic Guidance when Pick & Place is Active */}
        {draggingComponent && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-full bg-cyan-950/95 backdrop-blur-md border border-cyan-400 shadow-2xl shadow-cyan-500/25 text-xs font-semibold text-cyan-200 flex items-center gap-2.5 animate-pulse">
            <span className="text-cyan-400">✋</span>
            <span>Click or drag onto glowing marker to mount <strong>{draggingComponent.name}</strong></span>
            <button
              onClick={() => setDraggingComponent(null)}
              className="ml-2 px-2 py-0.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px]"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Bottom-Left Power Tool: CAD Studio Tools Drawer Toggle */}
        <div className="absolute bottom-4 left-4 z-20 hidden sm:block">
          <button
            onClick={() => setShowCADStudioDrawer((prev) => !prev)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-2 backdrop-blur-md shadow-lg transition-all hover:scale-105 active:scale-95 ${
              showCADStudioDrawer
                ? "bg-cyan-950 border-cyan-500 text-cyan-300 shadow-cyan-500/20"
                : "bg-slate-900/90 border-slate-700/80 text-slate-300 hover:text-white hover:bg-slate-800"
            }`}
            title="Open advanced CAD assembly tree, transform gizmos, and fine position tools"
          >
            <Settings className="w-3.5 h-3.5 text-cyan-400" />
            <span>CAD Studio Tools</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
              {showCADStudioDrawer ? "Open" : "Advanced"}
            </span>
          </button>
        </div>

        {/* Floating Toast Notification */}
        {toastFeedback && (
          <div className="absolute bottom-16 sm:bottom-4 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-full bg-slate-900/95 border border-cyan-500 text-cyan-300 text-xs font-semibold shadow-2xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastFeedback}</span>
          </div>
        )}
      </section>

      {/* ======================================================== */}
      {/* 2. RIGHT RAIL: SEQUENTIAL PRODUCT CONFIGURATOR FLOW     */}
      {/* Organized into numbered steps with sticky summary       */}
      {/* ======================================================== */}
      <section className="w-full lg:w-[42%] xl:w-[40%] h-auto lg:h-full flex flex-col bg-[#070b14] overflow-hidden">
        {/* STEP PROGRESS TABS BAR (Sticky at top of right panel) */}
        <div className="p-2 sm:p-3 bg-[#090e1a]/95 backdrop-blur-md border-b border-slate-800/80 select-none shrink-0">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {configSteps.map((step, idx) => {
              const isActive = idx === activeStepIndex;
              // Check if any component in this step is equipped
              const isStepConfigured =
                step.categorySlugs.length > 0 &&
                Object.values(installedComponents).some((inst) =>
                  step.categorySlugs.includes(inst.component.category?.slug || "")
                );

              return (
                <button
                  key={step.id}
                  onClick={() => handleStepChange(idx)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap shrink-0 ${
                    isActive
                      ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/30 ring-1 ring-cyan-400"
                      : isStepConfigured
                      ? "bg-slate-900 text-slate-200 border border-slate-800 hover:border-slate-700"
                      : "bg-slate-950/60 text-slate-400 border border-transparent hover:text-slate-200 hover:bg-slate-900/50"
                  }`}
                >
                  <span
                    className={`font-mono text-[11px] px-1.5 py-0.5 rounded font-bold ${
                      isActive ? "bg-cyan-700 text-white" : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {step.stepNumber}
                  </span>
                  <span>{step.shortTitle}</span>
                  {isStepConfigured && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* STEP CONTENT / OPTIONS LIST (Scrollable Center Area) */}
        <div ref={optionsPanelRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Step Header */}
          <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800/80">
            <div>
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider mb-1">
                <span>STEP {currentStep.stepNumber} OF 07</span>
                <span>•</span>
                <span>{currentStep.title}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {currentStep.title}
              </h2>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {currentStep.subtitle}
              </p>
            </div>

            {/* Quick Prev / Next Buttons */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={goToPrevStep}
                disabled={activeStepIndex === 0}
                className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none text-xs font-medium flex items-center gap-1 transition"
                title="Previous step"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Prev</span>
              </button>
              <button
                onClick={goToNextStep}
                disabled={activeStepIndex === configSteps.length - 1}
                className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none text-xs font-medium flex items-center gap-1 transition"
                title="Next step"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* STEP 01: Base Platform Overview */}
          {activeStepIndex === 0 && (
            <div className="rounded-2xl border border-slate-800 bg-[#0d1424] p-5 sm:p-6 space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                      {machine?.modelNumber}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-xs text-slate-400 border border-slate-800">
                      {machine?.category}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white">{machine?.name}</h3>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    {machine?.description}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-semibold">
                    Base Platform
                  </span>
                  <span className="text-xl font-mono font-bold text-white">
                    {formatCurrency(machine?.basePrice || 0, currency)}
                  </span>
                </div>
              </div>

              {/* Technical Specifications Matrix */}
              <div className="grid grid-cols-2 gap-3 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80 text-xs font-mono">
                <div>
                  <span className="text-slate-500 block text-[10px]">ENVELOPE (L×W×H)</span>
                  <span className="text-slate-200 font-semibold">{machine?.baseDimensions}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">CHASSIS MASS</span>
                  <span className="text-slate-200 font-semibold">{machine?.baseWeight} kg</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">POWER SUPPLY</span>
                  <span className="text-slate-200 font-semibold">{machine?.powerRequirements}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">PRECISION MOUNT ZONES</span>
                  <span className="text-cyan-400 font-semibold">{mountingPoints.length} Zones Available</span>
                </div>
              </div>

              {/* Quick Baseline Button & Step 02 Progression */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    loadRecommendedBaseline();
                    setToastFeedback("✓ Loaded Recommended Factory Baseline Configuration!");
                    setTimeout(() => setToastFeedback(null), 3000);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-200 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition"
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Load Factory Baseline Assembly</span>
                </button>

                <button
                  onClick={goToNextStep}
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-600/25 transition"
                >
                  <span>Configure Drive (02)</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEPS 02 - 07: Large Visual Option Cards */}
          {activeStepIndex > 0 && (
            <div className="space-y-4">
              {stepComponents.length === 0 ? (
                <div className="p-8 rounded-2xl border border-slate-800 bg-[#0d1424] text-center text-slate-400 text-xs">
                  No direct components required for this step on this platform. You may proceed to the next step.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {stepComponents.map((comp) => {
                    const isSelected = isComponentSelected(comp);
                    const priceDiff = getPriceDifferenceDisplay(comp);
                    const isSpecExpanded = expandedSpecId === comp.id;

                    // Parse technical specs
                    let specs: Record<string, string> = {};
                    try {
                      specs = JSON.parse(comp.technicalSpecsJson || "{}");
                    } catch {
                      specs = {};
                    }

                    return (
                      <div
                        key={comp.id}
                        onClick={() => handleSelectOption(comp)}
                        className={`group relative rounded-2xl border p-4 sm:p-5 flex flex-col justify-between transition-all duration-300 cursor-pointer ${
                          isSelected
                            ? "bg-[#0f1b32] border-cyan-500 ring-2 ring-cyan-500/30 shadow-xl shadow-cyan-500/15"
                            : "bg-[#0d1424] border-slate-800/90 hover:border-slate-700 hover:bg-[#0f1728] shadow-md"
                        }`}
                      >
                        {/* Top Indicator Ribbon for Equipped Status */}
                        {isSelected && (
                          <div className="absolute top-4 right-4 z-10 flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-600 text-white text-[11px] font-bold shadow-md">
                            <Check className="w-3.5 h-3.5" />
                            <span>EQUIPPED</span>
                          </div>
                        )}

                        <div className="space-y-3">
                          {/* Visual Component Preview (Rich SVG Artwork) */}
                          <div className="w-full h-32 rounded-xl overflow-hidden bg-slate-950/70 border border-slate-800/60 flex items-center justify-center">
                            <ComponentVisualPreview
                              categorySlug={comp.category?.slug}
                              partNumber={comp.partNumber}
                              name={comp.name}
                            />
                          </div>

                          {/* Header: Part Number & Manufacturer */}
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-900 text-cyan-300 border border-slate-800">
                              {comp.partNumber}
                            </span>
                            <span className="text-xs text-slate-400 font-medium">
                              {comp.manufacturer}
                            </span>
                          </div>

                          {/* Component Name & Short Description */}
                          <div>
                            <h4 className="text-base font-bold text-white group-hover:text-cyan-300 transition">
                              {comp.name}
                            </h4>
                            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                              {comp.description}
                            </p>
                          </div>

                          {/* Key Specs Pills */}
                          <div className="flex flex-wrap items-center gap-1.5 pt-1">
                            {comp.powerRating && (
                              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[11px] font-mono text-amber-300">
                                ⚡ {comp.powerRating} kW
                              </span>
                            )}
                            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300">
                              ⚖ {comp.weight} kg
                            </span>
                            {comp.dimensions && (
                              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300">
                                📐 {comp.dimensions}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Card Footer: Price Difference & Action Buttons */}
                        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-col gap-2.5">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-[10px] text-slate-400 uppercase font-semibold block tracking-wider">
                                Price Option
                              </span>
                              <span
                                className={`text-sm font-mono font-bold ${
                                  isSelected
                                    ? "text-emerald-400"
                                    : priceDiff.isPositive
                                    ? "text-cyan-300"
                                    : "text-slate-300"
                                }`}
                              >
                                {priceDiff.text}
                              </span>
                            </div>

                            {/* Secondary Action: Pick & Place in 3D */}
                            <button
                              onClick={(e) => handlePickAndPlace(e, comp)}
                              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold flex items-center gap-1.5 transition"
                              title="Pick up and drag manually into 3D mounting point"
                            >
                              <Hand className="w-3.5 h-3.5 text-cyan-400" />
                              <span>Pick & Place</span>
                            </button>
                          </div>

                          {/* Primary 1-Click Card Equip Button */}
                          <button
                            onClick={() => handleSelectOption(comp)}
                            className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition ${
                              isSelected
                                ? "bg-emerald-950/80 text-emerald-300 border border-emerald-600/50 hover:bg-emerald-900/80 shadow-md"
                                : "bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-600/20"
                            }`}
                          >
                            {isSelected ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Equipped (Active Option)</span>
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Equip {comp.partNumber}</span>
                              </>
                            )}
                          </button>

                          {/* Expandable Technical Specifications Accordion */}
                          <div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedSpecId(isSpecExpanded ? null : comp.id);
                              }}
                              className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 transition"
                            >
                              <span>Technical Specifications</span>
                              {isSpecExpanded ? (
                                <ChevronUp className="w-3 h-3" />
                              ) : (
                                <ChevronDown className="w-3 h-3" />
                              )}
                            </button>

                            {isSpecExpanded && Object.keys(specs).length > 0 && (
                              <div className="mt-2 p-3 rounded-lg bg-slate-950/90 border border-slate-800 text-xs font-mono space-y-1">
                                {Object.entries(specs).map(([key, val]) => (
                                  <div key={key} className="flex justify-between gap-2 text-[11px]">
                                    <span className="text-slate-400">{key}:</span>
                                    <span className="text-slate-200 font-semibold">{val}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Bottom Step Progression Controls */}
              <div className="pt-4 flex items-center justify-between border-t border-slate-800/80">
                <button
                  onClick={goToPrevStep}
                  className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous Step</span>
                </button>

                {activeStepIndex < configSteps.length - 1 ? (
                  <button
                    onClick={goToNextStep}
                    className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-600/25 transition"
                  >
                    <span>Next: {configSteps[activeStepIndex + 1]?.shortTitle}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={onOpenQuoteModal}
                    className="px-6 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-xl transition hover:scale-102"
                  >
                    <span>Finish & Request Quote</span>
                    <Send className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* 3. STICKY CONFIGURATION SUMMARY (Pinned at bottom)      */}
        {/* Compact, clear metrics, compliance, and Quote CTA        */}
        {/* ======================================================== */}
        <div className="p-3.5 sm:p-4 bg-[#090e1a]/98 backdrop-blur-md border-t border-slate-800/90 shadow-2xl shrink-0 space-y-3 select-none">
          {/* Top Row: Machine Identity & Configured Items Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white truncate">
                {machine?.name || "Machine Configuration"}
              </span>
              <button
                onClick={() => setShowConfiguredItemsList((prev) => !prev)}
                className="text-[11px] text-cyan-400 hover:underline flex items-center gap-0.5 shrink-0"
              >
                <span>{installedCount} Item{installedCount !== 1 ? "s" : ""}</span>
                {showConfiguredItemsList ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => toggleBOMDrawer(true)}
                className="text-slate-400 hover:text-cyan-300 text-[11px] flex items-center gap-1 transition"
                title="View itemized Bill of Materials"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">BOM</span>
              </button>
              <button
                onClick={onOpenSaveModal}
                className="text-slate-400 hover:text-cyan-300 text-[11px] flex items-center gap-1 transition"
                title="Save configuration"
              >
                <Save className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Save</span>
              </button>
            </div>
          </div>

          {/* Expandable Configured Items Drawer */}
          {showConfiguredItemsList && (
            <div className="max-h-36 overflow-y-auto space-y-1.5 p-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
              {installedCount === 0 ? (
                <div className="text-center text-slate-500 py-2 text-[11px]">
                  No optional components mounted yet.
                </div>
              ) : (
                Object.entries(installedComponents).map(([mpId, inst]) => (
                  <div key={mpId} className="flex items-center justify-between p-1.5 rounded bg-slate-900/60 border border-slate-800/60">
                    <span className="truncate text-slate-200 text-[11px]">
                      {inst.component.name}
                    </span>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <span className="font-mono text-[11px] text-slate-400">
                        {formatCurrency(inst.component.price, currency)}
                      </span>
                      <button
                        onClick={() => removeComponent(mpId)}
                        className="p-0.5 rounded hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition"
                        title="Remove component"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Key Metrics Row: Weight, Power, and Compliance Status */}
          <div className="flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-3">
              <span className="text-slate-400 text-[11px] font-mono">
                ⚖ <strong className="text-white">{pricing.totalWeightKg.toLocaleString()}</strong> kg
              </span>
              <span className="text-slate-400 text-[11px] font-mono">
                ⚡ <strong className="text-amber-300">{pricing.totalPowerKW}</strong> kW
              </span>
            </div>

            {/* Compliance Badge */}
            <div>
              {validation.valid ? (
                <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Compliant</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-red-400 font-semibold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {validation.errors.length} Issue{validation.errors.length > 1 ? "s" : ""}
                  </span>
                  <button
                    onClick={handleAutoFixAll}
                    className="px-2 py-0.5 rounded bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-[10px] flex items-center gap-1 shadow-sm transition hover:scale-105 active:scale-95"
                    title="1-Click Auto-Fix all issues"
                  >
                    <Wand2 className="w-3 h-3 text-amber-200" />
                    <span>Fix</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Total Price and Primary Request Quote Button */}
          <div className="flex items-center justify-between gap-3 pt-1 border-t border-slate-800/80">
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                Total Price
              </span>
              <span className="text-xl sm:text-2xl font-mono font-black text-white">
                {formatCurrency(pricing.grandTotal, currency)}
              </span>
            </div>

            <button
              onClick={onOpenQuoteModal}
              className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs tracking-wide flex items-center gap-2 shadow-lg shadow-cyan-600/30 transition-all hover:scale-102 active:scale-98"
            >
              <Send className="w-4 h-4" />
              <span>Request Quote</span>
            </button>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 4. ADVANCED CAD STUDIO DRAWER (Slide-over for power users) */}
      {/* ======================================================== */}
      {showCADStudioDrawer && (
        <div className="fixed inset-y-0 right-0 z-50 w-80 sm:w-96 bg-[#090e1a]/98 backdrop-blur-xl border-l border-slate-800 shadow-2xl flex flex-col select-none">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-cyan-400" />
              <h4 className="text-sm font-bold text-white">CAD Studio Engineering Tools</h4>
            </div>
            <button
              onClick={() => setShowCADStudioDrawer(false)}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            <div>
              <span className="text-[10px] text-slate-400 font-mono uppercase block mb-2 font-bold">
                Manipulator Modes
              </span>
              <CADWorkspaceToolbar />
            </div>

            <div>
              <span className="text-[10px] text-slate-400 font-mono uppercase block mb-2 font-bold">
                Assembly Component Tree
              </span>
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-2">
                <AssemblyHierarchyTree />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
