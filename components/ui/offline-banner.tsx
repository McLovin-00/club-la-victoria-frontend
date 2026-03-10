'use client';

import { useState, useEffect } from 'react';
import { WifiOff, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    setIsOffline(!navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <Alert variant="warning" className="mb-4">
      <div className="flex items-center gap-2">
        <WifiOff className="h-4 w-4" />
        <AlertDescription>
          No hay conexión a internet. Los cambios se guardarán cuando vuelvas a conectarte.
        </AlertDescription>
      </div>
    </Alert>
  );
}
