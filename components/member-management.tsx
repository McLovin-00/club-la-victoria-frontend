"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Edit,
  Loader2,
  Plus,
  Search,
  Trash2,
  User,
} from "lucide-react";

import { useDeleteSocio } from "@/hooks/api/socios/useDeleteSocio";
import { useSocios } from "@/hooks/api/socios/useSocios";
import { ESTADO_SOCIO, PAGINACION } from "@/lib/constants";
import { SocioWithFoto } from "@/lib/types";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type SocioListado = SocioWithFoto & {
  categoria?: { nombre?: string } | string | null;
  categoriaNombre?: string;
  nombreCategoria?: string;
};

const badgeCategoriaClassName: Record<string, string> = {
  ACTIVO:
    "border-emerald-200 bg-emerald-100 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200",
  ADHERENTE:
    "border-blue-200 bg-blue-100 text-blue-800 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-200",
  VITALICIO:
    "border-amber-200 bg-amber-100 text-amber-800 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-200",
  HONORARIO:
    "border-violet-200 bg-violet-100 text-violet-800 dark:border-violet-800 dark:bg-violet-950/50 dark:text-violet-200",
};

const getNombreCategoria = (socio: SocioListado): string => {
  const categoriaRaw =
    typeof socio.categoria === "string"
      ? socio.categoria
      : socio.categoria?.nombre ?? socio.categoriaNombre ?? socio.nombreCategoria;

  if (!categoriaRaw || categoriaRaw.trim().length === 0) {
    return "SIN CATEGORIA";
  }

  return categoriaRaw.trim().toUpperCase();
};

const getCategoriaBadgeClassName = (categoria: string): string => {
  return (
    badgeCategoriaClassName[categoria] ||
    "border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
  );
};

export function MemberManagement() {
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
      <Badge
        variant={estado === ESTADO_SOCIO.ACTIVO ? "default" : "secondary"}
        className={`${
          estado === ESTADO_SOCIO.ACTIVO ? "bg-primary text-primary-foreground" : ""
        } flex-shrink-0`}
      >
        {estado === ESTADO_SOCIO.ACTIVO ? "Activo" : "Inactivo"}
      </Badge>
    );
  };

  const renderCategoriaBadge = (socio: SocioListado) => {
    const nombreCategoria = getNombreCategoria(socio);

    return (
      <Badge
        variant="outline"
        className={`${getCategoriaBadgeClassName(nombreCategoria)} font-medium`}
      >
        {nombreCategoria}
      </Badge>
    );
  };

  const renderActionButtons = (socio: SocioListado) => {
    return (
      <div className="flex items-center justify-end gap-2">
        <Link href={`/socios/${socio.id}/edit`}>
          <Button
            variant="outline"
            size="sm"
            className="text-primary border-primary hover:bg-primary hover:text-primary-foreground bg-transparent"
          >
            <Edit className="h-4 w-4" />
            <span className="sr-only">Editar</span>
          </Button>
        </Link>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground bg-transparent"
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Eliminar</span>
            </Button>
          </AlertDialogTrigger>
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
            {isLoadingSocios ? (
              <div className="py-12 text-center">
                <LoadingSpinner size="lg" />
                <p className="mt-4 text-sm text-muted-foreground">Cargando socios...</p>
              </div>
            ) : socios.length === 0 ? (
              <div className="py-8 text-center">
                <User className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">
                  {searchTerm ? "No se encontraron socios" : "No hay socios registrados"}
                </p>
              </div>
            ) : (
              <>
                <div className="hidden overflow-hidden rounded-lg border border-border md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Socio</TableHead>
                        <TableHead>Categoría</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {socios.map((socio) => (
                        <TableRow key={socio.id}>
                          <TableCell className="py-3">
                            <div className="flex min-w-0 items-center gap-3">
                              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-muted">
                                {socio.fotoUrl ? (
                                  <Image
                                    src={socio.fotoUrl}
                                    alt={socio.nombre}
                                    width={48}
                                    height={48}
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
                          </TableCell>
                          <TableCell>{renderCategoriaBadge(socio)}</TableCell>
                          <TableCell>{renderEstadoBadge(socio.estado)}</TableCell>
                          <TableCell className="text-right">{renderActionButtons(socio)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="space-y-3 md:hidden">
                  {socios.map((socio) => (
                    <div
                      key={socio.id}
                      className="space-y-3 rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
                    >
                      <div className="flex min-w-0 gap-3">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-muted">
                          {socio.fotoUrl ? (
                            <Image
                              src={socio.fotoUrl}
                              alt={socio.nombre}
                              width={40}
                              height={40}
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
                    </div>
                  ))}
                </div>
              </>
            )}
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
  );
}
