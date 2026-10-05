import { create } from "zustand";
import {
  Machine,
  MountingPoint,
  ComponentItem,
  ComponentCategory,
  InstalledComponent,
  CompatibilityRule,
  HistorySnapshot,
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
    configName?: string
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

  // History Actions
  undo: () => void;
  redo: () => void;
  resetConfiguration: () => void;
  loadSavedConfiguration: (installed: Record<string, InstalledComponent>, name?: string) => void;
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
    configName = "Custom Configuration"
  ) => {
    // If no initial installed provided, auto-install default components on mounting points
    const finalInstalled: Record<string, InstalledComponent> = { ...initialInstalled };

    if (Object.keys(finalInstalled).length === 0) {
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
      description: "Initial Baseline Configuration",
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
}));
