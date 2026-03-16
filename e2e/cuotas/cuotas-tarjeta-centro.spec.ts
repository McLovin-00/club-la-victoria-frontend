import { expect, test, type Page } from "@playwright/test";

import { iniciarSesion } from "../helpers/auth";
import { seleccionarEnCombo } from "../helpers/select";

const apiBaseUrl = process.env.E2E_API_URL ?? "http://127.0.0.1:3001/api/v1";

const MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const hoy = new Date();

const crearPeriodoFuturo = (offset: number) => {
  const fecha = new Date(hoy.getFullYear(), hoy.getMonth() + offset, 1);
  const mesNumero = String(fecha.getMonth() + 1).padStart(2, "0");

  return {
    mesNumero,
    mesNombre: MESES[fecha.getMonth()],
    anio: String(fecha.getFullYear()),
    periodo: `${fecha.getFullYear()}-${mesNumero}`,
  };
};

const periodoAprobacion = crearPeriodoFuturo(1);
const periodoRechazo = crearPeriodoFuturo(2);

const sufijo = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
const dniTest = sufijo.slice(-8);
const nombreTest = `Tarj${sufijo.slice(-4)}`;
const apellidoTest = `Centro${sufijo.slice(-4)}`;
const numeroTarjeta = `54000000${sufijo.slice(-8)}`;

const crearSocioConTarjeta = async (page: Page): Promise<string> => {
  const token = await page.evaluate(() => window.localStorage.getItem("authToken"));
  expect(token).toBeTruthy();

  const response = await page.request.post(`${apiBaseUrl}/socios`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    multipart: {
      dni: dniTest,
      nombre: nombreTest,
      apellido: apellidoTest,
      fechaNacimiento: "1988-07-12",
      direccion: "Calle Tarjeta 456",
      email: `tarjeta.${sufijo.slice(-6)}@test.local`,
      telefono: `11${dniTest}`,
      genero: "MASCULINO",
      estado: "ACTIVO",
      tarjetaCentro: "true",
      numeroTarjetaCentro: numeroTarjeta,
    },
  });

  expect(response.ok()).toBeTruthy();
  const socioActualizado = (await response.json()) as {
    id: number;
    tarjetaCentro: boolean;
  };
  expect(socioActualizado.tarjetaCentro).toBeTruthy();

  return String(socioActualizado.id);
};

const generarCuotaConTarjeta = async (
  page: Page,
  periodo: { mesNombre: string; anio: string },
) => {
  await page.goto("/cobros/generar");

  await seleccionarEnCombo(page, "Mes", periodo.mesNombre);
  await seleccionarEnCombo(page, "Año", periodo.anio);

  await expect(page.getByText(/cargando socios/i))
    .not.toBeVisible({ timeout: 20000 })
    .catch(() => {});
  await page.waitForTimeout(1500);

  await page.getByRole("tab", { name: /con tarjeta del centro/i }).click();
  await page.getByPlaceholder(/buscar por nombre/i).fill(dniTest);

  await expect(page.getByText(new RegExp(apellidoTest, "i")).first()).toBeVisible({
    timeout: 10000,
  });

  await page.getByRole("button", { name: /^Seleccionar todos/i }).click();
  await page.getByRole("button", { name: /generar \d+ cuotas?/i }).click();

  await expect(
    page.getByText(/resultado de la generacion|cuotas generadas/i).first(),
  ).toBeVisible({ timeout: 30000 });
};

const procesarTarjeta = async (
  page: Page,
  periodo: { mesNombre: string; anio: string },
  accion: "aprobar" | "rechazar",
) => {
  await page.goto("/cobros/pagos");

  await page.getByRole("tab", { name: /con tarjeta del centro/i }).click();
  await seleccionarEnCombo(page, "Mes", periodo.mesNombre);
  await seleccionarEnCombo(page, "Año", periodo.anio);

  await expect(page.getByText(/cargando cuotas/i))
    .not.toBeVisible({ timeout: 20000 })
    .catch(() => {});
  await page.waitForTimeout(1500);

  const buscador = page.getByPlaceholder(/nombre, apellido o dni/i);
  await buscador.fill(dniTest);
  await buscador.press("Enter");
  await page.waitForTimeout(1500);

  const fila = page.locator("tr:visible").filter({ hasText: dniTest }).first();
  await expect(fila).toBeVisible({ timeout: 10000 });

  if (accion === "aprobar") {
    await fila.getByRole("button", { name: /^Aprobada$/i }).click();
  } else {
    await fila.getByRole("button", { name: /^Rechazada$/i }).click();
  }

  await expect(page.getByText(/resultados de tarjeta procesados/i)).toBeVisible({
    timeout: 15000,
  });
};

test.describe.serial("Cuotas: flujo tarjeta del centro", () => {
  let socioId = "";

  test("SETUP: crear socio con tarjeta del centro", async ({ page }) => {
    await iniciarSesion(page);
    socioId = await crearSocioConTarjeta(page);
    expect(socioId).toBeTruthy();
  });

  test("TAR-01: generar cuota para socio con tarjeta en periodo futuro", async ({ page }) => {
    expect(socioId).toBeTruthy();
    await iniciarSesion(page);

    await generarCuotaConTarjeta(page, periodoAprobacion);
    await expect(page.getByRole("button", { name: /descargar tarjeta centro/i })).toBeVisible({
      timeout: 10000,
    });
  });

  test("TAR-02: descargar archivo de tarjeta del centro", async ({ page }) => {
    expect(socioId).toBeTruthy();
    await iniciarSesion(page);
    await page.goto("/cobros/generar");

    await seleccionarEnCombo(page, "Mes", periodoAprobacion.mesNombre);
    await seleccionarEnCombo(page, "Año", periodoAprobacion.anio);
    await expect(page.getByText(/cargando socios/i))
      .not.toBeVisible({ timeout: 20000 })
      .catch(() => {});

    await expect(page.getByRole("button", { name: /descargar tarjeta centro/i })).toBeVisible({
      timeout: 10000,
    });

    const token = await page.evaluate(() => window.localStorage.getItem("authToken"));
    expect(token).toBeTruthy();

    const respuestaArchivo = await page.request.get(`${apiBaseUrl}/cobros/tarjeta-centro/archivo`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        periodo: periodoAprobacion.periodo,
      },
    });

    expect(respuestaArchivo.ok()).toBeTruthy();
    expect(respuestaArchivo.status()).toBe(200);
    expect(respuestaArchivo.headers()["content-disposition"] ?? "").toMatch(
      /attachment; filename="[^"]+\.23[a-z0-9]"/i,
    );
    const buffer = await respuestaArchivo.body();
    expect(buffer.byteLength).toBeGreaterThan(0);
  });

  test("TAR-03: aprobar resultado de tarjeta y verificar estado aprobado", async ({ page }) => {
    expect(socioId).toBeTruthy();
    await iniciarSesion(page);

    await procesarTarjeta(page, periodoAprobacion, "aprobar");

    await page.goto(`/socios/${socioId}/cuenta-corriente`);
    await expect(page.getByText(/^Cuenta Corriente$/).first()).toBeVisible({
      timeout: 10000,
    });

    await expect(page.getByText(periodoAprobacion.periodo).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/tarjeta aprobada/i).first()).toBeVisible({ timeout: 10000 });
  });

  test("TAR-04: generar otro periodo, rechazarlo y dejarlo disponible para pago manual", async ({
    page,
  }) => {
    expect(socioId).toBeTruthy();
    await iniciarSesion(page);

    await generarCuotaConTarjeta(page, periodoRechazo);
    await procesarTarjeta(page, periodoRechazo, "rechazar");

    await page.goto(`/socios/${socioId}/cuenta-corriente`);
    await expect(page.getByText(/^Cuenta Corriente$/).first()).toBeVisible({
      timeout: 10000,
    });

    await expect(page.getByText(periodoRechazo.periodo).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/tarjeta rechazada/i).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole("button", { name: /^Pagar$/ }).first()).toBeVisible({
      timeout: 10000,
    });
  });

  test("CLEANUP: eliminar socio de prueba", async ({ page }) => {
    await iniciarSesion(page);
    await page.goto("/socios");

    const buscador = page.getByPlaceholder("Buscar por nombre, apellido, DNI o email...");
    await buscador.fill(dniTest);
    await page.waitForTimeout(2000);

    const filaSocio = page.locator("tr").filter({ hasText: dniTest }).first();
    if ((await filaSocio.count()) > 0) {
      await filaSocio.getByRole("button", { name: /eliminar socio/i }).click();

      const dialogo = page.getByRole("alertdialog");
      await expect(dialogo).toBeVisible();
      await dialogo.getByRole("button", { name: /^Eliminar$/ }).click();

      const filasRestantes = page.locator("tr").filter({ hasText: dniTest });
      if ((await filasRestantes.count()) > 0) {
        await page.waitForTimeout(1000);
      }
    }
  });
});
