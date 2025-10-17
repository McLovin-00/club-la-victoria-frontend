export const ROUTES = {
  // Páginas principales
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  
  // Gestión de socios
  MEMBERS: {
    LIST: '/socios',
    CREATE: '/socios/crear',
    EDIT: (id: string) => `/socios/${id}/edit`,
    VIEW: (id: string) => `/socios/${id}`
  },
  
  // Gestión de temporadas
  SEASONS: {
    LIST: '/temporadas',
    CREATE: '/temporadas/crear',
    EDIT: (id: string) => `/temporadas/${id}/edit`,
    VIEW: (id: string) => `/temporadas/${id}`
  },
  
  // Asociaciones
  ASSOCIATIONS: '/socios-temporadas',
  
  // Estadísticas
  STATISTICS: '/estadisticas',
  
  // Perfil y configuración
  PROFILE: '/perfil',
  SETTINGS: '/configuracion'
} as const

export const isActiveRoute = (currentPath: string, route: string) => {
  if (route === '/') {
    return currentPath === '/'
  }
  return currentPath.startsWith(route)
}
