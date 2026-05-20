export interface Workspace {
  id: string;
  orgId: string;
  name: string;
  slug: string;
  description: string | null;
  iconUrl: string | null;
  memberCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  userId: string;
  role: "admin" | "member" | "guest";
  joinedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
  };
}

/** Lightweight workspace reference used inside other entities */
export interface WorkspaceRef {
  id: string;
  name: string;
  slug: string;
}
