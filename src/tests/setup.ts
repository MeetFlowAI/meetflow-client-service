// ── Vitest Global Test Setup ────────────────────────────────────────────────
// This file runs before every test file via vitest.config.ts setupFiles.

import "@testing-library/jest-dom";
import { server } from "@/infrastructure/mocks/server";

// ── MSW lifecycle ─────────────────────────────────────────────────────────────
// Start the server before all tests.
// Reset handlers after each test to prevent state leakage between tests.
// Stop the server after all tests complete.

beforeAll(() =>
  server.listen({
    // "warn" surfaces missing handlers in the console — helpful during development
    // Switch to "error" in CI to fail tests that make unhandled requests
    onUnhandledRequest: "warn",
  })
);

afterEach(() => {
  // Removes any runtime handlers added with server.use() in individual tests
  server.resetHandlers();
});

afterAll(() => server.close());
