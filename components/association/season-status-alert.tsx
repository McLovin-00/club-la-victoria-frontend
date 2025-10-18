"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { Temporada } from "@/lib/types";
import { isDatePast, isDateFuture, isDateRangeActive } from "@/lib/utils/date";

interface SeasonStatusAlertProps {
  season: Temporada | undefined;
}

export function SeasonStatusAlert({ season }: SeasonStatusAlertProps) {
  if (!season) return null;

  const hasEnded = isDatePast(season.fechaFin);
  const isActive = isDateRangeActive(season.fechaInicio, season.fechaFin);
  const isFuture = isDateFuture(season.fechaInicio);

  if (hasEnded) {
    return (
      <Alert className="border-red-200 bg-yellow-50 text-red-800">
        <AlertTriangle className="h-4 w-4 my-auto" />
        <AlertDescription>
          Esta temporada ha finalizado. No se pueden agregar o eliminar socios.
        </AlertDescription>
      </Alert>
    );
  }

  if (isActive || isFuture) {
    return (
      <Alert className="border-green-200 bg-green-50 text-grey-800">
        <CheckCircle className="h-4 w-4 my-auto" />
        <AlertDescription>
          Temporada activa o futura. Puedes gestionar los socios asociados.
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}
