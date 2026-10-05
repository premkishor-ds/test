import React from "react";
import { prisma } from "@/lib/prisma";
import { Users, Shield, Building2, Mail, Phone, Calendar } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 select-none">
      <div className="flex items-center justify-between pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-cyan-400" />
            <span>User Access & Role-Based Control (RBAC)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage authenticated enterprise customer, engineer, and administrator accounts.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-[#0d1424] overflow-hidden">
        <table className="w-full text-left text-xs font-sans">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 text-[11px] font-mono uppercase bg-slate-900/60">
              <th className="py-3 px-4">User Name</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Company</th>
              <th className="py-3 px-4 text-center">Role</th>
              <th className="py-3 px-4 text-right">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-800/30 transition">
                <td className="py-3.5 px-4 font-sans font-bold text-white flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400 font-bold text-xs">
                    {u.name?.charAt(0) || "U"}
                  </div>
                  <span>{u.name || "Customer"}</span>
                </td>
                <td className="py-3.5 px-4 text-slate-300 font-mono">{u.email}</td>
                <td className="py-3.5 px-4 font-sans text-slate-400">{u.company || "-"}</td>
                <td className="py-3.5 px-4 text-center">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      u.role === "ADMIN"
                        ? "bg-purple-950 text-purple-300 border border-purple-800"
                        : u.role === "ENGINEER"
                        ? "bg-cyan-950 text-cyan-300 border border-cyan-800"
                        : "bg-slate-800 text-slate-300"
                    }`}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right text-slate-500 font-mono">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
