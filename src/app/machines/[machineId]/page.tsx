import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/configurator/pricing-bom-engine";
import {
  Boxes,
  Cpu,
  ChevronLeft,
  Wrench,
  Compass,
  Zap,
  Weight,
  Layers,
  ShieldCheck,
  CheckCircle,
} from "lucide-react";

interface PageProps {
  params: Promise<{ machineId: string }>;
}

export const dynamic = "force-dynamic";

export default async function MachineDetailPage({ params }: PageProps) {
  const { machineId } = await params;

  const machine = await prisma.machine.findFirst({
    where: {
      OR: [{ slug: machineId }, { id: machineId }],
    },
    include: {
      mountingPoints: true,
      compatibilityRules: true,
      versions: true,
    },
  });

  if (!machine) {
    notFound();
  }

  return (
    <div className="flex-1 bg-[#070b14] py-12 px-4 sm:px-8 select-none">
      <div className="max-w-5xl mx-auto">
        {/* Back Link */}
        <Link
          href="/machines"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition mb-6 font-mono"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Machine Catalog</span>
        </Link>

        {/* Machine Header */}
        <div className="rounded-2xl border border-slate-800 bg-[#0d1424] p-6 sm:p-8 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                {machine.modelNumber}
              </span>
              <span className="text-xs text-slate-400">{machine.category}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">{machine.name}</h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
              {machine.description}
            </p>
          </div>

          <div className="flex flex-col items-start sm:items-end gap-3 shrink-0">
            <div className="text-left sm:text-right">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                Base Frame Price
              </span>
              <span className="text-2xl font-mono font-bold text-emerald-400">
                {formatCurrency(machine.basePrice, machine.currency)}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <Link
                href={`/configurator/${machine.slug}?scratch=true`}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition active:scale-95"
                title="Start with an empty chassis frame and select all components manually"
              >
                <Boxes className="w-3.5 h-3.5 text-cyan-400" />
                <span>Configure from Scratch</span>
              </Link>

              <Link
                href={`/configurator/${machine.slug}`}
                className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/30 flex items-center justify-center gap-2 transition hover:scale-105 active:scale-95"
                title="Launch with recommended baseline assembly"
              >
                <Wrench className="w-4 h-4" />
                <span>Launch Recommended</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Technical Blueprint Specifications */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono mb-2 font-bold">
              <Layers className="w-4 h-4" />
              <span>ENVELOPE DIMENSIONS</span>
            </div>
            <div className="text-xl font-bold font-mono text-white mb-1">
              {machine.baseDimensions}
            </div>
            <p className="text-[11px] text-slate-400">
              Standard chassis bounding box. Dynamic expansion available via modular conveyor decks.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-mono mb-2 font-bold">
              <Weight className="w-4 h-4" />
              <span>CHASSIS MASS</span>
            </div>
            <div className="text-xl font-bold font-mono text-white mb-1">
              {machine.baseWeight} kg
            </div>
            <p className="text-[11px] text-slate-400">
              Structural extruded aluminum and powder-coated steel frame without components.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono mb-2 font-bold">
              <Zap className="w-4 h-4" />
              <span>ELECTRICAL SUPPLY</span>
            </div>
            <div className="text-xl font-bold font-mono text-white mb-1">
              {machine.powerRequirements}
            </div>
            <p className="text-[11px] text-slate-400">
              Factory standard 3-phase connection with internal DIN rail bus distribution.
            </p>
          </div>
        </div>

        {/* Mounting Points Specification Table */}
        <div className="rounded-2xl border border-slate-800 bg-[#0d1424] overflow-hidden p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold">
              <Compass className="w-4 h-4" />
              <span>PRE-ENGINEERED 3D MOUNTING LOCATIONS ({machine.mountingPoints.length})</span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">CAD SNAP COORDINATES</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[11px] font-mono uppercase">
                  <th className="py-2.5 px-3">Location ID</th>
                  <th className="py-2.5 px-3">Description</th>
                  <th className="py-2.5 px-3">Coordinate (X, Y, Z)</th>
                  <th className="py-2.5 px-3">Allowed Categories</th>
                  <th className="py-2.5 px-3">Default Part</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
                {machine.mountingPoints.map((mp) => {
                  let categories: string[] = [];
                  try {
                    categories = JSON.parse(mp.allowedCategorySlugsJson || "[]");
                  } catch {}

                  return (
                    <tr key={mp.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-2.5 px-3 font-bold text-cyan-300">{mp.pointId}</td>
                      <td className="py-2.5 px-3 font-sans text-white">{mp.name}</td>
                      <td className="py-2.5 px-3 text-slate-400">
                        [{mp.posX.toFixed(2)}, {mp.posY.toFixed(2)}, {mp.posZ.toFixed(2)}]m
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex gap-1 flex-wrap font-sans">
                          {categories.map((c) => (
                            <span
                              key={c}
                              className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300"
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-emerald-400 font-bold">
                        {mp.defaultPartNumber || "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Compatibility Rules Engine Specification */}
        <div className="rounded-2xl border border-slate-800 bg-[#0d1424] overflow-hidden p-6">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-bold mb-4">
            <ShieldCheck className="w-4 h-4" />
            <span>MACHINE COMPATIBILITY & SAFETY GOVERNANCE RULES</span>
          </div>

          <div className="space-y-3">
            {machine.compatibilityRules.map((rule) => (
              <div
                key={rule.id}
                className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-start gap-3 text-xs"
              >
                <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white mb-0.5">{rule.name}</div>
                  <p className="text-[11px] text-slate-400 leading-relaxed mb-1">
                    {rule.description}
                  </p>
                  <div className="text-[10px] font-mono text-red-300/80 bg-red-950/30 px-2 py-0.5 rounded border border-red-900/40 inline-block">
                    Constraint: {rule.errorMessage}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
