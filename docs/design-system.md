# Design System - Club La Victoria

**Versión**: 1.0.0  
**Última actualización**: Marzo 2026  
**Base**: shadcn/ui "new-york" style + Tailwind CSS 4

---

## 📋 Índice

1. [Filosofía](#filosofía)
2. [Tokens de Color](#tokens-de-color)
3. [Componentes Foundation](#componentes-foundation)
4. [Utilidades](#utilidades)
5. [Guías de Uso](#guías-de-uso)

---

## Filosofía

Este design system está construido sobre **shadcn/ui** con estilo "new-york", utilizando **Tailwind CSS 4** con configuración CSS-first. Los principios clave son:

- **OKLCH para colores**: Mejor percepción visual y soporte para dark mode
- **Tokens semánticos**: Colores con significado (success, warning, error, info)
- **Componentes reutilizables**: Estados de UI estandarizados (loading, error, empty)
- **Sin duplicación**: Una sola fuente de verdad para funciones comunes

---

## Tokens de Color

### Colores Base (OKLCH)

Definidos en `app/globals.css`:

| Token | Light Mode | Dark Mode | Uso |
|-------|-----------|-----------|-----|
| `--background` | `oklch(1 0 0)` | `oklch(0.145 0 0)` | Fondo principal |
| `--foreground` | `oklch(0.145 0 0)` | `oklch(0.985 0 0)` | Texto principal |
| `--primary` | `oklch(0.6 0.118 184.704)` | `oklch(0.6 0.118 184.704)` | Acciones primarias (teal) |
| `--destructive` | `oklch(0.577 0.245 27.325)` | `oklch(0.577 0.245 27.325)` | Acciones destructivas (red) |

### Tokens de Status (Semantic)

Para estados de la aplicación:

```css
/* Success - Verde */
--status-success: oklch(0.65 0.145 145);
--status-success-foreground: oklch(1 0 0);
--status-success-muted: oklch(0.95 0.025 145);

/* Warning - Amber */
--status-warning: oklch(0.75 0.155 70);
--status-warning-foreground: oklch(0.15 0 0);
--status-warning-muted: oklch(0.95 0.03 70);

/* Error - Red */
--status-error: oklch(0.62 0.195 27);
--status-error-foreground: oklch(1 0 0);
--status-error-muted: oklch(0.95 0.035 27);

/* Info - Blue */
--status-info: oklch(0.65 0.145 250);
--status-info-foreground: oklch(1 0 0);
--status-info-muted: oklch(0.95 0.025 250);
```

**Uso en Tailwind**:
```tsx
<div className="bg-status-success text-status-success-foreground">
  Operación exitosa
</div>
```

### Tokens Custom

```css
/* Surfaces */
--surface-soft: color-mix(in oklch, var(--background) 92%, var(--primary) 8%);
--surface-muted: color-mix(in oklch, var(--background) 86%, var(--muted) 14%);

/* Shadows */
--shadow-soft: 0 10px 32px -20px color-mix(in oklch, var(--foreground) 22%, transparent);
```

---

## Componentes Foundation

### EmptyState

**Ubicación**: `components/ui/empty-state.tsx`

Estado vacío para cuando no hay datos.

```tsx
import { EmptyState } from "@/components/ui/empty-state"
import { Inbox } from "lucide-react"

<EmptyState
  icon={Inbox}
  title="No hay socios"
  description="Agrega el primer socio para comenzar"
  action={<Button>Agregar socio</Button>}
/>
```

**Props**:
- `icon` (LucideIcon): Icono a mostrar
- `title` (string): Título del estado
- `description?` (string): Descripción opcional
- `action?` (ReactNode): Botón o acción opcional

---

### ErrorState

**Ubicación**: `components/ui/error-state.tsx`

Estado de error con opción de reintentar.

```tsx
import { ErrorState } from "@/components/ui/error-state"

<ErrorState
  message="No se pudieron cargar los datos"
  retryAction={() => refetch()}
/>
```

**Props**:
- `title?` (string): Título del error (default: "Error")
- `message` (string): Mensaje descriptivo
- `retryAction?` (function): Callback para reintentar

---

### LoadingState

**Ubicación**: `components/ui/loading-state.tsx`

Estado de carga con skeletons.

```tsx
import { LoadingState } from "@/components/ui/loading-state"

// Cards
<LoadingState count={3} variant="card" />

// Lista
<LoadingState count={5} variant="list" />

// Tabla
<LoadingState count={10} variant="table" />
```

**Props**:
- `count?` (number): Cantidad de skeletons (default: 3)
- `variant?` ("card" | "list" | "table"): Tipo de skeleton (default: "card")

---

### StatusBadge

**Ubicación**: `components/ui/status-badge.tsx`

Badge semántico para estados.

```tsx
import { StatusBadge } from "@/components/ui/status-badge"

<StatusBadge status="success">Pagado</StatusBadge>
<StatusBadge status="warning">Pendiente</StatusBadge>
<StatusBadge status="error">Moroso</StatusBadge>
<StatusBadge status="info">Activo</StatusBadge>
```

**Props**:
- `status` ("success" | "warning" | "error" | "info"): Tipo de estado
- `children` (ReactNode): Contenido del badge
- `className?` (string): Clases adicionales

---

## Utilidades

### formatCurrency

**Ubicación**: `lib/cuenta-corriente-utils.ts`

Formatea números como moneda argentina (ARS).

```tsx
import { formatCurrency } from "@/lib/cuenta-corriente-utils"

formatCurrency(15000)  // "$ 15.000"
formatCurrency(1500.5) // "$ 1.500"
```

**Uso**:
- Siempre importar desde `@/lib/cuenta-corriente-utils`
- **NO** crear funciones duplicadas en componentes
- Usa `Intl.NumberFormat` con locale "es-AR"

---

## Guías de Uso

### ✅ Hacer

- **Usar tokens semánticos**: `bg-status-success` en lugar de `bg-green-500`
- **Importar formatCurrency**: Desde `@/lib/cuenta-corriente-utils`
- **Usar componentes foundation**: EmptyState, ErrorState, LoadingState, StatusBadge
- **Seguir patrones shadcn/ui**: Usar componentes de `components/ui/`
- **OKLCH para nuevos colores**: Mejor percepción y dark mode automático

### ❌ No Hacer

- **Hardcodear colores**: `bg-red-500`, `text-blue-600`, etc.
- **Duplicar funciones**: `formatCurrency` ya existe centralizado
- **Crear estados custom**: Usar los componentes foundation
- **Usar colores Tailwind directos**: `bg-green-500` → `bg-status-success`
- **Animaciones no estándar**: `hover:scale-105` no es parte del design system

---

## Migración de Colores

| Color Hardcodeado | Token Semántico |
|------------------|-----------------|
| `bg-green-500`, `text-green-600` | `bg-status-success`, `text-status-success` |
| `bg-yellow-500`, `text-amber-600` | `bg-status-warning`, `text-status-warning` |
| `bg-red-500`, `text-red-600` | `bg-status-error`, `text-status-error` |
| `bg-blue-500`, `text-blue-600` | `bg-status-info`, `text-status-info` |
| `bg-orange-500` | `bg-status-warning` (warning amber) |

---

## Estructura de Archivos

```
club-la-victoria-frontend/
├── app/
│   └── globals.css          # Tokens de diseño
├── components/
│   ├── ui/                  # Componentes shadcn/ui + foundation
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── empty-state.tsx  # ✨ Nuevo
│   │   ├── error-state.tsx  # ✨ Nuevo
│   │   ├── loading-state.tsx # ✨ Nuevo
│   │   └── status-badge.tsx # ✨ Nuevo
│   └── [features]/          # Componentes de features
├── lib/
│   ├── cuenta-corriente-utils.ts  # formatCurrency
│   └── utils/
└── docs/
    └── design-system.md     # Esta documentación
```

---

## Próximos Pasos

### Wave 1: Socios (Pilot)
- [ ] Normalizar `member-form.tsx` (22 HIGH issues)
- [ ] Normalizar `member-management.tsx`
- [ ] Crear wrappers: PageHeader, DataState

### Wave 2: Grupos + Temporadas + Dashboard
- [ ] Migrar a StatusBadge
- [ ] Reemplazar hardcoded colors
- [ ] Estandarizar loading/error states

### Wave 3: Cobros + Cuenta Corriente
- [ ] Test exhaustivo de flujos de dinero
- [ ] Validación con backend

---

## Referencias

- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [OKLCH Color Space](https://oklch.com/)
- [Lucide Icons](https://lucide.dev/)

---

**Mantenido por**: Equipo de Desarrollo  
**Contacto**: Ver repositorio Git
