/* Imports */
import type { FC, JSX } from "react";
import { MessagesSquare, UsersRound, Video } from "lucide-react";

/* Local Imports */
import AppLogoDark from "@/assets/images/meetFlowDarkLogo.png";
import AppLogoLight from "@/assets/images/meetFlowLightLogo.png";
import { cn } from "@/lib/utils";

// ----------------------------------------------------------------------

type LoaderVariant = "spinner" | "dots" | "pulse" | "gradient";

interface FullScreenLoaderProps {
  /** Loading message to display */
  message?: string;
  /** Subtitle or additional text */
  subtitle?: string;
  /** Loader style variant */
  variant?: LoaderVariant;
  /** Show brand logo */
  showBrand?: boolean;
  /** Custom className */
  className?: string;
}

// ----------------------------------------------------------------------

const loaderStyles = `
  @keyframes meetflow-loader-spin {
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes meetflow-loader-reverse-spin {
    to {
      transform: rotate(-360deg);
    }
  }

  @keyframes meetflow-loader-sweep {
    0% {
      transform: translateX(-110%);
      opacity: 0.4;
    }
    50% {
      opacity: 1;
    }
    100% {
      transform: translateX(210%);
      opacity: 0.4;
    }
  }

  @keyframes meetflow-loader-bar {
    0%,
    100% {
      transform: scaleY(0.42);
      opacity: 0.45;
    }
    50% {
      transform: scaleY(1);
      opacity: 1;
    }
  }

  @keyframes meetflow-loader-pulse {
    0%,
    100% {
      transform: scale(0.9);
      opacity: 0.48;
    }
    50% {
      transform: scale(1.08);
      opacity: 1;
    }
  }

  @keyframes meetflow-loader-fade {
    0%,
    100% {
      opacity: 0.45;
    }
    50% {
      opacity: 1;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .meetflow-loader-motion {
      animation: none !important;
    }
  }
`;

const activityIcons = [Video, MessagesSquare, UsersRound];

// ----------------------------------------------------------------------

const LoaderMark = ({ variant }: { variant: LoaderVariant }): JSX.Element => {
  if (variant === "dots") {
    return (
      <div className="flex h-16 items-end justify-center gap-2" aria-hidden>
        {[0, 1, 2, 3, 4].map((item) => (
          <span
            key={item}
            className="meetflow-loader-motion h-12 w-2 origin-bottom rounded-full bg-gradient-to-t from-primary-500 via-information-500 to-success-500"
            style={{
              animation: "meetflow-loader-bar 900ms ease-in-out infinite",
              animationDelay: `${item * 90}ms`,
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === "pulse") {
    return (
      <div className="relative grid size-20 place-items-center" aria-hidden>
        {[0, 1, 2].map((item) => (
          <span
            key={item}
            className="meetflow-loader-motion absolute size-12 rounded-lg border border-primary-500/40 dark:border-primary-400/50"
            style={{
              animation: "meetflow-loader-pulse 1.6s ease-in-out infinite",
              animationDelay: `${item * 180}ms`,
            }}
          />
        ))}
        <span className="size-5 rounded-md bg-primary-500 shadow-[0_0_24px_rgba(77,65,243,0.45)] dark:bg-primary-400" />
      </div>
    );
  }

  if (variant === "gradient") {
    return (
      <div className="relative h-16 w-28 overflow-hidden rounded-lg border border-secondary-200 bg-white shadow-sm dark:border-secondary-700 dark:bg-secondary-800">
        <span
          className="meetflow-loader-motion absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-primary-500 via-information-500 to-success-500"
          style={{ animation: "meetflow-loader-sweep 1.5s ease-in-out infinite" }}
        />
        <div className="absolute inset-0 grid grid-cols-4 gap-px p-2" aria-hidden>
          {[0, 1, 2, 3, 4, 5, 6, 7].map((item) => (
            <span
              key={item}
              className="rounded-sm bg-secondary-200/70 dark:bg-secondary-700/70"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative grid size-24 place-items-center" aria-hidden>
      <svg className="size-24 overflow-visible" viewBox="0 0 96 96">
        <defs>
          <linearGradient
            id="meetflow-loader-gradient"
            x1="18"
            x2="78"
            y1="18"
            y2="78"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#4D41F3" />
            <stop offset="0.54" stopColor="#4D81E7" />
            <stop offset="1" stopColor="#70C427" />
          </linearGradient>
        </defs>
        <circle
          cx="48"
          cy="48"
          r="33"
          className="text-secondary-200 dark:text-secondary-700"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
        />
        <circle
          cx="48"
          cy="48"
          r="33"
          className="meetflow-loader-motion origin-center"
          fill="none"
          stroke="url(#meetflow-loader-gradient)"
          strokeDasharray="92 208"
          strokeLinecap="round"
          strokeWidth="8"
          style={{ animation: "meetflow-loader-spin 1.15s linear infinite" }}
        />
        <circle
          cx="48"
          cy="48"
          r="21"
          className="meetflow-loader-motion origin-center text-primary-500/50 dark:text-primary-400/60"
          fill="none"
          stroke="currentColor"
          strokeDasharray="38 132"
          strokeLinecap="round"
          strokeWidth="4"
          style={{
            animation: "meetflow-loader-reverse-spin 1.8s linear infinite",
          }}
        />
      </svg>

      <span className="absolute size-3 rounded-sm bg-primary-500 shadow-[0_0_20px_rgba(77,65,243,0.5)] dark:bg-primary-400" />
    </div>
  );
};

// ----------------------------------------------------------------------

/**
 * Loader component for full screen loading.
 *
 * @component
 * @returns {JSX.Element}
 */
const FullScreenLoader: FC<FullScreenLoaderProps> = ({
  message = "Opening MeetFlow",
  subtitle = "Bringing your workspace into focus.",
  variant = "spinner",
  showBrand = true,
  className,
}): JSX.Element => {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      aria-label={`${message}${subtitle ? `. ${subtitle}` : ""}`}
      className={cn(
        "fixed inset-0 z-[9999] grid place-items-center overflow-hidden",
        "bg-white text-secondary-900 dark:bg-secondary-900 dark:text-secondary-100",
        className,
      )}
    >
      <style>{loaderStyles}</style>

      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div
          className="absolute inset-0 opacity-60 dark:opacity-20"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(190,190,200,0.22) 1px, transparent 1px), linear-gradient(to bottom, rgba(190,190,200,0.22) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary-500/50 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-primary-100/70 via-information-100/30 to-transparent dark:from-primary-900/25 dark:via-information-900/10" />
      </div>

      <div className="relative z-10 flex w-full max-w-sm flex-col items-center px-6 text-center">
        <div className="flex w-full flex-col items-center gap-7 rounded-lg border border-secondary-200/80 bg-white/85 px-8 py-10 shadow-[0_24px_80px_rgba(17,17,19,0.12)] backdrop-blur-xl dark:border-secondary-700/80 dark:bg-secondary-900/82 dark:shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
          {showBrand && (
            <div className="flex h-10 items-center justify-center">
              <img
                src={AppLogoDark}
                alt="MeetFlow"
                className="h-10 w-auto dark:hidden"
              />
              <img
                src={AppLogoLight}
                alt="MeetFlow"
                className="hidden h-10 w-auto dark:block"
              />
            </div>
          )}

          <LoaderMark variant={variant} />

          <div className="space-y-2">
            <h1 className="text-base font-semibold text-secondary-900 dark:text-secondary-100">
              {message}
            </h1>
            {subtitle && (
              <p className="mx-auto max-w-[260px] text-sm leading-6 text-secondary-500 dark:text-secondary-400">
                {subtitle}
              </p>
            )}
          </div>

          <div className="w-full space-y-4" aria-hidden>
            <div className="relative mx-auto h-1.5 w-44 overflow-hidden rounded-full bg-secondary-200 dark:bg-secondary-800">
              <span
                className="meetflow-loader-motion absolute inset-y-0 left-0 w-20 rounded-full bg-gradient-to-r from-primary-500 via-information-500 to-success-500"
                style={{
                  animation: "meetflow-loader-sweep 1.45s ease-in-out infinite",
                }}
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              {activityIcons.map((Icon, index) => (
                <div
                  key={index}
                  className="meetflow-loader-motion flex h-9 items-center justify-center rounded-lg border border-secondary-200 bg-secondary-100/80 text-secondary-500 dark:border-secondary-700 dark:bg-secondary-800/70 dark:text-secondary-300"
                  style={{
                    animation: "meetflow-loader-fade 1.6s ease-in-out infinite",
                    animationDelay: `${index * 180}ms`,
                  }}
                >
                  <Icon className="size-4" strokeWidth={2.2} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FullScreenLoader;
