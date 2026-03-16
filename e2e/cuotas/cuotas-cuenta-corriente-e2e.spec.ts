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
const anioCuenta = String(hoy.getFullYear());
const mesesCuenta = hoy.getMonth() >= 3 ? [hoy.getMonth() - 3, hoy.getMonth() - 2, hoy.getMonth() - 1, hoy.getMonth()] : [0, 1, 2, 3];
const periodosCuenta = mesesCuenta.map((mesIndice) => ({
  mesNumero: String(mesIndice + 1).padStart(2, "0"),
  mesNombre: MESES[mesIndice],
  anio: anioCuenta,
  periodo: `${anioCuenta}-${String(mesIndice + 1).padStart(2, "0")}`,
}));

const sufijo = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
const dniTest = sufijo.slice(-8);
const nombreTest = `Cta${sufijo.slice(-4)}`;
const apellidoTest = `Corr${sufijo.slice(-4)}`;

const obtenerTriggerPorLabel = (scope: Page | Locator, label: string) =>
  scope
    .locator(`label:has-text("${label}")`)
    .first()
    .locator("xpath=..")
    .locator("button")
    .first();

const obtenerOpcionesSelect = async (
  page: Page,
  scope: Page | Locator,
  label: string,
) => {
  await obtenerTriggerPorLabel(scope, label).click();

  const opciones = (await page.getByRole("option").allTextContents())
    .map((texto) => texto.trim())
    .filter(Boolean)
    .filter((texto) => !/no hay m[ée]todos/i.test(texto));

  await page.keyboard.press("Escape");
  return opciones;
};

const seleccionarOpcionPorLabel = async (
  page: Page,
  scope: Page | Locator,
  label: string,
  opcion: string,
) => {
  await obtenerTriggerPorLabel(scope, label).click();
  await page.getByRole("option", { name: opcion }).first().click();
};

const crearSocioSinTarjeta = async (page: Page): Promise<string> => {
  await page.goto("/socios/crear");

  await page.locator("#dni").fill(dniTest);
  await page.locator("#nombre").fill(nombreTest);
  await page.locator("#apellido").fill(apellidoTest);
  await page.locator("#fechaNacimiento").fill("1989-09-18");
  await page.locator("#direccion").fill("Calle Cuenta Corriente 999");
  await page.locator("#email").fill(`cuentacorriente.${sufijo.slice(-6)}@test.local`);

  await page.getByRole("button", { name: /^Crear$/ }).click();
  await expect(page).toHaveURL(/\/socios$/, { timeout: 15000 });

  const buscador = page.getByPlaceholder("Buscar por nombre, apellido, DNI o email...");
  await buscador.fill(dniTest);
  await page.waitForTimeout(2000);

  const filaSocio = page.locator("tr").filter({ hasText: dniTest }).first();
  await expect(filaSocio).toBeVisible({ timeout: 10000 });

  const href = await filaSocio.getByRole("link", { name: /editar socio/i }).getAttribute("href");
  return href?.split("/socios/")[1]?.split("/edit")[0] ?? "";
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

const abrirCuentaCorriente = async (page: Page, socioId: string) => {
  await page.goto(`/socios/${socioId}/cuenta-corriente`);
  await expect(page.getByText(/^Cuenta Corriente$/).first()).toBeVisible({
    timeout: 10000,
  });
  await expect(page.getByText(/cargando cuenta corriente/i))
    .not.toBeVisible({ timeout: 20000 })
    .catch(() => {});
};

const checkboxCuota = (page: Page, periodo: string) =>
  page.locator(`input[aria-label="Seleccionar cuota ${periodo}"]:visible`).first();

test.describe.serial("Cuotas: cuenta corriente E2E", () => {
  let socioId = "";

  test("SETUP: crear socio y generar 4 cuotas para cuenta corriente", async ({ page }) => {
    await iniciarSesion(page);
    socioId = await crearSocioSinTarjeta(page);
    expect(socioId).toBeTruthy();

    for (const periodo of periodosCuenta) {
      await generarCuotaSinTarjeta(page, periodo);
    }
  });

  test("CTA-01: ver resumen y grilla anual del socio", async ({ page }) => {
    expect(socioId).toBeTruthy();
    await iniciarSesion(page);
    await abrirCuentaCorriente(page, socioId);

    await expect(page.getByText(/total pagado/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/deuda total/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/meses adeudados/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(new RegExp(dniTest))).toBeVisible({ timeout: 10000 });

    await seleccionarEnCombo(page, "Año:", anioCuenta);
    await expect(page.getByText(/^Estado de pagos$/).last()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(periodosCuenta[0].periodo).first()).toBeVisible({ timeout: 10000 });
  });

  test("CTA-02: registrar pago individual de una cuota", async ({ page }) => {
    expect(socioId).toBeTruthy();
    await iniciarSesion(page);
    await abrirCuentaCorriente(page, socioId);

    const periodoIndividual = periodosCuenta[0];
    const filaPeriodo = page.locator("tr:visible").filter({ hasText: periodoIndividual.periodo }).first();
    await expect(filaPeriodo).toBeVisible({ timeout: 10000 });
    await filaPeriodo.getByRole("button", { name: /^Pagar$/ }).click();

    const dialogo = page.getByRole("dialog");
    await expect(dialogo.getByText(/^Registrar pago$/)).toBeVisible({ timeout: 10000 });

    const opciones = await obtenerOpcionesSelect(page, dialogo, "Método de pago");
    expect(opciones.length).toBeGreaterThan(0);
    await seleccionarOpcionPorLabel(page, dialogo, "Método de pago", opciones[0]);
    await dialogo.getByRole("button", { name: /confirmar pago/i }).click();

    await expect(page.getByText(/pago registrado exitosamente/i)).toBeVisible({ timeout: 15000 });
    await expect(checkboxCuota(page, periodoIndividual.periodo)).toHaveCount(0, { timeout: 10000 });
  });

  test("CTA-03: registrar pago masivo con un solo metodo", async ({ page }) => {
    expect(socioId).toBeTruthy();
    await iniciarSesion(page);
    await abrirCuentaCorriente(page, socioId);

    const periodoMasivoSimple = periodosCuenta[1];
    await checkboxCuota(page, periodoMasivoSimple.periodo).check();
    await expect(page.getByText(/seleccionadas: 1 de/i)).toBeVisible({ timeout: 10000 });

    await page.getByRole("button", { name: /^Registrar pago$/ }).click();

    const dialogo = page.getByRole("dialog");
    await expect(dialogo.getByText(/registrar pago de cuotas seleccionadas/i)).toBeVisible({
      timeout: 10000,
    });

    const opciones = await obtenerOpcionesSelect(page, dialogo, "Método principal");
    expect(opciones.length).toBeGreaterThan(0);
    await seleccionarOpcionPorLabel(page, dialogo, "Método principal", opciones[0]);
    await dialogo.getByRole("button", { name: /confirmar pago/i }).click();

    await expect(page.getByText(/pago masivo registrado/i)).toBeVisible({ timeout: 15000 });
    await expect(checkboxCuota(page, periodoMasivoSimple.periodo)).toHaveCount(0, {
      timeout: 10000,
    });
  });

  test("CTA-04: registrar pago masivo con dos metodos distintos", async ({ page }) => {
    expect(socioId).toBeTruthy();
    await iniciarSesion(page);
    await abrirCuentaCorriente(page, socioId);

    const [periodoDosMetodosA, periodoDosMetodosB] = [periodosCuenta[2], periodosCuenta[3]];
    await checkboxCuota(page, periodoDosMetodosA.periodo).check();
    await checkboxCuota(page, periodoDosMetodosB.periodo).check();
    await expect(page.getByText(/seleccionadas: 2 de/i)).toBeVisible({ timeout: 10000 });

    await page.getByRole("button", { name: /^Registrar pago$/ }).click();

    const dialogo = page.getByRole("dialog");
    await expect(dialogo.getByText(/registrar pago de cuotas seleccionadas/i)).toBeVisible({
      timeout: 10000,
    });

    const opciones = await obtenerOpcionesSelect(page, dialogo, "Método principal");
    expect(opciones.length).toBeGreaterThan(1);

    await seleccionarOpcionPorLabel(page, dialogo, "Método principal", opciones[0]);
    await dialogo.locator("#segundoMetodoModal").check();
    await seleccionarOpcionPorLabel(page, dialogo, "Método secundario", opciones[1]);

    const inputPrincipal = dialogo
      .locator('label:has-text("Importe método principal")')
      .first()
      .locator("xpath=..")
      .locator("input")
      .first();
    const inputSecundario = dialogo
      .locator('label:has-text("Importe método secundario")')
      .first()
      .locator("xpath=..")
      .locator("input")
      .first();

    const totalPrecargado = Number(await inputPrincipal.inputValue());
    expect(totalPrecargado).toBeGreaterThan(1);

    await inputPrincipal.fill(String(totalPrecargado - 1));
    await inputSecundario.fill("1");

    await expect(dialogo.getByText(/total validado/i)).toBeVisible({ timeout: 10000 });
    await dialogo.getByRole("button", { name: /confirmar pago/i }).click();

    await expect(page.getByText(/pago masivo registrado/i)).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/cuotas pendientes de pago/i)).toHaveCount(0);
  });

  test("CTA-05: verificar historial de cuotas y ausencia de pendientes", async ({ page }) => {
    expect(socioId).toBeTruthy();
    await iniciarSesion(page);
    await abrirCuentaCorriente(page, socioId);

    await expect(page.getByText(/cuotas pendientes de pago/i)).toHaveCount(0);
    await expect(page.getByText(/historial de cuotas/i)).toBeVisible({ timeout: 10000 });

    for (const periodo of periodosCuenta) {
      const filaHistorial = page.locator("tr:visible").filter({ hasText: periodo.periodo }).first();
      await expect(filaHistorial).toBeVisible({ timeout: 10000 });
    }

    await expect(page.getByText(/\d{1,2}\/\d{1,2}\/\d{4}/).first()).toBeVisible({
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
