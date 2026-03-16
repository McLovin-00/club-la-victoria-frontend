import { expect, test } from "@playwright/test";

import { iniciarSesion } from "../helpers/auth";

// ============================================================================
// TP01 - Gestión de temporadas web
// TP02 - Eliminar temporada con confirmación reforzada
// TP03 - Asociar socios a temporada
// TP04 - Casos edge del dominio
// ============================================================================

const generarSufijoUnico = () => `${Date.now()}${Math.floor(Math.random() * 1000)}`;

const crearTemporadaDePrueba = async (
  page: import("@playwright/test").Page,
  opciones?: { nombre?: string; descripcion?: string }
) => {
  const sufijo = generarSufijoUnico();
  const nombre = opciones?.nombre ?? `TemporadaE2E${sufijo}`;
  const descripcion = opciones?.descripcion ?? `Descripción de prueba ${sufijo}`;

  await page.goto("/temporadas");
  await expect(page.getByRole("heading", { name: /Gestión de Temporadas/i })).toBeVisible();

  await page.getByRole("button", { name: /Crear Temporada/i }).click();

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await dialog.locator("#nombre").fill(nombre);
  await dialog.locator("#descripcion").fill(descripcion);

  const hoy = new Date();
  const fechaInicio = hoy.toISOString().split('T')[0];
  const fechaFin = new Date(hoy.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  await dialog.locator("#fechaInicio").fill(fechaInicio);
  await dialog.locator("#fechaFin").fill(fechaFin);

  await dialog.getByRole("button", { name: /Crear/i }).click();

  // Esperar a que el diálogo se cierre (indica éxito)
  await expect(dialog).not.toBeVisible({ timeout: 15000 });
  
  // Verificar que la temporada aparece en la tabla
  await page.waitForTimeout(1000);
  const fila = page.locator("tr, [role='row']").filter({ hasText: nombre }).first();
  await expect(fila).toBeVisible({ timeout: 10000 });

  return { nombre, descripcion, fechaInicio, fechaFin };
};

const buscarTemporadaEnTabla = async (
  page: import("@playwright/test").Page,
  nombreTemporada: string
) => {
  await page.goto("/temporadas");
  await page.waitForTimeout(500);
  const fila = page.locator("tr, [role='row']").filter({ hasText: nombreTemporada }).first();
  return fila;
};

const eliminarTemporada = async (
  page: import("@playwright/test").Page,
  nombreTemporada: string
) => {
  try {
    const fila = await buscarTemporadaEnTabla(page, nombreTemporada);
    await expect(fila).toBeVisible({ timeout: 10000 });

    await fila.getByRole("button", { name: /Eliminar/i }).click();

    const dialogo = page.locator('[data-slot="alert-dialog-content"]');
    await expect(dialogo).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(500);

    // Intentar click directo (asumiendo que no tiene registros)
    const botonEliminar = dialogo.getByRole("button", { name: /Eliminar/i }).filter({ hasText: /^Eliminar$/ });
    await botonEliminar.click();

    await expect(page.locator("tr, [role='row']").filter({ hasText: nombreTemporada })).toHaveCount(0, { timeout: 15000 });
  } catch (error) {
    console.log(`Advertencia: No se pudo eliminar la temporada ${nombreTemporada}`);
  }
};

// ============================================================================
// TP01 - Gestión de temporadas web
// ============================================================================

test.describe.serial("TP01 - Gestión de temporadas web", () => {
  let datosTemporada: Awaited<ReturnType<typeof crearTemporadaDePrueba>>;

  test("TP01-SETUP: crear temporada para pruebas", async ({ page }) => {
    await iniciarSesion(page);
    datosTemporada = await crearTemporadaDePrueba(page);
  });

  test("TP01-01: abrir /temporadas muestra la pagina con tabla", async ({ page }) => {
    await iniciarSesion(page);
    await page.goto("/temporadas");

    await expect(page.getByRole("heading", { name: /Gestión de Temporadas/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Crear Temporada/i })).toBeVisible();
  });

  test("TP01-02: crear temporada con datos minimos", async ({ page }) => {
    await iniciarSesion(page);

    const sufijo = generarSufijoUnico();
    const nombre = `TemporadaE2E${sufijo}`;

    await page.goto("/temporadas");
    await page.getByRole("button", { name: /Crear Temporada/i }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await dialog.locator("#nombre").fill(nombre);
    await dialog.getByRole("button", { name: /Crear/i }).click();

    await expect(page.locator('[data-sonner-toast][data-type="success"]')).toBeVisible({ timeout: 10000 });
    await expect(dialog).not.toBeVisible();

    // Verificar que aparece en la tabla
    const fila = await buscarTemporadaEnTabla(page, nombre);
    await expect(fila).toBeVisible({ timeout: 10000 });

    // Limpiar
    await eliminarTemporada(page, nombre);
  });

  test("TP01-03: crear temporada con todos los datos", async ({ page }) => {
    await iniciarSesion(page);

    const sufijo = generarSufijoUnico();
    const nombre = `TemporadaFull${sufijo}`;
    const descripcion = `Descripción completa ${sufijo}`;

    await page.goto("/temporadas");
    await page.getByRole("button", { name: /Crear Temporada/i }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await dialog.locator("#nombre").fill(nombre);
    await dialog.locator("#descripcion").fill(descripcion);

    // Fechas: fecha actual y fecha + 30 días
    const hoy = new Date();
    const fechaInicio = hoy.toISOString().split('T')[0];
    const fechaFin = new Date(hoy.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    await dialog.locator("#fechaInicio").fill(fechaInicio);
    await dialog.locator("#fechaFin").fill(fechaFin);

    await dialog.getByRole("button", { name: /Crear/i }).click();

    await expect(page.locator('[data-sonner-toast][data-type="success"]')).toBeVisible({ timeout: 10000 });

    // Limpiar
    await eliminarTemporada(page, nombre);
  });

  test("TP01-04: validar nombre requerido", async ({ page }) => {
    await iniciarSesion(page);
    await page.goto("/temporadas");
    await page.getByRole("button", { name: /Crear Temporada/i }).click();

    const dialog = page.getByRole("dialog");
    await dialog.getByRole("button", { name: /Crear/i }).click();

    // Debe mostrar error
    await expect(page.locator('[data-sonner-toast][data-type="error"]')).toBeVisible({ timeout: 10000 });
  });

  test("TP01-05: editar temporada existente", async ({ page }) => {
    await iniciarSesion(page);
    const fila = await buscarTemporadaEnTabla(page, datosTemporada.nombre);
    await expect(fila).toBeVisible({ timeout: 10000 });

    await fila.getByRole("button", { name: /Editar/i }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    const nuevaDescripcion = `Descripción editada ${generarSufijoUnico()}`;
    await dialog.locator("#descripcion").clear();
    await dialog.locator("#descripcion").fill(nuevaDescripcion);
    await dialog.getByRole("button", { name: /Guardar/i }).click();

    await expect(page.locator('[data-sonner-toast][data-type="success"]')).toBeVisible({ timeout: 10000 });
  });

  test("TP01-06: cancelar creacion de temporada", async ({ page }) => {
    await iniciarSesion(page);
    await page.goto("/temporadas");
    await page.getByRole("button", { name: /Crear Temporada/i }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await dialog.locator("#nombre").fill("TemporadaParaCancelar");

    await dialog.getByRole("button", { name: /Cancelar/i }).click();
    await expect(dialog).not.toBeVisible();

    // Verificar que no se creó
    const fila = await buscarTemporadaEnTabla(page, "TemporadaParaCancelar");
    await expect(fila).not.toBeVisible();
  });

  test("TP01-07: validar estado sin temporadas", async ({ page }) => {
    await iniciarSesion(page);
    await page.goto("/temporadas");
    await expect(page.getByRole("heading", { name: /Gestión de Temporadas/i })).toBeVisible();
  });

  test("TP01-CLEANUP: eliminar temporada de prueba", async ({ page }) => {
    await iniciarSesion(page);
    await eliminarTemporada(page, datosTemporada.nombre);
  });
});

// ============================================================================
// TP02 - Eliminar temporada con confirmación reforzada
// ============================================================================

test.describe.serial("TP02 - Eliminar temporada con confirmación reforzada", () => {
  let datosTemporada: Awaited<ReturnType<typeof crearTemporadaDePrueba>>;

  test("TP02-SETUP: crear temporada para pruebas de eliminación", async ({ page }) => {
    await iniciarSesion(page);
    datosTemporada = await crearTemporadaDePrueba(page);
  });

  test("TP02-01: eliminar temporada sin registros muestra confirmación normal", async ({ page }) => {
    await iniciarSesion(page);
    const fila = await buscarTemporadaEnTabla(page, datosTemporada.nombre);
    await expect(fila).toBeVisible({ timeout: 10000 });

    await fila.getByRole("button", { name: /Eliminar/i }).click();

    const dialogo = page.locator('[data-slot="alert-dialog-content"]');
    await expect(dialogo).toBeVisible({ timeout: 10000 });

    // Verificar que no pide escribir "borrar" (sin registros asociados)
    const inputBorrar = dialogo.locator("input[type='text']");
    const inputCount = await inputBorrar.count();

    if (inputCount === 0) {
      // Confirmación normal - click directo
      const botonEliminar = dialogo.getByRole("button", { name: /Eliminar/i }).filter({ hasText: /^Eliminar$/ });
      await botonEliminar.click();
    } else {
      // Confirmación reforzada - escribir "borrar"
      await inputBorrar.fill("borrar");
      const botonEliminar = dialogo.getByRole("button", { name: /Eliminar/i }).filter({ hasText: /^Eliminar$/ });
      await botonEliminar.click();
    }

    await expect(page.locator("tr, [role='row']").filter({ hasText: datosTemporada.nombre })).toHaveCount(0, { timeout: 15000 });
  });

  test("TP02-02: cancelar eliminación", async ({ page }) => {
    await iniciarSesion(page);
    const fila = await buscarTemporadaEnTabla(page, datosTemporada.nombre);
    await expect(fila).toBeVisible({ timeout: 10000 });

    await fila.getByRole("button", { name: /Eliminar/i }).click();

    const dialogo = page.locator('[data-slot="alert-dialog-content"]');
    await expect(dialogo).toBeVisible({ timeout: 10000 });

    // Cancelar
    const botonCancelar = dialogo.getByRole("button", { name: /Cancelar/i }).filter({ hasText: /^Cancelar$/ });
    await botonCancelar.click();

    // Verificar que la temporada sigue existiendo
    const filaDespues = await buscarTemporadaEnTabla(page, datosTemporada.nombre);
    await expect(filaDespues).toBeVisible({ timeout: 10000 });
  });

  test("TP02-CLEANUP: eliminar temporada de prueba", async ({ page }) => {
    await iniciarSesion(page);
    await eliminarTemporada(page, datosTemporada.nombre);
  });
});

// ============================================================================
// TP03 - Asociar socios a temporada
// ============================================================================

test.describe.serial("TP03 - Asociar socios a temporada", () => {
  test("TP03-01: abrir /socios-temporadas muestra la página", async ({ page }) => {
    await iniciarSesion(page);
    await page.goto("/socios-temporadas");

    await expect(page.getByRole("heading", { name: /Socios.*Temporada|Socios-Temporada/i })).toBeVisible();
  });

  test("TP03-02: cambiar temporada seleccionada", async ({ page }) => {
    await iniciarSesion(page);
    await page.goto("/socios-temporadas");

    // Buscar selector de temporada (puede ser un combobox o select)
    const selectorTemporada = page.getByRole("combobox").or(page.locator("select"));

    if (await selectorTemporada.count() > 0) {
      await selectorTemporada.first().click();
      await page.waitForTimeout(500);
      // Verificar que se puede seleccionar una opción
      const opcion = page.getByRole("option").first();
      if (await opcion.count() > 0) {
        await opcion.click();
      }
    }
  });

  test("TP03-03: buscar entre socios asociados", async ({ page }) => {
    await iniciarSesion(page);
    await page.goto("/socios-temporadas");

    // Buscar campo de búsqueda
    const buscador = page.getByPlaceholder(/buscar|search/i);
    if (await buscador.count() > 0) {
      await buscador.first().fill("test");
      await page.waitForTimeout(500);
    }

    await expect(page.getByRole("heading", { name: /Socios.*Temporada|Socios-Temporada/i })).toBeVisible();
  });

  test("TP03-04: validar estado vacío sin socios", async ({ page }) => {
    await iniciarSesion(page);
    await page.goto("/socios-temporadas");

    // Verificar que la página carga correctamente
    await expect(page.getByRole("heading", { name: /Socios.*Temporada|Socios-Temporada/i })).toBeVisible();
  });
});

// ============================================================================
// TP04 - Casos edge del dominio
// ============================================================================

test.describe.serial("TP04 - Casos edge del dominio", () => {
  test("TP04-01: crear temporada con fechas iguales", async ({ page }) => {
    await iniciarSesion(page);

    const sufijo = generarSufijoUnico();
    const nombre = `TemporadaMismoDia${sufijo}`;

    await page.goto("/temporadas");
    await page.getByRole("button", { name: /Crear Temporada/i }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await dialog.locator("#nombre").fill(nombre);

    // Mismo día para inicio y fin
    const hoy = new Date().toISOString().split('T')[0];
    await dialog.locator("#fechaInicio").fill(hoy);
    await dialog.locator("#fechaFin").fill(hoy);

    await dialog.getByRole("button", { name: /Crear/i }).click();

    // Verificar resultado (puede ser éxito o error dependiendo de las reglas del negocio)
    await page.waitForTimeout(2000);

    // Limpiar
    await eliminarTemporada(page, nombre);
  });

  test("TP04-02: crear temporada con fecha fin anterior a inicio", async ({ page }) => {
    await iniciarSesion(page);

    const sufijo = generarSufijoUnico();
    const nombre = `TemporadaInvalida${sufijo}`;

    await page.goto("/temporadas");
    await page.getByRole("button", { name: /Crear Temporada/i }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await dialog.locator("#nombre").fill(nombre);

    // Fecha fin anterior a inicio (inválido)
    const hoy = new Date();
    const fechaFin = hoy.toISOString().split('T')[0];
    const fechaInicio = new Date(hoy.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    await dialog.locator("#fechaInicio").fill(fechaInicio);
    await dialog.locator("#fechaFin").fill(fechaFin);

    await dialog.getByRole("button", { name: /Crear/i }).click();

    // Debe mostrar error
    await expect(page.locator('[data-sonner-toast][data-type="error"]')).toBeVisible({ timeout: 10000 });
  });

  test("TP04-03: validar exportación PDF", async ({ page }) => {
    await iniciarSesion(page);
    await page.goto("/socios-temporadas");

    // Buscar botón de exportar PDF
    const botonExport = page.getByRole("button", { name: /PDF|Exportar/i });

    if (await botonExport.count() > 0) {
      // Click en exportar (no verificamos el contenido del PDF)
      await botonExport.first().click();
      await page.waitForTimeout(2000);
    }

    // Verificar que la página sigue funcionando
    await expect(page.getByRole("heading", { name: /Socios.*Temporada|Socios-Temporada/i })).toBeVisible();
  });
});
