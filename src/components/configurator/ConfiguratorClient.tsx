"use client";

import React, { useEffect, useState } from "react";
import { useConfiguratorStore } from "@/lib/configurator/configurator-store";
import {
  Machine,
  MountingPoint,
  ComponentItem,
  ComponentCategory,
  CompatibilityRule,
  InstalledComponent,
} from "@/types/configurator";
import { ConfiguratorHeader } from "@/components/configurator/ConfiguratorHeader";
import { ComponentLibraryPanel } from "@/components/configurator/ComponentLibraryPanel";
import { PropertiesInspectorPanel } from "@/components/configurator/PropertiesInspectorPanel";
import { ViewerCanvas } from "@/components/configurator/3d/ViewerCanvas";
import { BOMBottomDrawer } from "@/components/configurator/BOMBottomDrawer";
import { SaveConfigModal } from "@/components/configurator/SaveConfigModal";
import { QuoteModal } from "@/components/configurator/QuoteModal";
import { Layers, SlidersHorizontal, Compass } from "lucide-react";

interface ConfiguratorClientProps {
  machine: Machine;
  mountingPoints: MountingPoint[];
  components: ComponentItem[];
  categories: ComponentCategory[];
  rules: CompatibilityRule[];
  initialInstalled?: Record<string, InstalledComponent>;
  initialConfigName?: string;
}

export const ConfiguratorClient: React.FC<ConfiguratorClientProps> = ({
  machine,
  mountingPoints,
  components,
  categories,
  rules,
  initialInstalled,
  initialConfigName,
}) => {
  const initialize = useConfiguratorStore((s) => s.initialize);
  const isBOMDrawerOpen = useConfiguratorStore((s) => s.isBOMDrawerOpen);

  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);

  // Mobile active drawer state ('NONE' | 'COMPONENTS' | 'PROPERTIES')
  const [mobileDrawer, setMobileDrawer] = useState<"NONE" | "COMPONENTS" | "PROPERTIES">("NONE");

  // Initialize store on mount
  useEffect(() => {
    initialize(
      machine,
      mountingPoints,
      components,
      rules,
      categories,
      initialInstalled,
      initialConfigName || `${machine.name} Custom Configuration`
    );
  }, [machine, mountingPoints, components, rules, categories, initialInstalled, initialConfigName, initialize]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#070b14] text-slate-100 font-sans">
      {/* Top Header */}
      <ConfiguratorHeader
        onOpenSaveModal={() => setIsSaveModalOpen(true)}
        onOpenQuoteModal={() => setIsQuoteModalOpen(true)}
      />

      {/* Main 3-Column Studio Workspace */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* LEFT: Component Library (Desktop & Mobile Drawer) */}
        <div
          className={`h-full z-20 transition-transform duration-300 md:translate-x-0 ${
            mobileDrawer === "COMPONENTS"
              ? "translate-x-0 absolute inset-y-0 left-0"
              : "-translate-x-full md:relative md:translate-x-0"
          }`}
        >
          <ComponentLibraryPanel />
        </div>

        {/* CENTER: Interactive 3D Canvas Studio */}
        <main className="flex-1 h-full relative overflow-hidden">
          <ViewerCanvas />

          {/* Mobile Bottom Float Trigger Bar */}
          <div className="md:hidden absolute bottom-14 left-4 right-4 z-20 flex items-center justify-between gap-2 p-1.5 rounded-xl hud-panel shadow-2xl">
            <button
              onClick={() =>
                setMobileDrawer(mobileDrawer === "COMPONENTS" ? "NONE" : "COMPONENTS")
              }
              className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                mobileDrawer === "COMPONENTS"
                  ? "bg-cyan-600 text-white"
                  : "bg-slate-800 text-slate-300"
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Components</span>
            </button>

            <button
              onClick={() =>
                setMobileDrawer(mobileDrawer === "PROPERTIES" ? "NONE" : "PROPERTIES")
              }
              className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                mobileDrawer === "PROPERTIES"
                  ? "bg-cyan-600 text-white"
                  : "bg-slate-800 text-slate-300"
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Properties</span>
            </button>
          </div>
        </main>

        {/* RIGHT: Properties & Validation Inspector (Desktop & Mobile Drawer) */}
        <div
          className={`h-full z-20 transition-transform duration-300 md:translate-x-0 ${
            mobileDrawer === "PROPERTIES"
              ? "translate-x-0 absolute inset-y-0 right-0"
              : "translate-x-full md:relative md:translate-x-0"
          }`}
        >
          <PropertiesInspectorPanel />
        </div>
      </div>

      {/* BOTTOM: Bill of Materials Collapsible Dock */}
      <BOMBottomDrawer onOpenQuoteModal={() => setIsQuoteModalOpen(true)} />

      {/* Modals */}
      <SaveConfigModal isOpen={isSaveModalOpen} onClose={() => setIsSaveModalOpen(false)} />
      <QuoteModal isOpen={isQuoteModalOpen} onClose={() => setIsQuoteModalOpen(false)} />
    </div>
  );
};
