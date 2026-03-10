'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, Home, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Global Error Boundary]', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
      <div className="max-w-md w-full space-y-6 text-center">
        <div className="flex justify-center">
          <div className="rounded-full bg-destructive/10 p-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Algo salió mal</h2>
          <p className="text-muted-foreground">
            Ocurrió un error inesperado. Por favor, intentá nuevamente.
          </p>
        </div>

        <div className="bg-muted rounded-lg p-4 text-left">
          <p className="text-xs font-mono text-muted-foreground break-all">
            {error.message}
          </p>
          {error.digest && (
            <p className="text-xs text-muted-foreground mt-2">
              Error ID: {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={reset}
            className="flex items-center gap-2"
            variant="default"
          >
            <RefreshCw className="h-4 w-4" />
            Reintentar
          </Button>
          <Button
            asChild
            variant="outline"
            className="flex items-center gap-2"
          >
            <Link href="/">
              <Home className="h-4 w-4" />
              Volver al inicio
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

