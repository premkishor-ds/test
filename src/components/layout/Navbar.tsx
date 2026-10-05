"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Boxes,
  Cpu,
  Layers,
  FileSpreadsheet,
  Settings,
  Sparkles,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";

export const Navbar: React.FC = () => {
  const pathname = usePathname();

  // Hide global navbar inside full-screen 3D configurator workspace
  if (pathname.startsWith("/configurator/")) {
    return null;
  }

  const navLinks = [
    { href: "/machines", label: "Machines", icon: Boxes },
    { href: "/configurator/mx-500", label: "3D Configurator", icon: Cpu, highlight: true },
    { href: "/configurations", label: "Saved Assemblies", icon: Layers },
    { href: "/quote", label: "Request Quote", icon: FileSpreadsheet },
    { href: "/admin", label: "Admin Portal", icon: Settings },
  ];

  return (
    <header className="h-16 border-b border-slate-800/80 bg-[#090e1a]/90 backdrop-blur sticky top-0 z-40 px-4 sm:px-8 select-none">
      <div className="max-w-7xl mx-auto h-full flex items-center justify-between">
        {/* Logo / Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-700 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-cyan-500/25 group-hover:scale-105 transition">
            <span className="text-lg">V</span>
          </div>
          <div className="flex flex-col">
            <span className="text-base font-black text-white tracking-wider flex items-center gap-1.5">
              VORTEX <span className="text-cyan-400 font-mono text-xs font-semibold px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-800">3D</span>
            </span>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">
              Industrial Automation CAD
            </span>
          </div>
        </Link>

        {/* Navigation Items */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
                  isActive
                    ? "bg-slate-800 text-cyan-300 border border-slate-700 shadow"
                    : link.highlight
                    ? "text-cyan-400 hover:text-cyan-300 hover:bg-cyan-950/30"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Action Button */}
        <div className="flex items-center gap-3">
          <Link
            href="/configurator/mx-500"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 flex items-center gap-1.5 transition hover:scale-105 active:scale-95"
          >
            <span>Launch Studio</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
};
