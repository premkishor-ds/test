import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const machines = await prisma.machine.findMany({
      include: {
        mountingPoints: true,
        compatibilityRules: true,
        versions: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, machines });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const machine = await prisma.machine.create({
      data: {
        name: body.name,
        slug: body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        modelNumber: body.modelNumber,
        description: body.description || "",
        category: body.category || "General",
        basePrice: parseFloat(body.basePrice) || 0,
        currency: body.currency || "INR",
        baseWeight: parseFloat(body.baseWeight) || 0,
        baseDimensions: body.baseDimensions || "2000 x 800 x 900 mm",
        powerRequirements: body.powerRequirements || "415V 3-Phase",
        isActive: body.isActive ?? true,
      },
    });

    // Record audit log
    await prisma.auditLog.create({
      data: {
        action: "CREATE_MACHINE",
        entityType: "Machine",
        entityId: machine.id,
        detailsJson: JSON.stringify({ name: machine.name, modelNumber: machine.modelNumber }),
      },
    });

    return NextResponse.json({ success: true, machine });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
