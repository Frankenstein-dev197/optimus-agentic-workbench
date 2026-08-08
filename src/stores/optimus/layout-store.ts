/**
 * OPTIMUS Layout Store
 * 
 * Manages the state of the OPTIMUS Workbench layout including:
 * - Panel visibility
 * - Panel sizes
 * - Editor tabs
 * - Active panels
 * - View modes
 */

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import {
  Position,
  Problem,
  GitStatusResult,
  TerminalSession,
} from "#/types/optimus/tool";

// =============================================================================
// PANEL DEFINITIONS
// =============================================================================

export type PanelType =
  | "explorer"
  | "editor"
  | "terminal"
  | "problems"
  | "output"
  | "scm"
  | "testing"
  | "debug"
  | "preview"
  | "search";

export type PanelRegion = "left" | "right" | "bottom" | "center";

export interface PanelConfig {
  type: PanelType;
  region: PanelRegion;
  visible: boolean;
  size: number; // pixels or percentage
  minSize: number;
  maxSize: number;
}

// Default panel configuration
const DEFAULT_PANEL_CONFIG: Record<PanelType, PanelConfig> = {
  explorer: { type: "explorer", region: "left", visible: false, size: 280, minSize: 200, maxSize: 500 },
  editor: { type: "editor", region: "center", visible: true, size: 100, minSize: 300, maxSize: 100 },
  terminal: { type: "terminal", region: "bottom", visible: false, size: 200, minSize: 100, maxSize: 400 },
  problems: { type: "problems", region: "bottom", visible: false, size: 150, minSize: 80, maxSize: 300 },
  output: { type: "output", region: "bottom", visible: false, size: 150, minSize: 80, maxSize: 300 },
  scm: { type: "scm", region: "left", visible: false, size: 280, minSize: 200, maxSize: 500 },
  testing: { type: "testing", region: "left", visible: false, size: 280, minSize: 200, maxSize: 500 },
  debug: { type: "debug", region: "left", visible: false, size: 280, minSize: 200, maxSize: 500 },
  preview: { type: "preview", region: "right", visible: false, size: 400, minSize: 300, maxSize: 800 },
  search: { type: "search", region: "bottom", visible: false, size: 200, minSize: 100, maxSize: 400 },
};

// =============================================================================
// EDITOR TAB DEFINITIONS
// =============================================================================

export interface EditorTab {
  id: string;
  path: string;
  name: string;
  language: string;
  isDirty: boolean;
  isActive: boolean;
  line?: number;
  column?: number;
}

export interface DiffTab {
  id: string;
  originalPath: string;
  originalContent?: string;
  modifiedPath: string;
  modifiedContent?: string;
  title?: string;
  isActive: boolean;
}

// =============================================================================
// LAYOUT STATE
// =============================================================================

export type ViewMode = "chat" | "split" | "focus";

export interface OptimusLayoutState {
  // View mode
  viewMode: ViewMode;
  optimusEnabled: boolean; // Toggle for OPTIMUS mode
  
  // Chat panel
  chatPanelHeight: number; // percentage of total height
  chatPanelCollapsed: boolean;
  
  // Panels
  panels: Record<PanelType, PanelConfig>;
  
  // Editor
  openTabs: EditorTab[];
  activeTabId: string | null;
  openDiffs: DiffTab[];
  activeDiffId: string | null;
  splitEditor: boolean;
  
  // Terminal
  terminalSessions: TerminalSession[];
  activeTerminalSessionId: string | null;
  terminalOutput: Map<string, string[]>;
  
  // Git
  gitStatus: GitStatusResult | null;
  
  // Problems
  problems: Problem[];
  problemFilter: "all" | "errors" | "warnings" | "info";
  
  // Preview
  previewUrl: string | null;
  previewPort: number | null;
  previewVisible: boolean;
  
  // Dragging/resizing
  isDragging: boolean;
  isResizing: boolean;
}

// =============================================================================
// LAYOUT ACTIONS
// =============================================================================

export interface OptimusLayoutActions {
  // View mode
  setViewMode: (mode: ViewMode) => void;
    setOptimusEnabled: (enabled: boolean) => void;
  
  // Chat
  setChatPanelHeight: (height: number) => void;
  toggleChatPanel: () => void;
  
  // Panels
  showPanel: (panel: PanelType) => void;
  hidePanel: (panel: PanelType) => void;
  togglePanel: (panel: PanelType) => void;
  setPanelSize: (panel: PanelType, size: number) => void;
  setPanelVisible: (panel: PanelType, visible: boolean) => void;
  
  // Editor tabs
  openTab: (tab: Omit<EditorTab, "isActive">) => void;
  closeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  updateTab: (tabId: string, updates: Partial<EditorTab>) => void;
  markTabDirty: (tabId: string, dirty: boolean) => void;
  reorderTabs: (fromIndex: number, toIndex: number) => void;
  
  // Diff tabs
  openDiff: (diff: Omit<DiffTab, "isActive">) => void;
  closeDiff: (diffId: string) => void;
  setActiveDiff: (diffId: string) => void;
  
  // Split editor
  toggleSplitEditor: () => void;
  
  // Terminal
  addTerminalSession: (session: TerminalSession) => void;
  removeTerminalSession: (sessionId: string) => void;
  setActiveTerminalSession: (sessionId: string) => void;
  appendTerminalOutput: (sessionId: string, output: string) => void;
  clearTerminalOutput: (sessionId: string) => void;
  
  // Git
  setGitStatus: (status: GitStatusResult | null) => void;
  
  // Problems
  setProblems: (problems: Problem[]) => void;
  addProblem: (problem: Problem) => void;
  removeProblem: (problemId: string) => void;
  clearProblems: () => void;
  setProblemFilter: (filter: "all" | "errors" | "warnings" | "info") => void;
  
  // Preview
  startPreview: (url: string, port: number) => void;
  stopPreview: () => void;
  
  // Resize
  setDragging: (dragging: boolean) => void;
  setResizing: (resizing: boolean) => void;
  
  // Reset
  resetLayout: () => void;
  resetToDefault: () => void;
}

type OptimusLayoutStore = OptimusLayoutState & OptimusLayoutActions;

// =============================================================================
// CONTEXT TRIGGERS - Which panels to show based on events
// =============================================================================

export const PANEL_CONTEXT_TRIGGERS: Record<string, PanelType[]> = {
  file_created: ["explorer", "editor"],
  file_modified: ["explorer", "editor"],
  file_deleted: ["explorer"],
  file_opened: ["explorer", "editor"],
  editor_focused: ["editor"],
  diff_shown: ["editor"],
  command_started: ["terminal"],
  command_finished: ["terminal"],
  terminal_opened: ["terminal"],
  git_status_changed: ["scm"],
  git_stage: ["scm"],
  git_commit: ["scm"],
  tests_discovered: ["testing"],
  tests_started: ["testing"],
  tests_finished: ["testing", "problems"],
  problem_detected: ["problems"],
  preview_started: ["preview"],
  preview_stopped: ["preview"],
};

// =============================================================================
// INITIAL STATE
// =============================================================================

const getInitialState = (): OptimusLayoutState => ({
  viewMode: "chat",
  optimusEnabled: false,
  chatPanelHeight: 40,
  chatPanelCollapsed: false,
  panels: { ...DEFAULT_PANEL_CONFIG },
  openTabs: [],
  activeTabId: null,
  openDiffs: [],
  activeDiffId: null,
  splitEditor: false,
  terminalSessions: [],
  activeTerminalSessionId: null,
  terminalOutput: new Map(),
  gitStatus: null,
  problems: [],
  problemFilter: "all",
  previewUrl: null,
  previewPort: null,
  previewVisible: false,
  isDragging: false,
  isResizing: false,
});

// =============================================================================
// STORE
// =============================================================================

export const useOptimusLayoutStore = create<OptimusLayoutStore>()(
  devtools(
    (set, get) => ({
      ...getInitialState(),
      
      // View mode
      setViewMode: (mode) =>
        set({ viewMode: mode }, false, "setViewMode"),

      setOptimusEnabled: (enabled) =>
        set({ optimusEnabled: enabled }, false, "setOptimusEnabled"),
      
      // Chat
      setChatPanelHeight: (height) =>
        set({ chatPanelHeight: Math.max(20, Math.min(80, height)) }, false, "setChatPanelHeight"),
      
      toggleChatPanel: () =>
        set((state) => ({ chatPanelCollapsed: !state.chatPanelCollapsed }), false, "toggleChatPanel"),
      
      // Panels
      showPanel: (panel) =>
        set(
          (state) => ({
            panels: {
              ...state.panels,
              [panel]: { ...state.panels[panel], visible: true },
            },
            viewMode: state.viewMode === "chat" ? "split" : state.viewMode,
          }),
          false,
          "showPanel"
        ),
      
      hidePanel: (panel) =>
        set(
          (state) => ({
            panels: {
              ...state.panels,
              [panel]: { ...state.panels[panel], visible: false },
            },
          }),
          false,
          "hidePanel"
        ),
      
      togglePanel: (panel) => {
        const state = get();
        if (state.panels[panel].visible) {
          state.hidePanel(panel);
        } else {
          state.showPanel(panel);
        }
      },
      
      setPanelSize: (panel, size) =>
        set(
          (state) => ({
            panels: {
              ...state.panels,
              [panel]: {
                ...state.panels[panel],
                size: Math.max(
                  state.panels[panel].minSize,
                  Math.min(state.panels[panel].maxSize, size)
                ),
              },
            },
          }),
          false,
          "setPanelSize"
        ),
      
      setPanelVisible: (panel, visible) =>
        set(
          (state) => ({
            panels: {
              ...state.panels,
              [panel]: { ...state.panels[panel], visible },
            },
          }),
          false,
          "setPanelVisible"
        ),
      
      // Editor tabs
      openTab: (tab) =>
        set((state) => {
          const existingIndex = state.openTabs.findIndex((t) => t.path === tab.path);
          const tabs = [...state.openTabs];
          
          if (existingIndex >= 0) {
            // Tab already exists, just update and activate
            tabs[existingIndex] = { ...tabs[existingIndex], ...tab, isActive: true };
          } else {
            // New tab
            tabs.push({ ...tab, isActive: true });
          }
          
          // Update active states
          const updatedTabs = tabs.map((t, i) => ({
            ...t,
            isActive: existingIndex >= 0 ? i === existingIndex : i === tabs.length - 1,
          }));
          
          return {
            openTabs: updatedTabs,
            activeTabId: existingIndex >= 0 ? tabs[existingIndex].id : tab.id,
          };
        }, false, "openTab"),
      
      closeTab: (tabId) =>
        set((state) => {
          const tabIndex = state.openTabs.findIndex((t) => t.id === tabId);
          const tabs = state.openTabs.filter((t) => t.id !== tabId);
          
          let activeTabId = state.activeTabId;
          if (state.activeTabId === tabId && tabs.length > 0) {
            // Activate adjacent tab
            const newIndex = Math.min(tabIndex, tabs.length - 1);
            activeTabId = tabs[newIndex].id;
          } else if (tabs.length === 0) {
            activeTabId = null;
          }
          
          return {
            openTabs: tabs.map((t, i) => ({
              ...t,
              isActive: t.id === activeTabId,
            })),
            activeTabId,
          };
        }, false, "closeTab"),
      
      setActiveTab: (tabId) =>
        set(
          (state) => ({
            openTabs: state.openTabs.map((t) => ({ ...t, isActive: t.id === tabId })),
            activeTabId: tabId,
          }),
          false,
          "setActiveTab"
        ),
      
      updateTab: (tabId, updates) =>
        set(
          (state) => ({
            openTabs: state.openTabs.map((t) =>
              t.id === tabId ? { ...t, ...updates } : t
            ),
          }),
          false,
          "updateTab"
        ),
      
      markTabDirty: (tabId, dirty) =>
        set(
          (state) => ({
            openTabs: state.openTabs.map((t) =>
              t.id === tabId ? { ...t, isDirty: dirty } : t
            ),
          }),
          false,
          "markTabDirty"
        ),
      
      reorderTabs: (fromIndex, toIndex) =>
        set((state) => {
          const tabs = [...state.openTabs];
          const [removed] = tabs.splice(fromIndex, 1);
          tabs.splice(toIndex, 0, removed);
          return { openTabs: tabs };
        }, false, "reorderTabs"),
      
      // Diff tabs
      openDiff: (diff) =>
        set((state) => {
          const diffs = [...state.openDiffs, { ...diff, isActive: true }];
          return {
            openDiffs: diffs.map((d, i) => ({
              ...d,
              isActive: i === diffs.length - 1,
            })),
            activeDiffId: diff.id,
          };
        }, false, "openDiff"),
      
      closeDiff: (diffId) =>
        set((state) => {
          const diffs = state.openDiffs.filter((d) => d.id !== diffId);
          let activeDiffId = state.activeDiffId;
          if (state.activeDiffId === diffId && diffs.length > 0) {
            activeDiffId = diffs[diffs.length - 1].id;
          } else if (diffs.length === 0) {
            activeDiffId = null;
          }
          return {
            openDiffs: diffs.map((d) => ({ ...d, isActive: d.id === activeDiffId })),
            activeDiffId,
          };
        }, false, "closeDiff"),
      
      setActiveDiff: (diffId) =>
        set(
          (state) => ({
            openDiffs: state.openDiffs.map((d) => ({
              ...d,
              isActive: d.id === diffId,
            })),
            activeDiffId: diffId,
          }),
          false,
          "setActiveDiff"
        ),
      
      // Split editor
      toggleSplitEditor: () =>
        set((state) => ({ splitEditor: !state.splitEditor }), false, "toggleSplitEditor"),
      
      // Terminal
      addTerminalSession: (session) =>
        set((state) => ({
          terminalSessions: [...state.terminalSessions, session],
          activeTerminalSessionId: session.id,
          terminalOutput: new Map(state.terminalOutput).set(session.id, []),
        }), false, "addTerminalSession"),
      
      removeTerminalSession: (sessionId) =>
        set((state) => {
          const sessions = state.terminalSessions.filter((s) => s.id !== sessionId);
          const output = new Map(state.terminalOutput);
          output.delete(sessionId);
          let activeId = state.activeTerminalSessionId;
          if (state.activeTerminalSessionId === sessionId && sessions.length > 0) {
            activeId = sessions[0].id;
          }
          return {
            terminalSessions: sessions,
            activeTerminalSessionId: sessions.length > 0 ? activeId : null,
            terminalOutput: output,
          };
        }, false, "removeTerminalSession"),
      
      setActiveTerminalSession: (sessionId) =>
        set({ activeTerminalSessionId: sessionId }, false, "setActiveTerminalSession"),
      
      appendTerminalOutput: (sessionId, output) =>
        set((state) => {
          const newOutput = new Map(state.terminalOutput);
          const current = newOutput.get(sessionId) || [];
          newOutput.set(sessionId, [...current, output]);
          return { terminalOutput: newOutput };
        }, false, "appendTerminalOutput"),
      
      clearTerminalOutput: (sessionId) =>
        set((state) => {
          const newOutput = new Map(state.terminalOutput);
          newOutput.set(sessionId, []);
          return { terminalOutput: newOutput };
        }, false, "clearTerminalOutput"),
      
      // Git
      setGitStatus: (status) =>
        set({ gitStatus: status }, false, "setGitStatus"),
      
      // Problems
      setProblems: (problems) =>
        set({ problems }, false, "setProblems"),
      
      addProblem: (problem) =>
        set(
          (state) => ({ problems: [...state.problems, problem] }),
          false,
          "addProblem"
        ),
      
      removeProblem: (problemId) =>
        set(
          (state) => ({
            problems: state.problems.filter((p) => p.id !== problemId),
          }),
          false,
          "removeProblem"
        ),
      
      clearProblems: () =>
        set({ problems: [] }, false, "clearProblems"),
      
      setProblemFilter: (filter) =>
        set({ problemFilter: filter }, false, "setProblemFilter"),
      
      // Preview
      startPreview: (url, port) =>
        set(
          { previewUrl: url, previewPort: port, previewVisible: true },
          false,
          "startPreview"
        ),
      
      stopPreview: () =>
        set({ previewUrl: null, previewPort: null, previewVisible: false }, false, "stopPreview"),
      
      // Resize
      setDragging: (dragging) =>
        set({ isDragging: dragging }, false, "setDragging"),
      
      setResizing: (resizing) =>
        set({ isResizing: resizing }, false, "setResizing"),
      
      // Reset
      resetLayout: () =>
        set(getInitialState(), false, "resetLayout"),
      
      resetToDefault: () =>
        set(
          {
            panels: { ...DEFAULT_PANEL_CONFIG },
            viewMode: "chat",
  optimusEnabled: false,
            openTabs: [],
            activeTabId: null,
            openDiffs: [],
            activeDiffId: null,
            terminalSessions: [],
            activeTerminalSessionId: null,
            problems: [],
            previewUrl: null,
            previewPort: null,
            previewVisible: false,
          },
          false,
          "resetToDefault"
        ),
    }),
    { name: "optimus-layout-store" }
  )
);

// =============================================================================
// SELECTORS
// =============================================================================

export const selectVisiblePanels = (state: OptimusLayoutStore): PanelType[] =>
  Object.entries(state.panels)
    .filter(([_, config]) => config.visible)
    .map(([type]) => type as PanelType);

export const selectPanelByRegion = (
  state: OptimusLayoutStore,
  region: PanelRegion
): PanelType[] =>
  Object.entries(state.panels)
    .filter(([_, config]) => config.visible && config.region === region)
    .map(([type]) => type as PanelType);

export const selectActiveTab = (state: OptimusLayoutStore): EditorTab | null =>
  state.openTabs.find((t) => t.id === state.activeTabId) ?? null;

export const selectFilteredProblems = (state: OptimusLayoutStore): Problem[] => {
  if (state.problemFilter === "all") return state.problems;
  return state.problems.filter((p) => p.severity === state.problemFilter);
};

export const selectProblemCounts = (state: OptimusLayoutStore) => ({
  errors: state.problems.filter((p) => p.severity === "error").length,
  warnings: state.problems.filter((p) => p.severity === "warning").length,
  info: state.problems.filter((p) => p.severity === "info").length,
  total: state.problems.length,
});
