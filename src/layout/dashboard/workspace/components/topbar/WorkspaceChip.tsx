/**
 * WorkspaceChip.tsx
 *
 * Shows the current workspace name in the topbar.
 * - Members → clickable, navigates to workspace selection
 * - Admins/SuperAdmins → not clickable (they don't switch workspaces;
 *   they manage all workspaces from Org Console instead)
 */

import React, { useContext, type JSX } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import clsx from "clsx";

import SessionContext from "@/context/SessionContext";
import { useWorkspace } from "@/context/WorkspaceContext";
import { USER_ROLES } from "@/constants";
import { PAGE_WORKSPACE_SELECTION } from "@/routes/paths";

interface WorkspaceChipProps {
  workspace: { name: string };
}

const WorkspaceChip: React.FC<WorkspaceChipProps> = ({
  workspace,
}): JSX.Element => {
  const navigate = useNavigate();
  const { user } = useContext(SessionContext);
  const { setSelectedWorkspace } = useWorkspace();

  const isMember = user?.role?.name === USER_ROLES.ORGANIZATION_MEMBER;

  // Workspace initial avatar
  const avatar = (
    <div className="h-5 w-5 rounded-md bg-primary-500 flex items-center justify-center shrink-0">
      <span className="text-white font-bold" style={{ fontSize: "9px" }}>
        {workspace.name.slice(0, 2).toUpperCase()}
      </span>
    </div>
  );

  const label = (
    <span className="text-sm font-medium text-secondary-700 dark:text-secondary-200 max-w-[110px] truncate">
      {workspace.name}
    </span>
  );

  if (isMember) {
    return (
      <>
        <button
          onClick={() => {
            setSelectedWorkspace(null);
            navigate(PAGE_WORKSPACE_SELECTION.root.absolutePath);
          }}
          title="Switch workspace"
          className={clsx(
            "hidden sm:flex items-center gap-1.5 h-8 px-2.5 rounded-lg shrink-0",
            "border border-secondary-200 dark:border-secondary-700",
            "hover:bg-secondary-100 dark:hover:bg-secondary-800",
            "transition-colors duration-150",
          )}
        >
          {avatar}
          {label}
          <ChevronDown className="h-3.5 w-3.5 text-secondary-400 dark:text-secondary-500" />
        </button>
        <div className="h-5 w-px bg-secondary-200 dark:bg-secondary-700 shrink-0 hidden sm:block" />
      </>
    );
  }

  // Admins — display only, no click. Tooltip explains why.
  return (
    <>
      <div
        title="Admins manage workspaces from Org Console"
        className={clsx(
          "hidden sm:flex items-center gap-1.5 h-8 px-2.5 rounded-lg shrink-0",
          "border border-secondary-200 dark:border-secondary-700",
          "bg-secondary-50 dark:bg-secondary-800/50",
        )}
      >
        {avatar}
        {label}
      </div>
      <div className="h-5 w-px bg-secondary-200 dark:bg-secondary-700 shrink-0 hidden sm:block" />
    </>
  );
};

export default WorkspaceChip;
