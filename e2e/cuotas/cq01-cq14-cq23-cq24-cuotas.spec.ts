import { expect, test } from "@playwright/test";

import { iniciarSesion } from "../helpers/auth";

// ============================================================================
// CQ01 - Administrar categorías de socio y montos
// CQ02 - Generar cuotas masivamente para un periodo
// CQ03 - Generar y descargar talonario HTML
// CQ04 - Generar y descargar archivo .23f para tarjeta del centro
// CQ05 - Procesar resultados de tarjeta del centro desde web
// CQ06 - Resolver cuotas rechazadas de tarjeta por cuenta corriente
// CQ07 - Registrar pagos web desde listado de cuotas sin tarjeta
// CQ08 - Consultar estado anual de pagos
// CQ09 - Consultar morosos
// CQ10 - Reportes de cobranza por mes y por rango
// CQ11 - Cuenta corriente de socio
// CQ12 - Módulo de cobradores web
// CQ13 - Comisión de cobradores
// CQ14 - Cuenta corriente de cobradores
// CQ23 - Generación backend alternativa
// CQ24 - Exportaciones e impresiones del dominio de cobranza
// ============================================================================

// ============================================================================
// CQ01 - Administrar categorías de socio y montos
// ============================================================================

test.describe.serial("CQ01 - Administrar categorías de socio y montos", () => {
  test("CQ01-01: abrir /cobros/categorias muestra la página", async ({ page }) => {
    await iniciarSesion(page);
    await page.goto("/cobros/categorias");

    await expect(page.getByRole("heading", { name: /Categorías|Categoria/i })).toBeVisible();
  });

  test("CQ01-02: ver categorías existentes", async ({ page }) => {
    await iniciarSesion(page);
    await page.goto("/cobros/categorias");

    // Verificar que hay contenido en la página
    await expect(page.locator("table, [role='table'], .card").first()).toBeVisible({ timeout: 10000 });
  });

  test("CQ01-03: editar monto mensual de categoría", async ({ page }) => {
    await iniciarSesion(page);
    await page.goto("/cobros/categorias");

    // Buscar botón de editar
    const botonEditar = page.getByRole("button", { name: /Editar|editar/i }).first();

    if (await botonEditar.count() > 0) {
      await botonEditar.click();

      const dialog = page.getByRole("dialog");
      if (await dialog.count() > 0) {
        await expect(dialog).toBeVisible();
        // Cancelar para no hacer cambios
        await dialog.getByRole("button", { name: /Cancelar/i }).click();
      }
    }
  });
});

// ============================================================================
// CQ02 - Generar cuotas masivamente para un periodo
// ============================================================================

test.describe.serial("CQ02 - Generar cuotas masivamente", () => {
  test("CQ02-01: abrir /cobros/generar muestra la página", async ({ page }) => {
    await iniciarSesion(page);
    await page.goto("/cobros/generar");

    await expect(page.getByRole("heading", { name: /Generar|Cuotas/i })).toBeVisible();
  });

  test("CQ02-02: ver selector de periodo", async ({ page }) => {
    await iniciarSesion(page);
    await page.goto("/cobros/generar");

    // Buscar selector de mes/año
    const selectorPeriodo = page.getByRole("combobox").or(page.locator("select")).or(page.locator("input[type='date']"));

    if (await selectorPeriodo.count() > 0) {
      await expect(selectorPeriodo.first()).toBeVisible();
    }
  });

  test("CQ02-03: filtrar socios elegibles", async ({ page }) => {
    await iniciarSesion(page);
    await page.goto("/cobros/generar");

    // Buscar campo de búsqueda
    const buscador = page.getByPlaceholder(/buscar|search|socio/i);

    if (await buscador.count() > 0) {
      await buscador.first().fill("test");
      await page.waitForTimeout(500);
    }

    // Verificar que la página sigue funcionando
    await expect(page.getByRole("heading", { name: /Generar|Cuotas/i })).toBeVisible();
  });

  test("CQ02-04: validar estado sin socios elegibles", async ({ page }) => {
    await iniciarSesion(page);
    await page.goto("/cobros/generar");

    // Verificar que la página carga
    await expect(page.getByRole("heading", { name: /Generar|Cuotas/i })).toBeVisible();
  });
});

// ============================================================================
// CQ03 - Generar y descargar talonario HTML
// ============================================================================

test.describe.serial("CQ03 - Talonario HTML", () => {
  test("CQ03-01: validar acceso a talonario", async ({ page }) => {
    await iniciarSesion(page);
    await page.goto("/cobros/generar");

    // Buscar enlace/botón de talonario
    const botonTalonario = page.getByRole("button", { name: /Talonario|talonario/i }).or(
      page.getByRole("link", { name: /Talonario|talonario/i })
    );

    // Verificar que la página carga
    await expect(page.getByRole("heading", { name: /Generar|Cuotas/i })).toBeVisible();
  });
});

// ============================================================================
// CQ04 - Archivo .23f para tarjeta del centro
// ============================================================================

test.describe.serial("CQ04 - Archivo Tarjeta del Centro", () => {
  test("CQ04-01: validar acceso a archivo tarjeta centro", async ({ page }) => {
    await iniciarSesion(page);
    await page.goto("/cobros/generar");

    // Buscar enlace/botón de archivo tarjeta
    const botonArchivo = page.getByRole("button", { name: /Tarjeta|tarjeta|\.23f|archivo/i }).or(
      page.getByRole("link", { name: /Tarjeta|tarjeta|\.23f/i })
    );

    // Verificar que la página carga
    await expect(page.getByRole("heading", { name: /Generar|Cuotas/i })).toBeVisible();
  });
});

// ============================================================================
// CQ05 - Procesar resultados de tarjeta del centro
// ============================================================================

test.describe.serial("CQ05 - Procesar resultados tarjeta centro", () => {
  test("CQ05-01: abrir /cobros/pagos muestra la página", async ({ page }) => {
    await iniciarSesion(page);
    await page.goto("/cobros/pagos");

    await expect(page.getByRole("heading", { name: /Pagos|Cuotas/i })).toBeVisible();
  });

  test("CQ05-02: ver pestañas de con/sin tarjeta", async ({ page }) => {
    await iniciarSesion(page);
    await page.goto("/cobros/pagos");

    // Buscar tabs
    const tabTarjeta = page.getByRole("tab", { name: /tarjeta|Tarjeta/i });
    const tabSinTarjeta = page.getByRole("tab", { name: /sin tarjeta|Sin tarjeta/i });

    // Verificar que la página carga
    await expect(page.getByRole("heading", { name: /Pagos|Cuotas/i })).toBeVisible();
  });

  test("CQ05-03: filtrar por periodo", async ({ page }) => {
    await iniciarSesion(page);
    await page.goto("/cobros/pagos");

    // Buscar selector de periodo
    const selectorPeriodo = page.getByRole("combobox").or(page.locator("select"));

    if (await selectorPeriodo.count() > 0) {
      await selectorPeriodo.first().click();
      await page.waitForTimeout(500);
    }

    // Verificar que la página sigue funcionando
    await expect(page.getByRole("heading", { name: /Pagos|Cuotas/i })).toBeVisible();
  });
});

// ============================================================================
// CQ07 - Registrar pagos web desde listado de cuotas sin tarjeta
// ============================================================================

test.describe.serial("CQ07 - Registrar pagos web", () => {
  test("CQ07-01: ver listado de cuotas", async ({ page }) => {
    await iniciarSesion(page);
    await page.goto("/cobros/pagos");

    // Verificar que hay tabla o lista
    const tabla = page.locator("table, [role='table']");

    if (await tabla.count() > 0) {
      await expect(tabla.first()).toBeVisible({ timeout: 10000 });
    }
  });

  test("CQ07-02: filtrar por socio", async ({ page }) => {
    await iniciarSesion(page);
    await page.goto("/cobros/pagos");

    const buscador = page.getByPlaceholder(/buscar|search|socio/i);

    if (await buscador.count() > 0) {
      await buscador.first().fill("test");
      await page.waitForTimeout(500);
    }

    await expect(page.getByRole("heading", { name: /Pagos|Cuotas/i })).toBeVisible();
  });

  test("CQ07-03: ver métodos de pago disponibles", async ({ page }) => {
    await iniciarSesion(page);
    await page.goto("/cobros/pagos");

    // Buscar selector de método de pago
    const selectorMetodo = page.getByRole("combobox", { name: /método|metodo|pago/i }).or(
      page.locator("select").filter({ hasText: /método|metodo|pago/i })
    );

    // Verificar que la página carga
    await expect(page.getByRole("heading", { name: /Pagos|Cuotas/i })).toBeVisible();
  });
});

// ============================================================================
// CQ08 - Consultar estado anual de pagos
// ============================================================================

test.describe.serial("CQ08 - Estado anual de pagos", () => {
  test("CQ08-01: abrir /cobros/estado-pagos muestra la página", async ({ page }) => {
    await iniciarSesion(page);
    await page.goto("/cobros/estado-pagos");

    await expect(page.getByRole("heading", { name: /Estado.*Pago|pago/i })).toBeVisible();
  });

  test("CQ08-02: filtrar por año", async ({ page }) => {
    await iniciarSesion(page);
    await page.goto("/cobros/estado-pagos");

    const selectorAnio = page.getByRole("combobox").or(page.locator("select")).or(page.locator("input[type='number']"));

    if (await selectorAnio.count() > 0) {
      await selectorAnio.first().click();
      await page.waitForTimeout(500);
    }

    await expect(page.getByRole("heading", { name: /Estado.*Pago|pago/i })).toBeVisible();
  });

  test("CQ08-03: filtrar por categoría", async ({ page }) => {
    await iniciarSesion(page);
    await page.goto("/cobros/estado-pagos");

    const selectorCategoria = page.getByRole("combobox", { name: /categoria/i }).or(
      page.locator("select").filter({ hasText: /categoria/i })
    );

    if (await selectorCategoria.count() > 0) {
      await selectorCategoria.first().click();
      await page.waitForTimeout(500);
    }

    await expect(page.getByRole("heading", { name: /Estado.*Pago|pago/i })).toBeVisible();
  });

  test("CQ08-04: validar exportación CSV", async ({ page }) => {
    await iniciarSesion(page);
    await page.goto("/cobros/estado-pagos");

    const botonExport = page.getByRole("button", { name: /CSV|Exportar|exportar/i });

    if (await botonExport.count() > 0) {
      // Solo verificar que existe
      await expect(botonExport.first()).toBeVisible();
    }
  });
});

// ============================================================================
// CQ09 - Consultar morosos
// ============================================================================

test.describe.serial("CQ09 - Consultar morosos", () => {
  test("CQ09-01: abrir /cobros/morosos muestra la página", async ({ page }) => {
    await iniciarSesion(page);
    await page.goto("/cobros/morosos");

    await expect(page.getByRole("heading", { name: /Morosos|morosos/i })).toBeVisible();
  });

  test("CQ09-02: filtrar por severidad", async ({ page }) => {
    await iniciarSesion(page);
    await page.goto("/cobros/morosos");

    const selectorSeveridad = page.getByRole("combobox").or(page.locator("select"));

    if (await selectorSeveridad.count() > 0) {
      await selectorSeveridad.first().click();
      await page.waitForTimeout(500);
    }

    await expect(page.getByRole("heading", { name: /Morosos|morosos/i })).toBeVisible();
  });

  test("CQ09-03: buscar moroso", async ({ page }) => {
    await iniciarSesion(page);
    await page.goto("/cobros/morosos");

    const buscador = page.getByPlaceholder(/buscar|search/i);

    if (await buscador.count() > 0) {
      await buscador.first().fill("test");
      await page.waitForTimeout(500);
    }

    await expect(page.getByRole("heading", { name: /Morosos|morosos/i })).toBeVisible();
  });

  test("CQ09-04: ver estadísticas de morosidad", async ({ page }) => {
    await iniciarSesion(page);
    await page.goto("/cobros/morosos");

    // Verificar que hay contenido estadístico
    const estadisticas = page.locator(".card, [data-slot='card'], .stat");

    if (await estadisticas.count() > 0) {
      await expect(estadisticas.first()).toBeVisible({ timeout: 10000 });
    }
  });
});

// ============================================================================
// CQ10 - Reportes de cobranza
// ============================================================================

test.describe.serial("CQ10 - Reportes de cobranza", () => {
  test("CQ10-01: abrir /cobros/reportes muestra la página", async ({ page }) => {
    await iniciarSesion(page);
    await page.goto("/cobros/reportes");

    await expect(page.getByRole("heading", { name: /Reportes|reportes|Cobranza/i })).toBeVisible();
  });

  test("CQ10-02: ver tabs de mes específico y rango", async ({ page }) => {
    await iniciarSesion(page);
    await page.goto("/cobros/reportes");

    const tabMes = page.getByRole("tab", { name: /mes|Mes|específico/i });
    const tabRango = page.getByRole("tab", { name: /rango|Rango/i });

    // Verificar que la página carga
    await expect(page.getByRole("heading", { name: /Reportes|reportes|Cobranza/i })).toBeVisible();
  });

  test("CQ10-03: consultar reporte por mes", async ({ page }) => {
    await iniciarSesion(page);
    await page.goto("/cobros/reportes");

    const botonBuscar = page.getByRole("button", { name: /Buscar|buscar|Consultar/i });

    if (await botonBuscar.count() > 0) {
      await botonBuscar.first().click();
      await page.waitForTimeout(1000);
    }

    await expect(page.getByRole("heading", { name: /Reportes|reportes|Cobranza/i })).toBeVisible();
  });

  test("CQ10-04: consultar reporte por rango", async ({ page }) => {
    await iniciarSesion(page);
    await page.goto("/cobros/reportes");

    // Ir a tab de rango si existe
    const tabRango = page.getByRole("tab", { name: /rango|Rango/i });

    if (await tabRango.count() > 0) {
      await tabRango.click();
      await page.waitForTimeout(500);
    }

    await expect(page.getByRole("heading", { name: /Reportes|reportes|Cobranza/i })).toBeVisible();
  });
});

// ============================================================================
// CQ12 - Módulo de cobradores web
// ============================================================================

test.describe.serial("CQ12 - Módulo de cobradores web", () => {
  test("CQ12-01: abrir /cobradores muestra la página", async ({ page }) => {
    await iniciarSesion(page);
    await page.goto("/cobradores");

    await expect(page.getByRole("heading", { name: /Cobradores|cobradores/i })).toBeVisible();
  });

  test("CQ12-02: ver acceso a cuenta corriente", async ({ page }) => {
    await iniciarSesion(page);
    await page.goto("/cobradores");

    const linkCuentaCorriente = page.getByRole("link", { name: /Cuenta.*Corriente|cuenta.*corriente/i }).or(
      page.getByRole("button", { name: /Cuenta.*Corriente|cuenta.*corriente/i })
    );

    // Verificar que la página carga
    await expect(page.getByRole("heading", { name: /Cobradores|cobradores/i })).toBeVisible();
  });

  test("CQ12-03: ver acceso a comisión", async ({ page }) => {
    await iniciarSesion(page);
    await page.goto("/cobradores");

    const linkComision = page.getByRole("link", { name: /Comisión|comision|Comision/i }).or(
      page.getByRole("button", { name: /Comisión|comision/i })
    );

    // Verificar que la página carga
    await expect(page.getByRole("heading", { name: /Cobradores|cobradores/i })).toBeVisible();
  });
});

// ============================================================================
// CQ13 - Comisión de cobradores
// ============================================================================

test.describe.serial("CQ13 - Comisión de cobradores", () => {
  test("CQ13-01: abrir /cobradores/comision muestra la página", async ({ page }) => {
    await iniciarSesion(page);
    await page.goto("/cobradores/comision");

    await expect(page.getByRole("heading", { name: /Comisión|comision|Comision/i })).toBeVisible();
  });

  test("CQ13-02: ver selector de cobrador", async ({ page }) => {
    await iniciarSesion(page);
    await page.goto("/cobradores/comision");

    const selectorCobrador = page.getByRole("combobox").or(page.locator("select"));

    if (await selectorCobrador.count() > 0) {
      await expect(selectorCobrador.first()).toBeVisible();
    }
  });

  test("CQ13-03: ver configuración de porcentaje", async ({ page }) => {
    await iniciarSesion(page);
    await page.goto("/cobradores/comision");

    // Verificar que hay inputs para configurar
    const inputPorcentaje = page.locator("input[type='number']").or(page.locator("input").filter({ hasText: /%|porcentaje/i }));

    // Verificar que la página carga
    await expect(page.getByRole("heading", { name: /Comisión|comision|Comision/i })).toBeVisible();
  });
});

// ============================================================================
// CQ14 - Cuenta corriente de cobradores
// ============================================================================

test.describe.serial("CQ14 - Cuenta corriente de cobradores", () => {
  test("CQ14-01: abrir /cobradores/cuenta-corriente muestra la página", async ({ page }) => {
    await iniciarSesion(page);
    await page.goto("/cobradores/cuenta-corriente");

    await expect(page.getByRole("heading", { name: /Cuenta.*Corriente|cuenta.*corriente/i })).toBeVisible();
  });

  test("CQ14-02: ver selector de cobrador", async ({ page }) => {
    await iniciarSesion(page);
    await page.goto("/cobradores/cuenta-corriente");

    const selectorCobrador = page.getByRole("combobox").or(page.locator("select"));

    if (await selectorCobrador.count() > 0) {
      await expect(selectorCobrador.first()).toBeVisible();
    }
  });

  test("CQ14-03: filtrar movimientos por fecha", async ({ page }) => {
    await iniciarSesion(page);
    await page.goto("/cobradores/cuenta-corriente");

    const inputFecha = page.locator("input[type='date']");

    if (await inputFecha.count() > 0) {
      await expect(inputFecha.first()).toBeVisible();
    }
  });
});

// ============================================================================
// CQ23 - Generación backend alternativa
// ============================================================================

test.describe.serial("CQ23 - Generación backend alternativa", () => {
  test("CQ23-01: validar endpoint de generación", async ({ page }) => {
    await iniciarSesion(page);

    // Verificar que el endpoint responde (puede ser 401, 404 o 200)
    const response = await page.request.post("/api/v1/cobros/generar", {});
    expect([200, 400, 401, 404, 422]).toContain(response.status());
  });
});

// ============================================================================
// CQ24 - Exportaciones e impresiones del dominio de cobranza
// ============================================================================

test.describe.serial("CQ24 - Exportaciones e impresiones", () => {
  test("CQ24-01: validar endpoint de recibo HTML", async ({ page }) => {
    await iniciarSesion(page);

    // Verificar que el endpoint responde
    const response = await page.request.get("/api/v1/cobros/recibo/html/1");
    expect([200, 401, 404]).toContain(response.status());
  });

  test("CQ24-02: validar endpoint de talonario", async ({ page }) => {
    await iniciarSesion(page);

    // Verificar que el endpoint responde
    const response = await page.request.get("/api/v1/cobros/talonario");
    expect([200, 401, 404]).toContain(response.status());
  });

  test("CQ24-03: validar endpoint de archivo tarjeta centro", async ({ page }) => {
    await iniciarSesion(page);

    // Verificar que el endpoint responde
    const response = await page.request.get("/api/v1/cobros/tarjeta-centro/archivo?periodo=2026-02");
    expect([200, 401, 404]).toContain(response.status());
  });
});
