import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/configurator/pricing-bom-engine";
import { Cpu, Plus, Search, Filter } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminComponentsPage() {
  const components = await prisma.component.findMany({
    include: { category: true },
    orderBy: { partNumber: "asc" },
  });

  const categories = await prisma.componentCategory.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 select-none">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Component Catalog Library</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage industrial modular components, part numbers, technical specifications, and prices.
          </p>
        </div>

        <Link
          href="/admin/components/new"
          className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 shadow transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Component Item</span>
        </Link>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-[#0d1424] overflow-hidden">
        <table className="w-full text-left text-xs font-sans">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 text-[11px] font-mono uppercase bg-slate-900/60">
              <th className="py-3 px-4">Part #</th>
              <th className="py-3 px-4">Component Name</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Manufacturer</th>
              <th className="py-3 px-4 text-right">Mass (kg)</th>
              <th className="py-3 px-4 text-right">Power</th>
              <th className="py-3 px-4 text-right">Unit Price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
            {components.map((c) => (
              <tr key={c.id} className="hover:bg-slate-800/30 transition">
                <td className="py-3 px-4 font-bold text-cyan-400">{c.partNumber}</td>
                <td className="py-3 px-4 font-sans font-semibold text-white">{c.name}</td>
                <td className="py-3 px-4 font-sans text-slate-400">{c.category.name}</td>
                <td className="py-3 px-4 font-sans text-slate-400">{c.manufacturer}</td>
                <td className="py-3 px-4 text-right">{c.weight} kg</td>
                <td className="py-3 px-4 text-right text-amber-300">
                  {c.powerRating ? `${c.powerRating} kW` : "-"}
                </td>
                <td className="py-3 px-4 text-right font-bold text-emerald-400">
                  {formatCurrency(c.price, c.currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
