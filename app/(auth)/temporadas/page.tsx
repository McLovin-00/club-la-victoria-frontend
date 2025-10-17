import { SeasonManagement } from "@/components/season-management"
import { DashboardLayout } from "@/components/dashboard-layout"

export default function SeasonsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestión de Temporadas</h1>
          <p className="text-muted-foreground mt-2">
            Administra las temporadas de pileta del club, define períodos y fechas
          </p>
        </div>

        <SeasonManagement />
      </div>
    </DashboardLayout>
  )
}
