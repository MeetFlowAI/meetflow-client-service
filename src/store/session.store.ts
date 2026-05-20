import { create } from "zustand";
import type { User } from "@/types/entities/user.types";
import type { Organization } from "@/types/entities/organization.types";
import type { Workspace } from "@/types/entities/workspace.types";
import type { Role } from "@/permissions/roles";

// ── State shape ───────────────────────────────────────────────────────────────

interface SessionState {
  /**
   * True once the session initialization attempt has completed
   * (whether successful or not). Guards are not rendered until this is true.
   */
  isHydrated: boolean;

  /** True when a valid access token and user profile are loaded. */
  isAuthenticated: boolean;

  /** The currently authenticated user. Null when not authenticated. */
  user: User | null;

  /**
   * The organization the user is currently operating in.
   * Set after the user selects or is assigned to an org context.
   */
  currentOrg: Organization | null;

  /**
   * The workspace the user is currently operating in.
   * Set when the user navigates into a workspace.
   */
  currentWorkspace: Workspace | null;

  /**
   * The effective role of the user in the current context.
   * Determined by: org membership role (for org routes) or
   * global role (for master dashboard routes).
   */
  role: Role | null;
}

// ── Actions ───────────────────────────────────────────────────────────────────

interface SessionActions {
  /**
   * Partial state update — used by sessionService.initialize()
   * to populate the store after session hydration.
   */
  setSession: (data: Partial<SessionState>) => void;

  /** Updates the active organization context. */
  setCurrentOrg: (org: Organization | null) => void;

  /** Updates the active workspace context. */
  setCurrentWorkspace: (workspace: Workspace | null) => void;

  /**
   * Clears all session state. Called on sign-out.
   * Does NOT clear localStorage tokens — that is tokenService's job.
   */
  clearSession: () => void;
}

// ── Store ─────────────────────────────────────────────────────────────────────

const initialState: SessionState = {
  isHydrated: false,
  isAuthenticated: false,
  user: null,
  currentOrg: null,
  currentWorkspace: null,
  role: null,
};

export const useSessionStore = create<SessionState & SessionActions>()((set) => ({
  ...initialState,

  setSession: (data) => set((prev) => ({ ...prev, ...data })),

  setCurrentOrg: (org) => set({ currentOrg: org }),

  setCurrentWorkspace: (workspace) => set({ currentWorkspace: workspace }),

  clearSession: () => set({ ...initialState, isHydrated: true }),
}));
