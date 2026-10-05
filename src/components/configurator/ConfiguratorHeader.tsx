"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useConfiguratorStore } from "@/lib/configurator/configurator-store";
import { formatCurrency } from "@/lib/configurator/pricing-bom-engine";
import {
  Undo2,
  Redo2,
  RotateCcw,
  Save,
  FileSpreadsheet,
  Send,
  Zap,
  Weight,
  Layers,
  ShieldCheck,
  AlertTriangle,
  ChevronLeft,
  DollarSign,
  Share2,
} from "lucide-react";

interface ConfiguratorHeaderProps {
  onOpenSaveModal: () => void;
  onOpenQuoteModal: () => void;
}

export const ConfiguratorHeader: React.FC<ConfiguratorHeaderProps> = ({
  onOpenSaveModal,
  onOpenQuoteModal,
}) => {
  const machine = useConfiguratorStore((s) => s.machine);
  const configurationName = useConfiguratorStore((s) => s.configurationName);
  const pricing = useConfiguratorStore((s) => s.pricingSummary);
  const validation = useConfiguratorStore((s) => s.validation);
  const currency = useConfiguratorStore((s) => s.currency);
  const setCurrency = useConfiguratorStore((s) => s.setCurrency);

  const history = useConfiguratorStore((s) => s.history);
  const historyIndex = useConfiguratorStore((s) => s.historyIndex);
  const undo = useConfiguratorStore((s) => s.undo);
  const redo = useConfiguratorStore((s) => s.redo);
  const resetConfiguration = useConfiguratorStore((s) => s.resetConfiguration);
  const toggleBOMDrawer = useConfiguratorStore((s) => s.toggleBOMDrawer);
  const isBOMDrawerOpen = useConfiguratorStore((s) => s.isBOMDrawerOpen);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return (
    <header className="h-16 border-b border-slate-800 bg-[#090e1a]/95 backdrop-blur px-4 flex items-center justify-between z-30 select-none">
      {/* LEFT: Back to catalog & Machine Identity */}
      <div className="flex items-center gap-3">
        <Link
          href="/machines"
          className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition"
          title="Back to Machine Catalog"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>

        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h1 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2">
              {machine?.name || "Industrial Machine Configurator"}
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-cyan-950 text-cyan-400 border border-cyan-800">
              {machine?.modelNumber || "MX-500"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span>{configurationName}</span>
            <span>•</span>
            <span className="text-slate-300 font-mono">{pricing.dimensionsSummary}</span>
          </div>
        </div>
      </div>

      {/* CENTER: Real-time Technical Metrics (Weight, Power, Rules Status) */}
      <div className="hidden lg:flex items-center gap-5 px-4 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs">
        {/* Total Machine Weight */}
        <div className="flex items-center gap-1.5" title="Total Assembled Machine Weight">
          <Weight className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-400">Weight:</span>
          <span className="font-mono font-semibold text-white">
            {pricing.totalWeightKg.toLocaleString()} kg
          </span>
        </div>

        <div className="w-[1px] h-3.5 bg-slate-800" />

        {/* Connected Motor & Power Load */}
        <div className="flex items-center gap-1.5" title="Total Connected Electrical Power Draw">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-slate-400">Power:</span>
          <span className="font-mono font-semibold text-white">
            {pricing.totalPowerKW} kW
          </span>
        </div>

        <div className="w-[1px] h-3.5 bg-slate-800" />

        {/* Validation Status Indicator */}
        <div className="flex items-center gap-1.5">
          {validation.valid ? (
            <div className="flex items-center gap-1 text-emerald-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Compliant</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-red-400 font-medium animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{validation.errors.length} Issue(s)</span>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: Price, Undo/Redo, Currency, Save & RFQ actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Undo / Redo */}
        <div className="flex items-center gap-1 bg-slate-900/80 border border-slate-800 rounded-lg p-0.5">
          <button
            onClick={undo}
            disabled={!canUndo}
            title="Undo Configuration Change (Ctrl+Z)"
            className="p-1.5 rounded text-slate-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none hover:bg-slate-800 transition"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            title="Redo Configuration Change (Ctrl+Y)"
            className="p-1.5 rounded text-slate-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none hover:bg-slate-800 transition"
          >
            <Redo2 className="w-4 h-4" />
          </button>
          <button
            onClick={resetConfiguration}
            title="Reset Configuration to Default"
            className="p-1.5 rounded text-slate-400 hover:text-red-400 hover:bg-slate-800 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Currency Switcher */}
        <button
          onClick={() => setCurrency(currency === "INR" ? "USD" : "INR")}
          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] font-mono font-semibold text-cyan-300 border border-slate-700 transition"
          title="Toggle INR / USD Currency"
        >
          {currency}
        </button>

        {/* Live Total Price Pill */}
        <div
          onClick={() => toggleBOMDrawer(true)}
          className="cursor-pointer px-3 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-500/40 hover:border-emerald-400 text-right transition"
          title="Click to view full itemized Bill of Materials"
        >
          <div className="text-[10px] text-emerald-400 uppercase tracking-wider font-semibold">
            Total Price
          </div>
          <div className="text-sm sm:text-base font-mono font-bold text-white leading-tight">
            {formatCurrency(pricing.grandTotal, currency)}
          </div>
        </div>

        {/* Save Configuration Button */}
        <button
          onClick={onOpenSaveModal}
          className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-white transition shadow"
        >
          <Save className="w-3.5 h-3.5 text-cyan-400" />
          <span>Save</span>
        </button>

        {/* Request for Quote (RFQ) Button */}
        <button
          onClick={onOpenQuoteModal}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-lg shadow-cyan-600/30 transition hover:scale-[1.02] active:scale-[0.98]"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Request Quote</span>
        </button>
      </div>
    </header>
  );
};
