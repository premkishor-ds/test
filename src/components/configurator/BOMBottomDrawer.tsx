"use client";

import React from "react";
import { useConfiguratorStore } from "@/lib/configurator/configurator-store";
import { formatCurrency, generateBOMCsv } from "@/lib/configurator/pricing-bom-engine";
import { generateBOMAndQuotePDF } from "@/lib/pdf/pdf-generator";
import {
  ChevronUp,
  ChevronDown,
  FileSpreadsheet,
  FileText,
  Send,
  Weight,
  Zap,
  Box,
  Layers,
} from "lucide-react";

interface BOMBottomDrawerProps {
  onOpenQuoteModal: () => void;
}

export const BOMBottomDrawer: React.FC<BOMBottomDrawerProps> = ({ onOpenQuoteModal }) => {
  const machine = useConfiguratorStore((s) => s.machine);
  const pricing = useConfiguratorStore((s) => s.pricingSummary);
  const currency = useConfiguratorStore((s) => s.currency);
  const isBOMDrawerOpen = useConfiguratorStore((s) => s.isBOMDrawerOpen);
  const toggleBOMDrawer = useConfiguratorStore((s) => s.toggleBOMDrawer);

  // Download CSV Handler
  const handleDownloadCsv = () => {
    if (!machine) return;
    const csvContent = generateBOMCsv(pricing, machine.name);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `BOM_${machine.modelNumber}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download PDF Handler
  const handleDownloadPDF = () => {
    if (!machine) return;
    const doc = generateBOMAndQuotePDF({
      quoteNumber: `BOM-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: "Engineering Review",
      companyName: "Internal Spec Sheet",
      email: "engineer@company.com",
      phone: "+91 90000 00000",
      country: "India",
      machine,
      pricing,
    });
    doc.save(`BOM_${machine.modelNumber}_SpecSheet.pdf`);
  };

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-30 transition-all duration-300 ease-in-out border-t border-slate-800 bg-[#090e1a]/98 backdrop-blur shadow-2xl select-none flex flex-col ${
        isBOMDrawerOpen ? "h-80 sm:h-96" : "h-12"
      }`}
    >
      {/* Drawer Header Handle / Quick Bar */}
      <div
        onClick={() => toggleBOMDrawer()}
        className="h-12 px-4 flex items-center justify-between cursor-pointer hover:bg-slate-800/40 transition border-b border-slate-800/60"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-white uppercase tracking-wider">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Bill of Materials (BOM) & Technical Data</span>
          </div>

          <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800 text-slate-300">
            {pricing.componentCount + 1} Line Items
          </span>
        </div>

        {/* Quick Summary Pill on collapsed state */}
        <div className="flex items-center gap-4 text-xs">
          <div className="hidden md:flex items-center gap-3 text-slate-400 text-[11px] font-mono">
            <span>Mass: <strong className="text-white">{pricing.totalWeightKg} kg</strong></span>
            <span>•</span>
            <span>Power: <strong className="text-white">{pricing.totalPowerKW} kW</strong></span>
            <span>•</span>
            <span>Envelope: <strong className="text-white">{pricing.dimensionsSummary}</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-emerald-400 text-sm sm:text-base">
              {formatCurrency(pricing.grandTotal, currency)}
            </span>

            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleBOMDrawer();
              }}
              className="p-1.5 rounded hover:bg-slate-700 text-slate-300 transition"
              title={isBOMDrawerOpen ? "Collapse BOM Drawer" : "Expand BOM Drawer"}
            >
              {isBOMDrawerOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Table & Action Controls */}
      {isBOMDrawerOpen && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Action Toolbar */}
          <div className="px-4 py-2 bg-slate-950/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadPDF}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition border border-slate-700 shadow"
              >
                <FileText className="w-3.5 h-3.5 text-cyan-400" />
                <span>Download BOM PDF</span>
              </button>

              <button
                onClick={handleDownloadCsv}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition border border-slate-700 shadow"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span>Download CSV</span>
              </button>
            </div>

            <button
              onClick={onOpenQuoteModal}
              className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-lg shadow-cyan-600/30"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Request Formal Quote (RFQ)</span>
            </button>
          </div>

          {/* Table Container */}
          <div className="flex-1 overflow-y-auto px-4 py-2">
            <table className="w-full text-left text-xs border-collapse font-sans">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[11px] font-mono uppercase bg-slate-900/40">
                  <th className="py-2 px-3">Part #</th>
                  <th className="py-2 px-3">Description</th>
                  <th className="py-2 px-3">Category</th>
                  <th className="py-2 px-3 text-center">Qty</th>
                  <th className="py-2 px-3 text-right">Unit Price</th>
                  <th className="py-2 px-3 text-right">Total</th>
                  <th className="py-2 px-3 text-right">Weight</th>
                  <th className="py-2 px-3">Dimensions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
                {/* Base Machine Chassis Row */}
                <tr className="hover:bg-slate-800/30 transition">
                  <td className="py-2 px-3 font-bold text-cyan-300">BASE-FRAME</td>
                  <td className="py-2 px-3 font-sans font-semibold text-white">
                    {machine?.name} Base Structural Assembly
                  </td>
                  <td className="py-2 px-3 font-sans text-slate-400">Chassis</td>
                  <td className="py-2 px-3 text-center">1</td>
                  <td className="py-2 px-3 text-right">
                    {formatCurrency(pricing.baseMachinePrice, currency)}
                  </td>
                  <td className="py-2 px-3 text-right font-bold text-white">
                    {formatCurrency(pricing.baseMachinePrice, currency)}
                  </td>
                  <td className="py-2 px-3 text-right">{machine?.baseWeight} kg</td>
                  <td className="py-2 px-3 text-slate-400">{pricing.dimensionsSummary}</td>
                </tr>

                {/* Installed Components Rows */}
                {pricing.bomItems.map((item, idx) => (
                  <tr key={`${item.partNumber}-${idx}`} className="hover:bg-slate-800/30 transition">
                    <td className="py-2 px-3 font-bold text-cyan-400">{item.partNumber}</td>
                    <td className="py-2 px-3 font-sans text-slate-200">{item.name}</td>
                    <td className="py-2 px-3 font-sans text-slate-400">{item.category}</td>
                    <td className="py-2 px-3 text-center">{item.quantity}</td>
                    <td className="py-2 px-3 text-right">
                      {formatCurrency(item.unitPrice, currency)}
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-white">
                      {formatCurrency(item.totalPrice, currency)}
                    </td>
                    <td className="py-2 px-3 text-right">{item.weight} kg</td>
                    <td className="py-2 px-3 text-slate-400">{item.dimensions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Subtotal & Taxes Bottom Summary Bar */}
          <div className="px-4 py-2 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-400 font-mono">
            <div className="flex items-center gap-4">
              <span>Subtotal: <strong className="text-white">{formatCurrency(pricing.subtotal, currency)}</strong></span>
              <span>•</span>
              <span>18% Tax / GST: <strong className="text-white">{formatCurrency(pricing.taxAmount, currency)}</strong></span>
            </div>
            <div className="text-sm font-bold text-white font-mono">
              Quoted Total: <span className="text-emerald-400">{formatCurrency(pricing.grandTotal, currency)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
