"use client"

import { Card, CardContent } from "@/components/ui/card"
import { MorososStats as MorososStatsType } from "@/hooks/api/cobros/useMorososDetallados"
import { Users, DollarSign, AlertTriangle, Clock } from "lucide-react"
import { formatCurrency } from "@/lib/cuenta-corriente-utils"

interface MorososStatsProps {
  estadisticas: MorososStatsType
}

export function MorososStats({ estadisticas }: MorososStatsProps) {
  const stats = [
    {
      title: "Total Morosos",
      value: estadisticas.totalMorosos,
      icon: Users,
      color: "text-red-500",
      bgColor: "bg-red-50 dark:bg-red-950/30",
    },
    {
      title: "Monto Total Deuda",
      value: formatCurrency(estadisticas.montoTotalDeuda),
      icon: DollarSign,
      color: "text-orange-500",
      bgColor: "bg-orange-50 dark:bg-orange-950/30",
    },
    {
      title: "3 Meses",
      value: estadisticas.tresMeses,
      icon: Clock,
      color: "text-yellow-500",
      bgColor: "bg-yellow-50 dark:bg-yellow-950/30",
    },
    {
      title: "4+ Meses",
      value: estadisticas.cuatroMeses + estadisticas.seisMeses,
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-50 dark:bg-red-950/30",
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground truncate">
                  {stat.title}
                </p>
                <p className="text-lg font-semibold text-foreground">
                  {stat.value}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
