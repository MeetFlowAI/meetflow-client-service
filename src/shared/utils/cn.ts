/* ============================================================
   MeetFlow V2 — cn Re-export

   This file exists so that shared/ code has a local import
   path and so that the layer contract is visible in code:

     shared/utils/ → re-exports from lib/utils (correct direction)

   The CANONICAL implementation lives at src/lib/utils.ts.
   Do not duplicate or override the implementation here.
   ============================================================ */

export { cn } from "@/lib/utils";
