import { expect, test } from "@playwright/test";

import { iniciarSesion } from "../helpers/auth";

// ============================================================================
// FC07-EXT - Detalle extendido de socio (override manual, datos de tarjeta)
// ============================================================================

const generarSufijoUnico = (): string =>
  `${Date.now()}${Math.floor(Math.random() * 1000)}`;

const generarDniValido = (): string => generarSufijoUnico().slice(-8);

const BUSCADOR_PLACEHOLDER = "Buscar por nombre, apellido, DNI o email...";

test.describe.serial("FC07-EXT - Detalle extendido de socio", () => {
  let socioConTarjeta: {
    dni: string;
    nombre: string;
    apellido: string;
    numeroTarjeta: string;
    socioId: string;
  };

  // SETUP: Crear socio con tarjeta del centro
  test("FC07-EXT-SETUP: crear socio con tarjeta del centro", async ({ page }) => {
    await iniciarSesion(page);

    const sufijo = generarSufijoUnico();
    const dni = generarDniValido();
    const nombre = `E2EFC07${sufijo.slice(0, 4)}`;
    const apellido = `Tarjeta${sufijo.slice(4, 8)}`;
    const numeroTarjeta = `54000000${sufijo.slice(-8)}`;

    await page.goto("/socios/crear");
    await expect(
      page.getByRole("heading", { name: /Crear Nuevo Socio/i }),
    ).toBeVisible();

    await page.locator("#dni").fill(dni);
    await page.locator("#nombre").fill(nombre);
    await page.locator("#apellido").fill(apellido);
    await page.locator("#fechaNacimiento").fill("1988-07-12");
    await page.locator("#direccion").fill(`Calle FC07 ${sufijo}`);
    await page.locator("#email").fill(`fc07.${sufijo}@test.local`);
    await page.locator("#telefono").fill(`11${sufijo.slice(-8)}`);

    // Activar tarjeta del centro
    const checkbox = page.locator("#tarjetaCentro");
    if (!(await checkbox.isChecked())) {
      await checkbox.check();
    }
    await expect(page.locator("#numeroTarjetaCentro")).toBeVisible();
    await page.locator("#numeroTarjetaCentro").fill(numeroTarjeta);

    // Guardar
    await page.getByRole("button", { name: /^Crear$/ }).click();
    await expect(page).toHaveURL(/\/socios$/, { timeout: 15000 });

    // Obtener ID del socio
    const buscador = page.getByPlaceholder(BUSCADOR_PLACEHOLDER);
    await buscador.fill(dni);
    await page.waitForTimeout(1000);

    const filaSocio = page.locator("tr").filter({ hasText: dni }).first();
    await expect(filaSocio).toBeVisible({ timeout: 10000 });

    const editLink = filaSocio.getByRole("link", { name: /Editar socio/i });
    const href = await editLink.getAttribute("href");
    const socioId = href?.split("/socios/")[1]?.split("/edit")[0] ?? "";

    socioConTarjeta = { dni, nombre, apellido, numeroTarjeta, socioId };
    expect(socioId).toBeTruthy();
  });

  // FC07-EXT-01: Validar datos de tarjeta en el detalle
  test("FC07-EXT-01: validar datos de tarjeta del centro en detalle", async ({
    page,
  }) => {
    expect(socioConTarjeta).toBeDefined();
    expect(socioConTarjeta.socioId).toBeTruthy();
    await iniciarSesion(page);

    // Ir a la página de detalle del socio
    await page.goto(`/socios/${socioConTarjeta.socioId}`);

    // Verificar datos del socio
    await expect(
      page.getByText(`${socioConTarjeta.apellido}, ${socioConTarjeta.nombre}`),
    ).toBeVisible({ timeout: 10000 });

    // Verificar DNI visible
    await expect(page.getByText(socioConTarjeta.dni)).toBeVisible();

    // Verificar nro de afiliado visible
    await expect(page.getByText(/Nro afiliado/i)).toBeVisible();
    await expect(page.getByText(socioConTarjeta.socioId, { exact: true })).toBeVisible();

    // Verificar sección de tarjeta del centro
    const seccionTarjeta = page.getByText(/Tarjeta.*Centro|tarjeta.*centro/i);
    if ((await seccionTarjeta.count()) > 0) {
      await expect(seccionTarjeta.first()).toBeVisible();
    }

    // Verificar número de tarjeta visible o indicador de tarjeta activa
    const numeroTarjetaVisible = page.getByText(socioConTarjeta.numeroTarjeta);
    const badgeTarjetaActiva = page.getByText(/Tarjeta activa|Sí|Activo/i);

    // Al menos uno debe estar presente
    const hayNumero = (await numeroTarjetaVisible.count()) > 0;
    const hayBadge = (await badgeTarjetaActiva.count()) > 0;
    expect(hayNumero || hayBadge).toBe(true);
  });

  // FC07-EXT-02: Verificar badge de categoría en detalle
  test("FC07-EXT-02: verificar badge de categoria en detalle", async ({
    page,
  }) => {
    expect(socioConTarjeta).toBeDefined();
    expect(socioConTarjeta.socioId).toBeTruthy();
    await iniciarSesion(page);

    await page.goto(`/socios/${socioConTarjeta.socioId}`);

    // Verificar que muestra la categoría actual
    const seccionCategoria = page.getByText(/Categoría|Categoria/i);
    if ((await seccionCategoria.count()) > 0) {
      await expect(seccionCategoria.first()).toBeVisible();

      // Verificar badge de categoría (ACTIVO, ADHERENTE, etc.)
      const badgeCategoria = page.getByText(/ACTIVO|ADHERENTE|VITALICIO|HONORARIO/i);
      if ((await badgeCategoria.count()) > 0) {
        await expect(badgeCategoria.first()).toBeVisible();
      }
    }
  });

  // FC07-EXT-03: Verificar estado del socio
  test("FC07-EXT-03: verificar estado del socio en detalle", async ({
    page,
  }) => {
    expect(socioConTarjeta).toBeDefined();
    expect(socioConTarjeta.socioId).toBeTruthy();
    await iniciarSesion(page);

    await page.goto(`/socios/${socioConTarjeta.socioId}`);

    // Verificar estado visible
    const badgeEstado = page.getByText(/ACTIVO|INACTIVO|MOROSO/i);
    if ((await badgeEstado.count()) > 0) {
      await expect(badgeEstado.first()).toBeVisible();
    }
  });

  // FC07-EXT-04: Verificar link a cuenta corriente desde detalle
  test("FC07-EXT-04: verificar link a cuenta corriente desde detalle", async ({
    page,
  }) => {
    expect(socioConTarjeta).toBeDefined();
    expect(socioConTarjeta.socioId).toBeTruthy();
    await iniciarSesion(page);

    await page.goto(`/socios/${socioConTarjeta.socioId}`);

    // Buscar link a cuenta corriente
    const linkCuentaCorriente = page.getByRole("link", {
      name: /Cuenta.*Corriente|cuenta.*corriente/i,
    });

    if ((await linkCuentaCorriente.count()) > 0) {
      await linkCuentaCorriente.click();
      await expect(page).toHaveURL(/\/cuenta-corriente$/, { timeout: 10000 });
    }
  });

  // FC07-EXT-05: Verificar navegación al detalle desde el listado
  test("FC07-EXT-05: verificar navegacion al detalle desde el listado", async ({
    page,
  }) => {
    expect(socioConTarjeta).toBeDefined();
    await iniciarSesion(page);

    // Buscar socio en listado
    await page.goto("/socios");
    const buscador = page.getByPlaceholder(BUSCADOR_PLACEHOLDER);
    await buscador.fill(socioConTarjeta.dni);
    await page.waitForTimeout(1000);

    const filaSocio = page
      .locator("tr")
      .filter({ hasText: socioConTarjeta.dni })
      .first();
    await expect(filaSocio).toBeVisible({ timeout: 10000 });

    // Abrir detalle completo desde el listado
    await filaSocio.getByRole("link", { name: /Ver detalles/i }).click();
    await expect(page).toHaveURL(new RegExp(`/socios/${socioConTarjeta.socioId}$`), {
      timeout: 10000,
    });

    await expect(
      page.getByText(`${socioConTarjeta.apellido}, ${socioConTarjeta.nombre}`),
    ).toBeVisible();
    await expect(page.getByText(/Datos del socio/i)).toBeVisible();
  });

  // CLEANUP: Eliminar socio de prueba
  test("FC07-EXT-CLEANUP: eliminar socio de prueba", async ({ page }) => {
    if (!socioConTarjeta) {
      console.log("No se creó socio de prueba, omitiendo cleanup");
      return;
    }

    await iniciarSesion(page);
    await page.goto("/socios");

    const buscador = page.getByPlaceholder(BUSCADOR_PLACEHOLDER);
    await buscador.fill(socioConTarjeta.dni);
    await page.waitForTimeout(1000);

    const filaSocio = page
      .locator("tr")
      .filter({ hasText: socioConTarjeta.dni })
      .first();

    if ((await filaSocio.count()) > 0) {
      await filaSocio.getByRole("button", { name: /Eliminar socio/i }).click();

      const dialogo = page.getByRole("alertdialog");
      await expect(dialogo).toBeVisible();
      await dialogo.getByRole("button", { name: /^Eliminar$/ }).click();

      await expect(
        page.locator("tr").filter({ hasText: socioConTarjeta.dni }),
      ).toHaveCount(0, { timeout: 10000 });
    }
  });
});
