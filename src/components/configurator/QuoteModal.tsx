"use client";

import React, { useState } from "react";
import { useConfiguratorStore } from "@/lib/configurator/configurator-store";
import { formatCurrency } from "@/lib/configurator/pricing-bom-engine";
import { generateBOMAndQuotePDF } from "@/lib/pdf/pdf-generator";
import confetti from "canvas-confetti";
import {
  X,
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
} from "lucide-react";

interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuoteModal: React.FC<QuoteModalProps> = ({ isOpen, onClose }) => {
  const machine = useConfiguratorStore((s) => s.machine);
  const configurationName = useConfiguratorStore((s) => s.configurationName);
  const pricing = useConfiguratorStore((s) => s.pricingSummary);
  const currency = useConfiguratorStore((s) => s.currency);

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

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!machine) return;
    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        machineId: machine.id,
        configurationName,
        totalQuotedPrice: pricing.grandTotal,
        currency,
        pricingSnapshot: pricing,
      };

      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success && data.quote) {
        setSubmittedQuote(data.quote);
        // Trigger celebratory confetti
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#06b6d4", "#10b981", "#3b82f6", "#f59e0b"],
        });
      }
    } catch (err) {
      console.error("Quote submission failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!machine || !submittedQuote) return;
    const doc = generateBOMAndQuotePDF({
      quoteNumber: submittedQuote.quoteNumber,
      customerName: formData.customerName,
      companyName: formData.companyName,
      email: formData.email,
      phone: formData.phone,
      country: formData.country,
      message: formData.message,
      machine,
      pricing,
    });
    doc.save(`Quotation_${submittedQuote.quoteNumber}.pdf`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none">
      <div className="w-full max-w-lg rounded-2xl bg-[#0d1424] border border-cyan-500/30 p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-4">
          <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-800 text-cyan-400">
            <Send className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Request for Quotation (RFQ)</h3>
            <p className="text-xs text-slate-400">
              Submit your verified 3D machine configuration to our application engineering team.
            </p>
          </div>
        </div>

        {!submittedQuote ? (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Price & Machine Summary Banner */}
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400 block">{machine?.name}</span>
                <span className="font-mono text-slate-300 font-semibold">{configurationName}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                  Total Quoted Price
                </span>
                <span className="text-base font-mono font-bold text-emerald-400">
                  {formatCurrency(pricing.grandTotal, currency)}
                </span>
              </div>
            </div>

            {/* Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-cyan-400" />
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rajesh Sharma"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
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
                  placeholder="e.g. Apex Precision Pvt Ltd"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
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
                  placeholder="name@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
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
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                Delivery Country / State *
              </label>
              <input
                type="text"
                required
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Project Scope / Integration Notes (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="Specify delivery timeline, quantity requirement (e.g. 2 units), or on-site commissioning requests..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition resize-none"
              />
            </div>

            <div className="p-2.5 rounded-lg bg-cyan-950/20 border border-cyan-800/40 flex items-center gap-2 text-[11px] text-cyan-300">
              <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Prices verified against live component catalog. Valid for 30 calendar days.</span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-cyan-600/30 transition disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting RFQ...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Request for Quote</span>
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
              <h4 className="text-base font-bold text-white mb-1">Quotation Request Submitted!</h4>
              <p className="text-xs text-emerald-300">
                Your RFQ has been received and routed to our Senior Application Engineer.
              </p>
              <div className="mt-3 inline-block px-3 py-1 rounded bg-slate-900 border border-slate-700 font-mono text-xs font-bold text-cyan-300">
                Ref: {submittedQuote.quoteNumber}
              </div>
            </div>

            <p className="text-xs text-slate-400 text-center">
              We have attached a complete Bill of Materials (BOM) snapshot, 3D mounting specification, and commercial quotation PDF below.
            </p>

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={handleDownloadPDF}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-600/20"
              >
                <FileDown className="w-4 h-4" />
                <span>Download Official Quotation PDF ({submittedQuote.quoteNumber})</span>
              </button>

              <button
                onClick={onClose}
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition"
              >
                Return to Configurator
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
