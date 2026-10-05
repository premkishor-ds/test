import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding 3D Industrial Machine Configurator Database...");

  // 1. Clean existing records
  await prisma.quote.deleteMany();
  await prisma.bOMItem.deleteMany();
  await prisma.configurationComponent.deleteMany();
  await prisma.configuration.deleteMany();
  await prisma.mountingPoint.deleteMany();
  await prisma.compatibilityRule.deleteMany();
  await prisma.componentVariant.deleteMany();
  await prisma.price.deleteMany();
  await prisma.component.deleteMany();
  await prisma.componentCategory.deleteMany();
  await prisma.machineVersion.deleteMany();
  await prisma.machine.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.user.deleteMany();

  // 2. Users
  const adminUser = await prisma.user.create({
    data: {
      email: "admin@industrial-vortex.com",
      name: "System Administrator",
      company: "VORTEX Industrial Automation",
      phone: "+91 98765 43210",
      passwordHash: "sha256:admin123", // In a real app hashed with bcrypt
      role: "ADMIN",
    },
  });

  const customerUser = await prisma.user.create({
    data: {
      email: "buyer@globalmanufacturing.com",
      name: "Rajesh Sharma",
      company: "Apex Precision Engineering",
      phone: "+91 98111 22334",
      passwordHash: "sha256:buyer123",
      role: "CUSTOMER",
    },
  });

  console.log("✓ Created Users (Admin & Customer)");

  // 3. Categories
  const catMotors = await prisma.componentCategory.create({
    data: {
      name: "Drive Motors",
      slug: "motors",
      description: "Heavy-duty electric induction motors and variable frequency drive systems.",
      icon: "Zap",
      sortOrder: 1,
    },
  });

  const catConveyors = await prisma.componentCategory.create({
    data: {
      name: "Conveyor Belts & Beds",
      slug: "conveyors",
      description: "Modular PVC, high-tensile fabric, and steel roller conveyor bed assemblies.",
      icon: "Boxes",
      sortOrder: 2,
    },
  });

  const catSensors = await prisma.componentCategory.create({
    data: {
      name: "Sensors & Telemetry",
      slug: "sensors",
      description: "Photoelectric, inductive proximity, and laser inspection telemetry sensors.",
      icon: "Activity",
      sortOrder: 3,
    },
  });

  const catControls = await prisma.componentCategory.create({
    data: {
      name: "Control Cabinets & HMI",
      slug: "controls",
      description: "Industrial PLC automation enclosures, touchscreen HMIs, and power cabinets.",
      icon: "Cpu",
      sortOrder: 4,
    },
  });

  const catSafety = await prisma.componentCategory.create({
    data: {
      name: "Safety & Emergency Systems",
      slug: "safety",
      description: "OSHA-certified interlocking steel cages, light curtains, and emergency stops.",
      icon: "ShieldAlert",
      sortOrder: 5,
    },
  });

  console.log("✓ Created Component Categories");

  // 4. Machine: MX-500
  const machineMX500 = await prisma.machine.create({
    data: {
      slug: "mx-500",
      name: "MX-500 Modular Industrial Conveyor",
      modelNumber: "MX-500-HD",
      description:
        "High-performance modular conveyor system designed for rapid integration into automated assembly, packaging, and logistics lines. Features precision alignment mounting points, heavy-duty extruded aluminum & powder-coated structural steel frame, and scalable motor torque options.",
      category: "Conveyors",
      basePrice: 200000,
      currency: "INR",
      baseWeight: 145,
      baseDimensions: "3200 x 850 x 950 mm",
      powerRequirements: "415V 3-Phase, 50/60Hz, 16A",
      thumbnailUrl: "/assets/machines/mx-500.png",
      isActive: true,
      versions: {
        create: [
          { versionNumber: "v1.0.0", notes: "Initial production release" },
          { versionNumber: "v2.1.0", notes: "Added quick-mount sensor brackets and 10HP power support" },
        ],
      },
    },
  });

  // Machine: RX-900 (Second machine for selection showcase)
  const machineRX900 = await prisma.machine.create({
    data: {
      slug: "rx-900",
      name: "RX-900 Robotic Assembly Workcell",
      modelNumber: "RX-900-6AXIS",
      description:
        "High-speed 6-axis robotic articulation cell with modular tooling mounts, vision inspection mounting, safety light curtains, and integrated workpiece pallet handling.",
      category: "Robotics",
      basePrice: 650000,
      currency: "INR",
      baseWeight: 420,
      baseDimensions: "2400 x 2400 x 2250 mm",
      powerRequirements: "415V 3-Phase, 50Hz, 32A",
      thumbnailUrl: "/assets/machines/rx-900.png",
      isActive: true,
      versions: {
        create: [{ versionNumber: "v1.0.0", notes: "Standard 6-axis cell" }],
      },
    },
  });

  console.log("✓ Created Machines (MX-500, RX-900)");

  // 5. Mounting Points for MX-500
  const mpMotor = await prisma.mountingPoint.create({
    data: {
      pointId: "MOTOR_MOUNT_01",
      machineId: machineMX500.id,
      name: "Primary Drive Axle Mount",
      description: "Direct-drive coupling mount for primary induction or servo motors.",
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
      defaultPartNumber: "MTR-005",
      maxQuantity: 1,
    },
  });

  const mpConveyor = await prisma.mountingPoint.create({
    data: {
      pointId: "CONVEYOR_BED_01",
      machineId: machineMX500.id,
      name: "Main Conveyor Bed Deck",
      description: "Central frame chassis mount for roller deck and belt track.",
      posX: 0,
      posY: 0.78,
      posZ: 0,
      rotX: 0,
      rotY: 0,
      rotZ: 0,
      explodedX: 0,
      explodedY: 0.8,
      explodedZ: 0,
      allowedCategorySlugsJson: JSON.stringify(["conveyors"]),
      allowedPartNumbersJson: JSON.stringify(["CVY-002", "CVY-004", "CVY-006"]),
      defaultPartNumber: "CVY-004",
      maxQuantity: 1,
    },
  });

  const mpSensor1 = await prisma.mountingPoint.create({
    data: {
      pointId: "SENSOR_01",
      machineId: machineMX500.id,
      name: "Infeed Proximity Sensor Mount",
      description: "Front-end optical bracket for pallet infeed detection.",
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
      allowedPartNumbersJson: JSON.stringify(["SEN-001", "SEN-002"]),
      defaultPartNumber: "SEN-001",
      maxQuantity: 1,
    },
  });

  const mpSensor2 = await prisma.mountingPoint.create({
    data: {
      pointId: "SENSOR_02",
      machineId: machineMX500.id,
      name: "Outfeed Optical Telemetry Mount",
      description: "Rear-end optical bracket for part exit counting and quality strobe.",
      posX: 1.15,
      posY: 0.95,
      posZ: 0.42,
      rotX: 0,
      rotY: 0,
      rotZ: 0,
      explodedX: 0.3,
      explodedY: 0.5,
      explodedZ: 0.4,
      allowedCategorySlugsJson: JSON.stringify(["sensors"]),
      allowedPartNumbersJson: JSON.stringify(["SEN-001", "SEN-002"]),
      defaultPartNumber: "SEN-001",
      maxQuantity: 1,
    },
  });

  const mpControl = await prisma.mountingPoint.create({
    data: {
      pointId: "CONTROL_PANEL",
      machineId: machineMX500.id,
      name: "Central HMI / PLC Control Enclosure",
      description: "Ergonomic side frame mounting post for industrial touch HMI and PLC.",
      posX: 0.65,
      posY: 1.15,
      posZ: -0.65,
      rotX: 0,
      rotY: 0,
      rotZ: 0,
      explodedX: 0.4,
      explodedY: 0.2,
      explodedZ: -0.7,
      allowedCategorySlugsJson: JSON.stringify(["controls"]),
      allowedPartNumbersJson: JSON.stringify(["CTL-001", "CTL-002"]),
      defaultPartNumber: "CTL-001",
      maxQuantity: 1,
    },
  });

  const mpGuard = await prisma.mountingPoint.create({
    data: {
      pointId: "SAFETY_GUARD_01",
      machineId: machineMX500.id,
      name: "Drive Chain Shield Enclosure",
      description: "Protective yellow steel mesh cowl shielding the motor drive sprocket.",
      posX: -1.45,
      posY: 0.6,
      posZ: 0.8,
      rotX: 0,
      rotY: 0,
      rotZ: 0,
      explodedX: -0.5,
      explodedY: 0.2,
      explodedZ: 0.6,
      allowedCategorySlugsJson: JSON.stringify(["safety"]),
      allowedPartNumbersJson: JSON.stringify(["SFT-001"]),
      defaultPartNumber: "SFT-001",
      maxQuantity: 1,
    },
  });

  const mpEstop = await prisma.mountingPoint.create({
    data: {
      pointId: "ESTOP_MOUNT_01",
      machineId: machineMX500.id,
      name: "Emergency Stop Push Button Console",
      description: "Quick-access prominent red mushroom e-stop post.",
      posX: 1.35,
      posY: 1.05,
      posZ: -0.45,
      rotX: 0,
      rotY: 0,
      rotZ: 0,
      explodedX: 0.3,
      explodedY: 0.3,
      explodedZ: -0.3,
      allowedCategorySlugsJson: JSON.stringify(["safety"]),
      allowedPartNumbersJson: JSON.stringify(["SFT-002"]),
      defaultPartNumber: "SFT-002",
      maxQuantity: 1,
    },
  });

  console.log("✓ Created 7 Mounting Points for MX-500");

  // 6. The 12 Production-Ready Components
  const componentsData = [
    {
      partNumber: "MTR-002",
      sku: "SKU-MTR-2HP-01",
      name: "2HP High-Efficiency Induction Motor",
      description: "Compact 1.5 kW 3-phase asynchronous motor with thermal protection, rated for 24/7 continuous duty.",
      categoryId: catMotors.id,
      manufacturer: "Siemens MechDrive",
      price: 28000,
      currency: "INR",
      weight: 22,
      dimensions: "310 x 180 x 200 mm",
      powerRating: 1.5,
      voltage: "415V",
      technicalSpecsJson: JSON.stringify({
        "Power Rating": "1.5 kW (2.0 HP)",
        "Operating Speed": "1440 RPM",
        "Enclosure Rating": "IP55 Standard",
        "Frame Size": "IEC 90S",
        "Efficiency": "IE3 Premium 87.5%",
      }),
    },
    {
      partNumber: "MTR-005",
      sku: "SKU-MTR-5HP-02",
      name: "5HP Heavy-Duty Induction Motor",
      description: "Robust 3.7 kW high-starting-torque drive motor for medium to heavy freight conveying lines.",
      categoryId: catMotors.id,
      manufacturer: "ABB Powertrain",
      price: 42000,
      currency: "INR",
      weight: 31,
      dimensions: "380 x 220 x 240 mm",
      powerRating: 3.7,
      voltage: "415V",
      technicalSpecsJson: JSON.stringify({
        "Power Rating": "3.7 kW (5.0 HP)",
        "Operating Speed": "1460 RPM",
        "Enclosure Rating": "IP55 / IP65 capable",
        "Frame Size": "IEC 112M",
        "Efficiency": "IE3 Premium 89.2%",
      }),
    },
    {
      partNumber: "MTR-010",
      sku: "SKU-MTR-10HP-03",
      name: "10HP Ultra-Torque Industrial Motor",
      description: "Ultra heavy-duty 7.5 kW motor delivering maximum conveyor pull torque for heavy pallet and bulk payloads.",
      categoryId: catMotors.id,
      manufacturer: "Baldor-Reliance",
      price: 78000,
      currency: "INR",
      weight: 54,
      dimensions: "460 x 280 x 300 mm",
      powerRating: 7.5,
      voltage: "415V",
      technicalSpecsJson: JSON.stringify({
        "Power Rating": "7.5 kW (10.0 HP)",
        "Operating Speed": "1475 RPM",
        "Enclosure Rating": "IP65 Heavy Duty",
        "Frame Size": "IEC 132M",
        "Efficiency": "IE4 Super Premium 92.1%",
      }),
    },
    {
      partNumber: "CVY-002",
      sku: "SKU-CVY-2M-01",
      name: "2m Modular PVC Conveyor Track",
      description: "2-meter modular food-grade green PVC link belt with integrated crowned aluminum driving pulleys.",
      categoryId: catConveyors.id,
      manufacturer: "Habasit Motion",
      price: 52000,
      currency: "INR",
      weight: 65,
      dimensions: "2000 x 600 x 120 mm",
      technicalSpecsJson: JSON.stringify({
        "Track Length": "2000 mm",
        "Usable Width": "550 mm",
        "Belt Material": "Multi-ply Antistatic PVC",
        "Max Payload": "150 kg",
        "Max Velocity": "1.2 m/s",
      }),
    },
    {
      partNumber: "CVY-004",
      sku: "SKU-CVY-4M-02",
      name: "4m High-Tensile Modular Conveyor Track",
      description: "4-meter heavy-gauge industrial conveyor bed equipped with reinforced polyurethane belt and guide rails.",
      categoryId: catConveyors.id,
      manufacturer: "Habasit Motion",
      price: 85000,
      currency: "INR",
      weight: 115,
      dimensions: "4000 x 600 x 120 mm",
      technicalSpecsJson: JSON.stringify({
        "Track Length": "4000 mm",
        "Usable Width": "550 mm",
        "Belt Material": "Reinforced PU / High Grip",
        "Max Payload": "400 kg",
        "Max Velocity": "1.8 m/s",
      }),
    },
    {
      partNumber: "CVY-006",
      sku: "SKU-CVY-6M-03",
      name: "6m Heavy-Duty Steel Roller Conveyor",
      description: "6-meter extended pallet transport bed with hardened stainless steel motorized rollers for high-throughput lines.",
      categoryId: catConveyors.id,
      manufacturer: "Interroll Heavy",
      price: 135000,
      currency: "INR",
      weight: 195,
      dimensions: "6000 x 800 x 150 mm",
      technicalSpecsJson: JSON.stringify({
        "Track Length": "6000 mm",
        "Usable Width": "750 mm",
        "Belt Material": "Stainless Steel Rollers (50mm)",
        "Max Payload": "950 kg",
        "Max Velocity": "2.2 m/s",
      }),
    },
    {
      partNumber: "SEN-001",
      sku: "SKU-SEN-STD-01",
      name: "Standard Optical Proximity Sensor",
      description: "Diffuse-reflective infrared photoelectric sensor with adjustable 300mm detection range and NPN/PNP output.",
      categoryId: catSensors.id,
      manufacturer: "Omron Industrial",
      price: 5000,
      currency: "INR",
      weight: 0.8,
      dimensions: "85 x 40 x 35 mm",
      technicalSpecsJson: JSON.stringify({
        "Sensing Range": "10 - 300 mm",
        "Output": "PNP Normally Open",
        "Protection": "IP65",
        "Response Time": "1.0 ms",
        "Operating Temp": "-10°C to +55°C",
      }),
    },
    {
      partNumber: "SEN-002",
      sku: "SKU-SEN-IND-02",
      name: "IP67 Heavy-Duty Industrial Telemetry Sensor",
      description: "Ruggedized stainless steel laser time-of-flight distance and part classification telemetry sensor.",
      categoryId: catSensors.id,
      manufacturer: "Sick Sensor Intelligence",
      price: 14500,
      currency: "INR",
      weight: 1.6,
      dimensions: "110 x 50 x 45 mm",
      technicalSpecsJson: JSON.stringify({
        "Sensing Range": "50 - 2000 mm ToF",
        "Output": "IO-Link + 4-20mA Analog",
        "Protection": "IP67 / IP69K Washdown",
        "Response Time": "0.25 ms High Speed",
        "Operating Temp": "-25°C to +70°C",
      }),
    },
    {
      partNumber: "CTL-001",
      sku: "SKU-CTL-STD-01",
      name: "Standard Control Panel with 7\" Touch HMI",
      description: "Wall/post-mount NEMA 12 enclosure containing micro-PLC, Schneider contactors, 24V PSU, and 7-inch color touch screen.",
      categoryId: catControls.id,
      manufacturer: "Rockwell / Allen-Bradley",
      price: 65000,
      currency: "INR",
      weight: 28,
      dimensions: "600 x 400 x 220 mm",
      technicalSpecsJson: JSON.stringify({
        "Display": "7-inch TFT 800x480 Capacitive Touch",
        "PLC Controller": "Micro850 EtherNet/IP",
        "Max Connected Power": "5.5 kW",
        "Enclosure Rating": "IP54 / NEMA 12",
        "Communication": "Modbus TCP, Ethernet",
      }),
    },
    {
      partNumber: "CTL-002",
      sku: "SKU-CTL-IND-02",
      name: "High-Capacity Power Controller with VFD (400V)",
      description: "Full-scale double-door power cabinet integrating 11kW Variable Frequency Drive (VFD), harmonic filter, and 10\" HMI.",
      categoryId: catControls.id,
      manufacturer: "Rockwell / Allen-Bradley",
      price: 118000,
      currency: "INR",
      weight: 45,
      dimensions: "800 x 600 x 300 mm",
      technicalSpecsJson: JSON.stringify({
        "Display": "10.1-inch Color Touch HMI",
        "VFD Inverter": "11 kW Sensorless Vector Drive",
        "Max Connected Power": "15 kW Continuous",
        "Enclosure Rating": "IP65 Air-Conditioned",
        "Communication": "ProfiNet, EtherNet/IP, OPC-UA",
      }),
    },
    {
      partNumber: "SFT-001",
      sku: "SKU-SFT-GRD-01",
      name: "Reinforced Steel Mesh Safety Guard",
      description: "Heavy yellow powder-coated 2mm steel wire mesh cage with tool-less safety latch for drive chain protection.",
      categoryId: catSafety.id,
      manufacturer: "Troax Machine Guarding",
      price: 18500,
      currency: "INR",
      weight: 16,
      dimensions: "650 x 450 x 350 mm",
      technicalSpecsJson: JSON.stringify({
        "Material": "Carbon Steel 25x25mm Wire Mesh",
        "Finish": "Safety Yellow RAL 1018 Epoxy Powder",
        "Safety Standard": "ISO 14120 / OSHA 1910",
        "Interlock Switch": "Magnetic Safety Contact Included",
      }),
    },
    {
      partNumber: "SFT-002",
      sku: "SKU-SFT-ESTOP-02",
      name: "Emergency Stop Mushroom Console",
      description: "Fail-safe twist-to-reset 40mm red mushroom head emergency button mounted in high-visibility yellow die-cast housing.",
      categoryId: catSafety.id,
      manufacturer: "Eaton Automation",
      price: 9500,
      currency: "INR",
      weight: 2.2,
      dimensions: "160 x 120 x 140 mm",
      technicalSpecsJson: JSON.stringify({
        "Button Diameter": "40 mm Mushroom Head",
        "Action Type": "Push-to-lock, Twist-to-release",
        "Contact Blocks": "2x NC Positive Break (ISO 13850)",
        "IP Rating": "IP66 Oil-Tight / Water-Tight",
        "Safety Category": "SIL 3 / Ple Cat 4 Compliant",
      }),
    },
  ];

  for (const c of componentsData) {
    await prisma.component.create({
      data: c,
    });
  }

  console.log("✓ Created 12 Production-Ready Components");

  // 7. Realistic Compatibility Rules
  await prisma.compatibilityRule.create({
    data: {
      machineId: machineMX500.id,
      name: "10HP Motor Requires >= 4m Conveyor Bed",
      description:
        "The high-torque 10HP motor cannot be mounted on short 2m conveyor tracks due to torsional chassis resonance.",
      ruleType: "DIMENSION_CONSTRAINT",
      triggerJson: JSON.stringify({ partNumber: "MTR-010" }),
      targetJson: JSON.stringify({
        requiredPartNumbers: ["CVY-004", "CVY-006"],
        minimumLengthMeters: 4,
      }),
      errorMessage:
        "The 10HP Ultra-Torque Motor (MTR-010) generates high torsional pull and requires at least a 4m (CVY-004) or 6m (CVY-006) conveyor frame for stability.",
      isActive: true,
    },
  });

  await prisma.compatibilityRule.create({
    data: {
      machineId: machineMX500.id,
      name: "10HP Motor Requires High-Capacity VFD Controller",
      description: "Standard 7-inch control panel cannot handle 10HP amperage draw.",
      ruleType: "POWER_CAPACITY",
      triggerJson: JSON.stringify({ partNumber: "MTR-010" }),
      targetJson: JSON.stringify({
        requiredPartNumbers: ["CTL-002"],
      }),
      errorMessage:
        "The 10HP motor (7.5 kW) exceeds the capacity of the Standard Control Panel (CTL-001). Please equip the High-Capacity Variable Frequency Power Controller (CTL-002).",
      isActive: true,
    },
  });

  await prisma.compatibilityRule.create({
    data: {
      machineId: machineMX500.id,
      name: "Motors 5HP and Above Require Emergency Stop Console",
      description: "OSHA & CE safety compliance requires emergency stop mushroom for high-power industrial motors.",
      ruleType: "REQUIRES",
      triggerJson: JSON.stringify({
        partNumbers: ["MTR-005", "MTR-010"],
        minPowerHP: 5,
      }),
      targetJson: JSON.stringify({
        requiredPartNumbers: ["SFT-002"],
      }),
      errorMessage:
        "OSHA 1910 & ISO 13850 Safety Regulation: Machine drives with 5HP or greater require a dedicated Emergency Stop Console (SFT-002).",
      isActive: true,
    },
  });

  await prisma.compatibilityRule.create({
    data: {
      machineId: machineMX500.id,
      name: "Drive Chain Guard is Mandatory for Motor Operation",
      description: "Exposed motor coupling requires physical chain mesh guard.",
      ruleType: "REQUIRES",
      triggerJson: JSON.stringify({
        categorySlug: "motors",
      }),
      targetJson: JSON.stringify({
        requiredPartNumbers: ["SFT-001"],
      }),
      errorMessage:
        "Safety Guard (SFT-001) is required to shield personnel from rotating motor shafts and drive pulleys.",
      isActive: true,
    },
  });

  console.log("✓ Created 4 Compatibility Rules");

  // 8. Create a default saved configuration for demo
  const mtr5 = await prisma.component.findUniqueOrThrow({ where: { partNumber: "MTR-005" } });
  const cvy4 = await prisma.component.findUniqueOrThrow({ where: { partNumber: "CVY-004" } });
  const sen1 = await prisma.component.findUniqueOrThrow({ where: { partNumber: "SEN-001" } });
  const ctl1 = await prisma.component.findUniqueOrThrow({ where: { partNumber: "CTL-001" } });
  const sft1 = await prisma.component.findUniqueOrThrow({ where: { partNumber: "SFT-001" } });
  const sft2 = await prisma.component.findUniqueOrThrow({ where: { partNumber: "SFT-002" } });

  const demoConfig = await prisma.configuration.create({
    data: {
      name: "MX-500 Standard Packaging Line",
      machineId: machineMX500.id,
      userId: customerUser.id,
      shareToken: "cfg-mx500-demo-packline",
      totalPrice: 200000 + 42000 + 85000 + 5000 + 5000 + 65000 + 18500 + 9500, // 430,000 INR
      currency: "INR",
      totalWeight: 145 + 31 + 115 + 0.8 + 0.8 + 28 + 16 + 2.2, // 338.8 kg
      totalPower: 3.7 + 0.5,
      status: "SAVED",
      components: {
        create: [
          { mountingPointId: mpMotor.id, componentId: mtr5.id, quantity: 1, unitPrice: mtr5.price, totalPrice: mtr5.price },
          { mountingPointId: mpConveyor.id, componentId: cvy4.id, quantity: 1, unitPrice: cvy4.price, totalPrice: cvy4.price },
          { mountingPointId: mpSensor1.id, componentId: sen1.id, quantity: 1, unitPrice: sen1.price, totalPrice: sen1.price },
          { mountingPointId: mpSensor2.id, componentId: sen1.id, quantity: 1, unitPrice: sen1.price, totalPrice: sen1.price },
          { mountingPointId: mpControl.id, componentId: ctl1.id, quantity: 1, unitPrice: ctl1.price, totalPrice: ctl1.price },
          { mountingPointId: mpGuard.id, componentId: sft1.id, quantity: 1, unitPrice: sft1.price, totalPrice: sft1.price },
          { mountingPointId: mpEstop.id, componentId: sft2.id, quantity: 1, unitPrice: sft2.price, totalPrice: sft2.price },
        ],
      },
    },
  });

  // Create Quote for Demo Config
  await prisma.quote.create({
    data: {
      quoteNumber: "RFQ-2026-0042",
      configurationId: demoConfig.id,
      machineId: machineMX500.id,
      userId: customerUser.id,
      customerName: "Rajesh Sharma",
      companyName: "Apex Precision Engineering",
      email: "buyer@globalmanufacturing.com",
      phone: "+91 98111 22334",
      country: "India",
      message: "Please include express delivery and on-site assembly quotation for 3 units of this configuration.",
      status: "SUBMITTED",
      totalQuotedPrice: 430000,
      currency: "INR",
    },
  });

  console.log("✓ Created Initial Demo Configuration and RFQ-2026-0042");
  console.log("🚀 Database Seed Completed Successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
