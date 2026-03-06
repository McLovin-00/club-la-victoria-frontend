"use client";

import Link from "next/link";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CobradoresPage() {
  return (
    <DashboardLayout title="Cobradores" description="Gestión de comisión y cuenta corriente">
      <div className="grid gap-4 md:grid-cols-2">
        <Link href="/cobradores/comision">
          <Card className="cursor-pointer hover:border-primary">
            <CardHeader>
              <CardTitle>Comisión por cobrador</CardTitle>
            </CardHeader>
            <CardContent>
              Configurar porcentajes y consultar resumen de comisión por rango de fechas.
            </CardContent>
          </Card>
        </Link>

        <Link href="/cobradores/cuenta-corriente">
          <Card className="cursor-pointer hover:border-primary">
            <CardHeader>
              <CardTitle>Cuenta corriente</CardTitle>
            </CardHeader>
            <CardContent>
              Ver saldo y registrar pagos o ajustes del cobrador.
            </CardContent>
          </Card>
        </Link>
      </div>
    </DashboardLayout>
  );
}
