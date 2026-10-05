import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/configurator/pricing-bom-engine";
import {
  Layers,
  Wrench,
  Calendar,
  Weight,
  Zap,
  ArrowRight,
  Share2,
  Trash2,
  Boxes,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ConfigurationsPage() {
  const configurations = await prisma.configuration.findMany({
    include: {
      machine: true,
      components: {
        include: {
          component: { include: { category: true } },
          mountingPoint: true,
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="flex-1 bg-[#070b14] py-12 px-4 sm:px-8 select-none">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono mb-1 font-bold">
              <Layers className="w-4 h-4" />
              <span>SAVED 3D CONFIGURATIONS</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              Customer Assembly Archive
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
              Inspect and reload previously customized machines with their complete component hierarchies, mounting coordinates, and live BOM snapshots.
            </p>
          </div>

          <Link
            href="/configurator/mx-500"
            className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/30 flex items-center gap-2 transition self-start sm:self-auto"
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>New 3D Assembly</span>
          </Link>
        </div>

        {configurations.length === 0 ? (
          <div className="py-20 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-950/40 p-8">
            <Layers className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white mb-1">No Saved Configurations Yet</h3>
            <p className="text-xs text-slate-400 mb-6">
              Launch the 3D Configurator, customize your machine, and click "Save Configuration" to store your build.
            </p>
            <Link
              href="/configurator/mx-500"
              className="px-5 py-2.5 rounded-xl bg-cyan-600 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow"
            >
              Configure MX-500
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {configurations.map((cfg) => (
              <div
                key={cfg.id}
                className="rounded-2xl border border-slate-800 bg-[#0d1424] p-6 flex flex-col justify-between hover:border-cyan-500/40 transition duration-200 group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                      {cfg.machine.modelNumber}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(cfg.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition mb-1">
                    {cfg.name}
                  </h3>
                  <div className="text-xs text-slate-400 mb-4">{cfg.machine.name}</div>

                  {/* Components summary chips */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {cfg.components.map((c) => (
                      <span
                        key={c.id}
                        className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900 border border-slate-800 text-slate-300"
                        title={c.component.name}
                      >
                        {c.component.partNumber}
                      </span>
                    ))}
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-3 gap-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 text-xs font-mono text-slate-400 mb-4">
                    <div>
                      Mass: <span className="text-white block">{cfg.totalWeight} kg</span>
                    </div>
                    <div>
                      Power: <span className="text-white block">{cfg.totalPower} kW</span>
                    </div>
                    <div>
                      Components: <span className="text-cyan-400 block">{cfg.components.length} Installed</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                      Quoted Total Price
                    </span>
                    <span className="text-base font-mono font-bold text-emerald-400">
                      {formatCurrency(cfg.totalPrice, cfg.currency)}
                    </span>
                  </div>

                  <Link
                    href={`/configurations/${cfg.id}`}
                    className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow flex items-center gap-1.5 transition"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Open in 3D</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
