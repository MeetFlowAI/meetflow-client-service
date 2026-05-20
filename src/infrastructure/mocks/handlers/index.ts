/* ============================================================
   MeetFlow V2 — MSW Request Handler Barrel

   HOW TO ADD HANDLERS:
     1. Create a new file: handlers/auth.handlers.ts
     2. Export an array: export const authHandlers = [...]
     3. Import and spread here: ...authHandlers

   WHEN HANDLERS ARE ADDED:
     Phase 9  → handlers/auth.handlers.ts
     Phase 10 → handlers/organizations.handlers.ts
     Phase 11 → handlers/analytics.handlers.ts
     Phase 12 → handlers/workspace.handlers.ts
     Phase 13 → handlers/meetings.handlers.ts
   ============================================================ */

import type { HttpHandler } from "msw";

// Handlers are imported and spread here as feature modules are built:
// import { authHandlers } from "./auth.handlers";

export const handlers: HttpHandler[] = [
  // ...authHandlers,  // Phase 9
];
