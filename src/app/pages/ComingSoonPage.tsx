import { useLocation } from "react-router-dom";

/**
 * Placeholder rendered by all feature routes that haven't been
 * implemented yet. Replaced module-by-module from Phase 9 onward.
 *
 * DELETE THIS FILE once every route has its real implementation.
 */
export function ComingSoonPage() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="text-center space-y-3 max-w-sm">
        {/* Visual indicator this is a placeholder */}
        <div
          className="mx-auto h-12 w-12 rounded-xl bg-primary-subtle
                        flex items-center justify-center"
        >
          <span className="font-mono text-lg font-bold text-primary">V2</span>
        </div>
        <h1 className="font-heading text-lg font-semibold text-foreground">Route registered</h1>
        <p className="font-body text-sm text-muted-foreground">
          This module is not yet implemented.
        </p>
        <code
          className="block rounded-lg bg-code px-3 py-2
                         font-mono text-xs text-code-foreground"
        >
          {location.pathname}
        </code>
        <p className="font-body text-xs text-muted-foreground">
          Guards, layouts, and navigation are working. Feature implementation begins in Phase 9.
        </p>
      </div>
    </div>
  );
}
