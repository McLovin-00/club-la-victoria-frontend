import { useEffect, useState } from 'react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw, TrendingDown, TrendingUp, Users, Eye, AlertCircle } from 'lucide-react';

import { useCuentasGrupoFamiliar } from '@/hooks/api/cobros/useCuentasGrupoFamiliar';
const meses = Array.from({ length: 12 }, (_, i) => {
  const date = new Date();
  date.setMonth(date.getMonth() - 11 + i);
  return date.toISOString().slice(0, 7); // "2024-01" format
});

const formatMes = (mesStr: string) => {
  const [year, month] = mesStr.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString('es-AR', { month: 'short', year: '2-digit' }).replace('.', '');
};

const renderEstadoMes = (cuotas: any[] | undefined, mes: string) => {
  const cuota = cuotas?.find((c: any) => c.periodo === mes);
  if (cuota?.estado === 'PAGADA') {
    return <span className="text-green-600 font-bold text-lg" aria-label="Pagado">✓</span>;
  }
  if (cuota?.estado === 'PENDIENTE') {
    return <span className="text-red-600 font-bold text-lg" aria-label="Adeudado">✗</span>;
  }
  return <span className="text-muted-foreground">-</span>;
};

interface CuentasGrupoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  grupoId: number | null;
  grupoNombre: string;
}

export function CuentasGrupoDialog({
  open,
  onOpenChange,
  grupoId,
  grupoNombre,
}: CuentasGrupoDialogProps) {
  const { cuentas, isLoading, error, memberErrors } = useCuentasGrupoFamiliar(grupoId || 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl w-[95vw]">
        <DialogHeader>
          <DialogTitle>Cuentas del Grupo: {grupoNombre}</DialogTitle>
          <DialogDescription>
            Resumen de cuentas del grupo familiar seleccionado
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          JQ|          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Cargando cuentas...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <AlertCircle className="h-10 w-10 text-destructive mb-3" />
              <p className="text-destructive font-medium">Error al cargar las cuentas</p>
              <p className="text-sm text-muted-foreground mb-4">
                {error instanceof Error ? error.message : "Error desconocido"}
              </p>
              <Button variant="outline" onClick={() => window.location.reload()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Reintentar
              </Button>
            </div>
          ) : cuentas.miembros.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Users className="h-10 w-10 text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground font-medium">Este grupo no tiene miembros asignados</p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                Asigna socios al grupo para ver sus cuentas
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                <Card className="border-l-4 border-l-green-500">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="rounded-lg bg-green-100 p-2">
                        <TrendingUp className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Pagado</p>
                        <p className="text-2xl font-bold text-green-600">
                          {formatCurrency(cuentas?.totalPagado ?? 0)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-l-4 border-l-red-500">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="rounded-lg bg-red-100 p-2">
                        <TrendingDown className="h-6 w-6 text-red-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Deuda Total</p>
                        <p className="text-2xl font-bold text-red-600">
                          {formatCurrency(cuentas?.totalDeuda ?? 0)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-l-4 border-l-amber-500">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="rounded-lg bg-amber-100 p-2">
                        <Users className="h-6 w-6 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Estado del Grupo</p>
                        <p className="text-lg font-bold text-amber-600">
                          {cuentas?.sociosAlDia ?? 0} al día, {cuentas?.sociosEnDeuda ?? 0} en deuda
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">Estado por Miembro</h3>
                <ScrollArea className="h-[400px] rounded-md border w-full">
                  <Table className="min-w-max">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[150px] sticky left-0 bg-background z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Nombre</TableHead>
                        <TableHead>Deuda</TableHead>
                        <TableHead>Pagado</TableHead>
                        <TableHead>Meses Adeudados</TableHead>
                        {meses.map((mes) => (
                          <TableHead key={mes} className="text-center min-w-[60px] whitespace-nowrap">
                            {formatMes(mes)}
                          </TableHead>
                        ))}
                        <TableHead className="text-right sticky right-0 bg-background z-10 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)]">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cuentas.miembros.map((miembro) => {
                        const hasError = memberErrors?.some((e) => e.socioId === miembro.socioInfo.id);
                        const cuotasPendientes =
                          miembro.cuenta?.cuotas.filter((c: any) => c.estado === 'PENDIENTE').length || 0;

                        return (
                          <TableRow key={miembro.socioInfo.id}>
                            <TableCell className="font-medium whitespace-nowrap sticky left-0 bg-background z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                              <div className="flex items-center gap-2">
                                <span>
                                  {miembro.socioInfo.nombre} {miembro.socioInfo.apellido}
                                </span>
                                {hasError && (
                                  <Badge variant="destructive" className="text-[10px] h-5 px-1.5 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    Error
                                  </Badge>
                                )}
                                {!miembro.cuenta && !hasError && (
                                  <Badge variant="outline" className="text-[10px] h-5 px-1.5 text-muted-foreground">
                                    Sin datos
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{miembro.cuenta ? formatCurrency(miembro.cuenta.totalDeuda) : '-'}</TableCell>
                            <TableCell>{miembro.cuenta ? formatCurrency(miembro.cuenta.totalPagado) : '-'}</TableCell>
                            <TableCell>{miembro.cuenta ? cuotasPendientes : '-'}</TableCell>
                            {meses.map((mes) => (
                              <TableCell key={mes} className="text-center">
                                {renderEstadoMes(miembro.cuenta?.cuotas, mes)}
                              </TableCell>
                            ))}
                            <TableCell className="text-right sticky right-0 bg-background z-10 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                              <Button variant="ghost" size="icon" asChild>
                                <Link href={`/socios/${miembro.socioInfo.id}/cuenta-corriente`}>
                                  <Eye className="h-4 w-4" />
                                  <span className="sr-only">Ver cuenta</span>
                                </Link>
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
