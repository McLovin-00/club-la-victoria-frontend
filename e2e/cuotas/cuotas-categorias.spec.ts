import { expect, test, type Page } from "@playwright/test";

import { iniciarSesion } from "../helpers/auth";

const categoriaObjetivo = "ACTIVO";

const abrirEdicionCategoria = async (page: Page, nombreCategoria: string) => {
  const filaCategoria = page.getByRole("row", {
    name: new RegExp(nombreCategoria, "i"),
  });

  await filaCategoria.first().getByRole("button", { name: /editar monto/i }).click();
};

const leerMontoDesdeDialogo = async (page: Page): Promise<number> => {
  const dialogo = page.getByRole("dialog");
  await expect(dialogo).toBeVisible({ timeout: 10000 });
  const valor = await dialogo.locator("#monto").inputValue();
  return Number(valor);
};

const guardarMonto = async (page: Page, monto: string) => {
  const dialogo = page.getByRole("dialog");
  await expect(dialogo).toBeVisible({ timeout: 10000 });
  await dialogo.locator("#monto").fill(monto);
  await dialogo.getByRole("button", { name: /guardar cambios/i }).click();
  await expect(dialogo).not.toBeVisible({ timeout: 15000 });
};

test.describe.serial("Cuotas: categorias de socio", () => {
  let montoOriginal = 0;
  let montoActualizado = 0;

  test("SETUP: capturar monto original de la categoria ACTIVO", async ({ page }) => {
    await iniciarSesion(page);
    await page.goto("/cobros/categorias");

    await expect(page.getByText(/cargando categorias/i))
      .not.toBeVisible({ timeout: 20000 })
      .catch(() => {});

    await abrirEdicionCategoria(page, categoriaObjetivo);
    montoOriginal = await leerMontoDesdeDialogo(page);
    expect(montoOriginal).toBeGreaterThanOrEqual(0);

    const dialogo = page.getByRole("dialog");
    await dialogo.getByRole("button", { name: /cancelar/i }).click();
    await expect(dialogo).not.toBeVisible({ timeout: 10000 });
  });

  test("CAT-01: validar categorias base y estados exentos", async ({ page }) => {
    expect(montoOriginal).toBeGreaterThanOrEqual(0);
    await iniciarSesion(page);
    await page.goto("/cobros/categorias");

    await expect(page.getByText(/cargando categorias/i))
      .not.toBeVisible({ timeout: 20000 })
      .catch(() => {});

    await expect(page.getByText(/^ACTIVO$/).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/^ADHERENTE$/).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/^VITALICIO$/).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/^HONORARIO$/).first()).toBeVisible({ timeout: 10000 });

    await expect(page.getByText("Exento").first()).toBeVisible();
    await expect(page.getByText(/sin cargo/i).first()).toBeVisible();
  });

  test("CAT-02: editar y guardar el monto mensual de ACTIVO", async ({ page }) => {
    expect(montoOriginal).toBeGreaterThanOrEqual(0);
    await iniciarSesion(page);
    await page.goto("/cobros/categorias");

    await expect(page.getByText(/cargando categorias/i))
      .not.toBeVisible({ timeout: 20000 })
      .catch(() => {});

    montoActualizado = Number((montoOriginal + 111).toFixed(2));

    await abrirEdicionCategoria(page, categoriaObjetivo);
    await expect(page.getByRole("dialog").getByText(/editar monto mensual/i)).toBeVisible();
    await guardarMonto(page, montoActualizado.toFixed(2));

    await abrirEdicionCategoria(page, categoriaObjetivo);
    const montoPersistido = await leerMontoDesdeDialogo(page);
    expect(montoPersistido).toBe(montoActualizado);

    const dialogo = page.getByRole("dialog");
    await dialogo.getByRole("button", { name: /cancelar/i }).click();
    await expect(dialogo).not.toBeVisible({ timeout: 10000 });
  });

  test("CAT-03: verificar persistencia del cambio luego de recargar", async ({ page }) => {
    expect(montoActualizado).toBeGreaterThan(0);
    await iniciarSesion(page);
    await page.goto("/cobros/categorias");

    await expect(page.getByText(/cargando categorias/i))
      .not.toBeVisible({ timeout: 20000 })
      .catch(() => {});

    await page.reload();
    await expect(page.getByText(/cargando categorias/i))
      .not.toBeVisible({ timeout: 20000 })
      .catch(() => {});

    await abrirEdicionCategoria(page, categoriaObjetivo);
    const montoRecargado = await leerMontoDesdeDialogo(page);
    expect(montoRecargado).toBe(montoActualizado);

    const dialogo = page.getByRole("dialog");
    await dialogo.getByRole("button", { name: /cancelar/i }).click();
    await expect(dialogo).not.toBeVisible({ timeout: 10000 });
  });

  test("CLEANUP: restaurar monto original de ACTIVO", async ({ page }) => {
    expect(montoOriginal).toBeGreaterThanOrEqual(0);
    await iniciarSesion(page);
    await page.goto("/cobros/categorias");

    await expect(page.getByText(/cargando categorias/i))
      .not.toBeVisible({ timeout: 20000 })
      .catch(() => {});

    await abrirEdicionCategoria(page, categoriaObjetivo);
    await guardarMonto(page, montoOriginal.toFixed(2));

    await abrirEdicionCategoria(page, categoriaObjetivo);
    const montoRestaurado = await leerMontoDesdeDialogo(page);
    expect(montoRestaurado).toBe(montoOriginal);

    const dialogo = page.getByRole("dialog");
    await dialogo.getByRole("button", { name: /cancelar/i }).click();
    await expect(dialogo).not.toBeVisible({ timeout: 10000 });
  });
});
