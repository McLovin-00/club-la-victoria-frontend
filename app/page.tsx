"use client"

// Página principal del dashboard - landing page post-login.
// Muestra KPIs del club y sección de morosidad integrada.

import ProtectedRoute from "@/components/auth/protected-route"
import { DashboardLayout } from "@/components/dashboard-layout"
import { DashboardStats } from "@/components/dashboard-stats"
import { MorososList } from "@/components/dashboard/morosos-list"
import { AlertTriangle } from "lucide-react"

export default function HomePage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-8">
          <div className="page-header">
            <h1 className="page-title">
              Panel de administracion
            </h1>
            <p className="page-description">
              Resumen general del estado del club
            </p>
          </div>

          {/* KPIs principales - delega la obtención de datos al componente */}
          <DashboardStats />

          {/* Sección de morosidad - socios con 3+ meses de cuota impaga */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <h2 className="text-xl font-semibold text-foreground">
                Socios en morosidad
              </h2>
            </div>
            <MorososList />
          </section>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
