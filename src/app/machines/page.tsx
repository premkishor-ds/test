import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/configurator/pricing-bom-engine";
import { Boxes, Cpu, ChevronRight, Layers, Weight, Zap, Wrench } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function MachinesPage() {
  const machines = await prisma.machine.findMany({
    where: { isActive: true },
    include: {
      mountingPoints: true,
      versions: true,
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="flex-1 bg-[#070b14] py-12 px-4 sm:px-8 select-none">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono mb-1 font-bold">
              <Boxes className="w-4 h-4" />
              <span>INDUSTRIAL MACHINERY CATALOG</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              Select Machine Platform
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
              Choose an industrial base chassis to launch the interactive 3D configurator with modular mounting points and real-time CAD snapping.
            </p>
          </div>
        </div>

        {/* Machine Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {machines.map((machine) => (
            <div
              key={machine.id}
              className="rounded-2xl border border-slate-800 bg-[#0d1424] overflow-hidden flex flex-col justify-between hover:border-cyan-500/40 hover:shadow-2xl transition duration-300 group"
            >
              {/* Card Header & Category */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                    {machine.modelNumber}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-xs text-slate-300">
                    {machine.category}
                  </span>
                </div>

                <h2 className="text-xl font-bold text-white group-hover:text-cyan-300 transition mb-2">
                  <Link href={`/machines/${machine.slug}`}>{machine.name}</Link>
                </h2>

                <p className="text-xs text-slate-400 leading-relaxed mb-6">
                  {machine.description}
                </p>

                {/* Key Technical Specifications */}
                <div className="grid grid-cols-3 gap-2 bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-xs font-mono mb-4">
                  <div>
                    <span className="text-slate-500 block text-[10px]">ENVELOPE</span>
                    <span className="text-slate-200 font-semibold">{machine.baseDimensions.split(" ")[0]}mm</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">CHASSIS MASS</span>
                    <span className="text-slate-200 font-semibold">{machine.baseWeight} kg</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">MOUNT ZONES</span>
                    <span className="text-cyan-400 font-semibold">{machine.mountingPoints.length} Points</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 font-mono">
                  Supply: <span className="text-slate-300">{machine.powerRequirements}</span>
                </div>
              </div>

              {/* Card Footer & Action */}
              <div className="p-6 pt-4 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                    Base Frame Starting at
                  </span>
                  <span className="text-lg font-mono font-bold text-white">
                    {formatCurrency(machine.basePrice, machine.currency)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/machines/${machine.slug}`}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
                  >
                    Details
                  </Link>

                  <Link
                    href={`/configurator/${machine.slug}`}
                    className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/30 flex items-center gap-1.5 transition hover:scale-105 active:scale-95"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Configure in 3D</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
