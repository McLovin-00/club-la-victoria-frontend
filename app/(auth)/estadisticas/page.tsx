import { StatisticsView } from "@/components/statistics-view"
import { DashboardLayout } from "@/components/dashboard-layout"

export default function StatisticsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Estadísticas</h1>
          <p className="text-muted-foreground mt-2">Resumen general y registro de ingresos al club</p>
        </div>

        <StatisticsView />
      </div>
    </DashboardLayout>
  )
}
