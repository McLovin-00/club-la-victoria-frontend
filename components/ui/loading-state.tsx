import { Skeleton } from "@/components/ui/skeleton"

type LoadingVariant = "card" | "list" | "table"

interface LoadingStateProps {
  count?: number
  variant?: LoadingVariant
}

/**
 * Componente para mostrar estados de carga con skeletons.
 * Soporta tres variantes: card, list y table.
 *
 * @example
 * ```tsx
 * // Cards skeleton
 * <LoadingState variant="card" count={3} />
 *
 * // List skeleton
 * <LoadingState variant="list" count={5} />
 *
 * // Table skeleton
 * <LoadingState variant="table" count={4} />
 * ```
 */
function LoadingState({ count = 3, variant = "card" }: LoadingStateProps) {
  const renderSkeleton = () => {
    switch (variant) {
      case "card":
        return (
          <div className="rounded-xl border border-border/80 bg-card/96 p-6">
            <Skeleton className="h-32 w-full" />
          </div>
        )
      case "list":
        return (
          <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-card/80 p-3">
            <Skeleton className="size-10 shrink-0 rounded-full" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        )
      case "table":
        return (
          <div className="flex items-center gap-4 border-b border-border/60 px-4 py-3">
            <Skeleton className="h-4 w-8" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
          </div>
        )
    }
  }

  return (
    <div
      data-slot="loading-state"
      className="flex flex-col gap-3"
    >
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="animate-[var(--animate-fade-in)]"
          style={{ animationDelay: `${index * 40}ms` }}
        >
          {renderSkeleton()}
        </div>
      ))}
    </div>
  )
}

export { LoadingState }
export type { LoadingStateProps, LoadingVariant }
