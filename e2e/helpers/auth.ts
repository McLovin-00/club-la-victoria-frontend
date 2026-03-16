import { expect, type Page } from "@playwright/test";

const usuarioAdmin = process.env.E2E_USER ?? "admin";
const passwordAdmin = process.env.E2E_PASS ?? "admin";

export const iniciarSesion = async (page: Page): Promise<void> => {
  const maxIntentos = 3;

  for (let intento = 1; intento <= maxIntentos; intento += 1) {
    await page.goto("/login");
    await page.locator('input[autocomplete="username"]').fill(usuarioAdmin);
    await page.locator('input[autocomplete="current-password"]').fill(passwordAdmin);

    const loginAttempt = Promise.race([
      page
        .waitForResponse((response) => response.url().includes("/auth/login"), {
          timeout: 15000,
        })
        .then((response) => ({ kind: "response" as const, response })),
      page
        .waitForEvent("requestfailed", {
          timeout: 15000,
          predicate: (request) => request.url().includes("/auth/login"),
        })
        .then((request) => ({ kind: "requestfailed" as const, request })),
    ]);

    await page.getByRole("button", { name: /Iniciar sesion/i }).click();
    const loginResult = await loginAttempt;

    // Si la solicitud fallo a nivel de red, reintentar tras espera
    if (loginResult.kind === "requestfailed") {
      const detalle = loginResult.request.failure()?.errorText ?? "error desconocido";
      if (intento < maxIntentos) {
        // Esperar antes de reintentar (puede ser rate limit o transitorio)
        await page.waitForTimeout(10000);
        continue;
      }
      throw new Error(`La solicitud de login fallo antes de responder: ${detalle}`);
    }

    const estado = loginResult.response.status();
    if (estado === 200 || estado === 201) {
      await expect(page).toHaveURL(/\/socios|\/$/);
      return;
    }

    if (estado === 429 && intento < maxIntentos) {
      await page.waitForTimeout(65000);
      continue;
    }

    throw new Error(
      `Login respondio con estado no esperado: ${estado} (${loginResult.response.statusText()})`,
    );
  }

  throw new Error("No se pudo iniciar sesion tras los reintentos configurados.");
};

export const cerrarSesion = async (page: Page): Promise<void> => {
  // Buscar boton de cerrar sesion (puede ser texto completo o icono)
  const botonCerrar = page.getByRole("button", { name: /Cerrar/i });
  await botonCerrar.click();
  await expect(page).toHaveURL(/\/login$/);
};
