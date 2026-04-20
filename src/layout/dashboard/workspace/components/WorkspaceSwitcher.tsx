/* Imports */
import React, { useContext, type JSX } from "react";
import { useNavigate } from "react-router-dom";
import { Layers } from "lucide-react";
import clsx from "clsx";

/* Local Imports */
import { useWorkspace } from "@/context/WorkspaceContext";
import SessionContext from "@/context/SessionContext";
import { USER_ROLES } from "@/constants";
import { PAGE_WORKSPACE_SELECTION } from "@/routes/paths";
import { typography } from "@/theme/typography";

// ----------------------------------------------------------------------

/**
 * WorkspaceSwitcher — pinned at bottom of left section.
 * Shows current workspace name with click-to-switch for org members.
 * (Component is currently commented out in layout — kept for future use)
 *
 * @component
 */
const WorkspaceSwitcher: React.FC = (): JSX.Element => {
  const navigate = useNavigate();
  const { selectedWorkspace, setSelectedWorkspace } = useWorkspace();
  const { user } = useContext(SessionContext);

  const isMember = user?.role?.name === USER_ROLES.ORGANIZATION_MEMBER;

  const handleSwitch = () => {
    if (!isMember) return;
    setSelectedWorkspace(null);
    navigate(PAGE_WORKSPACE_SELECTION.root.absolutePath);
  };

  if (!selectedWorkspace) return <></>;

  return (
    <div
      className={clsx(
        "shrink-0",
        "border-t border-secondary-200 dark:border-secondary-700",
        "bg-secondary-100 dark:bg-secondary-900",
      )}
    >
      <button
        onClick={handleSwitch}
        disabled={!isMember}
        className={clsx(
          "w-full flex items-center gap-2.5 px-3 py-3 transition-colors",
          isMember
            ? "hover:bg-secondary-200 dark:hover:bg-secondary-800 cursor-pointer"
            : "cursor-default",
        )}
      >
        <div className="h-8 w-8 rounded-lg bg-primary-500 flex items-center justify-center shrink-0 text-white text-xs font-bold">
          {selectedWorkspace.name.slice(0, 2).toUpperCase()}
        </div>
        <div className="flex flex-col items-start min-w-0 flex-1">
          <span
            className={clsx(
              typography.semibold12,
              "text-secondary-800 dark:text-secondary-100 truncate w-full leading-none",
            )}
          >
            {selectedWorkspace.name}
          </span>
          <span
            className="text-secondary-500 dark:text-secondary-500 leading-none mt-0.5"
            style={{ fontSize: "10px" }}
          >
            {selectedWorkspace.member_count ?? 0} members
          </span>
        </div>
        {isMember && (
          <Layers className="h-3.5 w-3.5 text-secondary-400 dark:text-secondary-500 shrink-0" />
        )}
      </button>
    </div>
  );
};

export default WorkspaceSwitcher;
