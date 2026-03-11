import { useRouteError, Link } from 'react-router';
import { AlertTriangle, Home } from 'lucide-react';

export function GlobalErrorLayout() {
  const error = useRouteError();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="bg-card w-full max-w-lg rounded-xl shadow-lg border border-border p-8 text-center">
        <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-4">Application Error</h1>
        <p className="text-muted-foreground mb-6">
          We're sorry, but an unexpected error occurred. 
        </p>
        <div className="bg-muted p-4 rounded-md text-left overflow-auto mb-8">
          <p className="text-sm font-mono text-destructive">
            {error?.statusText || error?.message || "Unknown Application Error"}
          </p>
        </div>
        <Link 
          to="/" 
          onClick={() => window.location.href = '/'}
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Home className="h-4 w-4" />
          Reload Dashboard
        </Link>
      </div>
    </div>
  );
}
