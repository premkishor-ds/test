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
import { ProductConfiguratorLayout } from "@/components/configurator/ProductConfiguratorLayout";
import { BOMBottomDrawer } from "@/components/configurator/BOMBottomDrawer";
import { SaveConfigModal } from "@/components/configurator/SaveConfigModal";
import { QuoteModal } from "@/components/configurator/QuoteModal";

interface ConfiguratorClientProps {
  machine: Machine;
  mountingPoints: MountingPoint[];
  components: ComponentItem[];
  categories: ComponentCategory[];
  rules: CompatibilityRule[];
  initialInstalled?: Record<string, InstalledComponent>;
  initialConfigName?: string;
  startFromScratch?: boolean;
}

export const ConfiguratorClient: React.FC<ConfiguratorClientProps> = ({
  machine,
  mountingPoints,
  components,
  categories,
  rules,
  initialInstalled,
  initialConfigName,
  startFromScratch = false,
}) => {
  const initialize = useConfiguratorStore((s) => s.initialize);

  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);

  // Initialize store on mount
  useEffect(() => {
    initialize(
      machine,
      mountingPoints,
      components,
      rules,
      categories,
      initialInstalled,
      initialConfigName || `${machine.name} ${startFromScratch ? "Scratch Assembly" : "Custom Configuration"}`,
      startFromScratch
    );
  }, [machine, mountingPoints, components, rules, categories, initialInstalled, initialConfigName, startFromScratch, initialize]);

  return (
    <div className="flex flex-col min-h-screen w-full bg-[#070b14] text-slate-100 font-sans">
      {/* Top Header */}
      <ConfiguratorHeader
        onOpenSaveModal={() => setIsSaveModalOpen(true)}
        onOpenQuoteModal={() => setIsQuoteModalOpen(true)}
      />

      {/* Main Clean Product Configurator Experience */}
      <ProductConfiguratorLayout
        onOpenSaveModal={() => setIsSaveModalOpen(true)}
        onOpenQuoteModal={() => setIsQuoteModalOpen(true)}
      />

      {/* BOTTOM: Bill of Materials Collapsible Dock */}
      <BOMBottomDrawer onOpenQuoteModal={() => setIsQuoteModalOpen(true)} />

      {/* Modals */}
      <SaveConfigModal isOpen={isSaveModalOpen} onClose={() => setIsSaveModalOpen(false)} />
      <QuoteModal isOpen={isQuoteModalOpen} onClose={() => setIsQuoteModalOpen(false)} />
    </div>
  );
};
