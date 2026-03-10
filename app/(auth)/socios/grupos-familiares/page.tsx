"use client";

import React, { useState, useCallback } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ResponsiveTable } from "@/components/ui/responsive-table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Users,
  User,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  GripVertical,
  UserPlus,
  X,
  Search,
  Eye,
  UserMinus,
  Wallet,
} from "lucide-react";
import {
  useGruposFamiliares,
  useCreateGrupoFamiliar,
  useUpdateGrupoFamiliar,
  useDeleteGrupoFamiliar,
  useAsignarSociosGrupo,
  useDesasignarSocio,
  useSociosSinGrupo,
  useSociosEnGrupo,
  type GrupoFamiliarConCantidad,
  type SocioSinGrupo,
  type SocioEnGrupo,
} from "@/hooks/api/cobros/useGruposFamiliares";
import { CuentasGrupoDialog } from "@/components/grupos-familiares/CuentasGrupoDialog";
import { toast } from "sonner";

export default function GruposFamiliaresPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isViewSociosOpen, setIsViewSociosOpen] = useState(false);
  const [selectedGrupo, setSelectedGrupo] = useState<GrupoFamiliarConCantidad | null>(null);
  const [isCuentasOpen, setIsCuentasOpen] = useState(false);
  const [selectedGrupoForCuentas, setSelectedGrupoForCuentas] = useState<GrupoFamiliarConCantidad | null>(null);
  
  // Form state
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [orden, setOrden] = useState(0);
  
  // Assign socios state
  const [searchSocio, setSearchSocio] = useState("");
  const [selectedSocioIds, setSelectedSocioIds] = useState<number[]>([]);

  // Queries and mutations
  const { data: grupos, isLoading, isError, error, refetch } = useGruposFamiliares();
  const { data: sociosSinGrupo } = useSociosSinGrupo();
  const createMutation = useCreateGrupoFamiliar();
  const updateMutation = useUpdateGrupoFamiliar();
  const deleteMutation = useDeleteGrupoFamiliar();
  const asignarMutation = useAsignarSociosGrupo();
  const desasignarMutation = useDesasignarSocio();
  const { data: sociosEnGrupo, isLoading: isLoadingSociosEnGrupo, refetch: refetchSociosEnGrupo } = useSociosEnGrupo(selectedGrupo?.id ?? null);

  // Filtered socios for assign dialog
  const filteredSocios = sociosSinGrupo?.filter((socio) => {
    if (!searchSocio) return true;
    const search = searchSocio.toLowerCase();
    return (
      socio.nombre.toLowerCase().includes(search) ||
      socio.apellido.toLowerCase().includes(search) ||
      socio.dni?.toLowerCase().includes(search)
    );
  });

  // Handlers
  const handleCreate = async () => {
    if (!nombre.trim()) {
      toast.error("El nombre es requerido");
      return;
    }

    try {
      await createMutation.mutateAsync({
        nombre: nombre.trim(),
        descripcion: descripcion.trim() || undefined,
        orden,
      });
      toast.success("Grupo familiar creado exitosamente");
      resetForm();
      setIsCreateOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al crear el grupo");
    }
  };

  const handleEdit = async () => {
    if (!selectedGrupo || !nombre.trim()) {
      toast.error("El nombre es requerido");
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id: selectedGrupo.id,
        dto: {
          nombre: nombre.trim(),
          descripcion: descripcion.trim() || undefined,
          orden,
        },
      });
      toast.success("Grupo familiar actualizado exitosamente");
      resetForm();
      setIsEditOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al actualizar el grupo");
    }
  };

  const handleDelete = async () => {
    if (!selectedGrupo) return;

    try {
      await deleteMutation.mutateAsync(selectedGrupo.id);
      toast.success("Grupo familiar eliminado exitosamente");
      setSelectedGrupo(null);
      setIsDeleteOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al eliminar el grupo");
    }
  };

  const handleAssignSocios = async () => {
    if (!selectedGrupo || selectedSocioIds.length === 0) {
      toast.error("Selecciona al menos un socio");
      return;
    }

    try {
      await asignarMutation.mutateAsync({
        grupoId: selectedGrupo.id,
        socioIds: selectedSocioIds,
      });
      toast.success(`${selectedSocioIds.length} socio(s) asignado(s) exitosamente`);
      setSelectedSocioIds([]);
      setSearchSocio("");
      setIsAssignOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al asignar socios");
    }
  };

  const handleDesasignarSocio = async (socioId: number) => {
    if (!selectedGrupo) return;

    try {
      await desasignarMutation.mutateAsync({
        grupoId: selectedGrupo.id,
        socioId,
      });
      toast.success("Socio desasignado exitosamente");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al desasignar socio");
    }
  };

  const openEditDialog = (grupo: GrupoFamiliarConCantidad) => {
    setSelectedGrupo(grupo);
    setNombre(grupo.nombre);
    setDescripcion(grupo.descripcion || "");
    setOrden(grupo.orden);
    setIsEditOpen(true);
  };

  const openDeleteDialog = (grupo: GrupoFamiliarConCantidad) => {
    setSelectedGrupo(grupo);
    setIsDeleteOpen(true);
  };

  const handleOpenViewSocios = useCallback((grupoId: number) => {
    const g = grupos?.find((gr) => gr.id === grupoId) ?? null;
    if (g) {
      setSelectedGrupo(g);
      setIsViewSociosOpen(true);
    }
  }, [grupos]);

  const handleOpenCuentas = useCallback((grupoId: number) => {
    const g = grupos?.find((gr) => gr.id === grupoId) ?? null;
    if (g) {
      setSelectedGrupoForCuentas(g);
      setIsCuentasOpen(true);
    }
  }, [grupos]);

  const handleOpenAssign = useCallback((grupoId: number) => {
    const g = grupos?.find((gr) => gr.id === grupoId) ?? null;
    if (g) {
      setSelectedGrupo(g);
      setSelectedSocioIds([]);
      setSearchSocio("");
      setIsAssignOpen(true);
    }
  }, [grupos]);

  const handleOpenEdit = useCallback((grupoId: number) => {
    const g = grupos?.find((gr) => gr.id === grupoId) ?? null;
    if (g) openEditDialog(g);
  }, [grupos]);

  const handleOpenDelete = useCallback((grupoId: number) => {
    const g = grupos?.find((gr) => gr.id === grupoId) ?? null;
    if (g) openDeleteDialog(g);
  }, [grupos]);

  const openAssignDialog = (grupo: GrupoFamiliarConCantidad) => {
    setSelectedGrupo(grupo);
    setSelectedSocioIds([]);
    setSearchSocio("");
    setIsAssignOpen(true);
  };

  const openViewSociosDialog = (grupo: GrupoFamiliarConCantidad) => {
    setSelectedGrupo(grupo);
    setIsViewSociosOpen(true);
  };

  const openCuentasDialog = (grupo: GrupoFamiliarConCantidad) => {
    setSelectedGrupoForCuentas(grupo);
    setIsCuentasOpen(true);
  };


  const resetForm = () => {
    setNombre("");
    setDescripcion("");
    setOrden(0);
    setSelectedGrupo(null);
  };

  // Loading state
  if (isLoading) {
    return (
      <DashboardLayout title="Grupos Familiares" description="Gestión de grupos para el talonario">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-3 text-muted-foreground">Cargando grupos...</span>
        </div>
      </DashboardLayout>
    );
  }

  // Error state
  if (isError) {
    return (
      <DashboardLayout title="Grupos Familiares" description="Gestión de grupos para el talonario">
        <Card className="border-destructive/50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-destructive font-medium mb-2">Error al cargar los grupos</p>
            <p className="text-sm text-muted-foreground mb-4">
              {error instanceof Error ? error.message : "Error desconocido"}
            </p>
            <Button variant="outline" onClick={() => refetch()}>
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Grupos Familiares" description="Gestión de grupos para organizar el talonario">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Grupos Familiares</h1>
            <p className="text-muted-foreground">
              Organiza los recibos del talonario por grupos familiares
            </p>
          </div>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Grupo
          </Button>
        </div>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Grupos Configurados</CardTitle>
            <CardDescription>
              Los grupos aparecen en el talonario ordenados por el campo "orden"
            </CardDescription>
          </CardHeader>
          <CardContent>
            {grupos && grupos.length > 0 ? (
              <ResponsiveTable
                data={grupos}
                keyExtractor={(grupo) => String(grupo.id)}
                columns={[
                  {
                    key: "orden",
                    header: "Orden",
                    headerClassName: "w-16",
                    cell: (grupo) => (
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                        <Badge variant="outline">{grupo.orden}</Badge>
                      </div>
                    ),
                  },
                  {
                    key: "nombre",
                    header: "Nombre",
                    cell: (grupo) => (
                      <span className="font-medium">{grupo.nombre}</span>
                    ),
                  },
                  {
                    key: "descripcion",
                    header: "Descripción",
                    cell: (grupo) => (
                      <span className="text-muted-foreground">
                        {grupo.descripcion || "-"}
                      </span>
                    ),
                  },
                  {
                    key: "socios",
                    header: "Socios",
                    headerClassName: "text-center",
                    cellClassName: "text-center",
                    cell: (grupo) => (
                      <Badge
                        variant="secondary"
                        className="cursor-pointer hover:bg-secondary/80"
                        onClick={() => openViewSociosDialog(grupo)}
                      >
                        <Users className="h-3 w-3 mr-1" />
                        {grupo.cantidadSocios}
                      </Badge>
                    ),
                  },
                  {
                    key: "acciones",
                    header: "Acciones",
                    headerClassName: "text-right",
                    cellClassName: "text-right",
                    cell: (grupo) => (
                      <div className="flex justify-end gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenViewSocios(grupo.id)}
                              aria-label="Ver socios"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent sideOffset={8}>Ver socios</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenCuentas(grupo.id)}
                              aria-label="Ver resumen de cuentas"
                            >
                              <Wallet className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent sideOffset={8}>Ver resumen de cuentas</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenAssign(grupo.id)}
                              aria-label="Asignar socios"
                            >
                              <UserPlus className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent sideOffset={8}>Asignar socios</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenEdit(grupo.id)}
                              aria-label="Editar grupo"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent sideOffset={8}>Editar grupo</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenDelete(grupo.id)}
                              aria-label="Eliminar grupo"
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent sideOffset={8}>Eliminar grupo</TooltipContent>
                        </Tooltip>
                      </div>
                    ),
                  },
                ]}
                renderCard={(grupo) => (
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-semibold">{grupo.nombre}</p>
                          <p className="text-sm text-muted-foreground">
                            {grupo.descripcion || "Sin descripción"}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">Orden: {grupo.orden}</Badge>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t">
                      <Badge
                        variant="secondary"
                        className="cursor-pointer hover:bg-secondary/80"
                        onClick={() => openViewSociosDialog(grupo)}
                      >
                        <Users className="h-3 w-3 mr-1" />
                        {grupo.cantidadSocios} socios
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => handleOpenViewSocios(grupo.id)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => handleOpenCuentas(grupo.id)}
                      >
                        <Wallet className="h-4 w-4 mr-1" />
                        Cuentas
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => handleOpenAssign(grupo.id)}
                      >
                        <UserPlus className="h-4 w-4 mr-1" />
                        Asignar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => handleOpenEdit(grupo.id)}
                      >
                        <Pencil className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full col-span-2 text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => handleOpenDelete(grupo.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Eliminar
                      </Button>
                    </div>
                  </div>
                )}
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground font-medium">No hay grupos familiares configurados</p>
                <p className="text-sm text-muted-foreground/70">
                  Crea un grupo para organizar los recibos del talonario
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">¿Cómo funcionan los grupos familiares?</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Los grupos familiares te permiten organizar los recibos del talonario. Los grupos
                  se muestran primero (ordenados por el campo orden), y dentro de cada grupo los
                  recibos se ordenan alfabéticamente. Los socios sin grupo aparecen al final.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Grupo Familiar</DialogTitle>
            <DialogDescription>
              Configura un nuevo grupo para organizar los recibos
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre *</Label>
              <Input
                id="nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Familia García"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Descripción opcional del grupo"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="orden">Orden</Label>
              <Input
                id="orden"
                type="number"
                value={orden}
                onChange={(e) => setOrden(parseInt(e.target.value) || 0)}
                min={0}
              />
              <p className="text-xs text-muted-foreground">
                Los grupos con menor número aparecen primero en el talonario
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreate} disabled={createMutation.isPending}>
              {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Crear Grupo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Grupo Familiar</DialogTitle>
            <DialogDescription>
              Modifica los datos del grupo
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-nombre">Nombre *</Label>
              <Input
                id="edit-nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-descripcion">Descripción</Label>
              <Textarea
                id="edit-descripcion"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-orden">Orden</Label>
              <Input
                id="edit-orden"
                type="number"
                value={orden}
                onChange={(e) => setOrden(parseInt(e.target.value) || 0)}
                min={0}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEdit} disabled={updateMutation.isPending}>
              {updateMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar grupo familiar?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará el grupo <strong>{selectedGrupo?.nombre}</strong>.
              Los socios asignados quedarán sin grupo.
              <br />
              <br />
              {selectedGrupo && selectedGrupo.cantidadSocios > 0 && (
                <span className="text-amber-600 dark:text-amber-500">
                  ⚠️ Este grupo tiene {selectedGrupo.cantidadSocios} socio(s) asignado(s).
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Assign Socios Dialog */}
      <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Asignar Socios - {selectedGrupo?.nombre}</DialogTitle>
            <DialogDescription>
              Selecciona los socios para asignar a este grupo
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, apellido o DNI..."
                value={searchSocio}
                onChange={(e) => setSearchSocio(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Selected count */}
            {selectedSocioIds.length > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="default">{selectedSocioIds.length} seleccionado(s)</Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedSocioIds([])}
                >
                  Limpiar selección
                </Button>
              </div>
            )}

            {/* Socios list */}
            <ScrollArea className="h-[300px] border rounded-md">
              {filteredSocios && filteredSocios.length > 0 ? (
                <div className="divide-y">
                  {filteredSocios.map((socio) => (
                    <div
                      key={socio.id}
                      className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50 transition-colors ${
                        selectedSocioIds.includes(socio.id) ? "bg-primary/10" : ""
                      }`}
                      onClick={() => {
                        setSelectedSocioIds((prev) =>
                          prev.includes(socio.id)
                            ? prev.filter((id) => id !== socio.id)
                            : [...prev, socio.id]
                        );
                      }}
                    >
                      <div
                        className={`h-4 w-4 rounded border ${
                          selectedSocioIds.includes(socio.id)
                            ? "bg-primary border-primary"
                            : "border-muted-foreground"
                        }`}
                      >
                        {selectedSocioIds.includes(socio.id) && (
                          <svg
                            className="h-4 w-4 text-primary-foreground"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">
                          {socio.apellido}, {socio.nombre}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          DNI: {socio.dni || "Sin DNI"}
                          {socio.telefono && ` | Tel: ${socio.telefono}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center py-8">
                  <Users className="h-8 w-8 text-muted-foreground/50 mb-2" />
                  <p className="text-muted-foreground">
                    {searchSocio
                      ? "No se encontraron socios"
                      : "No hay socios disponibles"}
                  </p>
                </div>
              )}
            </ScrollArea>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleAssignSocios}
              disabled={selectedSocioIds.length === 0 || asignarMutation.isPending}
            >
              {asignarMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Asignar {selectedSocioIds.length > 0 && `(${selectedSocioIds.length})`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Socios Dialog */}
      <Dialog open={isViewSociosOpen} onOpenChange={setIsViewSociosOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Socios en {selectedGrupo?.nombre}</DialogTitle>
            <DialogDescription>
              Socios asignados a este grupo familiar
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {isLoadingSociosEnGrupo ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Cargando socios...</span>
              </div>
            ) : sociosEnGrupo && sociosEnGrupo.length > 0 ? (
              <ScrollArea className="h-[350px] border rounded-md">
                <div className="space-y-3 p-3">
                  {sociosEnGrupo.map((socio) => (
                    <div
                      key={socio.id}
                      className="space-y-3 rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
                    >
                      <div className="flex min-w-0 gap-3">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-muted">
                          <User className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate text-base font-semibold text-foreground">
                            {socio.apellido}, {socio.nombre}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            DNI: {socio.dni || "Sin DNI"}
                          </p>
                          <p className="truncate text-sm text-muted-foreground">
                            {socio.telefono ? `Tel: ${socio.telefono}` : "Sin telefono"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-end border-t border-border/50 pt-3">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDesasignarSocio(socio.id)}
                              disabled={desasignarMutation.isPending}
                              aria-label="Quitar socio del grupo"
                              className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground bg-transparent"
                            >
                              {desasignarMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <UserMinus className="h-4 w-4" />
                              )}
                              <span className="ml-2">Quitar</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent sideOffset={8}>Quitar del grupo</TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Users className="h-10 w-10 text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">No hay socios asignados a este grupo</p>
                <p className="text-sm text-muted-foreground/70 mt-1">
                  Usa el botón "Asignar socios" para agregar miembros
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewSociosOpen(false)}>
              Cerrar
            </Button>
            <Button onClick={() => {
              setIsViewSociosOpen(false);
              if (selectedGrupo) openAssignDialog(selectedGrupo);
            }}>
              <UserPlus className="h-4 w-4 mr-2" />
              Agregar más socios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cuentas Grupo Dialog */}
      <CuentasGrupoDialog
        open={isCuentasOpen}
        onOpenChange={setIsCuentasOpen}
        grupoId={selectedGrupoForCuentas?.id ?? null}
        grupoNombre={selectedGrupoForCuentas?.nombre ?? ""}
      />
    </DashboardLayout>
  );
}
