async function runIntegrationChecks() {
  console.log("🔍 Running Automated API & Route Health Checks...");

  const routes = [
    { url: "http://localhost:3000", name: "Homepage" },
    { url: "http://localhost:3000/configurator/mx-500", name: "3D Configurator Studio (MX-500)" },
    { url: "http://localhost:3000/machines", name: "Machine Catalog" },
    { url: "http://localhost:3000/machines/mx-500", name: "Machine Details (MX-500)" },
    { url: "http://localhost:3000/configurations", name: "Saved Configurations" },
    { url: "http://localhost:3000/quote", name: "RFQ Portal" },
    { url: "http://localhost:3000/admin", name: "Admin Dashboard" },
    { url: "http://localhost:3000/admin/mounting-points", name: "Visual 3D Mounting Editor" },
    { url: "http://localhost:3000/admin/compatibility-rules", name: "Visual Rule Builder" },
    { url: "http://localhost:3000/admin/quotes", name: "Admin Quotes List" },
    { url: "http://localhost:3000/api/machines", name: "REST API: GET /api/machines" },
    { url: "http://localhost:3000/api/components", name: "REST API: GET /api/components" },
    { url: "http://localhost:3000/api/mounting-points", name: "REST API: GET /api/mounting-points" },
    { url: "http://localhost:3000/api/compatibility-rules", name: "REST API: GET /api/compatibility-rules" },
  ];

  let passed = 0;
  for (const r of routes) {
    try {
      const res = await fetch(r.url);
      if (res.ok) {
        console.log(`✓ [200 OK] ${r.name}`);
        passed++;
      } else {
        console.error(`✗ [${res.status} FAIL] ${r.name}`);
      }
    } catch (e: any) {
      console.error(`✗ [ERROR] ${r.name}: ${e.message}`);
    }
  }

  // Test POST /api/configurations
  console.log("\n🧪 Testing Server-side Configuration Validation & Persistence...");
  try {
    const machinesRes = await fetch("http://localhost:3000/api/machines").then((r) => r.json());
    const mx500 = machinesRes.machines.find((m: any) => m.slug === "mx-500");
    const componentsRes = await fetch("http://localhost:3000/api/components").then((r) => r.json());
    const mtr5 = componentsRes.components.find((c: any) => c.partNumber === "MTR-005");
    const sft1 = componentsRes.components.find((c: any) => c.partNumber === "SFT-001");
    const sft2 = componentsRes.components.find((c: any) => c.partNumber === "SFT-002");
    const motorMount = mx500.mountingPoints.find((mp: any) => mp.pointId === "MOTOR_MOUNT_01");
    const guardMount = mx500.mountingPoints.find((mp: any) => mp.pointId === "SAFETY_GUARD_01");
    const estopMount = mx500.mountingPoints.find((mp: any) => mp.pointId === "ESTOP_MOUNT_01");

    const saveRes = await fetch("http://localhost:3000/api/configurations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test Compliant Assembly",
        machineId: mx500.id,
        installedComponents: [
          { mountingPointId: motorMount.id, componentId: mtr5.id, quantity: 1 },
          { mountingPointId: guardMount.id, componentId: sft1.id, quantity: 1 },
          { mountingPointId: estopMount.id, componentId: sft2.id, quantity: 1 },
        ],
      }),
    });

    const saveData = await saveRes.json();
    if (saveData.success) {
      console.log(`✓ Configuration persisted with ID: ${saveData.configuration.id}`);
      console.log(`  Authoritative Quoted Price: ₹${saveData.pricing.grandTotal.toLocaleString()}`);
      passed++;
    } else {
      console.error("✗ Configuration save failed:", saveData);
    }
  } catch (err: any) {
    console.error("✗ Configuration test failed:", err.message);
  }

  // Test POST /api/quotes
  console.log("\n🧪 Testing RFQ Submission & Digital Quote Number Generation...");
  try {
    const machinesRes = await fetch("http://localhost:3000/api/machines").then((r) => r.json());
    const mx500 = machinesRes.machines.find((m: any) => m.slug === "mx-500");

    const quoteRes = await fetch("http://localhost:3000/api/quotes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        machineId: mx500.id,
        customerName: "Vikram Malhotra",
        companyName: "Zenith Automotive Systems",
        email: "vikram@zenith-auto.com",
        phone: "+91 99887 76655",
        country: "India",
        message: "Automated test quote inquiry",
        totalQuotedPrice: 345000,
        currency: "INR",
      }),
    });

    const quoteData = await quoteRes.json();
    if (quoteData.success && quoteData.quote) {
      console.log(`✓ RFQ registered successfully: ${quoteData.quote.quoteNumber}`);
      passed++;
    } else {
      console.error("✗ RFQ submission failed:", quoteData);
    }
  } catch (err: any) {
    console.error("✗ RFQ test failed:", err.message);
  }

  console.log(`\n🎉 Completed all verification checks: ${passed} / 16 passed successfully!`);
}

runIntegrationChecks();
