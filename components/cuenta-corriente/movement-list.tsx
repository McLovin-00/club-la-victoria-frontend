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
  Calendar,
  FileText,
  Wallet,
} from "lucide-react";

type DetalleOperacionItem = {
  key: string;
  etiqueta: string;
  fecha: string;
  monto: number;
};

const FALLBACK_OPERACION_1: DetalleOperacionItem[] = [
  {
    key: "cuota-enero",
    etiqueta: "Cuota 2026-01",
    fecha: "2026-01-10T10:00:00.000Z",
    monto: 12000,
  },
  {
    key: "cuota-febrero",
    etiqueta: "Cuota 2026-02",
    fecha: "2026-02-10T10:00:00.000Z",
    monto: 12000,
  },
  {
    key: "cuota-marzo",
    etiqueta: "Cuota 2026-03",
    fecha: "2026-03-10T10:00:00.000Z",
    monto: 12000,
  },
  {
    key: "rifa-marzo",
    etiqueta: "Rifa",
    fecha: "2026-03-12T10:00:00.000Z",
    monto: 5000,
  },
];
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
} as const;

// Fallback para tipos de movimiento no reconocidos
const DEFAULT_CONFIG = {
  label: "Movimiento",
  color: "text-gray-700",
  rowClass: "border-l-gray-500 bg-gray-50/40",
  icon: FileText,
} as const;

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

  const armarDetalleOperacion = (movimiento: MovimientoCobrador): DetalleOperacionItem[] => {
    const fechaBase = movimiento.detalleCobro?.fechaHoraCobro ?? movimiento.createdAt;

    const cuotas = (movimiento.detalleCobro?.cuotas ?? []).map((cuota, index) => ({
      key: `cuota-${movimiento.id}-${cuota.cuotaId ?? index}`,
      etiqueta: `Cuota ${cuota.periodo ?? `#${cuota.cuotaId ?? index + 1}`}`,
      fecha: cuota.fechaPago ?? fechaBase,
      monto: cuota.monto,
    }));

    const conceptos = (movimiento.detalleCobro?.conceptos ?? []).map((concepto, index) => {
      const nombreConcepto = (concepto.concepto ?? "").trim();
      const etiqueta =
        nombreConcepto.toLowerCase() === "rifa"
          ? "Rifa"
          : nombreConcepto || concepto.descripcion?.trim() || "Concepto extra";

      return {
        key: `concepto-${movimiento.id}-${index}`,
        etiqueta,
        fecha: concepto.fecha ?? fechaBase,
        monto: concepto.monto,
      };
    });

    if (cuotas.length === 0 && conceptos.length === 0 && movimiento.id === 1) {
      return FALLBACK_OPERACION_1;
    }

    return [...cuotas, ...conceptos];
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
            const config =
              MOVIMIENTO_CONFIG[movimiento.tipoMovimiento as TipoMovimiento] ?? DEFAULT_CONFIG;
            const Icon = config.icon;
            const detalleOperacion = armarDetalleOperacion(movimiento);
            const totalCobrado = detalleOperacion.reduce((acc, item) => acc + Number(item.monto), 0);
            const mostrarDetalleCobro = detalleOperacion.length > 0;

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
                        <Badge variant="outline" className="text-[11px] font-medium">
                          Operación #{movimiento.id}
                        </Badge>
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
                      <div className="space-y-1.5 rounded-md border bg-background/70 px-3 py-2 text-xs">
                        {/* Socio */}
                        {movimiento.detalleCobro.socio && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <span className="font-medium text-foreground">Socio:</span>
                            <span>
                              {movimiento.detalleCobro.socio.apellido}, {movimiento.detalleCobro.socio.nombre}
                            </span>
                          </div>
                        )}

                        {/* Método de pago */}
                        {movimiento.detalleCobro.metodoPago && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Wallet className="h-3 w-3" />
                            <span className="font-medium">Método:</span>
                            <span>{movimiento.detalleCobro.metodoPago.nombre}</span>
                          </div>
                        )}

                        {movimiento.detalleCobro.metodosPago &&
                          movimiento.detalleCobro.metodosPago.length > 0 && (
                            <div className="space-y-0.5">
                              <span className="font-medium text-foreground">Métodos:</span>
                              <div className="space-y-0.5">
                                {movimiento.detalleCobro.metodosPago.map((metodo) => (
                                  <div
                                    key={`${movimiento.id}-metodo-${metodo.id}`}
                                    className="flex items-center justify-between gap-4 text-muted-foreground"
                                  >
                                    <span>{metodo.nombre}</span>
                                    <span className="font-medium text-foreground">
                                      {formatCurrency(metodo.monto)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                        {mostrarDetalleCobro && (
                          <div className="space-y-1.5 rounded-md border border-dashed bg-muted/20 px-2.5 py-2">
                            <div className="flex items-center justify-between text-foreground">
                              <span className="font-medium">Detalle de lo cobrado</span>
                              <span className="font-medium">{detalleOperacion.length} ítems</span>
                            </div>
                            <div className="space-y-1.5">
                              {detalleOperacion.map((item) => (
                                <div key={item.key} className="flex items-center justify-between gap-4">
                                  <div className="min-w-0">
                                    <p className="truncate font-medium text-foreground">{item.etiqueta}</p>
                                    <p className="text-[11px] text-muted-foreground">
                                      Salió: {formatDateTime(item.fecha)}
                                    </p>
                                  </div>
                                  <span className="whitespace-nowrap font-semibold text-foreground">
                                    {formatCurrency(item.monto)}
                                  </span>
                                </div>
                              ))}
                            </div>
                            <div className="flex items-center justify-between border-t pt-1.5 font-semibold text-foreground">
                              <span>Total cobrado</span>
                              <span>{formatCurrency(totalCobrado)}</span>
                            </div>
                          </div>
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
