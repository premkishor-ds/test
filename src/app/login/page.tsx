"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shield, Mail, Lock, ArrowRight, User } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("buyer@globalmanufacturing.com");
  const [password, setPassword] = useState("buyer123");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.includes("admin")) {
      router.push("/admin");
    } else {
      router.push("/configurator/mx-500");
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center py-16 px-4 bg-[#070b14] select-none">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-[#0d1424] p-8 shadow-2xl">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400 mb-3 shadow-lg shadow-cyan-500/20">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Portal Authentication</h1>
          <p className="text-xs text-slate-400 mt-1">
            Access your saved 3D machinery assemblies, technical drawings, and official quotes.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-cyan-400" />
              Corporate Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-cyan-400" />
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] font-mono text-slate-400">
            <div>Customer Demo: buyer@globalmanufacturing.com / buyer123</div>
            <div className="text-cyan-400 mt-0.5">Admin Demo: admin@industrial-vortex.com / admin123</div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition mt-2"
          >
            <span>Sign In to Studio</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
          <span>Need an enterprise account? </span>
          <Link href="/register" className="text-cyan-400 hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}
