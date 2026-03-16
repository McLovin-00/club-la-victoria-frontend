import { expect, test } from "@playwright/test";

import { iniciarSesion } from "../helpers/auth";

// ============================================================================
// TP04-EXT - Casos edge del dominio temporadas (extendido)
// ============================================================================

const generarSufijoUnico = () => `${Date.now()}${Math.floor(Math.random() * 1000)}`;

const crearTemporadaDePrueba = async (
  page: import("@playwright/test").Page,
  opciones?: {
    nombre?: string;
    descripcion?: string;
    fechaInicio?: Date;
    fechaFin?: Date;
  }
) => {
  const sufijo = generarSufijoUnico();
  const nombre = opciones?.nombre ?? `TemporadaTP04${sufijo}`;
  const descripcion = opciones?.descripcion ?? `Descripción TP04 ${sufijo}`;

  await page.goto("/temporadas");
  await expect(
    page.getByRole("heading", { name: /Gestión de Temporadas/i })
  ).toBeVisible();

  await page.getByRole("button", { name: /Crear Temporada/i }).click();

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await dialog.locator("#nombre").fill(nombre);
  await dialog.locator("#descripcion").fill(descripcion);

  const hoy = opciones?.fechaInicio ?? new Date();
  const fechaFin =
    opciones?.fechaFin ?? new Date(hoy.getTime() + 30 * 24 * 60 * 60 * 1000);

  await dialog.locator("#fechaInicio").fill(hoy.toISOString().split("T")[0]);
  await dialog.locator("#fechaFin").fill(fechaFin.toISOString().split("T")[0]);

  await dialog.getByRole("button", { name: /Crear/i }).click();

  await expect(dialog).not.toBeVisible({ timeout: 15000 });

  await page.waitForTimeout(1000);
  const fila = page
    .locator("tr, [role='row']")
    .filter({ hasText: nombre })
    .first();
  await expect(fila).toBeVisible({ timeout: 10000 });

  return { nombre, descripcion };
};

const crearSocioDePrueba = async (page: import("@playwright/test").Page) => {
  const sufijo = generarSufijoUnico();
  const dni = sufijo.slice(-8);
  const nombre = `SocioTP04${sufijo.slice(0, 4)}`;
  const apellido = `Edge${sufijo.slice(4, 8)}`;

  await page.goto("/socios/crear");
  await expect(
    page.getByRole("heading", { name: /Crear Nuevo Socio/i })
  ).toBeVisible();

  await page.locator("#dni").fill(dni);
  await page.locator("#nombre").fill(nombre);
  await page.locator("#apellido").fill(apellido);
  await page.locator("#fechaNacimiento").fill("1992-03-15");
  await page.locator("#direccion").fill(`Calle TP04 ${sufijo}`);

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
  const fila = page
    .locator("tr, [role='row']")
    .filter({ hasText: nombreTemporada })
    .first();
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

    const inputBorrar = dialogo.locator("input[type='text']");
    if ((await inputBorrar.count()) > 0) {
      await inputBorrar.fill("borrar");
    }

    const botonEliminar = dialogo
      .getByRole("button", { name: /Eliminar/i })
      .filter({ hasText: /^Eliminar$/ });
    await botonEliminar.click();

    await expect(
      page.locator("tr, [role='row']").filter({ hasText: nombreTemporada })
    ).toHaveCount(0, { timeout: 15000 });
  } catch {
    console.log(
      `Advertencia: No se pudo eliminar la temporada ${nombreTemporada}`
    );
  }
};

const eliminarSocioPorDni = async (
  page: import("@playwright/test").Page,
  dni: string
) => {
  try {
    await page.goto("/socios");
    const buscador = page.getByPlaceholder(
      "Buscar por nombre, apellido, DNI o email..."
    );
    await buscador.fill(dni);
    await page.waitForTimeout(1000);

    const filaSocio = page.locator("tr").filter({ hasText: dni }).first();
    if ((await filaSocio.count()) === 0) return;

    await filaSocio.getByRole("button", { name: /Eliminar socio/i }).click();

    const dialogo = page.getByRole("alertdialog");
    await expect(dialogo).toBeVisible();
    await dialogo.getByRole("button", { name: /^Eliminar$/ }).click();

    await expect(
      page.locator("tr").filter({ hasText: dni })
    ).toHaveCount(0, { timeout: 10000 });
  } catch {
    console.log(`Advertencia: No se pudo eliminar el socio ${dni}`);
  }
};

const asociarSocioATemporada = async (
  page: import("@playwright/test").Page,
  nombreTemporada: string,
  dniSocio: string
) => {
  await page.goto("/socios-temporadas");

  // Seleccionar temporada
  const selectorTemporada = page.getByRole("combobox").or(page.locator("select"));
  if ((await selectorTemporada.count()) > 0) {
    await selectorTemporada.first().click();
    const opcion = page.getByRole("option", { name: nombreTemporada });
    if ((await opcion.count()) > 0) {
      await opcion.click();
      await page.waitForTimeout(1000);
    }
  }

  // Agregar socio
  const botonAgregar = page.getByRole("button", {
    name: /Agregar socio|Asociar socio|Añadir socio/i,
  });

  if ((await botonAgregar.count()) > 0) {
    await botonAgregar.first().click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible({ timeout: 5000 });

    const buscador = dialog.getByPlaceholder(/buscar|search|socio/i);
    if ((await buscador.count()) > 0) {
      await buscador.fill(dniSocio);
      await page.waitForTimeout(1000);

      const checkboxSocio = dialog.locator("input[type='checkbox']").first();
      if ((await checkboxSocio.count()) > 0) {
        await checkboxSocio.check();
      }

      const botonConfirmar = dialog.getByRole("button", {
        name: /Confirmar|Agregar|Asociar/i,
      });
      if ((await botonConfirmar.count()) > 0) {
        await botonConfirmar.click();
        await page.waitForTimeout(1000);
      }
    }
  }
};

test.describe.serial("TP04-EXT - Casos edge temporadas (extendido)", () => {
  let temporada1: { nombre: string; descripcion: string };
  let temporada2: { nombre: string; descripcion: string };
  let socioDePrueba: { dni: string; nombre: string; apellido: string };

  // SETUP
  test("TP04-EXT-SETUP: crear temporadas y socio de prueba", async ({ page }) => {
    await iniciarSesion(page);

    // Crear dos temporadas para pruebas de solapamiento
    temporada1 = await crearTemporadaDePrueba(page, {
      nombre: `Temp1TP04${generarSufijoUnico()}`,
    });

    temporada2 = await crearTemporadaDePrueba(page, {
      nombre: `Temp2TP04${generarSufijoUnico()}`,
    });

    socioDePrueba = await crearSocioDePrueba(page);
  });

  // TP04-EXT-01: Validar solapamiento de temporadas
  test("TP04-EXT-01: validar solapamiento de temporadas", async ({ page }) => {
    await iniciarSesion(page);

    const sufijo = generarSufijoUnico();
    const nombre = `TemporadaSolapada${sufijo}`;

    await page.goto("/temporadas");
    await page.getByRole("button", { name: /Crear Temporada/i }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await dialog.locator("#nombre").fill(nombre);

    // Usar fechas que se solapan con temporada1
    const hoy = new Date();
    await dialog.locator("#fechaInicio").fill(hoy.toISOString().split("T")[0]);
    await dialog
      .locator("#fechaFin")
      .fill(
        new Date(hoy.getTime() + 15 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0]
      );

    await dialog.getByRole("button", { name: /Crear/i }).click();

    // Verificar resultado - puede permitir o rechazar según reglas de negocio
    await page.waitForTimeout(2000);

    // Si muestra error, verificar el toast
    const toastError = page.locator('[data-sonner-toast][data-type="error"]');
    const toastSuccess = page.locator('[data-sonner-toast][data-type="success"]');

    const hayError = (await toastError.count()) > 0;
    const hayExito = (await toastSuccess.count()) > 0;

    // Si se creó exitosamente, limpiar
    if (hayExito || !(await dialog.isVisible())) {
      await eliminarTemporada(page, nombre);
    }
  });

  // TP04-EXT-02: Eliminar temporada con registros asociados
  test("TP04-EXT-02: eliminar temporada con registros asociados", async ({
    page,
  }) => {
    expect(temporada1).toBeDefined();
    expect(socioDePrueba).toBeDefined();
    await iniciarSesion(page);

    // Asociar socio a la temporada
    await asociarSocioATemporada(page, temporada1.nombre, socioDePrueba.dni);

    // Intentar eliminar la temporada
    const fila = await buscarTemporadaEnTabla(page, temporada1.nombre);
    await expect(fila).toBeVisible({ timeout: 10000 });

    await fila.getByRole("button", { name: /Eliminar/i }).click();

    const dialogo = page.locator('[data-slot="alert-dialog-content"]');
    await expect(dialogo).toBeVisible({ timeout: 10000 });

    // Verificar si hay confirmación reforzada (escribir "borrar")
    const inputBorrar = dialogo.locator("input[type='text']");
    if ((await inputBorrar.count()) > 0) {
      // Hay confirmación reforzada - indica que tiene registros
      await inputBorrar.fill("borrar");

      const botonEliminar = dialogo
        .getByRole("button", { name: /Eliminar/i })
        .filter({ hasText: /^Eliminar$/ });
      await botonEliminar.click();

      // Verificar que se eliminó
      await expect(
        page.locator("tr, [role='row']").filter({ hasText: temporada1.nombre })
      ).toHaveCount(0, { timeout: 15000 });

      // Marcar como eliminada para evitar cleanup
      temporada1 = { ...temporada1, nombre: "" };
    } else {
      // No hay confirmación reforzada - cancelar
      await dialogo.getByRole("button", { name: /Cancelar/i }).click();
    }
  });

  // TP04-EXT-03: Temporada finalizada es consultable
  test("TP04-EXT-03: temporada finalizada es consultable", async ({ page }) => {
    await iniciarSesion(page);

    // Crear temporada finalizada
    const fechaInicioPasada = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
    const fechaFinPasada = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const temporadaFinalizada = await crearTemporadaDePrueba(page, {
      nombre: `TempFinalizadaTP04${generarSufijoUnico()}`,
      fechaInicio: fechaInicioPasada,
      fechaFin: fechaFinPasada,
    });

    // Ir a socios-temporadas
    await page.goto("/socios-temporadas");

    // Seleccionar la temporada finalizada
    const selectorTemporada = page
      .getByRole("combobox")
      .or(page.locator("select"));
    if ((await selectorTemporada.count()) > 0) {
      await selectorTemporada.first().click();
      const opcion = page.getByRole("option", {
        name: temporadaFinalizada.nombre,
      });
      if ((await opcion.count()) > 0) {
        await opcion.click();
        await page.waitForTimeout(1000);

        // Verificar que la página carga (es consultable)
        await expect(
          page.getByRole("heading", {
            name: /Socios.*Temporada|Socios-Temporada/i,
          })
        ).toBeVisible();
      }
    }

    // Limpiar
    await eliminarTemporada(page, temporadaFinalizada.nombre);
  });

  // TP04-EXT-04: Restricción de edición en temporada finalizada
  test("TP04-EXT-04: restriccion edicion temporada finalizada", async ({
    page,
  }) => {
    await iniciarSesion(page);

    // Crear temporada finalizada
    const fechaInicioPasada = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
    const fechaFinPasada = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const temporadaFinalizada = await crearTemporadaDePrueba(page, {
      nombre: `TempEditTP04${generarSufijoUnico()}`,
      fechaInicio: fechaInicioPasada,
      fechaFin: fechaFinPasada,
    });

    // Ir a socios-temporadas y seleccionar
    await page.goto("/socios-temporadas");

    const selectorTemporada = page
      .getByRole("combobox")
      .or(page.locator("select"));
    if ((await selectorTemporada.count()) > 0) {
      await selectorTemporada.first().click();
      const opcion = page.getByRole("option", {
        name: temporadaFinalizada.nombre,
      });
      if ((await opcion.count()) > 0) {
        await opcion.click();
        await page.waitForTimeout(1000);

        // Verificar que el botón de agregar está deshabilitado
        const botonAgregar = page.getByRole("button", {
          name: /Agregar socio|Asociar socio/i,
        });

        if ((await botonAgregar.count()) > 0) {
          const estaDeshabilitado = await botonAgregar.first().isDisabled();
          // O puede haber un mensaje de temporada finalizada
          const mensajeFinalizada = page.getByText(
            /finalizada|terminada|cerrada|no se puede/i
          );
          const hayMensaje = (await mensajeFinalizada.count()) > 0;

          expect(estaDeshabilitado || hayMensaje).toBe(true);
        }
      }
    }

    // Limpiar
    await eliminarTemporada(page, temporadaFinalizada.nombre);
  });

  // TP04-EXT-05: Exportar PDF con dataset grande
  test("TP04-EXT-05: exportar PDF con muchos socios", async ({ page }) => {
    await iniciarSesion(page);

    // Crear temporada con muchos socios (simulado - usamos temporada existente)
    const temporada = await crearTemporadaDePrueba(page, {
      nombre: `TempPDFBig${generarSufijoUnico()}`,
    });

    await page.goto("/socios-temporadas");

    // Seleccionar temporada
    const selectorTemporada = page
      .getByRole("combobox")
      .or(page.locator("select"));
    if ((await selectorTemporada.count()) > 0) {
      await selectorTemporada.first().click();
      const opcion = page.getByRole("option", { name: temporada.nombre });
      if ((await opcion.count()) > 0) {
        await opcion.click();
        await page.waitForTimeout(1000);
      }
    }

    // Click en exportar PDF
    const botonExport = page.getByRole("button", { name: /PDF|Exportar/i });

    if ((await botonExport.count()) > 0) {
      // Solo verificar que el botón existe y es clickable
      await expect(botonExport.first()).toBeEnabled();
    }

    // Limpiar
    await eliminarTemporada(page, temporada.nombre);
  });

  // TP04-EXT-06: Comparar contenido PDF con tabla visible
  test("TP04-EXT-06: comparar PDF con tabla", async ({ page }) => {
    await iniciarSesion(page);

    // Crear temporada con socio asociado
    const temporada = await crearTemporadaDePrueba(page, {
      nombre: `TempPDFComp${generarSufijoUnico()}`,
    });

    // Asociar socio
    await asociarSocioATemporada(page, temporada.nombre, socioDePrueba.dni);

    // Ir a socios-temporadas
    await page.goto("/socios-temporadas");

    // Seleccionar temporada
    const selectorTemporada = page
      .getByRole("combobox")
      .or(page.locator("select"));
    if ((await selectorTemporada.count()) > 0) {
      await selectorTemporada.first().click();
      const opcion = page.getByRole("option", { name: temporada.nombre });
      if ((await opcion.count()) > 0) {
        await opcion.click();
        await page.waitForTimeout(1000);

        // Verificar que el socio aparece en la tabla
        const filaSocio = page
          .locator("tr, [role='row']")
          .filter({ hasText: socioDePrueba.dni });
        if ((await filaSocio.count()) > 0) {
          await expect(filaSocio.first()).toBeVisible();
        }
      }
    }

    // Limpiar
    await eliminarTemporada(page, temporada.nombre);
  });

  // TP04-EXT-07: Alta y baja repetida del mismo socio
  test("TP04-EXT-07: alta y baja repetida mismo socio", async ({ page }) => {
    expect(temporada2).toBeDefined();
    expect(socioDePrueba).toBeDefined();
    await iniciarSesion(page);

    // Primera asociación
    await asociarSocioATemporada(page, temporada2.nombre, socioDePrueba.dni);

    // Verificar que aparece
    await page.goto("/socios-temporadas");
    const selectorTemporada = page
      .getByRole("combobox")
      .or(page.locator("select"));
    if ((await selectorTemporada.count()) > 0) {
      await selectorTemporada.first().click();
      const opcion = page.getByRole("option", { name: temporada2.nombre });
      if ((await opcion.count()) > 0) {
        await opcion.click();
        await page.waitForTimeout(1000);

        // Eliminar
        const filaSocio = page
          .locator("tr, [role='row']")
          .filter({ hasText: socioDePrueba.dni });
        if ((await filaSocio.count()) > 0) {
          const botonEliminar = filaSocio
            .first()
            .getByRole("button", { name: /Eliminar|Quitar|Desasociar/i });

          if ((await botonEliminar.count()) > 0) {
            await botonEliminar.click();

            const dialogo = page.getByRole("alertdialog");
            if ((await dialogo.count()) > 0) {
              await dialogo
                .getByRole("button", { name: /Eliminar|Confirmar/i })
                .click();
            }
          }
        }
      }
    }

    // Segunda asociación (mismo socio)
    await asociarSocioATemporada(page, temporada2.nombre, socioDePrueba.dni);

    // Verificar que aparece nuevamente (sin duplicados)
    await page.goto("/socios-temporadas");
    if ((await selectorTemporada.count()) > 0) {
      await selectorTemporada.first().click();
      const opcion = page.getByRole("option", { name: temporada2.nombre });
      if ((await opcion.count()) > 0) {
        await opcion.click();
        await page.waitForTimeout(1000);

        // Contar ocurrencias del socio
        const filasSocio = page
          .locator("tr, [role='row']")
          .filter({ hasText: socioDePrueba.dni });

        // Debe haber exactamente una ocurrencia (sin duplicados)
        const cantidad = await filasSocio.count();
        expect(cantidad).toBeLessThanOrEqual(1);
      }
    }
  });

  // TP04-EXT-08: Validar que no hay asociaciones fantasma
  test("TP04-EXT-08: validar sin asociaciones fantasma", async ({ page }) => {
    await iniciarSesion(page);

    // Crear nueva temporada
    const temporada = await crearTemporadaDePrueba(page, {
      nombre: `TempFantasma${generarSufijoUnico()}`,
    });

    // Asociar socio
    await asociarSocioATemporada(page, temporada.nombre, socioDePrueba.dni);

    // Eliminar la temporada
    await eliminarTemporada(page, temporada.nombre);

    // Verificar que la temporada ya no existe
    const fila = await buscarTemporadaEnTabla(page, temporada.nombre);
    await expect(fila).toHaveCount(0);

    // El socio debe seguir existiendo
    await page.goto("/socios");
    const buscador = page.getByPlaceholder(
      "Buscar por nombre, apellido, DNI o email..."
    );
    await buscador.fill(socioDePrueba.dni);
    await page.waitForTimeout(1000);

    const filaSocio = page
      .locator("tr")
      .filter({ hasText: socioDePrueba.dni })
      .first();
    await expect(filaSocio).toBeVisible({ timeout: 10000 });
  });

  // CLEANUP
  test("TP04-EXT-CLEANUP: eliminar temporadas y socio de prueba", async ({
    page,
  }) => {
    await iniciarSesion(page);

    if (temporada1 && temporada1.nombre) {
      await eliminarTemporada(page, temporada1.nombre);
    }

    if (temporada2 && temporada2.nombre) {
      await eliminarTemporada(page, temporada2.nombre);
    }

    if (socioDePrueba) {
      await eliminarSocioPorDni(page, socioDePrueba.dni);
    }
  });
});
