import {
  Machine,
  MountingPoint,
  ComponentItem,
  InstalledComponent,
  CompatibilityRule,
  ValidationError,
} from "@/types/configurator";

export interface ValidationContext {
  environment?: "STANDARD" | "HAZARDOUS";
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

/**
 * Validates whether a specific component can be dropped/mounted on a specific mounting point
 */
export function checkMountCompatibility(
  mountingPoint: MountingPoint,
  component: ComponentItem,
  currentInstalled: Record<string, InstalledComponent>,
  rules: CompatibilityRule[] = []
): { allowed: boolean; reason?: string } {
  // 1. Check Category Compatibility
  let allowedCategories: string[] = [];
  try {
    allowedCategories = JSON.parse(mountingPoint.allowedCategorySlugsJson || "[]");
  } catch {
    allowedCategories = [];
  }

  const compCategorySlug = component.category?.slug || "";
  if (
    allowedCategories.length > 0 &&
    compCategorySlug &&
    !allowedCategories.includes(compCategorySlug)
  ) {
    return {
      allowed: false,
      reason: `Mounting point '${mountingPoint.name}' only accepts categories: ${allowedCategories.join(", ")}. Received: ${compCategorySlug}.`,
    };
  }

  // 2. Check Allowed Part Numbers
  if (mountingPoint.allowedPartNumbersJson) {
    try {
      const allowedParts: string[] = JSON.parse(mountingPoint.allowedPartNumbersJson);
      if (allowedParts.length > 0 && !allowedParts.includes(component.partNumber)) {
        return {
          allowed: false,
          reason: `Part ${component.partNumber} is mechanically incompatible with ${mountingPoint.pointId}. Compatible parts: ${allowedParts.join(", ")}.`,
        };
      }
    } catch {
      // Ignored
    }
  }

  // 3. Check specific rules when component is placed
  // Simulate replacing or adding this component
  const simulated = { ...currentInstalled };
  simulated[mountingPoint.id] = {
    mountingPointId: mountingPoint.id,
    component,
    quantity: 1,
  };

  const simulationResult = evaluateConfigurationRules(simulated, rules);
  const criticalErrors = simulationResult.errors.filter(
    (e) => e.mountingPointId === mountingPoint.id || e.partNumber === component.partNumber
  );

  if (criticalErrors.length > 0) {
    return {
      allowed: false,
      reason: criticalErrors[0].message,
    };
  }

  return { allowed: true };
}

/**
 * Full configuration validation against all data-driven business and engineering rules
 */
export function evaluateConfigurationRules(
  installed: Record<string, InstalledComponent>,
  rules: CompatibilityRule[] = [],
  context: ValidationContext = { environment: "STANDARD" }
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  const installedList = Object.values(installed);
  const installedParts = installedList.map((i) => i.component.partNumber);
  const installedCategories = installedList.map((i) => i.component.category?.slug || "");

  // Rule 1: 10HP Motor requires at least 4m conveyor (CVY-004 or CVY-006)
  const has10HPMotor = installedParts.includes("MTR-010");
  const has2mConveyor = installedParts.includes("CVY-002");
  const has4mOr6mConveyor = installedParts.includes("CVY-004") || installedParts.includes("CVY-006");

  if (has10HPMotor && has2mConveyor) {
    errors.push({
      code: "DIMENSION_INCOMPATIBLE",
      partNumber: "MTR-010",
      message:
        "10HP Ultra-Torque Motor cannot be mounted on 2m Conveyor (CVY-002). High starting torque causes structural frame distortion. Upgrade to 4m or 6m conveyor bed.",
      severity: "ERROR",
    });
  }

  // Rule 2: 10HP Motor requires High-Capacity Power Controller (CTL-002)
  const hasStandardControl = installedParts.includes("CTL-001");
  const hasHighCapacityControl = installedParts.includes("CTL-002");

  if (has10HPMotor && hasStandardControl) {
    errors.push({
      code: "POWER_INCOMPATIBLE",
      partNumber: "CTL-001",
      message:
        "10HP motor power draw (7.5 kW) exceeds Standard Control Panel (5.5 kW capacity). Must equip High-Capacity Power Controller (CTL-002).",
      severity: "ERROR",
    });
  }

  // Rule 3: 5HP+ Motor requires Emergency Stop Console (SFT-002)
  const has5HPOr10HP = installedParts.includes("MTR-005") || installedParts.includes("MTR-010");
  const hasEStop = installedParts.includes("SFT-002");

  if (has5HPOr10HP && !hasEStop) {
    errors.push({
      code: "SAFETY_MANDATORY_ESTOP",
      partNumber: "SFT-002",
      message:
        "OSHA / ISO 13850 Safety Violation: Machines with 5HP or greater drives strictly require a prominent Emergency Stop Console (SFT-002).",
      severity: "ERROR",
    });
  }

  // Rule 4: Motor requires Drive Chain Mesh Guard (SFT-001)
  const hasMotor = installedCategories.includes("motors");
  const hasChainGuard = installedParts.includes("SFT-001");

  if (hasMotor && !hasChainGuard) {
    warnings.push({
      code: "SAFETY_GUARD_MISSING",
      partNumber: "SFT-001",
      message:
        "Recommended Safety: Rotating motor drive axle should be shielded with the Reinforced Steel Mesh Safety Guard (SFT-001).",
      severity: "WARNING",
    });
  }

  // Rule 5: Hazardous Environment requires IP67 Sensors
  if (context.environment === "HAZARDOUS") {
    const hasStdSensor = installedParts.includes("SEN-001");
    if (hasStdSensor) {
      errors.push({
        code: "ENVIRONMENT_INCOMPATIBLE",
        partNumber: "SEN-001",
        message:
          "Hazardous washdown environment selected: Standard Photoelectric Sensor (SEN-001) is not rated for liquids/dust. Upgrade to IP67 Heavy-Duty Sensor (SEN-002).",
        severity: "ERROR",
      });
    }
  }

  // Process any custom database rules
  for (const rule of rules) {
    if (!rule.isActive) continue;
    try {
      const trigger = JSON.parse(rule.triggerJson || "{}");
      const target = JSON.parse(rule.targetJson || "{}");

      // Check if trigger matches
      let triggerMatches = false;
      if (trigger.partNumber && installedParts.includes(trigger.partNumber)) {
        triggerMatches = true;
      }
      if (trigger.categorySlug && installedCategories.includes(trigger.categorySlug)) {
        triggerMatches = true;
      }

      if (triggerMatches) {
        if (target.requiredPartNumbers && Array.isArray(target.requiredPartNumbers)) {
          const hasAtLeastOne = target.requiredPartNumbers.some((p: string) =>
            installedParts.includes(p)
          );
          if (!hasAtLeastOne) {
            // Check if not already covered by our core checks
            const alreadyLogged = errors.some((e) => e.message === rule.errorMessage);
            if (!alreadyLogged) {
              errors.push({
                ruleId: rule.id,
                code: rule.ruleType,
                message: rule.errorMessage,
                severity: "ERROR",
              });
            }
          }
        }
      }
    } catch {
      // Ignore malformed rule JSON
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
