/* ============================================================
   MeetFlow V2 — MSW Browser Worker (for Storybook)

   Used in Storybook to intercept fetch calls inside stories,
   allowing components to render with realistic data without
   a running backend.

   SETUP:
     Run once to generate the service worker file:
       npx msw init public/ --save

     This creates public/mockServiceWorker.js.
     Commit this file — it is required by the browser worker.
   ============================================================ */

import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";

export const worker = setupWorker(...handlers);
