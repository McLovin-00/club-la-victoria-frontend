import { expect, test } from "@playwright/test";

import { iniciarSesion } from "./helpers/auth";
import { seleccionarEnCombo } from "./helpers/select";

test("flujo completo de gestion de cuotas y pagos masivos", async ({ page }) => {
  const anio = String(new Date().getFullYear() + 1);
  const mesNombre = "Enero";

  await iniciarSesion(page);

  await page.goto("/cobros/generar");
  await seleccionarEnCombo(page, "Mes", mesNombre);
  await seleccionarEnCombo(page, "Año", anio);

  await expect(page.getByText(/socios sin cuota/i).first()).toBeVisible();

  const botonSeleccionarTodos = page.getByRole("button", {
    name: /^Seleccionar todos/i,
  });

  if ((await botonSeleccionarTodos.count()) > 0) {
    await botonSeleccionarTodos.click();
    await page.getByRole("button", { name: /^Generar \d+ Cuotas$/ }).click();
    await expect(page.getByText("Cuotas generadas")).toBeVisible();
  }

  await page.goto("/cobros/pagos");
  await seleccionarEnCombo(page, "Mes", mesNombre);
  await seleccionarEnCombo(page, "Año", anio);

  const filasCuotas = page.locator("table tbody tr");
  await expect(filasCuotas.first()).toBeVisible();

  const checkboxesFilas = page.locator("table tbody tr td input[type='checkbox']");
  const cantidadSeleccion = Math.min(await checkboxesFilas.count(), 3);

  expect(cantidadSeleccion).toBeGreaterThan(0);

  for (let indice = 0; indice < cantidadSeleccion; indice += 1) {
    await checkboxesFilas.nth(indice).check();
  }

  await expect(page.getByText(new RegExp(`${cantidadSeleccion} cuotas seleccionadas`, "i"))).toBeVisible();

  const botonRegistrarSeleccionadas = page.getByRole("button", {
    name: /^Registrar seleccionadas como pagadas$/i,
  });
  await expect(botonRegistrarSeleccionadas).toBeEnabled();
  await botonRegistrarSeleccionadas.click();

  const dialogoConfirmacion = page.getByRole("dialog");
  if ((await dialogoConfirmacion.count()) > 0) {
    const botonConfirmar = dialogoConfirmacion
      .getByRole("button")
      .filter({ hasText: /confirmar|registrar|procesar/i })
      .first();

    if ((await botonConfirmar.count()) > 0) {
      await botonConfirmar.click();
    }
  }

  await expect(page.getByText(/(pagos|cuotas) registrad[oa]s? exitosamente/i)).toBeVisible();
  await expect(page.getByText(/0 cuotas seleccionadas/i)).toBeVisible();
});
