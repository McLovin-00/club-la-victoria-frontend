"use client";

import type React from "react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Save, X } from "lucide-react";
import { Socio, SocioWithFoto } from "@/lib/types";
import { ESTADO_SOCIO, GENERO } from "@/lib/constants";
import { socioSchema, type SocioFormData } from "@/lib/schemas/socio.schema";

interface MemberFormProps {
  socio?: Socio;
  onSubmit: (socio: Omit<Socio, "id">) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

// Helper para normalizar fechas
const normalizeDate = (date?: string | Date | null): string => {
  if (!date) return "";
  if (date instanceof Date) {
    return date.toISOString().slice(0, 10);
  }
  const isoDate = new Date(date);
  if (!isNaN(isoDate.getTime())) {
    return isoDate.toISOString().slice(0, 10);
  }
  return "";
};

export function MemberForm({
  socio,
  onSubmit,
  onCancel,
  isSubmitting,
}: MemberFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<SocioFormData>({
    resolver: zodResolver(socioSchema),
    defaultValues: {
      dni: socio?.dni || "",
      nombre: socio?.nombre || "",
      apellido: socio?.apellido || "",
      direccion: socio?.direccion || "",
      email: socio?.email || undefined,
      telefono: socio?.telefono || undefined,
      fechaNacimiento: normalizeDate(socio?.fechaNacimiento) || "",
      genero: socio?.genero || GENERO.MASCULINO,
      estado: socio?.estado || ESTADO_SOCIO.ACTIVO,
      fotoUrl: (socio as SocioWithFoto)?.fotoUrl || undefined,
    },
  });

  // Actualizar formulario cuando cambie el socio
  useEffect(() => {
    if (socio) {
      reset({
        dni: socio.dni,
        nombre: socio.nombre,
        apellido: socio.apellido,
        direccion: socio.direccion,
        email: socio.email || undefined,
        telefono: socio.telefono || undefined,
        fechaNacimiento: normalizeDate(socio.fechaNacimiento),
        genero: socio.genero,
        estado: socio.estado,
        fotoUrl: (socio as SocioWithFoto)?.fotoUrl || undefined,
      });
    }
  }, [socio, reset]);

  const generoValue = watch("genero");
  const estadoValue = watch("estado");

  const handleFormSubmit = (data: SocioFormData) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* DNI */}
        <div className="space-y-2">
          <Label htmlFor="dni">
            DNI{" "}
            <span className={errors.dni ? "text-red-500" : "text-gray-500"}>
              *
            </span>
          </Label>
          <Input
            id="dni"
            {...register("dni")}
            placeholder="12345678"
            maxLength={8}
            className={`w-full rounded-lg border px-3 py-2 text-sm transition-colors duration-200
              focus:ring-2 focus:ring-primary/60 focus:border-primary
              ${errors.dni ? "border-red-500" : "border-gray-300"}
              hover:border-gray-400`}
            disabled={isSubmitting}
          />
          {errors.dni && (
            <p className="text-xs text-red-500 mt-1">{errors.dni.message}</p>
          )}
        </div>

        {/* Nombre */}
        <div className="space-y-2">
          <Label htmlFor="nombre">
            Nombre{" "}
            <span className={errors.nombre ? "text-red-500" : "text-gray-500"}>
              *
            </span>
          </Label>
          <Input
            id="nombre"
            {...register("nombre")}
            placeholder="Ana"
            className={`w-full rounded-lg border px-3 py-2 text-sm transition-colors duration-200
              focus:ring-2 focus:ring-primary/60 focus:border-primary
              ${errors.nombre ? "border-red-500" : "border-gray-300"}
              hover:border-gray-400`}
            disabled={isSubmitting}
          />
          {errors.nombre && (
            <p className="text-xs text-red-500 mt-1">{errors.nombre.message}</p>
          )}
        </div>

        {/* Apellido */}
        <div className="space-y-2">
          <Label htmlFor="apellido">
            Apellido{" "}
            <span
              className={errors.apellido ? "text-red-500" : "text-gray-500"}
            >
              *
            </span>
          </Label>
          <Input
            id="apellido"
            {...register("apellido")}
            placeholder="García López"
            className={`w-full rounded-lg border px-3 py-2 text-sm transition-colors duration-200
              focus:ring-2 focus:ring-primary/60 focus:border-primary
              ${errors.apellido ? "border-red-500" : "border-gray-300"}
              hover:border-gray-400`}
            disabled={isSubmitting}
          />
          {errors.apellido && (
            <p className="text-xs text-red-500 mt-1">
              {errors.apellido.message}
            </p>
          )}
        </div>

        {/* Fecha de Nacimiento */}
        <div className="space-y-2">
          <Label htmlFor="fechaNacimiento">
            Fecha de Nacimiento{" "}
            <span
              className={
                errors.fechaNacimiento ? "text-red-500" : "text-gray-500"
              }
            >
              *
            </span>
          </Label>
          <Input
            id="fechaNacimiento"
            type="date"
            {...register("fechaNacimiento")}
            className={`w-full rounded-lg border px-3 py-2 text-sm transition-colors duration-200
              focus:ring-2 focus:ring-primary/60 focus:border-primary
              ${errors.fechaNacimiento ? "border-red-500" : "border-gray-300"}
              hover:border-gray-400`}
            disabled={isSubmitting}
          />
          {errors.fechaNacimiento && (
            <p className="text-xs text-red-500 mt-1">
              {errors.fechaNacimiento.message}
            </p>
          )}
        </div>

        {/* Dirección */}
        <div className="space-y-2">
          <Label htmlFor="direccion">
            Dirección{" "}
            <span
              className={errors.direccion ? "text-red-500" : "text-gray-500"}
            >
              *
            </span>
          </Label>
          <Input
            id="direccion"
            {...register("direccion")}
            placeholder="Av. Siempre Viva 742"
            className={`w-full rounded-lg border px-3 py-2 text-sm transition-colors duration-200
              focus:ring-2 focus:ring-primary/60 focus:border-primary
              ${errors.direccion ? "border-red-500" : "border-gray-300"}
              hover:border-gray-400`}
            disabled={isSubmitting}
          />
          {errors.direccion && (
            <p className="text-xs text-red-500 mt-1">
              {errors.direccion.message}
            </p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            {...register("email")}
            placeholder="ana.garcia@email.com"
            className={`w-full rounded-lg border px-3 py-2 text-sm transition-colors duration-200
              focus:ring-2 focus:ring-primary/60 focus:border-primary
              ${errors.email ? "border-red-500" : "border-gray-300"}
              hover:border-gray-400`}
            disabled={isSubmitting}
          />
          {errors.email && (
            <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Teléfono */}
        <div className="space-y-2">
          <Label htmlFor="telefono">Teléfono</Label>
          <Input
            id="telefono"
            {...register("telefono")}
            placeholder="1122334455"
            className={`w-full rounded-lg border px-3 py-2 text-sm transition-colors duration-200
              focus:ring-2 focus:ring-primary/60 focus:border-primary
              ${errors.telefono ? "border-red-500" : "border-gray-300"}
              hover:border-gray-400`}
            disabled={isSubmitting}
          />
          {errors.telefono && (
            <p className="text-xs text-red-500 mt-1">
              {errors.telefono.message}
            </p>
          )}
        </div>

        {/* Género */}
        <div className="space-y-2">
          <Label htmlFor="genero">
            Género <span className="text-gray-500">*</span>
          </Label>
          <Select
            value={generoValue}
            onValueChange={(value) => setValue("genero", value as GENERO)}
            disabled={isSubmitting}
          >
            <SelectTrigger
              className={`w-full rounded-lg border px-3 py-2 text-sm transition-colors duration-200
                focus:ring-2 focus:ring-primary/60 focus:border-primary
                ${errors.genero ? "border-red-500" : "border-gray-300"}
                hover:border-gray-400`}
            >
              <SelectValue placeholder="Seleccione el género" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MASCULINO">Masculino</SelectItem>
              <SelectItem value="FEMENINO">Femenino</SelectItem>
            </SelectContent>
          </Select>
          {errors.genero && (
            <p className="text-sm text-destructive">{errors.genero.message}</p>
          )}
        </div>

        {/* Estado */}
        <div className="space-y-2">
          <Label htmlFor="estado">
            Estado <span className="text-gray-500">*</span>
          </Label>
          <Select
            value={estadoValue}
            onValueChange={(value) =>
              setValue("estado", value as ESTADO_SOCIO)
            }
            disabled={isSubmitting}
          >
            <SelectTrigger
              className={`w-full rounded-lg border px-3 py-2 text-sm transition-colors duration-200
                focus:ring-2 focus:ring-primary/60 focus:border-primary
                ${errors.estado ? "border-red-500" : "border-gray-300"}
                hover:border-gray-400`}
            >
              <SelectValue placeholder="Seleccione el estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ACTIVO">Activo</SelectItem>
              <SelectItem value="INACTIVO">Inactivo</SelectItem>
            </SelectContent>
          </Select>
          {errors.estado && (
            <p className="text-sm text-destructive">{errors.estado.message}</p>
          )}
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          className="flex-1 bg-primary hover:bg-primary/85 hover:scale-105 text-white font-medium rounded-lg shadow-sm transition-all duration-200"
          disabled={isSubmitting}
        >
          <Save className="h-4 w-4 mr-2 inline" />
          {isSubmitting ? "Guardando..." : socio ? "Actualizar" : "Crear"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1 bg-destructive hover:bg-destructive/85 hover:scale-105 text-white font-medium rounded-lg shadow-sm transition-all duration-200"
          disabled={isSubmitting}
        >
          <X className="h-4 w-4 mr-2" />
          Cancelar
        </Button>
      </div>
    </form>
  );
}
