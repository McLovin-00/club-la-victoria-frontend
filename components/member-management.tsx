"use client";
import React from "react";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Edit,
  Eye,
  FileText,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Plus,
  Search,
  Trash2,
  User,
  Users,
  Calendar,
  CreditCard,
} from "lucide-react";


import { useDeleteSocio } from "@/hooks/api/socios/useDeleteSocio";
import { useSocios } from "@/hooks/api/socios/useSocios";
import { ESTADO_SOCIO, PAGINACION } from "@/lib/constants";
import { SocioWithFoto } from "@/lib/types";
import { getEstadoBadgeVariant, getCategoriaBadgeClasses } from "@/lib/utils/badges";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ResponsiveTable } from "@/components/ui/responsive-table";

type SocioListado = SocioWithFoto & {
  categoria?: { nombre?: string } | string | null;
  categoriaNombre?: string;
  nombreCategoria?: string;
};

const getNombreCategoria = (socio: SocioListado): string => {
  if (typeof socio.categoria === "string") return socio.categoria;
  if (socio.categoria?.nombre) return socio.categoria.nombre;
  return socio.categoriaNombre || socio.nombreCategoria || "Sin categoría";
};

const formatDate = (dateString?: string): string => {
  if (!dateString) return "-";
  try {
    return new Date(dateString).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
};

export const MemberManagement = React.memo(function MemberManagement() {
  const [selectedSocio, setSelectedSocio] = useState<SocioListado | null>(null);
  const {
    data: sociosPaginados,
    total,
    page: currentPage,
    limit: sociosPorPagina,
    handleLimitChange,
    searchTerm,
    setSearch,
    totalPages,
    isLoading: isLoadingSocios,
    prevPage,
    nextPage,
    hasNextPage,
    hasPreviousPage,
  } = useSocios();
  const { mutate: deleteSocio, isPending: isLoadingDelete } = useDeleteSocio();

  const socios = sociosPaginados as SocioListado[];

  const handleDeleteSocio = (id: string) => {
    deleteSocio(id);
  };

  const startIndex = (currentPage - 1) * sociosPorPagina;

  const renderEstadoBadge = (estado: ESTADO_SOCIO) => {
    return (
      <Badge variant={getEstadoBadgeVariant(estado)}>
        {estado === ESTADO_SOCIO.ACTIVO ? "Activo" : estado === ESTADO_SOCIO.MOROSO ? "Moroso" : "Inactivo"}
      </Badge>
    )
  }

  const renderCategoriaBadge = (socio: SocioListado) => {
    const nombreCategoria = getNombreCategoria(socio);

    return (
      <Badge
        variant="outline"
        className={`${getCategoriaBadgeClasses(nombreCategoria)} font-medium`}
      >
        {nombreCategoria}
      </Badge>
    );
  }

  const renderActionButtons = (socio: SocioListado) => {
    return (
      <div className="flex items-center justify-end gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedSocio(socio)}
              aria-label="Ver detalles"
              className="text-blue-600 border-blue-600 hover:bg-blue-600 hover:text-white bg-transparent"
            >
              <Eye className="h-4 w-4" />
              <span className="sr-only">Ver detalles</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent sideOffset={8}>Ver detalles</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Link href={`/socios/${socio.id}/edit`}>
              <Button
                variant="outline"
                size="sm"
                aria-label="Editar socio"
                className="text-primary border-primary hover:bg-primary hover:text-primary-foreground bg-transparent"
              >
                <Edit className="h-4 w-4" />
                <span className="sr-only">Editar</span>
              </Button>
            </Link>
          </TooltipTrigger>
          <TooltipContent sideOffset={8}>Editar socio</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Link href={`/socios/${socio.id}/cuenta-corriente`}>
              <Button
                variant="outline"
                size="sm"
                aria-label="Ver cuenta corriente"
                className="text-blue-600 border-blue-600 hover:bg-blue-600 hover:text-white bg-transparent"
              >
                <FileText className="h-4 w-4" />
                <span className="sr-only">Cuenta corriente</span>
              </Button>
            </Link>
          </TooltipTrigger>
          <TooltipContent sideOffset={8}>Ver cuenta corriente</TooltipContent>
        </Tooltip>

        <AlertDialog>
          <Tooltip>
            <AlertDialogTrigger asChild>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  aria-label="Eliminar socio"
                  className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground bg-transparent"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Eliminar</span>
                </Button>
              </TooltipTrigger>
            </AlertDialogTrigger>
            <TooltipContent sideOffset={8}>Eliminar socio</TooltipContent>
          </Tooltip>
          <AlertDialogContent className="w-[95%] md:w-full mx-auto">
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar socio?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. Se eliminará permanentemente el socio
                {` ${socio.nombre}, ${socio.apellido} `}
                del sistema.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col sm:flex-row gap-2">
              <AlertDialogCancel className="w-full sm:w-auto">Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => socio.id && handleDeleteSocio(socio.id)}
                className="bg-destructive hover:bg-destructive/85 text-destructive-foreground w-full sm:w-auto"
                disabled={isLoadingDelete}
              >
                Eliminar
                {isLoadingDelete && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  };

  return (
    <>
    <div className="space-y-6">
      <Card className="shadow-sm border-border">
        <CardHeader>
          <CardTitle className="text-lg text-foreground">Buscar y Gestionar Socios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, apellido, DNI o email..."
                value={searchTerm}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 rounded-lg border-border text-sm focus:ring-primary focus:border-primary"
              />
            </div>
            {searchTerm && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSearch("")}
                className="whitespace-nowrap"
              >
                Limpiar
              </Button>
            )}
            <Link href="/socios/crear">
              <Button className="bg-primary text-primary-foreground rounded-lg whitespace-nowrap hover:bg-primary/85">
                <Plus className="mr-2 h-4 w-4" />
                Crear Socio
              </Button>
            </Link>
            <Link href="/socios/grupos-familiares">
              <Button variant="outline" className="rounded-lg whitespace-nowrap">
                <Users className="mr-2 h-4 w-4" />
                Grupos Familiares
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-foreground">Lista de Socios ({total})</CardTitle>
            {totalPages > 1 && (
              <p className="text-sm text-muted-foreground">
                Página {currentPage} de {totalPages}
              </p>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <ResponsiveTable
              data={socios}
              keyExtractor={(socio) => socio.id ?? ""}
              loading={isLoadingSocios}
              loadingComponent={
                <div className="py-12 text-center">
                  <LoadingSpinner size="lg" />
                  <p className="mt-4 text-sm text-muted-foreground">Cargando socios...</p>
                </div>
              }
              emptyIcon={User}
              emptyMessage={searchTerm ? "No se encontraron socios" : "No hay socios registrados"}
              columns={[
                {
                  key: "socio",
                  header: "Socio",
                  cell: (socio) => (
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-muted">
                        {socio.fotoUrl ? (
                          <Image
                            src={socio.fotoUrl}
                            alt={socio.nombre}
                            width={48}
                            height={48}
                            sizes="48px"
                            className="h-12 w-12 rounded-full object-cover"
                          />
                        ) : (
                          <User className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-foreground">
                          {`${socio.apellido}, ${socio.nombre}`}
                        </p>
                        <p className="text-sm text-muted-foreground">DNI: {socio.dni}</p>
                        <p className="truncate text-sm text-muted-foreground">{socio.email}</p>
                      </div>
                    </div>
                  ),
                  cellClassName: "py-3",
                },
                {
                  key: "categoria",
                  header: "Categoría",
                  cell: (socio) => renderCategoriaBadge(socio),
                },
                {
                  key: "estado",
                  header: "Estado",
                  cell: (socio) => renderEstadoBadge(socio.estado),
                },
                {
                  key: "tarjeta",
                  header: "Tarjeta",
                  cell: (socio) => (
                    <span className={socio.tarjetaCentro ? "text-green-500" : "text-red-500"}>
                      {socio.tarjetaCentro ? "✓" : "✗"}
                    </span>
                  ),
                },
                {
                  key: "acciones",
                  header: "Acciones",
                  cell: (socio) => renderActionButtons(socio),
                  headerClassName: "text-right",
                  cellClassName: "text-right",
                },
              ]}
              renderCard={(socio) => (
                <>
                  <div className="flex min-w-0 gap-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-muted">
                      {socio.fotoUrl ? (
                        <Image
                          src={socio.fotoUrl}
                          alt={socio.nombre}
                          width={40}
                          height={40}
                          sizes="40px"
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-base font-semibold text-foreground">
                        {`${socio.apellido}, ${socio.nombre}`}
                      </h3>
                      <p className="text-sm text-muted-foreground">DNI: {socio.dni}</p>
                      <p className="truncate text-sm text-muted-foreground">{socio.email}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/50 pt-3">
                    <div className="flex flex-wrap items-center gap-2">
                      {renderCategoriaBadge(socio)}
                      {renderEstadoBadge(socio.estado)}
                    </div>
                    {renderActionButtons(socio)}
                  </div>
                </>
              )}
            />
          </div>

          <div className="mt-6 flex flex-col justify-between gap-3 border-t border-border pt-4 sm:flex-row sm:items-center">
            <p className="text-center text-sm text-muted-foreground sm:text-left">
              Mostrando {startIndex + 1} a {Math.min(startIndex + sociosPorPagina, total)} de
              {` ${total} `}
              socios
            </p>
            <div className="flex flex-col items-center justify-center gap-2 sm:flex-row sm:justify-end">
              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={prevPage}
                    disabled={!hasPreviousPage}
                    className="flex-shrink-0"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="ml-1 hidden xs:inline">Anterior</span>
                  </Button>
                  <span className="min-w-[60px] rounded bg-muted px-2 py-1 text-center text-sm text-muted-foreground">
                    {currentPage} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={nextPage}
                    disabled={!hasNextPage}
                    className="flex-shrink-0"
                  >
                    <span className="mr-1 hidden xs:inline">Siguiente</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="whitespace-nowrap text-xs text-muted-foreground">Mostrar:</span>
                <Select
                  value={sociosPorPagina.toString()}
                  onValueChange={(value) => handleLimitChange(parseInt(value, 10))}
                >
                  <SelectTrigger className="h-8 w-20 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAGINACION.OPCIONES_TAMAÑO_PAGINA.map((option) => (
                      <SelectItem key={option} value={option.toString()}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

      {/* Modal de detalles del socio */}
      <Dialog open={!!selectedSocio} onOpenChange={(open) => !open && setSelectedSocio(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle className="text-xl">Detalles del Socio</DialogTitle>
          </DialogHeader>
          
          {selectedSocio && (
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Header con foto y datos principales */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 pb-6 border-b">
                <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-full bg-muted overflow-hidden border-2 border-border shadow-sm">
                  {selectedSocio.fotoUrl ? (
                    <Image
                      src={selectedSocio.fotoUrl}
                      alt={selectedSocio.nombre}
                      width={96}
                      height={96}
                      sizes="96px"
                      className="h-24 w-24 rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-10 w-10 text-muted-foreground" />
                  )}
                </div>
                <div className="text-center sm:text-left flex-1 min-w-0">
                  <h2 className="text-2xl font-bold text-foreground truncate">
                    {`${selectedSocio.apellido}, ${selectedSocio.nombre}`}
                  </h2>
                  <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-3">
                    {renderCategoriaBadge(selectedSocio)}
                    {renderEstadoBadge(selectedSocio.estado)}
                  </div>
                </div>
              </div>

              {/* Información de contacto */}
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Información de Contacto
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-start gap-3 p-3 rounded-lg border bg-card text-card-foreground shadow-sm">
                    <User className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted-foreground font-medium mb-1">DNI</p>
                      <p className="font-semibold text-sm">{selectedSocio.dni}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg border bg-card text-card-foreground shadow-sm">
                    <Mail className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted-foreground font-medium mb-1">Email</p>
                      <p className="font-semibold text-sm break-all">{selectedSocio.email || "-"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg border bg-card text-card-foreground shadow-sm">
                    <Phone className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted-foreground font-medium mb-1">Teléfono</p>
                      <p className="font-semibold text-sm">{selectedSocio.telefono || "-"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg border bg-card text-card-foreground shadow-sm">
                    <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted-foreground font-medium mb-1">Dirección</p>
                      <p className="font-semibold text-sm break-words">{selectedSocio.direccion || "-"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Información de fechas */}
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Fechas
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="flex items-start gap-3 p-3 rounded-lg border bg-card text-card-foreground shadow-sm">
                    <Calendar className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted-foreground font-medium mb-1">Nacimiento</p>
                      <p className="font-semibold text-sm">{formatDate(selectedSocio.fechaNacimiento)}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg border bg-card text-card-foreground shadow-sm">
                    <Calendar className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted-foreground font-medium mb-1">Ingreso</p>
                      <p className="font-semibold text-sm">{formatDate(selectedSocio.fechaIngreso)}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg border bg-card text-card-foreground shadow-sm">
                    <Calendar className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted-foreground font-medium mb-1">Alta</p>
                      <p className="font-semibold text-sm">{formatDate(selectedSocio.fechaAlta)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Información adicional */}
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Información Adicional
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-start gap-3 p-3 rounded-lg border bg-card text-card-foreground shadow-sm">
                    <CreditCard className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted-foreground font-medium mb-1">Tarjeta Centro</p>
                      <p className="font-semibold text-sm">
                        {selectedSocio.tarjetaCentro 
                          ? `Sí${selectedSocio.numeroTarjetaCentro ? ` - ${selectedSocio.numeroTarjetaCentro}` : ""}` 
                          : "No"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg border bg-card text-card-foreground shadow-sm">
                    <User className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted-foreground font-medium mb-1">Género</p>
                      <p className="font-semibold text-sm">{selectedSocio.genero || "-"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
});
