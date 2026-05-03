/**
 * OrgConsoleButton.tsx
 *
 * Shown only to admins/superadmins. Plain anchor-style button —
 * avoids shadcn Button variant fighting with custom styles.
 */

import React, { type JSX } from "react";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard } from "lucide-react";
import clsx from "clsx";

import { PAGE_ORGANIZATION_DASHBOARD } from "@/routes/paths";

const OrgConsoleButton: React.FC = (): JSX.Element => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(PAGE_ORGANIZATION_DASHBOARD.root.absolutePath)}
      className={clsx(
        "hidden sm:flex items-center gap-1.5 h-8 px-3 rounded-lg shrink-0",
        "text-xs font-medium",
        "border border-secondary-200 dark:border-secondary-700",
        "text-secondary-600 dark:text-secondary-300",
        "bg-transparent",
        "hover:bg-secondary-100 dark:hover:bg-secondary-800",
        "transition-colors duration-150",
      )}
    >
      <LayoutDashboard className="h-3.5 w-3.5" />
      Org Console
    </button>
  );
};

export default OrgConsoleButton;
