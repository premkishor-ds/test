import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { evaluateConfigurationRules } from "@/lib/configurator/rules-engine";
import { calculatePricingAndBOM } from "@/lib/configurator/pricing-bom-engine";
import { Machine, ComponentItem, InstalledComponent, CompatibilityRule } from "@/types/configurator";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const configurations = await prisma.configuration.findMany({
      include: {
        machine: true,
        components: {
          include: {
            component: { include: { category: true } },
            mountingPoint: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ success: true, configurations });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, machineId, installedComponents, dimensionsSummary } = body;

    // 1. Fetch Machine & Database Rules
    const machine = await prisma.machine.findUnique({
      where: { id: machineId },
      include: {
        mountingPoints: true,
        compatibilityRules: { where: { isActive: true } },
      },
    });

    if (!machine) {
      return NextResponse.json({ success: false, error: "Machine not found" }, { status: 404 });
    }

    // 2. Fetch authoritative components from database
    const compIds = (installedComponents || []).map((i: any) => i.componentId);
    const dbComponents = await prisma.component.findMany({
      where: { id: { in: compIds } },
      include: { category: true },
    });

    // 3. Assemble installed map for server-side rule and pricing recalculation
    const installedMap: Record<string, InstalledComponent> = {};
    for (const item of installedComponents || []) {
      const dbComp = dbComponents.find((c) => c.id === item.componentId);
      if (dbComp) {
        installedMap[item.mountingPointId] = {
          mountingPointId: item.mountingPointId,
          component: dbComp as unknown as ComponentItem,
          quantity: item.quantity || 1,
        };
      }
    }

    // 4. Server-Side Compatibility Validation
    const validation = evaluateConfigurationRules(
      installedMap,
      machine.compatibilityRules as unknown as CompatibilityRule[]
    );

    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: "Configuration failed server-side engineering validation.",
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    // 5. Server-Side Authoritative Price & BOM Recalculation
    const pricing = calculatePricingAndBOM(
      machine as unknown as Machine,
      installedMap,
      machine.currency
    );

    // 6. Save Configuration to Database
    const shareToken = `cfg-${Math.random().toString(36).substring(2, 9)}`;

    const configuration = await prisma.configuration.create({
      data: {
        name: name || "Custom Configuration",
        machineId: machine.id,
        shareToken,
        totalPrice: pricing.grandTotal,
        currency: pricing.currency,
        totalWeight: pricing.totalWeightKg,
        totalPower: pricing.totalPowerKW,
        status: "SAVED",
        bomSnapshotJson: JSON.stringify(pricing.bomItems),
        specsSnapshotJson: JSON.stringify({
          dimensions: pricing.dimensionsSummary,
          weightKg: pricing.totalWeightKg,
          powerKW: pricing.totalPowerKW,
        }),
        components: {
          create: Object.values(installedMap).map((inst) => ({
            mountingPointId: inst.mountingPointId,
            componentId: inst.component.id,
            quantity: inst.quantity,
            unitPrice: inst.component.price,
            totalPrice: inst.component.price * inst.quantity,
          })),
        },
        bomItems: {
          create: pricing.bomItems.map((bom) => ({
            partNumber: bom.partNumber,
            name: bom.name,
            category: bom.category,
            quantity: bom.quantity,
            unitPrice: bom.unitPrice,
            totalPrice: bom.totalPrice,
            currency: bom.currency,
            weight: bom.weight,
            dimensions: bom.dimensions,
          })),
        },
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "SAVE_CONFIGURATION",
        entityType: "Configuration",
        entityId: configuration.id,
        detailsJson: JSON.stringify({ name: configuration.name, total: pricing.grandTotal }),
      },
    });

    return NextResponse.json({ success: true, configuration, pricing });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
