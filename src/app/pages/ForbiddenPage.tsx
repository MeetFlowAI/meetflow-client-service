import { Link, useNavigate } from "react-router-dom";
import { paths } from "@/routes/paths";

export function ForbiddenPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="text-center space-y-4 max-w-sm">
        <p className="font-mono text-5xl font-bold text-destructive">403</p>
        <h1 className="font-heading text-xl font-semibold text-foreground">Access denied</h1>
        <p className="font-body text-sm text-muted-foreground">
          You don't have permission to view this page. Contact your administrator if you believe
          this is a mistake.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-lg border border-border
                       bg-background px-4 py-2 text-sm font-medium text-foreground
                       hover:bg-accent transition-colors"
          >
            Go back
          </button>
          <Link
            to={paths.root}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2
                       text-sm font-medium text-primary-foreground
                       hover:bg-primary-hover transition-colors"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
