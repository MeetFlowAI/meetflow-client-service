# MeetFlow V2 — Architecture Reference

> **Read this before writing your first line of code.**

## Where Does Code Go?

| What you are building                                  | Where it lives                                    |
| ------------------------------------------------------ | ------------------------------------------------- |
| Color / radius / shadow token values                   | `src/design-system/tokens/`                       |
| Typography scale TS constants                          | `src/design-system/semantic/typography.ts`        |
| Theme provider + dark mode switching                   | `src/design-system/themes/`                       |
| Custom product SVG icons                               | `src/design-system/icons/custom/`                 |
| Third-party brand logos                                | `src/design-system/icons/brand/`                  |
| Empty state / auth illustrations                       | `src/design-system/illustrations/`                |
| Framer Motion variant presets                          | `src/design-system/motion/`                       |
| Shadcn UI primitives (sealed — do not import directly) | `src/components/ui/`                              |
| App Components (AppButton, AppCard, AppTable…)         | `src/components/app/AppXxx/`                      |
| Page layout composites (PageShell, SectionHeader)      | `src/shared/components/layout/`                   |
| Feedback composites (EmptyState, ErrorState)           | `src/shared/components/feedback/`                 |
| Data display composites (KpiCard, DataTable)           | `src/shared/components/data-display/`             |
| Navigation composites (AppSidebar, TabNav)             | `src/shared/components/navigation/`               |
| Shared hooks (useDebounce, useBreakpoint)              | `src/shared/hooks/`                               |
| Shared utilities (cn, format, validators)              | `src/shared/utils/`                               |
| Feature pages, feature components                      | `src/modules/{feature}/`                          |
| Feature API service functions                          | `src/modules/{feature}/api/{name}.service.ts`     |
| Feature TanStack Query hooks                           | `src/modules/{feature}/api/{name}.queries.ts`     |
| Feature Zod schemas + TS types                         | `src/modules/{feature}/models/`                   |
| Shared domain TypeScript interfaces                    | `src/types/entities/`                             |
| API response / pagination types                        | `src/types/api/`                                  |
| Environment variable access                            | `src/config/env.ts` ← ONLY place                  |
| Feature flag values                                    | `src/config/features.ts`                          |
| Feature flag hook (interface)                          | `src/shared/hooks/useFeatureFlag.ts`              |
| App-wide constants                                     | `src/config/constants.ts`                         |
| Route path string constants                            | `src/routes/paths.ts`                             |
| Route tree + lazy imports                              | `src/routes/router.tsx`                           |
| Route guards (Auth, Guest, Role)                       | `src/routes/guards/`                              |
| Zustand stores (UI, session, meeting)                  | `src/store/`                                      |
| Role definitions + permission matrix                   | `src/permissions/`                                |
| Axios HTTP instance + interceptors                     | `src/infrastructure/http/axios.ts`                |
| TanStack Query key factory                             | `src/infrastructure/api/query-keys.ts`            |
| QueryClient configuration                              | `src/infrastructure/api/query-client.ts`          |
| Auth token read/write/clear                            | `src/infrastructure/auth/token.service.ts`        |
| Session hydration on boot                              | `src/infrastructure/auth/session.service.ts`      |
| LiveKit video client wrapper                           | `src/infrastructure/realtime/livekit.client.ts`   |
| WebSocket client wrapper                               | `src/infrastructure/realtime/socket.client.ts`    |
| Sentry error tracking wrapper                          | `src/infrastructure/monitoring/error-tracking.ts` |
| Analytics event tracking                               | `src/infrastructure/monitoring/analytics.ts`      |
| MSW request handlers                                   | `src/infrastructure/mocks/handlers/`              |
| App provider composition                               | `src/app/providers.tsx`                           |
| Application root component                             | `src/app/App.tsx`                                 |
| Self-hosted font files                                 | `public/fonts/`                                   |
| Raster images                                          | `src/assets/images/`                              |

---

## Import Rules (enforced by ESLint — violations are CI failures)

```
Feature modules (src/modules/*)
  ✅ → src/components/app/AppXxx        (App Components)
  ✅ → src/shared/components/*          (shared composites)
  ✅ → src/shared/hooks/*               (shared hooks)
  ✅ → src/shared/utils/*               (utilities)
  ✅ → src/types/*                      (domain types)
  ✅ → src/config/*                     (env, features, constants)
  ✅ → src/routes/paths                 (route constants)
  ✅ → src/store/*                      (Zustand stores)
  ✅ → src/permissions/*                (permission hooks/guards)
  ✅ → src/infrastructure/api/*         (query keys, query client)
  ❌ → src/components/ui/*              (primitives — FORBIDDEN)
  ❌ → @radix-ui/*                      (FORBIDDEN)
  ❌ → src/modules/OtherModule/*        (cross-module — FORBIDDEN)

App Components (src/components/app/*)
  ✅ → src/components/ui/*              (OK — only App Components use this)
  ✅ → src/design-system/*              (tokens, icons, motion, typography)
  ❌ → src/modules/*                    (FORBIDDEN)
  ❌ → src/shared/components/*          (FORBIDDEN — no circular)

Design system (src/design-system/*)
  ✅ → nothing inside src/             (pure CSS + TS constants only)
```

---

## The 6 Layers

```
Layer 0  src/design-system/    Visual values — tokens, icons, illustrations, motion
Layer 1  src/components/ui/    Shadcn primitives — sealed, not imported by features
Layer 2  src/components/app/   App Component Library — product design system
Layer 3  src/shared/           Cross-feature composites, hooks, utilities
Layer 4  src/modules/          Feature modules — vertical slices, business logic
Layer 5  src/app/              Bootstrap — providers, router, root component
Layer 6  src/infrastructure/   Technical services — HTTP, auth, realtime, monitoring
```

Dependencies flow **downward only**: Layer 4 → Layer 2 → Layer 1 → Layer 0.
Reversing this direction at any point is an architectural violation.

---

## Naming Conventions

| Entity           | Convention                    | Example                    |
| ---------------- | ----------------------------- | -------------------------- |
| Component files  | PascalCase                    | `AppButton.tsx`            |
| Hook files       | camelCase + `use` prefix      | `useOrganizations.ts`      |
| Service files    | camelCase + `.service` suffix | `organizations.service.ts` |
| Query hook files | camelCase + `.queries` suffix | `organizations.queries.ts` |
| Zod schema files | camelCase + `.schema` suffix  | `organization.schema.ts`   |
| Type files       | camelCase + `.types` suffix   | `organization.types.ts`    |
| Store files      | camelCase + `.store` suffix   | `session.store.ts`         |
| Constant files   | camelCase                     | `constants.ts`             |
| CSS token files  | kebab-case                    | `colors.css`               |

---

## Adding a New App Component

1. Create folder: `src/components/app/AppComponentName/`
2. Create `AppComponentName.tsx` — CVA variants + implementation
3. Create `AppComponentName.types.ts` — exported TypeScript types
4. Create `AppComponentName.test.tsx` — render + variant + a11y tests
5. Create `index.ts` — re-exports component and types
6. Phase 14+: Create `AppComponentName.stories.tsx`

**Import from**: `@/components/app/AppComponentName` (never from the barrel `@/components/app`)

---

## Adding a New Feature Module

1. Create folder: `src/modules/{feature-name}/`
2. Create `api/{name}.service.ts` — Axios service functions
3. Create `api/{name}.queries.ts` — useQuery / useMutation hooks
4. Create `models/{name}.schema.ts` — Zod schemas + inferred types
5. Create `components/` — feature-local one-off components
6. Create the page component: `{FeatureName}Page.tsx`
7. Add the route to `src/routes/router.tsx`
8. Add path constants to `src/routes/paths.ts`
9. Add MSW handler to `src/infrastructure/mocks/handlers/{name}.handlers.ts`

---

## Implementation Phases

See `ROADMAP.md` for the complete phase sequence.
Current phase is tracked in the branch name: `platform/phase-X-*` or `feature/*`.

## Token Governance

### Adding a new color token

1. Add raw value to `--palette-*` in `colors.css` if the color is new
2. Add semantic alias in `:root {}` block with a descriptive name
3. Add `.dark {}` override — every light token MUST have a dark override
4. Add `--color-*: var(--)` entry to the `@theme inline` block in `src/index.css`
5. Never use `--palette-*` tokens directly in components — always the semantic alias

### Adding a new radius / shadow / spacing token

Only add tokens the design system explicitly specifies. Do not add tokens for
one-off values — use Tailwind arbitrary values (`rounded-[10px]`) for single uses.

### Modifying existing token values

Change the value in the token file only. Every component using that token
updates automatically. Never hunt for hex values in component files.

### Dark mode

Every semantic color token has a `.dark` override in `colors.css`.
Shadows have a `.dark` override in `shadows.css`.
Radius, spacing, animation, and typography tokens do NOT change between modes.
