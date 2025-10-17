# Sistema de Manejo de Errores

Este directorio contiene el sistema centralizado de manejo de errores del frontend, sincronizado con los códigos de error del backend.

## Archivos

### `error.types.ts`
Define los tipos TypeScript para el manejo de errores:
- `BackendErrorCode`: Códigos de error del backend (fuente de verdad)
- `ApiError`: Error parseado de la API
- `UiError`: Error formateado para mostrar al usuario

### `error-messages.ts`
Mapeo de códigos de error a mensajes en español para el usuario final.

### `error.adapter.ts`
Lógica principal de adaptación de errores:
- `parseApiError(error)`: Convierte errores de Axios/red a `ApiError`
- `toUiError(apiError)`: Convierte `ApiError` a `UiError` para UI
- `adaptError(error)`: Función principal que combina los dos pasos
- `logError(error, context)`: Logging de errores en desarrollo

### `query-error-handler.tsx`
Configuración global para React Query:
- `handleQueryError`: Handler global de errores
- `queryClientConfig`: Configuración por defecto de React Query

## Uso

### En hooks de React Query

```typescript
import { adaptError, logError } from "@/lib/errors/error.adapter";

export const useCreateSocio = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => apiClient.post('/socios', data),
    onSuccess: (response) => {
      toast.success("Socio creado exitosamente");
      queryClient.invalidateQueries({ queryKey: ["socios"] });
    },
    onError: (error) => {
      logError(error, "useCreateSocio");
      const uiError = adaptError(error);
      toast.error(uiError.title, {
        description: uiError.message,
      });
    },
  });
};
```

### En componentes con React Hook Form

```typescript
import { adaptError } from "@/lib/errors/error.adapter";
import { BackendErrorCode } from "@/lib/errors/error.types";
import { parseApiError } from "@/lib/errors/error.adapter";

const onSubmit = async (data) => {
  try {
    await createSocio.mutateAsync(data);
  } catch (error) {
    const uiError = adaptError(error);
    const apiError = parseApiError(error);

    // Si el error es de validación del backend, mostrarlo en el campo
    if (apiError.code === BackendErrorCode.DNI_ALREADY_EXISTS) {
      form.setError('dni', {
        type: 'manual',
        message: uiError.message,
      });
    } else {
      toast.error(uiError.title, { description: uiError.message });
    }
  }
};
```

## Sincronización con Backend

Los códigos de error están sincronizados con:
```
backend/src/constants/errors/error-messages.ts
```

**IMPORTANTE**: Si se agregan nuevos códigos en el backend, deben agregarse aquí también:
1. Actualizar `BackendErrorCode` en `error.types.ts`
2. Agregar mensaje en español en `error-messages.ts`

## Ventajas

✅ **Tipado estricto**: TypeScript previene errores de códigos inválidos
✅ **Mensajes consistentes**: Todos los errores tienen mensajes claros en español
✅ **Logging centralizado**: Fácil agregar Sentry u otro servicio
✅ **No más strings mágicos**: Los códigos vienen del backend
✅ **UX mejorada**: Variantes (error/warning/info) según el tipo de error
