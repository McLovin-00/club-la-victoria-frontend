# Pruebas manuales - Carga incremental de socios disponibles

## Objetivo
Verificar que el listado incremental de socios disponibles para una temporada se alimente desde la API `/temporadas/:id/socios-disponibles` y cargue páginas adicionales al solicitar más resultados.

## Pre-requisitos
- Backend y frontend ejecutándose con datos semilla que incluyan socios y temporadas.
- Un usuario autenticado con permisos para gestionar temporadas.
- Identificar el `ID` de una temporada que tenga más socios disponibles que el límite configurado (por defecto 10).

## Pasos
1. Iniciar sesión en la aplicación y navegar al flujo de gestión de socios de una temporada.
2. Abrir el selector o listado que consuma el hook `useSociosDisponiblesInfinite`.
3. Confirmar en las herramientas de red del navegador que la primera petición apunta a `GET /temporadas/{ID}/socios-disponibles?page=1&limit=10` (ajustado según filtros).
4. Aplicar un filtro de búsqueda opcional y validar que la petición incluya el parámetro `search` con el término ingresado.
5. Desplazarse hasta el final de la lista o ejecutar la acción de “cargar más” y comprobar que se emite una segunda petición con `page=2`.
6. Repetir el paso anterior hasta que la API devuelva `totalPages` igual al número de página solicitado y verificar que ya no se realizan peticiones adicionales.

## Resultado esperado
- Cada carga incremental agrega nuevos socios al listado sin duplicados.
- El frontend detiene las solicitudes cuando `hasNextPage` es `false`.
- No se registran errores en la consola ni respuestas `4xx/5xx` en las peticiones revisadas.
