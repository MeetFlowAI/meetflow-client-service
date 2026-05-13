// ── MeetFlow V2 — Application Root ─────────────────────────────────────────
//
// Phase 0: Minimal bootstrap shell. This file grows across phases:
//
//   Phase 2: Wrapped in <AppProviders> (QueryClient, ThemeProvider, Router)
//   Phase 3: Router outlet renders feature module pages
//   Phase 9+: Feature modules replace the placeholder content
//
// Do NOT add business logic, API calls, or styling decisions here.
// This file's only job is to compose top-level providers and the router.

export function App() {
  return (
    <div className="min-h-screen bg-white p-8 font-sans">
      <div className="max-w-lg">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">MeetFlow V2</h1>
        <p className="mt-1 text-sm text-gray-500">Platform Bootstrap — Phase 0</p>

        <div className="mt-6 space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <span className="text-green-500">✓</span>
            <span>Vite 8 + React 19 + TypeScript 6</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-500">✓</span>
            <span>Tailwind CSS v4</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-500">✓</span>
            <span>ESLint v10 + architectural enforcement</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-500">✓</span>
            <span>Prettier + Husky + lint-staged</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-yellow-500">○</span>
            <span>Design system tokens — Phase 1</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-yellow-500">○</span>
            <span>Infrastructure + providers — Phase 2</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-yellow-500">○</span>
            <span>App Component Library — Phase 5</span>
          </div>
        </div>
      </div>
    </div>
  );
}
