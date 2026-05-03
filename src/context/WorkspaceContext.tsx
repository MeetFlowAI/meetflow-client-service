/* Imports */
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type JSX,
} from "react";

// ----------------------------------------------------------------------

/** Nav items: home, chats, channels, members */
export type WorkspaceNavItem =
  | "home"
  | "chats"
  | "channels"
  | "members"
  | "admin";

export interface ISelectedWorkspace {
  id: number;
  name: string;
  description: string | null;
  member_count: number;
  channel_count: number;
  is_active: boolean;
}

export interface IWorkspaceState {
  /* Navigation */
  activeNav: WorkspaceNavItem;
  setActiveNav: (nav: WorkspaceNavItem) => void;

  /* Selected workspace — persisted in localStorage */
  selectedWorkspace: ISelectedWorkspace | null;
  selectedWorkspaceId: number | null;
  setSelectedWorkspace: (ws: ISelectedWorkspace | null) => void;

  /* Slack-style "entering workspace" transition overlay */
  isEnteringWorkspace: boolean;
  enterWorkspace: (ws: ISelectedWorkspace) => Promise<void>;
}

// ----------------------------------------------------------------------

const WORKSPACE_STORAGE_KEY = "selected_workspace";

const loadStoredWorkspace = (): ISelectedWorkspace | null => {
  try {
    const raw = localStorage.getItem(WORKSPACE_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ISelectedWorkspace) : null;
  } catch {
    return null;
  }
};

// ----------------------------------------------------------------------

const initialState: IWorkspaceState = {
  activeNav: "home",
  setActiveNav: () => {},
  selectedWorkspace: null,
  selectedWorkspaceId: null,
  setSelectedWorkspace: () => {},
  isEnteringWorkspace: false,
  enterWorkspace: async () => {},
};

const WorkspaceContext = createContext<IWorkspaceState>(initialState);

// ----------------------------------------------------------------------

export interface IWorkspaceProviderProps {
  children: React.ReactNode;
}

/**
 * WorkspaceProvider — wraps workspace dashboard + selection page.
 * Provides:
 *  - selectedWorkspace persisted in localStorage
 *  - enterWorkspace() — 700ms Slack-style loading overlay then navigate
 *  - activeNav synced with URL
 *
 * @component
 */
export const WorkspaceProvider: React.FC<IWorkspaceProviderProps> = ({
  children,
}): JSX.Element => {
  const [activeNav, setActiveNav] = useState<WorkspaceNavItem>("home");
  const [selectedWorkspace, setSelectedWorkspaceRaw] =
    useState<ISelectedWorkspace | null>(loadStoredWorkspace);
  const [isEnteringWorkspace, setIsEnteringWorkspace] = useState(false);

  /* Persist workspace to localStorage */
  useEffect(() => {
    if (selectedWorkspace) {
      localStorage.setItem(
        WORKSPACE_STORAGE_KEY,
        JSON.stringify(selectedWorkspace),
      );
    } else {
      localStorage.removeItem(WORKSPACE_STORAGE_KEY);
    }
  }, [selectedWorkspace]);

  const setSelectedWorkspace = (ws: ISelectedWorkspace | null) => {
    setSelectedWorkspaceRaw(ws);
  };

  /**
   * enterWorkspace — 700ms overlay then sets workspace in state.
   * Caller should navigate to /workspace/home after await.
   */
  const enterWorkspace = async (ws: ISelectedWorkspace): Promise<void> => {
    setIsEnteringWorkspace(true);
    await new Promise((resolve) => setTimeout(resolve, 700));
    setSelectedWorkspaceRaw(ws);
    setIsEnteringWorkspace(false);
  };

  return (
    <WorkspaceContext.Provider
      value={{
        activeNav,
        setActiveNav,
        selectedWorkspace,
        selectedWorkspaceId: selectedWorkspace?.id ?? null,
        setSelectedWorkspace,
        isEnteringWorkspace,
        enterWorkspace,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useWorkspace = () => useContext(WorkspaceContext);

export default WorkspaceContext;
