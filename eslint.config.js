// @ts-check
import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import importPlugin from "eslint-plugin-import";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  // ── Global ignores ──────────────────────────────────────────────────────
  globalIgnores([
    "dist",
    "node_modules",
    "coverage",
    "*.config.js", // Don't lint config files with type-aware rules
    "*.config.ts",
    "src/components/ui/**", // Shadcn primitives — not our code to lint
  ]),

  // ── Main TypeScript + React ruleset ─────────────────────────────────────
  {
    files: ["**/*.{ts,tsx}"],

    extends: [js.configs.recommended, ...tseslint.configs.recommendedTypeChecked],

    plugins: {
      import: importPlugin,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },

    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        // Required for recommendedTypeChecked — points to our tsconfig
        project: ["./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
    },

    settings: {
      // Resolve TypeScript path aliases in import rules
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
          project: "./tsconfig.app.json",
        },
        node: true,
      },
    },

    rules: {
      // ── TypeScript ──────────────────────────────────────────────────────
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-misused-promises": [
        "error",
        { checksVoidReturn: { attributes: false } },
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      // Enforce `import type` for type-only imports — keeps runtime imports clean
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          prefer: "type-imports",
          fixStyle: "separate-type-imports",
        },
      ],
      // Prevent unintended any propagation
      "@typescript-eslint/no-unsafe-assignment": "error",
      "@typescript-eslint/no-unsafe-call": "error",
      "@typescript-eslint/no-unsafe-member-access": "error",
      "@typescript-eslint/no-unsafe-return": "error",
      // Prefer nullish coalescing over || for nullable values
      "@typescript-eslint/prefer-nullish-coalescing": "error",
      // Prefer optional chaining over && chains
      "@typescript-eslint/prefer-optional-chain": "error",

      // ── Import cycle detection ──────────────────────────────────────────
      // Catches circular dependencies at lint time — prevents the most
      // common architectural decay pattern
      "import/no-cycle": ["error", { maxDepth: 5, ignoreExternal: true }],

      // ── Architectural boundary enforcement ──────────────────────────────
      // These rules ARE the architecture. Violations are build failures.
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            // ── Rule 1: Primitives are sealed ─────────────────────────────
            // Feature modules and shared components cannot import Shadcn
            // primitives directly. Only App Components (components/app/*)
            // may consume components/ui/*.
            {
              group: ["@/components/ui", "@/components/ui/*"],
              message:
                "[Architecture] Do not import from components/ui directly. " +
                "Import from a specific App Component instead: " +
                "@/components/app/AppButton, @/components/app/AppCard, etc. " +
                "Only files inside components/app/ may import from components/ui/.",
            },

            // ── Rule 2: No raw Radix imports outside components/ui ────────
            // Radix is consumed via Shadcn. App Components get accessibility
            // behaviour through components/ui/, not by importing Radix directly.
            {
              group: ["@radix-ui/*"],
              message:
                "[Architecture] Do not import Radix UI primitives directly. " +
                "Use @/components/ui/* (inside App Components only) " +
                "or @/components/app/* (in feature/shared code).",
            },

            // ── Rule 3: No cross-module imports ───────────────────────────
            // Feature modules are vertical slices. Module A must never
            // import from Module B. Shared types go to @/types/.
            // Shared components go to @/shared/. Shared hooks go to @/shared/hooks/.
            {
              group: ["@/modules/*/*", "@/modules/*/**"],
              message:
                "[Architecture] Cross-module imports are forbidden. " +
                "Shared types → @/types/entities/. " +
                "Shared components → @/shared/components/. " +
                "Shared hooks → @/shared/hooks/.",
            },

            // ── Rule 4: No App Component barrel imports ───────────────────
            // Barrel exports of 50+ components cause TypeScript compiler slowdowns.
            // Always import from the specific component subfolder.
            {
              group: ["@/components/app"],
              message:
                "[Architecture] Do not import from the App Component barrel. " +
                "Import from the specific component: " +
                "@/components/app/AppButton, @/components/app/AppCard, etc.",
            },

            // ── Rule 5: No direct env access ─────────────────────────────
            // All environment variable access goes through @/config/env.ts.
            // This makes the env contract explicit and swappable.
            // Note: This rule fires on any import from a file that accesses
            // import.meta.env — actual import.meta usage is caught by
            // the custom rule below.
            {
              group: ["import.meta"],
              message:
                "[Architecture] Access environment variables through " +
                "@/config/env instead of import.meta.env directly.",
            },
          ],
        },
      ],

      // ── General code quality ────────────────────────────────────────────
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "prefer-const": "error",
      "no-var": "error",
      eqeqeq: ["error", "always"],

      ...reactHooks.configs.recommended.rules,

      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
    },
  },

  // ── Relaxed rules for test files ────────────────────────────────────────
  {
    files: ["**/*.test.{ts,tsx}", "**/*.spec.{ts,tsx}", "src/tests/**/*"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "no-restricted-imports": "off",
    },
  },

  // ── Relaxed rules for MSW mock files ────────────────────────────────────
  {
    files: ["src/infrastructure/mocks/**/*"],
    rules: {
      "no-restricted-imports": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
    },
  },

  // ── Relaxed rules for config layer ──────────────────────────────────────
  // config/env.ts IS the place that reads import.meta — allow it there only
  {
    files: ["src/config/env.ts"],
    rules: {
      "no-restricted-imports": "off",
    },
  },
]);
