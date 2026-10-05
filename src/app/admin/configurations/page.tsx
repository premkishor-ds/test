import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/configurator/pricing-bom-engine";
import { Layers, Wrench, Calendar, Eye } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminConfigurationsPage() {
  const configurations = await prisma.configuration.findMany({
    include: {
      machine: true,
      components: {
        include: { component: true, mountingPoint: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 select-none">
      <div className="flex items-center justify-between pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Layers className="w-6 h-6 text-cyan-400" />
            <span>Customer 3D Configurations</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Global repository of all saved industrial machinery assemblies, snapshots, and tokens.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-[#0d1424] overflow-hidden">
        <table className="w-full text-left text-xs font-sans">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 text-[11px] font-mono uppercase bg-slate-900/60">
              <th className="py-3 px-4">Config Name</th>
              <th className="py-3 px-4">Machine</th>
              <th className="py-3 px-4 text-center">Components</th>
              <th className="py-3 px-4 text-right">Total Quoted</th>
              <th className="py-3 px-4">Share Token</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
            {configurations.map((c) => (
              <tr key={c.id} className="hover:bg-slate-800/30 transition">
                <td className="py-3 px-4 font-sans font-bold text-white">{c.name}</td>
                <td className="py-3 px-4 font-sans text-slate-300">{c.machine.name}</td>
                <td className="py-3 px-4 text-center">
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-bold">
                    {c.components.length}
                  </span>
                </td>
                <td className="py-3 px-4 text-right font-bold text-emerald-400">
                  {formatCurrency(c.totalPrice, c.currency)}
                </td>
                <td className="py-3 px-4 font-mono text-cyan-400">{c.shareToken || c.id.slice(0, 8)}</td>
                <td className="py-3 px-4 text-right font-sans">
                  <Link
                    href={`/configurations/${c.id}`}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold inline-flex items-center gap-1 transition"
                  >
                    <Wrench className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Open in 3D</span>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
