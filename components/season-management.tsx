"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SeasonForm } from "@/components/season-form";
import { Plus, Edit, Trash2, Calendar } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Temporada } from "@/lib/types";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useTemporadas } from "@/hooks/api/temporadas/useTemporadas";
import { useCreateTemporada } from "@/hooks/api/temporadas/useCreateTemporada";
import { useUpdateTemporada } from "@/hooks/api/temporadas/useUpdateTemporada";
import { useDeleteTemporada } from "@/hooks/api/temporadas/useDeleteTemporada";
import { formatDateLong } from "@/lib/utils/date";

export function SeasonManagement() {
  const { data: temporadas, isLoading } = useTemporadas();
  const { mutateAsync: createTemporada } = useCreateTemporada();
  const { mutateAsync: updateTemporada } = useUpdateTemporada();
  const { mutateAsync: deleteTemporada, isPending: isPendingDelete } = useDeleteTemporada();

  const [isCreateDialogOpen,  setIsCreateDialogOpen] = useState(false);
  const [editingTemporada, setEditingTemporada] = useState<Temporada | null>(
    null
  );

  const handleCrearTemporada = async (formData: Omit<Temporada, "id">) => {
    
    const temporada = {
      nombre: formData.nombre,
      fechaInicio: formData.fechaInicio,
      fechaFin: formData.fechaFin,
      descripcion: formData.descripcion,
    }
    
    try {
      await createTemporada(temporada);
      setIsCreateDialogOpen(false);
    } catch {
      // El error ya fue mostrado en el hook de API
    }
  };

  const handleEditarTemporada = async (formData: Omit<Temporada, "id">) => {
    const temporada = {
      nombre: formData.nombre,
      fechaInicio: formData.fechaInicio,
      fechaFin: formData.fechaFin,
      descripcion: formData.descripcion,
    }
    
    try {
      if(editingTemporada?.id) {
        await updateTemporada({ id: parseInt(editingTemporada.id), data: temporada });
      }
      setEditingTemporada(null);
    } catch {
      // El error ya fue mostrado en el hook de API
    }
  };

  const handleEliminarTemporada = async (idTemporada: string) => {
    try {
      await deleteTemporada({ id: parseInt(idTemporada) });
    } catch {
      // El error ya fue mostrado en el hook de API
    }
  };

  return (
    <div className="space-y-6">
      {/* Header y botón crear */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-2xl">Temporadas del Club</CardTitle>
            <Dialog
              open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
            >
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/85">
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Temporada
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[500px] max-w-[95vw] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Crear Nueva Temporada</DialogTitle>
                </DialogHeader>
                <SeasonForm
                  onSubmit={handleCrearTemporada}
                  onCancel={() => setIsCreateDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Gestiona las temporadas de pileta del club. Define fechas de inicio
            y fin para cada temporada.
          </p>
        </CardContent>
      </Card>

      {/* Lista de temporadas */}
      <div className="grid gap-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-sm text-muted-foreground">
              Cargando temporadas...
            </p>
          </div>
        ) : !temporadas || temporadas.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No hay temporadas registradas
              </p>
            </CardContent>
          </Card>
        ) : (
          temporadas?.map((temporada) => (
            <Card key={temporada.id}>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <CardTitle className="text-xl">
                      {temporada.nombre}
                    </CardTitle>
                    {temporada.descripcion && (
                      <p className="text-muted-foreground">
                        {temporada.descripcion}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Dialog
                      open={editingTemporada?.id === temporada.id}
                      onOpenChange={(open) => {
                        if (!open) setEditingTemporada(null);
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingTemporada(temporada)}
                          className="text-primary border-primary hover:bg-primary hover:text-primary-foreground bg-transparent"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="w-[500px] max-w-[95vw] max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Editar Temporada</DialogTitle>
                        </DialogHeader>
                        {editingTemporada && (
                          <SeasonForm
                            season={editingTemporada}
                            onSubmit={handleEditarTemporada}
                            onCancel={() => setEditingTemporada(null)}
                          />
                        )}
                      </DialogContent>
                    </Dialog>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            ¿Eliminar temporada?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción no se puede deshacer. Se eliminará
                            permanentemente la temporada "{temporada.nombre}".
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel disabled={isPendingDelete}>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => {
                              if (temporada?.id) {
                                handleEliminarTemporada(temporada?.id);
                              }
                            }}
                            className="bg-destructive hover:bg-destructive/85"
                            disabled={isPendingDelete}
                          >
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Fecha de Inicio</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDateLong(temporada.fechaInicio)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Fecha de Fin</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDateLong(temporada.fechaFin)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
