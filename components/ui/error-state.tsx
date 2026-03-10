import { AlertTriangle } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

interface ErrorStateProps {
  title?: string
  message: string
  retryAction?: () => void
}

/**
 * Componente para mostrar estados de error de manera consistente.
 * Usa Alert con variant="destructive" y permite acción de reintentar.
 *
 * @example
 * ```tsx
 * <ErrorState
 *   title="Error al cargar"
 *   message="No se pudieron obtener los datos del servidor"
 *   retryAction={() => refetch()}
 * />
 * ```
 */
function ErrorState({ title = "Error", message, retryAction }: ErrorStateProps) {
  return (
    <Alert
      data-slot="error-state"
      variant="destructive"
    >
      <AlertTriangle className="size-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="flex flex-col gap-3">
        <span>{message}</span>
        {retryAction && (
          <Button
            variant="outline"
            size="sm"
            onClick={retryAction}
            className="w-fit"
          >
            Reintentar
          </Button>
        )}
      </AlertDescription>
    </Alert>
  )
}

export { ErrorState }
export type { ErrorStateProps }
