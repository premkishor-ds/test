"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Plus, Loader2, Cpu } from "lucide-react";

export default function NewComponentPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    partNumber: "",
    sku: "",
    name: "",
    description: "",
    categoryId: "",
    manufacturer: "Industrial MechCorp",
    price: 35000,
    currency: "INR",
    weight: 25,
    dimensions: "350 x 220 x 240 mm",
    powerRating: 2.2,
    voltage: "415V",
    modelGlbUrl: "",
    technicalSpecsJson: JSON.stringify({
      "Operating Speed": "1450 RPM",
      "Enclosure": "IP65",
      "Duty Cycle": "Continuous S1",
    }, null, 2),
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/components")
      .then((res) => res.json())
      .then((data) => {
        if (data.categories && data.categories.length > 0) {
          setCategories(data.categories);
          setFormData((prev) => ({ ...prev, categoryId: data.categories[0].id }));
        }
      })
      .catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/components", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        router.push("/admin/components");
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
        href="/admin/components"
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition font-mono"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Back to Component Library</span>
      </Link>

      <div className="flex items-center justify-between pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Create Component</h1>
          <p className="text-xs text-slate-400 mt-1">
            Add a new modular industrial component with part number, SKU, and specifications.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-800 bg-[#0d1424] p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Part Number (Unique Identifier) *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. MTR-015"
              value={formData.partNumber}
              onChange={(e) => {
                const val = e.target.value.toUpperCase();
                setFormData({
                  ...formData,
                  partNumber: val,
                  sku: `SKU-${val}`,
                });
              }}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-cyan-300 font-mono font-bold focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              SKU Code *
            </label>
            <input
              type="text"
              required
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Component Display Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 15HP Ultra-Torque Industrial Induction Motor"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Category *
            </label>
            <select
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Manufacturer / Brand
            </label>
            <input
              type="text"
              value={formData.manufacturer}
              onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Unit Price (INR) *
            </label>
            <input
              type="number"
              required
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Mass / Weight (kg) *
            </label>
            <input
              type="number"
              step="0.1"
              required
              value={formData.weight}
              onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) || 0 })}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Dimensions *
            </label>
            <input
              type="text"
              required
              value={formData.dimensions}
              onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Power Rating (kW)
            </label>
            <input
              type="number"
              step="0.1"
              value={formData.powerRating}
              onChange={(e) => setFormData({ ...formData, powerRating: parseFloat(e.target.value) || 0 })}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Description
          </label>
          <textarea
            rows={2}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500 resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Technical Specifications JSON
          </label>
          <textarea
            rows={4}
            value={formData.technicalSpecsJson}
            onChange={(e) => setFormData({ ...formData, technicalSpecsJson: e.target.value })}
            className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-cyan-300 font-mono focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <Link
            href="/admin/components"
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
                <span>Saving Component...</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Publish Component</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
