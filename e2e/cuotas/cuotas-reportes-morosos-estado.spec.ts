import { readFile } from "node:fs/promises";

import { expect, test, type Locator, type Page } from "@playwright/test";

import { iniciarSesion } from "../helpers/auth";
import { seleccionarEnCombo } from "../helpers/select";

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

const crearPeriodoDesdeOffset = (offset: number) => {
  const fecha = new Date(hoy.getFullYear(), hoy.getMonth() + offset, 1);
  const mesNumero = String(fecha.getMonth() + 1).padStart(2, "0");

  return {
    fecha,
    mesNumero,
    mesNombre: MESES[fecha.getMonth()],
    anio: String(fecha.getFullYear()),
    periodo: `${fecha.getFullYear()}-${mesNumero}`,
  };
};

const periodosBase = [-4, -3, -2, -1].map(crearPeriodoDesdeOffset);
const conteoPorAnio = periodosBase.reduce<Record<string, number>>((acc, periodo) => {
  acc[periodo.anio] = (acc[periodo.anio] ?? 0) + 1;
  return acc;
}, {});
const anioReferencia = Object.entries(conteoPorAnio).sort((a, b) => b[1] - a[1])[0]?.[0] ?? periodosBase[0].anio;
const periodosMismoAnio = periodosBase
  .filter((periodo) => periodo.anio === anioReferencia)
  .sort((a, b) => a.periodo.localeCompare(b.periodo));
const periodoPagado = periodosMismoAnio[periodosMismoAnio.length - 1] ?? periodosBase[periodosBase.length - 1];
const periodosImpagos = periodosBase.filter((periodo) => periodo.periodo !== periodoPagado.periodo);
const periodoImpagoMismoAnio =
  periodosMismoAnio.find((periodo) => periodo.periodo !== periodoPagado.periodo) ?? periodosImpagos[0];

const sufijo = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
const dniTest = sufijo.slice(-8);
const nombreTest = `RepMor${sufijo.slice(-4)}`;
const apellidoTest = `Estado${sufijo.slice(-4)}`;

const seleccionarOpcionPorLabel = async (
  page: Page,
  scope: Page | Locator,
  label: string,
  opcion: string,
) => {
  const trigger = scope
    .locator(`label:has-text("${label}")`)
    .first()
    .locator("xpath=..")
    .locator("button")
    .first();

  await trigger.click();
  await page.getByRole("option", { name: opcion }).first().click();
};

const seleccionarPrimerMetodoPago = async (
  page: Page,
  scope: Page | Locator,
  label: string,
) => {
  const trigger = scope
    .locator(`label:has-text("${label}")`)
    .first()
    .locator("xpath=..")
    .locator("button")
    .first();

  await trigger.click();

  const opciones = (await page.getByRole("option").allTextContents())
    .map((texto) => texto.trim())
    .filter(Boolean)
    .filter((texto) => !/no hay m[ée]todos/i.test(texto));

  expect(opciones.length).toBeGreaterThan(0);
  await page.getByRole("option", { name: opciones[0] }).first().click();
};

const crearSocioDePrueba = async (page: Page) => {
  await page.goto("/socios/crear");

  await page.locator("#dni").fill(dniTest);
  await page.locator("#nombre").fill(nombreTest);
  await page.locator("#apellido").fill(apellidoTest);
  await page.locator("#fechaNacimiento").fill("1991-04-20");
  await page.locator("#direccion").fill("Calle Reportes 321");
  await page.locator("#email").fill(`reportes.${sufijo.slice(-6)}@test.local`);

  await page.getByRole("button", { name: /^Crear$/ }).click();
  await expect(page).toHaveURL(/\/socios$/, { timeout: 15000 });
};

const generarCuotaSinTarjeta = async (
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

  await page.getByRole("tab", { name: /sin tarjeta del centro/i }).click();
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

const pagarCuotaDelPeriodo = async (
  page: Page,
  periodo: { mesNombre: string; anio: string },
) => {
  await page.goto("/cobros/pagos");

  await page.getByRole("tab", { name: /sin tarjeta del centro/i }).click();
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

  await fila.locator("input[type='checkbox']").first().check();
  await seleccionarPrimerMetodoPago(page, page, "Método de pago");
  await page.getByRole("button", { name: /registrar seleccionadas como pagadas/i }).click();

  await expect(
    page.getByText(/(pago|pagos|cuotas) registrad[oa]s? exitosamente/i),
  ).toBeVisible({ timeout: 15000 });
};

const obtenerCeldaMes = (fila: Locator, mesNumero: string) =>
  fila.locator("td").nth(Number(mesNumero) + 1);

test.describe.serial("Cuotas: reportes, morosos y estado anual", () => {
  test("SETUP: crear socio, generar 4 cuotas y pagar 1 para dejar 3 pendientes", async ({
    page,
  }) => {
    await iniciarSesion(page);
    await crearSocioDePrueba(page);

    for (const periodo of periodosBase) {
      await generarCuotaSinTarjeta(page, periodo);
    }

    await pagarCuotaDelPeriodo(page, periodoPagado);
  });

  test("REP-01: consultar reporte por mes especifico con datos", async ({ page }) => {
    await iniciarSesion(page);
    await page.goto("/cobros/reportes");

    await seleccionarEnCombo(page, "Mes", periodoPagado.mesNombre);
    await seleccionarEnCombo(page, "Año", periodoPagado.anio);
    await page.getByRole("button", { name: /^Buscar$/ }).click();

    await expect(page.getByText(/cargando reporte/i))
      .not.toBeVisible({ timeout: 20000 })
      .catch(() => {});

    await expect(page.getByText(/total generado/i).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/total cobrado/i).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/cuotas pagadas/i).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/sin datos para el periodo/i)).toHaveCount(0);
  });

  test("REP-02: consultar reporte por rango de meses con los periodos generados", async ({
    page,
  }) => {
    await iniciarSesion(page);
    await page.goto("/cobros/reportes");

    await page.getByRole("tab", { name: /rango de meses/i }).click();

    const desde = page.locator('label:has-text("Desde")').first().locator("xpath=..");
    const hasta = page.locator('label:has-text("Hasta")').first().locator("xpath=..");

    await desde.locator("button").nth(0).click();
    await page.getByRole("option", { name: periodosBase[0].mesNombre }).click();
    await desde.locator("button").nth(1).click();
    await page.getByRole("option", { name: periodosBase[0].anio }).click();

    await hasta.locator("button").nth(0).click();
    await page.getByRole("option", { name: periodosBase[periodosBase.length - 1].mesNombre }).click();
    await hasta.locator("button").nth(1).click();
    await page.getByRole("option", { name: periodosBase[periodosBase.length - 1].anio }).click();

    await page.getByRole("button", { name: /^Buscar$/ }).click();

    await expect(page.getByText(/cargando reporte/i))
      .not.toBeVisible({ timeout: 20000 })
      .catch(() => {});

    await expect(page.getByText(/resumen consolidado/i).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/cuotas pendientes/i).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/% morosidad/i).first()).toBeVisible({ timeout: 10000 });
  });

  test("MOR-01: verificar socio moroso con 3 cuotas pendientes", async ({ page }) => {
    await iniciarSesion(page);
    await page.goto("/cobros/morosos");

    await expect(page.getByText(/cargando morosos/i))
      .not.toBeVisible({ timeout: 20000 })
      .catch(() => {});

    await expect(page.getByText(/total morosos/i)).toBeVisible({ timeout: 10000 });

    const buscador = page.getByPlaceholder(/buscar por nombre, apellido o dni/i);
    await buscador.fill(dniTest);
    await page.waitForTimeout(1500);

    await expect(page.getByText(new RegExp(apellidoTest, "i")).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/3 meses/i).first()).toBeVisible({ timeout: 10000 });
  });

  test("MOR-02: filtrar severidad de 3 meses y mantener el socio visible", async ({ page }) => {
    await iniciarSesion(page);
    await page.goto("/cobros/morosos");

    await expect(page.getByText(/cargando morosos/i))
      .not.toBeVisible({ timeout: 20000 })
      .catch(() => {});

    await page.getByPlaceholder(/buscar por nombre, apellido o dni/i).fill(dniTest);
    await page.waitForTimeout(1000);

    const triggerSeveridad = page.locator('button:has-text("Todos los morosos")').first();
    await triggerSeveridad.click();
    await page.getByRole("option", { name: "3 meses" }).click();

    await expect(page.getByText(new RegExp(apellidoTest, "i")).first()).toBeVisible({ timeout: 10000 });
  });

  test("EST-01: validar en la grilla anual el mes pagado y uno pendiente", async ({ page }) => {
    await iniciarSesion(page);
    await page.goto("/cobros/estado-pagos");

    await expect(page.getByText(/cargando estado de pagos/i))
      .not.toBeVisible({ timeout: 20000 })
      .catch(() => {});

    const inputAnio = page.locator("#anio");
    await inputAnio.fill(anioReferencia);

    const buscador = page.locator("#busqueda");
    await buscador.fill(dniTest);
    await page.getByRole("button", { name: "Aplicar" }).click();
    await page.waitForTimeout(2000);

    const fila = page.locator("tbody tr:visible").filter({ hasText: apellidoTest }).first();
    await expect(fila).toBeVisible({ timeout: 10000 });

    await expect(obtenerCeldaMes(fila, periodoPagado.mesNumero)).toContainText("✓");
    await expect(obtenerCeldaMes(fila, periodoImpagoMismoAnio.mesNumero)).toContainText(/✗|✕/);
  });

  test("EST-02: exportar CSV filtrado y verificar que contiene el socio", async ({ page }) => {
    await iniciarSesion(page);
    await page.goto("/cobros/estado-pagos");

    await expect(page.getByText(/cargando estado de pagos/i))
      .not.toBeVisible({ timeout: 20000 })
      .catch(() => {});

    await page.locator("#anio").fill(anioReferencia);
    await page.locator("#busqueda").fill(dniTest);
    await page.getByRole("button", { name: "Aplicar" }).click();
    await page.waitForTimeout(2000);

    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: /exportar excel/i }).click(),
    ]);

    expect(download.suggestedFilename()).toBe(`estado-pagos-${anioReferencia}.csv`);

    const rutaDescarga = await download.path();
    expect(rutaDescarga).toBeTruthy();

    const contenido = await readFile(rutaDescarga as string, "utf-8");
    expect(contenido).toContain(dniTest);
    expect(contenido).toContain(apellidoTest);
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
