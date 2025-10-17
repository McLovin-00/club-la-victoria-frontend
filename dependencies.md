# Documentación de Dependencias - Frontend

Este documento lista todas las dependencias del proyecto frontend con sus propósitos y justificaciones.

## Core Framework

### Next.js 15.5.2
- **Propósito**: Framework React con SSR/SSG, App Router, optimización automática
- **Justificación**: Framework principal del proyecto, proporciona routing, optimización y mejores prácticas

### React 19.0.0 & React-DOM 19.0.0
- **Propósito**: Librería UI declarativa
- **Justificación**: Requerida por Next.js, base del frontend

## State Management & Data Fetching

### @tanstack/react-query 5.62.7
- **Propósito**: Cliente de data fetching con caché, sincronización de servidor
- **Justificación**: Manejo eficiente de llamadas API, cache automático, invalidaciones

### axios 1.7.9
- **Propósito**: Cliente HTTP con interceptores
- **Justificación**: Manejo de requests/responses, transformación de datos, manejo de errores

## UI Framework

### Tailwind CSS 3.4.17
- **Propósito**: Framework CSS utility-first
- **Justificación**: Estilos rápidos, consistentes, tree-shakeable

### @tailwindcss/postcss 4.0.0
- **Propósito**: Plugin PostCSS para Tailwind CSS v4
- **Justificación**: Procesamiento de estilos Tailwind en build time

### class-variance-authority 0.7.1
- **Propósito**: Gestión de variantes de componentes
- **Justificación**: Definir variantes de UI de forma type-safe

### clsx 2.1.1 & tailwind-merge 2.5.5
- **Propósito**: Combinar clases CSS condicionalmente
- **Justificación**: Merge inteligente de clases Tailwind evitando conflictos

## UI Components (shadcn/ui + Radix UI)

### @radix-ui/* (16 packages)
- **Propósito**: Componentes UI accesibles y sin estilos
- **Justificación**: Base para componentes custom, WAI-ARIA compliant
- **Packages**:
  - `react-accordion`, `react-alert-dialog`, `react-aspect-ratio`
  - `react-avatar`, `react-checkbox`, `react-collapsible`
  - `react-context-menu`, `react-dialog`, `react-dropdown-menu`
  - `react-hover-card`, `react-label`, `react-menubar`
  - `react-navigation-menu`, `react-popover`, `react-progress`
  - `react-radio-group`, `react-scroll-area`, `react-select`
  - `react-separator`, `react-slider`, `react-slot`
  - `react-switch`, `react-tabs`, `react-toast`, `react-toggle`
  - `react-toggle-group`, `react-tooltip`

### cmdk 1.0.4
- **Propósito**: Command palette (Command + K)
- **Justificación**: Búsqueda rápida de comandos

### date-fns 4.1.0
- **Propósito**: Utilidades de manipulación de fechas
- **Justificación**: Operaciones con fechas en calendarios

### embla-carousel-react 8.5.1
- **Propósito**: Carrusel touch-friendly
- **Justificación**: Sliders y carruseles responsive

### input-otp 1.4.1
- **Propósito**: Input de OTP/códigos
- **Justificación**: Autenticación con códigos de verificación

### lucide-react 0.468.0
- **Propósito**: Iconos SVG optimizados
- **Justificación**: Sistema de iconos consistente y ligero

### react-day-picker 9.4.4
- **Propósito**: Selector de fechas
- **Justificación**: Calendarios y date pickers

### react-resizable-panels 2.1.7
- **Propósito**: Paneles redimensionables
- **Justificación**: Layouts flexibles con resize

### recharts 2.15.0
- **Propósito**: Gráficos y visualizaciones
- **Justificación**: Dashboard y estadísticas visuales

### sonner 1.7.3
- **Propósito**: Toast notifications elegantes
- **Justificación**: Feedback de acciones del usuario

### vaul 1.1.1
- **Propósito**: Drawer/modal component
- **Justificación**: Modales deslizables desde abajo (mobile-friendly)

## Form Management

### react-hook-form 7.54.2
- **Propósito**: Manejo de formularios performante
- **Justificación**: Gestión de estado de formularios sin re-renders innecesarios

### @hookform/resolvers 3.9.1
- **Propósito**: Integradores de validación para RHF
- **Justificación**: Conectar Zod con React Hook Form

### zod 3.24.1
- **Propósito**: Validación de schemas TypeScript-first
- **Justificación**: Validación type-safe de formularios y API responses

## Utilities

### geist 1.3.1
- **Propósito**: Fuente Geist Sans/Mono de Vercel
- **Justificación**: Tipografía profesional

### jwt-decode 4.0.0
- **Propósito**: Decodificación de JWT
- **Justificación**: Extraer información de tokens JWT

### next-themes 0.4.4
- **Propósito**: Gestión de temas (dark/light)
- **Justificación**: Soporte de modo oscuro persistente

## Development Dependencies

### TypeScript 5.7.2
- **Propósito**: Superset de JavaScript con tipos estáticos
- **Justificación**: Type safety en todo el codebase

### ESLint + Plugins
- **eslint**: Linter de JavaScript/TypeScript
- **@typescript-eslint/parser**: Parser de TypeScript para ESLint
- **@typescript-eslint/eslint-plugin**: Reglas específicas de TypeScript
- **eslint-config-next**: Configuración ESLint de Next.js
- **Justificación**: Code quality, detección temprana de errores

### @types/* (3 packages)
- **@types/node**: Tipos de Node.js
- **@types/react**: Tipos de React
- **@types/react-dom**: Tipos de ReactDOM
- **Justificación**: Type definitions para librerías JavaScript

### postcss 8.4.49
- **Propósito**: Procesador CSS
- **Justificación**: Requerido por Tailwind CSS

## Dependencias Removidas (Audit PR #6)

Las siguientes dependencias fueron identificadas como no utilizadas y removidas:

- ❌ **@types/lodash** - No se usa Lodash en el proyecto
- ❌ **@vercel/analytics** - Analytics no implementado
- ❌ **debounce** - Se implementó debounce custom
- ❌ **get-orientation** - No se usa detección de orientación
- ❌ **tailwindcss-animate** - No se usan animaciones de esta librería
- ❌ **autoprefixer** - No se usa (Tailwind v4 incluye autoprefixer)
- ❌ **tw-animate-css** - Duplicado, no usado

**Total ahorrado**: ~5 MB en node_modules

## Verificación de Seguridad

Última auditoría: 2025-10-15
```bash
npm audit
# found 0 vulnerabilities
```

## Mantenimiento

### Actualización de Dependencias

Para verificar dependencias desactualizadas:
```bash
npm outdated
```

Para actualizar (con cuidado):
```bash
npm update --save
```

### Limpieza Periódica

Ejecutar cada 3 meses:
```bash
# Verificar dependencias no usadas
npx depcheck

# Verificar exports no usados
npx ts-prune

# Verificar vulnerabilidades
npm audit
```

## Criterios para Agregar Nuevas Dependencias

Antes de agregar una nueva dependencia, verificar:

1. ✅ **Necesidad**: ¿Es realmente necesaria o se puede implementar?
2. ✅ **Mantenimiento**: ¿Está activamente mantenida? (commits recientes)
3. ✅ **Popularidad**: ¿Tiene buena adopción? (npm downloads, GitHub stars)
4. ✅ **Tamaño**: ¿Es lightweight? (< 500 KB)
5. ✅ **TypeScript**: ¿Tiene tipos incluidos o @types disponibles?
6. ✅ **Licencia**: ¿Es compatible? (MIT, Apache 2.0, etc.)
7. ✅ **Seguridad**: ¿Tiene vulnerabilidades conocidas? (`npm audit`)

---

**Última actualización**: 2025-10-15
**Total de dependencias**: 54 production + 9 dev
