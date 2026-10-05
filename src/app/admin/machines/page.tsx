import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/configurator/pricing-bom-engine";
import { Boxes, Plus, Wrench, Edit, Trash2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminMachinesPage() {
  const machines = await prisma.machine.findMany({
    include: {
      mountingPoints: true,
      versions: true,
      compatibilityRules: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 select-none">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Machinery Platforms</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage base industrial machine assemblies, CAD models, and mounting layouts.
          </p>
        </div>

        <Link
          href="/admin/machines/new"
          className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 shadow transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Machine Platform</span>
        </Link>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-[#0d1424] overflow-hidden">
        <table className="w-full text-left text-xs font-sans">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 text-[11px] font-mono uppercase bg-slate-900/60">
              <th className="py-3 px-4">Model #</th>
              <th className="py-3 px-4">Machine Name</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4 text-center">Mount Points</th>
              <th className="py-3 px-4 text-center">Rules</th>
              <th className="py-3 px-4 text-right">Base Price</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
            {machines.map((m) => (
              <tr key={m.id} className="hover:bg-slate-800/30 transition">
                <td className="py-3 px-4 font-bold text-cyan-400">{m.modelNumber}</td>
                <td className="py-3 px-4 font-sans font-semibold text-white">{m.name}</td>
                <td className="py-3 px-4 font-sans text-slate-400">{m.category}</td>
                <td className="py-3 px-4 text-center">
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-bold">
                    {m.mountingPoints.length}
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-bold">
                    {m.compatibilityRules.length}
                  </span>
                </td>
                <td className="py-3 px-4 text-right font-bold text-white">
                  {formatCurrency(m.basePrice, m.currency)}
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-2 font-sans">
                    <Link
                      href={`/configurator/${m.slug}`}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 transition"
                    >
                      <Wrench className="w-3 h-3 text-cyan-400" />
                      <span>3D Studio</span>
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
