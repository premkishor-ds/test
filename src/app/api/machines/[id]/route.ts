import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const machine = await prisma.machine.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        mountingPoints: true,
        compatibilityRules: true,
        versions: true,
      },
    });

    if (!machine) {
      return NextResponse.json({ success: false, error: "Machine not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, machine });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const machine = await prisma.machine.update({
      where: { id },
      data: {
        name: body.name,
        slug: body.slug,
        modelNumber: body.modelNumber,
        description: body.description,
        category: body.category,
        basePrice: parseFloat(body.basePrice) || 0,
        currency: body.currency,
        baseWeight: parseFloat(body.baseWeight) || 0,
        baseDimensions: body.baseDimensions,
        powerRequirements: body.powerRequirements,
        isActive: body.isActive,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "UPDATE_MACHINE",
        entityType: "Machine",
        entityId: machine.id,
        detailsJson: JSON.stringify({ name: machine.name }),
      },
    });

    return NextResponse.json({ success: true, machine });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.machine.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        action: "DELETE_MACHINE",
        entityType: "Machine",
        entityId: id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
