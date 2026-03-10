import * as React from "react"

/**
 * Mobile breakpoint aligned with Tailwind CSS `md:` breakpoint.
 *
 * BREAKPOINT CONVENTION:
 * - 768px = Tailwind `md:` breakpoint
 * - < 768px = Mobile (useIsMobile returns true)
 * - >= 768px = Desktop (useIsMobile returns false)
 *
 * @see https://tailwindcss.com/docs/responsive-design
 */
const MOBILE_BREAKPOINT = 768

/**
 * Hook para detectar si el viewport actual es mobile (< 768px).
 *
 * Usa matchMedia para detección reactiva que responde a cambios de tamaño
 * de ventana en tiempo real.
 *
 * @returns {boolean} true si el viewport es mobile, false si es desktop
 *
 * @example
 * const isMobile = useIsMobile()
 * if (isMobile) {
 *   // Renderizar versión mobile
 * }
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}
