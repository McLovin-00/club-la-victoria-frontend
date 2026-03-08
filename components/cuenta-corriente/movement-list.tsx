"use client";

// components/cuenta-corriente/movement-list.tsx
import { EmptyState } from "./empty-state";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { MovimientoCobrador } from "@/hooks/api/cobradores/useCobradorCuentaCorriente";
import {
  formatDateTime,
  formatCurrency,
  TipoMovimiento,
} from "@/lib/cuenta-corriente-utils";
import {
  TrendingUp,
  CreditCard,
  RefreshCw,
  Calendar,
  FileText,
} from "lucide-react";

interface MovementListProps {
  movimientos: MovimientoCobrador[];
  cobradorId: number;
  hasActiveFilters?: boolean;
  onClearFilters?: () => void;
}

const MOVIMIENTO_CONFIG: Record<
  TipoMovimiento,
  { label: string; color: string; rowClass: string; icon: typeof TrendingUp }
> = {
  COMISION_GENERADA: {
    label: "Comisión",
    color: "text-green-700",
    rowClass: "border-l-green-600 bg-green-50/40",
    icon: TrendingUp,
  },
  PAGO_A_COBRADOR: {
    label: "Pago",
    color: "text-blue-700",
    rowClass: "border-l-blue-600 bg-blue-50/40",
    icon: CreditCard,
  },
  AJUSTE: {
    label: "Ajuste",
    color: "text-orange-700",
    rowClass: "border-l-orange-500 bg-orange-50/40",
    icon: RefreshCw,
  },
};

const ITEMS_PER_PAGE = 10;

export function MovementList({ 
  movimientos, 
  cobradorId,
  hasActiveFilters = false,
  onClearFilters,
}: MovementListProps) {
  const [currentPage, setCurrentPage] = useState(1);

  if (cobradorId === 0) {
    return (
      <EmptyState 
        hasActiveFilters={false}
      />
    );
  }

  if (!movimientos || movimientos.length === 0) {
    return (
      <EmptyState 
        hasActiveFilters={hasActiveFilters}
        onClearFilters={onClearFilters}
      />
    );
  }

  // Sort movements by date (descending - most recent first)
  const sortedMovimientos = [...movimientos].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Pagination
  const totalPages = Math.ceil(sortedMovimientos.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedMovimientos = sortedMovimientos.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Movimientos del Período</CardTitle>
          <Badge variant="secondary" className="text-xs">
            {movimientos.length} movimientos
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {paginatedMovimientos.map((movimiento) => {
            const config = MOVIMIENTO_CONFIG[movimiento.tipoMovimiento];
            const Icon = config.icon;

            return (
              <div
                key={movimiento.id}
                className={`flex flex-col gap-3 rounded-lg border border-l-4 p-4 md:flex-row md:items-start md:justify-between ${config.rowClass}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 ${config.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{config.label}</p>
                      <Badge variant="secondary" className="text-[11px] font-medium">
                        {movimiento.tipoMovimiento.replaceAll("_", " ")}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {formatDateTime(
                            movimiento.detalleCobro?.fechaHoraCobro ?? movimiento.createdAt,
                          )}
                        </span>
                      </div>

                      {movimiento.referencia && (
                        <div className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          <span>Ref: {movimiento.referencia}</span>
                        </div>
                      )}
                    </div>

                    {movimiento.observacion && (
                      <p className="text-xs text-muted-foreground">
                        {movimiento.observacion}
                      </p>
                    )}

                    {movimiento.detalleCobro && (
                      <div className="rounded-md border bg-background/70 px-2 py-1.5 text-xs text-muted-foreground">
                        {movimiento.detalleCobro.socio && (
                          <p>
                            Socio: {movimiento.detalleCobro.socio.apellido}, {movimiento.detalleCobro.socio.nombre}
                          </p>
                        )}
                        {movimiento.detalleCobro.cuotas.length > 0 && (
                          <p>
                            Cuotas: {movimiento.detalleCobro.cuotas
                              .map((cuota: { cuotaId?: number; periodo?: string }) => {
                                const periodo = cuota.periodo ? ` (${cuota.periodo})` : "";
                                return periodo.replace(/[()]/g, "").trim();
                              })
                              .join(", ")}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-left md:text-right">
                  <p className={`text-lg font-semibold ${config.color}`}>
                    {formatCurrency(movimiento.monto)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  // Show first page, last page, current page, and pages around current
                  const showPage =
                    page === 1 ||
                    page === totalPages ||
                    Math.abs(page - currentPage) <= 1;

                  if (!showPage) {
                    if (page === 2 || page === totalPages - 1) {
                      return (
                        <PaginationItem key={page}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      );
                    }
                    return null;
                  }

                  return (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => handlePageChange(page)}
                        isActive={currentPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
