"use client";

import React, { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/configurator/pricing-bom-engine";
import { generateBOMAndQuotePDF } from "@/lib/pdf/pdf-generator";
import confetti from "canvas-confetti";
import {
  FileSpreadsheet,
  Send,
  CheckCircle2,
  FileDown,
  Building2,
  User,
  Mail,
  Phone,
  Globe,
  Loader2,
  ShieldCheck,
  Cpu,
} from "lucide-react";

export default function QuotePage() {
  const [machines, setMachines] = useState<any[]>([]);
  const [selectedMachineId, setSelectedMachineId] = useState("");
  const [formData, setFormData] = useState({
    customerName: "",
    companyName: "",
    email: "",
    phone: "",
    country: "India",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedQuote, setSubmittedQuote] = useState<any | null>(null);

  useEffect(() => {
    fetch("/api/machines")
      .then((res) => res.json())
      .then((data) => {
        if (data.machines && data.machines.length > 0) {
          setMachines(data.machines);
          setSelectedMachineId(data.machines[0].id);
        }
      })
      .catch(console.error);
  }, []);

  const selectedMachine = machines.find((m) => m.id === selectedMachineId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMachine) return;
    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        machineId: selectedMachine.id,
        totalQuotedPrice: selectedMachine.basePrice,
        currency: selectedMachine.currency,
      };

      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success && data.quote) {
        setSubmittedQuote(data.quote);
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#06b6d4", "#10b981", "#3b82f6", "#f59e0b"],
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!selectedMachine || !submittedQuote) return;
    const doc = generateBOMAndQuotePDF({
      quoteNumber: submittedQuote.quoteNumber,
      customerName: formData.customerName,
      companyName: formData.companyName,
      email: formData.email,
      phone: formData.phone,
      country: formData.country,
      message: formData.message,
      machine: selectedMachine,
      pricing: {
        currency: selectedMachine.currency,
        baseMachinePrice: selectedMachine.basePrice,
        componentsSubtotal: 0,
        installationAndCalibrationCost: Math.round(selectedMachine.basePrice * 0.04),
        subtotal: Math.round(selectedMachine.basePrice * 1.04),
        taxAmount: Math.round(selectedMachine.basePrice * 1.04 * 0.18),
        grandTotal: Math.round(selectedMachine.basePrice * 1.04 * 1.18),
        totalWeightKg: selectedMachine.baseWeight,
        totalPowerKW: 5.5,
        dimensionsSummary: selectedMachine.baseDimensions,
        componentCount: 0,
        bomItems: [],
      },
    });
    doc.save(`Quotation_${submittedQuote.quoteNumber}.pdf`);
  };

  return (
    <div className="flex-1 bg-[#070b14] py-12 px-4 sm:px-8 select-none">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-cyan-800 text-cyan-400 text-xs font-mono mb-3">
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>DIRECT APPLICATION ENGINEERING INQUIRY</span>
          </div>
          <h1 className="text-3xl font-black text-white">Request for Quotation</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-lg mx-auto">
            Submit your machinery requirements to receive an official engineering proposal and itemized Bill of Materials.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-[#0d1424] p-6 sm:p-8 shadow-2xl">
          {!submittedQuote ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Target Machine Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                  Target Machinery Platform *
                </label>
                <select
                  value={selectedMachineId}
                  onChange={(e) => setSelectedMachineId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500 transition"
                >
                  {machines.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.modelNumber}) — Base Price: {formatCurrency(m.basePrice, m.currency)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-cyan-400" />
                    Full Contact Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rajesh Sharma"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                    Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Industries Pvt Ltd"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-cyan-400" />
                    Business Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="engineer@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-cyan-400" />
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-cyan-400" />
                  Installation Site Country / State *
                </label>
                <input
                  type="text"
                  required
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Project Scope & Specific Mounting Requirements
                </label>
                <textarea
                  rows={3}
                  placeholder="Provide estimated daily throughput, duty cycle, environment constraints, or line integration details..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500 resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Prefer interactive 3D placement?{" "}
                  <a href="/configurator/mx-500" className="text-cyan-400 underline">
                    Open 3D Studio
                  </a>
                </span>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/30 flex items-center gap-2 transition disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit RFQ</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-6 space-y-4">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <h3 className="text-xl font-bold text-white">Quotation Request Registered!</h3>
              <p className="text-xs text-slate-300 max-w-md mx-auto">
                Reference number <span className="font-mono text-cyan-400 font-bold">{submittedQuote.quoteNumber}</span> has been dispatched to application engineering.
              </p>

              <div className="pt-4 flex flex-col sm:flex-row justify-center gap-3">
                <button
                  onClick={handleDownloadPDF}
                  className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition"
                >
                  <FileDown className="w-4 h-4" />
                  <span>Download Quotation PDF</span>
                </button>

                <a
                  href="/configurator/mx-500"
                  className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition"
                >
                  <span>Launch 3D Configurator</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
