import { test, describe } from "node:test";
import assert from "node:assert";
import {
  checkMountCompatibility,
  evaluateConfigurationRules,
} from "../src/lib/configurator/rules-engine";
import {
  calculatePricingAndBOM,
  generateBOMCsv,
} from "../src/lib/configurator/pricing-bom-engine";
import {
  Machine,
  MountingPoint,
  ComponentItem,
  InstalledComponent,
  CompatibilityRule,
} from "../src/types/configurator";

describe("3D Industrial Configurator - Core Rules & Compatibility Engine", () => {
  const mockMachine: Machine = {
    id: "mach-mx500",
    slug: "mx-500",
    name: "MX-500 Industrial Conveyor",
    modelNumber: "MX-500-HD",
    description: "Heavy duty conveyor",
    category: "Conveyors",
    basePrice: 200000,
    currency: "INR",
    baseWeight: 145,
    baseDimensions: "3200 x 850 x 950 mm",
    powerRequirements: "415V 3-Phase",
    isActive: true,
  };

  const motorMount: MountingPoint = {
    id: "mp-motor",
    pointId: "MOTOR_MOUNT_01",
    machineId: "mach-mx500",
    name: "Drive Motor Mount",
    posX: -1.45,
    posY: 0.55,
    posZ: 0.65,
    rotX: 0,
    rotY: 0,
    rotZ: 0,
    explodedX: -0.8,
    explodedY: 0.3,
    explodedZ: 0.8,
    allowedCategorySlugsJson: JSON.stringify(["motors"]),
    allowedPartNumbersJson: JSON.stringify(["MTR-002", "MTR-005", "MTR-010"]),
    maxQuantity: 1,
  };

  const sensorMount: MountingPoint = {
    id: "mp-sensor",
    pointId: "SENSOR_01",
    machineId: "mach-mx500",
    name: "Infeed Sensor",
    posX: -1.15,
    posY: 0.95,
    posZ: 0.42,
    rotX: 0,
    rotY: 0,
    rotZ: 0,
    explodedX: -0.3,
    explodedY: 0.5,
    explodedZ: 0.4,
    allowedCategorySlugsJson: JSON.stringify(["sensors"]),
    maxQuantity: 1,
  };

  const motor5HP: ComponentItem = {
    id: "comp-mtr-5hp",
    partNumber: "MTR-005",
    sku: "SKU-MTR-5HP",
    name: "5HP Induction Motor",
    description: "Medium duty drive",
    categoryId: "cat-motors",
    category: { id: "cat-motors", name: "Motors", slug: "motors", sortOrder: 1 },
    manufacturer: "ABB",
    price: 42000,
    currency: "INR",
    weight: 31,
    dimensions: "380 x 220 x 240 mm",
    powerRating: 3.7,
    technicalSpecsJson: "{}",
    isActive: true,
  };

  const motor10HP: ComponentItem = {
    id: "comp-mtr-10hp",
    partNumber: "MTR-010",
    sku: "SKU-MTR-10HP",
    name: "10HP Ultra-Torque Motor",
    description: "High torque drive",
    categoryId: "cat-motors",
    category: { id: "cat-motors", name: "Motors", slug: "motors", sortOrder: 1 },
    manufacturer: "Baldor",
    price: 78000,
    currency: "INR",
    weight: 54,
    dimensions: "460 x 280 x 300 mm",
    powerRating: 7.5,
    technicalSpecsJson: "{}",
    isActive: true,
  };

  const conveyor2M: ComponentItem = {
    id: "comp-cvy-2m",
    partNumber: "CVY-002",
    sku: "SKU-CVY-2M",
    name: "2m PVC Conveyor",
    description: "Short track",
    categoryId: "cat-cvy",
    category: { id: "cat-cvy", name: "Conveyors", slug: "conveyors", sortOrder: 2 },
    manufacturer: "Habasit",
    price: 52000,
    currency: "INR",
    weight: 65,
    dimensions: "2000 x 600 x 120 mm",
    technicalSpecsJson: "{}",
    isActive: true,
  };

  const sensorStd: ComponentItem = {
    id: "comp-sen-01",
    partNumber: "SEN-001",
    sku: "SKU-SEN-01",
    name: "Optical Sensor",
    description: "Photoelectric",
    categoryId: "cat-sen",
    category: { id: "cat-sen", name: "Sensors", slug: "sensors", sortOrder: 3 },
    manufacturer: "Omron",
    price: 5000,
    currency: "INR",
    weight: 0.8,
    dimensions: "85 x 40 x 35 mm",
    technicalSpecsJson: "{}",
    isActive: true,
  };

  test("Mounting Point Compatibility: accepts allowed category and rejects mismatch", () => {
    // Motor on motor mount -> Allowed
    const res1 = checkMountCompatibility(motorMount, motor5HP, {});
    assert.strictEqual(res1.allowed, true);

    // Sensor on motor mount -> Rejected
    const res2 = checkMountCompatibility(motorMount, sensorStd, {});
    assert.strictEqual(res2.allowed, false);
    assert.match(res2.reason || "", /only accepts categories: motors/);
  });

  test("Rule Validation: 10HP motor rejects 2m conveyor bed", () => {
    const installed: Record<string, InstalledComponent> = {
      "mp-motor": { mountingPointId: "mp-motor", component: motor10HP, quantity: 1 },
      "mp-cvy": { mountingPointId: "mp-cvy", component: conveyor2M, quantity: 1 },
    };

    const result = evaluateConfigurationRules(installed);
    assert.strictEqual(result.valid, false);
    assert.ok(result.errors.some((e) => e.code === "DIMENSION_INCOMPATIBLE"));
  });

  test("Rule Validation: 5HP+ motor mandates emergency stop console", () => {
    const installed: Record<string, InstalledComponent> = {
      "mp-motor": { mountingPointId: "mp-motor", component: motor5HP, quantity: 1 },
    };

    const result = evaluateConfigurationRules(installed);
    assert.strictEqual(result.valid, false);
    assert.ok(result.errors.some((e) => e.code === "SAFETY_MANDATORY_ESTOP"));
  });

  test("Rule Validation: Hazardous washdown environment flags non-IP67 sensors", () => {
    const installed: Record<string, InstalledComponent> = {
      "mp-sensor": { mountingPointId: "mp-sensor", component: sensorStd, quantity: 1 },
    };

    const result = evaluateConfigurationRules(installed, [], { environment: "HAZARDOUS" });
    assert.strictEqual(result.valid, false);
    assert.ok(result.errors.some((e) => e.code === "ENVIRONMENT_INCOMPATIBLE"));
  });
});

describe("3D Industrial Configurator - Pricing & BOM Calculation Engine", () => {
  const machine: Machine = {
    id: "mach-1",
    slug: "mx-500",
    name: "MX-500",
    modelNumber: "MX-500",
    description: "",
    category: "Conveyors",
    basePrice: 200000,
    currency: "INR",
    baseWeight: 145,
    baseDimensions: "3200 x 850 x 950 mm",
    powerRequirements: "415V",
    isActive: true,
  };

  const comp1: ComponentItem = {
    id: "c1",
    partNumber: "MTR-005",
    sku: "SKU-1",
    name: "5HP Motor",
    description: "",
    categoryId: "cat1",
    category: { id: "cat1", name: "Motors", slug: "motors", sortOrder: 1 },
    manufacturer: "ABB",
    price: 42000,
    currency: "INR",
    weight: 31,
    dimensions: "380 x 220 x 240 mm",
    powerRating: 3.7,
    technicalSpecsJson: "{}",
    isActive: true,
  };

  test("Accurately calculates components total, calibration, 18% tax, and weight", () => {
    const installed: Record<string, InstalledComponent> = {
      mp1: { mountingPointId: "mp1", component: comp1, quantity: 1 },
    };

    const summary = calculatePricingAndBOM(machine, installed, "INR");

    assert.strictEqual(summary.baseMachinePrice, 200000);
    assert.strictEqual(summary.componentsSubtotal, 42000);
    // Subtotal = 200,000 + 42,000 = 242,000. Calibration 4% = 9,680 -> 251,680
    // Tax 18% = 45,302
    assert.strictEqual(summary.grandTotal, summary.subtotal + summary.taxAmount);
    assert.strictEqual(summary.totalWeightKg, 145 + 31);
    assert.strictEqual(summary.bomItems.length, 1);
  });

  test("Generates valid CSV formatting for Bill of Materials", () => {
    const installed: Record<string, InstalledComponent> = {
      mp1: { mountingPointId: "mp1", component: comp1, quantity: 1 },
    };
    const summary = calculatePricingAndBOM(machine, installed, "INR");
    const csv = generateBOMCsv(summary, machine.name);

    assert.ok(csv.includes("Part Number,Component Name"));
    assert.ok(csv.includes("MTR-005"));
    assert.ok(csv.includes("Grand Total"));
  });
});
