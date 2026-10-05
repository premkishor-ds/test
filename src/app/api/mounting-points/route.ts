import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const machineId = searchParams.get("machineId");

    const where: any = {};
    if (machineId) where.machineId = machineId;

    const mountingPoints = await prisma.mountingPoint.findMany({
      where,
      include: { machine: true },
      orderBy: { pointId: "asc" },
    });

    return NextResponse.json({ success: true, mountingPoints });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const mountingPoint = await prisma.mountingPoint.create({
      data: {
        pointId: body.pointId,
        machineId: body.machineId,
        name: body.name,
        description: body.description || "",
        posX: parseFloat(body.posX) || 0,
        posY: parseFloat(body.posY) || 0,
        posZ: parseFloat(body.posZ) || 0,
        rotX: parseFloat(body.rotX) || 0,
        rotY: parseFloat(body.rotY) || 0,
        rotZ: parseFloat(body.rotZ) || 0,
        explodedX: parseFloat(body.explodedX) || 0,
        explodedY: parseFloat(body.explodedY) || 0,
        explodedZ: parseFloat(body.explodedZ) || 0,
        allowedCategorySlugsJson: typeof body.allowedCategorySlugsJson === "string" ? body.allowedCategorySlugsJson : JSON.stringify(body.allowedCategorySlugsJson || []),
        allowedPartNumbersJson: body.allowedPartNumbersJson ? (typeof body.allowedPartNumbersJson === "string" ? body.allowedPartNumbersJson : JSON.stringify(body.allowedPartNumbersJson)) : null,
        defaultPartNumber: body.defaultPartNumber || null,
        maxQuantity: parseInt(body.maxQuantity) || 1,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "CREATE_MOUNTING_POINT",
        entityType: "MountingPoint",
        entityId: mountingPoint.id,
        detailsJson: JSON.stringify({ pointId: mountingPoint.pointId, machineId: mountingPoint.machineId }),
      },
    });

    return NextResponse.json({ success: true, mountingPoint });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, ...data } = body;

    const mountingPoint = await prisma.mountingPoint.update({
      where: { id },
      data: {
        pointId: data.pointId,
        name: data.name,
        description: data.description,
        posX: parseFloat(data.posX) || 0,
        posY: parseFloat(data.posY) || 0,
        posZ: parseFloat(data.posZ) || 0,
        rotX: parseFloat(data.rotX) || 0,
        rotY: parseFloat(data.rotY) || 0,
        rotZ: parseFloat(data.rotZ) || 0,
        explodedX: parseFloat(data.explodedX) || 0,
        explodedY: parseFloat(data.explodedY) || 0,
        explodedZ: parseFloat(data.explodedZ) || 0,
        allowedCategorySlugsJson: typeof data.allowedCategorySlugsJson === "string" ? data.allowedCategorySlugsJson : JSON.stringify(data.allowedCategorySlugsJson || []),
        allowedPartNumbersJson: data.allowedPartNumbersJson ? (typeof data.allowedPartNumbersJson === "string" ? data.allowedPartNumbersJson : JSON.stringify(data.allowedPartNumbersJson)) : null,
        defaultPartNumber: data.defaultPartNumber,
      },
    });

    return NextResponse.json({ success: true, mountingPoint });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
