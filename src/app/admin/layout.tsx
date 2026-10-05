"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Boxes,
  Cpu,
  Compass,
  GitBranch,
  Layers,
  FileSpreadsheet,
  Users,
  Settings,
  ArrowUpRight,
  Shield,
  ChevronRight,
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const adminNav = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/machines", label: "Machines", icon: Boxes },
    { href: "/admin/components", label: "Components", icon: Cpu },
    { href: "/admin/mounting-points", label: "3D Mounting Points", icon: Compass, badge: "3D CAD" },
    { href: "/admin/compatibility-rules", label: "Rules Builder", icon: GitBranch, badge: "Engine" },
    { href: "/admin/configurations", label: "Saved Builds", icon: Layers },
    { href: "/admin/quotes", label: "Quotes / RFQs", icon: FileSpreadsheet },
    { href: "/admin/users", label: "User Roles", icon: Users },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="flex h-[calc(100vh-64px)] w-full overflow-hidden bg-[#070b14] text-slate-100 font-sans select-none">
      {/* Admin Sidebar */}
      <aside className="w-64 border-r border-slate-800 bg-[#0a0f1d] flex flex-col justify-between shrink-0">
        <div>
          {/* Admin Header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white tracking-wide">ADMIN CONSOLE</div>
                <div className="text-[10px] text-slate-400 font-mono">Zero-Code Governance</div>
              </div>
            </div>
          </div>

          {/* Nav List */}
          <nav className="p-3 space-y-1">
            {adminNav.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? "bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 shadow-sm"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-slate-400 group-hover:text-white" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-slate-800 text-cyan-400 border border-slate-700">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Link to Customer Studio */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/40">
          <Link
            href="/configurator/mx-500"
            className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-xs font-semibold text-slate-300 hover:text-white transition group"
          >
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>Launch 3D Studio</span>
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition" />
          </Link>
        </div>
      </aside>

      {/* Admin Content Area */}
      <main className="flex-1 overflow-y-auto bg-[#070b14] p-6 sm:p-8">
        {children}
      </main>
    </div>
  );
}
