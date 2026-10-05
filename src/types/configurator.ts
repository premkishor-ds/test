export interface ComponentCategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  sortOrder: number;
}

export interface ComponentItem {
  id: string;
  partNumber: string;
  sku: string;
  name: string;
  description: string;
  categoryId: string;
  category?: ComponentCategory;
  manufacturer: string;
  price: number;
  currency: string;
  weight: number; // in kg
  dimensions: string; // e.g. "350 x 220 x 240 mm"
  powerRating?: number | null; // in kW
  voltage?: string | null;
  technicalSpecsJson: string; // parsed to Record<string, string>
  modelGlbUrl?: string | null;
  thumbnailUrl?: string | null;
  mountingRequirements?: string | null;
  isActive: boolean;
}

export interface MountingPoint {
  id: string;
  pointId: string;
  machineId: string;
  name: string;
  description?: string | null;
  posX: number;
  posY: number;
  posZ: number;
  rotX: number;
  rotY: number;
  rotZ: number;
  explodedX: number;
  explodedY: number;
  explodedZ: number;
  allowedCategorySlugsJson: string; // JSON array of string slugs
  allowedPartNumbersJson?: string | null; // JSON array of string part numbers
  defaultPartNumber?: string | null;
  maxQuantity: number;
  isOccupied?: boolean;
}

export interface CompatibilityRule {
  id: string;
  machineId?: string | null;
  name: string;
  description?: string | null;
  ruleType: "REQUIRES" | "FORBIDS" | "DIMENSION_CONSTRAINT" | "POWER_CAPACITY" | "ENVIRONMENT";
  triggerJson: string;
  targetJson: string;
  errorMessage: string;
  isActive: boolean;
}

export interface Machine {
  id: string;
  slug: string;
  name: string;
  modelNumber: string;
  description: string;
  category: string;
  basePrice: number;
  currency: string;
  baseWeight: number;
  baseDimensions: string;
  powerRequirements: string;
  modelGlbUrl?: string | null;
  thumbnailUrl?: string | null;
  isActive: boolean;
  mountingPoints?: MountingPoint[];
  compatibilityRules?: CompatibilityRule[];
}

export interface InstalledComponent {
  mountingPointId: string;
  component: ComponentItem;
  quantity: number;
  customSettings?: Record<string, any>;
}

export interface BOMItemRow {
  partNumber: string;
  name: string;
  category: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  currency: string;
  weight: number;
  dimensions: string;
}

export interface ValidationError {
  ruleId?: string;
  code: string;
  message: string;
  mountingPointId?: string;
  partNumber?: string;
  severity: "ERROR" | "WARNING";
}

export interface HistorySnapshot {
  installedComponents: Record<string, InstalledComponent>;
  description: string;
}
