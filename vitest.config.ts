import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],

  test: {
    // Use global test APIs (describe, it, expect) without importing them
    globals: true,

    // jsdom simulates the browser DOM environment
    environment: "jsdom",

    // Runs before every test file — sets up jest-dom matchers + MSW
    setupFiles: ["./src/tests/setup.ts"],

    // Test file patterns — co-located with source files
    include: ["src/**/*.{test,spec}.{ts,tsx}"],

    // Exclude generated and third-party code
    exclude: [
      "node_modules",
      "dist",
      "src/components/ui/**", // Shadcn primitives — not our tests
    ],

    coverage: {
      provider: "v8",
      reporter: ["text", "lcov", "html"],
      reportsDirectory: "./coverage",
      exclude: [
        "src/components/ui/**",     // Shadcn — not our code
        "src/tests/**",
        "**/*.stories.tsx",
        "**/*.config.{ts,js}",
        "src/app/App.tsx",          // Bootstrap shell — integration test territory
        "src/main.tsx",
        "src/vite-env.d.ts",
      ],
      // Thresholds enforced from Phase 5 onward (when App Components exist)
      // Uncomment and tune after Phase 5 is complete:
      // thresholds: {
      //   lines: 70,
      //   functions: 70,
      //   branches: 65,
      // },
    },
  },

  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});
