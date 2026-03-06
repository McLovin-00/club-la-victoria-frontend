// components/cuenta-corriente/movement-list.tsx
"use client";

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
import { formatDate, formatCurrency, TipoMovimiento } from "@/lib/cuenta-corriente-utils";
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
}

const MOVIMIENTO_CONFIG: Record<
  TipoMovimiento,
  { label: string; color: string; bgColor: string; icon: typeof TrendingUp }
> = {
  COMISION_GENERADA: {
    label: "Comisión",
    color: "text-green-700",
    bgColor: "bg-green-50 border-green-200",
    icon: TrendingUp,
  },
  PAGO_A_COBRADOR: {
    label: "Pago",
    color: "text-blue-700",
    bgColor: "bg-blue-50 border-blue-200",
    icon: CreditCard,
  },
  AJUSTE: {
    label: "Ajuste",
    color: "text-orange-700",
    bgColor: "bg-orange-50 border-orange-200",
    icon: RefreshCw,
  },
};

const ITEMS_PER_PAGE = 10;

export function MovementList({ movimientos, cobradorId }: MovementListProps) {
  const [currentPage, setCurrentPage] = useState(1);

  if (cobradorId === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Movimientos del Período</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Seleccione un cobrador para ver sus movimientos.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!movimientos || movimientos.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Movimientos del Período</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Sin movimientos en el período actual.
          </p>
        </CardContent>
      </Card>
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
                className={`flex items-start justify-between rounded-lg border p-4 ${config.bgColor}`}
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className={`mt-0.5 ${config.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>

                  {/* Content */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{config.label}</p>
                      <Badge variant="outline" className="text-xs">
                        {movimiento.tipoMovimiento}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(movimiento.createdAt)}</span>
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
                  </div>
                </div>

                {/* Amount */}
                <div className="text-right">
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
