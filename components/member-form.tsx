"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Save, X } from "lucide-react";
import { Socio, SocioWithFoto } from "@/lib/types";
import { ESTADO_SOCIO, GENERO } from "@/lib/constants";
import { socioSchema, type SocioFormData } from "@/lib/schemas/socio.schema";
import { formatDateToISO } from "@/lib/utils/date";
import { useCategorias } from "@/hooks/api/categorias/useCategorias";

interface MemberFormProps {
  socio?: Socio;
  onSubmit: (socio: SocioFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  showCategorySelector?: boolean;
}

// Helper para normalizar fechas sin conversión de zona horaria
const normalizeDate = (date?: string | Date | null): string => {
  if (!date) return "";

  // Si ya es un string en formato YYYY-MM-DD, devolverlo tal cual
  if (typeof date === "string") {
    // Validar que sea un formato de fecha válido
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return date;
    }
  }

  // Si es un objeto Date, usar nuestra función sin conversión UTC
  if (date instanceof Date && !isNaN(date.getTime())) {
    return formatDateToISO(date);
  }

  return "";
};

const resolveSocioCategoryId = (socio?: Socio): number | undefined => {
  if (typeof socio?.categoriaId === "number") {
    return socio.categoriaId;
  }

  if (
    socio?.categoria &&
    typeof socio.categoria !== "string" &&
    typeof socio.categoria.id === "number"
  ) {
    return socio.categoria.id;
  }

  return undefined;
};

const resolveSocioCategoryName = (socio?: Socio): string => {
  if (socio?.categoria && typeof socio.categoria !== "string" && socio.categoria.nombre) {
    return socio.categoria.nombre;
  }

  if (socio?.categoriaNombre) {
    return socio.categoriaNombre;
  }

  if (socio?.nombreCategoria) {
    return socio.nombreCategoria;
  }

  return "Sin categoría";
};

export function MemberForm({
  socio,
  onSubmit,
  onCancel,
  isSubmitting,
  showCategorySelector = false,
}: MemberFormProps) {
  const [isOverrideConfirmationOpen, setIsOverrideConfirmationOpen] =
    useState(false);
  const { data: categorias = [] } = useCategorias();
  const categoriaIdInicial = resolveSocioCategoryId(socio);

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
      overrideManual: socio?.overrideManual ?? false,
      categoriaId: categoriaIdInicial,
      fotoUrl: (socio as SocioWithFoto)?.fotoUrl || undefined,
      tarjetaCentro: socio?.tarjetaCentro ?? false,
      numeroTarjetaCentro: socio?.numeroTarjetaCentro || undefined,
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
        overrideManual: socio.overrideManual ?? false,
        categoriaId: resolveSocioCategoryId(socio),
        fotoUrl: (socio as SocioWithFoto)?.fotoUrl || undefined,
        tarjetaCentro: socio.tarjetaCentro ?? false,
        numeroTarjetaCentro: socio.numeroTarjetaCentro || undefined,
      });
    } else {
      // Resetear a valores por defecto cuando no hay socio (creación de nuevo socio)
      reset({
        dni: "",
        nombre: "",
        apellido: "",
        direccion: "",
        email: undefined,
        telefono: undefined,
        fechaNacimiento: "",
        genero: GENERO.MASCULINO,
        estado: ESTADO_SOCIO.ACTIVO,
        overrideManual: false,
        categoriaId: undefined,
        fotoUrl: undefined,
        tarjetaCentro: false,
      });
    }
  }, [socio, reset]);

  const generoValue = watch("genero");
  const estadoValue = watch("estado");
  const overrideManualValue = watch("overrideManual") ?? false;
  const categoriaIdValue = watch("categoriaId");
  const tarjetaCentroValue = watch("tarjetaCentro") ?? false;

  const categoriasVisibles = overrideManualValue
    ? categorias
    : categorias.filter((categoria) => categoria.nombre !== "HONORARIO");

  const categoriaSeleccionada = categorias.find(
    (categoria) => categoria.id === categoriaIdValue
  );
  const nombreCategoriaReadonly = categoriaSeleccionada?.nombre || resolveSocioCategoryName(socio);

  const confirmEnableOverride = () => {
    setValue("overrideManual", true, { shouldDirty: true, shouldValidate: true });

    if (!categoriaIdValue) {
      const categoriaFallback = resolveSocioCategoryId(socio);
      if (categoriaFallback) {
        setValue("categoriaId", categoriaFallback, {
          shouldDirty: true,
          shouldValidate: true,
        });
      }
    }
  };

  const handleOverrideChange = (checked: boolean) => {
    if (checked && !overrideManualValue) {
      setIsOverrideConfirmationOpen(true);
      return;
    }

    if (!checked) {
      setValue("overrideManual", false, { shouldDirty: true, shouldValidate: true });
      setValue("categoriaId", undefined, { shouldDirty: true, shouldValidate: true });
    }
  };

  const handleTarjetaCentroChange = (checked: boolean) => {
    setValue("tarjetaCentro", checked, { shouldDirty: true, shouldValidate: true });
    if (!checked) {
      setValue("numeroTarjetaCentro", undefined, { shouldDirty: true, shouldValidate: true });
    }
  };

  const handleFormSubmit = (data: SocioFormData) => {
    const overrideManual = watch('overrideManual') ?? false;
    const finalData = {
      ...data,
      overrideManual,
      categoriaId: overrideManual ? data.categoriaId : undefined,
      numeroTarjetaCentro: data.tarjetaCentro
        ? data.numeroTarjetaCentro?.replace(/\D/g, "")
        : undefined,
    };
    onSubmit(finalData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* DNI */}
        <div className="space-y-2">
          <Label htmlFor="dni">
            DNI{" "}
            <span className={errors.dni ? "text-destructive" : "text-muted-foreground"}>
              *
            </span>
          </Label>
          <Input
            id="dni"
            {...register("dni")}
            placeholder="12345678"
            maxLength={8}
            aria-invalid={!!errors.dni}
            aria-describedby={errors.dni ? "dni-error" : undefined}
            disabled={isSubmitting}
          />
          {errors.dni && (
            <p id="dni-error" className="text-xs text-destructive mt-1">{errors.dni.message}</p>
          )}
        </div>

        {/* Nombre */}
        <div className="space-y-2">
          <Label htmlFor="nombre">
            Nombre{" "}
            <span className={errors.nombre ? "text-destructive" : "text-muted-foreground"}>
              *
            </span>
          </Label>
          <Input
            id="nombre"
            {...register("nombre")}
            placeholder="Ana"
            maxLength={100}
            aria-invalid={!!errors.nombre}
            aria-describedby={errors.nombre ? "nombre-error" : undefined}
            disabled={isSubmitting}
          />
          {errors.nombre && (
            <p id="nombre-error" className="text-xs text-destructive mt-1">{errors.nombre.message}</p>
          )}
        </div>

        {/* Apellido */}
        <div className="space-y-2">
          <Label htmlFor="apellido">
            Apellido{" "}
            <span className={errors.apellido ? "text-destructive" : "text-muted-foreground"}>
              *
            </span>
          </Label>
          <Input
            id="apellido"
            {...register("apellido")}
            placeholder="García López"
            maxLength={100}
            aria-invalid={!!errors.apellido}
            aria-describedby={errors.apellido ? "apellido-error" : undefined}
            disabled={isSubmitting}
          />
          {errors.apellido && (
            <p id="apellido-error" className="text-xs text-destructive mt-1">
              {errors.apellido.message}
            </p>
          )}
        </div>

        {/* Fecha de Nacimiento */}
        <div className="space-y-2">
          <Label htmlFor="fechaNacimiento">
            Fecha de Nacimiento{" "}
            <span className={errors.fechaNacimiento ? "text-destructive" : "text-muted-foreground"}>
              *
            </span>
          </Label>
          <Input
            id="fechaNacimiento"
            type="date"
            {...register("fechaNacimiento")}
            aria-invalid={!!errors.fechaNacimiento}
            aria-describedby={errors.fechaNacimiento ? "fechaNacimiento-error" : undefined}
            disabled={isSubmitting}
          />
          {errors.fechaNacimiento && (
            <p id="fechaNacimiento-error" className="text-xs text-destructive mt-1">
              {errors.fechaNacimiento.message}
            </p>
          )}
        </div>

        {/* Dirección */}
        <div className="space-y-2">
          <Label htmlFor="direccion">
            Dirección{" "}
            <span className={errors.direccion ? "text-destructive" : "text-muted-foreground"}>
              *
            </span>
          </Label>
          <Input
            id="direccion"
            {...register("direccion")}
            placeholder="Av. Siempre Viva 742"
            maxLength={200}
            aria-invalid={!!errors.direccion}
            aria-describedby={errors.direccion ? "direccion-error" : undefined}
            disabled={isSubmitting}
          />
          {errors.direccion && (
            <p id="direccion-error" className="text-xs text-destructive mt-1">
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
            maxLength={100}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
            disabled={isSubmitting}
          />
          {errors.email && (
            <p id="email-error" className="text-xs text-destructive mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Teléfono */}
        <div className="space-y-2">
          <Label htmlFor="telefono">Teléfono</Label>
          <Input
            id="telefono"
            {...register("telefono")}
            placeholder="1122334455"
            maxLength={20}
            aria-invalid={!!errors.telefono}
            aria-describedby={errors.telefono ? "telefono-error" : undefined}
            disabled={isSubmitting}
          />
          {errors.telefono && (
            <p id="telefono-error" className="text-xs text-destructive mt-1">
              {errors.telefono.message}
            </p>
          )}
        </div>

        {/* Género */}
        <div className="space-y-2">
          <Label htmlFor="genero">
            Género <span className="text-muted-foreground">*</span>
          </Label>
          <Select
            value={generoValue}
            onValueChange={(value) => setValue("genero", value as GENERO)}
            disabled={isSubmitting}
          >
            <SelectTrigger aria-invalid={!!errors.genero}>
              <SelectValue placeholder="Seleccione el género" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MASCULINO">Masculino</SelectItem>
              <SelectItem value="FEMENINO">Femenino</SelectItem>
            </SelectContent>
          </Select>
          {errors.genero && (
            <p id="genero-error" className="text-sm text-destructive">{errors.genero.message}</p>
          )}
        </div>

        {/* Estado */}
        <div className="space-y-2">
          <Label htmlFor="estado">
            Estado <span className="text-muted-foreground">*</span>
          </Label>
          <Select
            value={estadoValue}
            onValueChange={(value) =>
              setValue("estado", value as ESTADO_SOCIO)
            }
            disabled={isSubmitting}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccione el estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ACTIVO">Activo</SelectItem>
              <SelectItem value="INACTIVO">Inactivo</SelectItem>
              <SelectItem value="MOROSO">Moroso</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tarjeta del Centro */}
        <div className="space-y-4 md:col-span-2 border border-border rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Checkbox
              id="tarjetaCentro"
              checked={tarjetaCentroValue}
              onCheckedChange={(checked) => handleTarjetaCentroChange(Boolean(checked))}
              disabled={isSubmitting}
            />

            <div className="space-y-1">
              <Label htmlFor="tarjetaCentro" className="cursor-pointer">
                Tiene tarjeta del centro
              </Label>
              <p className="text-xs text-muted-foreground">
                Marcá esta opción si el socio tiene tarjeta del centro.
              </p>
            </div>
          </div>

          {tarjetaCentroValue && (
            <div className="space-y-2">
              <Label htmlFor="numeroTarjetaCentro">
                Número de tarjeta del centro{" "}
                <span className={errors.numeroTarjetaCentro ? "text-destructive" : "text-muted-foreground"}>
                  *
                </span>
              </Label>
              <Input
                id="numeroTarjetaCentro"
                {...register("numeroTarjetaCentro")}
                placeholder="1234567890123456"
                inputMode="numeric"
                maxLength={16}
                aria-invalid={!!errors.numeroTarjetaCentro}
                aria-describedby={errors.numeroTarjetaCentro ? "numeroTarjetaCentro-error" : undefined}
                disabled={isSubmitting}
              />
              <p className="text-xs text-muted-foreground">
                Ingresá los 16 digitos de la tarjeta, sin espacios ni guiones.
              </p>
              {errors.numeroTarjetaCentro && (
                <p id="numeroTarjetaCentro-error" className="text-xs text-destructive mt-1">
                  {errors.numeroTarjetaCentro.message}
                </p>
              )}
            </div>
          )}
        </div>

        {showCategorySelector && (
          <div className="space-y-4 md:col-span-2 border border-border rounded-lg p-4">
            <div className="space-y-2">
              <Label htmlFor="overrideManual" className="font-semibold">
                Categoría del socio
              </Label>

              <div className="flex items-start gap-3">
                <Checkbox
                  id="overrideManual"
                  checked={overrideManualValue}
                  onCheckedChange={(checked) => handleOverrideChange(Boolean(checked))}
                  disabled={isSubmitting}
                />

                <div className="space-y-1">
                  <Label htmlFor="overrideManual" className="cursor-pointer">
                    Override manual
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Al activarlo, podés elegir manualmente la categoría y frenar el
                    recálculo automático.
                  </p>
                </div>
              </div>
            </div>

            {overrideManualValue ? (
              <div className="space-y-2">
                <Label htmlFor="categoriaId">
                  Selección manual <span className="text-muted-foreground">*</span>
                </Label>

                <Select
                  value={categoriaIdValue ? categoriaIdValue.toString() : undefined}
                  onValueChange={(value) =>
                    setValue("categoriaId", Number(value), {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                  disabled={isSubmitting}
                >
                  <SelectTrigger aria-invalid={!!errors.categoriaId}>
                    <SelectValue placeholder="Seleccioná una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoriasVisibles.map((categoria) => (
                      <SelectItem key={categoria.id} value={categoria.id.toString()}>
                        {categoria.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {errors.categoriaId && (
                  <p id="categoriaId-error" className="text-sm text-destructive">{errors.categoriaId.message}</p>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="categoriaReadonly">Categoría calculada automáticamente</Label>
                <Input id="categoriaReadonly" value={nombreCategoriaReadonly} readOnly disabled />
                <p className="text-xs text-muted-foreground">
                  Sin override, esta categoría se recalcula automáticamente y no se puede editar.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          className="flex-1"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin inline" />
          ) : (
            <Save className="h-4 w-4 mr-2 inline" />
          )}
          {isSubmitting ? "Guardando..." : socio ? "Actualizar" : "Crear"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1"
          disabled={isSubmitting}
        >
          <X className="h-4 w-4 mr-2" />
          Cancelar
        </Button>
      </div>

      <ConfirmationDialog
        isOpen={isOverrideConfirmationOpen}
        onClose={() => setIsOverrideConfirmationOpen(false)}
        onConfirm={confirmEnableOverride}
        title="¿Activar override manual?"
        description="Al confirmar, se desactiva el recálculo automático de categoría y vas a poder elegir cualquier categoría, incluyendo HONORARIO."
        confirmText="Sí, activar"
        cancelText="No activar"
      />
    </form>
  );
}
