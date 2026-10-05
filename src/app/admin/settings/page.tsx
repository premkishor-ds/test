"use client";

import React, { useState } from "react";
import { Settings, Save, CheckCircle2, Shield, Database, Cloud } from "lucide-react";

export default function AdminSettingsPage() {
  const [currency, setCurrency] = useState("INR");
  const [taxRate, setTaxRate] = useState(18);
  const [s3Bucket, setS3Bucket] = useState("industrial-cad-models-apac");
  const [s3Region, setS3Region] = useState("ap-south-1");
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 select-none">
      <div className="pb-6 border-b border-slate-800">
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-slate-400" />
          <span>System Settings & CAD Infrastructure</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure financial engines, currency defaults, and cloud object storage endpoints.
        </p>
      </div>

      {saved && (
        <div className="p-3 rounded-xl bg-emerald-950 border border-emerald-500 text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>System settings updated successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Financial Engine */}
        <div className="rounded-2xl border border-slate-800 bg-[#0d1424] p-5 space-y-4">
          <h2 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
            <Database className="w-4 h-4" />
            <span>Pricing & Tax Governance</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Default Baseline Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="INR">INR (₹ Indian Rupee)</option>
                <option value="USD">USD ($ US Dollar)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Applicable GST / VAT Tax Rate (%)
              </label>
              <input
                type="number"
                value={taxRate}
                onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* 3D CAD Storage Integration */}
        <div className="rounded-2xl border border-slate-800 bg-[#0d1424] p-5 space-y-4">
          <h2 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
            <Cloud className="w-4 h-4" />
            <span>S3 Object Storage (CAD GLB Assets)</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                S3 Bucket Name
              </label>
              <input
                type="text"
                value={s3Bucket}
                onChange={(e) => setS3Bucket(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Storage Region
              </label>
              <input
                type="text"
                value={s3Region}
                onChange={(e) => setS3Region(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-600/30 transition"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Save System Settings</span>
        </button>
      </form>
    </div>
  );
}
