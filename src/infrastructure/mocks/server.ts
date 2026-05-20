/* ============================================================
   MeetFlow V2 — MSW Node Server (for Vitest)

   Used in src/tests/setup.ts to intercept HTTP calls in tests.
   Tests never make real network requests.
   ============================================================ */

import { setupServer } from "msw/node";
import { handlers } from "./handlers";

export const server = setupServer(...handlers);
