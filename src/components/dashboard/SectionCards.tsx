/* Imports */
import { memo, type JSX } from "react";
import clsx from "clsx";

/* Local Imports */
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { typography } from "@/theme/typography";

// ----------------------------------------------------------------------

export interface SectionCard {
  /** Card label — e.g. "Total Roles" */
  label: string;

  /** Primary numeric value — pass null while loading */
  value: number | string | null;

  /**
   * Optional contextual info shown beneath the value.
   * e.g. "Last updated today" or "↑ 3 this week"
   */
  hint?: string;

  /** Lucide icon component to render in the card */
  icon: React.ComponentType<{ className?: string }>;

  /** Colour theme for the icon background + icon itself */
  color:
    | "primary"
    | "success"
    | "information"
    | "warning"
    | "destructive"
    | "secondary";
}

export interface SectionCardsProps {
  cards: SectionCard[];
  isLoading?: boolean;
  className?: string;
}

// ----------------------------------------------------------------------

const COLOR_MAP: Record<SectionCard["color"], { bg: string; icon: string }> = {
  primary: {
    bg: "bg-primary-100 dark:bg-primary-900/30",
    icon: "text-primary-500 dark:text-primary-400",
  },
  success: {
    bg: "bg-success-100 dark:bg-success-900/20",
    icon: "text-success-600 dark:text-success-400",
  },
  information: {
    bg: "bg-information-100 dark:bg-information-900/20",
    icon: "text-information-600 dark:text-information-400",
  },
  warning: {
    bg: "bg-amber-100 dark:bg-amber-900/20",
    icon: "text-amber-600 dark:text-amber-400",
  },
  destructive: {
    bg: "bg-red-100 dark:bg-red-900/20",
    icon: "text-red-600 dark:text-red-400",
  },
  secondary: {
    bg: "bg-secondary-100 dark:bg-secondary-900/20",
    icon: "text-secondary-600 dark:text-secondary-400",
  },
};

// ----------------------------------------------------------------------

/**
 * SectionCards — a row of 3 overview stat cards shown between the header
 * and the action bar on every master-dashboard section.
 *
 * Each card shows: icon, numeric value, label, optional hint.
 * Supports a loading skeleton state while data is fetching.
 */
const SectionCards = ({
  cards,
  isLoading = false,
  className,
}: SectionCardsProps): JSX.Element => {
  return (
    <div className={clsx("grid grid-cols-1 sm:grid-cols-3 gap-6", className)}>
      {cards.map((card, idx) => {
        const colors = COLOR_MAP[card.color];

        return (
          <Card
            key={idx}
            className={clsx(
              "py-3 gap-0 rounded-2xl border border-secondary-100 dark:border-secondary-700",
              "bg-secondary-100 dark:bg-secondary-700",
              "hover:border-secondary-200 dark:hover:border-secondary-600",
              "transition-all duration-200 bg-information-500 dark:bg-primary-800",
            )}
          >
            <CardContent className="px-5 flex items-center gap-10">
              {/* Icon */}
              <div
                className={clsx(
                  "h-10 w-10 rounded-xl flex items-center justify-center shrink-0",
                  colors.bg,
                )}
              >
                <card.icon className={clsx("h-5 w-5", colors.icon)} />
              </div>

              {/* Value + label */}
              <div className="flex flex-col gap-0.5">
                {isLoading || card.value === null ? (
                  <Skeleton className="h-7 w-20 rounded-lg" />
                ) : (
                  <p
                    className={clsx(
                      typography.semibold24,
                      "text-secondary-100 dark:text-secondary-100 tracking-tight",
                    )}
                  >
                    {typeof card.value === "number"
                      ? card.value.toLocaleString()
                      : card.value}
                  </p>
                )}

                <p
                  className={clsx(
                    typography.medium14,
                    "text-secondary-100 dark:text-secondary-300",
                  )}
                >
                  {card.label}
                </p>

                {card.hint && (
                  <p
                    className={clsx(
                      typography.regular12,
                      "text-secondary-800 dark:text-secondary-200 mt-0.5",
                    )}
                  >
                    {card.hint}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default memo(SectionCards);
