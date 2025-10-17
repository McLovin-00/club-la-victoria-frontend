"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Search, Mail, Phone, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { PAGINACION } from "@/lib/constants";
import { SocioTemporada } from "@/hooks/api/socios/useSociosTemporada";

interface SeasonMemberListProps {
  members: SocioTemporada[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onRemoveMember: (memberId: string) => void;
  isRemoving: boolean;
  canManageMembers: boolean;
  currentPage: number;
  totalPages: number;
  membersPerPage: number;
  onPageChange: (page: number) => void;
  onMembersPerPageChange: (value: string) => void;
}

export function SeasonMemberList({
  members,
  searchTerm,
  onSearchChange,
  onRemoveMember,
  isRemoving,
  canManageMembers,
  currentPage,
  totalPages,
  membersPerPage,
  onPageChange,
  onMembersPerPageChange,
}: SeasonMemberListProps) {
  return (
    <div className="space-y-4">
      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar por nombre, DNI o email..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="members-per-page" className="text-sm whitespace-nowrap">
            Mostrar:
          </Label>
          <Select value={membersPerPage.toString()} onValueChange={onMembersPerPageChange}>
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGINACION.OPCIONES_TAMAÑO_PAGINA.map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Members list */}
      <div className="space-y-3">
        {members.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              {searchTerm ? "No se encontraron socios" : "No hay socios asociados a esta temporada"}
            </p>
          </div>
        ) : (
          members.map((socio) => (
            <div
              key={socio.id}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="flex-shrink-0 w-12 h-12 bg-muted rounded-full flex items-center justify-center overflow-hidden">
                  {"fotoUrl" in socio.socio && socio.socio.fotoUrl ? (
                    <Image
                      src={socio.socio.fotoUrl as string}
                      alt={`${socio.socio.nombre} ${socio.socio.apellido}`}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-lg font-semibold text-muted-foreground">
                      {socio.socio.nombre.charAt(0)}{socio.socio.apellido.charAt(0)}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground truncate">
                        {socio.socio.nombre} {socio.socio.apellido}
                      </span>
                      <span className="text-sm font-mono text-foreground">
                        {socio.socio.dni}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1 mt-1 sm:mt-0">
                      {socio.socio.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-sm text-muted-foreground truncate">
                            {socio.socio.email}
                          </span>
                        </div>
                      )}
                      {socio.socio.telefono && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">
                            {socio.socio.telefono}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Activo</Badge>
                </div>
              </div>
              {canManageMembers && (
                <div className="flex-shrink-0">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isRemoving}
                        className="text-destructive hover:text-white hover:bg-destructive/85 duration-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar socio de la temporada?</AlertDialogTitle>
                        <AlertDialogDescription>
                          ¿Estás seguro de que deseas eliminar a {socio.socio.nombre} {socio.socio.apellido} de esta temporada?
                          Esta acción no se puede deshacer.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => socio.id && onRemoveMember(socio.id.toString())}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/85"
                        >
                          Eliminar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Página {currentPage} de {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
