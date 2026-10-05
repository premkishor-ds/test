import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const component = await prisma.component.findUnique({
      where: { id },
      include: { category: true, variants: true, prices: true },
    });

    if (!component) {
      return NextResponse.json({ success: false, error: "Component not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, component });
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

    const component = await prisma.component.update({
      where: { id },
      data: {
        name: body.name,
        partNumber: body.partNumber,
        sku: body.sku,
        description: body.description,
        categoryId: body.categoryId,
        manufacturer: body.manufacturer,
        price: parseFloat(body.price) || 0,
        currency: body.currency,
        weight: parseFloat(body.weight) || 0,
        dimensions: body.dimensions,
        powerRating: body.powerRating ? parseFloat(body.powerRating) : null,
        voltage: body.voltage,
        technicalSpecsJson: typeof body.technicalSpecsJson === "string" ? body.technicalSpecsJson : JSON.stringify(body.technicalSpecsJson || {}),
        modelGlbUrl: body.modelGlbUrl,
        isActive: body.isActive,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "UPDATE_COMPONENT",
        entityType: "Component",
        entityId: component.id,
        detailsJson: JSON.stringify({ partNumber: component.partNumber }),
      },
    });

    return NextResponse.json({ success: true, component });
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
    await prisma.component.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        action: "DELETE_COMPONENT",
        entityType: "Component",
        entityId: id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
