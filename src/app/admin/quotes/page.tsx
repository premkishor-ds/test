"use client";

import React, { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/configurator/pricing-bom-engine";
import { generateBOMAndQuotePDF } from "@/lib/pdf/pdf-generator";
import { FileSpreadsheet, FileDown, CheckCircle, Clock, XCircle, User, Mail, Phone, Globe } from "lucide-react";

export default function AdminQuotesPage() {
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQuotes = () => {
    fetch("/api/quotes")
      .then((r) => r.json())
      .then((d) => {
        if (d.quotes) setQuotes(d.quotes);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchQuotes();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    await fetch("/api/quotes", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: newStatus }),
    });
    fetchQuotes();
  };

  const handleDownloadPDF = (q: any) => {
    const doc = generateBOMAndQuotePDF({
      quoteNumber: q.quoteNumber,
      customerName: q.customerName,
      companyName: q.companyName,
      email: q.email,
      phone: q.phone,
      country: q.country,
      message: q.message,
      machine: q.machine,
      pricing: {
        currency: q.currency,
        baseMachinePrice: q.machine?.basePrice || 0,
        componentsSubtotal: q.totalQuotedPrice - (q.machine?.basePrice || 0),
        installationAndCalibrationCost: Math.round(q.totalQuotedPrice * 0.04),
        subtotal: q.totalQuotedPrice,
        taxAmount: Math.round(q.totalQuotedPrice * 0.18),
        grandTotal: Math.round(q.totalQuotedPrice * 1.18),
        totalWeightKg: q.machine?.baseWeight || 250,
        totalPowerKW: 5.5,
        dimensionsSummary: q.machine?.baseDimensions || "3200 x 850 x 950 mm",
        componentCount: 6,
        bomItems: [],
      },
    });
    doc.save(`Quotation_${q.quoteNumber}.pdf`);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 select-none">
      <div className="flex items-center justify-between pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-purple-400" />
            <span>Customer RFQ & Quotation Inquiries</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Review submitted 3D machine configurations, update statuses, and generate official customer proposals.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-[#0d1424] overflow-hidden">
        <table className="w-full text-left text-xs font-sans">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 text-[11px] font-mono uppercase bg-slate-900/60">
              <th className="py-3 px-4">Quote Ref</th>
              <th className="py-3 px-4">Customer & Company</th>
              <th className="py-3 px-4">Machine Platform</th>
              <th className="py-3 px-4 text-right">Quoted Amount</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
            {quotes.map((q) => (
              <tr key={q.id} className="hover:bg-slate-800/30 transition">
                <td className="py-3.5 px-4 font-bold text-cyan-400">{q.quoteNumber}</td>
                <td className="py-3.5 px-4 font-sans">
                  <div className="font-bold text-white">{q.customerName}</div>
                  <div className="text-[11px] text-slate-400">
                    {q.companyName} • {q.email}
                  </div>
                </td>
                <td className="py-3.5 px-4 font-sans text-slate-200">
                  {q.machine?.name || "Machine"}
                </td>
                <td className="py-3.5 px-4 text-right font-bold text-emerald-400">
                  {formatCurrency(q.totalQuotedPrice, q.currency)}
                </td>
                <td className="py-3.5 px-4 text-center">
                  <select
                    value={q.status}
                    onChange={(e) => handleUpdateStatus(q.id, e.target.value)}
                    className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-[10px] font-mono font-bold text-slate-200 focus:outline-none"
                  >
                    <option value="SUBMITTED">SUBMITTED</option>
                    <option value="IN_REVIEW">IN_REVIEW</option>
                    <option value="APPROVED">APPROVED</option>
                    <option value="REJECTED">REJECTED</option>
                  </select>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <button
                    onClick={() => handleDownloadPDF(q)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold inline-flex items-center gap-1.5 transition border border-slate-700 font-sans"
                  >
                    <FileDown className="w-3.5 h-3.5 text-cyan-400" />
                    <span>PDF</span>
                  </button>
                </td>
              </tr>
            ))}

            {quotes.length === 0 && !loading && (
              <tr>
                <td colSpan={6} className="py-12 text-center text-xs text-slate-500 font-sans">
                  No RFQs submitted yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
