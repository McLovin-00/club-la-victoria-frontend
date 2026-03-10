import { expect, test } from "@playwright/test";

import { cerrarSesion, iniciarSesion } from "./helpers/auth";

const generarSufijoUnico = (): string =>
  `${Date.now()}${Math.floor(Math.random() * 1000)}`;

const generarDniValido = (): string => generarSufijoUnico().slice(-8);

const obtenerRangoTemporada = (): { fechaInicio: string; fechaFin: string } => {
  const anio = new Date().getFullYear() + 1;
  return {
    fechaInicio: `${anio}-01-01`,
    fechaFin: `${anio}-12-31`,
  };
};

test.describe("Flujos E2E web criticos", () => {
  test("F01/F02/F41: login, rutas protegidas, logout y sesion invalida", async ({
    page,
  }) => {
    await page.goto("/socios");
    await expect(page).toHaveURL(/\/login$/);

    await iniciarSesion(page);

    await page.goto("/login");
    await expect(page).toHaveURL(/\/$|\/socios$/);

    await cerrarSesion(page);

    await page.goto("/socios");
    await expect(page).toHaveURL(/\/login$/);

    await page.evaluate(() => {
      localStorage.setItem("authToken", "token-invalido");
    });

    await page.goto("/socios");
    await expect(page).toHaveURL(/\/login$/);
  });

  test("F04/F05/F08: crear, buscar y eliminar socio", async ({ page }) => {
    const sufijo = generarSufijoUnico();
    const dni = generarDniValido();
    const nombre = `E2E${sufijo}`;
    const apellido = `Prueba${sufijo}`;

    await iniciarSesion(page);
    await page.goto("/socios/crear");

    await page.locator("#dni").fill(dni);
    await page.locator("#nombre").fill(nombre);
    await page.locator("#apellido").fill(apellido);
    await page.locator("#fechaNacimiento").fill("1990-01-01");
    await page.locator("#direccion").fill("Calle E2E 123");
    await page.locator("#email").fill(`e2e.${sufijo}@test.local`);

    await page.getByRole("button", { name: /^Crear$/ }).click();
    await expect(page).toHaveURL(/\/socios$/);

    const buscador = page.getByPlaceholder(
      "Buscar por nombre, apellido, DNI o email...",
    );
    await buscador.fill(dni);

    const filaSocio = page.locator("tr").filter({ hasText: dni }).first();
    await expect(filaSocio).toBeVisible();

    await filaSocio.getByRole("button", { name: /Eliminar socio/i }).click();

    const dialogoEliminar = page.getByRole("alertdialog");
    await expect(dialogoEliminar).toBeVisible();
    await dialogoEliminar.getByRole("button", { name: /^Eliminar$/ }).click();

    await expect(page.locator("tr").filter({ hasText: dni })).toHaveCount(0);
  });

  test("F12/F13: crear y eliminar temporada", async ({ page }) => {
    const sufijo = generarSufijoUnico();
    const nombreTemporada = `Temporada E2E ${sufijo}`;
    const { fechaInicio, fechaFin } = obtenerRangoTemporada();

    await iniciarSesion(page);
    await page.goto("/temporadas");

    await page.getByRole("button", { name: /Crear Temporada/i }).click();

    const dialogoCrear = page.getByRole("dialog");
    await expect(dialogoCrear).toBeVisible();
    await dialogoCrear.locator("#nombre").fill(nombreTemporada);
    await dialogoCrear.locator("#fechaInicio").fill(fechaInicio);
    await dialogoCrear.locator("#fechaFin").fill(fechaFin);
    await dialogoCrear.locator("#descripcion").fill("Temporada creada por E2E");
    await dialogoCrear.getByRole("button", { name: /Crear Temporada/i }).click();

    const cardTemporada = page
      .locator('div[data-slot="card"]')
      .filter({
        has: page.locator('div[data-slot="card-title"]', {
          hasText: nombreTemporada,
        }),
      })
      .first();

    await expect(cardTemporada).toBeVisible();
    await cardTemporada.locator("button").nth(1).click();

    const dialogoEliminar = page.getByRole("alertdialog");
    await expect(dialogoEliminar).toBeVisible();

    const confirmacionReforzada = dialogoEliminar.getByPlaceholder(
      'Escribe "borrar" para confirmar',
    );

    if ((await confirmacionReforzada.count()) > 0) {
      await confirmacionReforzada.fill("borrar");
    }

    await dialogoEliminar.getByRole("button", { name: /^Eliminar$/ }).click();
    await expect(cardTemporada).toHaveCount(0);
  });

  test("F26: abrir notificaciones y validar contenido", async ({ page }) => {
    await iniciarSesion(page);

    const botonNotificaciones = page
      .locator("header button")
      .filter({ has: page.locator("svg.lucide-bell") })
      .first();

    await botonNotificaciones.click();
    await expect(
      page.getByRole("heading", {
        name: /^Notificaciones$/,
      }),
    ).toBeVisible();

    const estadoVacio = page.getByText("No hay notificaciones");
    const primeraNotificacion = page.locator("div.divide-y > button").first();

    await expect(estadoVacio.or(primeraNotificacion)).toBeVisible();
  });
});
