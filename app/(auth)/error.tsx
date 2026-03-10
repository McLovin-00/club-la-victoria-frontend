'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error('[Auth Error Boundary]', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
      <div className="max-w-md w-full space-y-6 text-center">
        <div className="flex justify-center">
          <div className="rounded-full bg-warning/10 p-4">
            <AlertTriangle className="h-12 w-12 text-warning" />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Error en el dashboard</h2>
          <p className="text-muted-foreground">
            Hubo un problema al cargar esta sección. Por favor, intentá nuevamente.
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
            onClick={() => router.back()}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver atrás
          </Button>
        </div>
      </div>
    </div>
  );
}
