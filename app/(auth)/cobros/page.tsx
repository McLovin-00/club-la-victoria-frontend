"use client";

import Link from "next/link";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Tags, FileText, CreditCard, BarChart3, Printer, CalendarCheck } from "lucide-react";

const acciones = [
  {
    titulo: "Categorías",
    descripcion: "Gestionar categorías de socio y montos mensuales",
    href: "/cobros/categorias",
    icon: Tags,
    color: "text-blue-600",
  },
  {
    titulo: "Generar Cuotas",
    descripcion: "Generar cuotas mensuales para socios activos",
    href: "/cobros/generar",
    icon: FileText,
    color: "text-green-600",
  },
  {
    titulo: "Registrar Pagos",
    descripcion: "Registrar pagos por código de barras",
    href: "/cobros/pagos",
    icon: CreditCard,
    color: "text-purple-600",
  },
  {
    titulo: "Estado de Pagos",
    descripcion: "Ver estado de pagos anuales por socio y mes",
    href: "/cobros/estado-pagos",
    icon: CalendarCheck,
    color: "text-teal-600",
  },
  {
    titulo: "Reportes",
    descripcion: "Ver reportes de cobranza y morosidad",
    href: "/cobros/reportes",
    icon: BarChart3,
    color: "text-orange-600",
  },
];

export default function CobrosPage() {
  return (
    <DashboardLayout title="Gestión de Cobros" description="Sistema de gestión de cuotas y pagos">
      <div className="space-y-6">
        <div className="page-header">
          <h1 className="page-title">Gestión de cobros</h1>
          <p className="page-description">
            Centraliza categorías, generación de cuotas, registro de pagos y reportes.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {acciones.map((accion) => (
            <Link key={accion.href} href={accion.href}>
              <Card className="h-full cursor-pointer transition-colors hover:border-primary">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {accion.titulo}
                  </CardTitle>
                  <accion.icon className={`h-5 w-5 ${accion.color}`} />
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    {accion.descripcion}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Módulo de Cobros
            </CardTitle>
            <CardDescription>
              Sistema completo para la gestión de cuotas mensuales, pagos y reportes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 text-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-xs font-bold">
                  1
                </div>
                <div>
                  <p className="font-medium">Configurar Categorías</p>
                  <p className="text-muted-foreground">
                    Defina las categorías de socio con sus respectivos montos mensuales
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-600 text-xs font-bold">
                  2
                </div>
                <div>
                  <p className="font-medium">Generar Cuotas</p>
                  <p className="text-muted-foreground">
                    Genere las cuotas mensuales para todos los socios activos con categoría asignada
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-100 text-purple-600 text-xs font-bold">
                  3
                </div>
                <div>
                  <p className="font-medium">Registrar Pagos</p>
                  <p className="text-muted-foreground">
                    Registre los pagos escaneando el código de barras de cada cuota
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-100 text-orange-600 text-xs font-bold">
                  4
                </div>
                <div>
                  <p className="font-medium">Consultar Reportes</p>
                  <p className="text-muted-foreground">
                    Visualice el estado de cobranza, morosidad y cuentas corrientes
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
