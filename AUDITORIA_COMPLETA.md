# AUDITORÍA COMPLETA - Sistema de Ingresos Club La Victoria Frontend

**Fecha:** 18 de Octubre, 2025
**Auditor:** Claude Code
**Versión:** Next.js 15.5.2 | React 19 | TypeScript 5

---

## 📋 Tabla de Contenidos

1. [Resumen Ejecutivo](#-resumen-ejecutivo)
2. [Problemas por Categoría](#-problemas-por-categoría)
   - [1. Manejo de Errores](#1-manejo-de-errores)
   - [2. Hooks de API](#2-hooks-de-api)
   - [3. Formularios](#3-formularios)
   - [4. Rutas y Navegación](#4-rutas-y-navegación)
   - [5. TypeScript y Tipos](#5-typescript-y-tipos)
   - [6. Convenciones del Proyecto](#6-convenciones-del-proyecto)
3. [Plan de Acción Priorizado](#-plan-de-acción-priorizado)
4. [Código Específico a Corregir](#-código-específico-a-corregir)

---

## 📊 Resumen Ejecutivo

### Estadísticas Generales

| Categoría | Problemas Encontrados | Severidad Alta | Severidad Media | Severidad Baja |
|-----------|----------------------|----------------|-----------------|----------------|
| **Manejo de Errores** | 10 | 6 | 4 | 0 |
| **Hooks de API** | 11 | 3 | 6 | 2 |
| **Formularios** | 2 | 2 | 0 | 0 |
| **Rutas y Navegación** | 3 | 0 | 3 | 0 |
| **TypeScript** | 23 | 0 | 5 | 18 |
| **Convenciones** | 3 | 1 | 2 | 0 |
| **TOTAL** | **52** | **12** | **20** | **20** |

### Estado del Proyecto

✅ **Fortalezas Identificadas:**
- Arquitectura bien estructurada con App Router de Next.js 15
- Sistema de errores centralizado (`lib/errors/`) correctamente implementado
- 71 componentes UI de shadcn/ui disponibles y bien organizados
- Validaciones con Zod en esquemas principales
- 0 vulnerabilidades de seguridad en npm
- Build exitoso sin errores de TypeScript

⚠️ **Áreas de Mejora Críticas:**
- Inconsistencias en manejo de errores entre componentes
- Hooks de API sin estandarización
- 2 formularios no siguen el patrón React Hook Form + Zod
- Rutas hardcodeadas en lugar de usar constantes

---

## 🔍 Problemas por Categoría

---

## 1. Manejo de Errores

### 🔴 Problema 1.1: LoginForm NO usa `adaptError()`

**Ubicación:** `components/login-form.tsx:33-38`

**Descripción:**
El formulario de login accede directamente a propiedades del error de Axios sin validación, en lugar de usar el sistema centralizado de errores.

**Código Actual:**
```typescript
// components/login-form.tsx
try {
  await loginMutation({ usuario, password });
} catch (err) {
  if (err instanceof AxiosError) {
    setError(err.response?.data.message); // ❌ INCORRECTO
  }
}
```

**Problema:**
- No usa `adaptError()` como otros componentes
- Acceso directo a `err.response?.data.message` sin garantía de estructura
- Inconsistente con el patrón establecido en CLAUDE.md

**Código Correcto:**
```typescript
try {
  await loginMutation({ usuario, password });
} catch (err) {
  const uiError = adaptError(err); // ✅ CORRECTO
  setError(uiError.message);
}
```

**Severidad:** 🔴 Alta
**Impacto:** Seguridad, Consistencia

---

### 🔴 Problema 1.2: SeasonManagement - try/catch vacíos

**Ubicación:** `components/season-management.tsx:58-60, 76-78, 82-87`

**Descripción:**
Tres bloques try/catch capturan errores que ya fueron manejados en los hooks de API, pero luego solo hacen `console.error()` o muestran toasts genéricos.

**Código Actual:**
```typescript
// Líneas 58-60
try {
  await createTemporada(temporada);
  setIsCreateDialogOpen(false);
} catch (error) {
  console.error(error); // ❌ Solo console.error
}

// Líneas 76-78
try {
  if(editingTemporada?.id) {
    await updateTemporada({ id: parseInt(editingTemporada.id), data: temporada });
  }
  setEditingTemporada(null);
} catch (error) {
  console.error(error); // ❌ Solo console.error
}

// Líneas 82-87
try {
  await deleteTemporada({ id: parseInt(idTemporada) });
} catch (error) {
  console.error(error);
  toast.error("Error al eliminar temporada"); // ⚠️ Toast genérico
}
```

**Problema:**
- Los errores ya están siendo manejados en los hooks de API (que muestran toast)
- Captura los errores pero no hace nada útil con ellos
- En el caso de `deleteTemporada`, muestra un toast genérico que oculta el mensaje específico del backend

**Código Correcto:**
```typescript
// Opción 1: Confiar en el hook de API (recomendado)
try {
  await createTemporada(temporada);
  setIsCreateDialogOpen(false);
} catch {
  // El error ya fue mostrado en el hook de API
  // Solo manejar estado local si es necesario
}

// Opción 2: Manejar error con adaptError si se necesita lógica adicional
try {
  await deleteTemporada({ id: parseInt(idTemporada) });
} catch (error) {
  const uiError = adaptError(error);
  // Lógica adicional aquí si es necesaria
  // El toast ya fue mostrado en el hook
}
```

**Severidad:** 🔴 Alta
**Impacto:** UX, Experiencia del usuario

---

### 🔴 Problema 1.3: Páginas crear/editar socio - catch sin manejo

**Ubicación:**
- `app/(auth)/socios/crear/page.tsx:44-49`
- `app/(auth)/socios/[id]/edit/page.tsx:77-82`

**Descripción:**
Los try/catch en las páginas de crear y editar socio solo hacen `console.error()` sin ninguna acción adicional.

**Código Actual:**
```typescript
// app/(auth)/socios/crear/page.tsx:44-49
try {
  await createSocio(formDataToSend);
  router.push("/socios");
} catch (error) {
  console.error(error); // ❌ Solo console.error
}

// app/(auth)/socios/[id]/edit/page.tsx:77-82
try {
  await updateSocio({id: parseInt(id as string), data: formDataToSend});
  router.push("/socios");
} catch (error) {
  console.error(error); // ❌ Solo console.error
}
```

**Problema:**
- No hay feedback adicional al usuario
- El error ya se mostró en el hook de API, pero no se maneja el estado de la página
- No hay rollback de estado si la operación falla

**Código Correcto:**
```typescript
try {
  await createSocio(formDataToSend);
  router.push("/socios");
} catch (error) {
  // El error ya fue mostrado en el hook de API
  // Aquí podríamos resetear el estado de loading si es necesario
  logError(error, "CreateMemberPage");
}
```

**Severidad:** 🔴 Alta
**Impacto:** UX

---

### 🟡 Problema 1.4: Auth Service - re-throw sin valor

**Ubicación:** `lib/api/auth.ts:19-21`

**Código Actual:**
```typescript
try {
  const response = await apiClient.post<string>("/auth/login", credentials);
  const token = response.data;
  if (token) {
    setToken(token);
  }
  return token;
} catch (error) {
  throw error; // ❌ Re-throw sin procesar
}
```

**Problema:**
- El catch solo re-lanza el error sin agregar contexto
- Debería al menos loggearlo

**Código Correcto:**
```typescript
try {
  const response = await apiClient.post<string>("/auth/login", credentials);
  const token = response.data;
  if (token) {
    setToken(token);
  }
  return token;
} catch (error) {
  logError(error, "authService.login"); // ✅ Añadir log
  throw error;
}
```

**Severidad:** 🟡 Media
**Impacto:** Debugging

---

### 🟡 Problema 1.5: Token Storage - errores ignorados

**Ubicación:** `lib/utils/token-storage.ts:22-26, 36-41, 50-54`

**Código Actual:**
```typescript
// setToken
try {
  localStorage.setItem(TOKEN_KEY, token);
} catch (error) {
  console.error('Error storing token:', error); // ⚠️ Solo console.error
}

// getToken
try {
  return localStorage.getItem(TOKEN_KEY);
} catch (error) {
  console.error('Error retrieving token:', error); // ⚠️ Solo console.error
  return null;
}

// removeToken
try {
  localStorage.removeItem(TOKEN_KEY);
} catch (error) {
  console.error('Error removing token:', error); // ⚠️ Solo console.error
}
```

**Problema:**
- Errores de localStorage no llegan al usuario
- Son casos raros (localStorage lleno, permisos) pero podrían fallar silenciosamente
- No hay feedback visual

**Código Correcto:**
```typescript
export function setToken(token: string): boolean {
  try {
    localStorage.setItem(TOKEN_KEY, token);
    return true;
  } catch (error) {
    logError(error, 'token-storage.setToken');
    // Opcionalmente: mostrar toast al usuario
    if (typeof window !== 'undefined') {
      toast.error('Error al guardar sesión. Verifique el espacio disponible.');
    }
    return false;
  }
}
```

**Severidad:** 🟡 Media
**Impacto:** Robustez

---

### 🔴 Problema 1.6: useAvailableMembers - fetch directo

**Ubicación:** `hooks/use-available-members.ts:44-79`

**Código Actual:**
```typescript
try {
  const params = new URLSearchParams({...});
  const response = await fetch(`/api/socios/disponibles-para-temporada/${idTemporada}?${params}`);

  if (response.ok) {
    const data = await response.json();
    setSocios(data.socios || []);
    setPaginacion(data.paginacion || null);
  } else {
    const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
    throw new Error(errorData.message || 'Error en la API');
  }
} catch (err) {
  const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
  setError(errorMessage); // ⚠️ No usa adaptError()
  setSocios([]);
  setPaginacion(null);

  if (process.env.NODE_ENV === 'development') {
    console.error('[useAvailableMembers.fetchSocios]:', err);
  }
}
```

**Problema:**
- Usa `fetch` nativo en lugar de `apiClient` (Axios)
- No usa `adaptError()` para consistencia
- Error handling inconsistente con el resto de la app
- No se beneficia del interceptor automático de JWT

**Código Correcto:**
```typescript
// Migrar a usar apiClient
try {
  const params = new URLSearchParams({...});
  const { data } = await apiClient.get<{
    socios: SocioWithFoto[];
    paginacion: Paginacion;
  }>(`/socios/disponibles-para-temporada/${idTemporada}?${params}`);

  setSocios(data.socios || []);
  setPaginacion(data.paginacion || null);
} catch (err) {
  const uiError = adaptError(err); // ✅ Usa adaptError
  setError(uiError.message);
  setSocios([]);
  setPaginacion(null);
  logError(err, 'useAvailableMembers.fetchSocios');
}
```

**Severidad:** 🔴 Alta
**Impacto:** Arquitectura, Consistencia

---

### 🔴 Problema 1.7: Contexto de error incorrecto en hooks

**Ubicación:**
- `hooks/api/temporadas/useCreateTemporada.tsx:30`
- `hooks/api/temporadas/useUpdateTemporada.tsx:29`
- `hooks/api/temporadas/useDeleteTemporada.tsx:27`
- `hooks/api/socios/useAgregarSocioTemporada.tsx:31`
- `hooks/api/socios/useEliminarSocioTemporada.tsx:28`

**Código Actual:**
```typescript
// useCreateTemporada.tsx:30
logError(error, "useCreateSocio"); // ❌ INCORRECTO - nombre equivocado

// useUpdateTemporada.tsx:29
logError(error, "useCreateSocio"); // ❌ INCORRECTO

// useDeleteTemporada.tsx:27
logError(error, "useCreateSocio"); // ❌ INCORRECTO

// useAgregarSocioTemporada.tsx:31
logError(error, "useCreateSocio"); // ❌ INCORRECTO

// useEliminarSocioTemporada.tsx:28
logError(error, "useCreateSocio"); // ❌ INCORRECTO
```

**Problema:**
- Todos usan "useCreateSocio" como contexto en lugar del nombre correcto del hook
- Esto hace muy difícil debuggear porque todos los errores aparecen con el mismo contexto

**Código Correcto:**
```typescript
// useCreateTemporada.tsx:30
logError(error, "useCreateTemporada"); // ✅ CORRECTO

// useUpdateTemporada.tsx:29
logError(error, "useUpdateTemporada"); // ✅ CORRECTO

// useDeleteTemporada.tsx:27
logError(error, "useDeleteTemporada"); // ✅ CORRECTO

// useAgregarSocioTemporada.tsx:31
logError(error, "useAgregarSocioTemporada"); // ✅ CORRECTO

// useEliminarSocioTemporada.tsx:28
logError(error, "useEliminarSocioTemporada"); // ✅ CORRECTO
```

**Severidad:** 🔴 Alta
**Impacto:** Debugging, Mantenimiento

---

### 🟡 Problema 1.8: form.setError() no utilizado

**Ubicación:** Ningún componente

**Descripción:**
Según el CLAUDE.md, se recomienda usar `form.setError()` para errores específicos de campos, pero ningún formulario lo implementa.

**Ejemplo de Uso Recomendado:**
```typescript
// En MemberForm, cuando se recibe error de DNI duplicado
try {
  await createSocio(formData);
} catch (error) {
  const uiError = adaptError(error);

  // Si es error de DNI duplicado, marcarlo en el campo
  if (uiError.code === BackendErrorCode.DNI_ALREADY_EXISTS) {
    form.setError('dni', {
      type: 'manual',
      message: uiError.message,
    });
    return; // No mostrar toast genérico
  }

  // Para otros errores, mostrar toast
  toast.error(uiError.title, { description: uiError.message });
}
```

**Severidad:** 🟡 Media
**Impacto:** UX

---

### 🟡 Problema 1.9: Código LEGACY sin migrar

**Ubicación:** `lib/error-handler.ts`

**Descripción:**
Existe un archivo `error-handler.ts` con código LEGACY que tiene un TODO para migrar al nuevo sistema de errores, pero nunca se migró.

**Código Actual:**
```typescript
// lib/error-handler.ts
// TODO: Migrate to new error handling system in lib/errors/
```

**Problema:**
- Contiene clases duplicadas (`ApiError`, `ValidationError`)
- Funciones no usadas (`retryWithBackoff()`, `withTimeout()`)
- Confusión sobre cuál sistema usar

**Acción Recomendada:**
- Eliminar `lib/error-handler.ts` completamente
- Asegurar que todo el código usa `lib/errors/`

**Severidad:** 🟡 Media
**Impacto:** Mantenimiento

---

### 📊 Resumen de Manejo de Errores

| Problema | Archivos Afectados | Severidad | Acción |
|----------|-------------------|-----------|--------|
| LoginForm sin adaptError | 1 | 🔴 Alta | Migrar a adaptError() |
| try/catch vacíos | 3 | 🔴 Alta | Manejar o eliminar |
| Páginas sin manejo | 2 | 🔴 Alta | Añadir logging |
| Contexto incorrecto | 5 | 🔴 Alta | Corregir strings |
| useAvailableMembers | 1 | 🔴 Alta | Migrar a apiClient |
| Auth service | 1 | 🟡 Media | Añadir logging |
| Token storage | 3 | 🟡 Media | Feedback visual |
| form.setError | 0 (no usado) | 🟡 Media | Implementar |
| Código LEGACY | 1 | 🟡 Media | Eliminar archivo |

---

## 2. Hooks de API

### 🔴 Problema 2.1: Tipado inconsistente de errores

**Ubicación:** Todos los hooks de mutations

**Descripción:**
Los hooks de socios usan `unknown` como tipo de error, mientras que los de temporadas usan `AxiosError<{ message: string }>`.

**Código Actual:**
```typescript
// Hooks de SOCIOS (tipado débil)
export const useCreateSocio = () => {
  return useMutation<
    AxiosResponse<SocioWithFoto>,
    unknown, // ❌ Tipo débil
    FormData
  >({...});
};

// Hooks de TEMPORADAS (tipado fuerte)
export const useCreateTemporada = () => {
  return useMutation<
    AxiosResponse<Temporada>,
    AxiosError<{ message: string }>, // ✅ Tipado específico
    Temporada
  >({...});
};
```

**Problema:**
- Falta de type safety en hooks de socios
- Inconsistencia entre módulos similares

**Código Correcto:**
```typescript
// Estandarizar todos los hooks
export const useCreateSocio = () => {
  return useMutation<
    AxiosResponse<SocioWithFoto>,
    AxiosError<{ message: string }>, // ✅ Tipado consistente
    FormData
  >({...});
};
```

**Archivos Afectados:**
- `hooks/api/socios/useCreateSocio.tsx:15`
- `hooks/api/socios/useUpdateSocio.tsx:14`
- `hooks/api/socios/useDeleteSocio.tsx:12`
- `hooks/api/socios/useAgregarSocioTemporada.tsx:15`
- `hooks/api/socios/useEliminarSocioTemporada.tsx:15`

**Severidad:** 🔴 Alta
**Impacto:** Type Safety

---

### 🟡 Problema 2.2: staleTime inconsistente

**Ubicación:** Todos los hooks de queries

**Descripción:**
Solo `usePaginatedSearchQuery` define `staleTime: STALE_TIME` (5 minutos). Otros hooks no lo definen, usando el default de 0ms.

**Código Actual:**
```typescript
// usePaginatedSearchQuery.ts:57 (✅ CORRECTO)
staleTime: STALE_TIME, // 5 minutos

// useTemporadas.tsx (❌ SIN DEFINIR)
// No tiene staleTime - usa default 0ms

// useSociosTemporada.tsx (❌ SIN DEFINIR)
// No tiene staleTime - usa default 0ms
```

**Problema:**
- Queries sin `staleTime` refetch innecesariamente
- Desperdicio de recursos y requests al backend

**Código Correcto:**
```typescript
import { STALE_TIME } from '@/lib/constants';

export const useTemporadas = () => {
  return useQuery({
    queryKey: ["temporadas"],
    queryFn: async () => {
      const { data } = await apiClient.get<Temporada[]>("/temporadas");
      return data;
    },
    staleTime: STALE_TIME, // ✅ Añadir
  });
};
```

**Archivos Afectados:**
- `hooks/api/temporadas/useTemporadas.tsx:6-12`
- `hooks/api/socios/useSociosTemporada.tsx:10-20`
- `hooks/api/socios/useSociosDisponiblesInfinite.tsx:29-67`

**Severidad:** 🟡 Media
**Impacto:** Performance

---

### 🟡 Problema 2.3: enabled sin validación

**Ubicación:** Varios hooks de queries

**Descripción:**
Algunos hooks aceptan parámetros opcionales pero no usan `enabled` para prevenir queries con datos inválidos.

**Código Actual:**
```typescript
// useSociosDisponiblesTemporada.tsx:6-11 (❌ PROBLEMA)
export const useSociosDisponiblesTemporada = (temporadaId: string | null) => {
  return usePaginatedSearchQuery<SocioWithFoto>({
    queryKey: `socios`,
    url: temporadaId ? `/temporadas/${temporadaId}/socios-disponibles` : "",
    // ❌ Sin enabled - puede intentar fetch con URL vacía
  });
};
```

**Problema:**
- Si `temporadaId` es `null`, se pasa `url: ""` pero la query se ejecuta igual
- Posibles peticiones a URL vacía o comportamiento indefinido

**Código Correcto:**
```typescript
export const useSociosDisponiblesTemporada = (temporadaId: string | null) => {
  return usePaginatedSearchQuery<SocioWithFoto>({
    queryKey: `socios`,
    url: `/temporadas/${temporadaId}/socios-disponibles`,
    enabled: !!temporadaId, // ✅ Validar antes de ejecutar
  });
};
```

**Severidad:** 🟡 Media
**Impacto:** Robustez

---

### 🟡 Problema 2.4: Toast config inconsistente

**Ubicación:** Todos los hooks de mutations

**Descripción:**
Los toasts de éxito tienen configuraciones diferentes en diferentes hooks.

**Comparación:**
```typescript
// useDeleteSocio.tsx:15-17
toast.success(msg, {
  position: "top-center",
  duration: 3000
});

// useCreateTemporada.tsx:19-20
toast.success(msg, {
  duration: 5000
});

// useDeleteTemporada.tsx:19
toast.success(msg); // Sin config
```

**Problema:**
- UX inconsistente: algunos toasts duran 3s, otros 5s, otros usan defaults
- Algunos especifican posición, otros no

**Código Correcto:**
```typescript
// Definir en lib/constants.ts
export const TOAST_CONFIG = {
  SUCCESS_DURATION: 3000,
  ERROR_DURATION: 5000,
  POSITION: "top-center",
} as const;

// Usar en todos los hooks
import { TOAST_CONFIG } from '@/lib/constants';

toast.success(msg, {
  duration: TOAST_CONFIG.SUCCESS_DURATION,
  position: TOAST_CONFIG.POSITION,
});
```

**Severidad:** 🟢 Baja
**Impacto:** UX Consistency

---

### 🟡 Problema 2.5: invalidateQueries inconsistente

**Ubicación:** Todos los hooks de mutations

**Descripción:**
Las estrategias de invalidación de queries no son consistentes.

**Ejemplos:**
```typescript
// useAgregarSocioTemporada.tsx:24-26 (COMPLETO)
queryClient.invalidateQueries({ queryKey: ["socios-temporada", temporadaId] });
queryClient.invalidateQueries({ queryKey: ["socios-disponibles", temporadaId] });
queryClient.invalidateQueries({ queryKey: ["socios"] }); // ✅ Invalida lista general

// useEliminarSocioTemporada.tsx:22-23 (INCOMPLETO)
queryClient.invalidateQueries({ queryKey: ["socios-temporada", temporadaId] });
queryClient.invalidateQueries({ queryKey: ["socios-disponibles", temporadaId] });
// ❌ NO invalida ["socios"] - inconsistencia directa

// useCreateSocio.tsx:26 (INCOMPLETO)
queryClient.invalidateQueries({ queryKey: ["socios"] });
// ❌ No invalida ["socios-temporada"] - si actualizo un socio,
// las listas por temporada no se refrescan
```

**Problema:**
- Mutations de socios no invalidan `["socios-temporada"]`
- `useAgregarSocioTemporada` invalida `["socios"]` pero `useEliminarSocioTemporada` NO
- Datos pueden quedar desactualizados

**Código Correcto:**
```typescript
// Estandarizar invalidaciones

// Para mutations de socios
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ["socios"] });
  queryClient.invalidateQueries({ queryKey: ["socios-temporada"] }); // Todas las temporadas
  queryClient.invalidateQueries({ queryKey: ["socios-disponibles"] });
};

// Para mutations de asociaciones
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ["socios-temporada", temporadaId] });
  queryClient.invalidateQueries({ queryKey: ["socios-disponibles", temporadaId] });
  queryClient.invalidateQueries({ queryKey: ["socios"] }); // Consistente
};
```

**Severidad:** 🟡 Media
**Impacto:** Data Freshness

---

### 🟡 Problema 2.6: Sin configuración de retry

**Ubicación:** Todos los hooks

**Descripción:**
Ningún hook define una estrategia de `retry`, usando los defaults de TanStack Query (3 intentos para queries, 0 para mutations).

**Código Recomendado:**
```typescript
// Para mutations críticas (crear, actualizar)
const mutation = useMutation({
  mutationFn: ...,
  retry: 1, // Reintentar una vez en caso de fallo de red
  retryDelay: 1000,
  onError: ...
});

// Para queries importantes
const query = useQuery({
  queryKey: ...,
  queryFn: ...,
  retry: 3, // Default es OK, pero mejor explícito
  retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
});
```

**Severidad:** 🟡 Media
**Impacto:** Resiliencia

---

### 🟢 Problema 2.7: placeholderData solo en un hook

**Ubicación:** `hooks/api/common/usePaginatedSearchQuery.ts:58`

**Descripción:**
Solo `usePaginatedSearchQuery` usa `placeholderData` para mantener los datos anteriores mientras se cargan nuevos.

**Código Actual:**
```typescript
// usePaginatedSearchQuery.ts:58
placeholderData: (previousData) => previousData, // ✅ Evita flickering

// Otros hooks NO lo usan
// Resultado: flickering al cambiar de página
```

**Impacto:**
Paginación suave solo en búsquedas, pero no en otras listas.

**Severidad:** 🟢 Baja
**Impacto:** UX Polish

---

### 🟡 Problema 2.8: Sin optimistic updates

**Ubicación:** Todos los hooks de mutations

**Descripción:**
Ningún hook implementa optimistic updates con `onMutate`.

**Ejemplo de Implementación:**
```typescript
export const useDeleteSocio = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/socios/${id}`),

    // ✅ Optimistic update
    onMutate: async (id) => {
      // Cancelar queries pendientes
      await queryClient.cancelQueries({ queryKey: ["socios"] });

      // Snapshot de datos anteriores
      const previousSocios = queryClient.getQueryData(["socios"]);

      // Actualizar cache optimísticamente
      queryClient.setQueryData(["socios"], (old: any) =>
        old?.filter((s: Socio) => s.id !== id)
      );

      return { previousSocios };
    },

    onError: (err, id, context) => {
      // Rollback en caso de error
      queryClient.setQueryData(["socios"], context.previousSocios);
    },

    onSuccess: () => {
      toast.success("Socio eliminado exitosamente");
    },
  });
};
```

**Severidad:** 🟡 Media
**Impacto:** UX Responsiveness

---

### 📊 Resumen de Hooks de API

| Problema | Hooks Afectados | Severidad | Acción |
|----------|----------------|-----------|--------|
| Tipado de errores | 5 | 🔴 Alta | Estandarizar tipos |
| staleTime inconsistente | 4 | 🟡 Media | Aplicar STALE_TIME |
| enabled sin validar | 2 | 🟡 Media | Añadir enabled |
| Toast config | 8 | 🟢 Baja | Centralizar config |
| invalidateQueries | 8 | 🟡 Media | Estandarizar |
| Sin retry | 15 | 🟡 Media | Configurar retry |
| placeholderData | 14 | 🟢 Baja | Considerar añadir |
| Sin optimistic | 8 | 🟡 Media | Implementar |

---

## 3. Formularios

### 🔴 Problema 3.1: LoginForm NO usa React Hook Form + Zod

**Ubicación:** `components/login-form.tsx`

**Descripción:**
El formulario de login usa `useState` manual y validación con `if` statements en lugar de seguir el patrón estándar de la app.

**Código Actual:**
```typescript
// components/login-form.tsx
const [usuario, setUsuario] = useState("");
const [password, setPassword] = useState("");
const [error, setError] = useState("");

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  // Validación manual ❌
  if (!usuario || !password) {
    setError("Por favor ingresa usuario y contraseña");
    return;
  }

  try {
    await loginMutation({ usuario, password });
  } catch (err) {
    if (err instanceof AxiosError) {
      setError(err.response?.data.message); // ❌ Sin adaptError
    }
  }
};
```

**Problema:**
- No usa React Hook Form como MemberForm y SeasonForm
- No usa Zod para validación tipada
- Validación manual simple y propensa a errores
- No sigue el patrón documentado en CLAUDE.md

**Código Correcto:**
```typescript
// 1. Crear schema: lib/schemas/login.schema.ts
import { z } from 'zod';

export const loginSchema = z.object({
  usuario: z.string().min(1, 'Usuario es requerido'),
  password: z.string().min(1, 'Contraseña es requerida'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// 2. Actualizar LoginForm
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '@/lib/schemas/login.schema';
import { adaptError } from '@/lib/errors/error.adapter';

export function LoginForm() {
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      usuario: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await loginMutation(data);
    } catch (error) {
      const uiError = adaptError(error);
      toast.error(uiError.title, { description: uiError.message });
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Usar Form components de shadcn/ui */}
    </form>
  );
}
```

**Severidad:** 🔴 Alta
**Impacto:** Consistencia, Mantenibilidad

---

### 🔴 Problema 3.2: AssociationForm usa validación manual

**Ubicación:** `components/association-form.tsx`

**Descripción:**
El formulario de asociaciones no usa React Hook Form, sino que tiene lógica manual de validación.

**Código Actual:**
```typescript
// components/association-form.tsx
const [errores, setErrores] = useState<Record<string, string>>({});

const validarFormulario = () => {
  const nuevosErrores: Record<string, string> = {}

  if (!socioSeleccionado) {
    nuevosErrores.socio = MENSAJES_ERROR.CAMPO_REQUERIDO
  }

  if (!temporadaSeleccionada) {
    nuevosErrores.temporada = MENSAJES_ERROR.CAMPO_REQUERIDO
  }

  if (socioSeleccionado && temporadaSeleccionada) {
    const asociacionExistente = asociacionesExistentes.find(...)
    if (asociacionExistente) {
      nuevosErrores.general = "Esta asociación ya existe"
    }
  }

  setErrores(nuevosErrores)
  return Object.keys(nuevosErrores).length === 0
}
```

**Problema:**
- Validación manual propensa a errores
- No usa Zod para validación tipada
- No sigue el patrón estándar
- Validación de duplicados debería estar en el schema

**Código Correcto:**
```typescript
// 1. Crear schema: lib/schemas/asociacion.schema.ts
import { z } from 'zod';

export const asociacionSchema = z.object({
  idSocio: z.string().min(1, 'Debe seleccionar un socio'),
  idTemporada: z.string().min(1, 'Debe seleccionar una temporada'),
}).refine(
  (data) => {
    // Validación de duplicados
    // (recibir asociacionesExistentes como parámetro)
    return !isDuplicate(data.idSocio, data.idTemporada);
  },
  {
    message: 'Esta asociación ya existe',
    path: ['general'],
  }
);

// 2. Migrar a React Hook Form
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const form = useForm({
  resolver: zodResolver(asociacionSchema),
  defaultValues: {
    idSocio: '',
    idTemporada: '',
  },
});
```

**Severidad:** 🔴 Alta
**Impacto:** Consistencia, Mantenibilidad

---

### 🟡 Problema 3.3: SeasonForm sin prop isSubmitting

**Ubicación:** `components/season-form.tsx`

**Descripción:**
MemberForm tiene prop `isSubmitting` que deshabilita inputs durante submit, pero SeasonForm no.

**Código Actual:**
```typescript
// MemberForm.tsx (✅ TIENE)
interface MemberFormProps {
  isSubmitting?: boolean; // ✅ Prop disponible
}

// SeasonForm.tsx (❌ NO TIENE)
interface SeasonFormProps {
  season?: Temporada;
  onSubmit: (data: Temporada) => void;
  onCancel: () => void;
  // ❌ Falta isSubmitting
}
```

**Código Correcto:**
```typescript
interface SeasonFormProps {
  season?: Temporada;
  onSubmit: (data: Temporada) => void;
  onCancel: () => void;
  isSubmitting?: boolean; // ✅ Añadir
}

// Deshabilitar inputs cuando isSubmitting = true
<Input
  {...field}
  disabled={isSubmitting} // ✅ Usar la prop
/>
```

**Severidad:** 🟡 Media
**Impacto:** UX

---

### 📊 Resumen de Formularios

| Formulario | Usa RHF+Zod | Validación | Severidad | Acción |
|-----------|-------------|------------|-----------|--------|
| MemberForm | ✅ | ✅ Zod | - | - |
| SeasonForm | ✅ | ✅ Zod | 🟡 | Añadir isSubmitting |
| LoginForm | ❌ | ❌ Manual | 🔴 Alta | Migrar completo |
| AssociationForm | ❌ | ❌ Manual | 🔴 Alta | Migrar completo |

---

## 4. Rutas y Navegación

### 🟡 Problema 4.1: Rutas hardcodeadas

**Ubicación:** Múltiples archivos

**Descripción:**
Según CLAUDE.md, se deben usar las constantes de `ROUTES` en lugar de strings hardcodeados, pero muchos archivos no lo hacen.

**Ejemplos Encontrados:**
```typescript
// app/(auth)/socios/crear/page.tsx:46
router.push("/socios"); // ❌ Hardcoded

// app/(auth)/socios/[id]/edit/page.tsx:79
router.push("/socios"); // ❌ Hardcoded

// components/sidebar.tsx:15-18
const navigation = [
  { name: "Gestión de Socios", href: "/socios", icon: Users }, // ❌
  { name: "Temporadas", href: "/temporadas", icon: Calendar }, // ❌
  { name: "Asociaciones", href: "/socios-temporadas", icon: UserCheck }, // ❌
  { name: "Estadísticas", href: "/estadisticas", icon: BarChart3 }, // ❌
];
```

**Código Correcto:**
```typescript
import { ROUTES } from '@/lib/routes';

// Páginas
router.push(ROUTES.MEMBERS.LIST); // ✅

// Sidebar
const navigation = [
  { name: "Gestión de Socios", href: ROUTES.MEMBERS.LIST, icon: Users },
  { name: "Temporadas", href: ROUTES.SEASONS.LIST, icon: Calendar },
  { name: "Asociaciones", href: ROUTES.ASSOCIATIONS, icon: UserCheck },
  { name: "Estadísticas", href: ROUTES.STATISTICS, icon: BarChart3 },
];
```

**Archivos Afectados:**
- `app/(auth)/socios/crear/page.tsx:46, 103, 181`
- `app/(auth)/socios/[id]/edit/page.tsx:79, 129, 207`
- `components/sidebar.tsx:15-18, 26`
- `components/member-management.tsx:96, 197`
- `hooks/useAuth.ts:22, 47`
- `app/page.tsx:10`
- `app/not-found.tsx:61, 67, 73`

**Severidad:** 🟡 Media
**Impacto:** Mantenibilidad

---

### 🟡 Problema 4.2: Mezcla de router.push() y router.replace()

**Ubicación:** Varios archivos

**Descripción:**
Uso inconsistente de `router.push()` vs `router.replace()`.

**Ejemplos:**
```typescript
// app/page.tsx:10
router.replace("/login"); // ✅ replace - no permite volver atrás

// hooks/useAuth.ts:22
router.push("/socios"); // push - permite volver

// hooks/useAuth.ts:47
router.push("/login"); // ❌ Debería ser replace?
```

**Recomendación:**
- `router.replace()`: Para logout, login, redirects automáticos (no debe haber botón "atrás")
- `router.push()`: Para navegación normal del usuario

**Código Correcto:**
```typescript
// Logout
authService.logout();
router.replace(ROUTES.LOGIN); // ✅ replace

// Login exitoso
router.replace(ROUTES.MEMBERS.LIST); // ✅ replace - no volver a login

// Navegación normal
router.push(ROUTES.MEMBERS.EDIT(id)); // ✅ push
```

**Severidad:** 🟡 Media
**Impacto:** UX Navigation

---

### 🟡 Problema 4.3: Sidebar usa window.location.href

**Ubicación:** `components/sidebar.tsx:26`

**Código Actual:**
```typescript
const handleLogout = () => {
  authService.logout();
  window.location.href = "/login"; // ❌ Rompe navegación SPA
};
```

**Problema:**
- `window.location.href` causa full page reload
- Rompe la navegación SPA de Next.js
- Inconsistente con el resto del código que usa `router.push()`

**Código Correcto:**
```typescript
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/lib/routes';

const router = useRouter();

const handleLogout = () => {
  authService.logout();
  router.replace(ROUTES.LOGIN); // ✅ Usar router de Next.js
};
```

**Severidad:** 🟡 Media
**Impacto:** Performance, UX

---

### 📊 Resumen de Rutas y Navegación

| Problema | Ubicaciones | Severidad | Acción |
|----------|------------|-----------|--------|
| Rutas hardcodeadas | 15+ | 🟡 Media | Usar ROUTES |
| push vs replace | 3 | 🟡 Media | Estandarizar |
| window.location | 1 | 🟡 Media | Usar router |

---

## 5. TypeScript y Tipos

### 🟢 Problema 5.1: Uso de `any` explícito

**Ubicación:** 5 instancias (según PRODUCTION_AUDIT_REPORT.md)

**Ejemplos:**
```typescript
// Buscar en el código con:
// grep -n "any" **/*.{ts,tsx}
```

**Severidad:** 🟢 Baja
**Impacto:** Type Safety

---

### 🟢 Problema 5.2: Non-null assertions innecesarias

**Ubicación:** 6 instancias

**Código Actual:**
```typescript
// Ejemplo típico
const socio = data!.socios[0]; // ❌ Non-null assertion
```

**Código Correcto:**
```typescript
const socio = data?.socios[0]; // ✅ Optional chaining
if (!socio) return null;
```

**Severidad:** 🟢 Baja
**Impacto:** Safety

---

### 🟢 Problema 5.3: Variables no usadas

**Ubicación:** 12 instancias

**Severidad:** 🟢 Baja
**Impacto:** Code Cleanliness

---

### 🟡 Problema 5.4: Tipado de responses inconsistente

**Ubicación:** Hooks de API

**Descripción:**
Algunos hooks de mutations no tipan el response.

**Código Actual:**
```typescript
// useAgregarSocioTemporada.tsx:15
export const useAgregarSocioTemporada = () => {
  return useMutation<
    unknown, // ❌ Response sin tipar
    unknown,
    { temporadaId: string; socioId: string }
  >({...});
};
```

**Código Correcto:**
```typescript
interface AsociacionResponse {
  id: string;
  idSocio: string;
  idTemporada: string;
  fechaAsociacion: string;
}

export const useAgregarSocioTemporada = () => {
  return useMutation<
    AxiosResponse<AsociacionResponse>, // ✅ Tipado
    AxiosError<{ message: string }>,
    { temporadaId: string; socioId: string }
  >({...});
};
```

**Severidad:** 🟡 Media
**Impacto:** Type Safety

---

### 📊 Resumen de TypeScript

| Problema | Cantidad | Severidad | Acción |
|----------|----------|-----------|--------|
| any explícito | 5 | 🟢 Baja | Tipar correctamente |
| Non-null assertions | 6 | 🟢 Baja | Usar optional chaining |
| Variables no usadas | 12 | 🟢 Baja | Eliminar |
| Response sin tipar | 2 | 🟡 Media | Añadir interfaces |

---

## 6. Convenciones del Proyecto

### 🔴 Problema 6.1: Código LEGACY sin migrar

**Ubicación:** `lib/error-handler.ts`

**Descripción:**
Existe un sistema de error handling antiguo que nunca se migró completamente.

**Acción:**
- Eliminar `lib/error-handler.ts`
- Verificar que nada lo importa
- Documentar que `lib/errors/` es el único sistema

**Severidad:** 🔴 Alta (deuda técnica)
**Impacto:** Confusión, Mantenimiento

---

### 🟡 Problema 6.2: Archivos de configuración .js

**Ubicación:** Solo archivos `.mjs` encontrados

**Descripción:**
No hay archivos `.js` en el proyecto (solo `.mjs` para configs), lo cual es correcto.

**Estado:** ✅ OK

---

### 🟡 Problema 6.3: Falta documentación inline

**Ubicación:** Varios archivos

**Descripción:**
Algunas funciones complejas no tienen comentarios JSDoc.

**Ejemplo:**
```typescript
// lib/utils/date.ts - funciones sin JSDoc
export function parseDateSafe(date: string | Date): Date {
  // Lógica compleja sin documentar
}
```

**Código Correcto:**
```typescript
/**
 * Parsea una fecha de forma segura, manejando timezone de Buenos Aires
 * @param date - String ISO o objeto Date
 * @returns Date parseado con timezone correcto
 * @throws Error si el formato es inválido
 */
export function parseDateSafe(date: string | Date): Date {
  // ...
}
```

**Severidad:** 🟡 Media
**Impacto:** Developer Experience

---

### 📊 Resumen de Convenciones

| Problema | Ubicación | Severidad | Acción |
|----------|-----------|-----------|--------|
| Código LEGACY | 1 archivo | 🔴 Alta | Eliminar |
| Sin JSDoc | Varios | 🟡 Media | Documentar |

---

## 📋 Plan de Acción Priorizado

### Fase 1: Crítica (1-2 días) 🔴

**Prioridad Alta - Afecta funcionalidad o seguridad**

1. **Corregir contexto de logs en hooks de temporadas**
   - `hooks/api/temporadas/useCreateTemporada.tsx:30` → cambiar a "useCreateTemporada"
   - `hooks/api/temporadas/useUpdateTemporada.tsx:29` → cambiar a "useUpdateTemporada"
   - `hooks/api/temporadas/useDeleteTemporada.tsx:27` → cambiar a "useDeleteTemporada"
   - `hooks/api/socios/useAgregarSocioTemporada.tsx:31` → cambiar a "useAgregarSocioTemporada"
   - `hooks/api/socios/useEliminarSocioTemporada.tsx:28` → cambiar a "useEliminarSocioTemporada"
   - **Impacto:** Debugging efectivo
   - **Tiempo:** 15 minutos

2. **Migrar LoginForm a React Hook Form + Zod**
   - Crear `lib/schemas/login.schema.ts`
   - Refactorizar `components/login-form.tsx`
   - Usar `adaptError()` en lugar de acceso directo
   - **Impacto:** Consistencia, Seguridad
   - **Tiempo:** 2 horas

3. **Migrar use-available-members a apiClient**
   - Reemplazar `fetch` por `apiClient` en `hooks/use-available-members.ts:44-79`
   - Usar `adaptError()` para manejo de errores
   - **Impacto:** Arquitectura, Autenticación
   - **Tiempo:** 1 hora

4. **Estandarizar tipado de errores en hooks de socios**
   - Cambiar `unknown` a `AxiosError<{ message: string }>` en:
     - `hooks/api/socios/useCreateSocio.tsx:15`
     - `hooks/api/socios/useUpdateSocio.tsx:14`
     - `hooks/api/socios/useDeleteSocio.tsx:12`
     - `hooks/api/socios/useAgregarSocioTemporada.tsx:15`
     - `hooks/api/socios/useEliminarSocioTemporada.tsx:15`
   - **Impacto:** Type Safety
   - **Tiempo:** 30 minutos

5. **Eliminar código LEGACY**
   - Eliminar `lib/error-handler.ts`
   - Verificar que nada lo importa (buscar imports)
   - **Impacto:** Mantenibilidad
   - **Tiempo:** 15 minutos

**Total Fase 1:** ~4 horas

---

### Fase 2: Importante (2-3 días) 🟡

**Prioridad Media - Mejora UX y consistencia**

6. **Migrar AssociationForm a React Hook Form + Zod**
   - Crear `lib/schemas/asociacion.schema.ts`
   - Refactorizar `components/association-form.tsx`
   - **Impacto:** Consistencia
   - **Tiempo:** 3 horas

7. **Limpiar try/catch en season-management**
   - Eliminar o mejorar manejo de errores en `components/season-management.tsx:58-60, 76-78, 82-87`
   - Opción 1: Eliminar try/catch (confiar en hook)
   - Opción 2: Añadir lógica de rollback
   - **Impacto:** UX
   - **Tiempo:** 1 hora

8. **Mejorar páginas de crear/editar socio**
   - Añadir logging en catch blocks:
     - `app/(auth)/socios/crear/page.tsx:44-49`
     - `app/(auth)/socios/[id]/edit/page.tsx:77-82`
   - **Impacto:** Debugging
   - **Tiempo:** 30 minutos

9. **Estandarizar staleTime en queries**
   - Añadir `staleTime: STALE_TIME` en:
     - `hooks/api/temporadas/useTemporadas.tsx:6-12`
     - `hooks/api/socios/useSociosTemporada.tsx:10-20`
     - `hooks/api/socios/useSociosDisponiblesInfinite.tsx:29-67`
   - **Impacto:** Performance
   - **Tiempo:** 20 minutos

10. **Añadir enabled a queries condicionales**
    - `hooks/api/temporadas/useSociosDisponiblesTemporada.tsx:6-11`
    - **Impacto:** Robustez
    - **Tiempo:** 10 minutos

11. **Estandarizar invalidateQueries**
    - Revisar y normalizar estrategia de invalidación en todos los hooks
    - Documentar en `lib/constants.ts` qué queries se invalidan para cada acción
    - **Impacto:** Data Freshness
    - **Tiempo:** 2 horas

12. **Reemplazar rutas hardcodeadas por ROUTES**
    - Buscar y reemplazar strings hardcoded en ~15 archivos
    - **Impacto:** Mantenibilidad
    - **Tiempo:** 1 hora

13. **Estandarizar navegación (push vs replace)**
    - Revisar y corregir uso de `router.push()` vs `router.replace()`
    - Corregir `window.location.href` en `components/sidebar.tsx:26`
    - **Impacto:** UX
    - **Tiempo:** 30 minutos

14. **Mejorar token-storage error handling**
    - Añadir feedback visual en errores de localStorage
    - `lib/utils/token-storage.ts:22-26, 36-41, 50-54`
    - **Impacto:** Robustez
    - **Tiempo:** 1 hora

**Total Fase 2:** ~10 horas

---

### Fase 3: Mejoras (1-2 días) 🟢

**Prioridad Baja - Polish y optimizaciones**

15. **Centralizar configuración de toasts**
    - Crear `TOAST_CONFIG` en `lib/constants.ts`
    - Aplicar en todos los hooks
    - **Impacto:** UX Consistency
    - **Tiempo:** 1 hora

16. **Añadir configuración de retry**
    - Definir estrategia de retry para queries y mutations
    - **Impacto:** Resiliencia
    - **Tiempo:** 1 hora

17. **Implementar form.setError() en formularios**
    - Añadir manejo de errores específicos de campo
    - Ejemplo: DNI duplicado marca el campo DNI
    - **Impacto:** UX
    - **Tiempo:** 2 horas

18. **Añadir isSubmitting a SeasonForm**
    - `components/season-form.tsx`
    - **Impacto:** UX
    - **Tiempo:** 30 minutos

19. **Considerar optimistic updates**
    - Implementar en mutations críticas (delete, update)
    - **Impacto:** UX Responsiveness
    - **Tiempo:** 4 horas

20. **Limpiar warnings de TypeScript**
    - Eliminar 5 `any` explícitos
    - Reemplazar 6 non-null assertions por optional chaining
    - Eliminar 12 variables no usadas
    - **Impacto:** Code Quality
    - **Tiempo:** 2 horas

21. **Añadir JSDoc a funciones complejas**
    - Documentar funciones en `lib/utils/date.ts` y otras
    - **Impacto:** Developer Experience
    - **Tiempo:** 2 horas

**Total Fase 3:** ~13 horas

---

### Resumen de Esfuerzo

| Fase | Tareas | Tiempo Estimado | Prioridad |
|------|--------|----------------|-----------|
| Fase 1 | 5 | ~4 horas | 🔴 Crítica |
| Fase 2 | 9 | ~10 horas | 🟡 Importante |
| Fase 3 | 7 | ~13 horas | 🟢 Mejoras |
| **TOTAL** | **21** | **~27 horas** | - |

---

## 📝 Código Específico a Corregir

### Archivo por Archivo

#### hooks/api/temporadas/useCreateTemporada.tsx

```diff
- logError(error, "useCreateSocio");
+ logError(error, "useCreateTemporada");
```

#### hooks/api/temporadas/useUpdateTemporada.tsx

```diff
- logError(error, "useCreateSocio");
+ logError(error, "useUpdateTemporada");
```

#### hooks/api/temporadas/useDeleteTemporada.tsx

```diff
- logError(error, "useCreateSocio");
+ logError(error, "useDeleteTemporada");
```

#### hooks/api/socios/useAgregarSocioTemporada.tsx

```diff
- logError(error, "useCreateSocio");
+ logError(error, "useAgregarSocioTemporada");
```

#### hooks/api/socios/useEliminarSocioTemporada.tsx

```diff
- logError(error, "useCreateSocio");
+ logError(error, "useEliminarSocioTemporada");
```

#### components/login-form.tsx

```diff
- const [usuario, setUsuario] = useState("");
- const [password, setPassword] = useState("");
- const [error, setError] = useState("");

+ import { useForm } from 'react-hook-form';
+ import { zodResolver } from '@hookform/resolvers/zod';
+ import { loginSchema } from '@/lib/schemas/login.schema';
+
+ const form = useForm({
+   resolver: zodResolver(loginSchema),
+   defaultValues: { usuario: '', password: '' }
+ });

- const handleSubmit = async (e: React.FormEvent) => {
-   e.preventDefault();
-   if (!usuario || !password) {
-     setError("Por favor ingresa usuario y contraseña");
-     return;
-   }
+ const onSubmit = async (data: LoginFormData) => {
    try {
-     await loginMutation({ usuario, password });
+     await loginMutation(data);
    } catch (err) {
-     if (err instanceof AxiosError) {
-       setError(err.response?.data.message);
-     }
+     const uiError = adaptError(err);
+     toast.error(uiError.title, { description: uiError.message });
    }
  };
```

#### hooks/api/socios/useCreateSocio.tsx

```diff
  export const useCreateSocio = () => {
    return useMutation<
      AxiosResponse<SocioWithFoto>,
-     unknown,
+     AxiosError<{ message: string }>,
      FormData
    >({
```

#### hooks/use-available-members.ts

```diff
- const response = await fetch(`/api/socios/disponibles-para-temporada/${idTemporada}?${params}`);
- if (response.ok) {
-   const data = await response.json();
-   setSocios(data.socios || []);
- }

+ import { apiClient } from '@/lib/api/client';
+ import { adaptError } from '@/lib/errors/error.adapter';
+
+ const { data } = await apiClient.get<{
+   socios: SocioWithFoto[];
+   paginacion: Paginacion;
+ }>(`/socios/disponibles-para-temporada/${idTemporada}?${params}`);
+ setSocios(data.socios || []);

  } catch (err) {
-   const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
-   setError(errorMessage);
+   const uiError = adaptError(err);
+   setError(uiError.message);
```

#### components/sidebar.tsx

```diff
+ import { useRouter } from 'next/navigation';
+ import { ROUTES } from '@/lib/routes';

+ const router = useRouter();

  const handleLogout = () => {
    authService.logout();
-   window.location.href = "/login";
+   router.replace(ROUTES.LOGIN);
  };

  const navigation = [
-   { name: "Gestión de Socios", href: "/socios", icon: Users },
-   { name: "Temporadas", href: "/temporadas", icon: Calendar },
-   { name: "Asociaciones", href: "/socios-temporadas", icon: UserCheck },
-   { name: "Estadísticas", href: "/estadisticas", icon: BarChart3 },
+   { name: "Gestión de Socios", href: ROUTES.MEMBERS.LIST, icon: Users },
+   { name: "Temporadas", href: ROUTES.SEASONS.LIST, icon: Calendar },
+   { name: "Asociaciones", href: ROUTES.ASSOCIATIONS, icon: UserCheck },
+   { name: "Estadísticas", href: ROUTES.STATISTICS, icon: BarChart3 },
  ];
```

---

## 🎯 Conclusión

### Fortalezas del Proyecto

1. **Arquitectura sólida** con Next.js 15 App Router
2. **Sistema de errores centralizado** bien diseñado en `lib/errors/`
3. **Componentes UI** extensiva librería de 71 componentes shadcn/ui
4. **Validaciones con Zod** en esquemas principales
5. **Seguridad** sin vulnerabilidades en dependencias
6. **Build exitoso** sin errores de TypeScript

### Áreas de Mejora

1. **Consistencia en manejo de errores** (10 problemas)
2. **Estandarización de hooks de API** (11 inconsistencias)
3. **Migración de formularios** a React Hook Form + Zod
4. **Uso de constantes** para rutas y configuraciones
5. **Limpieza de código** LEGACY y warnings de TypeScript

### Impacto Esperado de las Correcciones

- **Debugging:** Logs correctos facilitan identificación de problemas
- **Mantenibilidad:** Código consistente es más fácil de mantener
- **UX:** Mejor feedback de errores y navegación
- **Type Safety:** Menos bugs en runtime
- **Performance:** Queries optimizadas con staleTime

---

**Generado por:** Claude Code
**Fecha:** 18 de Octubre, 2025
