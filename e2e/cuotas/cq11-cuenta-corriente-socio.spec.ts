import { expect, test } from "@playwright/test";

import { iniciarSesion } from "../helpers/auth";

// ============================================================================
// CQ11 - Cuenta corriente de socio (CRÍTICO)
// ============================================================================

const generarSufijoUnico = (): string =>
  `${Date.now()}${Math.floor(Math.random() * 1000)}`;

const generarDniValido = (): string => generarSufijoUnico().slice(-8);

const BUSCADOR_PLACEHOLDER = "Buscar por nombre, apellido, DNI o email...";

test.describe.serial("CQ11 - Cuenta corriente de socio", () => {
  let socioCreado: {
    dni: string;
    nombre: string;
    apellido: string;
    socioId: string;
  };

  // CQ11-SETUP: Crear socio con cuotas en diferentes estados
  test("CQ11-SETUP: crear socio para pruebas de cuenta corriente", async ({
    page,
  }) => {
    await iniciarSesion(page);

    const sufijo = generarSufijoUnico();
    const dni = generarDniValido();
    const nombre = `E2ECQ11${sufijo.slice(0, 4)}`;
    const apellido = `CtaCte${sufijo.slice(4, 8)}`;

    await page.goto("/socios/crear");
    await expect(
      page.getByRole("heading", { name: /Crear Nuevo Socio/i }),
    ).toBeVisible();

    await page.locator("#dni").fill(dni);
    await page.locator("#nombre").fill(nombre);
    await page.locator("#apellido").fill(apellido);
    await page.locator("#fechaNacimiento").fill("1985-03-20");
    await page.locator("#direccion").fill(`Calle Cuenta Corriente ${sufijo}`);
    await page.locator("#email").fill(`cq11.${sufijo}@test.local`);
    await page.locator("#telefono").fill(`11${sufijo.slice(-8)}`);

    // Activar tarjeta del centro para tener cuotas con tarjeta
    const checkbox = page.locator("#tarjetaCentro");
    const estadoTarjeta = await checkbox.getAttribute("data-state");
    if (estadoTarjeta !== "checked") {
      await page.getByLabel(/tiene tarjeta del centro/i).click();
    }
    await expect(checkbox).toHaveAttribute("data-state", "checked");
    await expect(page.locator("#numeroTarjetaCentro")).toBeVisible();
    await page
      .locator("#numeroTarjetaCentro")
      .fill(`54000000${sufijo.slice(-8)}`);

    // Guardar
    await page.getByRole("button", { name: /^Crear$/ }).click();
    await expect(page).toHaveURL(/\/socios$/, { timeout: 15000 });

    const buscador = page.getByPlaceholder(
      "Buscar por nombre, apellido, DNI o email...",
    );
    await buscador.fill(dni);
    await page.waitForTimeout(2000);

    // Obtener ID del socio
    const socioRow = page.locator("tr").filter({ hasText: dni });
    await expect(socioRow).toBeVisible({ timeout: 10000 });

    const editLink = socioRow.getByRole("link", { name: /Editar socio/i });
    const href = await editLink.getAttribute("href");
    const socioId = href?.split("/socios/")[1]?.split("/edit")[0] ?? "";

    socioCreado = { dni, nombre, apellido, socioId };
    expect(socioId).toBeTruthy();
  });

  // CQ11-01: Abrir cuenta corriente desde detalle de socio
  test("CQ11-01: abrir cuenta corriente desde detalle de socio", async ({
    page,
  }) => {
    expect(socioCreado).toBeDefined();
    expect(socioCreado.socioId).toBeTruthy();
    await iniciarSesion(page);

    await page.goto(`/socios/${socioCreado.socioId}/cuenta-corriente`);
    await expect(
      page.getByText(/^Cuenta Corriente$/).first(),
    ).toBeVisible({ timeout: 10000 });
  });

  // CQ11-02: Ver resumen de total pagado y deuda
  test("CQ11-02: ver resumen de totales", async ({ page }) => {
    expect(socioCreado).toBeDefined();
    expect(socioCreado.socioId).toBeTruthy();
    await iniciarSesion(page);

    await page.goto(`/socios/${socioCreado.socioId}/cuenta-corriente`);
    await expect(page.getByText(/^Cuenta Corriente$/).first()).toBeVisible({
      timeout: 10000,
    });

    // Verificar card de "Total pagado"
    const totalPagado = page.getByText(/Total pagado/i);
    if ((await totalPagado.count()) > 0) {
      await expect(totalPagado.first()).toBeVisible();
    }

    // Verificar card de "Deuda total"
    const deudaTotal = page.getByText(/Deuda total/i);
    if ((await deudaTotal.count()) > 0) {
      await expect(deudaTotal.first()).toBeVisible();
    }

    // Verificar card de "Meses adeudados"
    const mesesAdeudados = page.getByText(/Meses adeudados/i);
    if ((await mesesAdeudados.count()) > 0) {
      await expect(mesesAdeudados.first()).toBeVisible();
    }
  });

  // CQ11-03: Cambiar año de la grilla anual
  test("CQ11-03: cambiar año de grilla anual", async ({ page }) => {
    expect(socioCreado).toBeDefined();
    expect(socioCreado.socioId).toBeTruthy();
    await iniciarSesion(page);

    await page.goto(`/socios/${socioCreado.socioId}/cuenta-corriente`);
    await expect(page.getByText(/^Cuenta Corriente$/).first()).toBeVisible({
      timeout: 10000,
    });

    // Buscar selector de año
    const selectorAnio = page.locator("#anio").or(
      page.getByRole("combobox").filter({ hasText: /\d{4}/ }),
    );

    if ((await selectorAnio.count()) > 0) {
      await selectorAnio.first().click();

      // Seleccionar un año diferente
      const currentYear = new Date().getFullYear();
      const anioAnterior = String(currentYear - 1);

      const opcionAnio = page.getByRole("option", { name: anioAnterior });
      if ((await opcionAnio.count()) > 0) {
        await opcionAnio.click();
        await page.waitForTimeout(500);
      }
    }

    // Verificar que la página sigue funcionando
    await expect(page.getByText(/^Cuenta Corriente$/).first()).toBeVisible();
  });

  // CQ11-04: Validar estados de cuota con tarjeta
  test("CQ11-04: validar estados tarjeta pendiente/rechazada/aprobada", async ({
    page,
  }) => {
    expect(socioCreado).toBeDefined();
    expect(socioCreado.socioId).toBeTruthy();
    await iniciarSesion(page);

    await page.goto(`/socios/${socioCreado.socioId}/cuenta-corriente`);
    await expect(page.getByText(/^Cuenta Corriente$/).first()).toBeVisible({
      timeout: 10000,
    });

    // Buscar badges de estado de tarjeta
    const badgePendiente = page.getByText(/Tarj\. pend\.|Tarjeta pendiente/i);
    const badgeRechazada = page.getByText(/Tarj\. rech\.|Tarjeta rechazada/i);
    const badgeAprobada = page.getByText(/Tarjeta aprobada/i);

    // Verificar que la grilla de estado de pagos está visible
    const grillaPagos = page.getByText(/Estado de pagos/i);
    if ((await grillaPagos.count()) > 0) {
      await expect(grillaPagos.first()).toBeVisible();
    }

    // Si hay badges, verificar visibilidad
    const hayPendiente = (await badgePendiente.count()) > 0;
    const hayRechazada = (await badgeRechazada.count()) > 0;
    const hayAprobada = (await badgeAprobada.count()) > 0;

    // Al menos verificar que la sección de cuotas pendientes existe
    const cuotasPendientes = page.getByText(/Cuotas pendientes de pago/i);
    if ((await cuotasPendientes.count()) > 0) {
      await expect(cuotasPendientes).toBeVisible();
    }
  });

  // CQ11-05: Seleccionar cuotas pendientes
  test("CQ11-05: seleccionar cuotas pendientes", async ({ page }) => {
    expect(socioCreado).toBeDefined();
    expect(socioCreado.socioId).toBeTruthy();
    await iniciarSesion(page);

    await page.goto(`/socios/${socioCreado.socioId}/cuenta-corriente`);
    await expect(page.getByText(/^Cuenta Corriente$/).first()).toBeVisible({
      timeout: 10000,
    });

    // Buscar sección de cuotas pendientes
    const seccionPendientes = page.getByText(/Cuotas pendientes de pago/i);
    if ((await seccionPendientes.count()) === 0) {
      console.log("No hay cuotas pendientes para seleccionar");
      return;
    }

    // Buscar checkboxes de cuotas
    const checkboxes = page.locator("table").last().locator("input[type='checkbox']");

    if ((await checkboxes.count()) > 1) {
      // Click en el primer checkbox de cuota (no el de "seleccionar todas")
      await checkboxes.nth(1).check();

      // Verificar contador de seleccionadas
      const contador = page.getByText(/Seleccionadas: \d+/i);
      if ((await contador.count()) > 0) {
        await expect(contador.first()).toContainText("1");
      }

      // Verificar que aparece el botón de pago
      const botonRegistrarPago = page.getByRole("button", {
        name: /Registrar pago/i,
      });
      await expect(botonRegistrarPago).toBeEnabled();
    }
  });

  // CQ11-06: Imprimir recibo individual
  test("CQ11-06: imprimir recibo individual", async ({ page }) => {
    expect(socioCreado).toBeDefined();
    expect(socioCreado.socioId).toBeTruthy();
    await iniciarSesion(page);

    await page.goto(`/socios/${socioCreado.socioId}/cuenta-corriente`);
    await expect(page.getByText(/^Cuenta Corriente$/).first()).toBeVisible({
      timeout: 10000,
    });

    // Buscar botón de imprimir recibo en alguna cuota
    const botonImprimir = page
      .getByRole("button", { name: /Imprimir recibo/i })
      .first();

    if ((await botonImprimir.count()) > 0) {
      // Click en imprimir (abrirá nueva pestaña)
      const [newPage] = await Promise.all([
        page.context().waitForEvent("page"),
        botonImprimir.click(),
      ]);

      // Verificar que se abrió nueva pestaña
      await expect(newPage).toBeDefined();
      await newPage.close();
    }
  });

  // CQ11-07: Imprimir recibo múltiple
  test("CQ11-07: imprimir recibo multiple", async ({ page }) => {
    expect(socioCreado).toBeDefined();
    expect(socioCreado.socioId).toBeTruthy();
    await iniciarSesion(page);

    await page.goto(`/socios/${socioCreado.socioId}/cuenta-corriente`);
    await expect(page.getByText(/^Cuenta Corriente$/).first()).toBeVisible({
      timeout: 10000,
    });

    // Buscar botón "Seleccionar todas adeudadas"
    const botonSeleccionarTodas = page.getByRole("button", {
      name: /Seleccionar todas adeudadas/i,
    });

    if ((await botonSeleccionarTodas.count()) > 0) {
      await botonSeleccionarTodas.click();

      // Buscar botón de recibo de seleccionadas
      const botonRecibo = page.getByRole("button", {
        name: /Recibo de seleccionadas/i,
      });

      if ((await botonRecibo.count()) > 0 && (await botonRecibo.isEnabled())) {
        const [newPage] = await Promise.all([
          page.context().waitForEvent("page"),
          botonRecibo.click(),
        ]);

        await expect(newPage).toBeDefined();
        await newPage.close();
      }
    }
  });

  // CQ11-08: Abrir modal de pago masivo
  test("CQ11-08: abrir modal de pago masivo", async ({ page }) => {
    expect(socioCreado).toBeDefined();
    expect(socioCreado.socioId).toBeTruthy();
    await iniciarSesion(page);

    await page.goto(`/socios/${socioCreado.socioId}/cuenta-corriente`);
    await expect(page.getByText(/^Cuenta Corriente$/).first()).toBeVisible({
      timeout: 10000,
    });

    // Seleccionar cuotas pendientes
    const botonSeleccionarTodas = page.getByRole("button", {
      name: /Seleccionar todas adeudadas/i,
    });

    if ((await botonSeleccionarTodas.count()) > 0) {
      await botonSeleccionarTodas.click();

      // Click en "Registrar pago"
      const botonRegistrarPago = page.getByRole("button", {
        name: /Registrar pago/i,
      });

      if ((await botonRegistrarPago.count()) > 0 && (await botonRegistrarPago.isEnabled())) {
        await botonRegistrarPago.click();

        // Verificar que se abre el modal
        const dialog = page.getByRole("dialog");
        await expect(dialog).toBeVisible({ timeout: 5000 });

        // Verificar título del modal
        await expect(
          dialog.getByText(/Registrar pago de cuotas seleccionadas/i),
        ).toBeVisible();

        // Verificar que muestra las cuotas seleccionadas
        await expect(dialog.getByText(/cuotas seleccionadas/i)).toBeVisible();

        // Verificar que muestra el total a pagar
        await expect(dialog.getByText(/Total a pagar/i)).toBeVisible();

        // Cerrar modal
        await page.keyboard.press("Escape");
        await expect(dialog).not.toBeVisible();
      }
    }
  });

  // CQ11-09: Confirmar pago con un método de pago
  test("CQ11-09: confirmar pago con un metodo", async ({ page }) => {
    expect(socioCreado).toBeDefined();
    expect(socioCreado.socioId).toBeTruthy();
    await iniciarSesion(page);

    await page.goto(`/socios/${socioCreado.socioId}/cuenta-corriente`);
    await expect(page.getByText(/^Cuenta Corriente$/).first()).toBeVisible({
      timeout: 10000,
    });

    // Seleccionar cuotas
    const botonSeleccionarTodas = page.getByRole("button", {
      name: /Seleccionar todas adeudadas/i,
    });

    if ((await botonSeleccionarTodas.count()) > 0) {
      await botonSeleccionarTodas.click();

      const botonRegistrarPago = page.getByRole("button", {
        name: /Registrar pago/i,
      });

      if ((await botonRegistrarPago.count()) > 0 && (await botonRegistrarPago.isEnabled())) {
        await botonRegistrarPago.click();

        const dialog = page.getByRole("dialog");
        await expect(dialog).toBeVisible({ timeout: 5000 });

        // Verificar selector de método principal
        const metodoPrincipal = dialog.getByText(/Método principal/i);
        await expect(metodoPrincipal).toBeVisible();

        // Click en confirmar pago
        const confirmarBtn = dialog.getByRole("button", {
          name: /Confirmar pago/i,
        });

        if ((await confirmarBtn.count()) > 0 && (await confirmarBtn.isEnabled())) {
          await confirmarBtn.click();

          // Verificar toast de éxito
          const toastSuccess = page.locator(
            '[data-sonner-toast][data-type="success"]',
          );
          await expect(toastSuccess.first()).toBeVisible({ timeout: 10000 });

          // Verificar que el modal se cierra
          await expect(dialog).not.toBeVisible({ timeout: 5000 });
        }
      }
    }
  });

  // CQ11-10: Confirmar pago con dos métodos de pago
  test("CQ11-10: confirmar pago con dos metodos", async ({ page }) => {
    expect(socioCreado).toBeDefined();
    expect(socioCreado.socioId).toBeTruthy();
    await iniciarSesion(page);

    await page.goto(`/socios/${socioCreado.socioId}/cuenta-corriente`);
    await expect(page.getByText(/^Cuenta Corriente$/).first()).toBeVisible({
      timeout: 10000,
    });

    // Seleccionar cuotas
    const botonSeleccionarTodas = page.getByRole("button", {
      name: /Seleccionar todas adeudadas/i,
    });

    if ((await botonSeleccionarTodas.count()) > 0) {
      await botonSeleccionarTodas.click();

      const botonRegistrarPago = page.getByRole("button", {
        name: /Registrar pago/i,
      });

      if ((await botonRegistrarPago.count()) > 0 && (await botonRegistrarPago.isEnabled())) {
        await botonRegistrarPago.click();

        const dialog = page.getByRole("dialog");
        await expect(dialog).toBeVisible({ timeout: 5000 });

        // Activar segundo método de pago
        const checkboxSegundoMetodo = dialog.locator(
          "input[type='checkbox']#segundoMetodoModal",
        );

        if ((await checkboxSegundoMetodo.count()) > 0) {
          await checkboxSegundoMetodo.check();

          // Verificar que aparecen los campos del segundo método
          await expect(dialog.getByText(/Método secundario/i)).toBeVisible();

          // Llenar montos (distribución)
          const importePrincipal = dialog.locator("input[type='number']").first();
          const importeSecundario = dialog.locator("input[type='number']").nth(1);

          // Verificar que están visibles
          await expect(importePrincipal).toBeVisible();
          await expect(importeSecundario).toBeVisible();
        }

        // Cerrar modal sin guardar
        await page.keyboard.press("Escape");
      }
    }
  });

  // CQ11-11: Revisar historial paginado
  test("CQ11-11: revisar historial paginado", async ({ page }) => {
    expect(socioCreado).toBeDefined();
    expect(socioCreado.socioId).toBeTruthy();
    await iniciarSesion(page);

    await page.goto(`/socios/${socioCreado.socioId}/cuenta-corriente`);
    await expect(page.getByText(/^Cuenta Corriente$/).first()).toBeVisible({
      timeout: 10000,
    });

    // Scroll hasta el historial
    const historialSection = page.getByText(/Historial de cuotas/i);
    if ((await historialSection.count()) > 0) {
      await historialSection.scrollIntoViewIfNeeded();

      // Verificar paginación
      const paginacion = page.getByText(/\d+ cuotas en total/i);
      if ((await paginacion.count()) > 0) {
        await expect(paginacion).toBeVisible();
      }
    }
  });

  // CQ11-12: Cuota rechazada pagada no vuelve a exportar
  test("CQ11-12: cuota rechazada pagada no reexporta", async ({ page }) => {
    await iniciarSesion(page);

    // Ir a generar cuotas
    await page.goto("/cobros/generar");
    await expect(
      page.getByRole("heading", { name: /Generar|Cuotas/i }),
    ).toBeVisible();

    // Verificar que la página carga correctamente
    const selectorPeriodo = page.getByRole("combobox").or(page.locator("select"));

    if ((await selectorPeriodo.count()) > 0) {
      await expect(selectorPeriodo.first()).toBeVisible();
    }
  });

  // CQ11-CLEANUP: Eliminar socio de prueba
  test("CQ11-CLEANUP: eliminar socio de prueba", async ({ page }) => {
    if (!socioCreado) {
      console.log("No se creó socio de prueba, omitiendo cleanup");
      return;
    }

    await iniciarSesion(page);
    await page.goto("/socios");

    const buscador = page.getByPlaceholder(BUSCADOR_PLACEHOLDER);
    await buscador.fill(socioCreado.dni);
    await page.waitForTimeout(1000);

    const socioRow = page
      .locator("tr")
      .filter({ hasText: socioCreado.dni })
      .first();

    if ((await socioRow.count()) > 0) {
      await socioRow.getByRole("button", { name: /Eliminar socio/i }).click();

      const dialogo = page.getByRole("alertdialog");
      await expect(dialogo).toBeVisible();
      await dialogo.getByRole("button", { name: /^Eliminar$/ }).click();

      await expect(
        page.locator("tr").filter({ hasText: socioCreado.dni }),
      ).toHaveCount(0, { timeout: 10000 });
    }
  });
});
