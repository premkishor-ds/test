import {
  Machine,
  InstalledComponent,
  BOMItemRow,
} from "@/types/configurator";

export interface PricingSummary {
  currency: string;
  baseMachinePrice: number;
  componentsSubtotal: number;
  installationAndCalibrationCost: number;
  subtotal: number;
  taxAmount: number;
  grandTotal: number;
  totalWeightKg: number;
  totalPowerKW: number;
  dimensionsSummary: string;
  componentCount: number;
  bomItems: BOMItemRow[];
}

export const USD_EXCHANGE_RATE = 86.5; // 1 USD = 86.5 INR

export function formatCurrency(amount: number, currency: string = "INR"): string {
  if (currency === "USD") {
    const usdAmount = amount / USD_EXCHANGE_RATE;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(usdAmount);
  }

  // Format as Indian Rupee (₹ with Lakh/Crore grouping)
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function calculatePricingAndBOM(
  machine: Machine,
  installed: Record<string, InstalledComponent>,
  currency: string = "INR"
): PricingSummary {
  let componentsSubtotal = 0;
  let totalWeight = machine.baseWeight || 0;
  let totalPower = 0;
  const bomItems: BOMItemRow[] = [];

  const installedEntries = Object.values(installed);

  for (const entry of installedEntries) {
    const comp = entry.component;
    const qty = entry.quantity || 1;
    // Check for parametric overrides in customSettings
    let unitPrice = comp.price;
    let itemWeight = comp.weight || 0;
    let itemDimensions = comp.dimensions || "-";
    let itemPower = comp.powerRating || 0;

    if (entry.customSettings) {
      if (entry.customSettings.length && comp.category?.slug === "conveyors") {
        const lenM = entry.customSettings.length;
        const widthM = entry.customSettings.width || 0.6;
        itemDimensions = `${Math.round(lenM * 1000)} x ${Math.round(widthM * 1000)} x 120 mm`;
        // Scale price and weight linearly with length
        unitPrice = Math.round(comp.price * (lenM / 4.0));
        itemWeight = Math.round((comp.weight || 100) * (lenM / 4.0));
      }

      if (entry.customSettings.powerHp && comp.category?.slug === "motors") {
        const hp = entry.customSettings.powerHp;
        itemPower = Math.round(hp * 0.7457 * 10) / 10;
        unitPrice = Math.round(comp.price * (hp / 5.0));
        itemWeight = Math.round(hp * 6.2);
        itemDimensions = `${Math.round(300 + hp * 15)} x ${Math.round(180 + hp * 10)} x ${Math.round(200 + hp * 10)} mm`;
      }
    }

    const itemTotal = unitPrice * qty;
    componentsSubtotal += itemTotal;
    totalWeight += itemWeight * qty;
    totalPower += itemPower * qty;

    bomItems.push({
      partNumber: comp.partNumber,
      name: entry.customSettings?.length
        ? `${comp.name} (Parametric ${entry.customSettings.length}m)`
        : entry.customSettings?.powerHp
        ? `${comp.name} (Parametric ${entry.customSettings.powerHp}HP)`
        : comp.name,
      category: comp.category?.name || "General",
      quantity: qty,
      unitPrice,
      totalPrice: itemTotal,
      currency: comp.currency || "INR",
      weight: itemWeight,
      dimensions: itemDimensions,
    });
  }

  // Sort BOM by category & part number
  bomItems.sort((a, b) => a.category.localeCompare(b.category));

  // Determine dynamic dimensions based on conveyor component installed
  let overallDimensions = machine.baseDimensions;
  const conveyorComp = installedEntries.find(
    (e) => e.component.category?.slug === "conveyors"
  );
  if (conveyorComp) {
    if (conveyorComp.customSettings?.length) {
      overallDimensions = `${Math.round((conveyorComp.customSettings.length + 0.4) * 1000)} x 850 x 950 mm`;
    } else if (conveyorComp.component.partNumber === "CVY-002") {
      overallDimensions = "2400 x 850 x 950 mm";
    } else if (conveyorComp.component.partNumber === "CVY-004") {
      overallDimensions = "4400 x 850 x 950 mm";
    } else if (conveyorComp.component.partNumber === "CVY-006") {
      overallDimensions = "6400 x 1050 x 950 mm";
    }
  }

  const basePrice = machine.basePrice || 0;
  const rawSubtotal = basePrice + componentsSubtotal;
  // Factory integration & testing (approx 4%)
  const installationCost = Math.round(rawSubtotal * 0.04);
  const subtotal = rawSubtotal + installationCost;
  // 18% GST / Industrial Machinery Tax
  const taxAmount = Math.round(subtotal * 0.18);
  const grandTotal = subtotal + taxAmount;

  return {
    currency,
    baseMachinePrice: basePrice,
    componentsSubtotal,
    installationAndCalibrationCost: installationCost,
    subtotal,
    taxAmount,
    grandTotal,
    totalWeightKg: Math.round(totalWeight * 10) / 10,
    totalPowerKW: Math.round(totalPower * 10) / 10,
    dimensionsSummary: overallDimensions,
    componentCount: installedEntries.length,
    bomItems,
  };
}

/**
 * Generate CSV string from BOM
 */
export function generateBOMCsv(summary: PricingSummary, machineName: string): string {
  const headers = [
    "Part Number",
    "Component Name",
    "Category",
    "Quantity",
    "Unit Price (INR)",
    "Total Price (INR)",
    "Weight (kg)",
    "Dimensions",
  ];

  const rows = summary.bomItems.map((item) => [
    `"${item.partNumber}"`,
    `"${item.name.replace(/"/g, '""')}"`,
    `"${item.category}"`,
    item.quantity,
    item.unitPrice,
    item.totalPrice,
    item.weight,
    `"${item.dimensions}"`,
  ]);

  // Append machine base & totals
  rows.unshift([
    `"BASE-FRAME"`,
    `"${machineName.replace(/"/g, '""')} Base Machine Frame"`,
    `"Chassis"`,
    1,
    summary.baseMachinePrice,
    summary.baseMachinePrice,
    `-`,
    `"${summary.dimensionsSummary}"`,
  ]);

  rows.push([]);
  rows.push([`"Subtotal"`, "", "", "", "", summary.subtotal]);
  rows.push([`"GST Tax (18%)"`, "", "", "", "", summary.taxAmount]);
  rows.push([`"Grand Total"`, "", "", "", "", summary.grandTotal]);
  rows.push([`"Total Machine Weight (kg)"`, "", "", "", "", summary.totalWeightKg]);
  rows.push([`"Total Power Draw (kW)"`, "", "", "", "", summary.totalPowerKW]);

  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}
