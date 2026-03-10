import { badgeVariants } from "@/components/ui/badge"
import type { VariantProps } from "class-variance-authority"

type BadgeVariant = VariantProps<typeof badgeVariants>["variant"]

export function getEstadoBadgeVariant(estado: string): BadgeVariant {
  const normalized = estado.toUpperCase()
  
  if (normalized === "ACTIVO") return "default"
  if (normalized === "MOROSO") return "destructive"
  return "secondary"
}

export function getCategoriaBadgeClasses(categoria: string): string {
  const cat = categoria.toUpperCase()
  
  const styles: Record<string, string> = {
    ACTIVO: "border-status-success/50 bg-status-success-muted text-status-success",
    ADHERENTE: "border-status-info/50 bg-status-info-muted text-status-info",
    VITALICIO: "border-status-warning/50 bg-status-warning-muted text-status-warning",
    HONORARIO: "border-purple-500/50 bg-purple-50 text-purple-700 dark:border-purple-400 dark:bg-purple-950/50 dark:text-purple-300",
  }
  
  return styles[cat] || "border-border bg-muted text-muted-foreground"
}
