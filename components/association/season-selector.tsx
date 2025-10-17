"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Calendar } from "lucide-react";
import { Temporada } from "@/lib/types";

interface SeasonSelectorProps {
  seasons: Temporada[];
  selectedSeasonId: string;
  onSeasonChange: (seasonId: string) => void;
  formatDate: (dateString: string) => string;
}

export function SeasonSelector({
  seasons,
  selectedSeasonId,
  onSeasonChange,
  formatDate,
}: SeasonSelectorProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="season-select" className="text-sm font-medium">
        Temporada
      </Label>
      <Select value={selectedSeasonId} onValueChange={onSeasonChange}>
        <SelectTrigger id="season-select">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <SelectValue placeholder="Selecciona una temporada" />
          </div>
        </SelectTrigger>
        <SelectContent className="cursor-pointer">
          {seasons
            .filter((temporada) => temporada.id)
            .map((temporada) => (
              <SelectItem key={temporada.id} value={temporada.id as string}>
                <div className="flex flex-col sm:flex-row items-center sm:gap-4">
                  <span className="font-medium">{temporada.nombre}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(temporada.fechaInicio)} - {formatDate(temporada.fechaFin)}
                  </span>
                </div>
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
    </div>
  );
}
