import React from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ConfiguratorClient } from "@/components/configurator/ConfiguratorClient";
import {
  Machine,
  MountingPoint,
  ComponentItem,
  ComponentCategory,
  CompatibilityRule,
  InstalledComponent,
} from "@/types/configurator";

interface PageProps {
  params: Promise<{ configurationId: string }>;
}

export const dynamic = "force-dynamic";

export default async function ConfigurationLoadPage({ params }: PageProps) {
  const { configurationId } = await params;

  const configuration = await prisma.configuration.findFirst({
    where: {
      OR: [{ id: configurationId }, { shareToken: configurationId }],
    },
    include: {
      machine: {
        include: {
          mountingPoints: true,
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

  if (!configuration) {
    notFound();
  }

  // Fetch all active components & categories for the library panel
  const [components, categories] = await Promise.all([
    prisma.component.findMany({
      where: { isActive: true },
      include: { category: true },
      orderBy: { partNumber: "asc" },
    }),
    prisma.componentCategory.findMany({
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  // Map saved components to installedComponents dictionary
  const initialInstalled: Record<string, InstalledComponent> = {};
  for (const cfgComp of configuration.components) {
    initialInstalled[cfgComp.mountingPointId] = {
      mountingPointId: cfgComp.mountingPointId,
      component: cfgComp.component as unknown as ComponentItem,
      quantity: cfgComp.quantity,
    };
  }

  return (
    <ConfiguratorClient
      machine={configuration.machine as unknown as Machine}
      mountingPoints={configuration.machine.mountingPoints as unknown as MountingPoint[]}
      components={components as unknown as ComponentItem[]}
      categories={categories as unknown as ComponentCategory[]}
      rules={configuration.machine.compatibilityRules as unknown as CompatibilityRule[]}
      initialInstalled={initialInstalled}
      initialConfigName={configuration.name}
    />
  );
}
