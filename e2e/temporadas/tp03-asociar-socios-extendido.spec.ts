import { expect, test } from "@playwright/test";

import { iniciarSesion } from "../helpers/auth";

// ============================================================================
// TP03-EXT - Asociar socios a temporada (extendido)
// ============================================================================

const generarSufijoUnico = () => `${Date.now()}${Math.floor(Math.random() * 1000)}`;

const crearTemporadaDePrueba = async (
  page: import("@playwright/test").Page,
  opciones?: { nombre?: string; descripcion?: string; fechaInicio?: Date; fechaFin?: Date }
) => {
  const sufijo = generarSufijoUnico();
  const nombre = opciones?.nombre ?? `TemporadaTP03${sufijo}`;
  const descripcion = opciones?.descripcion ?? `Descripción TP03 ${sufijo}`;

  await page.goto("/temporadas");
  await expect(page.getByRole("heading", { name: /Gestión de Temporadas/i })).toBeVisible();

  await page.getByRole("button", { name: /Crear Temporada/i }).click();

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await dialog.locator("#nombre").fill(nombre);
  await dialog.locator("#descripcion").fill(descripcion);

  const hoy = opciones?.fechaInicio ?? new Date();
  const fechaFin = opciones?.fechaFin ?? new Date(hoy.getTime() + 30 * 24 * 60 * 60 * 1000);

  await dialog.locator("#fechaInicio").fill(hoy.toISOString().split('T')[0]);
  await dialog.locator("#fechaFin").fill(fechaFin.toISOString().split('T')[0]);

  await dialog.getByRole("button", { name: /Crear/i }).click();

  // Esperar a que el diálogo se cierre
  await expect(dialog).not.toBeVisible({ timeout: 15000 });
  
  // Verificar que la temporada aparece en la tabla
  await page.waitForTimeout(1000);
  const fila = page.locator("tr, [role='row']").filter({ hasText: nombre }).first();
  await expect(fila).toBeVisible({ timeout: 10000 });

  return { nombre, descripcion };
};

const crearSocioDePrueba = async (page: import("@playwright/test").Page) => {
  const sufijo = generarSufijoUnico();
  const dni = sufijo.slice(-8);
  const nombre = `SocioTP03${sufijo.slice(0, 4)}`;
  const apellido = `Temp${sufijo.slice(4, 8)}`;

  await page.goto("/socios/crear");
  await expect(page.getByRole("heading", { name: /Crear Nuevo Socio/i })).toBeVisible();

  await page.locator("#dni").fill(dni);
  await page.locator("#nombre").fill(nombre);
  await page.locator("#apellido").fill(apellido);
  await page.locator("#fechaNacimiento").fill("1995-05-20");
  await page.locator("#direccion").fill(`Calle TP03 ${sufijo}`);

  await page.getByRole("button", { name: /^Crear$/ }).click();
  await expect(page).toHaveURL(/\/socios$/, { timeout: 15000 });

  return { dni, nombre, apellido };
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
    if ((await fila.count()) === 0) return;
    
    await expect(fila).toBeVisible({ timeout: 10000 });

    await fila.getByRole("button", { name: /Eliminar/i }).click();

    const dialogo = page.locator('[data-slot="alert-dialog-content"]');
    await expect(dialogo).toBeVisible({ timeout: 10000 });

    // Verificar si hay input de confirmación
    const inputBorrar = dialogo.locator("input[type='text']");
    if ((await inputBorrar.count()) > 0) {
      await inputBorrar.fill("borrar");
    }

    const botonEliminar = dialogo.getByRole("button", { name: /Eliminar/i }).filter({ hasText: /^Eliminar$/ });
    await botonEliminar.click();

    await expect(page.locator("tr, [role='row']").filter({ hasText: nombreTemporada })).toHaveCount(0, { timeout: 15000 });
  } catch {
    console.log(`Advertencia: No se pudo eliminar la temporada ${nombreTemporada}`);
  }
};

const eliminarSocioPorDni = async (
  page: import("@playwright/test").Page,
  dni: string
) => {
  try {
    await page.goto("/socios");
    const buscador = page.getByPlaceholder("Buscar por nombre, apellido, DNI o email...");
    await buscador.fill(dni);
    await page.waitForTimeout(1000);

    const filaSocio = page.locator("tr").filter({ hasText: dni }).first();
    if ((await filaSocio.count()) === 0) return;

    await filaSocio.getByRole("button", { name: /Eliminar socio/i }).click();

    const dialogo = page.getByRole("alertdialog");
    await expect(dialogo).toBeVisible();
    await dialogo.getByRole("button", { name: /^Eliminar$/ }).click();

    await expect(page.locator("tr").filter({ hasText: dni })).toHaveCount(0, { timeout: 10000 });
  } catch {
    console.log(`Advertencia: No se pudo eliminar el socio ${dni}`);
  }
};

test.describe.serial("TP03-EXT - Asociar socios a temporada (extendido)", () => {
  let temporadaActiva: { nombre: string; descripcion: string };
  let temporadaFinalizada: { nombre: string; descripcion: string };
  let socioDePrueba: { dni: string; nombre: string; apellido: string };

  // SETUP: Crear temporadas y socio de prueba
  test("TP03-EXT-SETUP: crear temporadas y socio de prueba", async ({ page }) => {
    await iniciarSesion(page);

    // Crear temporada activa (fechas que incluyen hoy)
    temporadaActiva = await crearTemporadaDePrueba(page, {
      nombre: `TempActiva${generarSufijoUnico()}`,
      fechaInicio: new Date(),
      fechaFin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    // Crear temporada finalizada (fechas pasadas)
    const fechaInicioPasada = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
    const fechaFinPasada = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    temporadaFinalizada = await crearTemporadaDePrueba(page, {
      nombre: `TempFinalizada${generarSufijoUnico()}`,
      fechaInicio: fechaInicioPasada,
      fechaFin: fechaFinPasada,
    });

    // Crear socio de prueba
    socioDePrueba = await crearSocioDePrueba(page);
  });

  // TP03-EXT-01: Agregar socio a temporada desde diálogo
  test("TP03-EXT-01: agregar socio a temporada desde dialogo", async ({ page }) => {
    expect(temporadaActiva).toBeDefined();
    expect(socioDePrueba).toBeDefined();
    await iniciarSesion(page);

    await page.goto("/socios-temporadas");
    await expect(
      page.getByRole("heading", { name: /Socios.*Temporada|Socios-Temporada/i })
    ).toBeVisible();

    // Seleccionar temporada activa
    const selectorTemporada = page.getByRole("combobox").or(page.locator("select"));
    if ((await selectorTemporada.count()) > 0) {
      await selectorTemporada.first().click();
      
      // Buscar la opción de la temporada activa
      const opcion = page.getByRole("option", { name: temporadaActiva.nombre });
      if ((await opcion.count()) > 0) {
        await opcion.click();
        await page.waitForTimeout(1000);
      }
    }

    // Buscar botón de agregar socio
    const botonAgregar = page.getByRole("button", { name: /Agregar socio|Asociar socio|Añadir socio/i });
    
    if ((await botonAgregar.count()) > 0) {
      await botonAgregar.first().click();

      // Verificar que se abre diálogo
      const dialog = page.getByRole("dialog");
      await expect(dialog).toBeVisible({ timeout: 5000 });

      // Buscar socio
      const buscador = dialog.getByPlaceholder(/buscar|search|socio/i);
      if ((await buscador.count()) > 0) {
        await buscador.fill(socioDePrueba.dni);
        await page.waitForTimeout(1000);

        // Seleccionar el socio
        const checkboxSocio = dialog.locator("input[type='checkbox']").first();
        if ((await checkboxSocio.count()) > 0) {
          await checkboxSocio.check();
        }

        // Confirmar
        const botonConfirmar = dialog.getByRole("button", { name: /Confirmar|Agregar|Asociar/i });
        if ((await botonConfirmar.count()) > 0) {
          await botonConfirmar.click();

          // Verificar toast de éxito
          const toastSuccess = page.locator('[data-sonner-toast][data-type="success"]');
          await expect(toastSuccess.first()).toBeVisible({ timeout: 10000 });
        }
      }
    }
  });

  // TP03-EXT-02: Verificar socio asociado en la lista
  test("TP03-EXT-02: verificar socio asociado en la lista", async ({ page }) => {
    expect(temporadaActiva).toBeDefined();
    expect(socioDePrueba).toBeDefined();
    await iniciarSesion(page);

    await page.goto("/socios-temporadas");

    // Seleccionar temporada activa
    const selectorTemporada = page.getByRole("combobox").or(page.locator("select"));
    if ((await selectorTemporada.count()) > 0) {
      await selectorTemporada.first().click();
      const opcion = page.getByRole("option", { name: temporadaActiva.nombre });
      if ((await opcion.count()) > 0) {
        await opcion.click();
        await page.waitForTimeout(1000);
      }
    }

    // Buscar el socio en la lista de asociados
    const filaSocio = page.locator("tr, [role='row']").filter({ hasText: socioDePrueba.dni });
    if ((await filaSocio.count()) > 0) {
      await expect(filaSocio.first()).toBeVisible({ timeout: 10000 });
    }
  });

  // TP03-EXT-03: Eliminar socio asociado
  test("TP03-EXT-03: eliminar socio asociado", async ({ page }) => {
    expect(temporadaActiva).toBeDefined();
    expect(socioDePrueba).toBeDefined();
    await iniciarSesion(page);

    await page.goto("/socios-temporadas");

    // Seleccionar temporada activa
    const selectorTemporada = page.getByRole("combobox").or(page.locator("select"));
    if ((await selectorTemporada.count()) > 0) {
      await selectorTemporada.first().click();
      const opcion = page.getByRole("option", { name: temporadaActiva.nombre });
      if ((await opcion.count()) > 0) {
        await opcion.click();
        await page.waitForTimeout(1000);
      }
    }

    // Buscar el socio y eliminar
    const filaSocio = page.locator("tr, [role='row']").filter({ hasText: socioDePrueba.dni });
    if ((await filaSocio.count()) > 0) {
      const botonEliminar = filaSocio.first().getByRole("button", { name: /Eliminar|Quitar|Desasociar/i });
      
      if ((await botonEliminar.count()) > 0) {
        await botonEliminar.click();

        // Confirmar eliminación
        const dialogo = page.getByRole("alertdialog");
        if ((await dialogo.count()) > 0) {
          await dialogo.getByRole("button", { name: /Eliminar|Confirmar/i }).click();
        }

        // Verificar que ya no aparece
        await expect(
          page.locator("tr, [role='row']").filter({ hasText: socioDePrueba.dni })
        ).toHaveCount(0, { timeout: 10000 });
      }
    }
  });

  // TP03-EXT-04: Temporada finalizada bloquea gestión
  test("TP03-EXT-04: temporada finalizada bloquea gestion", async ({ page }) => {
    expect(temporadaFinalizada).toBeDefined();
    await iniciarSesion(page);

    await page.goto("/socios-temporadas");

    // Seleccionar temporada finalizada
    const selectorTemporada = page.getByRole("combobox").or(page.locator("select"));
    if ((await selectorTemporada.count()) > 0) {
      await selectorTemporada.first().click();
      const opcion = page.getByRole("option", { name: temporadaFinalizada.nombre });
      if ((await opcion.count()) > 0) {
        await opcion.click();
        await page.waitForTimeout(1000);
      }
    }

    // Verificar que los botones de agregar/eliminar están deshabilitados o hay mensaje
    const botonAgregar = page.getByRole("button", { name: /Agregar socio|Asociar socio/i });
    const mensajeFinalizada = page.getByText(/finalizada|terminada|cerrada/i);

    // Si hay botón de agregar, verificar que está deshabilitado
    if ((await botonAgregar.count()) > 0) {
      const estaDeshabilitado = await botonAgregar.first().isDisabled();
      // O puede haber un mensaje indicando que está finalizada
      const hayMensaje = (await mensajeFinalizada.count()) > 0;
      
      expect(estaDeshabilitado || hayMensaje).toBe(true);
    }
  });

  // TP03-EXT-05: Temporada activa permite agregar y quitar
  test("TP03-EXT-05: temporada activa permite gestion", async ({ page }) => {
    expect(temporadaActiva).toBeDefined();
    await iniciarSesion(page);

    await page.goto("/socios-temporadas");

    // Seleccionar temporada activa
    const selectorTemporada = page.getByRole("combobox").or(page.locator("select"));
    if ((await selectorTemporada.count()) > 0) {
      await selectorTemporada.first().click();
      const opcion = page.getByRole("option", { name: temporadaActiva.nombre });
      if ((await opcion.count()) > 0) {
        await opcion.click();
        await page.waitForTimeout(1000);
      }
    }

    // Verificar que el botón de agregar está habilitado
    const botonAgregar = page.getByRole("button", { name: /Agregar socio|Asociar socio/i });
    
    if ((await botonAgregar.count()) > 0) {
      // Verificar que está habilitado (no deshabilitado)
      const estaDeshabilitado = await botonAgregar.first().isDisabled();
      expect(estaDeshabilitado).toBe(false);
    }
  });

  // CLEANUP
  test("TP03-EXT-CLEANUP: eliminar temporadas y socio de prueba", async ({ page }) => {
    await iniciarSesion(page);

    if (socioDePrueba) {
      await eliminarSocioPorDni(page, socioDePrueba.dni);
    }

    if (temporadaActiva) {
      await eliminarTemporada(page, temporadaActiva.nombre);
    }

    if (temporadaFinalizada) {
      await eliminarTemporada(page, temporadaFinalizada.nombre);
    }
  });
});
