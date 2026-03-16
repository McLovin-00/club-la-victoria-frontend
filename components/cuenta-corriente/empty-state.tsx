// components/cuenta-corriente/empty-state.tsx
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileX, Search } from "lucide-react";

interface EmptyStateProps {
  hasActiveFilters: boolean;
  onClearFilters?: () => void;
}

export function EmptyState({ hasActiveFilters, onClearFilters }: EmptyStateProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="rounded-full bg-muted p-4 mb-4">
          {hasActiveFilters ? (
            <Search className="h-8 w-8 text-muted-foreground" />
          ) : (
            <FileX className="h-8 w-8 text-muted-foreground" />
          )}
        </div>

        <h3 className="text-lg font-semibold mb-2">
          {hasActiveFilters ? "Sin resultados" : "Sin movimientos"}
        </h3>

        <p className="text-sm text-muted-foreground text-center max-w-sm mb-4">
          {hasActiveFilters
            ? "No se encontraron movimientos con los filtros aplicados. Intenta ampliar el rango de fechas o limpiar los filtros."
            : "Este cobrador no tiene movimientos en el período seleccionado. Los movimientos aparecerán aquí una vez que se registren pagos o comisiones."}
        </p>

        {hasActiveFilters && onClearFilters && (
          <Button onClick={onClearFilters} variant="outline">
            Limpiar filtros
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
