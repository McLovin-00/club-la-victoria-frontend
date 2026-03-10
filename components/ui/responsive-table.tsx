"use client"

import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { cn } from "@/lib/utils"

/**
 * Definición de columna para la tabla desktop
 */
interface ColumnDef<T> {
  /** Key única para identificar la columna */
  key: string
  /** Contenido del header */
  header: ReactNode
  /** Función que renderiza el contenido de la celda */
  cell: (item: T) => ReactNode
  /** Clases CSS opcionales para el header */
  headerClassName?: string
  /** Clases CSS opcionales para las celdas de esta columna */
  cellClassName?: string
}

/**
 * Props para el componente ResponsiveTable
 */
interface ResponsiveTableProps<T> {
  /** Array de datos a mostrar */
  data: T[]
  /** Función para extraer la key única de cada item */
  keyExtractor: (item: T) => string
  /** Definición de columnas para la tabla desktop */
  columns: ColumnDef<T>[]
  /** Función que renderiza la card para mobile */
  renderCard: (item: T) => ReactNode
  /** Estado de carga */
  loading?: boolean
  /** Componente de loading personalizado */
  loadingComponent?: ReactNode
  /** Icono para estado vacío */
  emptyIcon?: LucideIcon
  /** Mensaje cuando no hay datos */
  emptyMessage?: string
  /** Clases CSS adicionales para el contenedor */
  className?: string
  /** Clases CSS para el contenedor de la tabla desktop */
  tableWrapperClassName?: string
  /** Clases CSS para el contenedor de cards mobile */
  cardsWrapperClassName?: string
}

/**
 * Componente que muestra una tabla en desktop y cards en mobile.
 * Reutiliza el patrón responsive: tabla hidden en mobile, cards hidden en desktop.
 *
 * @example
 * ```tsx
 * <ResponsiveTable
 *   data={users}
 *   keyExtractor={(user) => user.id}
 *   columns={[
 *     { key: "name", header: "Nombre", cell: (user) => user.name },
 *     { key: "email", header: "Email", cell: (user) => user.email },
 *     { key: "actions", header: "Acciones", cell: (user) => <Actions user={user} /> },
 *   ]}
 *   renderCard={(user) => (
 *     <div className="space-y-3 p-4">
 *       <p className="font-semibold">{user.name}</p>
 *       <p className="text-sm text-muted-foreground">{user.email}</p>
 *     </div>
 *   )}
 *   emptyIcon={Users}
 *   emptyMessage="No hay usuarios"
 * />
 * ```
 */
function ResponsiveTable<T>({
  data,
  keyExtractor,
  columns,
  renderCard,
  loading = false,
  loadingComponent,
  emptyIcon: EmptyIcon,
  emptyMessage = "No hay datos para mostrar",
  className,
  tableWrapperClassName,
  cardsWrapperClassName,
}: ResponsiveTableProps<T>) {
  // Loading state
  if (loading) {
    return (
      <div className={cn("py-12 text-center", className)}>
        {loadingComponent || (
          <>
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-sm text-muted-foreground">Cargando...</p>
          </>
        )}
      </div>
    )
  }

  // Empty state
  if (data.length === 0) {
    return (
      <div className={cn("py-8 text-center", className)}>
        {EmptyIcon && (
          <EmptyIcon className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
        )}
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className={className}>
      {/* Desktop Table - hidden en mobile */}
      <div
        className={cn(
          "hidden overflow-hidden rounded-lg border border-border md:block",
          tableWrapperClassName
        )}
      >
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.key} className={column.headerClassName}>
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={keyExtractor(item)}>
                {columns.map((column) => (
                  <TableCell key={column.key} className={column.cellClassName}>
                    {column.cell(item)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Cards - hidden en desktop */}
      <div className={cn("space-y-3 md:hidden", cardsWrapperClassName)}>
        {data.map((item) => (
          <div
            key={keyExtractor(item)}
            className="space-y-3 rounded-lg border border-border p-4 transition-[background-color,transform,box-shadow] duration-[var(--duration-normal)] ease-[var(--ease-out-quart)] hover:bg-muted/50 hover:-translate-y-px hover:shadow-sm"
          >
            {renderCard(item)}
          </div>
        ))}
      </div>
    </div>
  )
}

export { ResponsiveTable }
export type { ResponsiveTableProps, ColumnDef }
