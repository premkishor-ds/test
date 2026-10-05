import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { evaluateConfigurationRules } from "@/lib/configurator/rules-engine";
import { ComponentItem, InstalledComponent, CompatibilityRule } from "@/types/configurator";

export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const environment = body.environment || "STANDARD";

    const config = await prisma.configuration.findUnique({
      where: { id },
      include: {
        machine: {
          include: {
            compatibilityRules: { where: { isActive: true } },
          },
        },
        components: {
          include: {
            component: { include: { category: true } },
            mountingPoint: true,
          },
        },
      },
    });

    if (!config) {
      return NextResponse.json({ success: false, error: "Configuration not found" }, { status: 404 });
    }

    const installedMap: Record<string, InstalledComponent> = {};
    for (const item of config.components) {
      installedMap[item.mountingPointId] = {
        mountingPointId: item.mountingPointId,
        component: item.component as unknown as ComponentItem,
        quantity: item.quantity,
      };
    }

    const validation = evaluateConfigurationRules(
      installedMap,
      config.machine.compatibilityRules as unknown as CompatibilityRule[],
      { environment }
    );

    return NextResponse.json({ success: true, validation });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
