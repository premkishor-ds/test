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
} from "@/types/configurator";

interface PageProps {
  params: Promise<{ machineId: string }>;
}

export const dynamic = "force-dynamic";

export default async function ConfiguratorPage({ params }: PageProps) {
  const { machineId } = await params;

  // Find machine by slug or ID
  const machine = await prisma.machine.findFirst({
    where: {
      OR: [{ slug: machineId }, { id: machineId }],
      isActive: true,
    },
    include: {
      mountingPoints: true,
      compatibilityRules: {
        where: { isActive: true },
      },
    },
  });

  if (!machine) {
    notFound();
  }

  // Fetch all active components with categories
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

  return (
    <ConfiguratorClient
      machine={machine as unknown as Machine}
      mountingPoints={machine.mountingPoints as unknown as MountingPoint[]}
      components={components as unknown as ComponentItem[]}
      categories={categories as unknown as ComponentCategory[]}
      rules={machine.compatibilityRules as unknown as CompatibilityRule[]}
    />
  );
}
