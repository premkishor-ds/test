import { evaluateConfigurationRules } from "../src/lib/configurator/rules-engine";
import { useConfiguratorStore } from "../src/lib/configurator/configurator-store";
import { prisma } from "../src/lib/prisma";

async function runAutoFixTest() {
  console.log("🧪 Testing 1-Click Auto-Fix functionality on WLD-600...");

  // 1. Fetch WLD-600 machine, mounting points, components, and rules
  const wld600 = await prisma.machine.findUnique({
    where: { slug: "wld-600" },
    include: {
      mountingPoints: true,
      compatibilityRules: { where: { isActive: true } },
    },
  });

  if (!wld600) {
    throw new Error("WLD-600 machine not found in DB");
  }

  const [components, categories] = await Promise.all([
    prisma.component.findMany({ where: { isActive: true }, include: { category: true } }),
    prisma.componentCategory.findMany(),
  ]);

  console.log(`Found machine ${wld600.name} with ${wld600.mountingPoints.length} mounting points`);

  // 2. Initialize the store as if loading WLD-600 in browser
  const store = useConfiguratorStore.getState();
  store.initialize(
    wld600 as any,
    wld600.mountingPoints as any,
    components as any,
    wld600.compatibilityRules as any,
    categories as any,
    undefined,
    "Test WLD-600 Config",
    false
  );

  // 3. Check initial validation status
  let validation = useConfiguratorStore.getState().validation;
  console.log("Initial Valid:", validation.valid);
  console.log("Initial Errors count:", validation.errors.length);
  validation.errors.forEach((err, idx) => {
    console.log(`  Error [${idx + 1}]: ${err.message}`);
    console.log(`  QuickFix:`, err.quickFix);
  });

  if (validation.valid) {
    console.log("Expected validation to have at least 1 issue (Fiber laser requires SFT-001)");
  }

  // 4. Trigger 1-Click Auto-Fix All
  console.log("\n⚡ Executing store.autoFixAllIssues()...");
  const result = useConfiguratorStore.getState().autoFixAllIssues();
  console.log(`Fixed count: ${result.fixedCount}, Remaining count: ${result.remainingCount}`);

  // 5. Verify that validation is now 100% compliant!
  validation = useConfiguratorStore.getState().validation;
  console.log("Post-Fix Valid:", validation.valid);
  console.log("Post-Fix Errors count:", validation.errors.length);

  const finalInstalled = useConfiguratorStore.getState().installedComponents;
  console.log("Installed component part numbers:", Object.values(finalInstalled).map((i) => i.component.partNumber));

  if (validation.valid && validation.errors.length === 0) {
    console.log("\n🎉 SUCCESS: 1-Click Auto-Fix resolved the configuration issue automatically!");
  } else {
    console.error("\n❌ FAILED: Validation still has errors!");
    process.exit(1);
  }

  // 6. Test another scenario: 10HP motor on 2m conveyor with Standard control panel
  console.log("\n🧪 Testing 1-Click Auto-Fix on multiple cascading violations (MX-500)...");
  const mx500 = await prisma.machine.findUnique({
    where: { slug: "mx-500" },
    include: {
      mountingPoints: true,
      compatibilityRules: { where: { isActive: true } },
    },
  });

  const motorMount = mx500!.mountingPoints.find((mp) => mp.pointId === "MOTOR_MOUNT_01");
  const cvyMount = mx500!.mountingPoints.find((mp) => mp.pointId === "CONVEYOR_BED_01");
  const ctrlMount = mx500!.mountingPoints.find((mp) => mp.pointId === "CONTROL_PANEL");
  const mtr10 = components.find((c) => c.partNumber === "MTR-010");
  const cvy2 = components.find((c) => c.partNumber === "CVY-002");
  const ctl1 = components.find((c) => c.partNumber === "CTL-001");

  // Intentionally configure with 2 severe violations (10HP on 2m conveyor + 10HP on standard panel)
  const problematicInstalled: Record<string, any> = {
    [motorMount!.id]: { mountingPointId: motorMount!.id, component: mtr10, quantity: 1 },
    [cvyMount!.id]: { mountingPointId: cvyMount!.id, component: cvy2, quantity: 1 },
    [ctrlMount!.id]: { mountingPointId: ctrlMount!.id, component: ctl1, quantity: 1 },
  };

  store.initialize(
    mx500 as any,
    mx500!.mountingPoints as any,
    components as any,
    mx500!.compatibilityRules as any,
    categories as any,
    problematicInstalled,
    "Problematic MX-500",
    false
  );

  let mxValidation = useConfiguratorStore.getState().validation;
  console.log("MX-500 Problematic Valid:", mxValidation.valid);
  console.log(`MX-500 Errors count (${mxValidation.errors.length}):`);
  mxValidation.errors.forEach((err) => console.log(`  - ${err.message}`));

  console.log("⚡ Executing 1-Click Auto-Fix on MX-500...");
  const mxResult = useConfiguratorStore.getState().autoFixAllIssues();
  console.log(`Fixed count: ${mxResult.fixedCount}, Remaining count: ${mxResult.remainingCount}`);

  mxValidation = useConfiguratorStore.getState().validation;
  console.log("MX-500 Post-Fix Valid:", mxValidation.valid);
  console.log("MX-500 Post-Fix Errors count:", mxValidation.errors.length);
  const fixedInstalled = useConfiguratorStore.getState().installedComponents;
  console.log("Fixed MX-500 Parts:", Object.values(fixedInstalled).map((i) => i.component.partNumber));

  if (mxValidation.valid && mxValidation.errors.length === 0) {
    console.log("🎉 SUCCESS: Multi-violation 1-Click Auto-Fix passed flawlessly!");
  } else {
    console.error("❌ FAILED: MX-500 still has errors:", mxValidation.errors);
    process.exit(1);
  }

  process.exit(0);
}

runAutoFixTest().catch((err) => {
  console.error(err);
  process.exit(1);
});
