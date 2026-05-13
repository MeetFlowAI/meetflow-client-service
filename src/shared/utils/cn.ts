import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind CSS class names safely, resolving conflicts.
 *
 * This is the ONLY class-merging utility in the entire codebase.
 * Never use `clsx` or `twMerge` directly — always use `cn`.
 *
 * What it does:
 * - `clsx` handles conditional classes, arrays, and objects
 * - `twMerge` resolves Tailwind conflicts (e.g. `px-4 px-6` → `px-6`)
 *
 * @example
 * cn("px-4 py-2 rounded", isActive && "bg-primary text-white", className)
 * cn(["text-sm", "font-medium"], { "opacity-50": disabled })
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
