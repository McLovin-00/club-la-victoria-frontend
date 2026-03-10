import { cva, type VariantProps } from "class-variance-authority"
import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

type StatusType = "success" | "warning" | "error" | "info"

const statusBadgeVariants = cva(
  "inline-flex items-center justify-center rounded-md px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none",
  {
    variants: {
      status: {
        success: "bg-status-success text-status-success-foreground",
        warning: "bg-status-warning text-status-warning-foreground",
        error: "bg-status-error text-status-error-foreground",
        info: "bg-status-info text-status-info-foreground",
      },
    },
    defaultVariants: {
      status: "info",
    },
  }
)

interface StatusBadgeProps extends VariantProps<typeof statusBadgeVariants> {
  status: StatusType
  children: ReactNode
  className?: string
}

/**
 * Badge de status que usa los tokens de color definidos en globals.css.
 * Soporta cuatro tipos: success, warning, error, info.
 *
 * @example
 * ```tsx
 * <StatusBadge status="success">Activo</StatusBadge>
 * <StatusBadge status="warning">Pendiente</StatusBadge>
 * <StatusBadge status="error">Error</StatusBadge>
 * <StatusBadge status="info">Info</StatusBadge>
 * ```
 */
function StatusBadge({ status, children, className }: StatusBadgeProps) {
  return (
    <span
      data-slot="status-badge"
      className={cn(statusBadgeVariants({ status }), className)}
    >
      {children}
    </span>
  )
}

export { StatusBadge, statusBadgeVariants }
export type { StatusBadgeProps, StatusType }
