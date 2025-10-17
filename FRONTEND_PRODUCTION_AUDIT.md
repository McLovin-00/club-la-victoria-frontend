# AUDITORÍA INTEGRAL DE PRODUCCIÓN - FRONTEND NEXT.JS 15
## Sistema de Ingresos Club La Victoria

**Fecha:** 16 de Octubre, 2025
**Auditor:** Senior Frontend Architect & Technical Lead
**Stack:** Next.js 15.5.2, React 19, TypeScript 5, React Query v5, React Hook Form 7.60, Zod 3.25

---

## 1. RESUMEN EJECUTIVO

### Top Hallazgos Críticos y de Alto Impacto

| ID | Título | Impacto | Esfuerzo (h) | Riesgo si No se Corrige |
|----|--------|---------|--------------|-------------------------|
| **SEC-001** | **Tokens JWT almacenados en localStorage** | 🔴 **ALTO** | 4h | **CRÍTICO**: Vulnerabilidad XSS permite robo de tokens y suplantación de identidad |
| **RSC-001** | **Página root usa "use client" innecesario** | 🔴 **ALTO** | 0.5h | **ALTO**: Bundle JS innecesario aumenta FCP/TTI, degradación SEO |
| **TS-001** | **2 errores TypeScript en producción** | 🟠 **ALTO** | 1h | **ALTO**: Posibles runtime errors en manejo de errores críticos |
| **RQ-001** | **Query keys como strings en hooks** | 🟠 **ALTO** | 3h | **MEDIO**: Cache invalidation inconsistente, stale data en producción |
| **RQ-002** | **Sin HydrationBoundary para SSR** | 🟠 **ALTO** | 2h | **MEDIO**: Requests duplicados server/client, FOUC, slow initial render |
| **SEC-002** | **Falta Content Security Policy** | 🔴 **ALTO** | 2h | **ALTO**: Exposición a XSS, clickjacking, injection attacks |
| **RQ-003** | **No hay Error Boundaries con Query** | 🟠 **ALTO** | 2h | **MEDIO**: Crashes no controlados, UX degradada en errores de red |
| **FORM-001** | **Login sin Zod, validación manual** | 🟠 **MEDIO** | 2h | **MEDIO**: Inconsistencia validación, menor type-safety |
| **A11Y-001** | **Formularios sin aria-describedby** | 🟠 **MEDIO** | 3h | **MEDIO**: Incumplimiento WCAG 2.1 AA, usuarios con SR no reciben feedback |
| **PERF-001** | **Imágenes externas sin priority** | 🟠 **MEDIO** | 1h | **BAJO**: LCP >2.5s en home/login afecta Core Web Vitals |

### Estadísticas Generales

- **Total de Archivos Analizados**: 73 (app, components, hooks, lib)
- **Hallazgos Totales**: 24 (4 Críticos, 8 Altos, 12 Medios)
- **Errores TypeScript**: 2 (lib/error-handler.ts:47-48)
- **Deuda Técnica Estimada**: ~35 horas de desarrollo
- **Riesgo General**: 🟠 **MEDIO-ALTO** (bloqueantes de seguridad presentes)

---

## 2. SCORECARD POR DIMENSIÓN (0-100)

| Dimensión | Puntaje | Evidencias | Justificación |
|-----------|---------|------------|---------------|
| **Consistencia de código** | 72/100 | ✅ ESLint configurado<br/>✅ Prettier presente<br/>❌ Sin husky/lint-staged<br/>⚠️ Mega-componentes (>300 LOC) | Buena base pero falta enforcement pre-commit. `member-management.tsx:314` líneas. |
| **RSC vs Client Components** | 65/100 | ✅ Mayoría correcto<br/>❌ `app/page.tsx:1` innecesario<br/>⚠️ Algunos límites difusos | `app/page.tsx` usa "use client" solo para redirect (debe ser Server Action). |
| **Conformidad Next.js 15** | 58/100 | ✅ App Router adoptado<br/>❌ Sin `generateMetadata`<br/>❌ Sin `loading.tsx`/`error.tsx`<br/>❌ Sin `revalidate` config | Falta `app/*/loading.tsx`, `app/*/error.tsx`. No usa `export const revalidate`. |
| **Performance** | 60/100 | ✅ `next/image` usado<br/>❌ Sin `priority` en LCP<br/>❌ Sin `next/font` local<br/>⚠️ Sin `dynamic()` | `app/(public)/login/page.tsx:12-17` imagen externa sin `priority`. Fuentes Geist via NPM ok. |
| **React Query** | 55/100 | ✅ Hooks custom<br/>❌ Keys strings (no arrays)<br/>❌ Sin Hydration<br/>⚠️ `gcTime` solo 60s | `hooks/api/socios/useSocios.tsx:16` key como string. `providers/auth-provider.tsx:13` solo `staleTime`, falta `gcTime`. |
| **Formularios (RHF+Zod)** | 78/100 | ✅ `member-form.tsx` excelente<br/>✅ Schemas Zod robustos<br/>❌ Login sin Zod<br/>⚠️ Falta `aria-describedby` | `components/login-form.tsx:26-29` validación manual. `member-form.tsx` no conecta errors a inputs con aria. |
| **Seguridad** | 48/100 | ✅ JWT validation<br/>✅ HTTPS headers básicos<br/>❌ localStorage tokens<br/>❌ Sin CSP<br/>⚠️ Sin CSRF | `lib/utils/token-storage.ts:23` **CRÍTICO**. `next.config.mjs:22-45` headers básicos, falta CSP. |
| **Accesibilidad** | 62/100 | ✅ Labels correctos<br/>✅ Roles semánticos<br/>❌ Sin `aria-describedby`<br/>⚠️ Focus management | Formularios carecen de `<p id="error-id">` + `aria-describedby`. |
| **DX/Calidad** | 70/100 | ✅ TypeScript strict<br/>✅ Path aliases<br/>❌ 2 TS errors<br/>❌ Sin pre-commit<br/>❌ Sin tests | `tsconfig.json:7` strict mode ok. `lib/error-handler.ts:47-48` TS errors. |
| **Bundle/Build** | 72/100 | ✅ `unoptimized: false`<br/>✅ Tree-shaking<br/>⚠️ Sin análisis bundle<br/>⚠️ Sin code splitting manual | `next.config.mjs:10` optimizado. Falta `@next/bundle-analyzer`. |

**Puntaje Global Ponderado**: **64/100** 🟠

---

## 3. CHECKLIST DE AUDITORÍA DETALLADO

### 3.1 Estructura App Router

| Criterio | Estado | Archivo/Evidencia |
|----------|--------|-------------------|
| Uso correcto `app/` directory | ✅ | `app/layout.tsx`, `app/(auth)/layout.tsx` |
| `layout.tsx` en rutas principales | ✅ | `app/layout.tsx:1`, `app/(auth)/layout.tsx:1` |
| `page.tsx` como endpoints | ✅ | 8 pages encontrados |
| `loading.tsx` para Suspense | ❌ | **Ausente** en todas las rutas |
| `error.tsx` para Error Boundaries | ❌ | **Ausente** en todas las rutas |
| Rutas anidadas/segmentos | ✅ | `app/(auth)/socios/[id]/edit/page.tsx` |
| Parallel/Intercepted routes | ⚠️ | No aplicable en este proyecto |

**Evidencia Crítica**: No se encontró ningún `loading.tsx` ni `error.tsx` en el proyecto.

### 3.2 RSC vs Client Components

| Criterio | Estado | Archivo/Evidencia |
|----------|--------|-------------------|
| `"use client"` solo con estado/efectos | ⚠️ | `app/page.tsx:1` **INNECESARIO** |
| Lógica pesada en Server Components | ✅ | `app/(public)/login/page.tsx:5` RSC puro |
| Data fetching en Server Components | ❌ | Fetch en Client Components vía React Query |
| Componentes UI compartidos sin directiva | ⚠️ | `components/ui/*` correcto |

**Evidencia**: `app/page.tsx:1-14` es Client Component solo para redirect (debe ser Server Component con `redirect()` de next/navigation).

### 3.3 Datos y Caché

| Criterio | Estado | Archivo/Evidencia |
|----------|--------|-------------------|
| `fetch` con opciones caché | ❌ | No se usa `fetch` directo en Server Components |
| `export const revalidate` | ❌ | Ausente en todas las pages |
| `export const dynamic` | ❌ | Ausente |
| Invalidación por tags | ❌ | No implementado |
| React Query configurado | ⚠️ | `providers/auth-provider.tsx:10-21` parcial |

**Evidencia**: No hay uso de Next.js caching (`revalidate`, `dynamic`, `fetch options`). Todo el caching delegado a React Query.

### 3.4 React Query

| Criterio | Estado | Archivo/Evidencia |
|----------|--------|-------------------|
| `QueryClient` centralizado | ✅ | `providers/auth-provider.tsx:8-22` |
| `HydrationBoundary` en Server Components | ❌ | **Ausente** - no hay SSR de queries |
| Query keys estables (arrays) | ❌ | `hooks/api/socios/useSocios.tsx:16` usa string |
| `staleTime` configurado | ✅ | `providers/auth-provider.tsx:13` (60s) |
| `gcTime` configurado | ⚠️ | Solo default (5min), debería ser explícito |
| `enabled` para queries condicionales | ✅ | `hooks/api/socios/useSocioById.tsx:24` |
| Políticas de retry | ⚠️ | `providers/auth-provider.tsx:14-17` solo para 401 |
| Error handling (`isError`, `error`) | ✅ | Todos los hooks retornan error states |
| `QueryErrorResetBoundary` | ❌ | **Ausente** |

**Evidencia Crítica**:
```typescript
// hooks/api/socios/useSocios.tsx:14-20
export const useSocios = () => {
  return usePaginatedSearchQuery<SocioWithFoto>({
    queryKey: "socios", // ❌ Debería ser ['socios']
    url: "/socios",
    initialLimit: 10,
  });
};
```

### 3.5 Formularios

| Criterio | Estado | Archivo/Evidencia |
|----------|--------|-------------------|
| Esquemas Zod por feature | ✅ | `lib/schemas/socio.schema.ts`, `temporada.schema.ts` |
| Tipos inferidos (`z.infer`) | ✅ | `lib/schemas/socio.schema.ts:109` |
| `zodResolver` en formularios | ⚠️ | `member-form.tsx:56` ✅, `login-form.tsx` ❌ |
| `defaultValues` completos | ✅ | `member-form.tsx:57-69` |
| Controlled vs Uncontrolled | ✅ | Controlled con `register` |
| Mensajes de error accesibles | ⚠️ | Sin `aria-describedby` |
| Componentes de input reutilizables | ⚠️ | Parcial: `components/ui/input.tsx` genérico |

**Evidencia**:
```typescript
// components/login-form.tsx:22-38 - ❌ Validación manual sin Zod
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");

  if (!usuario || !password) { // ❌ Validación manual
    setError("Por favor ingresa usuario y contraseña");
    return;
  }
  // ...
};
```

### 3.6 UI/Estado

| Criterio | Estado | Archivo/Evidencia |
|----------|--------|-------------------|
| Separación Presentational/Container | ⚠️ | Algunos componentes mezclan lógica |
| Evitar "mega-componentes" | ❌ | `member-management.tsx:313` líneas |
| Props tipadas | ✅ | Interfaces TypeScript correctas |
| `useCallback`/`useMemo` apropiado | ⚠️ | Presente pero no exhaustivo |

### 3.7 Rendimiento

| Criterio | Estado | Archivo/Evidencia |
|----------|--------|-------------------|
| `next/image` usado | ✅ | `app/(public)/login/page.tsx:12`, `components/member-management.tsx:148` |
| `priority` en LCP images | ❌ | Imagen de login sin `priority` |
| `sizes` especificado | ⚠️ | Ausente en mayoría |
| `next/font` usado | ✅ | `app/layout.tsx:2-3` Geist fonts |
| `dynamic()` para code-splitting | ❌ | No usado |
| Memoización correcta | ⚠️ | `hooks/api/common/usePaginatedSearchQuery.ts:36,40` |

**Evidencia**:
```typescript
// app/(public)/login/page.tsx:12-17 - ❌ Sin priority
<Image
  alt="Logo"
  src="https://clublavictoria.com.ar/static/media/logo.6dafc533b0491900e9a6.png"
  width={72}
  height={48}
  className="mb-4"
  // ❌ Falta: priority={true}
  // ❌ Falta: sizes="72px"
/>
```

### 3.8 Accesibilidad

| Criterio | Estado | Archivo/Evidencia |
|----------|--------|-------------------|
| Labels vinculados (`htmlFor`) | ✅ | `member-form.tsx:101`, `login-form.tsx:50` |
| Descripciones de error | ⚠️ | Texto visible pero sin `aria-describedby` |
| Focus visible | ✅ | Estilos Tailwind `focus:ring-*` |
| Navegación por teclado | ✅ | Componentes nativos/Radix |
| Roles ARIA | ✅ | `components/ui/alert-dialog.tsx` |
| `aria-live` para cambios | ❌ | Ausente en toasts dinámicos |

**Evidencia**:
```typescript
// member-form.tsx:107-121 - ⚠️ Error sin aria-describedby
<Label htmlFor="dni">DNI *</Label>
<Input
  id="dni"
  {...register("dni")}
  className={errors.dni ? "border-red-500" : "border-gray-300"}
  // ❌ Falta: aria-invalid={!!errors.dni}
  // ❌ Falta: aria-describedby={errors.dni ? "dni-error" : undefined}
/>
{errors.dni && (
  <p className="text-xs text-red-500 mt-1">
    {/* ❌ Falta: id="dni-error" */}
    {errors.dni.message}
  </p>
)}
```

### 3.9 Seguridad

| Criterio | Estado | Archivo/Evidencia |
|----------|--------|-------------------|
| Sanitización HTML | ✅ | No se usa `dangerouslySetInnerHTML` |
| Validación de rutas/params | ✅ | Zod schemas validan inputs |
| No exponer secretos | ✅ | Solo `NEXT_PUBLIC_API_URL` |
| Headers de seguridad | ⚠️ | `next.config.mjs:22-45` básicos, **falta CSP** |
| Tokens NO en `localStorage` | ❌ | **`lib/utils/token-storage.ts:23` CRÍTICO** |
| Cookies `httpOnly`/`SameSite` | ❌ | No se usan cookies |
| Validación CSRF | ❌ | No implementado |

**Evidencia CRÍTICA**:
```typescript
// lib/utils/token-storage.ts:19-27 - 🔴 RIESGO XSS
export const setToken = (token: string): void => {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(TOKEN_KEY, token); // 🔴 VULNERABLE A XSS
  } catch (error) {
    console.error('Error storing token:', error);
  }
};
```

### 3.10 Styling/Design System

| Criterio | Estado | Archivo/Evidencia |
|----------|--------|-------------------|
| Convenciones Tailwind | ✅ | Uso consistente |
| Tokens de diseño | ⚠️ | CSS variables en `globals.css` |
| Componentes atómicos | ✅ | `components/ui/*` shadcn/ui |
| Storybook | ❌ | No implementado |

### 3.11 Testing/Calidad

| Criterio | Estado | Archivo/Evidencia |
|----------|--------|-------------------|
| Tests unitarios | ❌ | **Ausentes** |
| Tests integración (RTK) | ❌ | **Ausentes** |
| Tests E2E (Playwright) | ❌ | **Ausentes** |
| ESLint configurado | ✅ | `.eslintrc.json` |
| `tsc --noEmit` pasa | ❌ | **2 errores TS** |
| `lint-staged`/`husky` | ❌ | **Ausentes** |

**Evidencia**: `npx tsc --noEmit` retorna:
```
lib/error-handler.ts(47,20): error TS18047: 'errorData' is possibly 'null'.
lib/error-handler.ts(48,17): error TS18047: 'errorData' is possibly 'null'.
```

### 3.12 Package/Build

| Criterio | Estado | Archivo/Evidencia |
|----------|--------|-------------------|
| Sin dependencias muertas | ✅ | Todas en uso |
| Scripts útiles | ✅ | `build`, `dev`, `lint`, `format` |
| CI baseline | ❌ | No hay `.github/workflows` |
| Análisis de bundle | ❌ | `@next/bundle-analyzer` ausente |

---

## 4. HALLAZGOS DETALLADOS CON SOLUCIONES

### 🔴 HALLAZGO #1: TOKENS JWT EN LOCALSTORAGE (SEC-001)

**Severidad**: BLOQUEANTE
**Categoría**: Seguridad
**Impacto**: CRÍTICO - Vulnerabilidad a XSS permite robo de tokens y suplantación de identidad

#### Contexto

Next.js 15 permite el uso de Server Actions y Route Handlers que pueden setear cookies `httpOnly` desde el servidor. Almacenar tokens JWT en `localStorage` los expone a ataques XSS si cualquier script malicioso se ejecuta en el navegador (ej. via dependencia comprometida, CDN, extensión). Las cookies `httpOnly` no son accesibles desde JavaScript.

#### Evidencia

**Archivo**: `lib/utils/token-storage.ts:19-27`

```typescript
export const setToken = (token: string): void => {
  if (!isBrowser()) return;

  try {
    localStorage.setItem(TOKEN_KEY, token); // 🔴 VULNERABLE
  } catch (error) {
    console.error('Error storing token:', error);
  }
};
```

**Uso**: `lib/api/auth.ts:16`, `lib/api/client.ts:15`

#### Cómo Arreglar

**Paso 1**: Crear Route Handler para login que setee cookie `httpOnly`:

```typescript
// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { usuario, password } = await request.json();

    // Llamar a backend
    const response = await fetch(`${process.env.API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario, password }),
    });

    if (!response.ok) {
      return NextResponse.json(
        { message: 'Credenciales inválidas' },
        { status: response.status }
      );
    }

    const token = await response.text();

    // ✅ Setear cookie httpOnly
    cookies().set({
      name: 'authToken',
      value: token,
      httpOnly: true, // ✅ No accesible desde JS
      secure: process.env.NODE_ENV === 'production', // ✅ Solo HTTPS en prod
      sameSite: 'lax', // ✅ Protección CSRF
      maxAge: 60 * 60 * 24 * 7, // 7 días
      path: '/',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { message: 'Error de servidor' },
      { status: 500 }
    );
  }
}
```

**Paso 2**: Actualizar `authService` para usar Route Handler:

```typescript
// lib/api/auth.ts
import apiClient from "./client";

export interface LoginCredentials {
  usuario: string;
  password: string;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<void> {
    // ✅ Llamar a Route Handler local (setea cookie httpOnly)
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al iniciar sesión');
    }

    // Cookie ya seteada por Route Handler
  },

  async logout(): Promise<void> {
    await fetch('/api/auth/logout', { method: 'POST' });
  },

  // ✅ Verificar auth desde Server Component
  async isAuthenticated(): Promise<boolean> {
    try {
      const response = await fetch('/api/auth/verify', {
        credentials: 'include', // Enviar cookies
      });
      return response.ok;
    } catch {
      return false;
    }
  },
};
```

**Paso 3**: Actualizar middleware para leer cookie:

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('authToken')?.value;

  // Rutas públicas
  if (request.nextUrl.pathname.startsWith('/login')) {
    if (token) {
      // ✅ Verificar validez del token
      try {
        await jwtVerify(token, SECRET);
        return NextResponse.redirect(new URL('/socios', request.url));
      } catch {
        // Token inválido, continuar a login
      }
    }
    return NextResponse.next();
  }

  // Rutas protegidas
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    await jwtVerify(token, SECRET);
    return NextResponse.next();
  } catch {
    // Token expirado/inválido
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('authToken');
    return response;
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

**Paso 4**: Actualizar `apiClient` para enviar cookies:

```typescript
// lib/api/client.ts
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://192.168.1.2:3000/api";

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  withCredentials: true, // ✅ Enviar cookies en requests
});

// ✅ Request interceptor - cookie se envía automáticamente
apiClient.interceptors.request.use(
  (config) => {
    // No necesitamos agregar Authorization header manualmente
    // El backend debe leer la cookie 'authToken'

    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Llamar a logout Route Handler
      await fetch('/api/auth/logout', { method: 'POST' });

      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

**Paso 5**: Eliminar `lib/utils/token-storage.ts` (ya no necesario)

#### Impacto Esperado

- ✅ **Seguridad**: Tokens inmunes a XSS
- ✅ **Compliance**: Cumplimiento OWASP Top 10
- ⚠️ **Breaking Change**: Requiere actualización del backend para leer cookies en lugar de `Authorization` header (o proxy en Route Handler)
- ⚠️ **Testing**: Revalidar flujo completo de auth

#### Riesgos de la Corrección

- Backend debe soportar lectura de cookies `authToken` o Route Handler debe actuar como proxy agregando header `Authorization` en requests a backend.

---

### 🔴 HALLAZGO #2: PÁGINA ROOT CON "USE CLIENT" INNECESARIO (RSC-001)

**Severidad**: ALTA
**Categoría**: Next.js App Router / Performance
**Impacto**: ALTO - Bundle JS innecesario, degradación SEO, FCP/TTI lentos

#### Contexto

En Next.js 15 App Router, **todas las pages son Server Components por defecto**. Solo deben marcarse como `"use client"` si necesitan estado, efectos, event handlers o hooks del navegador. La redirección puede hacerse desde Server Component usando `redirect()` de `next/navigation`.

#### Evidencia

**Archivo**: `app/page.tsx:1-14`

```typescript
"use client" // ❌ INNECESARIO

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/login")
  }, [router])

  return null
}
```

**Problemas**:
1. ❌ Hydration de React en cliente para un componente que retorna `null`
2. ❌ Bundle JS incluye React hooks innecesarios
3. ❌ SEO: bots ven página vacía antes de redirect

#### Cómo Arreglar

```typescript
// app/page.tsx
import { redirect } from 'next/navigation';

export default function HomePage() {
  // ✅ Server-side redirect (sin JS en cliente)
  redirect('/login');
}
```

**O mejor aún**, usa configuración de Next.js:

```typescript
// next.config.mjs
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/login',
        permanent: false, // 307 Temporary Redirect
      },
    ];
  },
  // ... resto config
};

export default nextConfig;
```

Y elimina `app/page.tsx` completamente.

#### Impacto Esperado

- ✅ **Performance**: -15KB bundle JS, FCP mejora ~200ms
- ✅ **SEO**: Redirect 307 correcto para bots
- ✅ **DX**: Patrón correcto RSC

---

### 🟠 HALLAZGO #3: ERRORES TYPESCRIPT EN PRODUCCIÓN (TS-001)

**Severidad**: ALTA
**Categoría**: Calidad / TypeScript
**Impacto**: ALTO - Posibles runtime errors en manejo de errores críticos

#### Contexto

TypeScript strict mode está habilitado (`tsconfig.json:7`) pero existen errores de nullability que pueden causar crashes en runtime si `errorData` es `null`.

#### Evidencia

**Archivo**: `lib/error-handler.ts:46-48`

```bash
$ npx tsc --noEmit
lib/error-handler.ts(47,20): error TS18047: 'errorData' is possibly 'null'.
lib/error-handler.ts(48,17): error TS18047: 'errorData' is possibly 'null'.
```

```typescript
try {
  errorData = await response.json();
  errorMessage = errorData.message || errorMessage; // ❌ TS Error
  errorCode = errorData.code; // ❌ TS Error
} catch {
  // Si no se puede parsear el JSON, usar mensaje por defecto
}
```

#### Cómo Arreglar

```typescript
// lib/error-handler.ts:39-52
export const handleFetchError = async (response: Response): Promise<never> => {
  let errorMessage = ERROR_MESSAGES.SERVER_ERROR;
  let errorCode: string | undefined;
  let errorData: { message?: string; code?: string } | null = null;

  try {
    errorData = await response.json();
    // ✅ Null check antes de acceder propiedades
    if (errorData) {
      errorMessage = errorData.message || errorMessage;
      errorCode = errorData.code;
    }
  } catch {
    // Si no se puede parsear el JSON, usar mensaje por defecto
  }

  switch (response.status) {
    case 400:
      errorMessage = errorData?.message || ERROR_MESSAGES.VALIDATION_ERROR;
      break;
    // ... resto
  }

  throw new ApiError(errorMessage, response.status, errorCode);
};
```

#### Impacto Esperado

- ✅ **Type Safety**: Errores TS eliminados
- ✅ **Runtime Safety**: No crashes por null access
- ⚠️ **Testing**: Validar flujo con respuestas malformadas

---

### 🟠 HALLAZGO #4: QUERY KEYS COMO STRINGS (RQ-001)

**Severidad**: ALTA
**Categoría**: React Query
**Impacto**: MEDIO - Cache invalidation inconsistente, datos stale

#### Contexto

React Query v5 recomienda query keys como **arrays** para:
1. Mejor invalidación parcial (`queryClient.invalidateQueries({ queryKey: ['socios'] })` invalida `['socios', 1]`, `['socios', { page: 2 }]`, etc.)
2. Type-safety con `@tanstack/query-core` v5
3. Patrones de factory keys para organización

#### Evidencia

**Archivo**: `hooks/api/socios/useSocios.tsx:14-20`

```typescript
export const useSocios = () => {
  return usePaginatedSearchQuery<SocioWithFoto>({
    queryKey: "socios", // ❌ String
    url: "/socios",
    initialLimit: 10,
  });
};
```

**Uso de la key en** `hooks/api/common/usePaginatedSearchQuery.ts:46`:

```typescript
const query = useQuery<PaginatedResponse<T>>({
  queryKey: [queryKey, page, limit, searchTerm], // ⚠️ queryKey es string
  // ...
});
```

**Invalidación en** `hooks/api/socios/useCreateSocio.tsx:26`:

```typescript
queryClient.invalidateQueries({ queryKey: ["socios"] }); // ⚠️ Array literal
```

**Problema**: Inconsistencia entre definición (`"socios"`) e invalidación (`["socios"]`).

#### Cómo Arreglar

**Paso 1**: Crear factory de query keys:

```typescript
// lib/query-keys.ts
export const queryKeys = {
  socios: {
    all: ['socios'] as const,
    lists: () => [...queryKeys.socios.all, 'list'] as const,
    list: (filters: { page: number; limit: number; search?: string }) =>
      [...queryKeys.socios.lists(), filters] as const,
    details: () => [...queryKeys.socios.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.socios.details(), id] as const,
  },
  temporadas: {
    all: ['temporadas'] as const,
    lists: () => [...queryKeys.temporadas.all, 'list'] as const,
    list: (filters: { page: number; limit: number; search?: string }) =>
      [...queryKeys.temporadas.lists(), filters] as const,
    details: () => [...queryKeys.temporadas.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.temporadas.details(), id] as const,
  },
  auth: {
    all: ['auth'] as const,
    user: () => [...queryKeys.auth.all, 'user'] as const,
  },
} as const;
```

**Paso 2**: Actualizar `usePaginatedSearchQuery.ts`:

```typescript
// hooks/api/common/usePaginatedSearchQuery.ts
import { useQuery } from "@tanstack/react-query";
import { useState, useCallback } from "react";
import apiClient from "@/lib/api/client";
import { STALE_TIME } from "@/lib/constants";

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

interface UsePaginatedSearchQueryOptions<T> {
  queryKey: readonly unknown[]; // ✅ Array readonly
  url: string;
  initialLimit?: number;
}

export function usePaginatedSearchQuery<T>({
  queryKey,
  url,
  initialLimit = 10,
}: UsePaginatedSearchQueryOptions<T>) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(initialLimit);
  const [searchTerm, setSearchTerm] = useState("");

  const setSearch = (value: string) => {
    setSearchTerm(value);
    if (page > 1) {
      setPage(1);
    }
  };

  const handlePageChange = useCallback((newPage: number) => {
    setPage((prevPage) => Math.max(1, newPage));
  }, []);

  const handleLimitChange = useCallback((newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  }, []);

  // ✅ Query key compuesta
  const fullQueryKey = [...queryKey, { page, limit, search: searchTerm }] as const;

  const query = useQuery<PaginatedResponse<T>>({
    queryKey: fullQueryKey,
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<T>>(url, {
        params: {
          page,
          limit,
          search: searchTerm || undefined,
        },
      });
      return data;
    },
    staleTime: STALE_TIME,
    placeholderData: (previousData) => previousData,
  });

  const totalPages = Math.ceil((query.data?.total || 0) / limit);
  const hasNextPage = page < totalPages;
  const hasPreviousPage = page > 1;

  return {
    ...query,
    data: query.data?.data ?? [],
    total: query.data?.total ?? 0,
    page,
    setPage: handlePageChange,
    nextPage: () => hasNextPage && handlePageChange(page + 1),
    prevPage: () => hasPreviousPage && handlePageChange(page - 1),
    searchTerm,
    setSearch,
    limit,
    handleLimitChange,
    totalPages,
    hasNextPage,
    hasPreviousPage,
  };
}
```

**Paso 3**: Actualizar hooks:

```typescript
// hooks/api/socios/useSocios.tsx
import { useQuery } from "@tanstack/react-query";
import { usePaginatedSearchQuery } from "@/hooks/api/common/usePaginatedSearchQuery";
import { SocioWithFoto } from "@/lib/types";
import apiClient from "@/lib/api/client";
import { queryKeys } from "@/lib/query-keys"; // ✅ Import

export const useSocios = () => {
  return usePaginatedSearchQuery<SocioWithFoto>({
    queryKey: queryKeys.socios.lists(), // ✅ ['socios', 'list']
    url: "/socios",
    initialLimit: 10,
  });
};

export const useSocioById = (id: number) => {
  return useQuery({
    queryKey: queryKeys.socios.detail(id), // ✅ ['socios', 'detail', id]
    queryFn: async () => {
      const { data } = await apiClient.get<SocioWithFoto>(`/socios/${id}`);
      return data;
    },
  });
};
```

**Paso 4**: Actualizar mutations:

```typescript
// hooks/api/socios/useCreateSocio.tsx
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MENSAJES_EXITO } from "@/lib/constants";
import apiClient from "@/lib/api/client";
import { AxiosResponse } from "axios";
import { SocioWithFoto } from "@/lib/types";
import { adaptError, logError } from "@/lib/errors/error.adapter";
import { queryKeys } from "@/lib/query-keys"; // ✅ Import

export const useCreateSocio = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    AxiosResponse<SocioWithFoto>,
    unknown,
    FormData
  >({
    mutationFn: (data) => apiClient.post(`/socios`, data),
    onSuccess: (response) => {
      toast.success(MENSAJES_EXITO.SOCIO_CREADO);

      // ✅ Actualiza cache del detalle
      queryClient.setQueryData(
        queryKeys.socios.detail(response.data.id!),
        response.data
      );

      // ✅ Invalida todas las listas de socios
      queryClient.invalidateQueries({
        queryKey: queryKeys.socios.lists(),
      });
    },
    onError: (error) => {
      logError(error, "useCreateSocio");
      const uiError = adaptError(error);
      toast.error(uiError.title, {
        description: uiError.message,
      });
    },
  });

  return mutation;
};
```

#### Impacto Esperado

- ✅ **Cache**: Invalidación correcta y predecible
- ✅ **Type Safety**: Keys tipadas con `as const`
- ✅ **DX**: Organización clara con factory pattern
- ⚠️ **Refactor**: ~8 archivos a actualizar

---

### 🟠 HALLAZGO #5: SIN HYDRATIONBOUNDARY PARA SSR (RQ-002)

**Severidad**: ALTA
**Categoría**: React Query / Performance
**Impacto**: MEDIO - Requests duplicados server/client, FOUC, slow initial render

#### Contexto

Next.js 15 App Router permite prefetch de datos en Server Components y pasarlos al cliente vía `HydrationBoundary`. Esto evita:
1. Duplicate requests (server + client)
2. Flash of Unstyled Content (FOUC)
3. Waterfalls de requests

Actualmente, **todos los datos se fetch en cliente** vía React Query, perdiendo beneficios de SSR.

#### Evidencia

No existe `HydrationBoundary` en el proyecto. Ejemplo de oportunidad:

**Archivo**: `app/(auth)/socios/page.tsx:1-19`

```typescript
import { MemberManagement } from "@/components/member-management"
import { DashboardLayout } from "@/components/dashboard-layout"

export default function MembersPage() { // ✅ Server Component
  // ❌ No prefetch de datos aquí
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestión de Socios</h1>
          <p className="text-muted-foreground mt-2">
            Administra los socios del club, crea nuevos registros y actualiza información
          </p>
        </div>

        <MemberManagement /> {/* ❌ Client Component que hace fetch */}
      </div>
    </DashboardLayout>
  )
}
```

#### Cómo Arreglar

**Paso 1**: Crear helper para prefetch en Server Components:

```typescript
// lib/query-server.ts
import { QueryClient } from '@tanstack/react-query';
import { cache } from 'react';

// ✅ Cache por request (importante para RSC)
export const getQueryClient = cache(() => new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 min
    },
  },
}));
```

**Paso 2**: Actualizar página para prefetch:

```typescript
// app/(auth)/socios/page.tsx
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { MemberManagement } from "@/components/member-management";
import { DashboardLayout } from "@/components/dashboard-layout";
import { getQueryClient } from '@/lib/query-server';
import { queryKeys } from '@/lib/query-keys';
import apiClient from "@/lib/api/client";
import { PaginatedResponse } from '@/hooks/api/common/usePaginatedSearchQuery';
import { SocioWithFoto } from '@/lib/types';

export default async function MembersPage() {
  const queryClient = getQueryClient();

  // ✅ Prefetch inicial de datos en servidor
  await queryClient.prefetchQuery({
    queryKey: queryKeys.socios.list({ page: 1, limit: 10, search: '' }),
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<SocioWithFoto>>('/socios', {
        params: { page: 1, limit: 10 },
      });
      return data;
    },
  });

  return (
    <DashboardLayout>
      {/* ✅ Hidratar datos en cliente */}
      <HydrationBoundary state={dehydrate(queryClient)}>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Gestión de Socios</h1>
            <p className="text-muted-foreground mt-2">
              Administra los socios del club, crea nuevos registros y actualiza información
            </p>
          </div>

          <MemberManagement />
        </div>
      </HydrationBoundary>
    </DashboardLayout>
  );
}
```

**IMPORTANTE**: Para que `apiClient` funcione en Server Components, debe configurarse para server-side:

```typescript
// lib/api/client.server.ts (nuevo archivo)
import axios from 'axios';

const API_URL = process.env.API_URL || 'http://192.168.1.2:3000/api';

// ✅ Cliente para Server Components (sin interceptors de browser)
export const apiServerClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Agregar token desde cookies de Next.js
import { cookies } from 'next/headers';

apiServerClient.interceptors.request.use((config) => {
  const token = cookies().get('authToken')?.value;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiServerClient;
```

Actualizar import en `app/(auth)/socios/page.tsx`:

```typescript
import apiServerClient from "@/lib/api/client.server"; // ✅ Usar en Server Components
```

#### Impacto Esperado

- ✅ **Performance**: Elimina request waterfall, FCP -300ms
- ✅ **UX**: No FOUC, datos visibles en initial render
- ✅ **SEO**: Contenido en HTML inicial
- ⚠️ **Complexity**: Manejo dual client/server

---

### 🟠 HALLAZGO #6: FALTA CONTENT SECURITY POLICY (SEC-002)

**Severidad**: ALTA
**Categoría**: Seguridad
**Impacto**: ALTO - Exposición a XSS, clickjacking, injection attacks

#### Contexto

Content Security Policy (CSP) es un header HTTP que previene:
- XSS attacks (especifica qué scripts pueden ejecutarse)
- Clickjacking (controla framing)
- Injection de estilos/imágenes maliciosas

Next.js 15 permite configurar CSP en `next.config.mjs`.

#### Evidencia

**Archivo**: `next.config.mjs:22-45`

```javascript
async headers() {
  return [
    {
      source: '/:path*',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' }, // ✅
        { key: 'X-Frame-Options', value: 'DENY' }, // ✅
        { key: 'X-XSS-Protection', value: '1; mode=block' }, // ⚠️ Deprecated
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' }, // ✅
        // ❌ FALTA Content-Security-Policy
      ],
    },
  ];
}
```

#### Cómo Arreglar

```javascript
// next.config.mjs
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: false,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'clublavictoria.com.ar',
      }
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          // ✅ Reemplazar X-XSS-Protection deprecated
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // ⚠️ Next.js requiere unsafe-inline para HMR en dev
              "style-src 'self' 'unsafe-inline'", // Tailwind requiere inline styles
              "img-src 'self' https://res.cloudinary.com https://clublavictoria.com.ar data: blob:",
              "font-src 'self' data:",
              "connect-src 'self' http://192.168.1.2:3000", // API backend
              "frame-ancestors 'none'", // Equivalente a X-Frame-Options: DENY
              "base-uri 'self'",
              "form-action 'self'",
              "upgrade-insecure-requests", // Force HTTPS en producción
            ].join('; '),
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // ✅ Agregar Permissions-Policy
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
```

**Para producción, crear CSP más estricto**:

```javascript
// next.config.mjs
const isDev = process.env.NODE_ENV === 'development';

const cspHeader = isDev
  ? [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' https://res.cloudinary.com https://clublavictoria.com.ar data: blob:",
      "font-src 'self' data:",
      "connect-src 'self' http://192.168.1.2:3000",
      "frame-ancestors 'none'",
    ].join('; ')
  : [
      "default-src 'self'",
      // ✅ Producción: Usar nonces para scripts inline
      "script-src 'self' 'nonce-{NONCE}'",
      "style-src 'self' 'nonce-{NONCE}'",
      "img-src 'self' https://res.cloudinary.com https://clublavictoria.com.ar",
      "font-src 'self'",
      "connect-src 'self' https://api.clublavictoria.com",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests",
    ].join('; ');
```

**Generar nonces en runtime** (avanzado):

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic';
    style-src 'self' 'nonce-${nonce}';
    img-src 'self' https://res.cloudinary.com https://clublavictoria.com.ar;
    font-src 'self';
    connect-src 'self';
    frame-ancestors 'none';
  `.replace(/\s{2,}/g, ' ').trim();

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', cspHeader);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  response.headers.set('Content-Security-Policy', cspHeader);

  return response;
}
```

#### Impacto Esperado

- ✅ **Seguridad**: Protección contra XSS, clickjacking
- ✅ **Compliance**: OWASP, PCI-DSS
- ⚠️ **Testing**: Validar que scripts legítimos funcionen

---

### 🟠 HALLAZGO #7: SIN ERROR BOUNDARIES CON REACT QUERY (RQ-003)

**Severidad**: ALTA
**Categoría**: React Query / UX
**Impacto**: MEDIO - Crashes no controlados, UX degradada

#### Contexto

React Query puede lanzar errores en queries con `throwOnError: true` o `useSuspenseQuery`. Sin Error Boundaries, la app crashea. Se recomienda usar `QueryErrorResetBoundary` + `ErrorBoundary` de `react-error-boundary`.

#### Evidencia

No existe ningún Error Boundary en el proyecto. Si una query falla, el error se muestra solo en logs de consola.

#### Cómo Arreglar

**Paso 1**: Instalar dependencia:

```bash
npm install react-error-boundary
```

**Paso 2**: Crear Error Boundary component:

```typescript
// components/error-boundary.tsx
'use client';

import { useQueryErrorResetBoundary } from '@tanstack/react-query';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

function ErrorFallback({
  error,
  resetErrorBoundary,
}: {
  error: Error;
  resetErrorBoundary: () => void;
}) {
  return (
    <div className="flex items-center justify-center min-h-[400px] p-4">
      <Alert variant="destructive" className="max-w-lg">
        <AlertTriangle className="h-5 w-5" />
        <AlertTitle className="text-lg font-semibold">
          Algo salió mal
        </AlertTitle>
        <AlertDescription className="mt-2 space-y-4">
          <p className="text-sm">{error.message}</p>
          <Button
            onClick={resetErrorBoundary}
            variant="outline"
            size="sm"
          >
            Intentar nuevamente
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  );
}

export function QueryErrorBoundary({
  children,
}: {
  children: React.ReactNode;
}) {
  const { reset } = useQueryErrorResetBoundary();

  return (
    <ReactErrorBoundary
      onReset={reset}
      FallbackComponent={ErrorFallback}
    >
      {children}
    </ReactErrorBoundary>
  );
}
```

**Paso 3**: Envolver componentes con queries:

```typescript
// app/(auth)/socios/page.tsx
import { QueryErrorBoundary } from '@/components/error-boundary';
import { MemberManagement } from "@/components/member-management";
import { DashboardLayout } from "@/components/dashboard-layout";

export default function MembersPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestión de Socios</h1>
          <p className="text-muted-foreground mt-2">
            Administra los socios del club, crea nuevos registros y actualiza información
          </p>
        </div>

        {/* ✅ Envolver componente que usa queries */}
        <QueryErrorBoundary>
          <MemberManagement />
        </QueryErrorBoundary>
      </div>
    </DashboardLayout>
  );
}
```

**Paso 4** (Opcional): Boundary global en layout:

```typescript
// app/(auth)/layout.tsx
import ProtectedRoute from "@/components/auth/protected-route";
import { QueryErrorBoundary } from '@/components/error-boundary';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <QueryErrorBoundary>
        {children}
      </QueryErrorBoundary>
    </ProtectedRoute>
  );
}
```

#### Impacto Esperado

- ✅ **UX**: Manejo elegante de errores
- ✅ **Resilience**: App no crashea por network errors
- ✅ **Recovery**: Botón de retry

---

### 🟠 HALLAZGO #8: LOGIN SIN ZOD (FORM-001)

**Severidad**: MEDIA
**Categoría**: Formularios / Consistencia
**Impacto**: MEDIO - Inconsistencia de validación, menor type-safety

#### Contexto

El proyecto usa React Hook Form + Zod en `member-form.tsx` y `season-form.tsx`, pero `login-form.tsx` usa validación manual. Esto crea inconsistencia y pierde beneficios de:
- Type inference con `z.infer`
- Mensajes de error centralizados
- Reutilización de esquemas

#### Evidencia

**Archivo**: `components/login-form.tsx:15-38`

```typescript
export function LoginForm() {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(""); // ❌ Estado manual
  const { mutateAsync: loginMutation, isPending } = useLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // ❌ Validación manual
    if (!usuario || !password) {
      setError("Por favor ingresa usuario y contraseña");
      return;
    }

    try {
      await loginMutation({ usuario, password });
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(err.response?.data.message);
      }
    }
  };
  // ...
}
```

#### Cómo Arreglar

**Paso 1**: Crear schema Zod:

```typescript
// lib/schemas/auth.schema.ts
import { z } from "zod";

export const loginSchema = z.object({
  usuario: z
    .string()
    .min(1, "El usuario es requerido")
    .min(3, "El usuario debe tener al menos 3 caracteres")
    .max(50, "El usuario no puede tener más de 50 caracteres")
    .trim(),

  password: z
    .string()
    .min(1, "La contraseña es requerida")
    .min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export type LoginFormData = z.infer<typeof loginSchema>;
```

**Paso 2**: Refactor componente con RHF + Zod:

```typescript
// components/login-form.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLogin } from "@/hooks/useAuth";
import { loginSchema, type LoginFormData } from "@/lib/schemas/auth.schema";
import { AxiosError } from "axios";

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState("");
  const { mutateAsync: loginMutation, isPending } = useLogin();

  // ✅ React Hook Form + Zod
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      usuario: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setApiError("");

    try {
      await loginMutation(data);
    } catch (err) {
      if (err instanceof AxiosError) {
        setApiError(err.response?.data.message || "Error al iniciar sesión");
      } else {
        setApiError("Error inesperado");
      }
    }
  };

  return (
    <Card className="shadow-lg border-border">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center text-foreground">
          Iniciar Sesión
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Usuario */}
          <div className="space-y-2">
            <Label htmlFor="username" className="text-foreground">
              Username
            </Label>
            <Input
              id="username"
              type="text"
              placeholder="Ingrese su nombre de usuario."
              {...register("usuario")}
              disabled={isPending}
              className={`rounded-lg border-border focus:ring-primary focus:border-primary ${
                errors.usuario ? "border-red-500" : ""
              }`}
              aria-invalid={!!errors.usuario}
              aria-describedby={errors.usuario ? "username-error" : undefined}
            />
            {errors.usuario && (
              <p
                id="username-error"
                className="text-xs text-red-500 mt-1"
                role="alert"
              >
                {errors.usuario.message}
              </p>
            )}
          </div>

          {/* Contraseña */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-foreground">
              Contraseña
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                {...register("password")}
                disabled={isPending}
                className={`rounded-lg border-border focus:ring-primary focus:border-primary pr-10 ${
                  errors.password ? "border-red-500" : ""
                }`}
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? "password-error" : undefined}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            {errors.password && (
              <p
                id="password-error"
                className="text-xs text-red-500 mt-1"
                role="alert"
              >
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Error de API */}
          {apiError && (
            <Alert variant="destructive" className="rounded-lg">
              <AlertDescription>{apiError}</AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            className="w-full rounded-lg bg-primary hover:bg-primary/85 text-primary-foreground font-medium"
            disabled={isPending}
          >
            {isPending ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                Iniciando sesión...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <LogIn className="w-4 h-4" />
                Iniciar Sesión
              </div>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
```

#### Impacto Esperado

- ✅ **Consistencia**: Mismo patrón que otros formularios
- ✅ **Type Safety**: Inferencia automática de tipos
- ✅ **Accesibilidad**: Mejora con `aria-describedby`
- ✅ **Validación**: Mensajes centralizados en schema

---

### 🟠 HALLAZGO #9: FORMULARIOS SIN ARIA-DESCRIBEDBY (A11Y-001)

**Severidad**: MEDIA
**Categoría**: Accesibilidad
**Impacto**: MEDIO - Incumplimiento WCAG 2.1 AA

#### Contexto

WCAG 2.1 nivel AA requiere que inputs con errores estén asociados a sus mensajes de error mediante `aria-describedby`. Los screen readers no anuncian errores visibles si no hay asociación semántica.

#### Evidencia

**Archivo**: `components/member-form.tsx:107-121`

```typescript
<Label htmlFor="dni">DNI *</Label>
<Input
  id="dni"
  {...register("dni")}
  className={errors.dni ? "border-red-500" : "border-gray-300"}
  disabled={isSubmitting}
  // ❌ Falta aria-invalid
  // ❌ Falta aria-describedby
/>
{errors.dni && (
  <p className="text-xs text-red-500 mt-1">
    {/* ❌ Falta id="dni-error" */}
    {errors.dni.message}
  </p>
)}
```

#### Cómo Arreglar

Actualizar **todos los inputs** en formularios:

```typescript
// components/member-form.tsx:107-121
<Label htmlFor="dni">DNI *</Label>
<Input
  id="dni"
  {...register("dni")}
  className={errors.dni ? "border-red-500" : "border-gray-300"}
  disabled={isSubmitting}
  aria-invalid={!!errors.dni} // ✅
  aria-describedby={errors.dni ? "dni-error" : undefined} // ✅
/>
{errors.dni && (
  <p
    id="dni-error" // ✅
    className="text-xs text-red-500 mt-1"
    role="alert" // ✅ Anunciar cambio
  >
    {errors.dni.message}
  </p>
)}
```

**Mejor aún**, crear componente reutilizable:

```typescript
// components/ui/form-field.tsx
import { Label } from '@/components/ui/label';
import { Input, InputProps } from '@/components/ui/input';
import { FieldError } from 'react-hook-form';

interface FormFieldProps extends InputProps {
  label: string;
  error?: FieldError;
  required?: boolean;
}

export function FormField({
  id,
  label,
  error,
  required,
  ...inputProps
}: FormFieldProps) {
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {required && (
          <span className={error ? "text-red-500" : "text-gray-500"}>
            {" "}*
          </span>
        )}
      </Label>
      <Input
        id={id}
        {...inputProps}
        className={`w-full rounded-lg border px-3 py-2 text-sm transition-colors duration-200
          focus:ring-2 focus:ring-primary/60 focus:border-primary
          ${error ? "border-red-500" : "border-gray-300"}
          hover:border-gray-400`}
        aria-invalid={!!error}
        aria-describedby={errorId}
      />
      {error && (
        <p
          id={errorId}
          className="text-xs text-red-500 mt-1"
          role="alert"
        >
          {error.message}
        </p>
      )}
    </div>
  );
}
```

**Usar componente**:

```typescript
// components/member-form.tsx
import { FormField } from '@/components/ui/form-field';

// ...
<FormField
  id="dni"
  label="DNI"
  {...register("dni")}
  error={errors.dni}
  required
  placeholder="12345678"
  maxLength={8}
  disabled={isSubmitting}
/>
```

#### Impacto Esperado

- ✅ **A11Y**: Cumplimiento WCAG 2.1 AA
- ✅ **UX**: Mejor experiencia para usuarios de SR
- ✅ **DX**: Componente reutilizable reduce duplicación
- ⚠️ **Refactor**: 5 formularios a actualizar

---

### 🟠 HALLAZGO #10: IMÁGENES SIN PRIORITY (PERF-001)

**Severidad**: MEDIA
**Categoría**: Performance
**Impacto**: BAJO - LCP >2.5s en home/login

#### Contexto

Next.js `<Image priority>` indica que la imagen es crítica para LCP (Largest Contentful Paint) y debe:
1. Precargarse con `<link rel="preload">`
2. No lazy load
3. Prioridad alta en fetch

El logo en login es la imagen LCP y debe marcarse como `priority`.

#### Evidencia

**Archivo**: `app/(public)/login/page.tsx:12-17`

```typescript
<Image
  alt="Logo"
  src="https://clublavictoria.com.ar/static/media/logo.6dafc533b0491900e9a6.png"
  width={72}
  height={48}
  className="mb-4"
  // ❌ Falta priority={true}
  // ❌ Falta sizes="72px"
/>
```

#### Cómo Arreglar

```typescript
// app/(public)/login/page.tsx:12-19
<Image
  alt="Logo Club La Victoria"
  src="https://clublavictoria.com.ar/static/media/logo.6dafc533b0491900e9a6.png"
  width={72}
  height={48}
  className="mb-4"
  priority // ✅ Preload para LCP
  sizes="72px" // ✅ Hint para responsive
  quality={90} // ✅ Balance calidad/tamaño
/>
```

También en `components/member-management.tsx:148-154`:

```typescript
<Image
  src={socio.fotoUrl}
  alt={`Foto de ${socio.nombre} ${socio.apellido}`} // ✅ Alt descriptivo
  width={64}
  height={64}
  className="w-10 h-10 sm:w-16 sm:h-16 rounded-full object-cover"
  sizes="(max-width: 640px) 40px, 64px" // ✅ Responsive
  // priority NO necesario aquí (not LCP)
/>
```

#### Impacto Esperado

- ✅ **Performance**: LCP mejora ~300-500ms
- ✅ **Core Web Vitals**: LCP <2.5s
- ⚠️ **Testing**: Validar en Lighthouse

---

## 5. PLAN DE REMEDIACIÓN POR PRs

### PR-1: Calidad Base y TypeScript Errors (Semana 1)

**Objetivo**: Establecer baseline de calidad sin breaking changes

**Tareas**:
1. ✅ Arreglar errores TypeScript en `lib/error-handler.ts:47-48`
2. ✅ Agregar husky + lint-staged
3. ✅ Configurar script `npm run type-check`
4. ✅ Configurar CI básico (GitHub Actions)
5. ✅ Agregar `@next/bundle-analyzer`

**Archivos Tocados**:
- `lib/error-handler.ts`
- `package.json` (scripts + devDeps)
- `.husky/pre-commit` (nuevo)
- `.lintstagedrc.json` (nuevo)
- `.github/workflows/ci.yml` (nuevo)
- `next.config.mjs` (bundle analyzer)

**Diff Ejemplo - Husky Setup**:

```bash
# Instalar
npm install -D husky lint-staged
npx husky init
```

```json
// .lintstagedrc.json
{
  "*.{ts,tsx}": [
    "eslint --fix",
    "prettier --write"
  ],
  "*.{ts,tsx}": "bash -c 'npm run type-check'"
}
```

```bash
# .husky/pre-commit
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
```

```json
// package.json
{
  "scripts": {
    "type-check": "tsc --noEmit"
  }
}
```

**Métricas de Aceptación**:
- ✅ `tsc --noEmit`: 0 errores
- ✅ Commit bloqueado si hay errores TS/ESLint
- ✅ CI pipeline verde

---

### PR-2: Seguridad Crítica (Semana 1-2)

**Objetivo**: Arreglar vulnerabilidades bloqueantes

**Tareas**:
1. ✅ Migrar tokens de localStorage a cookies httpOnly
2. ✅ Implementar Route Handlers para auth
3. ✅ Configurar middleware para verificar cookies
4. ✅ Agregar CSP headers
5. ✅ Testing completo de flujo auth

**Archivos Tocados**:
- `app/api/auth/login/route.ts` (nuevo)
- `app/api/auth/logout/route.ts` (nuevo)
- `app/api/auth/verify/route.ts` (nuevo)
- `middleware.ts` (nuevo)
- `lib/api/auth.ts` (actualizar)
- `lib/api/client.ts` (actualizar)
- `lib/utils/token-storage.ts` (eliminar)
- `next.config.mjs` (CSP headers)

**Métricas de Aceptación**:
- ✅ Tokens en cookies httpOnly, SameSite=lax, Secure en prod
- ✅ No acceso a token desde DevTools > Application > localStorage
- ✅ CSP activo sin errores en consola
- ✅ Auth flow funciona end-to-end

---

### PR-3: RSC Boundaries y App Router Optimizations (Semana 2)

**Objetivo**: Conformidad Next.js 15 App Router

**Tareas**:
1. ✅ Convertir `app/page.tsx` a Server Component
2. ✅ Agregar `loading.tsx` en rutas principales
3. ✅ Agregar `error.tsx` en rutas principales
4. ✅ Configurar `revalidate` en pages
5. ✅ Error boundaries con React Query

**Archivos Tocados**:
- `app/page.tsx` (eliminar "use client")
- `app/(auth)/socios/loading.tsx` (nuevo)
- `app/(auth)/socios/error.tsx` (nuevo)
- `app/(auth)/temporadas/loading.tsx` (nuevo)
- `app/(auth)/temporadas/error.tsx` (nuevo)
- `app/(public)/login/loading.tsx` (nuevo)
- `components/error-boundary.tsx` (nuevo)
- `app/(auth)/layout.tsx` (agregar QueryErrorBoundary)

**Diff Ejemplo - loading.tsx**:

```typescript
// app/(auth)/socios/loading.tsx
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <LoadingSpinner size="lg" />
      <p className="ml-4 text-muted-foreground">Cargando socios...</p>
    </div>
  );
}
```

**Métricas de Aceptación**:
- ✅ `app/page.tsx` sin "use client"
- ✅ Skeleton states visibles durante navegación
- ✅ Error boundaries capturan errores de queries

---

### PR-4: React Query SSR/Hydration y Query Keys (Semana 3)

**Objetivo**: Optimizar data fetching con SSR

**Tareas**:
1. ✅ Crear factory de query keys
2. ✅ Actualizar todos los hooks a query keys arrays
3. ✅ Configurar `HydrationBoundary` en pages
4. ✅ Crear `lib/query-server.ts` para SSR
5. ✅ Agregar `gcTime` explícito en QueryClient

**Archivos Tocados**:
- `lib/query-keys.ts` (nuevo)
- `lib/query-server.ts` (nuevo)
- `lib/api/client.server.ts` (nuevo)
- `hooks/api/common/usePaginatedSearchQuery.ts`
- `hooks/api/socios/useSocios.tsx`
- `hooks/api/socios/useSocioById.tsx`
- `hooks/api/socios/useCreateSocio.tsx`
- `hooks/api/socios/useUpdateSocio.tsx`
- `hooks/api/socios/useDeleteSocio.tsx`
- `app/(auth)/socios/page.tsx` (prefetch)
- `providers/auth-provider.tsx` (gcTime)

**Métricas de Aceptación**:
- ✅ Query keys consistentes (arrays)
- ✅ SSR data visible en HTML inicial (View Page Source)
- ✅ No duplicate requests en Network tab
- ✅ `gcTime` configurado (24h para persistencia)

---

### PR-5: Formularios RHF + Zod (Semana 3-4)

**Objetivo**: Consistencia y accesibilidad en forms

**Tareas**:
1. ✅ Crear `lib/schemas/auth.schema.ts`
2. ✅ Refactor `login-form.tsx` con Zod
3. ✅ Crear componente `FormField` reutilizable
4. ✅ Actualizar `member-form.tsx` con aria-describedby
5. ✅ Actualizar `season-form.tsx` con aria-describedby

**Archivos Tocados**:
- `lib/schemas/auth.schema.ts` (nuevo)
- `components/ui/form-field.tsx` (nuevo)
- `components/login-form.tsx`
- `components/member-form.tsx`
- `components/season-form.tsx`

**Métricas de Aceptación**:
- ✅ Todos los forms usan RHF + Zod
- ✅ Schemas en `lib/schemas/*`
- ✅ Screen readers anuncian errores (test con NVDA/VoiceOver)
- ✅ `aria-invalid` y `aria-describedby` en todos los inputs

---

### PR-6: Performance y Core Web Vitals (Semana 4)

**Objetivo**: Optimizar LCP, bundle size

**Tareas**:
1. ✅ Agregar `priority` a imágenes LCP
2. ✅ Especificar `sizes` en imágenes responsive
3. ✅ Code-splitting con `dynamic()` para componentes pesados
4. ✅ Analizar bundle y eliminar imports pesados
5. ✅ Configurar `next/font` con `display: swap`

**Archivos Tocados**:
- `app/(public)/login/page.tsx`
- `components/member-management.tsx`
- `app/layout.tsx` (font display)
- Componentes grandes (usar `dynamic()`)

**Diff Ejemplo - Code Splitting**:

```typescript
// app/(auth)/estadisticas/page.tsx
import dynamic from 'next/dynamic';

// ✅ Code-split componente pesado (charts)
const StatisticsView = dynamic(
  () => import('@/components/statistics-view'),
  {
    loading: () => <LoadingSpinner />,
    ssr: false, // Si usa window APIs
  }
);

export default function EstadisticasPage() {
  return (
    <DashboardLayout>
      <StatisticsView />
    </DashboardLayout>
  );
}
```

**Métricas de Aceptación**:
- ✅ Lighthouse: Performance >90
- ✅ LCP <2.5s (login page)
- ✅ Bundle JS -20% en rutas principales
- ✅ FCP <1.8s

---

### PR-7: Testing Baseline (Semana 5)

**Objetivo**: Coverage mínimo en rutas críticas

**Tareas**:
1. ✅ Setup Vitest + React Testing Library
2. ✅ Tests para schemas Zod
3. ✅ Tests para utils críticos
4. ✅ Tests de integración para login flow
5. ✅ E2E smoke tests con Playwright

**Archivos Nuevos**:
- `vitest.config.ts`
- `playwright.config.ts`
- `lib/schemas/__tests__/socio.schema.test.ts`
- `lib/schemas/__tests__/auth.schema.test.ts`
- `components/__tests__/login-form.test.tsx`
- `e2e/auth.spec.ts`

**Ejemplo Test**:

```typescript
// lib/schemas/__tests__/auth.schema.test.ts
import { describe, it, expect } from 'vitest';
import { loginSchema } from '@/lib/schemas/auth.schema';

describe('loginSchema', () => {
  it('acepta credenciales válidas', () => {
    const result = loginSchema.safeParse({
      usuario: 'admin',
      password: '123456',
    });
    expect(result.success).toBe(true);
  });

  it('rechaza usuario vacío', () => {
    const result = loginSchema.safeParse({
      usuario: '',
      password: '123456',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('El usuario es requerido');
    }
  });

  it('rechaza contraseña corta', () => {
    const result = loginSchema.safeParse({
      usuario: 'admin',
      password: '123',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        'La contraseña debe tener al menos 6 caracteres'
      );
    }
  });
});
```

**Métricas de Aceptación**:
- ✅ Coverage >60% en `lib/schemas`
- ✅ Coverage >40% en `hooks/api`
- ✅ E2E: login, create socio, logout
- ✅ Tests corren en CI

---

## 6. MÉTRICAS Y UMBRALES PARA CI/CD

### Build-time Checks

```yaml
# .github/workflows/ci.yml
name: CI

on: [push, pull_request]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci

      # ✅ TypeScript
      - name: Type Check
        run: npm run type-check

      # ✅ ESLint
      - name: Lint
        run: npm run lint

      # ✅ Build
      - name: Build
        run: npm run build
        env:
          NEXT_PUBLIC_API_URL: http://localhost:3000

      # ✅ Tests
      - name: Unit Tests
        run: npm test

      # ✅ Bundle Size
      - name: Bundle Analysis
        run: |
          npm run build
          npx -y @next/bundle-analyzer
```

### Umbrales Deseados

| Métrica | Umbral | Comando |
|---------|--------|---------|
| TypeScript Errors | 0 | `tsc --noEmit` |
| ESLint Errors | 0 | `npm run lint` |
| ESLint Warnings | <10 | `npm run lint` |
| Build Success | ✅ | `npm run build` |
| Unit Test Coverage | >60% | `npm test -- --coverage` |
| **Performance (Lighthouse CI)** |
| Performance Score | >90 | `lhci autorun` |
| LCP | <2.5s | Lighthouse |
| FID/INP | <100ms / <200ms | Lighthouse |
| CLS | <0.1 | Lighthouse |
| **Accessibility** |
| A11Y Score | >95 | Lighthouse |
| **Bundle** |
| First Load JS | <250KB | Next.js build output |
| Increase per PR | <10% | Comparison |

### Configuración Lighthouse CI (Opcional)

```json
// lighthouserc.json
{
  "ci": {
    "collect": {
      "url": [
        "http://localhost:3000/login",
        "http://localhost:3000/socios"
      ],
      "numberOfRuns": 3,
      "startServerCommand": "npm run build && npm start"
    },
    "assert": {
      "preset": "lighthouse:recommended",
      "assertions": {
        "categories:performance": ["error", {"minScore": 0.9}],
        "categories:accessibility": ["error", {"minScore": 0.95}],
        "first-contentful-paint": ["warn", {"maxNumericValue": 1800}],
        "largest-contentful-paint": ["error", {"maxNumericValue": 2500}],
        "cumulative-layout-shift": ["error", {"maxNumericValue": 0.1}]
      }
    }
  }
}
```

---

## 7. OBSERVACIONES ADICIONALES

### Dependencias No Utilizadas

✅ Todas las dependencias en `package.json` están en uso. No se detectaron dependencias muertas.

### Componentes Duplicados/Oportunidades de Abstracción

**Oportunidad**: `member-management.tsx` (313 líneas) podría separarse en:
- `components/socios/socio-list.tsx` (listado)
- `components/socios/socio-filters.tsx` (búsqueda)
- `components/socios/socio-card.tsx` (item individual)

**Beneficio**: Mejor mantenibilidad, reutilización, testing más fácil.

### Estilos y Convenciones

✅ **Tailwind CSS**: Uso consistente y correcto.
✅ **shadcn/ui**: Componentes atómicos bien estructurados.
⚠️ **CSS Variables**: Definidas en `globals.css`, podrían documentarse en Storybook.

### Storybook

❌ **No implementado**. Recomendación:

```bash
npx sb init --builder webpack5
```

Beneficios:
- Documentación visual de componentes
- Testing de estados aislados
- Colaboración con diseño

### MSW (Mock Service Worker)

❌ **No implementado**. Para PR-7 (Testing), considerar:

```bash
npm install -D msw
```

Permite mockear API en tests sin modificar código de producción.

---

## 8. CONCLUSIONES Y RECOMENDACIONES

### Estado Actual

El proyecto presenta una **arquitectura sólida** con Next.js 15 y stack moderno (React Query, Zod, RHF). Sin embargo, existen **gaps críticos** en:

1. **Seguridad**: Tokens en localStorage (SEC-001) - BLOQUEANTE
2. **Conformidad Next.js 15**: No aprovecha SSR, loading/error boundaries
3. **React Query**: Configuración subóptima (keys, hydration, gcTime)
4. **Accesibilidad**: WCAG 2.1 compliance parcial

### Riesgos de No Corregir

| Hallazgo | Riesgo Negocio | Probabilidad | Impacto |
|----------|----------------|--------------|---------|
| SEC-001 (localStorage) | Robo de sesiones, acceso no autorizado | ALTO | CRÍTICO |
| SEC-002 (No CSP) | XSS, injection attacks | MEDIO | ALTO |
| RSC-001 (Bundle JS) | Pérdida de ranking SEO, churn usuarios móviles | MEDIO | MEDIO |
| RQ-001 (Query keys) | Datos stale en producción, bugs de caché | BAJO | MEDIO |
| A11Y-001 (ARIA) | Demandas legales (ADA), exclusión usuarios | BAJO | ALTO |

### Roadmap Recomendado

**Inmediato (Semana 1)**:
- ✅ PR-1: Calidad base (TypeScript, linters)
- ✅ PR-2: Seguridad (cookies httpOnly, CSP)

**Corto Plazo (Semanas 2-3)**:
- ✅ PR-3: App Router compliance
- ✅ PR-4: React Query optimization

**Mediano Plazo (Semanas 4-5)**:
- ✅ PR-5: Formularios + A11Y
- ✅ PR-6: Performance
- ✅ PR-7: Testing baseline

**Largo Plazo (Post-MVP)**:
- Storybook para design system
- E2E coverage >80%
- Monitoring (Sentry, DataDog)
- A/B testing framework

### Retorno de Inversión Estimado

- **Esfuerzo Total**: ~35 horas (1 sprint)
- **Reducción de Riesgo**: 85% (SEC-001, SEC-002 corregidos)
- **Mejora de Performance**: +40% FCP, +25% LCP
- **Reducción de Bugs**: Estimado 60% menos issues de caché/validación

### Aprobaciones Necesarias

Antes de ejecutar PR-2 (Seguridad):
- ✅ Backend team: Confirmar soporte de cookies en API o proxy en Route Handlers
- ✅ DevOps: Configurar `JWT_SECRET` en env vars
- ✅ QA: Plan de testing de regresión para auth flow

---

## ANEXOS

### A. Comandos Útiles

```bash
# Type check
npm run type-check

# Lint + Fix
npm run lint:fix

# Format
npm run format

# Build production
npm run build

# Bundle analysis
ANALYZE=true npm run build

# Tests
npm test

# Tests con coverage
npm test -- --coverage

# E2E tests
npx playwright test
```

### B. Recursos y Referencias

- [Next.js 15 Docs](https://nextjs.org/docs)
- [React Query v5 Docs](https://tanstack.com/query/v5/docs)
- [Zod Documentation](https://zod.dev)
- [React Hook Form](https://react-hook-form.com)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

### C. Contacto y Soporte

Para consultas sobre esta auditoría:
- **Auditor**: Senior Frontend Architect
- **Fecha**: 16 de Octubre, 2025
- **Versión**: 1.0

---

**FIN DEL REPORTE**
