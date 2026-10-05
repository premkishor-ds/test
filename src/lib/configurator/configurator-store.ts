import { create } from "zustand";
import {
  Machine,
  MountingPoint,
  ComponentItem,
  ComponentCategory,
  InstalledComponent,
  CompatibilityRule,
  HistorySnapshot,
  ValidationError,
} from "@/types/configurator";
import {
  evaluateConfigurationRules,
  checkMountCompatibility,
  ValidationResult,
} from "./rules-engine";
import {
  calculatePricingAndBOM,
  PricingSummary,
} from "./pricing-bom-engine";

export type DragStatus =
  | "IDLE"
  | "HOVER"
  | "DRAGGING"
  | "VALID_DROP"
  | "INVALID_DROP"
  | "SNAPPING"
  | "INSTALLED"
  | "REPLACING"
  | "REMOVING";

export interface ConfiguratorState {
  // Data
  machine: Machine | null;
  mountingPoints: MountingPoint[];
  componentsLibrary: ComponentItem[];
  categories: ComponentCategory[];
  rules: CompatibilityRule[];
  configurationName: string;
  installedComponents: Record<string, InstalledComponent>;

  // Drag & Pick
  draggingComponent: ComponentItem | null;
  dragHoverMountingPointId: string | null;
  dragStatus: DragStatus;
  dragValidationReason: string | null;

  // Selection
  selectedMountingPointId: string | null;
  selectedComponentId: string | null;

  // Environment & Currency
  environment: "STANDARD" | "HAZARDOUS";
  currency: "INR" | "USD";

  // 3D Controls
  exploded: boolean;
  explodedProgress: number; // 0 to 1
  assemblyAnimationPlaying: boolean;
  assemblyStep: number;
  showComponents: boolean;
  wireframeMode: boolean;
  cameraPreset: "DEFAULT" | "TOP" | "FRONT" | "SIDE" | "ISOMETRIC";
  cameraFitTrigger: number;
  cameraResetTrigger: number;

  // UI state
  isBOMDrawerOpen: boolean;
  lastInstalledPointId: string | null; // For pulse / animation triggering

  // History for Undo/Redo
  history: HistorySnapshot[];
  historyIndex: number;

  // Dynamic computed
  validation: ValidationResult;
  pricingSummary: PricingSummary;

  // CAD Workspace Tools & Modes
  transformMode: "select" | "translate" | "rotate" | "measure";
  activeLeftTab: "CATALOG" | "ASSEMBLY_TREE";
  hiddenMountingPointIds: string[];
  isolatedMountingPointId: string | null;
  snapDistance: number;
  isSnappingActive: boolean;

  // Free 3D Dragging & Raycasting State
  dragPosition3D: [number, number, number] | null;
  dragRotationY: number;

  // Actions
  initialize: (
    machine: Machine,
    mountingPoints: MountingPoint[],
    components: ComponentItem[],
    rules: CompatibilityRule[],
    categories: ComponentCategory[],
    initialInstalled?: Record<string, InstalledComponent>,
    configName?: string,
    startFromScratch?: boolean
  ) => void;

  setDraggingComponent: (component: ComponentItem | null) => void;
  setDragHover: (pointId: string | null) => void;
  setDragPosition3D: (pos: [number, number, number] | null) => void;
  rotateDraggingComponent: (angleRad: number) => void;
  installComponent: (mountingPointId: string, component: ComponentItem, customSettings?: Record<string, any>) => boolean;
  removeComponent: (mountingPointId: string) => void;
  selectMountingPoint: (pointId: string | null) => void;
  selectComponent: (componentId: string | null) => void;
  setEnvironment: (env: "STANDARD" | "HAZARDOUS") => void;
  setCurrency: (curr: "INR" | "USD") => void;
  setConfigurationName: (name: string) => void;

  // CAD Modes & Tree Actions
  setTransformMode: (mode: "select" | "translate" | "rotate" | "measure") => void;
  setActiveLeftTab: (tab: "CATALOG" | "ASSEMBLY_TREE") => void;
  toggleComponentVisibility: (mountingPointId: string) => void;
  setIsolatedComponent: (mountingPointId: string | null) => void;
  toggleSnappingActive: (force?: boolean) => void;
  setSnapDistance: (dist: number) => void;
  updateComponentCustomSettings: (mountingPointId: string, settings: Record<string, any>) => void;

  // 3D Actions
  toggleExploded: (force?: boolean) => void;
  setExplodedProgress: (val: number) => void;
  startAssemblyAnimation: () => void;
  stopAssemblyAnimation: () => void;
  setCameraPreset: (preset: "DEFAULT" | "TOP" | "FRONT" | "SIDE" | "ISOMETRIC") => void;
  triggerFitCamera: () => void;
  triggerResetCamera: () => void;
  toggleWireframe: () => void;
  toggleShowComponents: () => void;
  toggleBOMDrawer: (force?: boolean) => void;

  // History & Baseline Actions
  undo: () => void;
  redo: () => void;
  resetConfiguration: () => void;
  loadRecommendedBaseline: () => void;
  loadSavedConfiguration: (installed: Record<string, InstalledComponent>, name?: string) => void;

  // 1-Click Auto-Fix Actions
  autoFixIssue: (issue: ValidationError) => boolean;
  autoFixAllIssues: () => { fixedCount: number; remainingCount: number };
}

const emptyPricing: PricingSummary = {
  currency: "INR",
  baseMachinePrice: 0,
  componentsSubtotal: 0,
  installationAndCalibrationCost: 0,
  subtotal: 0,
  taxAmount: 0,
  grandTotal: 0,
  totalWeightKg: 0,
  totalPowerKW: 0,
  dimensionsSummary: "-",
  componentCount: 0,
  bomItems: [],
};

const emptyValidation: ValidationResult = {
  valid: true,
  errors: [],
  warnings: [],
};

export const useConfiguratorStore = create<ConfiguratorState>((set, get) => ({
  machine: null,
  mountingPoints: [],
  componentsLibrary: [],
  categories: [],
  rules: [],
  configurationName: "MX-500 Custom Configuration",
  installedComponents: {},

  draggingComponent: null,
  dragHoverMountingPointId: null,
  dragStatus: "IDLE",
  dragValidationReason: null,

  selectedMountingPointId: null,
  selectedComponentId: null,

  environment: "STANDARD",
  currency: "INR",

  exploded: false,
  explodedProgress: 0,
  assemblyAnimationPlaying: false,
  assemblyStep: 0,
  showComponents: true,
  wireframeMode: false,
  cameraPreset: "DEFAULT",
  cameraFitTrigger: 0,
  cameraResetTrigger: 0,

  isBOMDrawerOpen: false,
  lastInstalledPointId: null,

  history: [],
  historyIndex: -1,

  validation: emptyValidation,
  pricingSummary: emptyPricing,

  // CAD Workspace Tools & Modes
  transformMode: "select",
  activeLeftTab: "CATALOG",
  hiddenMountingPointIds: [],
  isolatedMountingPointId: null,
  snapDistance: 0.75,
  isSnappingActive: true,

  // Free 3D Dragging & Raycasting State
  dragPosition3D: null,
  dragRotationY: 0,

  initialize: (
    machine,
    mountingPoints,
    components,
    rules,
    categories,
    initialInstalled = {},
    configName = "Custom Configuration",
    startFromScratch = false
  ) => {
    // If startFromScratch is false and no initial installed provided, auto-install default components
    const finalInstalled: Record<string, InstalledComponent> = { ...initialInstalled };

    if (!startFromScratch && Object.keys(finalInstalled).length === 0) {
      for (const mp of mountingPoints) {
        if (mp.defaultPartNumber) {
          const comp = components.find((c) => c.partNumber === mp.defaultPartNumber);
          if (comp) {
            finalInstalled[mp.id] = {
              mountingPointId: mp.id,
              component: comp,
              quantity: 1,
            };
          }
        }
      }
    }

    const validation = evaluateConfigurationRules(finalInstalled, rules, {
      environment: "STANDARD",
    });
    const pricingSummary = calculatePricingAndBOM(machine, finalInstalled, "INR");

    const initialSnapshot: HistorySnapshot = {
      installedComponents: finalInstalled,
      description: startFromScratch
        ? "Initial Bare Chassis (Configured from Scratch)"
        : "Initial Recommended Baseline Configuration",
    };

    set({
      machine,
      mountingPoints,
      componentsLibrary: components,
      rules,
      categories,
      configurationName: configName,
      installedComponents: finalInstalled,
      history: [initialSnapshot],
      historyIndex: 0,
      validation,
      pricingSummary,
      selectedMountingPointId: mountingPoints[0]?.id || null,
      selectedComponentId: finalInstalled[mountingPoints[0]?.id]?.component.id || null,
    });
  },

  setDraggingComponent: (component) => {
    set({
      draggingComponent: component,
      dragStatus: component ? "DRAGGING" : "IDLE",
      dragHoverMountingPointId: null,
      dragValidationReason: null,
      dragPosition3D: null,
      dragRotationY: 0,
    });
  },

  setDragPosition3D: (pos) => {
    set({ dragPosition3D: pos });
  },

  rotateDraggingComponent: (angleRad) => {
    set((s) => ({ dragRotationY: s.dragRotationY + angleRad }));
  },

  setTransformMode: (mode) => {
    set({ transformMode: mode });
  },

  setActiveLeftTab: (tab) => {
    set({ activeLeftTab: tab });
  },

  toggleComponentVisibility: (mountingPointId) => {
    set((s) => {
      const isHidden = s.hiddenMountingPointIds.includes(mountingPointId);
      return {
        hiddenMountingPointIds: isHidden
          ? s.hiddenMountingPointIds.filter((id) => id !== mountingPointId)
          : [...s.hiddenMountingPointIds, mountingPointId],
      };
    });
  },

  setIsolatedComponent: (mountingPointId) => {
    set({ isolatedMountingPointId: mountingPointId });
  },

  toggleSnappingActive: (force) => {
    set((s) => ({
      isSnappingActive: force !== undefined ? force : !s.isSnappingActive,
    }));
  },

  setSnapDistance: (dist) => {
    set({ snapDistance: dist });
  },

  updateComponentCustomSettings: (mountingPointId, settings) => {
    const state = get();
    const installed = state.installedComponents[mountingPointId];
    if (!installed || !state.machine) return;

    const mergedSettings = { ...installed.customSettings, ...settings };
    const updatedInstalled: Record<string, InstalledComponent> = {
      ...state.installedComponents,
      [mountingPointId]: {
        ...installed,
        customSettings: mergedSettings,
      },
    };

    const validation = evaluateConfigurationRules(updatedInstalled, state.rules, {
      environment: state.environment,
    });
    const pricingSummary = calculatePricingAndBOM(state.machine, updatedInstalled, state.currency);

    const newHistory = state.history.slice(0, state.historyIndex + 1);
    newHistory.push({
      installedComponents: updatedInstalled,
      description: `Parametric tweak on ${installed.component.name}`,
    });

    set({
      installedComponents: updatedInstalled,
      validation,
      pricingSummary,
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  setDragHover: (pointId) => {
    const state = get();
    if (!pointId) {
      set({
        dragHoverMountingPointId: null,
        dragStatus: state.draggingComponent ? "DRAGGING" : "IDLE",
        dragValidationReason: null,
      });
      return;
    }

    const mp = state.mountingPoints.find((p) => p.id === pointId || p.pointId === pointId);
    if (!mp) return;

    if (state.draggingComponent) {
      const compCheck = checkMountCompatibility(
        mp,
        state.draggingComponent,
        state.installedComponents,
        state.rules
      );

      set({
        dragHoverMountingPointId: mp.id,
        dragStatus: compCheck.allowed ? "VALID_DROP" : "INVALID_DROP",
        dragValidationReason: compCheck.reason || null,
      });
    } else {
      set({
        dragHoverMountingPointId: mp.id,
        dragStatus: "HOVER",
        dragValidationReason: null,
      });
    }
  },

  installComponent: (mountingPointId, component, customSettings) => {
    const state = get();
    const mp = state.mountingPoints.find(
      (p) => p.id === mountingPointId || p.pointId === mountingPointId
    );
    if (!mp || !state.machine) return false;

    // Check compatibility before install
    const compCheck = checkMountCompatibility(
      mp,
      component,
      state.installedComponents,
      state.rules
    );

    if (!compCheck.allowed) {
      set({
        dragStatus: "INVALID_DROP",
        dragValidationReason: compCheck.reason || "Component rejected by compatibility engine.",
      });
      return false;
    }

    const isReplacing = !!state.installedComponents[mp.id];
    const newInstalled: Record<string, InstalledComponent> = {
      ...state.installedComponents,
      [mp.id]: {
        mountingPointId: mp.id,
        component,
        quantity: 1,
        customSettings: customSettings || state.installedComponents[mp.id]?.customSettings,
      },
    };

    const validation = evaluateConfigurationRules(newInstalled, state.rules, {
      environment: state.environment,
    });
    const pricingSummary = calculatePricingAndBOM(state.machine, newInstalled, state.currency);

    // Push snapshot to history
    const newHistory = state.history.slice(0, state.historyIndex + 1);
    newHistory.push({
      installedComponents: newInstalled,
      description: isReplacing
        ? `Replaced ${state.installedComponents[mp.id].component.name} with ${component.name}`
        : `Installed ${component.name} at ${mp.name}`,
    });

    set({
      installedComponents: newInstalled,
      draggingComponent: null,
      dragHoverMountingPointId: null,
      dragStatus: isReplacing ? "REPLACING" : "INSTALLED",
      dragValidationReason: null,
      selectedMountingPointId: mp.id,
      selectedComponentId: component.id,
      lastInstalledPointId: mp.id,
      validation,
      pricingSummary,
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });

    setTimeout(() => {
      set({ dragStatus: "IDLE", lastInstalledPointId: null });
    }, 1500);

    return true;
  },

  removeComponent: (mountingPointId) => {
    const state = get();
    if (!state.machine || !state.installedComponents[mountingPointId]) return;

    const removedName = state.installedComponents[mountingPointId].component.name;
    const newInstalled = { ...state.installedComponents };
    delete newInstalled[mountingPointId];

    const validation = evaluateConfigurationRules(newInstalled, state.rules, {
      environment: state.environment,
    });
    const pricingSummary = calculatePricingAndBOM(state.machine, newInstalled, state.currency);

    const newHistory = state.history.slice(0, state.historyIndex + 1);
    newHistory.push({
      installedComponents: newInstalled,
      description: `Removed ${removedName}`,
    });

    set({
      installedComponents: newInstalled,
      dragStatus: "REMOVING",
      selectedMountingPointId: null,
      selectedComponentId: null,
      validation,
      pricingSummary,
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });

    setTimeout(() => {
      set({ dragStatus: "IDLE" });
    }, 1000);
  },

  selectMountingPoint: (pointId) => {
    const state = get();
    if (!pointId) {
      set({ selectedMountingPointId: null, selectedComponentId: null });
      return;
    }
    const mp = state.mountingPoints.find((p) => p.id === pointId || p.pointId === pointId);
    const installed = mp ? state.installedComponents[mp.id] : null;
    set({
      selectedMountingPointId: mp?.id || null,
      selectedComponentId: installed?.component.id || null,
    });
  },

  selectComponent: (componentId) => {
    set({ selectedComponentId: componentId });
  },

  setEnvironment: (env) => {
    const state = get();
    if (!state.machine) return;
    const validation = evaluateConfigurationRules(state.installedComponents, state.rules, {
      environment: env,
    });
    set({ environment: env, validation });
  },

  setCurrency: (curr) => {
    const state = get();
    if (!state.machine) return;
    const pricingSummary = calculatePricingAndBOM(state.machine, state.installedComponents, curr);
    set({ currency: curr, pricingSummary });
  },

  setConfigurationName: (name) => {
    set({ configurationName: name });
  },

  toggleExploded: (force) => {
    const current = get().exploded;
    const nextVal = force !== undefined ? force : !current;
    set({
      exploded: nextVal,
      explodedProgress: nextVal ? 1 : 0,
      assemblyAnimationPlaying: false,
    });
  },

  setExplodedProgress: (val) => {
    set({
      explodedProgress: Math.max(0, Math.min(1, val)),
      exploded: val > 0,
      assemblyAnimationPlaying: false,
    });
  },

  startAssemblyAnimation: () => {
    set({
      assemblyAnimationPlaying: true,
      assemblyStep: 0,
      exploded: false,
      explodedProgress: 0,
    });
  },

  stopAssemblyAnimation: () => {
    set({ assemblyAnimationPlaying: false });
  },

  setCameraPreset: (preset) => {
    set({ cameraPreset: preset });
  },

  triggerFitCamera: () => {
    set((s) => ({ cameraFitTrigger: s.cameraFitTrigger + 1 }));
  },

  triggerResetCamera: () => {
    set((s) => ({
      cameraResetTrigger: s.cameraResetTrigger + 1,
      cameraPreset: "DEFAULT",
    }));
  },

  toggleWireframe: () => {
    set((s) => ({ wireframeMode: !s.wireframeMode }));
  },

  toggleShowComponents: () => {
    set((s) => ({ showComponents: !s.showComponents }));
  },

  toggleBOMDrawer: (force) => {
    set((s) => ({ isBOMDrawerOpen: force !== undefined ? force : !s.isBOMDrawerOpen }));
  },

  undo: () => {
    const state = get();
    if (state.historyIndex <= 0 || !state.machine) return;
    const prevIndex = state.historyIndex - 1;
    const snapshot = state.history[prevIndex];

    const validation = evaluateConfigurationRules(snapshot.installedComponents, state.rules, {
      environment: state.environment,
    });
    const pricingSummary = calculatePricingAndBOM(
      state.machine,
      snapshot.installedComponents,
      state.currency
    );

    set({
      installedComponents: snapshot.installedComponents,
      historyIndex: prevIndex,
      validation,
      pricingSummary,
      selectedMountingPointId: null,
      selectedComponentId: null,
    });
  },

  redo: () => {
    const state = get();
    if (state.historyIndex >= state.history.length - 1 || !state.machine) return;
    const nextIndex = state.historyIndex + 1;
    const snapshot = state.history[nextIndex];

    const validation = evaluateConfigurationRules(snapshot.installedComponents, state.rules, {
      environment: state.environment,
    });
    const pricingSummary = calculatePricingAndBOM(
      state.machine,
      snapshot.installedComponents,
      state.currency
    );

    set({
      installedComponents: snapshot.installedComponents,
      historyIndex: nextIndex,
      validation,
      pricingSummary,
      selectedMountingPointId: null,
      selectedComponentId: null,
    });
  },

  resetConfiguration: () => {
    const state = get();
    if (!state.machine) return;
    const emptyInstalled: Record<string, InstalledComponent> = {};

    const validation = evaluateConfigurationRules(emptyInstalled, state.rules, {
      environment: state.environment,
    });
    const pricingSummary = calculatePricingAndBOM(state.machine, emptyInstalled, state.currency);

    const resetSnapshot: HistorySnapshot = {
      installedComponents: emptyInstalled,
      description: "Reset to Bare Machine Chassis",
    };

    set({
      installedComponents: emptyInstalled,
      history: [...state.history.slice(0, state.historyIndex + 1), resetSnapshot],
      historyIndex: state.historyIndex + 1,
      validation,
      pricingSummary,
      selectedMountingPointId: null,
      selectedComponentId: null,
      exploded: false,
      explodedProgress: 0,
      assemblyAnimationPlaying: false,
    });
  },

  loadRecommendedBaseline: () => {
    const state = get();
    if (!state.machine) return;

    const baselineInstalled: Record<string, InstalledComponent> = {};
    for (const mp of state.mountingPoints) {
      if (mp.defaultPartNumber) {
        const comp = state.componentsLibrary.find((c) => c.partNumber === mp.defaultPartNumber);
        if (comp) {
          baselineInstalled[mp.id] = {
            mountingPointId: mp.id,
            component: comp,
            quantity: 1,
          };
        }
      }
    }

    const validation = evaluateConfigurationRules(baselineInstalled, state.rules, {
      environment: state.environment,
    });
    const pricingSummary = calculatePricingAndBOM(state.machine, baselineInstalled, state.currency);

    const snapshot: HistorySnapshot = {
      installedComponents: baselineInstalled,
      description: "Loaded Factory Recommended Baseline",
    };

    set({
      installedComponents: baselineInstalled,
      history: [...state.history.slice(0, state.historyIndex + 1), snapshot],
      historyIndex: state.historyIndex + 1,
      validation,
      pricingSummary,
      selectedMountingPointId: state.mountingPoints[0]?.id || null,
      selectedComponentId: baselineInstalled[state.mountingPoints[0]?.id]?.component.id || null,
    });
  },

  loadSavedConfiguration: (installed, name) => {
    const state = get();
    if (!state.machine) return;

    const validation = evaluateConfigurationRules(installed, state.rules, {
      environment: state.environment,
    });
    const pricingSummary = calculatePricingAndBOM(state.machine, installed, state.currency);

    const snapshot: HistorySnapshot = {
      installedComponents: installed,
      description: `Loaded ${name || "Saved Configuration"}`,
    };

    set({
      configurationName: name || state.configurationName,
      installedComponents: installed,
      history: [snapshot],
      historyIndex: 0,
      validation,
      pricingSummary,
      selectedMountingPointId: null,
      selectedComponentId: null,
    });
  },

  autoFixIssue: (issue: ValidationError) => {
    const state = get();
    if (!state.machine) return false;

    // 1. Determine the target part number and action
    let partNumber = issue.quickFix?.partNumber || issue.partNumber;
    const actionType = issue.quickFix?.actionType || "INSTALL";

    // If no part number found in quickFix or error object, parse from error message (e.g. "(SFT-001)")
    if (!partNumber) {
      const match = issue.message.match(/\(([A-Z0-9-]+)\)/);
      if (match) {
        partNumber = match[1];
      }
    }

    if (!partNumber) return false;

    const compToInstall = state.componentsLibrary.find((c) => c.partNumber === partNumber);
    if (!compToInstall) return false;

    const catSlug = compToInstall.category?.slug || "";

    // 2. Identify the target mounting point
    let targetMountingPoint: MountingPoint | undefined;

    // If replacing an existing incompatible component, find where the offending component is installed
    if (actionType === "REPLACE") {
      for (const [mpId, installed] of Object.entries(state.installedComponents)) {
        if (
          (issue.code === "DIMENSION_INCOMPATIBLE" && installed.component.category?.slug === "conveyors") ||
          (issue.code === "POWER_INCOMPATIBLE" && installed.component.category?.slug === "controls") ||
          (issue.code === "ENVIRONMENT_INCOMPATIBLE" && installed.component.partNumber === "SEN-001") ||
          installed.component.category?.slug === catSlug
        ) {
          targetMountingPoint = state.mountingPoints.find((mp) => mp.id === mpId);
          if (targetMountingPoint) break;
        }
      }
    }

    // Check preferred mounting point from quickFix or issue
    if (!targetMountingPoint && issue.quickFix?.targetMountingPointId) {
      targetMountingPoint = state.mountingPoints.find(
        (mp) => mp.id === issue.quickFix?.targetMountingPointId || mp.pointId === issue.quickFix?.targetMountingPointId
      );
    }
    if (!targetMountingPoint && issue.mountingPointId) {
      targetMountingPoint = state.mountingPoints.find(
        (mp) => mp.id === issue.mountingPointId || mp.pointId === issue.mountingPointId
      );
    }

    // If still not found, search through all mounting points that allow this part or category
    if (!targetMountingPoint) {
      // 1st choice: unoccupied mounting point that explicitly allows this partNumber
      targetMountingPoint = state.mountingPoints.find((mp) => {
        if (state.installedComponents[mp.id]) return false;
        if (!mp.allowedPartNumbersJson) return false;
        try {
          const parts: string[] = JSON.parse(mp.allowedPartNumbersJson);
          return parts.includes(partNumber!);
        } catch {
          return false;
        }
      });

      // 2nd choice: unoccupied mounting point that allows this category
      if (!targetMountingPoint) {
        targetMountingPoint = state.mountingPoints.find((mp) => {
          if (state.installedComponents[mp.id]) return false;
          try {
            const cats: string[] = JSON.parse(mp.allowedCategorySlugsJson || "[]");
            return cats.includes(catSlug);
          } catch {
            return false;
          }
        });
      }

      // 3rd choice: ANY mounting point that explicitly allows this partNumber
      if (!targetMountingPoint) {
        targetMountingPoint = state.mountingPoints.find((mp) => {
          if (!mp.allowedPartNumbersJson) return false;
          try {
            const parts: string[] = JSON.parse(mp.allowedPartNumbersJson);
            return parts.includes(partNumber!);
          } catch {
            return false;
          }
        });
      }

      // 4th choice: ANY mounting point that allows this category
      if (!targetMountingPoint) {
        targetMountingPoint = state.mountingPoints.find((mp) => {
          try {
            const cats: string[] = JSON.parse(mp.allowedCategorySlugsJson || "[]");
            return cats.includes(catSlug);
          } catch {
            return false;
          }
        });
      }
    }

    if (!targetMountingPoint) return false;

    // 3. Install the component onto the target mounting point
    return state.installComponent(targetMountingPoint.id, compToInstall);
  },

  autoFixAllIssues: () => {
    let fixedCount = 0;
    const maxIterations = 6;
    let iteration = 0;

    while (iteration < maxIterations) {
      iteration++;
      const currentValidation = get().validation;
      const issues = [...currentValidation.errors, ...currentValidation.warnings];
      if (issues.length === 0) break;

      let fixedInThisPass = false;
      for (const issue of issues) {
        const success = get().autoFixIssue(issue);
        if (success) {
          fixedCount++;
          fixedInThisPass = true;
          break; // re-evaluate remaining issues in next loop pass
        }
      }

      if (!fixedInThisPass) {
        break; // No further issues can be auto-resolved
      }
    }

    const finalValidation = get().validation;
    return {
      fixedCount,
      remainingCount: finalValidation.errors.length + finalValidation.warnings.length,
    };
  },
}));
