"use client";

import Link from "next/link";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, Percent, ArrowRight } from "lucide-react";

export default function CobradoresPage() {
  return (
    <DashboardLayout title="Cobradores" description="Gestión de comisión y cuenta corriente">
      <div className="space-y-4">
        <Link href="/cobradores/cuenta-corriente" className="block">
          <Card className="group cursor-pointer transition-all duration-200 hover:border-primary hover:shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Wallet className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Cuenta corriente</CardTitle>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm">
                Consultá el saldo de cada cobrador y registrá pagos o ajustes.
              </CardDescription>
            </CardContent>
          </Card>
        </Link>

        <Link href="/cobradores/comision" className="block">
          <Card className="group cursor-pointer transition-all duration-200 hover:border-muted-foreground/30 hover:shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                    <Percent className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-base font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                    Comisión por cobrador
                  </CardTitle>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground/50 transition-transform group-hover:translate-x-1 group-hover:text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Configurar porcentajes y consultar resumen de comisión.
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </DashboardLayout>
  );
}
