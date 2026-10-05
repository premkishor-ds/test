import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/configurator/pricing-bom-engine";
import { User, Building2, Mail, Phone, Layers, FileSpreadsheet, Wrench } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const user = await prisma.user.findFirst({
    where: { role: "CUSTOMER" },
    include: {
      configurations: { include: { machine: true } },
      quotes: { include: { machine: true } },
    },
  });

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 select-none space-y-8">
      <div className="flex items-center gap-4 pb-6 border-b border-slate-800">
        <div className="w-14 h-14 rounded-2xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400 font-bold text-xl">
          {user?.name?.charAt(0) || "U"}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">{user?.name || "Client Portal"}</h1>
          <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
            <span className="flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-cyan-400" />
              {user?.company || "Apex Precision"}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-cyan-400" />
              {user?.email}
            </span>
          </div>
        </div>
      </div>

      {/* Customer Saved Builds */}
      <div className="rounded-2xl border border-slate-800 bg-[#0d1424] p-6 space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span>My Configured Machinery</span>
        </h2>

        <div className="space-y-2">
          {user?.configurations.map((c) => (
            <div
              key={c.id}
              className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
            >
              <div>
                <div className="font-bold text-white">{c.name}</div>
                <div className="text-[11px] text-slate-400">{c.machine.name}</div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-emerald-400">
                  {formatCurrency(c.totalPrice, c.currency)}
                </span>
                <Link
                  href={`/configurations/${c.id}`}
                  className="px-3 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs"
                >
                  3D View
                </Link>
              </div>
            </div>
          ))}

          {(!user?.configurations || user.configurations.length === 0) && (
            <div className="text-xs text-slate-500 py-4 text-center">
              No configurations saved yet.
            </div>
          )}
        </div>
      </div>

      {/* Customer RFQs */}
      <div className="rounded-2xl border border-slate-800 bg-[#0d1424] p-6 space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          <span>My Request for Quotes</span>
        </h2>

        <div className="space-y-2">
          {user?.quotes.map((q) => (
            <div
              key={q.id}
              className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
            >
              <div>
                <span className="font-mono font-bold text-cyan-400 block">{q.quoteNumber}</span>
                <span className="text-[11px] text-slate-400">{q.machine.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300">
                  {q.status}
                </span>
                <span className="font-mono font-bold text-emerald-400">
                  {formatCurrency(q.totalQuotedPrice, q.currency)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
