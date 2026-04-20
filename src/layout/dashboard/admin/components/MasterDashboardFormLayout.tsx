/* Imports */
import { memo, type JSX, type ReactNode } from "react";

/* Local Imports */
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import clsx from "clsx";
import { typography } from "@/theme/typography";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SectionHeader } from "@/components/dashboard";
import type { id } from "date-fns/locale";

// ----------------------------------------------------------------------

export interface MasterDashboardFormLayoutProps {
  title: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
  className?: string;
}

// ----------------------------------------------------------------------

/**
 * Reusable layout for Admin Dashboard forms.
 *
 * @component
 * @param {string} title - Form title displayed in card header.
 * @param {string} description - Optional description below title.
 * @param {ReactNode} children - Form fields/content.
 * @param {ReactNode} footer - Footer area (e.g., buttons).
 * @param {string} className - Additional classnames for card.
 * @returns {JSX.Element}
 */

const MasterDashboardFormLayout = ({
  title,
  description,
  children,
  footer,
  className,
}: MasterDashboardFormLayoutProps): JSX.Element => {
  return (
    <>
      <SectionHeader title={title} subtitle={description ?? ""} />
      <Card className={clsx("h-full p-0 gap-0", className)}>
        {/* Scrollable fields */}
        <CardContent className="h-full overflow-y-auto px-8 py-6">
          <ScrollArea className="h-full w-full pr-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {children}
            </div>
          </ScrollArea>
        </CardContent>

        {/* Footer */}
        {footer && (
          <CardFooter className="flex justify-between items-center px-8 py-4 border-t-2 border-b-secondary-100 dark:border-b-secondary-600 shrink-0">
            {footer}
          </CardFooter>
        )}
      </Card>
    </>
  );
};

export default memo(MasterDashboardFormLayout);
