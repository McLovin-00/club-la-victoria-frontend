"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, CalendarDays, ShieldAlert, ShieldCheck, User } from "lucide-react";

import { DashboardLayout } from "@/components/dashboard-layout";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSocioById } from "@/hooks/api/socios/useSocios";
import { ESTADO_SOCIO } from "@/lib/constants";
import { formatDateLong } from "@/lib/utils/date";

function formatFechaAlta(fecha?: string): string {
  if (!fecha) {
    return "Sin fecha registrada";
  }

  const fechaNormalizada = fecha.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaNormalizada)) {
    return fecha;
  }

  return formatDateLong(fechaNormalizada);
}

export default function MemberDetailPage() {
  const { id } = useParams();
  const socioId = Number.parseInt(String(id), 10);
  const idValido = Number.isInteger(socioId) && socioId > 0;

  const { data: socio, isLoading } = useSocioById(socioId);

  const categoriaRaw = socio?.categoria;
  const categoriaActual =
    (typeof categoriaRaw === "string" ? categoriaRaw : categoriaRaw?.nombre) ??
    socio?.categoriaNombre ??
    socio?.nombreCategoria ??
    "Sin categoría asignada";
  const fechaAlta = formatFechaAlta(socio?.fechaAlta ?? socio?.fechaIngreso);
  const overrideManualActivo = Boolean(socio?.overrideManual);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-3">
          <Link href="/socios">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" /> Volver
            </Button>
          </Link>

          {idValido && (
            <Link href={`/socios/${socioId}/edit`}>
              <Button size="sm">Editar socio</Button>
            </Link>
          )}
        </div>

        {!idValido ? (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              El identificador del socio no es válido.
            </CardContent>
          </Card>
        ) : isLoading ? (
          <Card>
            <CardContent className="py-10">
              <LoadingSpinner text="Cargando detalle del socio..." />
            </CardContent>
          </Card>
        ) : !socio ? (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              No se encontró el socio solicitado.
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardContent className="py-6 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-muted overflow-hidden flex items-center justify-center">
                  {socio.fotoUrl ? (
                    <Image
                      src={socio.fotoUrl}
                      alt={`Foto de ${socio.nombre} ${socio.apellido}`}
                      width={80}
                      height={80}
                      className="w-20 h-20 object-cover"
                      unoptimized
                    />
                  ) : (
                    <User className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>

                <div className="space-y-2 min-w-0">
                  <h1 className="text-2xl font-bold text-foreground truncate">
                    {socio.apellido}, {socio.nombre}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant={socio.estado === ESTADO_SOCIO.ACTIVO ? "default" : "secondary"}
                      className={socio.estado === ESTADO_SOCIO.ACTIVO ? "bg-primary text-primary-foreground" : ""}
                    >
                      {socio.estado === ESTADO_SOCIO.ACTIVO ? "Activo" : "Inactivo"}
                    </Badge>
                    <Badge variant="outline">DNI: {socio.dni}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Datos del socio</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium break-all">{socio.email ?? "Sin email"}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Teléfono</p>
                  <p className="font-medium">{socio.telefono ?? "Sin teléfono"}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Dirección</p>
                  <p className="font-medium">{socio.direccion || "Sin dirección"}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Fecha de nacimiento</p>
                  <p className="font-medium">{formatFechaAlta(socio.fechaNacimiento)}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contexto de categoría</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-lg border border-border p-4 space-y-2">
                  <p className="text-sm text-muted-foreground">Categoría actual</p>
                  <p className="font-semibold text-foreground">{categoriaActual}</p>
                </div>

                <div className="rounded-lg border border-border p-4 space-y-2">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" />
                    Fecha de alta
                  </p>
                  <p className="font-semibold text-foreground">{fechaAlta}</p>
                </div>

                <div className="rounded-lg border border-border p-4 space-y-2">
                  <p className="text-sm text-muted-foreground">Override manual</p>
                  <div>
                    {overrideManualActivo ? (
                      <Badge className="bg-destructive text-destructive-foreground">
                        <ShieldAlert className="h-3.5 w-3.5 mr-1" /> Activo
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <ShieldCheck className="h-3.5 w-3.5 mr-1" /> No activo
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
