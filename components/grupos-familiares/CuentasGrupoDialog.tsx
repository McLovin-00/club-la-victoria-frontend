import { useMemo, useState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Loader2, RefreshCw, TrendingDown, TrendingUp, Users, Eye, AlertCircle } from 'lucide-react';

import { useCuentasGrupoFamiliar } from '@/hooks/api/cobros/useCuentasGrupoFamiliar';

const formatMes = (mesStr: string) => {
  const [, month] = mesStr.split('-');
  const date = new Date(2000, parseInt(month, 10) - 1, 1);
  return date.toLocaleDateString('es-AR', { month: 'short' }).replace('.', '');
};

const renderEstadoMes = (cuotas: { periodo: string; estado: string }[] | undefined, mes: string) => {
  const cuota = cuotas?.find((c) => c.periodo === mes);
  if (cuota?.estado === 'PAGADA') {
    return <span className="text-status-success font-bold text-lg" aria-label="Estado: Pagado">✓</span>;
  }
  if (cuota?.estado === 'PENDIENTE') {
    return <span className="text-status-error font-bold text-lg" aria-label="Estado: Adeudado">✗</span>;
  }
  return <span className="text-muted-foreground" aria-label="Sin datos">-</span>;
};

const formatEstadoSocio = (estado?: string) => {
  if (!estado) {
    return '-';
  }

  const normalized = estado.toLowerCase();
  if (normalized === 'activo') {
    return 'Activo';
  }
  if (normalized === 'inactivo') {
    return 'Inactivo';
  }

  return estado.charAt(0).toUpperCase() + estado.slice(1).toLowerCase();
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
  const currentYear = new Date().getFullYear();
  const [anioSeleccionado, setAnioSeleccionado] = useState(currentYear);

  const aniosDisponibles = useMemo(
    () => Array.from({ length: 8 }, (_, i) => currentYear - 5 + i),
    [currentYear],
  );

  const meses = useMemo(
    () => Array.from({ length: 12 }, (_, i) => `${anioSeleccionado}-${String(i + 1).padStart(2, '0')}`),
    [anioSeleccionado],
  );

  const { cuentas, isLoading, error, memberErrors } = useCuentasGrupoFamiliar(grupoId || 0, anioSeleccionado);

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
      <DialogContent className="flex max-h-[90vh] w-[98vw] flex-col overflow-hidden p-0 sm:w-[97vw] sm:max-w-[1400px]">
        <DialogHeader className="border-b px-6 py-4 sm:px-8">
          <DialogTitle className="pr-8 leading-tight sm:pr-10">
            Cuentas del Grupo: {grupoNombre}
          </DialogTitle>
          <DialogDescription>
            Resumen de cuentas del grupo familiar seleccionado
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4 sm:px-8">
          {isLoading ? (
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
              <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <Card className="min-w-0 border-l-4 border-l-status-success">
                  <CardContent className="pt-6">
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="rounded-lg bg-status-success-muted p-2">
                        <TrendingUp className="h-6 w-6 text-status-success" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm text-muted-foreground">Total Pagado</p>
                        <p className="text-xl font-bold text-status-success sm:text-2xl">
                          {formatCurrency(cuentas?.totalPagado ?? 0)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="min-w-0 border-l-4 border-l-status-error">
                  <CardContent className="pt-6">
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="rounded-lg bg-status-error-muted p-2">
                        <TrendingDown className="h-6 w-6 text-status-error" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm text-muted-foreground">Deuda Total</p>
                        <p className="text-xl font-bold text-status-error sm:text-2xl">
                          {formatCurrency(cuentas?.totalDeuda ?? 0)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="min-w-0 border-l-4 border-l-status-warning sm:col-span-2 xl:col-span-1">
                  <CardContent className="pt-6">
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="rounded-lg bg-status-warning-muted p-2">
                        <Users className="h-6 w-6 text-status-warning" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm text-muted-foreground">Estado del Grupo</p>
                        <p className="text-base font-bold leading-tight text-status-warning sm:text-lg">
                          {cuentas?.sociosAlDia ?? 0} al día, {cuentas?.sociosEnDeuda ?? 0} en deuda
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="mt-6">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="text-lg font-semibold">Estado por Miembro</h3>
                  <div className="w-full sm:w-[180px]">
                    <Select
                      value={String(anioSeleccionado)}
                      onValueChange={(value) => setAnioSeleccionado(Number.parseInt(value, 10))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar año" />
                      </SelectTrigger>
                      <SelectContent>
                        {aniosDisponibles.map((anio) => (
                          <SelectItem key={anio} value={String(anio)}>
                            {anio}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <p className="mb-3 text-xs text-muted-foreground sm:hidden">
                  Desliza la tabla hacia los lados para ver todos los meses.
                </p>
                
                <div className="hidden md:block">
                  <ScrollArea className="h-[min(52vh,430px)] w-full rounded-md border">
                    <Table className="min-w-[1120px]">
                      <TableHeader>
                        <TableRow>
                          <TableHead className="min-w-[160px] sticky left-0 bg-background z-10 shadow-[var(--shadow-sticky-right)]">Nombre</TableHead>
                          <TableHead className="min-w-[110px]">Estado</TableHead>
                          <TableHead>Deuda</TableHead>
                          <TableHead className="min-w-[96px] text-center whitespace-nowrap">Meses Adeudados</TableHead>
                          {meses.map((mes) => (
                            <TableHead key={mes} className="text-center min-w-[60px] whitespace-nowrap">
                              {formatMes(mes)}
                            </TableHead>
                          ))}
                          <TableHead className="text-right sticky right-0 bg-background z-10 shadow-[var(--shadow-sticky-left)]">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {cuentas.miembros.map((miembro) => {
                          const hasError = memberErrors?.some((e) => e.socioId === miembro.socioInfo.id);
                          const isMoroso = miembro.socioInfo.estado?.toLowerCase() === 'moroso';
                          const stickyBgClass = 'bg-background';
                          const cuotasPendientes =
                            miembro.cuenta?.cuotas.filter((c) => c.estado === 'PENDIENTE').length || 0;

                          return (
                            <TableRow
                              key={miembro.socioInfo.id}
                              className={
                                isMoroso
                                  ? 'group [&>td]:bg-status-error-muted/50 hover:[&>td]:bg-status-error-muted/70'
                                  : 'group hover:bg-transparent hover:[&>td]:bg-muted/50'
                              }
                            >
                              <TableCell className={`font-medium whitespace-nowrap sticky left-0 z-10 shadow-[var(--shadow-sticky-right)] ${stickyBgClass}`}>
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
                              <TableCell>{formatEstadoSocio(miembro.socioInfo.estado)}</TableCell>
                              <TableCell>{miembro.cuenta ? formatCurrency(miembro.cuenta.totalDeuda) : '-'}</TableCell>
                              <TableCell className="text-center">{miembro.cuenta ? cuotasPendientes : '-'}</TableCell>
                              {meses.map((mes) => (
                                <TableCell key={mes} className="text-center">
                                  {renderEstadoMes(miembro.cuenta?.cuotas, mes)}
                                </TableCell>
                              ))}
                              <TableCell className={`text-right sticky right-0 z-10 shadow-[var(--shadow-sticky-left)] ${stickyBgClass}`}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" asChild aria-label="Ver cuenta corriente">
                                      <Link href={`/socios/${miembro.socioInfo.id}/cuenta-corriente`}>
                                        <Eye className="h-4 w-4" />
                                      </Link>
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent sideOffset={8}>Ver cuenta corriente</TooltipContent>
                                </Tooltip>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </div>

                <div className="space-y-3 md:hidden">
                  {cuentas.miembros.map((miembro) => {
                    const hasError = memberErrors?.some((e) => e.socioId === miembro.socioInfo.id);
                    const isMoroso = miembro.socioInfo.estado?.toLowerCase() === 'moroso';
                    const cuotasPendientes =
                      miembro.cuenta?.cuotas.filter((c) => c.estado === 'PENDIENTE').length || 0;

                    return (
                      <div
                        key={miembro.socioInfo.id}
                        className={`space-y-3 rounded-lg border p-4 ${isMoroso ? 'bg-status-error-muted/50' : ''}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold">
                              {miembro.socioInfo.nombre} {miembro.socioInfo.apellido}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Estado: {formatEstadoSocio(miembro.socioInfo.estado)}
                            </p>
                          </div>
                          <div className="flex gap-1">
                            {hasError && (
                              <Badge variant="destructive" className="text-[10px] h-5 px-1.5">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                Error
                              </Badge>
                            )}
                            {!miembro.cuenta && !hasError && (
                              <Badge variant="outline" className="text-[10px] h-5 px-1.5 text-muted-foreground">
                                Sin datos
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="rounded-lg bg-muted/50 p-2">
                            <p className="text-xs text-muted-foreground">Deuda</p>
                            <p className="font-bold text-status-error">
                              {miembro.cuenta ? formatCurrency(miembro.cuenta.totalDeuda) : '-'}
                            </p>
                          </div>
                          <div className="rounded-lg bg-muted/50 p-2">
                            <p className="text-xs text-muted-foreground">Meses adeudados</p>
                            <p className="font-bold">
                              {miembro.cuenta ? cuotasPendientes : '-'}
                            </p>
                          </div>
                        </div>

                        <div className="pt-2 border-t">
                          <p className="text-xs text-muted-foreground mb-2">Estado mensual</p>
                          <div className="grid grid-cols-4 gap-1">
                            {meses.map((mes) => (
                              <div key={mes} className="text-center p-1.5 rounded bg-muted/30">
                                <p className="text-[10px] text-muted-foreground">{formatMes(mes)}</p>
                                <div className="text-base">
                                  {renderEstadoMes(miembro.cuenta?.cuotas, mes)}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="pt-2 border-t">
                          <Button variant="outline" size="sm" className="w-full" asChild>
                            <Link href={`/socios/${miembro.socioInfo.id}/cuenta-corriente`}>
                              <Eye className="h-4 w-4 mr-1" />
                              Ver cuenta corriente
                            </Link>
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="border-t px-6 py-4 sm:px-8">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
