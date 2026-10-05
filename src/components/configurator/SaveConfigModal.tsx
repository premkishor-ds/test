"use client";

import React, { useState } from "react";
import { useConfiguratorStore } from "@/lib/configurator/configurator-store";
import { X, Save, CheckCircle2, Copy, ExternalLink, Loader2 } from "lucide-react";

interface SaveConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SaveConfigModal: React.FC<SaveConfigModalProps> = ({ isOpen, onClose }) => {
  const machine = useConfiguratorStore((s) => s.machine);
  const configurationName = useConfiguratorStore((s) => s.configurationName);
  const setConfigurationName = useConfiguratorStore((s) => s.setConfigurationName);
  const installedComponents = useConfiguratorStore((s) => s.installedComponents);
  const pricing = useConfiguratorStore((s) => s.pricingSummary);

  const [name, setName] = useState(configurationName);
  const [isSaving, setIsSaving] = useState(false);
  const [savedShareUrl, setSavedShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!machine) return;
    setIsSaving(true);

    try {
      const payload = {
        name,
        machineId: machine.id,
        totalPrice: pricing.grandTotal,
        currency: pricing.currency,
        totalWeight: pricing.totalWeightKg,
        totalPower: pricing.totalPowerKW,
        installedComponents: Object.values(installedComponents).map((inst) => ({
          mountingPointId: inst.mountingPointId,
          componentId: inst.component.id,
          quantity: inst.quantity,
          unitPrice: inst.component.price,
          totalPrice: inst.component.price * inst.quantity,
        })),
        bomSnapshot: pricing.bomItems,
        dimensionsSummary: pricing.dimensionsSummary,
      };

      const res = await fetch("/api/configurations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success && data.configuration) {
        setConfigurationName(name);
        const url = `${window.location.origin}/configurations/${data.configuration.id}`;
        setSavedShareUrl(url);
      }
    } catch (err) {
      console.error("Save configuration error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopy = () => {
    if (!savedShareUrl) return;
    navigator.clipboard.writeText(savedShareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none">
      <div className="w-full max-w-md rounded-2xl bg-[#0d1424] border border-cyan-500/30 p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-4">
          <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-800 text-cyan-400">
            <Save className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Save Configuration</h3>
            <p className="text-xs text-slate-400">
              Save your current 3D assembly and generate a permanent shareable link.
            </p>
          </div>
        </div>

        {!savedShareUrl ? (
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Configuration Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Line 4 High-Torque Infeed"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
              />
            </div>

            {/* Snapshot Metrics Preview */}
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 space-y-1 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Machine:</span>
                <span className="text-white">{machine?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Price:</span>
                <span className="text-emerald-400 font-bold">
                  {pricing.grandTotal.toLocaleString()} {pricing.currency}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Installed Components:</span>
                <span>{pricing.componentCount} parts</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-cyan-600/30 transition disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Configuration</span>
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-white mb-1">Configuration Saved!</h4>
              <p className="text-xs text-emerald-300">
                Your configuration has been recorded in the database and can be reloaded at any time.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-400">
                Shareable Configuration Link
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={savedShareUrl}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 font-mono"
                />
                <button
                  onClick={handleCopy}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-white transition flex items-center gap-1.5"
                >
                  <Copy className="w-4 h-4 text-cyan-400" />
                  <span>{copied ? "Copied!" : "Copy"}</span>
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition shadow"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
