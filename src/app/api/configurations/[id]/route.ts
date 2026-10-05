import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const configuration = await prisma.configuration.findFirst({
      where: {
        OR: [{ id }, { shareToken: id }],
      },
      include: {
        machine: {
          include: {
            mountingPoints: true,
            compatibilityRules: true,
          },
        },
        components: {
          include: {
            component: { include: { category: true } },
            mountingPoint: true,
          },
        },
        bomItems: true,
      },
    });

    if (!configuration) {
      return NextResponse.json({ success: false, error: "Configuration not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, configuration });
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
    await prisma.configuration.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
