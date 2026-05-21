/* ============================================================
   MeetFlow V2 — Canonical Class Merging Utility

   THIS IS THE AUTHORITATIVE IMPLEMENTATION of `cn`.
   Every layer in the architecture may import from here.

   LAYER HIERARCHY COMPLIANCE:
     src/lib/ is the lowest layer above npm packages.
     It has no internal project imports — only npm packages.
     This makes it safe to import from:
       - design-system/* (Layer 0)
       - components/ui/* (Layer 1)
       - components/app/* (Layer 2)
       - shared/*         (Layer 3)
       - modules/*        (Layer 4)
       - app/*            (Layer 5)

   SHADCN COMPATIBILITY:
     Shadcn CLI generates components that import `cn` from
     "@/lib/utils". This file satisfies that requirement
     directly — no shim needed.

   DO NOT:
     - Add any project-internal imports to this file
     - Add any business logic to this file
     - Move this to a different path without updating
       every Shadcn-generated component
   ============================================================ */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind CSS class names safely, resolving conflicts.
 *
 * Combines `clsx` (conditional class handling) with `tailwind-merge`
 * (Tailwind conflict resolution). This is the only class-merging
 * utility in the entire codebase.
 *
 * @example
 * cn("px-4 py-2", isActive && "bg-primary", className)
 * cn(["text-sm", "font-medium"], { "opacity-50": disabled })
 * cn("px-2")  // → "px-4"  (tailwind-merge resolves conflict)
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
