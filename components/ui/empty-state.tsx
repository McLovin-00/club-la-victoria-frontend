import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

import { Card, CardContent } from "@/components/ui/card"

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: ReactNode
}

/**
 * Componente para mostrar estados vacíos de manera consistente.
 * Usa Card como contenedor con layout centrado.
 *
 * @example
 * ```tsx
 * <EmptyState
 *   icon={Inbox}
 *   title="No hay elementos"
 *   description="Aún no se han agregado elementos a esta lista"
 *   action={<Button>Agregar elemento</Button>}
 * />
 * ```
 */
function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <Card
      data-slot="empty-state"
      className="border-dashed bg-background/50"
    >
      <CardContent className="flex flex-col items-center justify-center gap-4 py-12 text-center">
        <div className="animate-[var(--animate-scale-in)] rounded-full bg-muted/50 p-4">
          <Icon className="size-8 text-muted-foreground" />
        </div>
        <div className="animate-[var(--animate-fade-in)] flex flex-col gap-1.5" style={{ animationDelay: '60ms' }}>
          <p className="text-sm font-medium text-foreground">{title}</p>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {action && <div className="animate-[var(--animate-fade-in)] mt-1" style={{ animationDelay: '120ms' }}>{action}</div>}
      </CardContent>
    </Card>
  )
}

export { EmptyState }
export type { EmptyStateProps }
