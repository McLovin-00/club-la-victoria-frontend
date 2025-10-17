import { MemberManagement } from "@/components/member-management"
import { DashboardLayout } from "@/components/dashboard-layout"

export default function MembersPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestión de Socios</h1>
          <p className="text-muted-foreground mt-2">
            Administra los socios del club, crea nuevos registros y actualiza información
          </p>
        </div>

        <MemberManagement />
      </div>
    </DashboardLayout>
  )
}
