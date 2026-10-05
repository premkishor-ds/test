import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/configurator/pricing-bom-engine";
import {
  Boxes,
  Cpu,
  Compass,
  GitBranch,
  FileSpreadsheet,
  Layers,
  ArrowRight,
  Plus,
  Clock,
  ShieldAlert,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [
    machineCount,
    componentCount,
    mountingPointCount,
    ruleCount,
    quoteCount,
    recentQuotes,
    recentAuditLogs,
  ] = await Promise.all([
    prisma.machine.count(),
    prisma.component.count(),
    prisma.mountingPoint.count(),
    prisma.compatibilityRule.count(),
    prisma.quote.count(),
    prisma.quote.findMany({
      take: 5,
      include: { machine: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.auditLog.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  // Calculate pipeline total
  const allQuotes = await prisma.quote.findMany({ select: { totalQuotedPrice: true } });
  const totalPipeline = allQuotes.reduce((acc, q) => acc + q.totalQuotedPrice, 0);

  return (
    <div className="max-w-6xl mx-auto space-y-8 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Admin Overview</h1>
          <p className="text-xs text-slate-400 mt-1">
            Zero-code administrative governance for industrial 3D platforms, components, and rules.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/machines/new"
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 transition border border-slate-700"
          >
            <Plus className="w-3.5 h-3.5 text-cyan-400" />
            <span>New Machine</span>
          </Link>

          <Link
            href="/admin/components/new"
            className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 transition shadow"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Component</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {[
          { label: "Machinery", val: machineCount, icon: Boxes, color: "text-blue-400" },
          { label: "Components", val: componentCount, icon: Cpu, color: "text-cyan-400" },
          { label: "Mount Points", val: mountingPointCount, icon: Compass, color: "text-emerald-400" },
          { label: "Rules Active", val: ruleCount, icon: GitBranch, color: "text-amber-400" },
          { label: "Total Quotes", val: quoteCount, icon: FileSpreadsheet, color: "text-purple-400" },
          {
            label: "Pipeline (INR)",
            val: formatCurrency(totalPipeline, "INR"),
            icon: TrendingUp,
            color: "text-emerald-400",
            isPrice: true,
          },
        ].map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-[#0d1424] border border-slate-800 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-slate-400 uppercase font-semibold font-mono">
                  {kpi.label}
                </span>
                <Icon className={`w-4 h-4 ${kpi.color}`} />
              </div>
              <div className={`font-mono font-bold text-white ${kpi.isPrice ? "text-sm truncate" : "text-2xl"}`}>
                {kpi.val}
              </div>
            </div>
          );
        })}
      </div>

      {/* 2-Column Grid: Recent Quotes & Audit Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Quotes */}
        <div className="rounded-2xl border border-slate-800 bg-[#0d1424] p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
                <h2 className="text-sm font-bold text-white">Recent RFQs & Quotes</h2>
              </div>
              <Link href="/admin/quotes" className="text-xs text-cyan-400 hover:underline">
                View All
              </Link>
            </div>

            <div className="space-y-2.5">
              {recentQuotes.map((q) => (
                <div
                  key={q.id}
                  className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-cyan-400">{q.quoteNumber}</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-white font-medium">{q.customerName}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {q.companyName} ({q.machine.name})
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-bold text-emerald-400 block">
                      {formatCurrency(q.totalQuotedPrice, q.currency)}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {q.status}
                    </span>
                  </div>
                </div>
              ))}

              {recentQuotes.length === 0 && (
                <div className="py-8 text-center text-xs text-slate-500">
                  No RFQs received yet.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Audit Logs */}
        <div className="rounded-2xl border border-slate-800 bg-[#0d1424] p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <h2 className="text-sm font-bold text-white">System Audit Trail</h2>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">Live Activity</span>
            </div>

            <div className="space-y-2">
              {recentAuditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    <span className="font-mono text-cyan-300 font-semibold">{log.action}</span>
                    <span className="text-[11px] text-slate-400 font-sans">
                      on {log.entityType}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">
                    {new Date(log.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              ))}

              {recentAuditLogs.length === 0 && (
                <div className="py-8 text-center text-xs text-slate-500">
                  No audit logs recorded yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
