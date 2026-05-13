// ── Vitest Global Test Setup ────────────────────────────────────────────────
// This file runs before every test file via vitest.config.ts setupFiles.

import "@testing-library/jest-dom";

// ── MSW (Mock Service Worker) ────────────────────────────────────────────────
// Uncomment in Phase 2 when MSW is configured in infrastructure/mocks/server.ts
//
// import { server } from "@/infrastructure/mocks/server";
//
// beforeAll(() =>
//   server.listen({
//     // Warn on unhandled requests so tests fail clearly when a handler is missing
//     onUnhandledRequest: "warn",
//   })
// );
//
// afterEach(() => {
//   // Reset handlers between tests to prevent state leakage
//   server.resetHandlers();
// });
//
// afterAll(() => server.close());
