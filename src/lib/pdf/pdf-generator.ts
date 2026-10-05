import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { PricingSummary, formatCurrency } from "@/lib/configurator/pricing-bom-engine";
import { Machine } from "@/types/configurator";

export interface QuotePDFData {
  quoteNumber: string;
  customerName: string;
  companyName: string;
  email: string;
  phone: string;
  country: string;
  message?: string;
  machine: Machine;
  pricing: PricingSummary;
  dateStr?: string;
}

/**
 * Generates an official industrial Bill of Materials (BOM) & Quotation PDF
 */
export function generateBOMAndQuotePDF(data: QuotePDFData): jsPDF {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const currency = data.pricing.currency || "INR";
  const dateText = data.dateStr || new Date().toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // 1. Header Banner (Industrial Charcoal & Cyan)
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 210, 36, "F");

  // Cyan Accent Line
  doc.setFillColor(6, 182, 212); // cyan-500
  doc.rect(0, 36, 210, 2, "F");

  // Company Brand
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("VORTEX INDUSTRIAL AUTOMATION", 14, 18);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text("Modular Conveyor & Robotics Systems | ISO 9001:2015 Certified", 14, 25);
  doc.text("Industrial MechCorp Tech Park, Bangalore, India | contact@industrial-vortex.com", 14, 30);

  // Quote / Document Reference Badge on Right
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(6, 182, 212);
  doc.text("ENGINEERING QUOTATION & BOM", 196, 18, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text(`Ref: ${data.quoteNumber}`, 196, 25, { align: "right" });
  doc.text(`Date: ${dateText}`, 196, 30, { align: "right" });

  // 2. Customer & Machine Specifications Grid
  let yPos = 46;

  // Left Column: Customer Information
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text("PREPARED FOR:", 14, yPos);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  doc.text(`Contact: ${data.customerName}`, 14, yPos + 6);
  doc.text(`Company: ${data.companyName}`, 14, yPos + 11);
  doc.text(`Email: ${data.email} | Phone: ${data.phone}`, 14, yPos + 16);
  doc.text(`Destination / Country: ${data.country}`, 14, yPos + 21);

  // Right Column: Target Machine Configuration
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text("MACHINE CONFIGURATION SPECIFICATIONS:", 115, yPos);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  doc.text(`Machine Model: ${data.machine.name} (${data.machine.modelNumber})`, 115, yPos + 6);
  doc.text(`Envelope Dimensions: ${data.pricing.dimensionsSummary}`, 115, yPos + 11);
  doc.text(`Total Machine Mass: ${data.pricing.totalWeightKg} kg`, 115, yPos + 16);
  doc.text(`Connected Power Draw: ${data.pricing.totalPowerKW} kW (${data.machine.powerRequirements})`, 115, yPos + 21);

  yPos += 30;

  // 3. Bill of Materials (BOM) Table
  const tableData: any[][] = [];

  // Machine Base Frame Row
  tableData.push([
    "BASE-01",
    `${data.machine.name} Base Structural Frame`,
    "Chassis",
    "1",
    formatCurrency(data.pricing.baseMachinePrice, currency),
    formatCurrency(data.pricing.baseMachinePrice, currency),
  ]);

  // Installed Components
  for (const item of data.pricing.bomItems) {
    tableData.push([
      item.partNumber,
      item.name,
      item.category,
      item.quantity.toString(),
      formatCurrency(item.unitPrice, currency),
      formatCurrency(item.totalPrice, currency),
    ]);
  }

  autoTable(doc, {
    startY: yPos,
    head: [["Part #", "Component Description", "Category", "Qty", "Unit Price", "Total Price"]],
    body: tableData,
    theme: "striped",
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontSize: 8.5,
      fontStyle: "bold",
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 24, fontStyle: "bold" },
      1: { cellWidth: 70 },
      2: { cellWidth: 32 },
      3: { cellWidth: 14, halign: "center" },
      4: { cellWidth: 26, halign: "right" },
      5: { cellWidth: 26, halign: "right" },
    },
    margin: { left: 14, right: 14 },
  });

  // Calculate final Y position after table
  const finalY = (doc as any).lastAutoTable.finalY + 8;

  // Cost Calculation Summary Box
  const summaryX = 120;
  doc.setFillColor(241, 245, 249);
  doc.rect(summaryX, finalY, 76, 38, "F");
  doc.setDrawColor(203, 213, 225);
  doc.rect(summaryX, finalY, 76, 38, "S");

  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);

  doc.text("Components Subtotal:", summaryX + 4, finalY + 7);
  doc.text(formatCurrency(data.pricing.componentsSubtotal + data.pricing.baseMachinePrice, currency), summaryX + 72, finalY + 7, { align: "right" });

  doc.text("Factory Calibration & Testing:", summaryX + 4, finalY + 14);
  doc.text(formatCurrency(data.pricing.installationAndCalibrationCost, currency), summaryX + 72, finalY + 14, { align: "right" });

  doc.text("Applicable GST / Tax (18%):", summaryX + 4, finalY + 21);
  doc.text(formatCurrency(data.pricing.taxAmount, currency), summaryX + 72, finalY + 21, { align: "right" });

  doc.setDrawColor(203, 213, 225);
  doc.line(summaryX + 4, finalY + 26, summaryX + 72, finalY + 26);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text("Total Quoted Amount:", summaryX + 4, finalY + 33);
  doc.setTextColor(2, 132, 199); // blue-600
  doc.text(formatCurrency(data.pricing.grandTotal, currency), summaryX + 72, finalY + 33, { align: "right" });

  // Standard Commercial Terms on Bottom Left
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text("COMMERCIAL TERMS & WARRANTY:", 14, finalY + 7);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text("1. Validity: This quotation is valid for 30 calendar days from the date of issuance.", 14, finalY + 14);
  doc.text("2. Warranty: 24 months OEM warranty on structural chassis and drive train.", 14, finalY + 19);
  doc.text("3. Delivery: Standard manufacturing lead time is 4-6 weeks upon drawing sign-off.", 14, finalY + 24);
  doc.text("4. Payment: 40% advance with Purchase Order, 50% prior to dispatch, 10% after commissioning.", 14, finalY + 29);

  // Footer Page Number & Security Stamp
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    "Generated automatically by VORTEX 3D Industrial Machine Configurator. Digital verification code: VTX-" +
      Math.random().toString(36).substring(2, 10).toUpperCase(),
    105,
    288,
    { align: "center" }
  );

  return doc;
}
