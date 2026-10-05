"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Plus, Loader2, Boxes } from "lucide-react";

export default function NewMachinePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    modelNumber: "",
    slug: "",
    category: "Conveyors",
    basePrice: 220000,
    currency: "INR",
    baseWeight: 160,
    baseDimensions: "3500 x 900 x 950 mm",
    powerRequirements: "415V 3-Phase, 50Hz, 16A",
    description: "",
    modelGlbUrl: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/machines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        router.push("/admin/machines");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 select-none">
      <Link
        href="/admin/machines"
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition font-mono"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Back to Machinery List</span>
      </Link>

      <div className="flex items-center justify-between pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Create Machine Platform</h1>
          <p className="text-xs text-slate-400 mt-1">
            Define a new base industrial machine chassis for the 3D configurator.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-800 bg-[#0d1424] p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Machine Display Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. MX-600 Heavy Packaging Line"
              value={formData.name}
              onChange={(e) => {
                const val = e.target.value;
                setFormData({
                  ...formData,
                  name: val,
                  slug: val.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
                });
              }}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Model Number / Code *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. MX-600-XHD"
              value={formData.modelNumber}
              onChange={(e) => setFormData({ ...formData, modelNumber: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              URL Slug *
            </label>
            <input
              type="text"
              required
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-300 font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Industry Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="Conveyors">Conveyors & Transport</option>
              <option value="Robotics">Robotics & Workcells</option>
              <option value="Packaging">Automated Packaging</option>
              <option value="CNC">CNC & Machining</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Base Chassis Price (INR) *
            </label>
            <input
              type="number"
              required
              value={formData.basePrice}
              onChange={(e) => setFormData({ ...formData, basePrice: parseFloat(e.target.value) || 0 })}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Chassis Weight (kg) *
            </label>
            <input
              type="number"
              required
              value={formData.baseWeight}
              onChange={(e) => setFormData({ ...formData, baseWeight: parseFloat(e.target.value) || 0 })}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Envelope Dimensions *
            </label>
            <input
              type="text"
              required
              value={formData.baseDimensions}
              onChange={(e) => setFormData({ ...formData, baseDimensions: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Power Supply Requirements *
            </label>
            <input
              type="text"
              required
              value={formData.powerRequirements}
              onChange={(e) => setFormData({ ...formData, powerRequirements: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Machine Description
          </label>
          <textarea
            rows={3}
            placeholder="Technical details, intended application line, structural materials..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500 resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Optional Custom GLB Model URL (Leave blank for procedural industrial 3D model)
          </label>
          <input
            type="text"
            placeholder="/models/my-custom-machine.glb"
            value={formData.modelGlbUrl}
            onChange={(e) => setFormData({ ...formData, modelGlbUrl: e.target.value })}
            className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <Link
            href="/admin/machines"
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-600/30 transition disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating Machine...</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Save Machine Platform</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
