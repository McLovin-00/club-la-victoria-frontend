import { MemberManagement } from "@/components/member-management"
import { DashboardLayout } from "@/components/dashboard-layout"

export default function MembersPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="page-header">
          <h1 className="page-title">Gestion de socios</h1>
          <p className="page-description">
            Administra los socios del club, crea nuevos registros y actualiza información
          </p>
        </div>

        <MemberManagement />
      </div>
    </DashboardLayout>
  )
}
