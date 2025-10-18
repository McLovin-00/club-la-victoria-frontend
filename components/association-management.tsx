"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Users } from "lucide-react";

// Import types and constants
import { PAGINACION } from "@/lib/constants";
import { useSearch } from "@/hooks/use-search";
import { useTemporadas } from "@/hooks/api/temporadas/useTemporadas";
import { useSociosTemporada } from "@/hooks/api/socios/useSociosTemporada";
import { useAgregarSocioTemporada } from "@/hooks/api/socios/useAgregarSocioTemporada";
import { useEliminarSocioTemporada } from "@/hooks/api/socios/useEliminarSocioTemporada";

// Import new components
import { SeasonSelector } from "@/components/association/season-selector";
import { SeasonStatusAlert } from "@/components/association/season-status-alert";
import { SeasonMemberList } from "@/components/association/season-member-list";
import { AddMemberDialog } from "@/components/association/add-member-dialog";
import { formatDateShort, isDateRangeActive, isDatePast } from "@/lib/utils/date";

export function AssociationManagement() {
  // Estados para selección de temporada
  const [temporadaSeleccionada, setTemporadaSeleccionada] = useState<string>("");
  // Estados para paginación de socios asociados
  const [currentPage, setCurrentPage] = useState(1);
  const [sociosPorPagina, setSociosPorPagina] = useState<number>(
    PAGINACION.TAMAÑO_PAGINA_POR_DEFECTO
  );
  
  // Estados para búsqueda de socios asociados
  const { searchTerm, handleSearchChange } = useSearch({
    onSearch: () => {
      // Búsqueda manejada por el filtrado local
    },
  });
  
  //FETCHS
  const { data: temporadas = [] } = useTemporadas();
  const { data: sociosTemporada = [], isLoading: isLoadingSociosTemporada } = useSociosTemporada(temporadaSeleccionada);
  // Hooks para agregar y eliminar socios de la temporada
  const agregarSocioMutation = useAgregarSocioTemporada();
  const eliminarSocioMutation = useEliminarSocioTemporada();

  // Auto-select current or latest season
  useEffect(() => {
    const temporadaActualObj = temporadas.find((temporada) => {
      return isDateRangeActive(temporada.fechaInicio, temporada.fechaFin);
    });

    if (temporadaActualObj?.id) {
      setTemporadaSeleccionada(temporadaActualObj.id);
    } else if (temporadas.length > 0) {
      // Ordenar por fecha de inicio más reciente
      const temporadasOrdenadas = [...temporadas].sort((a, b) => {
        // Comparar fechas como strings YYYY-MM-DD (funcionan bien alfabéticamente)
        return b.fechaInicio.localeCompare(a.fechaInicio);
      });
      const primeraTemporada = temporadasOrdenadas[0];
      if (primeraTemporada?.id) {
        setTemporadaSeleccionada(primeraTemporada.id);
      }
    }
  }, [temporadas]);

  const temporadaSeleccionadaObj = temporadas.find(
    (temporada) => temporada.id === temporadaSeleccionada
  );

  // Check if can manage members (future or active seasons)
  const puedeGestionarSocios = temporadaSeleccionadaObj
    ? !isDatePast(temporadaSeleccionadaObj.fechaFin)
    : false;

  const handleAgregarSocioATemporada = async (idSocio: string) => {
    if (!temporadaSeleccionada) return;

    agregarSocioMutation.mutate({
      socioId: idSocio,
      temporadaId: temporadaSeleccionada,
    });
  };

  const handleEliminarAsociacion = (idSocio: string) => {
    if (!puedeGestionarSocios) {
      toast.error("No se pueden eliminar socios de temporadas finalizadas");
      return;
    }

    if (!temporadaSeleccionada) return;

    eliminarSocioMutation.mutate({
      socioId: idSocio,
      temporadaId: temporadaSeleccionada,
    });
  };

  // Filter and paginate season members
    const sociosTemporadaFiltrados = useMemo(() => {
      let socios = sociosTemporada;
      
      if (searchTerm.trim()) {
        const busquedaLower = searchTerm.toLowerCase();
        socios = socios.filter((socio) => {
          return (
            `${socio.socio.nombre} ${socio.socio.apellido}`
              .toLowerCase()
              .includes(busquedaLower) ||
            socio.socio.dni.toLowerCase().includes(busquedaLower) ||
            (socio.socio.email &&
              socio.socio.email.toLowerCase().includes(busquedaLower))
          );
        });
      }
      
    return socios;
  }, [searchTerm, sociosTemporada]);

  const totalPages = Math.ceil(sociosTemporadaFiltrados.length / sociosPorPagina);
  const startIndex = (currentPage - 1) * sociosPorPagina;
  const sociosTemporadaPaginados = sociosTemporadaFiltrados.slice(
    startIndex,
    startIndex + sociosPorPagina
  );

  const handleSociosPorPaginaChange = (value: string) => {
    setSociosPorPagina(parseInt(value));
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Gestión de Asociaciones
              </CardTitle>
              <CardDescription>
                Administra los socios asociados a cada temporada
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Season Selection */}
          <SeasonSelector
            seasons={temporadas}
            selectedSeasonId={temporadaSeleccionada}
            onSeasonChange={setTemporadaSeleccionada}
            formatDate={formatDateShort}
          />

          {/* Season Status Alert */}
          <SeasonStatusAlert season={temporadaSeleccionadaObj} />

          {/* Current Members Section */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h3 className="text-lg font-semibold">
                Socios de la Temporada
                {isLoadingSociosTemporada ? (
                  <div className="inline-block ml-2 animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                ) : (
                  <span className="ml-2 inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
                    {sociosTemporadaFiltrados.length}
                  </span>
                )}
              </h3>
              
              {/* Add Member Dialog */}
              <AddMemberDialog
                onAddMember={handleAgregarSocioATemporada}
                isAdding={agregarSocioMutation.isPending}
                canManageMembers={puedeGestionarSocios}
                temporadaId={temporadaSeleccionada}
              />
            </div>

            {/* Members List */}
            <SeasonMemberList
              members={sociosTemporadaPaginados}
              searchTerm={searchTerm}
              onSearchChange={handleSearchChange}
              onRemoveMember={handleEliminarAsociacion}
              isRemoving={eliminarSocioMutation.isPending}
              canManageMembers={puedeGestionarSocios}
              currentPage={currentPage}
              totalPages={totalPages}
              membersPerPage={sociosPorPagina}
              onPageChange={setCurrentPage}
              onMembersPerPageChange={handleSociosPorPaginaChange}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
