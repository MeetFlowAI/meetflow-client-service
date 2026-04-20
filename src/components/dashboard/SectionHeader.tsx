/* Imports */
import { memo, type JSX } from "react";
import { Plus } from "lucide-react";
import clsx from "clsx";

/* Local Imports */
import { Button } from "@/components/ui/button";
import { typography } from "@/theme/typography";

// ----------------------------------------------------------------------

export interface SectionHeaderProps {
  title: string;
  subtitle: string;
  addButtonLabel?: string;
  onAddClick?: () => void;
  addButtonDisabled?: boolean;
  className?: string;
}

// ----------------------------------------------------------------------

/**
 * SectionHeader — Page title + subtitle on the left, optional Add button on right.
 * Used as the first visual block of every master-dashboard section.
 * Dashboard page omits addButtonLabel → no button rendered.
 */
const SectionHeader = ({
  title,
  subtitle,
  addButtonLabel,
  onAddClick,
  addButtonDisabled = false,
  className,
}: SectionHeaderProps): JSX.Element => {
  return (
    <div className={clsx("flex items-center justify-between gap-4", className)}>
      {/* Left */}
      <div className="flex flex-col gap-1 min-w-0">
        <h2
          className={clsx(
            typography.semibold20,
            "text-secondary-900 dark:text-white leading-tight",
          )}
        >
          {title}
        </h2>
        <p
          className={clsx(
            typography.regular14,
            "text-secondary-400 dark:text-secondary-400",
          )}
        >
          {subtitle}
        </p>
      </div>

      {/* Right — conditional */}
      {addButtonLabel && (
        <Button
          size="medium"
          onClick={onAddClick}
          disabled={addButtonDisabled}
          leftIcon={<Plus className="h-4 w-4" />}
          className="shrink-0"
        >
          {addButtonLabel}
        </Button>
      )}
    </div>
  );
};

export default memo(SectionHeader);
