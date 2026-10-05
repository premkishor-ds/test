import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const categorySlug = searchParams.get("category");

    const where: any = { isActive: true };
    if (categorySlug) {
      where.category = { slug: categorySlug };
    }

    const components = await prisma.component.findMany({
      where,
      include: { category: true },
      orderBy: { partNumber: "asc" },
    });

    const categories = await prisma.componentCategory.findMany({
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({ success: true, components, categories });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const component = await prisma.component.create({
      data: {
        partNumber: body.partNumber,
        sku: body.sku || `SKU-${body.partNumber}`,
        name: body.name,
        description: body.description || "",
        categoryId: body.categoryId,
        manufacturer: body.manufacturer || "Industrial MechCorp",
        price: parseFloat(body.price) || 0,
        currency: body.currency || "INR",
        weight: parseFloat(body.weight) || 0,
        dimensions: body.dimensions || "300 x 200 x 200 mm",
        powerRating: body.powerRating ? parseFloat(body.powerRating) : null,
        voltage: body.voltage || null,
        technicalSpecsJson: typeof body.technicalSpecsJson === "string" ? body.technicalSpecsJson : JSON.stringify(body.technicalSpecsJson || {}),
        modelGlbUrl: body.modelGlbUrl || null,
        isActive: body.isActive ?? true,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "CREATE_COMPONENT",
        entityType: "Component",
        entityId: component.id,
        detailsJson: JSON.stringify({ partNumber: component.partNumber, name: component.name }),
      },
    });

    return NextResponse.json({ success: true, component });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
