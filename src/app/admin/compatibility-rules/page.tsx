"use client";

import React, { useState, useEffect } from "react";
import { GitBranch, Plus, Save, CheckCircle2, AlertOctagon, Sliders, ShieldCheck } from "lucide-react";
import { CompatibilityRule } from "@/types/configurator";

export default function AdminCompatibilityRulesPage() {
  const [rules, setRules] = useState<CompatibilityRule[]>([]);
  const [machines, setMachines] = useState<any[]>([]);
  const [components, setComponents] = useState<any[]>([]);

  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Rule Form State
  const [formData, setFormData] = useState({
    id: "",
    name: "New Compatibility Rule",
    description: "",
    ruleType: "DIMENSION_CONSTRAINT",
    machineId: "",
    triggerPartNumber: "MTR-010",
    targetPartNumbers: "CVY-004, CVY-006",
    errorMessage: "The selected motor requires an extended conveyor frame.",
    isActive: true,
  });

  const loadData = () => {
    fetch("/api/compatibility-rules")
      .then((r) => r.json())
      .then((d) => {
        if (d.rules) setRules(d.rules);
      })
      .catch(console.error);

    fetch("/api/machines")
      .then((r) => r.json())
      .then((d) => {
        if (d.machines) setMachines(d.machines);
      })
      .catch(console.error);

    fetch("/api/components")
      .then((r) => r.json())
      .then((d) => {
        if (d.components) setComponents(d.components);
      })
      .catch(console.error);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectRule = (rule: CompatibilityRule) => {
    setSelectedRuleId(rule.id);
    let trigger = {};
    let target = {};
    try {
      trigger = JSON.parse(rule.triggerJson || "{}");
      target = JSON.parse(rule.targetJson || "{}");
    } catch {}

    setFormData({
      id: rule.id,
      name: rule.name,
      description: rule.description || "",
      ruleType: rule.ruleType,
      machineId: rule.machineId || "",
      triggerPartNumber: (trigger as any).partNumber || "",
      targetPartNumbers: ((target as any).requiredPartNumbers || []).join(", "),
      errorMessage: rule.errorMessage,
      isActive: rule.isActive,
    });
    setIsEditing(true);
  };

  const handleAddNew = () => {
    setSelectedRuleId(null);
    setFormData({
      id: "",
      name: "New High-Power Restriction Rule",
      description: "Prevent excessive load without adequate cooling",
      ruleType: "POWER_CAPACITY",
      machineId: machines[0]?.id || "",
      triggerPartNumber: "MTR-010",
      targetPartNumbers: "CTL-002",
      errorMessage: "10HP motor power exceeds standard control panel capacity.",
      isActive: true,
    });
    setIsEditing(true);
  };

  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const partsArr = formData.targetPartNumbers
        .split(",")
        .map((p) => p.trim().toUpperCase())
        .filter(Boolean);

      const payload = {
        id: selectedRuleId,
        name: formData.name,
        description: formData.description,
        ruleType: formData.ruleType,
        machineId: formData.machineId || null,
        triggerJson: JSON.stringify({ partNumber: formData.triggerPartNumber.toUpperCase() }),
        targetJson: JSON.stringify({ requiredPartNumbers: partsArr }),
        errorMessage: formData.errorMessage,
        isActive: formData.isActive,
      };

      const url = "/api/compatibility-rules";
      const method = selectedRuleId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setStatusMessage("Rule successfully saved to database!");
        loadData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 select-none">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <GitBranch className="w-6 h-6 text-amber-400" />
            <span>Visual Compatibility Rules Engine</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Data-driven rule builder governing machine component requirements, electrical limits, and dimensions without code modifications.
          </p>
        </div>

        <button
          onClick={handleAddNew}
          className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 shadow transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Compatibility Rule</span>
        </button>
      </div>

      {statusMessage && (
        <div className="p-3 rounded-xl bg-emerald-950 border border-emerald-500 text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{statusMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Rules Table / List (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-[#0d1424] p-5">
          <h2 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-3">
            Active Engineering Rules ({rules.length})
          </h2>

          <div className="space-y-3">
            {rules.map((rule) => {
              const isSelected = selectedRuleId === rule.id;
              return (
                <div
                  key={rule.id}
                  onClick={() => handleSelectRule(rule)}
                  className={`p-4 rounded-xl border cursor-pointer transition text-xs ${
                    isSelected
                      ? "bg-cyan-950/70 border-cyan-500 shadow-md shadow-cyan-500/10"
                      : "bg-slate-900/60 border-slate-800 hover:bg-slate-800/80"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-bold text-white text-sm">{rule.name}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-cyan-300 font-bold border border-slate-700">
                      {rule.ruleType}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed mb-2">
                    {rule.description || "No description"}
                  </p>

                  <div className="p-2 rounded bg-slate-950/80 border border-slate-800 text-[11px] font-mono text-red-300">
                    Restriction Message: "{rule.errorMessage}"
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Visual Rule Builder Panel (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-800 bg-[#0d1424] p-5">
          <h2 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <Sliders className="w-4 h-4" />
            <span>Rule Logic Builder (WHEN → THEN)</span>
          </h2>

          <form onSubmit={handleSaveRule} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Rule Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Rule Classification
              </label>
              <select
                value={formData.ruleType}
                onChange={(e) => setFormData({ ...formData, ruleType: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="DIMENSION_CONSTRAINT">DIMENSION_CONSTRAINT (Length/Size)</option>
                <option value="POWER_CAPACITY">POWER_CAPACITY (Electrical/VFD)</option>
                <option value="REQUIRES">REQUIRES (Mandatory Safety / Accessory)</option>
                <option value="FORBIDS">FORBIDS (Mutually Exclusive)</option>
                <option value="ENVIRONMENT">ENVIRONMENT (Hazardous/Washdown)</option>
              </select>
            </div>

            {/* Visual Logic Condition Cards */}
            <div className="p-3 rounded-xl bg-slate-950 border border-cyan-800/40 space-y-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest block mb-1">
                  1. TRIGGER CONDITION (IF / WHEN)
                </span>
                <div className="text-xs text-slate-300 flex items-center gap-2">
                  <span className="text-slate-400">If Component ==</span>
                  <input
                    type="text"
                    required
                    placeholder="MTR-010"
                    value={formData.triggerPartNumber}
                    onChange={(e) => setFormData({ ...formData, triggerPartNumber: e.target.value })}
                    className="flex-1 px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-cyan-300 font-mono font-bold text-xs"
                  />
                </div>
              </div>

              <div className="border-t border-slate-800/80 pt-3">
                <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest block mb-1">
                  2. REQUIRED TARGET ENFORCEMENT (THEN)
                </span>
                <div className="text-xs text-slate-300 space-y-1">
                  <span className="text-slate-400 block">Must also equip one of (comma separated):</span>
                  <input
                    type="text"
                    required
                    placeholder="CVY-004, CVY-006"
                    value={formData.targetPartNumbers}
                    onChange={(e) => setFormData({ ...formData, targetPartNumbers: e.target.value })}
                    className="w-full px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-emerald-300 font-mono font-bold text-xs"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                User Rejection Message (Displayed in 3D UI) *
              </label>
              <textarea
                rows={2}
                required
                value={formData.errorMessage}
                onChange={(e) => setFormData({ ...formData, errorMessage: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-red-300 focus:outline-none focus:border-red-500 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/30 transition disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? "Saving Rule..." : "Save Rule to Database"}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
