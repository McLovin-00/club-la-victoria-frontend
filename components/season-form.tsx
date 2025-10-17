"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save, X } from "lucide-react";
import { Temporada } from "@/lib/types";
import {
  temporadaSchema,
  type TemporadaFormData,
} from "@/lib/schemas/temporada.schema";

interface SeasonFormProps {
  season?: Temporada;
  onSubmit: (temporada: Omit<Temporada, "id">) => void;
  onCancel: () => void;
}

export function SeasonForm({ season, onSubmit, onCancel }: SeasonFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<TemporadaFormData>({
    resolver: zodResolver(temporadaSchema),
    defaultValues: {
      nombre: season?.nombre || "",
      fechaInicio: season?.fechaInicio || "",
      fechaFin: season?.fechaFin || "",
      descripcion: season?.descripcion || undefined,
    },
  });

  // Actualizar formulario cuando cambie la temporada
  useEffect(() => {
    if (season) {
      reset({
        nombre: season.nombre,
        fechaInicio: season.fechaInicio,
        fechaFin: season.fechaFin,
        descripcion: season.descripcion || undefined,
      });
    }
  }, [season, reset]);

  const descripcionValue = watch("descripcion");

  const handleFormSubmit = (data: TemporadaFormData) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {/* Nombre */}
      <div className="space-y-2">
        <Label htmlFor="nombre">Nombre de la Temporada *</Label>
        <Input
          id="nombre"
          {...register("nombre")}
          placeholder="Temporada Verano 2024-2025"
          className={`w-full resize-none ${
            errors.nombre ? "border-destructive" : "border-border"
          }`}
        />
        {errors.nombre && (
          <p className="text-sm text-destructive">{errors.nombre.message}</p>
        )}
      </div>

      {/* Fechas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Fecha de Inicio */}
        <div className="space-y-2">
          <Label htmlFor="fechaInicio">Fecha de Inicio *</Label>
          <Input
            id="fechaInicio"
            type="date"
            {...register("fechaInicio")}
            className={`w-full resize-none ${
              errors.fechaInicio ? "border-destructive" : "border-border"
            }`}
          />
          {errors.fechaInicio && (
            <p className="text-sm text-destructive">
              {errors.fechaInicio.message}
            </p>
          )}
        </div>

        {/* Fecha de Fin */}
        <div className="space-y-2">
          <Label htmlFor="fechaFin">Fecha de Fin *</Label>
          <Input
            id="fechaFin"
            type="date"
            {...register("fechaFin")}
            className={`w-full resize-none ${
              errors.fechaFin ? "border-destructive" : "border-border"
            }`}
          />
          {errors.fechaFin && (
            <p className="text-sm text-destructive">{errors.fechaFin.message}</p>
          )}
        </div>
      </div>

      {/* Descripción */}
      <div className="space-y-2">
        <Label htmlFor="descripcion">Descripción (opcional)</Label>
        <Textarea
          id="descripcion"
          {...register("descripcion")}
          placeholder="Descripción de la temporada, horarios especiales, etc."
          rows={3}
          maxLength={100}
          className={`w-full resize-none break-words ${
            errors.descripcion ? "border-destructive" : "border-border"
          }`}
        />
        <div className="flex justify-between items-center text-xs text-muted-foreground">
          <span>{descripcionValue?.length || 0}/100 caracteres</span>
          {errors.descripcion && (
            <span className="text-destructive">{errors.descripcion.message}</span>
          )}
        </div>
      </div>

      {/* Botones */}
      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          className="flex-1 bg-primary hover:bg-primary/85 hover:scale-105 text-white"
        >
          <Save className="h-4 w-4 mr-2" />
          {season ? "Actualizar" : "Crear"} Temporada
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1 bg-destructive hover:bg-destructive/85 hover:scale-105 text-white"
        >
          <X className="h-4 w-4 mr-2" />
          Cancelar
        </Button>
      </div>
    </form>
  );
}
