import { useNavigate, useRouteError, isRouteErrorResponse } from "react-router-dom";

export function ErrorPage() {
  const error = useRouteError();
  const navigate = useNavigate();

  const isNotFound = isRouteErrorResponse(error) && error.status === 404;

  const title = isNotFound ? "Page not found" : "Something went wrong";
  const message = isNotFound
    ? "The page you're looking for doesn't exist."
    : "An unexpected error occurred. Our team has been notified.";

  const statusCode = isRouteErrorResponse(error) ? error.status : 500;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="text-center space-y-4 max-w-sm">
        <p className="font-mono text-5xl font-bold text-muted-foreground">{statusCode}</p>
        <h1 className="font-heading text-xl font-semibold text-foreground">{title}</h1>
        <p className="font-body text-sm text-muted-foreground">{message}</p>

        {/* Dev-only error details */}
        {import.meta.env.DEV && error instanceof Error && (
          <pre
            className="mt-4 rounded-lg bg-code p-4 text-left text-xs
                          font-mono text-code-foreground overflow-auto max-h-48"
          >
            {error.message}
            {"\n"}
            {error.stack}
          </pre>
        )}

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center rounded-lg border border-border
                       bg-background px-4 py-2 text-sm font-medium text-foreground
                       hover:bg-accent transition-colors"
          >
            Go back
          </button>
          <button
            onClick={() => window.location.assign("/")}
            className="inline-flex items-center rounded-lg bg-primary px-4 py-2
                       text-sm font-medium text-primary-foreground
                       hover:bg-primary-hover transition-colors"
          >
            Reload app
          </button>
        </div>
      </div>
    </div>
  );
}
