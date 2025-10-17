"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  User,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { PAGINACION, ESTADO_SOCIO } from "@/lib/constants";
import { useSocios } from "@/hooks/api/socios/useSocios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useDeleteSocio } from "@/hooks/api/socios/useDeleteSocio";

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

  const handleDeleteSocio = (id: string) => {
    deleteSocio(id);
  };

  const startIndex = (currentPage - 1) * sociosPorPagina;

  return (
    <div className="space-y-6">
      {/* Search and Create Section */}
      <Card className="shadow-sm border-border">
        <CardHeader>
          <CardTitle className="text-lg text-foreground">
            Buscar y Gestionar Socios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por nombre, apellido, DNI o email..."
                value={searchTerm}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 rounded-lg border-border focus:ring-primary focus:border-primary text-sm"
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
              <Button className="bg-primary hover:bg-primary/85 text-primary-foreground rounded-lg whitespace-nowrap">
                <Plus className="h-4 w-4 mr-2" />
                Crear Socio
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Members Table */}
      <Card className="shadow-sm border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-foreground">
              Lista de Socios ({total})
            </CardTitle>
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
              <div className="text-center py-12">
                <LoadingSpinner size="lg" />
                <p className="mt-4 text-sm text-muted-foreground">
                  Cargando socios...
                </p>
              </div>
            ) : sociosPaginados.length === 0 ? (
              <div className="text-center py-8">
                <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {searchTerm
                    ? "No se encontraron socios"
                    : "No hay socios registrados"}
                </p>
              </div>
            ) : (
              sociosPaginados.map((socio) => (
                <div
                  key={socio.id}
                  className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center sm:justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  {/* Socio Info Section */}
                  <div className="flex justify-center sm:items-start gap-3 flex-1 min-w-0">
                    {/* Avatar */}
                    <div className="w-10 h-10 sm:w-16 sm:h-16 bg-muted rounded-full flex items-center justify-center flex-shrink-0 sm:my-auto">
                      {socio.fotoUrl ? (
                        <Image
                          src={socio.fotoUrl}
                          alt={socio.nombre}
                          width={64}
                          height={64}
                          className="w-10 h-10 sm:w-16 sm:h-16 rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
                      )}
                    </div>

                    {/* Socio Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground text-base sm:text-lg truncate">
                        {`${socio.apellido}, ${socio.nombre}`}
                      </h3>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">
                          DNI: {socio.dni}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {socio.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions Section */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/50">
                    <Badge
                      variant={
                        socio.estado === ESTADO_SOCIO.ACTIVO
                          ? "default"
                          : "secondary"
                      }
                      className={`${
                        socio.estado === ESTADO_SOCIO.ACTIVO
                          ? "bg-primary text-primary-foreground"
                          : ""
                      } flex-shrink-0`}
                    >
                      {socio.estado === ESTADO_SOCIO.ACTIVO
                        ? "Activo"
                        : "Inactivo"}
                    </Badge>

                    <div className="flex gap-2">
                      <Link href={`/socios/${socio.id}/edit`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-primary border-primary hover:bg-primary hover:text-primary-foreground bg-transparent"
                        >
                          <Edit className="h-4 w-4" />
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
                            <AlertDialogTitle>
                              ¿Eliminar socio?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción no se puede deshacer. Se eliminará
                              permanentemente el socio {socio.nombre},{" "}
                              {socio.apellido} del sistema.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                            <AlertDialogCancel className="w-full sm:w-auto">
                              Cancelar
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => socio.id && handleDeleteSocio(socio.id)}
                              className="bg-destructive hover:bg-destructive/85 text-destructive-foreground w-full sm:w-auto"
                              disabled={isLoadingDelete}  
                            >
                              Eliminar
                              {isLoadingDelete && (
                                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                              )}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-6 pt-4 border-t border-border gap-3">
            <p className="text-sm text-muted-foreground text-center sm:text-left">
              Mostrando {startIndex + 1} a{" "}
              {Math.min(startIndex + sociosPorPagina, total)} de {total} socios
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-end gap-2">
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
                    <span className="hidden xs:inline ml-1">Anterior</span>
                  </Button>
                  <span className="text-sm text-muted-foreground px-2 py-1 bg-muted rounded min-w-[60px] text-center">
                    {currentPage} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={nextPage}
                    disabled={!hasNextPage}
                    className="flex-shrink-0"
                  >
                    <span className="hidden xs:inline mr-1">Siguiente</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  Mostrar:
                </span>
                <Select
                  value={sociosPorPagina.toString()}
                  onValueChange={(value) => handleLimitChange(parseInt(value))}
                >
                  <SelectTrigger className="w-20 h-8 text-xs">
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
