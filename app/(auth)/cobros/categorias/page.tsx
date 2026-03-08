"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Pencil, Info } from "lucide-react";
import { useCategorias, CategoriaSocio } from "@/hooks/api/categorias/useCategorias";
import { useUpdateCategoria } from "@/hooks/api/categorias/useUpdateCategoria";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function CategoriasPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState<CategoriaSocio | null>(null);
  const [formData, setFormData] = useState({ montoMensual: "" });

  const { data: categorias, isLoading } = useCategorias();
  const updateMutation = useUpdateCategoria();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategoria) return;

    const data = {
      montoMensual: parseFloat(formData.montoMensual),
    };

    updateMutation.mutate(
      { id: editingCategoria.id, data },
      {
        onSuccess: () => {
          setDialogOpen(false);
          resetForm();
        },
      }
    );
  };

  const resetForm = () => {
    setFormData({ montoMensual: "" });
    setEditingCategoria(null);
  };

  const openEditDialog = (categoria: CategoriaSocio) => {
    setEditingCategoria(categoria);
    setFormData({
      montoMensual: categoria.montoMensual.toString(),
    });
    setDialogOpen(true);
  };

  const formatMonto = (monto: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(monto);
  };

  // Descripción de cada categoría según el estatuto
  const getCategoriaDescripcion = (nombre: string): string => {
    const descripciones: Record<string, string> = {
      ACTIVO: "Socio mayor de edad, paga cuota completa",
      ADHERENTE: "Menores de edad, paga cuota reducida",
      VITALICIO: "45+ años de antigüedad, NO paga cuota",
      HONORARIO: "Por méritos especiales, NO paga cuota",
    };
    return descripciones[nombre] || "";
  };

  return (
    <DashboardLayout title="Categorías de Socio" description="Montos mensuales según estatuto">
      <div className="space-y-6">
        <div className="page-header">
          <h1 className="page-title">Categorías de socio</h1>
          <p className="page-description">
            Administra montos mensuales por categoría según el estatuto vigente.
          </p>
        </div>

        {/* Nota informativa */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Categorías fijas según estatuto:</strong> Las categorías están definidas en el estatuto del club (Art. 8-14) y no pueden ser creadas ni eliminadas. Solo es posible modificar el monto mensual de cada categoría.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Categorías y Montos</CardTitle>
            <CardDescription>
              Lista de categorías de socio con sus respectivos montos mensuales. Las categorías exentas (VITALICIO, HONORARIO) no generan cuotas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-center text-muted-foreground py-8">Cargando categorías...</p>
            ) : categorias && categorias.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Monto Mensual</TableHead>
<TableHead className="text-right">Acciones</TableHead>
                  </TableRow>

                </TableHeader>
                <TableBody>
                  {categorias.map((categoria) => (
                    <TableRow key={categoria.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {categoria.nombre}
                          {categoria.exento && (
                            <Badge variant="secondary" className="text-xs">
                              Exento
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {getCategoriaDescripcion(categoria.nombre)}
                      </TableCell>
                      <TableCell>
                        {categoria.exento ? (
                          <span className="text-muted-foreground">Sin cargo</span>
                        ) : (
                          formatMonto(categoria.montoMensual)
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(categoria)}
                          title="Editar monto"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No hay categorías registradas. Ejecute el seed para crear las categorías.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Diálogo de edición de monto */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Editar Monto Mensual</DialogTitle>
                <DialogDescription>
                  {editingCategoria && (
                    <span>
                      Modificando el monto para la categoría <strong>{editingCategoria.nombre}</strong>
                      {editingCategoria.exento && (
                        <span className="block mt-2 text-orange-600">
                          Nota: Esta categoría está exenta de pago. El monto es referencial.
                        </span>
                      )}
                    </span>
                  )}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="monto">Monto Mensual (ARS)</Label>
                  <Input
                    id="monto"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.montoMensual}
                    onChange={(e) =>
                      setFormData({ ...formData, montoMensual: e.target.value })
                    }
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? "Guardando..." : "Guardar Cambios"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
