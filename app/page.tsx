"use client"

// Página principal del dashboard - landing page post-login
// Muestra KPIs del club y métricas financieras

import ProtectedRoute from "@/components/auth/protected-route"
import { DashboardLayout } from "@/components/dashboard-layout"
import { DashboardStats } from "@/components/dashboard-stats"

export default function HomePage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Título del dashboard */}
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Panel de Administración
            </h1>
            <p className="text-muted-foreground">
              Resumen general del estado del club
            </p>
          </div>

          {/* KPIs principales - delega la obtención de datos al componente */}
          <DashboardStats />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
