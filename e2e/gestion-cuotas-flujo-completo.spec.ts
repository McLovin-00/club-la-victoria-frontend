import { expect, test, type Page } from "@playwright/test";

const usuarioAdmin = process.env.E2E_USER ?? "admin";
const passwordAdmin = process.env.E2E_PASS ?? "admin";

const seleccionarEnCombo = async (page: Page, label: string, opcion: string) => {
  const trigger = page
    .locator(`label:has-text("${label}")`)
    .first()
    .locator("xpath=..")
    .locator("button")
    .first();

  await trigger.click();
  await page.getByRole("option", { name: opcion }).first().click();
};

test("flujo completo de gestion de cuotas y pagos masivos por barcode", async ({ page }) => {
  const anio = String(new Date().getFullYear() + 1);
  const mesNombre = "Enero";

  await page.goto("/login");
  await page.locator('input[autocomplete="username"]').fill(usuarioAdmin);
  await page.locator('input[autocomplete="current-password"]').fill(passwordAdmin);
  const loginRequest = page.waitForResponse(
    (response) =>
      response.url().includes("/auth/login") &&
      (response.status() === 200 || response.status() === 201),
  );
  await page.getByRole("button", { name: /Iniciar sesion/i }).click();
  await loginRequest;
  await expect(page).toHaveURL(/\/socios|\/$/);

  await page.goto("/cobros/generar");
  await seleccionarEnCombo(page, "Mes", mesNombre);
  await seleccionarEnCombo(page, "Año", anio);

  await expect(page.getByText(/socios sin cuota/i).first()).toBeVisible();
  await page.getByRole("button", { name: /^Seleccionar todos/i }).click();

  await page.getByRole("button", { name: /^Generar \d+ Cuotas$/ }).click();
  await expect(page.getByText("Cuotas generadas")).toBeVisible();

  await page.goto("/cobros/pagos");
  await seleccionarEnCombo(page, "Mes", mesNombre);
  await seleccionarEnCombo(page, "Año", anio);

  const celdasBarcode = page.locator("table tbody tr td.font-mono");
  await expect(celdasBarcode.first()).toBeVisible();

  const barcodes = (await celdasBarcode.allTextContents())
    .map((valor) => valor.trim())
    .filter((valor) => /^\d{2}-\d{4}-\d+$/.test(valor));

  expect(barcodes.length).toBeGreaterThanOrEqual(3);

  const barcodeYaPagado = barcodes[0];
  const barcodesPendientes = barcodes.slice(1, Math.min(barcodes.length, 6));

  await page.locator("#barcode").fill(barcodeYaPagado);
  await page.getByRole("button", { name: /^Registrar Pago$/ }).click();
  await expect(page.getByText("Pago registrado exitosamente")).toBeVisible();

  const codigosIncorrectos = ["12-2099-990001", "12-2099-990002", "12-2099-990003"];
  const codigosEscaneo = [...barcodesPendientes, ...codigosIncorrectos, barcodeYaPagado];

  await page.getByRole("button", { name: /Esc[áa]ner Masivo/i }).click();
  const modal = page.getByRole("dialog");
  const inputScanner = modal.locator("#scanner-input");

  for (const codigo of codigosEscaneo) {
    await inputScanner.fill(codigo);
    await inputScanner.press("Enter");
  }

  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: /Esc[áa]ner Masivo/i }).click();

  for (const codigo of codigosEscaneo) {
    await expect(modal.getByText(codigo)).toBeVisible();
  }

  await modal.getByRole("button", { name: /^Procesar \d+ pagos?$/ }).click();

  await expect(
    page.getByText(`${barcodesPendientes.length} pagos registrados exitosamente`),
  ).toBeVisible();

  for (const codigoIncorrecto of codigosIncorrectos) {
    await expect(page.getByText(`${codigoIncorrecto}: cuota no encontrada`)).toBeVisible();
  }

  await expect(page.getByText(`${barcodeYaPagado}: cuota ya pagada`)).toBeVisible();
});
