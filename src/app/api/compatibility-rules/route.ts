import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const machineId = searchParams.get("machineId");

    const where: any = {};
    if (machineId) where.machineId = machineId;

    const rules = await prisma.compatibilityRule.findMany({
      where,
      include: { machine: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, rules });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const rule = await prisma.compatibilityRule.create({
      data: {
        machineId: body.machineId || null,
        name: body.name,
        description: body.description || "",
        ruleType: body.ruleType || "REQUIRES",
        triggerJson: typeof body.triggerJson === "string" ? body.triggerJson : JSON.stringify(body.triggerJson || {}),
        targetJson: typeof body.targetJson === "string" ? body.targetJson : JSON.stringify(body.targetJson || {}),
        errorMessage: body.errorMessage,
        isActive: body.isActive ?? true,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "CREATE_RULE",
        entityType: "CompatibilityRule",
        entityId: rule.id,
        detailsJson: JSON.stringify({ name: rule.name }),
      },
    });

    return NextResponse.json({ success: true, rule });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, ...data } = body;

    const rule = await prisma.compatibilityRule.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        ruleType: data.ruleType,
        triggerJson: typeof data.triggerJson === "string" ? data.triggerJson : JSON.stringify(data.triggerJson || {}),
        targetJson: typeof data.targetJson === "string" ? data.targetJson : JSON.stringify(data.targetJson || {}),
        errorMessage: data.errorMessage,
        isActive: data.isActive,
      },
    });

    return NextResponse.json({ success: true, rule });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
