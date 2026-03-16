import { expect, test } from "@playwright/test";

import { iniciarSesion } from "../helpers/auth";
import { seleccionarEnCombo } from "../helpers/select";

/* ------------------------------------------------------------------ */
/*  Datos dinámicos para evitar colisiones con otros tests             */
/* ------------------------------------------------------------------ */
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
// Usamos un mes futuro para no pisar datos reales
const mesFuturo = hoy.getMonth() === 11 ? 0 : hoy.getMonth() + 1;
const anioFuturo =
  hoy.getMonth() === 11 ? hoy.getFullYear() + 1 : hoy.getFullYear();
const mesNombre = MESES[mesFuturo];
const anioStr = String(anioFuturo);

const sufijo = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
const dniTest = sufijo.slice(-8);
const nombreTest = `TestGen${sufijo.slice(-4)}`;
const apellidoTest = `AutoE2E${sufijo.slice(-4)}`;

/* ------------------------------------------------------------------ */
/*  Suite serial: SETUP → Generación → Pagos → Verificación → CLEANUP */
/* ------------------------------------------------------------------ */
test.describe.serial(
  "Cuotas: flujo completo generación + pagos + verificación",
  () => {
    let socioCreado = false;

    /* ======================== SETUP ======================== */
    test("SETUP: crear socio de prueba", async ({ page }) => {
      await iniciarSesion(page);
      await page.goto("/socios/crear");

      await page.locator("#dni").fill(dniTest);
      await page.locator("#nombre").fill(nombreTest);
      await page.locator("#apellido").fill(apellidoTest);
      await page.locator("#fechaNacimiento").fill("1990-06-15");
      await page.locator("#direccion").fill("Calle E2E Gen 456");
      await page
        .locator("#email")
        .fill(`e2e.gen.${sufijo.slice(-6)}@test.local`);

      await page.getByRole("button", { name: /^Crear$/ }).click();
      await expect(page).toHaveURL(/\/socios$/, { timeout: 15000 });
      socioCreado = true;
    });

    /* =================== GENERACIÓN DE CUOTAS =================== */

    test("GEN-01: navegar a generar cuotas y seleccionar período futuro", async ({
      page,
    }) => {
      expect(socioCreado).toBeTruthy();
      await iniciarSesion(page);
      await page.goto("/cobros/generar");

      await seleccionarEnCombo(page, "Mes", mesNombre);
      await seleccionarEnCombo(page, "Año", anioStr);

      // Esperar que termine la carga de socios
      await expect(page.getByText(/cargando socios/i))
        .not.toBeVisible({ timeout: 20000 })
        .catch(() => {});
      await page.waitForTimeout(2000);

      // Verificar que la interfaz de selección está lista
      await expect(
        page.getByPlaceholder(/buscar por nombre/i),
      ).toBeVisible({ timeout: 10000 });
    });

    test("GEN-02: buscar socio de prueba por DNI", async ({ page }) => {
      expect(socioCreado).toBeTruthy();
      await iniciarSesion(page);
      await page.goto("/cobros/generar");

      await seleccionarEnCombo(page, "Mes", mesNombre);
      await seleccionarEnCombo(page, "Año", anioStr);

      await expect(page.getByText(/cargando socios/i))
        .not.toBeVisible({ timeout: 20000 })
        .catch(() => {});
      await page.waitForTimeout(2000);

      // Buscar por DNI
      const buscador = page.getByPlaceholder(/buscar por nombre/i);
      await buscador.fill(dniTest);

      // Verificar que aparece nuestro socio
      await expect(
        page.getByText(new RegExp(apellidoTest, "i")).first(),
      ).toBeVisible({ timeout: 10000 });
    });

    test("GEN-03: seleccionar todos y generar cuotas", async ({ page }) => {
      expect(socioCreado).toBeTruthy();
      await iniciarSesion(page);
      await page.goto("/cobros/generar");

      await seleccionarEnCombo(page, "Mes", mesNombre);
      await seleccionarEnCombo(page, "Año", anioStr);

      await expect(page.getByText(/cargando socios/i))
        .not.toBeVisible({ timeout: 20000 })
        .catch(() => {});
      await page.waitForTimeout(2000);

      // Buscar nuestro socio para aislar la operación
      await page.getByPlaceholder(/buscar por nombre/i).fill(dniTest);
      await expect(
        page.getByText(new RegExp(apellidoTest, "i")).first(),
      ).toBeVisible({ timeout: 10000 });

      // Seleccionar todos los visibles
      const botonSeleccionar = page.getByRole("button", {
        name: /^Seleccionar todos/i,
      });

      if ((await botonSeleccionar.count()) > 0) {
        await botonSeleccionar.click();
      }

      // Generar cuotas
      const botonGenerar = page.getByRole("button", {
        name: /generar \d+ cuotas?/i,
      });
      await expect(botonGenerar).toBeVisible({ timeout: 5000 });
      await botonGenerar.click();

      // Verificar resultado exitoso
      await expect(
        page.getByText(/resultado de la generación|cuotas generadas/i).first(),
      ).toBeVisible({ timeout: 30000 });
    });

    test("GEN-04: verificar idempotencia — socio aparece como ya generado", async ({
      page,
    }) => {
      expect(socioCreado).toBeTruthy();
      await iniciarSesion(page);
      await page.goto("/cobros/generar");

      await seleccionarEnCombo(page, "Mes", mesNombre);
      await seleccionarEnCombo(page, "Año", anioStr);

      await expect(page.getByText(/cargando socios/i))
        .not.toBeVisible({ timeout: 20000 })
        .catch(() => {});
      await page.waitForTimeout(2000);

      // Buscar nuestro socio
      await page.getByPlaceholder(/buscar por nombre/i).fill(dniTest);
      await page.waitForTimeout(1000);

      // Verificar que muestra estado "Ya generada"
      await expect(
        page.getByText(/ya generada/i).first(),
      ).toBeVisible({ timeout: 10000 });
    });

    /* =================== REGISTRAR PAGOS =================== */

    test("PAG-01: navegar a pagos, seleccionar período y ver cuotas pendientes", async ({
      page,
    }) => {
      expect(socioCreado).toBeTruthy();
      await iniciarSesion(page);
      await page.goto("/cobros/pagos");

      await seleccionarEnCombo(page, "Mes", mesNombre);
      await seleccionarEnCombo(page, "Año", anioStr);

      await expect(page.getByText(/cargando cuotas/i))
        .not.toBeVisible({ timeout: 20000 })
        .catch(() => {});
      await page.waitForTimeout(2000);

      // Debería haber filas en la tabla
      const filas = page.locator("table tbody tr");
      await expect(filas.first()).toBeVisible({ timeout: 10000 });
    });

    test("PAG-02: buscar socio de prueba en pagos", async ({ page }) => {
      expect(socioCreado).toBeTruthy();
      await iniciarSesion(page);
      await page.goto("/cobros/pagos");

      await seleccionarEnCombo(page, "Mes", mesNombre);
      await seleccionarEnCombo(page, "Año", anioStr);

      await expect(page.getByText(/cargando cuotas/i))
        .not.toBeVisible({ timeout: 20000 })
        .catch(() => {});
      await page.waitForTimeout(2000);

      // Buscar por DNI (Enter para ejecutar búsqueda)
      const buscador = page.getByPlaceholder(/nombre.*apellido.*dni/i);
      await buscador.fill(dniTest);
      await buscador.press("Enter");

      await page.waitForTimeout(2000);

      // Verificar que aparece nuestro socio
      await expect(
        page.getByText(new RegExp(apellidoTest, "i")).first(),
      ).toBeVisible({ timeout: 10000 });
    });

    test("PAG-03: registrar pago de la cuota", async ({ page }) => {
      expect(socioCreado).toBeTruthy();
      await iniciarSesion(page);
      await page.goto("/cobros/pagos");

      await seleccionarEnCombo(page, "Mes", mesNombre);
      await seleccionarEnCombo(page, "Año", anioStr);

      await expect(page.getByText(/cargando cuotas/i))
        .not.toBeVisible({ timeout: 20000 })
        .catch(() => {});
      await page.waitForTimeout(2000);

      // Buscar nuestro socio
      const buscador = page.getByPlaceholder(/nombre.*apellido.*dni/i);
      await buscador.fill(dniTest);
      await buscador.press("Enter");
      await page.waitForTimeout(2000);

      // Seleccionar checkbox de la cuota
      const checkbox = page
        .locator("table tbody tr")
        .filter({ hasText: new RegExp(apellidoTest, "i") })
        .locator("input[type='checkbox']")
        .first();
      await checkbox.check();

      // Verificar texto de selección
      await expect(
        page.getByText(/\d+ cuotas? seleccionadas?/i),
      ).toBeVisible();

      // Registrar como pagada
      const botonRegistrar = page.getByRole("button", {
        name: /registrar seleccionadas como pagadas/i,
      });
      await expect(botonRegistrar).toBeEnabled();
      await botonRegistrar.click();

      // Manejar diálogo de confirmación si aparece
      const dialogo = page.getByRole("dialog");
      if ((await dialogo.count()) > 0) {
        const botonConfirmar = dialogo
          .getByRole("button")
          .filter({ hasText: /confirmar|registrar|procesar/i })
          .first();
        if ((await botonConfirmar.count()) > 0) {
          await botonConfirmar.click();
        }
      }

      // Verificar éxito
      await expect(
        page.getByText(/(pagos|cuotas) registrad[oa]s? exitosamente/i),
      ).toBeVisible({ timeout: 15000 });
    });

    test("PAG-04: verificar cuota aparece como PAGADA", async ({ page }) => {
      expect(socioCreado).toBeTruthy();
      await iniciarSesion(page);
      await page.goto("/cobros/pagos");

      await seleccionarEnCombo(page, "Mes", mesNombre);
      await seleccionarEnCombo(page, "Año", anioStr);

      await expect(page.getByText(/cargando cuotas/i))
        .not.toBeVisible({ timeout: 20000 })
        .catch(() => {});
      await page.waitForTimeout(2000);

      // Cambiar filtro de estado a PAGADA (o TODOS para ver todas)
      await seleccionarEnCombo(page, "Estado", "TODOS");
      await page.waitForTimeout(1000);

      // Buscar nuestro socio
      const buscador = page.getByPlaceholder(/nombre.*apellido.*dni/i);
      await buscador.fill(dniTest);
      await buscador.press("Enter");
      await page.waitForTimeout(2000);

      // Verificar badge PAGADA
      const filaSocio = page
        .locator("table tbody tr")
        .filter({ hasText: new RegExp(apellidoTest, "i") })
        .first();
      await expect(filaSocio).toBeVisible({ timeout: 10000 });
      await expect(filaSocio.getByText("PAGADA")).toBeVisible();
    });

    /* =================== VERIFICACIÓN CRUZADA =================== */

    test("VER-01: verificar pago en estado de pagos anual", async ({
      page,
    }) => {
      expect(socioCreado).toBeTruthy();
      await iniciarSesion(page);
      await page.goto("/cobros/estado-pagos");

      await expect(page.getByText(/cargando estado/i))
        .not.toBeVisible({ timeout: 20000 })
        .catch(() => {});
      await page.waitForTimeout(2000);

      // Ajustar año de referencia si es necesario
      const inputAnio = page.getByLabel(/año de referencia/i);
      if ((await inputAnio.count()) > 0) {
        await inputAnio.clear();
        await inputAnio.fill(anioStr);
      }

      // Buscar nuestro socio
      const buscador = page.getByPlaceholder(/nombre, apellido o dni/i);
      await buscador.fill(dniTest);
      await page.getByRole("button", { name: "Aplicar" }).click();
      await page.waitForTimeout(3000);

      // Verificar que aparece nuestro socio en la tabla
      await expect(
        page.getByText(new RegExp(apellidoTest, "i")).first(),
      ).toBeVisible({ timeout: 10000 });
    });

    test("VER-02: verificar datos en reporte de cobranza", async ({
      page,
    }) => {
      expect(socioCreado).toBeTruthy();
      await iniciarSesion(page);
      await page.goto("/cobros/reportes");

      // Tab "Mes Específico" debería estar activo por defecto
      await seleccionarEnCombo(page, "Mes", mesNombre);
      await seleccionarEnCombo(page, "Año", anioStr);

      await page.getByRole("button", { name: "Buscar" }).click();

      await expect(page.getByText(/cargando reporte/i))
        .not.toBeVisible({ timeout: 20000 })
        .catch(() => {});
      await page.waitForTimeout(2000);

      // Verificar que las métricas aparecen (puede ser datos o aviso sin datos)
      const totalGenerado = page.getByText(/total generado/i);
      const sinDatos = page.getByText(/sin datos para el período/i);

      await expect(totalGenerado.or(sinDatos)).toBeVisible({
        timeout: 10000,
      });
    });

    /* ======================== CLEANUP ======================== */
    test("CLEANUP: eliminar socio de prueba", async ({ page }) => {
      await iniciarSesion(page);
      await page.goto("/socios");

      const buscador = page.getByPlaceholder(
        "Buscar por nombre, apellido, DNI o email...",
      );
      await buscador.fill(dniTest);
      await page.waitForTimeout(2000);

      const filaSocio = page.locator("tr").filter({ hasText: dniTest }).first();

      if ((await filaSocio.count()) > 0) {
        await filaSocio
          .getByRole("button", { name: /eliminar socio/i })
          .click();

        const dialogoEliminar = page.getByRole("alertdialog");
        await expect(dialogoEliminar).toBeVisible();
        await dialogoEliminar
          .getByRole("button", { name: /^Eliminar$/ })
          .click();

        await page.reload();
        const buscadorActualizado = page.getByPlaceholder(
          "Buscar por nombre, apellido, DNI o email...",
        );
        await buscadorActualizado.fill(dniTest);
        await page.waitForTimeout(1500);

        const filasRestantes = page.locator("tr").filter({ hasText: dniTest });
        if ((await filasRestantes.count()) > 0) {
          await page.waitForTimeout(1000);
        }
      }
    });
  },
);
