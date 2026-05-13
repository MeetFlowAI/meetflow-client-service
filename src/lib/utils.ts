// ── Shadcn Compatibility Shim ───────────────────────────────────────────────
//
// Shadcn-generated components import `cn` from "@/lib/utils".
// This shim re-exports from our actual location so Shadcn CLI output works
// without modification.
//
// ❌ Do NOT import this file in your own code.
// ✅ In your own code: import { cn } from "@/shared/utils"
//
// This file exists solely for Shadcn CLI compatibility.

export { cn } from "@/shared/utils";
