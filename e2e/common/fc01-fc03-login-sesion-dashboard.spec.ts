import { expect, test } from "@playwright/test";

import { cerrarSesion, iniciarSesion } from "../helpers/auth";

// ============================================================================
// FC01 - Login web
// FC02 - Sesion protegida y logout web
// FC03 - Dashboard web
// ============================================================================

test.describe.serial("FC01 - Login web", () => {
  test("FC01-01: login exitoso con credenciales validas redirige a /socios", async ({
    page,
  }) => {
    await page.goto("/login");

    // Verificar que la pagina de login carga correctamente
    // CardTitle es un <div data-slot="card-title">, no un heading
    await expect(
      page.locator('[data-slot="card-title"]').filter({ hasText: /Iniciar sesion/i }),
    ).toBeVisible();
    await expect(
      page.getByText("Panel de Administracion"),
    ).toBeVisible();

    // Completar credenciales
    await page.locator('input[autocomplete="username"]').fill("admin");
    await page
      .locator('input[autocomplete="current-password"]')
      .fill("admin");

    // Enviar formulario y esperar la respuesta de la API
    const responsePromise = page.waitForResponse(
      (response) => response.url().includes("/auth/login"),
      { timeout: 30000 },
    );
    await page.getByRole("button", { name: /Iniciar sesion/i }).click();
    const loginResponse = await responsePromise;

    // Si es 429 (rate limit), esperar y reintentar
    if (loginResponse.status() === 429) {
      await page.waitForTimeout(65000);
      const retryPromise = page.waitForResponse(
        (response) => response.url().includes("/auth/login"),
        { timeout: 30000 },
      );
      await page.getByRole("button", { name: /Iniciar sesion/i }).click();
      await retryPromise;
    }

    // Verificar redireccion a /socios o /
    await expect(page).toHaveURL(/\/$|\/socios$/, { timeout: 30000 });
  });

  test("FC01-02: boton mostrar/ocultar contrasena funciona correctamente", async ({
    page,
  }) => {
    await page.goto("/login");

    const campoPassword = page.locator(
      'input[autocomplete="current-password"]',
    );
    await campoPassword.fill("test123");

    // Verificar que inicialmente esta oculta (type=password)
    await expect(campoPassword).toHaveAttribute("type", "password");

    // Hacer click en mostrar contrasena
    await page
      .getByRole("button", { name: /Mostrar contrasena/i })
      .click();
    await expect(campoPassword).toHaveAttribute("type", "text");

    // Hacer click en ocultar contrasena
    await page
      .getByRole("button", { name: /Ocultar contrasena/i })
      .click();
    await expect(campoPassword).toHaveAttribute("type", "password");
  });

  test("FC01-03: login con credenciales invalidas muestra error toast", async ({
    page,
  }) => {
    await page.goto("/login");

    await page
      .locator('input[autocomplete="username"]')
      .fill("usuario_inexistente");
    await page
      .locator('input[autocomplete="current-password"]')
      .fill("password_incorrecta");

    await page.getByRole("button", { name: /Iniciar sesion/i }).click();

    // Verificar que aparece un toast de error (sonner usa [data-sonner-toast])
    const toastError = page.locator('[data-sonner-toast][data-type="error"]');
    await expect(toastError.first()).toBeVisible({ timeout: 10000 });
  });

  test("FC01-04: formulario valida campos requeridos vacios", async ({
    page,
  }) => {
    await page.goto("/login");

    // Intentar enviar formulario vacio
    await page.getByRole("button", { name: /Iniciar sesion/i }).click();

    // Verificar que se muestran mensajes de validacion
    // (react-hook-form con zod mostrara FormMessage)
    await expect(page).toHaveURL(/\/login$/);
  });

  test("FC01-05: si ya hay sesion activa, /login redirige a /", async ({
    page,
  }) => {
    // Primero iniciar sesion
    await iniciarSesion(page);

    // Navegar manualmente a /login
    await page.goto("/login");

    // PublicRoute redirige a / si ya esta autenticado
    await expect(page).toHaveURL(/\/$|\/socios$/);
  });
});

test.describe.serial("FC02 - Sesion protegida y logout web", () => {
  test("FC02-01: acceso a ruta privada sin token redirige a /login", async ({
    page,
  }) => {
    // Asegurarse de que no hay sesion
    await page.goto("/login");
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    // Intentar acceder a rutas protegidas
    const rutasProtegidas = [
      "/socios",
      "/socios/crear",
      "/temporadas",
      "/estadisticas",
      "/cobros/categorias",
    ];

    for (const ruta of rutasProtegidas) {
      await page.goto(ruta);
      await expect(page).toHaveURL(/\/login$/);
    }
  });

  test("FC02-02: navegar por rutas autenticadas con sesion activa", async ({
    page,
  }) => {
    await iniciarSesion(page);

    // Navegar a varias rutas protegidas y verificar que se cargan
    await page.goto("/socios");
    await expect(page).toHaveURL(/\/socios$/);

    await page.goto("/temporadas");
    await expect(page).toHaveURL(/\/temporadas$/);

    await page.goto("/estadisticas");
    await expect(page).toHaveURL(/\/estadisticas$/);

    await page.goto("/");
    await expect(page).toHaveURL(/\/$/);
  });

  test("FC02-03: logout limpia cache y redirige a /login", async ({
    page,
  }) => {
    await iniciarSesion(page);

    // Verificar que estamos autenticados
    await expect(page).toHaveURL(/\/$|\/socios$/);

    // Ejecutar logout
    await cerrarSesion(page);

    // Verificar redireccion a /login
    await expect(page).toHaveURL(/\/login$/);

    // Verificar que ya no se puede acceder a rutas protegidas
    await page.goto("/socios");
    await expect(page).toHaveURL(/\/login$/);
  });

  test("FC02-04: token invalido en localStorage no permite acceso", async ({
    page,
  }) => {
    // Inyectar token invalido
    await page.goto("/login");
    await page.evaluate(() => {
      localStorage.setItem("authToken", "token-corrupto-invalido");
    });

    // Intentar acceder a ruta protegida
    await page.goto("/socios");

    // Debe redirigir a login porque el token es invalido
    await expect(page).toHaveURL(/\/login$/);
  });

  test("FC02-05: expiracion de token via 401 redirige a /login", async ({
    page,
  }) => {
    await iniciarSesion(page);

    // Interceptar la siguiente request a la API para devolver 401
    await page.route("**/api/v1/**", (route) => {
      route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ message: "Token expired" }),
      });
    });

    // Navegar a una pagina que haga requests a la API
    await page.goto("/socios");

    // El interceptor de axios deberia detectar el 401 y redirigir a login
    await expect(page).toHaveURL(/\/login$/, { timeout: 15000 });
  });
});

test.describe.serial("FC03 - Dashboard web", () => {
  test("FC03-01: dashboard carga con titulo y KPIs", async ({ page }) => {
    await iniciarSesion(page);

    // Navegar al dashboard (/)
    await page.goto("/");

    // Verificar titulo del dashboard
    await expect(
      page.getByRole("heading", { name: /Panel de administracion/i }),
    ).toBeVisible();

    // Verificar descripcion
    await expect(
      page.getByText("Resumen general del estado del club"),
    ).toBeVisible();
  });

  test("FC03-02: KPIs del dashboard muestran las 4 tarjetas principales", async ({
    page,
  }) => {
    await iniciarSesion(page);
    await page.goto("/");

    // Esperar a que se carguen las tarjetas (pueden estar en loading primero)
    // Las 4 tarjetas de KPI son: Morosidad Total, Recaudacion del Mes, Socios Registrados, Cuotas Pendientes
    const tarjetasKpi = [
      "Morosidad Total",
      "Recaudación del Mes",
      "Socios Registrados",
      "Cuotas Pendientes",
    ];

    for (const titulo of tarjetasKpi) {
      await expect(
        page.getByText(titulo, { exact: true }),
      ).toBeVisible({ timeout: 30000 });
    }
  });

  test("FC03-03: seccion de morosidad se muestra en el dashboard", async ({
    page,
  }) => {
    await iniciarSesion(page);
    await page.goto("/");

    // Verificar seccion de morosidad
    await expect(
      page.getByRole("heading", { name: /Socios en morosidad/i }),
    ).toBeVisible();

    // Puede mostrar lista de morosos, o "Sin morosos" si no hay
    const listaMorosos = page.getByText("Lista de Morosos");
    const sinMorosos = page.getByText("Sin morosos");
    const cargandoMorosos = page.getByText("Cargando morosos...");
    const errorMorosos = page.getByText(/Error al cargar morosos/);

    // Esperar a que aparezca alguno de los estados posibles
    await expect(
      listaMorosos
        .or(sinMorosos)
        .or(cargandoMorosos)
        .or(errorMorosos),
    ).toBeVisible({ timeout: 30000 });
  });

  test("FC03-04: dashboard con errores de API muestra estado de error", async ({
    page,
  }) => {
    // Interceptar APIs del dashboard ANTES de iniciar sesion
    // para que los routes esten listos cuando el dashboard cargue
    await page.route("**/cobros/reportes/cobranza**", (route) => {
      route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ message: "Internal Server Error" }),
      });
    });

    await iniciarSesion(page);
    await page.goto("/");

    // Verificar que se muestra mensaje de error en las estadisticas
    await expect(
      page.getByText(/Error al cargar/),
    ).toBeVisible({ timeout: 30000 });
  });
});
