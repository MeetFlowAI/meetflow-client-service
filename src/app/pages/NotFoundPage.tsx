import { Link } from "react-router-dom";
import { paths } from "@/routes/paths";

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="text-center space-y-4 max-w-sm">
        <p className="font-mono text-5xl font-bold text-primary">404</p>
        <h1 className="font-heading text-xl font-semibold text-foreground">Page not found</h1>
        <p className="font-body text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
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
  );
}
