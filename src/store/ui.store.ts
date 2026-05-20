import { create } from "zustand";
import { persist } from "zustand/middleware";
import { THEME_STORAGE_KEY } from "@/config/constants";

// ── State shape ───────────────────────────────────────────────────────────────

interface UIState {
  /** Whether the main navigation sidebar is collapsed to icon-only width */
  sidebarCollapsed: boolean;

  /** Whether the global command menu (Cmd+K) is open */
  commandMenuOpen: boolean;

  /**
   * Full-screen loading overlay. Used during auth redirects and
   * critical async operations. Not for data loading (use skeleton instead).
   */
  globalLoading: boolean;
}

// ── Actions ───────────────────────────────────────────────────────────────────

interface UIActions {
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  setCommandMenuOpen: (open: boolean) => void;
  setGlobalLoading: (loading: boolean) => void;
}

// ── Store ─────────────────────────────────────────────────────────────────────
// Sidebar state is persisted — user preference survives page reload.
// Command menu and global loading are ephemeral — reset on every mount.

export const useUIStore = create<UIState & UIActions>()(
  persist(
    (set) => ({
      // State
      sidebarCollapsed: false,
      commandMenuOpen: false,
      globalLoading: false,

      // Actions
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setCommandMenuOpen: (open) => set({ commandMenuOpen: open }),
      setGlobalLoading: (loading) => set({ globalLoading: loading }),
    }),
    {
      name: `${THEME_STORAGE_KEY}-ui`,
      // Only persist sidebar preference — not transient UI state
      partialize: (state) => ({ sidebarCollapsed: state.sidebarCollapsed }),
    }
  )
);
