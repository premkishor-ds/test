import React from "react";
import Link from "next/link";
import {
  Boxes,
  Cpu,
  Layers,
  ShieldCheck,
  FileSpreadsheet,
  Settings,
  ChevronRight,
  Zap,
  ArrowRight,
  Compass,
  CheckCircle2,
  Sparkles,
  Weight,
  Wrench,
  Activity,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/configurator/pricing-bom-engine";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const machines = await prisma.machine.findMany({
    where: { isActive: true },
    include: {
      mountingPoints: true,
      versions: true,
    },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="flex-1 flex flex-col bg-[#070b14] overflow-hidden select-none">
      {/* HERO SECTION */}
      <section className="relative pt-16 pb-20 px-4 sm:px-8 border-b border-slate-800/80 cad-grid-pattern overflow-hidden">
        {/* Glowing radial ambient background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-cyan-500/10 blur-[130px] pointer-events-none rounded-full" />
        <div className="absolute top-1/3 left-1/3 w-[500px] h-[350px] bg-blue-600/10 blur-[150px] pointer-events-none rounded-full" />

        <div className="max-w-6xl mx-auto relative z-10 flex flex-col items-center text-center">
          {/* Top Industrial Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/40 text-cyan-300 text-xs font-mono mb-6 shadow-lg shadow-cyan-500/10">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>ENTERPRISE 3D WEB-CAD & CONFIGURATION ENGINE</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.1] max-w-4xl mb-6">
            Configure & Assemble Industrial Machines in{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-500">
              Interactive 3D
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mb-8 leading-relaxed font-sans">
            Modular component pick-and-drop, real-time mathematical snapping, multi-factor rule compatibility checking, instant Bill of Materials (BOM), and automated PDF quotations.
          </p>

          {/* Call to Actions */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-14">
            <Link
              href="/configurator/mx-500"
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm shadow-xl shadow-cyan-500/25 flex items-center gap-2 transition hover:scale-105 active:scale-95"
            >
              <Cpu className="w-4 h-4" />
              <span>Configure MX-500 in 3D</span>
              <ChevronRight className="w-4 h-4 ml-1" />
            </Link>

            <Link
              href="/machines"
              className="px-6 py-3.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-white font-semibold text-sm transition hover:border-slate-600 flex items-center gap-2"
            >
              <Boxes className="w-4 h-4 text-cyan-400" />
              <span>Browse Machine Catalog</span>
            </Link>

            <Link
              href="/admin"
              className="px-5 py-3.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 text-slate-300 hover:text-white font-semibold text-xs transition flex items-center gap-1.5"
            >
              <Settings className="w-3.5 h-3.5 text-slate-400" />
              <span>Admin Studio</span>
            </Link>
          </div>

          {/* Live System Capability Highlights */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl text-left">
            {[
              {
                label: "3D Mathematical Snapping",
                desc: "Predefined mounting vectors & rotations",
                icon: Compass,
              },
              {
                label: "Compatibility Rules Engine",
                desc: "Automatic rejection of mismatching parts",
                icon: ShieldCheck,
              },
              {
                label: "Dynamic Bill of Materials",
                desc: "Real-time pricing, weights, & dimensions",
                icon: FileSpreadsheet,
              },
              {
                label: "Exploded & Assembly View",
                desc: "Visual kinematics & step-by-step builds",
                icon: Layers,
              },
            ].map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/90 backdrop-blur"
                >
                  <Icon className="w-5 h-5 text-cyan-400 mb-2" />
                  <div className="text-xs font-bold text-white mb-0.5">{stat.label}</div>
                  <div className="text-[11px] text-slate-400 leading-tight">{stat.desc}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FEATURED MACHINES SECTION */}
      <section className="py-16 px-4 sm:px-8 border-b border-slate-800/80 bg-slate-950/40">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-mono uppercase text-cyan-400 font-bold tracking-wider">
                Industrial Model Showcase
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">
                Select a Machine to Configure
              </h2>
            </div>
            <Link
              href="/machines"
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 self-start sm:self-auto"
            >
              <span>View All Machinery</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {machines.map((mach) => (
              <div
                key={mach.id}
                className="rounded-2xl border border-slate-800 bg-[#0d1424]/90 p-6 flex flex-col justify-between hover:border-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/5 transition duration-300 group relative overflow-hidden"
              >
                {/* Subtle corner badge */}
                <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-700 text-[11px] font-mono text-cyan-300">
                  {mach.category}
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                      {mach.modelNumber}
                    </span>
                    <span className="text-xs text-slate-400">
                      {mach.mountingPoints.length} Mounting Zones
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition mb-2">
                    {mach.name}
                  </h3>

                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-3 mb-6">
                    {mach.description}
                  </p>

                  {/* Technical Specifications Spec Sheet */}
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 mb-6">
                    <div className="text-slate-400">
                      Dimensions: <span className="text-slate-200 block">{mach.baseDimensions}</span>
                    </div>
                    <div className="text-slate-400">
                      Chassis Mass: <span className="text-slate-200 block">{mach.baseWeight} kg</span>
                    </div>
                    <div className="text-slate-400 col-span-2">
                      Power: <span className="text-slate-200">{mach.powerRequirements}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                      Base Frame Price
                    </span>
                    <span className="text-lg font-mono font-bold text-white">
                      {formatCurrency(mach.basePrice, mach.currency)}
                    </span>
                  </div>

                  <Link
                    href={`/configurator/${mach.slug}`}
                    className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/30 flex items-center gap-2 transition hover:scale-105 active:scale-95"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Launch 3D Configurator</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4-STEP WORKFLOW WALKTHROUGH */}
      <section className="py-16 px-4 sm:px-8 border-b border-slate-800/80">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-mono uppercase text-cyan-400 font-bold tracking-wider">
              Engineering Workflow
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">
              How the 3D Configurator Works
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: "01",
                title: "Select Base Machine",
                desc: "Choose from standard conveyor decks or robotic assembly cells loaded in full 3D.",
              },
              {
                step: "02",
                title: "Pick & Drop Components",
                desc: "Drag motors, tracks, sensors, or safety consoles directly onto glowing holographic mounting points.",
              },
              {
                step: "03",
                title: "Automatic Snap & Validate",
                desc: "Components lerp into place with rotation alignment while the compatibility engine verifies electrical and dimension limits.",
              },
              {
                step: "04",
                title: "Download BOM & RFQ",
                desc: "Instant real-time pricing recalculation, CSV export, and official PDF quotation download.",
              },
            ].map((step, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80 flex flex-col justify-between"
              >
                <div>
                  <div className="text-3xl font-black font-mono text-cyan-500/30 mb-3">
                    {step.step}
                  </div>
                  <h3 className="text-sm font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-8 px-4 sm:px-8 bg-slate-950 text-slate-400 text-xs">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">VORTEX 3D</span>
            <span>•</span>
            <span>Production-Ready Industrial Machinery Configurator</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-mono">
            <Link href="/machines" className="hover:text-cyan-300">
              Machines
            </Link>
            <Link href="/configurator/mx-500" className="hover:text-cyan-300">
              Studio
            </Link>
            <Link href="/configurations" className="hover:text-cyan-300">
              Saved
            </Link>
            <Link href="/admin" className="hover:text-cyan-300">
              Admin
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
