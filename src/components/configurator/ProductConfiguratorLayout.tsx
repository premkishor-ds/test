"use client";

import React, { useState, useMemo, useRef } from "react";
import { useConfiguratorStore } from "@/lib/configurator/configurator-store";
import { ComponentItem, MountingPoint } from "@/types/configurator";
import { formatCurrency } from "@/lib/configurator/pricing-bom-engine";
import { ViewerCanvas } from "./3d/ViewerCanvas";
import { AssemblyHierarchyTree } from "./AssemblyHierarchyTree";
import { CADWorkspaceToolbar } from "./CADWorkspaceToolbar";
import {
  Check,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Wand2,
  SlidersHorizontal,
  Layers,
  Boxes,
  Zap,
  Activity,
  Cpu,
  ShieldAlert,
  Wrench,
  Bot,
  Eye,
  Gauge,
  FileSpreadsheet,
  Save,
  Send,
  Sparkles,
  Info,
  Hand,
  Settings,
  X,
  ShieldCheck,
  AlertTriangle,
  Move,
  Flame,
  Factory,
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
  const environment = useConfiguratorStore((s) => s.environment);
  const setEnvironment = useConfiguratorStore((s) => s.setEnvironment);

  const installComponent = useConfiguratorStore((s) => s.installComponent);
  const removeComponent = useConfiguratorStore((s) => s.removeComponent);
  const setDraggingComponent = useConfiguratorStore((s) => s.setDraggingComponent);
  const selectMountingPoint = useConfiguratorStore((s) => s.selectMountingPoint);
  const toggleBOMDrawer = useConfiguratorStore((s) => s.toggleBOMDrawer);
  const autoFixAllIssues = useConfiguratorStore((s) => s.autoFixAllIssues);
  const autoFixIssue = useConfiguratorStore((s) => s.autoFixIssue);

  // Active numbered step (0 to 6)
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  // Expandable technical specifications card map
  const [expandedSpecId, setExpandedSpecId] = useState<string | null>(null);
  // CAD Studio Tools drawer toggle for power users
  const [showCADStudioDrawer, setShowCADStudioDrawer] = useState(false);
  // Toast feedback state
  const [toastFeedback, setToastFeedback] = useState<string | null>(null);

  // Scroll anchor ref for smooth scrolling to options
  const optionsSectionRef = useRef<HTMLDivElement>(null);

  // 1. Definition of the 7 Sequential Numbered Steps
  const configSteps = useMemo(() => {
    return [
      {
        id: "step-platform",
        stepNumber: "01",
        title: "Platform & Base",
        subtitle: "Industrial machine base chassis, structural envelope, and foundation mounting.",
        icon: Boxes,
        categorySlugs: [], // Base machine overview
      },
      {
        id: "step-drive",
        stepNumber: "02",
        title: "Drive & Powertrain",
        subtitle: "Electric induction motors, direct-drive axles, and servo actuation.",
        icon: Zap,
        categorySlugs: ["motors"],
      },
      {
        id: "step-conveyor",
        stepNumber: "03",
        title: "Conveyor & Bed",
        subtitle: "Modular link belts, heavy-duty roller decks, and workpiece tables.",
        icon: Layers,
        categorySlugs: ["conveyors"],
      },
      {
        id: "step-sensors",
        stepNumber: "04",
        title: "Sensors & Telemetry",
        subtitle: "Optical proximity, laser ToF distance telemetry, and inspection probes.",
        icon: Activity,
        categorySlugs: ["sensors", "optics-laser"],
      },
      {
        id: "step-controls",
        stepNumber: "05",
        title: "Controls & Automation",
        subtitle: "Touchscreen HMIs, NEMA 12 PLC enclosures, and VFD power cabinets.",
        icon: Cpu,
        categorySlugs: ["controls"],
      },
      {
        id: "step-safety",
        stepNumber: "06",
        title: "Safety & Guarding",
        subtitle: "OSHA safety enclosures, interlocking cages, and emergency stop consoles.",
        icon: ShieldAlert,
        categorySlugs: ["safety"],
      },
      {
        id: "step-tooling",
        stepNumber: "07",
        title: "Tooling & Robotics",
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
    setTimeout(() => setToastFeedback(null), 3000);
    // Scroll smoothly to 3D canvas if scrolled down
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle Step Navigation
  const goToNextStep = () => {
    if (activeStepIndex < configSteps.length - 1) {
      setActiveStepIndex((prev) => prev + 1);
      optionsSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const goToPrevStep = () => {
    if (activeStepIndex > 0) {
      setActiveStepIndex((prev) => prev - 1);
      optionsSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
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

  return (
    <div className="flex-1 flex flex-col bg-[#070b14] overflow-y-auto">
      {/* 1. DOMINANT VISUAL ELEMENT: Large 3D Product Preview Area */}
      <section className="relative w-full h-[54vh] min-h-[440px] max-h-[640px] bg-gradient-to-b from-[#090d18] via-[#0b1122] to-[#070b14] border-b border-slate-800/80 overflow-hidden select-none">
        {/* Subtle Luxury Radial Glow */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-950/20 via-transparent to-transparent" />

        {/* The 3D Scene Viewport Canvas */}
        <div className="w-full h-full">
          <ViewerCanvas />
        </div>

        {/* Top-Left Floating Product Badge & Interactive Hint */}
        <div className="absolute top-4 left-4 z-20 pointer-events-none flex flex-col gap-1.5">
          <div className="px-3.5 py-1.5 rounded-full bg-slate-900/85 backdrop-blur-md border border-slate-700/60 shadow-xl flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs font-mono font-bold text-white tracking-wider">
              {machine?.modelNumber || "MX-500"}
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-[11px] text-slate-300 font-sans font-medium">
              Interactive 3D Preview
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-950/60 backdrop-blur text-[11px] text-slate-400">
            <span>🖱️ Drag to orbit</span>
            <span>•</span>
            <span>Scroll to zoom</span>
            <span>•</span>
            <span>Right-click to pan</span>
          </div>
        </div>

        {/* Bottom-Left Floating Button: CAD Studio Tools Drawer Toggle */}
        <div className="absolute bottom-4 left-4 z-20">
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
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-full bg-slate-900/95 border border-cyan-500 text-cyan-300 text-xs font-semibold shadow-2xl flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastFeedback}</span>
          </div>
        )}
      </section>

      {/* 2. NUMBERED CONFIGURATION STEPS NAV BAR */}
      <div className="sticky top-0 z-30 bg-[#090e1a]/95 backdrop-blur-md border-b border-slate-800 px-4 py-3 select-none">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5 sm:gap-2">
            {configSteps.map((step, idx) => {
              const StepIcon = step.icon;
              const isActive = idx === activeStepIndex;
              // Check if any part in this step is equipped
              const isStepConfigured =
                step.categorySlugs.length > 0 &&
                Object.values(installedComponents).some((inst) =>
                  step.categorySlugs.includes(inst.component.category?.slug || "")
                );

              return (
                <button
                  key={step.id}
                  onClick={() => {
                    setActiveStepIndex(idx);
                    optionsSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-cyan-600 text-white shadow-lg shadow-cyan-600/30 scale-102"
                      : isStepConfigured
                      ? "bg-slate-900 text-slate-200 border border-slate-800 hover:border-slate-700 hover:text-white"
                      : "bg-slate-950/60 text-slate-400 border border-transparent hover:text-slate-200 hover:bg-slate-900/50"
                  }`}
                >
                  <span
                    className={`font-mono text-[11px] px-1.5 py-0.5 rounded ${
                      isActive ? "bg-cyan-700 text-white" : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {step.stepNumber}
                  </span>
                  <span>{step.title}</span>
                  {isStepConfigured && !isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Environment Selector in Bar */}
          <div className="hidden xl:flex items-center gap-1.5 pl-4 border-l border-slate-800 text-xs">
            <span className="text-slate-500 font-mono text-[10px]">ENV:</span>
            <button
              onClick={() => setEnvironment("STANDARD")}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold border transition ${
                environment === "STANDARD"
                  ? "bg-slate-800 border-cyan-500 text-cyan-300"
                  : "bg-transparent border-transparent text-slate-400 hover:text-white"
              }`}
            >
              Standard
            </button>
            <button
              onClick={() => setEnvironment("HAZARDOUS")}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold border transition ${
                environment === "HAZARDOUS"
                  ? "bg-amber-950 border-amber-500 text-amber-300"
                  : "bg-transparent border-transparent text-slate-400 hover:text-white"
              }`}
            >
              Washdown IP67
            </button>
          </div>
        </div>
      </div>

      {/* 3. MAIN WORKSPACE: Options Grid & Sticky Right Configuration Summary */}
      <div ref={optionsSectionRef} className="max-w-7xl mx-auto w-full px-4 py-8 flex flex-col lg:flex-row gap-8">
        {/* LEFT / CENTER: Sequential Option Cards for Active Step */}
        <div className="flex-1 flex flex-col space-y-6">
          {/* Step Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-4 border-b border-slate-800/80">
            <div>
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider mb-1">
                <span>STEP {currentStep.stepNumber} OF 07</span>
                <span>•</span>
                <span>{currentStep.title}</span>
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                {currentStep.title} Options
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
                {currentStep.subtitle}
              </p>
            </div>

            {/* Step Counter Navigation */}
            <div className="flex items-center gap-2">
              <button
                onClick={goToPrevStep}
                disabled={activeStepIndex === 0}
                className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none text-xs font-medium flex items-center gap-1 transition"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>
              <button
                onClick={goToNextStep}
                disabled={activeStepIndex === configSteps.length - 1}
                className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none text-xs font-medium flex items-center gap-1 transition"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* STEP 01: Machine Platform Overview Card */}
          {activeStepIndex === 0 && (
            <div className="rounded-2xl border border-slate-800 bg-[#0d1424] p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                      {machine?.modelNumber}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-xs text-slate-400 border border-slate-800">
                      {machine?.category}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-white">{machine?.name}</h3>
                  <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-3xl leading-relaxed">
                    {machine?.description}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-semibold">
                    Base Platform Price
                  </span>
                  <span className="text-2xl font-mono font-bold text-white">
                    {formatCurrency(machine?.basePrice || 0, currency)}
                  </span>
                </div>
              </div>

              {/* Technical Specifications Matrix */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/80 p-4 rounded-xl border border-slate-800/80 text-xs font-mono">
                <div>
                  <span className="text-slate-500 block text-[10px]">ENVELOPE (L×W×H)</span>
                  <span className="text-slate-200 font-semibold">{machine?.baseDimensions}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">CHASSIS MASS</span>
                  <span className="text-slate-200 font-semibold">{machine?.baseWeight} kg</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">SUPPLY POWER</span>
                  <span className="text-slate-200 font-semibold">{machine?.powerRequirements}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">MOUNT ZONES</span>
                  <span className="text-cyan-400 font-semibold">{mountingPoints.length} Precision Zones</span>
                </div>
              </div>

              {/* Next Step Callout */}
              <div className="pt-4 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Proceed to Step 02 to configure the drive motor and transmission options.
                </span>
                <button
                  onClick={goToNextStep}
                  className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-600/25 transition"
                >
                  <span>Configure Powertrain (02)</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEPS 02 - 07: Large Visual Option Cards Grid */}
          {activeStepIndex > 0 && (
            <div className="space-y-6">
              {stepComponents.length === 0 ? (
                <div className="p-8 rounded-2xl border border-slate-800 bg-[#0d1424] text-center text-slate-400 text-xs">
                  No direct components found for this category on this platform. You may proceed to the next configuration step.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                        className={`group relative rounded-2xl border p-5 flex flex-col justify-between transition-all duration-300 cursor-pointer ${
                          isSelected
                            ? "bg-[#0f1b32] border-cyan-500 ring-2 ring-cyan-500/20 shadow-xl shadow-cyan-500/10 scale-[1.01]"
                            : "bg-[#0d1424] border-slate-800 hover:border-slate-700 hover:bg-[#0f1728] shadow-md"
                        }`}
                      >
                        {/* Selected Indicator Ribbon */}
                        {isSelected && (
                          <div className="absolute top-4 right-4 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-600 text-white text-[10px] font-bold shadow-md">
                            <Check className="w-3 h-3" />
                            <span>EQUIPPED</span>
                          </div>
                        )}

                        <div>
                          {/* Card Header: Category & Part Number */}
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-900 text-slate-300 border border-slate-800">
                              {comp.partNumber}
                            </span>
                            <span className="text-[11px] text-slate-400 font-medium">
                              {comp.manufacturer}
                            </span>
                          </div>

                          {/* Component Name */}
                          <h4 className="text-base font-bold text-white group-hover:text-cyan-300 transition">
                            {comp.name}
                          </h4>

                          {/* Short Description */}
                          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                            {comp.description}
                          </p>

                          {/* Key Specs Pill Bar */}
                          <div className="flex flex-wrap items-center gap-2 mt-3.5">
                            {comp.powerRating && (
                              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[11px] font-mono text-amber-300">
                                {comp.powerRating} kW
                              </span>
                            )}
                            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300">
                              {comp.weight} kg
                            </span>
                            {comp.dimensions && (
                              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300">
                                {comp.dimensions}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Card Footer: Price Difference & Action Buttons */}
                        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-col gap-3">
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
                              <Hand className="w-3 h-3 text-cyan-400" />
                              <span>Pick & Place</span>
                            </button>
                          </div>

                          {/* Primary Card Select Button */}
                          <button
                            onClick={() => handleSelectOption(comp)}
                            className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition ${
                              isSelected
                                ? "bg-emerald-950/80 text-emerald-300 border border-emerald-600/50 hover:bg-emerald-900/80"
                                : "bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-600/20"
                            }`}
                          >
                            {isSelected ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Selected Option</span>
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Equip {comp.partNumber}</span>
                              </>
                            )}
                          </button>

                          {/* Expandable Technical Specifications Accordion */}
                          <div className="pt-1">
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
                              <div className="mt-2.5 p-3 rounded-lg bg-slate-950/80 border border-slate-800/80 text-xs font-mono space-y-1.5">
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

              {/* Bottom Step Progression Buttons */}
              <div className="pt-6 flex items-center justify-between border-t border-slate-800/80">
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
                    className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-600/25 transition"
                  >
                    <span>Next: {configSteps[activeStepIndex + 1]?.title}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={onOpenQuoteModal}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-xl transition hover:scale-102"
                  >
                    <span>Finish & Request Quote</span>
                    <Send className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 4. STICKY CONFIGURATION SUMMARY (Right Rail on Desktop) */}
        <aside className="w-full lg:w-96 shrink-0 select-none">
          <div className="lg:sticky lg:top-16 rounded-2xl border border-slate-800 bg-[#0d1424] p-5 sm:p-6 space-y-5 shadow-2xl">
            {/* Header: Machine Platform */}
            <div className="pb-4 border-b border-slate-800/80">
              <span className="text-[10px] text-cyan-400 font-mono font-bold uppercase tracking-wider block">
                CONFIGURATION SUMMARY
              </span>
              <h3 className="text-lg font-bold text-white mt-1 leading-snug">
                {machine?.name}
              </h3>
              <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-400">
                <span className="font-mono text-cyan-300">{machine?.modelNumber}</span>
                <span>•</span>
                <span>Base: {formatCurrency(machine?.basePrice || 0, currency)}</span>
              </div>
            </div>

            {/* Selected Options List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                  Configured Components ({Object.keys(installedComponents).length})
                </span>
                <button
                  onClick={() => toggleBOMDrawer(true)}
                  className="text-cyan-400 hover:underline text-[11px]"
                >
                  View BOM
                </button>
              </div>

              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                {Object.entries(installedComponents).length === 0 ? (
                  <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/60 text-slate-400 text-xs text-center">
                    No components added yet.
                  </div>
                ) : (
                  Object.entries(installedComponents).map(([mpId, inst]) => {
                    const mp = mountingPoints.find((p) => p.id === mpId);
                    return (
                      <div
                        key={mpId}
                        className="p-2 rounded-lg bg-slate-950/70 border border-slate-800/70 flex items-center justify-between text-xs"
                      >
                        <div className="truncate mr-2">
                          <span className="font-semibold text-white truncate block">
                            {inst.component.name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {inst.component.partNumber} • {mp?.name || "Mount"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-mono text-xs text-slate-300">
                            {formatCurrency(inst.component.price, currency)}
                          </span>
                          <button
                            onClick={() => removeComponent(mpId)}
                            className="p-1 rounded hover:bg-red-950/80 text-slate-400 hover:text-red-400 transition"
                            title="Remove component"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Key Technical Specifications Grid */}
            <div className="grid grid-cols-2 gap-2 bg-slate-950/80 p-3 rounded-xl border border-slate-800/80 text-xs font-mono">
              <div>
                <span className="text-slate-400 block text-[10px]">TOTAL MASS</span>
                <span className="text-white font-bold">{pricing.totalWeightKg.toLocaleString()} kg</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">TOTAL POWER</span>
                <span className="text-amber-400 font-bold">{pricing.totalPowerKW} kW</span>
              </div>
            </div>

            {/* Engineering Compliance Status & 1-Click Auto-Fix */}
            <div className="pt-2">
              {validation.valid ? (
                <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/60 flex items-center gap-2.5 text-xs text-emerald-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-semibold">Full Engineering Compliance</span>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/80 flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs text-red-200">
                      <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                      <span className="font-bold">{validation.errors.length} Issue(s) Detected</span>
                    </div>
                    <button
                      onClick={handleAutoFixAll}
                      className="px-2.5 py-1 rounded-md bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-[10px] flex items-center gap-1 shadow-sm transition hover:scale-105 active:scale-95"
                    >
                      <Wand2 className="w-3 h-3 text-amber-200" />
                      <span>1-Click Fix</span>
                    </button>
                  </div>
                  <span className="text-[11px] text-red-300 leading-tight">
                    {validation.errors[0]?.message}
                  </span>
                </div>
              )}
            </div>

            {/* Total Price Section */}
            <div className="pt-4 border-t border-slate-800/80 flex items-end justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                  Estimated Total
                </span>
                <span className="text-2xl font-mono font-black text-white">
                  {formatCurrency(pricing.grandTotal, currency)}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">Ex-Factory</span>
            </div>

            {/* Primary Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                onClick={onOpenQuoteModal}
                className="w-full py-3.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-black text-sm tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/30 transition-all hover:scale-102 active:scale-98"
              >
                <Send className="w-4 h-4" />
                <span>Request Quote</span>
              </button>

              <button
                onClick={onOpenSaveModal}
                className="w-full py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 hover:bg-slate-800 text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 transition"
              >
                <Save className="w-3.5 h-3.5 text-cyan-400" />
                <span>Save Configuration</span>
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* 5. ADVANCED CAD STUDIO DRAWER (Slide-over for engineering power users) */}
      {showCADStudioDrawer && (
        <div className="fixed inset-y-0 right-0 z-50 w-80 sm:w-96 bg-[#090e1a]/98 backdrop-blur-xl border-l border-slate-800 shadow-2xl flex flex-col animate-slide-left select-none">
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
            {/* CAD Toolbar Modes */}
            <div>
              <span className="text-[10px] text-slate-400 font-mono uppercase block mb-2 font-bold">
                Manipulator Modes
              </span>
              <CADWorkspaceToolbar />
            </div>

            {/* Assembly Hierarchy Tree */}
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
