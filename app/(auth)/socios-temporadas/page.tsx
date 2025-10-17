import { AssociationManagement } from "@/components/association-management"
import { DashboardLayout } from "@/components/dashboard-layout"

export default function AssociationsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Asociaciones Socio-Temporada</h1>
          <p className="text-muted-foreground mt-2">Gestiona las asociaciones entre socios y temporadas de pileta</p>
        </div>

        <AssociationManagement />
      </div>
    </DashboardLayout>
  )
}
