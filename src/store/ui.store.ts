import { create } from "zustand";
import { persist } from "zustand/middleware";
import { UI_STORAGE_KEY } from "@/config/constants";

// ── State ─────────────────────────────────────────────────────────────────────

interface UIState {
  /** Whether the main navigation sidebar is collapsed to icon-only width */
  sidebarCollapsed: boolean;
  /** Whether the global command menu (Cmd+K / Ctrl+K) is open */
  commandMenuOpen: boolean;
  /**
   * Full-screen loading overlay. Reserved for auth redirects and
   * critical blocking async operations.
   * For data loading: use skeleton states inside components instead.
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
//
// PERSISTENCE STRATEGY:
//   Only `sidebarCollapsed` is persisted — it is a user UI preference
//   that should survive page reloads and browser restarts.
//
//   `commandMenuOpen` and `globalLoading` are ephemeral — they must
//   reset to false on every app boot. Never persist them.
//
// STORAGE KEY:
//   Uses UI_STORAGE_KEY ("meetflow-ui") — distinct from THEME_STORAGE_KEY.
//   Changing the theme constant no longer silently renames this key.

export const useUIStore = create<UIState & UIActions>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      commandMenuOpen: false,
      globalLoading: false,

      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setCommandMenuOpen: (open) => set({ commandMenuOpen: open }),
      setGlobalLoading: (loading) => set({ globalLoading: loading }),
    }),
    {
      name: UI_STORAGE_KEY,
      // Persist only the user preference — not ephemeral state
      partialize: (state) => ({ sidebarCollapsed: state.sidebarCollapsed }),
    }
  )
);
