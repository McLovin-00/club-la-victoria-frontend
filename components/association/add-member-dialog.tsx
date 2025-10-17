"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Search,
  UserPlus,
  Plus,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { useSociosDisponiblesTemporada } from "@/hooks/api/temporadas/useSociosDisponiblesTemporada";

interface AddMemberDialogProps {
  onAddMember: (memberId: string) => void;
  isAdding: boolean;
  canManageMembers: boolean;
  temporadaId: string | null;
}

export function AddMemberDialog({
  onAddMember,
  isAdding,
  canManageMembers,
  temporadaId,
}: AddMemberDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const {
    data: socios,
    isLoading,
    setSearch: setSociosSearchTerm,
    nextPage,
    prevPage,
    page,
    totalPages,
    total,
  } = useSociosDisponiblesTemporada(temporadaId);

  const sociosData = socios || [];

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setSociosSearchTerm(value);
  };

  const handleAddMember = (socioId: string) => {
    onAddMember(socioId);
    setIsOpen(false);
  };

  if (!canManageMembers) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Agregar Socio
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Agregar Socio a la Temporada
          </DialogTitle>
          <DialogDescription>
            Selecciona un socio para agregarlo a esta temporada.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col flex-1 gap-4 overflow-hidden">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar socios por nombre, DNI o email..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Members List */}
          <div className="flex-1 overflow-y-auto">
            {isLoading && socios.length === 0 ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Cargando socios...
                </p>
              </div>
            ) : socios.length === 0 ? (
              <div className="p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  {searchTerm
                    ? "No se encontraron socios"
                    : "No hay socios disponibles"}
                </p>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {sociosData.map((socio) => (
                  <div
                    key={socio.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors bg-background"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex-shrink-0 w-12 h-12 bg-muted rounded-full flex items-center justify-center overflow-hidden">
                        {"fotoUrl" in socio && socio.fotoUrl ? (
                          <Image
                            src={socio.fotoUrl as string}
                            alt={`${socio.nombre} ${socio.apellido}`}
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-lg font-semibold text-muted-foreground">
                            {socio.nombre.charAt(0)}
                            {socio.apellido.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
                          <div className="flex flex-col">
                            <span className="font-medium text-foreground truncate">
                              {socio.nombre} {socio.apellido}
                            </span>
                            <span className="text-sm font-mono text-foreground">
                              {socio.dni}
                            </span>
                          </div>

                          {/* <div className="flex flex-col gap-1 mt-1 sm:mt-0">
                            {socio.email && (
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                <span className="text-sm text-muted-foreground truncate">
                                  {socio.email}
                                </span>
                              </div>
                            )}
                            {socio.telefono && (
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                <span className="text-sm text-muted-foreground">
                                  {socio.telefono}
                                </span>
                              </div>
                            )}
                          </div> */}
                        </div>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <Button
                        onClick={() => socio.id && handleAddMember(socio.id)}
                        disabled={isAdding || !socio.id}
                        size="sm"
                        className="w-full sm:w-auto"
                      >
                        Agregar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && socios.length > 0 && (
            <div className="p-4 border-t">
              <div className="flex flex-col text-center items-center justify-between">
                <p className="text-sm text-muted-foreground mb-4">
                  Mostrando {socios.length} de {total} socios
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={prevPage}
                    disabled={page === 1}
                  >
                    <span className="hidden sm:block">Anterior</span>
                    <ArrowLeft className="w-4 h-4 sm:hidden" />
                  </Button>
                  <span className="text-sm text-muted-foreground text-wrap text-center">
                    Página {page}/{totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={nextPage}
                    disabled={page === totalPages}
                  >
                    <span className="hidden sm:block">Siguiente</span>
                    <ArrowRight className="w-4 h-4 sm:hidden" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
