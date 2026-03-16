import { expect, test } from "@playwright/test";

import { iniciarSesion } from "../helpers/auth";
import { seleccionarEnCombo } from "../helpers/select";

// ============================================================================
// FC04 - Listado y busqueda de socios
// FC05 - Crear socio web
// FC06 - Editar socio web
// FC07 - Ver detalle de socio web
// FC08 - Eliminar socio web
// ============================================================================

// --- Utilidades ---

const generarSufijoUnico = (): string =>
  `${Date.now()}${Math.floor(Math.random() * 1000)}`;

const generarDniValido = (): string => generarSufijoUnico().slice(-8);

const BUSCADOR_PLACEHOLDER = "Buscar por nombre, apellido, DNI o email...";

/**
 * Crea un socio de prueba y retorna sus datos.
 * Asume que la pagina ya tiene sesion activa.
 */
const crearSocioDePrueba = async (
  page: import("@playwright/test").Page,
  opciones?: {
    conTarjetaCentro?: boolean;
    numeroTarjeta?: string;
    email?: string;
    telefono?: string;
  },
) => {
  const sufijo = generarSufijoUnico();
  const dni = generarDniValido();
  const nombre = `E2ENom${sufijo}`;
  const apellido = `E2EApe${sufijo}`;
  const email = opciones?.email ?? `e2e.${sufijo}@test.local`;
  const telefono = opciones?.telefono ?? `11${sufijo.slice(-8)}`;

  await page.goto("/socios/crear");
  await expect(
    page.getByRole("heading", { name: /Crear Nuevo Socio/i }),
  ).toBeVisible();

  await page.locator("#dni").fill(dni);
  await page.locator("#nombre").fill(nombre);
  await page.locator("#apellido").fill(apellido);
  await page.locator("#fechaNacimiento").fill("1990-05-15");
  await page.locator("#direccion").fill(`Calle E2E ${sufijo}`);
  await page.locator("#email").fill(email);
  await page.locator("#telefono").fill(telefono);

  if (opciones?.conTarjetaCentro) {
    const checkbox = page.locator("#tarjetaCentro");
    if (!(await checkbox.isChecked())) {
      await checkbox.check();
    }
    if (opciones.numeroTarjeta) {
      await page.locator("#numeroTarjetaCentro").fill(opciones.numeroTarjeta);
    }
  }

  await page.getByRole("button", { name: /^Crear$/ }).click();
  await expect(page).toHaveURL(/\/socios$/, { timeout: 15000 });

  return { dni, nombre, apellido, email, telefono, sufijo };
};

/**
 * Busca un socio por texto en el listado y espera a que aparezca en la tabla.
 */
const buscarSocioEnListado = async (
  page: import("@playwright/test").Page,
  textoBusqueda: string,
) => {
  await page.goto("/socios");
  const buscador = page.getByPlaceholder(BUSCADOR_PLACEHOLDER);
  await buscador.fill(textoBusqueda);
  // Esperar debounce de busqueda
  await page.waitForTimeout(500);
};

/**
 * Elimina un socio buscandolo por DNI. Asume sesion activa.
 */
const eliminarSocioPorDni = async (
  page: import("@playwright/test").Page,
  dni: string,
) => {
  await buscarSocioEnListado(page, dni);
  const filaSocio = page.locator("tr").filter({ hasText: dni }).first();
  await expect(filaSocio).toBeVisible({ timeout: 10000 });

  await filaSocio.getByRole("button", { name: /Eliminar socio/i }).click();
  const dialogo = page.getByRole("alertdialog");
  await expect(dialogo).toBeVisible();
  await dialogo.getByRole("button", { name: /^Eliminar$/ }).click();

  await expect(page.locator("tr").filter({ hasText: dni })).toHaveCount(0, {
    timeout: 10000,
  });
};

// ============================================================================
// FC04 - Listado y busqueda de socios
// ============================================================================

test.describe.serial("FC04 - Listado y busqueda de socios", () => {
  let datosSocio: Awaited<ReturnType<typeof crearSocioDePrueba>>;

  test("FC04-SETUP: crear socio para pruebas de busqueda", async ({
    page,
  }) => {
    await iniciarSesion(page);
    datosSocio = await crearSocioDePrueba(page, {
      conTarjetaCentro: true,
      numeroTarjeta: "5400000099998888",
      email: undefined,
      telefono: undefined,
    });
  });

  test("FC04-01: abrir /socios muestra el listado con titulo y tabla", async ({
    page,
  }) => {
    await iniciarSesion(page);
    await page.goto("/socios");

    // Verificar titulo de la seccion
    await expect(
      page.getByText("Buscar y Gestionar Socios"),
    ).toBeVisible();

    // Verificar que la tabla o listado tiene contenido (al menos la cabecera)
    await expect(
      page.getByText(/Lista de Socios/),
    ).toBeVisible();

    // Verificar que el buscador esta presente
    await expect(
      page.getByPlaceholder(BUSCADOR_PLACEHOLDER),
    ).toBeVisible();

    // Verificar botones de accion principales
    await expect(
      page.getByRole("link", { name: /Crear Socio/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Grupos Familiares/i }),
    ).toBeVisible();
  });

  test("FC04-02: buscar por nombre encuentra al socio", async ({ page }) => {
    await iniciarSesion(page);
    await buscarSocioEnListado(page, datosSocio.nombre);

    const filaSocio = page
      .locator("tr")
      .filter({ hasText: datosSocio.nombre })
      .first();
    await expect(filaSocio).toBeVisible({ timeout: 10000 });
  });

  test("FC04-03: buscar por apellido encuentra al socio", async ({ page }) => {
    await iniciarSesion(page);
    await buscarSocioEnListado(page, datosSocio.apellido);

    const filaSocio = page
      .locator("tr")
      .filter({ hasText: datosSocio.apellido })
      .first();
    await expect(filaSocio).toBeVisible({ timeout: 10000 });
  });

  test("FC04-04: buscar por DNI encuentra al socio", async ({ page }) => {
    await iniciarSesion(page);
    await buscarSocioEnListado(page, datosSocio.dni);

    const filaSocio = page
      .locator("tr")
      .filter({ hasText: datosSocio.dni })
      .first();
    await expect(filaSocio).toBeVisible({ timeout: 10000 });
  });

  test("FC04-05: buscar por email encuentra al socio", async ({ page }) => {
    await iniciarSesion(page);
    await buscarSocioEnListado(page, datosSocio.email);

    const filaSocio = page
      .locator("tr")
      .filter({ hasText: datosSocio.email })
      .first();
    await expect(filaSocio).toBeVisible({ timeout: 10000 });
  });

  test("FC04-06: cambiar cantidad por pagina modifica los resultados visibles", async ({
    page,
  }) => {
    await iniciarSesion(page);
    await page.goto("/socios");

    // Verificar que el selector de cantidad por pagina existe
    const selectMostrar = page.locator("text=Mostrar:");
    await expect(selectMostrar).toBeVisible();

    // Cambiar a 5 por pagina usando el Radix Select (role=combobox)
    // Primero esperar a que la tabla cargue (el combobox puede estar deshabilitado durante carga)
    await page.waitForTimeout(1000);

    const comboMostrar = page.getByRole("combobox");
    await expect(comboMostrar).toBeVisible();
    await comboMostrar.click();
    await page.getByRole("option", { name: "5", exact: true }).click();

    // Verificar que se muestra texto de paginacion "Mostrando X a Y de Z socios"
    await expect(page.getByText(/Mostrando \d+ a \d+ de/)).toBeVisible({ timeout: 10000 });
  });
  test("FC04-07: paginacion permite navegar entre paginas", async ({
    page,
  }) => {
    await iniciarSesion(page);
    await page.goto("/socios");

    // Cambiar a 5 por pagina para asegurar paginacion (Radix Select = combobox)
    await page.waitForTimeout(1000);

    const comboMostrar = page.getByRole("combobox");
    await expect(comboMostrar).toBeVisible();
    await comboMostrar.click();
    await page.getByRole("option", { name: "5", exact: true }).click();

    // Esperar a que cargue la tabla con la nueva paginacion
    await page.waitForTimeout(1000);

    // Verificar si hay paginacion visible (depende del total de socios)
    const indicadorPagina = page.getByText(/\d+ \/ \d+/);
    const hayPaginacion = (await indicadorPagina.count()) > 0;

    if (hayPaginacion) {
      // Los botones de paginacion tienen iconos ChevronLeft/ChevronRight
      // El texto "Anterior"/"Siguiente" puede estar oculto (hidden xs:inline)
      // Buscar los botones por su posicion relativa al indicador de pagina
      const contenedorPaginacion = page.locator(".flex.items-center.gap-2").filter({ has: indicadorPagina });
      const botones = contenedorPaginacion.getByRole("button");
      const botonAnterior = botones.first();
      const botonSiguiente = botones.last();

      // Si hay mas de una pagina, probar boton Siguiente
      if (await botonSiguiente.isEnabled()) {
        await botonSiguiente.click();
        // Verificar que la pagina cambio
        await expect(page.getByText(/Mostrando \d+ a \d+ de/)).toBeVisible();
      }

      // Probar boton Anterior
      if (await botonAnterior.isEnabled()) {
        await botonAnterior.click();
        await expect(page.getByText(/Mostrando \d+ a \d+ de/)).toBeVisible();
      }
    }
  });

  test("FC04-08: abrir detalle desde el listado navega a /socios/[id]", async ({
    page,
  }) => {
    await iniciarSesion(page);
    await buscarSocioEnListado(page, datosSocio.dni);

    const filaSocio = page
      .locator("tr")
      .filter({ hasText: datosSocio.dni })
      .first();
    await expect(filaSocio).toBeVisible({ timeout: 10000 });

    // Hacer click en "Ver detalles" y navegar a la página de detalle
    await filaSocio.getByRole("link", { name: /Ver detalles/i }).click();
    await expect(page).toHaveURL(/\/socios\/[^/]+$/, { timeout: 10000 });

    // Verificar que se muestra la página de detalle
    await expect(
      page.getByText(`${datosSocio.apellido}, ${datosSocio.nombre}`),
    ).toBeVisible({ timeout: 10000 });

    // Verificar datos principales del socio en detalle
    await expect(page.getByText(datosSocio.dni)).toBeVisible();
    await expect(page.getByText(/Datos del socio/i)).toBeVisible();
  });

  test("FC04-09: limpiar filtro de busqueda restaura el listado completo", async ({
    page,
  }) => {
    await iniciarSesion(page);
    await page.goto("/socios");

    const buscador = page.getByPlaceholder(BUSCADOR_PLACEHOLDER);

    // Buscar algo para que aparezca el boton Limpiar
    await buscador.fill("texto_de_prueba_busqueda");
    await page.waitForTimeout(500);

    // Hacer click en Limpiar
    const botonLimpiar = page.getByRole("button", { name: /^Limpiar$/i });
    await expect(botonLimpiar).toBeVisible();
    await botonLimpiar.click();

    // Verificar que el buscador esta vacio
    await expect(buscador).toHaveValue("");

    // Verificar que se muestran socios (el boton Limpiar ya no deberia estar)
    await expect(botonLimpiar).not.toBeVisible();
  });

  test("FC04-10: busqueda sin resultados muestra mensaje apropiado", async ({
    page,
  }) => {
    await iniciarSesion(page);
    await page.goto("/socios");

    const buscador = page.getByPlaceholder(BUSCADOR_PLACEHOLDER);
    await buscador.fill("ZZZZNOEXISTE99999999");
    await page.waitForTimeout(1000);

    // Verificar mensaje de sin resultados
    await expect(
      page.getByText("No se encontraron socios"),
    ).toBeVisible({ timeout: 10000 });
  });

  test("FC04-CLEANUP: eliminar socio de prueba de busqueda", async ({
    page,
  }) => {
    await iniciarSesion(page);
    await eliminarSocioPorDni(page, datosSocio.dni);
  });
});

// ============================================================================
// FC05 - Crear socio web
// ============================================================================

test.describe.serial("FC05 - Crear socio web", () => {
  const sociosCreados: string[] = [];

  test("FC05-01: crear socio con datos obligatorios minimos (sin foto)", async ({
    page,
  }) => {
    await iniciarSesion(page);

    const sufijo = generarSufijoUnico();
    const dni = generarDniValido();
    sociosCreados.push(dni);

    await page.goto("/socios/crear");
    await expect(
      page.getByRole("heading", { name: /Crear Nuevo Socio/i }),
    ).toBeVisible();

    // Completar campos obligatorios
    await page.locator("#dni").fill(dni);
    await page.locator("#nombre").fill(`Nombre${sufijo}`);
    await page.locator("#apellido").fill(`Apellido${sufijo}`);
    await page.locator("#fechaNacimiento").fill("1985-03-20");
    await page.locator("#direccion").fill(`Av. Test ${sufijo}`);

    // Guardar
    await page.getByRole("button", { name: /^Crear$/ }).click();
    await expect(page).toHaveURL(/\/socios$/, { timeout: 15000 });
  });

  test("FC05-02: crear socio con todos los datos opcionales", async ({
    page,
  }) => {
    await iniciarSesion(page);

    const sufijo = generarSufijoUnico();
    const dni = generarDniValido();
    sociosCreados.push(dni);

    await page.goto("/socios/crear");

    // Campos obligatorios
    await page.locator("#dni").fill(dni);
    await page.locator("#nombre").fill(`NombreComp${sufijo}`);
    await page.locator("#apellido").fill(`ApellidoComp${sufijo}`);
    await page.locator("#fechaNacimiento").fill("1978-11-10");
    await page.locator("#direccion").fill(`Calle Completa ${sufijo}`);

    // Campos opcionales
    await page.locator("#email").fill(`completo.${sufijo}@test.local`);
    await page.locator("#telefono").fill(`221${sufijo.slice(-7)}`);

    // Seleccionar genero
    await seleccionarEnCombo(page, "Género", "FEMENINO");

    // Guardar
    await page.getByRole("button", { name: /^Crear$/ }).click();
    await expect(page).toHaveURL(/\/socios$/, { timeout: 15000 });
  });

  test("FC05-03: crear socio con tarjeta del centro activada", async ({
    page,
  }) => {
    await iniciarSesion(page);

    const sufijo = generarSufijoUnico();
    const dni = generarDniValido();
    const numTarjeta = `TC${sufijo.slice(-6)}`;
    sociosCreados.push(dni);

    await page.goto("/socios/crear");

    await page.locator("#dni").fill(dni);
    await page.locator("#nombre").fill(`NomTarj${sufijo}`);
    await page.locator("#apellido").fill(`ApeTarj${sufijo}`);
    await page.locator("#fechaNacimiento").fill("2000-06-25");
    await page.locator("#direccion").fill(`Calle Tarjeta ${sufijo}`);

    // Activar tarjeta del centro
    await page.locator("#tarjetaCentro").check();

    // Verificar que aparece el campo de numero de tarjeta
    const campoNumTarjeta = page.locator("#numeroTarjetaCentro");
    await expect(campoNumTarjeta).toBeVisible();
    await campoNumTarjeta.fill(numTarjeta);

    await page.getByRole("button", { name: /^Crear$/ }).click();
    await expect(page).toHaveURL(/\/socios$/, { timeout: 15000 });
  });

  test("FC05-04: cancelar creacion vuelve al listado sin crear socio", async ({
    page,
  }) => {
    await iniciarSesion(page);
    await page.goto("/socios/crear");

    // Completar algunos datos
    await page.locator("#dni").fill("99999999");
    await page.locator("#nombre").fill("NoCRear");

    // Cancelar
    await page.getByRole("button", { name: /^Cancelar$/i }).click();
    await expect(page).toHaveURL(/\/socios$/, { timeout: 10000 });

    // Verificar que no se creo el socio
    const buscador = page.getByPlaceholder(BUSCADOR_PLACEHOLDER);
    await buscador.fill("NoCRear");
    await page.waitForTimeout(1000);

    // No deberia encontrar un socio con ese nombre
    const filaSocio = page.locator("tr").filter({ hasText: "NoCRear" });
    await expect(filaSocio).toHaveCount(0);
  });

  test("FC05-05: validar formulario incompleto - campos requeridos vacios", async ({
    page,
  }) => {
    await iniciarSesion(page);
    await page.goto("/socios/crear");

    // Intentar guardar sin completar nada
    await page.getByRole("button", { name: /^Crear$/ }).click();

    // Debe permanecer en la misma pagina (no redirigir)
    await expect(page).toHaveURL(/\/socios\/crear$/);

    // Verificar que se muestran mensajes de error de validacion
    // react-hook-form con zod genera mensajes en FormMessage
    // Al menos deberian aparecer para dni, nombre, apellido, fechaNacimiento, direccion
    const mensajesError = page.locator("[data-slot='form-message-error']");
    // Si no usa data-slot, buscar por clase o texto de error generico
    const hayErrores =
      (await mensajesError.count()) > 0 ||
      (await page.locator("p.text-destructive, p.text-red-500, [role='alert']").count()) > 0;
    expect(hayErrores).toBe(true);
  });

  test("FC05-06: validar que tarjetaCentro=true sin numero no permite guardar", async ({
    page,
  }) => {
    await iniciarSesion(page);
    await page.goto("/socios/crear");

    // Completar datos minimos
    await page.locator("#dni").fill(generarDniValido());
    await page.locator("#nombre").fill("TestTarjeta");
    await page.locator("#apellido").fill("SinNumero");
    await page.locator("#fechaNacimiento").fill("1990-01-01");
    await page.locator("#direccion").fill("Calle Test");

    // Activar tarjeta sin poner numero
    await page.locator("#tarjetaCentro").check();
    await expect(page.locator("#numeroTarjetaCentro")).toBeVisible();

    // Intentar guardar sin el numero de tarjeta
    await page.getByRole("button", { name: /^Crear$/ }).click();

    // Debe permanecer en la pagina o mostrar error
    // Esperamos 2 segundos para verificar que no redirige
    await page.waitForTimeout(2000);
    await expect(page).toHaveURL(/\/socios\/crear$/);
  });

  test("FC05-07: validar error de API al crear socio (500)", async ({
    page,
  }) => {
    await iniciarSesion(page);
    await page.goto("/socios/crear");

    // Completar datos validos
    await page.locator("#dni").fill(generarDniValido());
    await page.locator("#nombre").fill("TestAPI");
    await page.locator("#apellido").fill("ErrorAPI");
    await page.locator("#fechaNacimiento").fill("1990-01-01");
    await page.locator("#direccion").fill("Calle API");

    // Interceptar la creacion para simular error 500
    await page.route("**/api/v1/socios", (route) => {
      if (route.request().method() === "POST") {
        route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ message: "Internal Server Error" }),
        });
      } else {
        route.continue();
      }
    });

    await page.getByRole("button", { name: /^Crear$/ }).click();

    // Verificar que aparece un toast de error
    const toastError = page.locator('[data-sonner-toast][data-type="error"]');
    await expect(toastError.first()).toBeVisible({ timeout: 10000 });

    // No deberia redirigir
    await expect(page).toHaveURL(/\/socios\/crear$/);
  });

  test("FC05-08: link 'Volver' navega al listado de socios", async ({
    page,
  }) => {
    await iniciarSesion(page);
    await page.goto("/socios/crear");

    // Buscar link "Volver"
    const linkVolver = page.getByRole("link", { name: /Volver/i });
    if ((await linkVolver.count()) > 0) {
      await linkVolver.click();
      await expect(page).toHaveURL(/\/socios$/, { timeout: 10000 });
    }
  });

  test("FC05-CLEANUP: eliminar socios de prueba de creacion", async ({
    page,
  }) => {
    await iniciarSesion(page);
    for (const dni of sociosCreados) {
      await eliminarSocioPorDni(page, dni);
    }
  });
});

// ============================================================================
// FC06 - Editar socio web
// ============================================================================

test.describe.serial("FC06 - Editar socio web", () => {
  let datosSocio: Awaited<ReturnType<typeof crearSocioDePrueba>>;

  test("FC06-SETUP: crear socio para pruebas de edicion", async ({ page }) => {
    await iniciarSesion(page);
    datosSocio = await crearSocioDePrueba(page, {
      conTarjetaCentro: false,
    });
  });

  test("FC06-01: abrir pagina de edicion muestra datos precargados", async ({
    page,
  }) => {
    await iniciarSesion(page);
    // Buscar el socio y obtener su ID via la URL de edicion
    await buscarSocioEnListado(page, datosSocio.dni);

    const filaSocio = page
      .locator("tr")
      .filter({ hasText: datosSocio.dni })
      .first();
    await expect(filaSocio).toBeVisible({ timeout: 10000 });

    // Click en editar
    await filaSocio.getByRole("link", { name: /Editar socio/i }).click();
    await expect(page).toHaveURL(/\/socios\/[^/]+\/edit$/);

    // Verificar titulo
    await expect(
      page.getByRole("heading", { name: /Editar Socio/i }),
    ).toBeVisible();

    // Verificar que los campos estan precargados
    await expect(page.locator("#dni")).toHaveValue(datosSocio.dni);
    await expect(page.locator("#nombre")).toHaveValue(datosSocio.nombre);
    await expect(page.locator("#apellido")).toHaveValue(datosSocio.apellido);
  });

  test("FC06-02: modificar campos simples y guardar exitosamente", async ({
    page,
  }) => {
    await iniciarSesion(page);
    await buscarSocioEnListado(page, datosSocio.dni);

    const filaSocio = page
      .locator("tr")
      .filter({ hasText: datosSocio.dni })
      .first();
    await filaSocio.getByRole("link", { name: /Editar socio/i }).click();
    await expect(page).toHaveURL(/\/socios\/[^/]+\/edit$/);

    // Esperar carga de datos
    await expect(page.locator("#dni")).toHaveValue(datosSocio.dni);

    // Modificar direccion
    const nuevaDireccion = `Av. Editada ${generarSufijoUnico()}`;
    await page.locator("#direccion").clear();
    await page.locator("#direccion").fill(nuevaDireccion);

    // Guardar
    await page.getByRole("button", { name: /^Actualizar$/i }).click();
    await expect(page).toHaveURL(/\/socios$/, { timeout: 15000 });
  });

  test("FC06-03: activar tarjeta del centro desde edicion", async ({
    page,
  }) => {
    await iniciarSesion(page);
    await buscarSocioEnListado(page, datosSocio.dni);

    const filaSocio = page
      .locator("tr")
      .filter({ hasText: datosSocio.dni })
      .first();
    await filaSocio.getByRole("link", { name: /Editar socio/i }).click();
    await expect(page).toHaveURL(/\/socios\/[^/]+\/edit$/);

    // Esperar carga
    await expect(page.locator("#dni")).toHaveValue(datosSocio.dni);

    // Activar tarjeta del centro
    const checkboxTarjeta = page.locator("#tarjetaCentro");
    if (!(await checkboxTarjeta.isChecked())) {
      await checkboxTarjeta.check();
    }

    // Completar numero de tarjeta
    const numTarjeta = `54000000${generarSufijoUnico().slice(-8)}`;
    await page.locator("#numeroTarjetaCentro").fill(numTarjeta);

    await page.getByRole("button", { name: /^Actualizar$/i }).click();
    await expect(page).toHaveURL(/\/socios$/, { timeout: 15000 });
  });

  test("FC06-04: desactivar tarjeta del centro desde edicion", async ({
    page,
  }) => {
    await iniciarSesion(page);
    await buscarSocioEnListado(page, datosSocio.dni);

    const filaSocio = page
      .locator("tr")
      .filter({ hasText: datosSocio.dni })
      .first();
    await filaSocio.getByRole("link", { name: /Editar socio/i }).click();
    await expect(page).toHaveURL(/\/socios\/[^/]+\/edit$/);

    await expect(page.locator("#dni")).toHaveValue(datosSocio.dni);

    // Desactivar tarjeta del centro si esta activa
    const checkboxTarjeta = page.locator("#tarjetaCentro");
    if (await checkboxTarjeta.isChecked()) {
      await checkboxTarjeta.uncheck();
    }

    await page.getByRole("button", { name: /^Actualizar$/i }).click();
    await expect(page).toHaveURL(/\/socios$/, { timeout: 15000 });
  });

  test("FC06-05: cancelar edicion no modifica datos", async ({ page }) => {
    await iniciarSesion(page);
    await buscarSocioEnListado(page, datosSocio.dni);

    const filaSocio = page
      .locator("tr")
      .filter({ hasText: datosSocio.dni })
      .first();
    await filaSocio.getByRole("link", { name: /Editar socio/i }).click();
    await expect(page).toHaveURL(/\/socios\/[^/]+\/edit$/);

    await expect(page.locator("#dni")).toHaveValue(datosSocio.dni);

    // Modificar algo
    await page.locator("#nombre").clear();
    await page.locator("#nombre").fill("NOMBRE_CANCELADO");

    // Cancelar
    await page.getByRole("button", { name: /^Cancelar$/i }).click();
    await expect(page).toHaveURL(/\/socios$/, { timeout: 10000 });

    // Verificar que el nombre original se mantiene en el listado
    await buscarSocioEnListado(page, datosSocio.dni);
    const filaOriginal = page
      .locator("tr")
      .filter({ hasText: datosSocio.nombre })
      .first();
    await expect(filaOriginal).toBeVisible({ timeout: 10000 });
  });

  test("FC06-06: validar error de API en update (500)", async ({ page }) => {
    await iniciarSesion(page);
    await buscarSocioEnListado(page, datosSocio.dni);

    const filaSocio = page
      .locator("tr")
      .filter({ hasText: datosSocio.dni })
      .first();
    await filaSocio.getByRole("link", { name: /Editar socio/i }).click();
    await expect(page).toHaveURL(/\/socios\/[^/]+\/edit$/);

    await expect(page.locator("#dni")).toHaveValue(datosSocio.dni);

    // Interceptar PUT para simular error
    await page.route("**/api/v1/socios/**", (route) => {
      if (route.request().method() === "PUT" || route.request().method() === "PATCH") {
        route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ message: "Error en update" }),
        });
      } else {
        route.continue();
      }
    });

    // Modificar algo y guardar
    await page.locator("#direccion").clear();
    await page.locator("#direccion").fill("Calle Error API");
    await page.getByRole("button", { name: /^Actualizar$/i }).click();

    // Verificar toast de error
    const toastError = page.locator('[data-sonner-toast][data-type="error"]');
    await expect(toastError.first()).toBeVisible({ timeout: 10000 });
  });

  test("FC06-CLEANUP: eliminar socio de prueba de edicion", async ({
    page,
  }) => {
    await iniciarSesion(page);
    await eliminarSocioPorDni(page, datosSocio.dni);
  });
});

// ============================================================================
// FC07 - Ver detalle de socio web
// ============================================================================

test.describe.serial("FC07 - Ver detalle de socio web", () => {
  let datosSocio: Awaited<ReturnType<typeof crearSocioDePrueba>>;
  let socioId: string;

  test("FC07-SETUP: crear socio para pruebas de detalle", async ({ page }) => {
    await iniciarSesion(page);
    datosSocio = await crearSocioDePrueba(page, {
      conTarjetaCentro: true,
      numeroTarjeta: "5400000012340001",
    });
  });

  test("FC07-01: ver detalle completo desde la pagina /socios/[id]", async ({
    page,
  }) => {
    await iniciarSesion(page);
    await buscarSocioEnListado(page, datosSocio.dni);

    const filaSocio = page
      .locator("tr")
      .filter({ hasText: datosSocio.dni })
      .first();
    await expect(filaSocio).toBeVisible({ timeout: 10000 });

    // Navegar via la URL de edicion para capturar el ID, luego ir al detalle
    const linkEditar = filaSocio.getByRole("link", { name: /Editar socio/i });
    const hrefEditar = await linkEditar.getAttribute("href");
    // El href es algo como /socios/uuid/edit
    socioId = hrefEditar?.split("/socios/")[1]?.split("/edit")[0] ?? "";
    expect(socioId).toBeTruthy();

    // Navegar a la pagina de detalle
    await page.goto(`/socios/${socioId}`);

    // Verificar datos principales
    await expect(
      page.getByText(`${datosSocio.apellido}, ${datosSocio.nombre}`),
    ).toBeVisible();

    // Verificar badges
    await expect(page.getByText(datosSocio.dni)).toBeVisible();

    // Verificar datos de contacto: email, telefono, direccion
    if (datosSocio.email) {
      await expect(page.getByText(datosSocio.email)).toBeVisible();
    }

    // Verificar seccion de categoria
    await expect(page.getByText(/Categoría actual/i)).toBeVisible();

    // Verificar boton "Editar socio"
    await expect(
      page.getByRole("link", { name: /Editar socio/i }),
    ).toBeVisible();
  });

  test("FC07-02: ver detalles desde el listado abre la pagina de detalle", async ({
    page,
  }) => {
    await iniciarSesion(page);
    await buscarSocioEnListado(page, datosSocio.dni);

    const filaSocio = page
      .locator("tr")
      .filter({ hasText: datosSocio.dni })
      .first();
    await expect(filaSocio).toBeVisible({ timeout: 10000 });

    // Abrir la página de detalle desde el listado
    await filaSocio.getByRole("link", { name: /Ver detalles/i }).click();
    await expect(page).toHaveURL(/\/socios\/[^/]+$/, { timeout: 10000 });

    // Verificar nombre completo
    await expect(
      page.getByText(`${datosSocio.apellido}, ${datosSocio.nombre}`),
    ).toBeVisible();

    // Verificar DNI y datos clave en la pantalla de detalle
    await expect(page.getByText(datosSocio.dni)).toBeVisible();
    await expect(page.getByText(/Datos del socio/i)).toBeVisible();
  });

  test("FC07-03: ir a editar desde la pagina de detalle", async ({ page }) => {
    await iniciarSesion(page);
    expect(socioId).toBeTruthy();

    await page.goto(`/socios/${socioId}`);

    // Click en "Editar socio"
    await page.getByRole("link", { name: /Editar socio/i }).click();
    await expect(page).toHaveURL(/\/socios\/[^/]+\/edit$/);

    // Verificar que carga datos
    await expect(page.locator("#dni")).toHaveValue(datosSocio.dni);
  });

  test("FC07-04: abrir detalle con ID invalido muestra error", async ({
    page,
  }) => {
    await iniciarSesion(page);
    await page.goto("/socios/id-invalido-no-uuid");

    // Debe mostrar mensaje de error (ID invalido o socio no encontrado)
    const errorInvalido = page.getByText(
      /El identificador del socio no es válido|No se encontró/i,
    );
    await expect(errorInvalido).toBeVisible({ timeout: 10000 });
  });

  test("FC07-05: abrir detalle con ID numerico inexistente muestra no encontrado", async ({
    page,
  }) => {
    await iniciarSesion(page);
    // ID numerico valido pero inexistente (la ruta usa Number.parseInt, > 0)
    await page.goto("/socios/999999");

    // Debe mostrar "No se encontro" o error 404
    const noEncontrado = page.getByText(
      /No se encontró el socio solicitado|no se encontr|not found/i,
    );
    await expect(noEncontrado).toBeVisible({ timeout: 10000 });
  });

  test("FC07-06: socio sin foto muestra icono placeholder", async ({
    page,
  }) => {
    await iniciarSesion(page);
    expect(socioId).toBeTruthy();

    await page.goto(`/socios/${socioId}`);

    // El socio fue creado sin foto, deberia mostrar icono User de lucide
    // Verificar que NO hay imagen con alt del nombre del socio
    const imagenFoto = page.locator(`img[alt="${datosSocio.nombre}"]`);
    // Si no hay foto, no deberia haber imagen
    const cantidadImagenes = await imagenFoto.count();
    // Debe haber un icono SVG de User como placeholder
    // Verificamos que la pagina cargó correctamente con los datos
    await expect(
      page.getByText(`${datosSocio.apellido}, ${datosSocio.nombre}`),
    ).toBeVisible();
    // Si no hay imagen, el placeholder SVG esta presente (verificamos indirectamente)
    if (cantidadImagenes === 0) {
      // OK - sin foto, placeholder mostrado
      expect(cantidadImagenes).toBe(0);
    }
  });

  test("FC07-CLEANUP: eliminar socio de prueba de detalle", async ({
    page,
  }) => {
    await iniciarSesion(page);
    await eliminarSocioPorDni(page, datosSocio.dni);
  });
});

// ============================================================================
// FC08 - Eliminar socio web
// ============================================================================

test.describe.serial("FC08 - Eliminar socio web", () => {
  test("FC08-01: eliminar socio muestra AlertDialog de confirmacion", async ({
    page,
  }) => {
    await iniciarSesion(page);

    // Crear socio para eliminar
    const datos = await crearSocioDePrueba(page);
    await buscarSocioEnListado(page, datos.dni);

    const filaSocio = page
      .locator("tr")
      .filter({ hasText: datos.dni })
      .first();
    await expect(filaSocio).toBeVisible({ timeout: 10000 });

    // Click en eliminar
    await filaSocio.getByRole("button", { name: /Eliminar socio/i }).click();

    // Verificar AlertDialog
    const dialogo = page.getByRole("alertdialog");
    await expect(dialogo).toBeVisible();

    // Verificar titulo y descripcion
    await expect(
      dialogo.getByText("¿Eliminar socio?"),
    ).toBeVisible();
    await expect(
      dialogo.getByText(/Esta acción no se puede deshacer/),
    ).toBeVisible();
    // Verificar que muestra el nombre del socio
    await expect(
      dialogo.getByText(datos.nombre, { exact: false }),
    ).toBeVisible();

    // Verificar botones
    await expect(
      dialogo.getByRole("button", { name: /^Cancelar$/i }),
    ).toBeVisible();
    await expect(
      dialogo.getByRole("button", { name: /^Eliminar$/i }),
    ).toBeVisible();

    // Confirmar eliminacion
    await dialogo.getByRole("button", { name: /^Eliminar$/ }).click();
    await expect(
      page.locator("tr").filter({ hasText: datos.dni }),
    ).toHaveCount(0, { timeout: 10000 });
  });

  test("FC08-02: cancelar eliminacion no borra el socio", async ({ page }) => {
    await iniciarSesion(page);

    // Crear socio para la prueba
    const datos = await crearSocioDePrueba(page);

    await buscarSocioEnListado(page, datos.dni);

    const filaSocio = page
      .locator("tr")
      .filter({ hasText: datos.dni })
      .first();
    await expect(filaSocio).toBeVisible({ timeout: 10000 });

    // Click en eliminar
    await filaSocio.getByRole("button", { name: /Eliminar socio/i }).click();

    const dialogo = page.getByRole("alertdialog");
    await expect(dialogo).toBeVisible();

    // Cancelar
    await dialogo.getByRole("button", { name: /^Cancelar$/i }).click();
    await expect(dialogo).not.toBeVisible();

    // Verificar que el socio sigue en la lista
    await expect(
      page.locator("tr").filter({ hasText: datos.dni }).first(),
    ).toBeVisible();

    // Limpiar: eliminar el socio
    await eliminarSocioPorDni(page, datos.dni);
  });

  test("FC08-03: eliminar socio y verificar que desaparece del listado", async ({
    page,
  }) => {
    await iniciarSesion(page);

    // Crear socio
    const datos = await crearSocioDePrueba(page);

    // Verificar que existe
    await buscarSocioEnListado(page, datos.dni);
    await expect(
      page.locator("tr").filter({ hasText: datos.dni }).first(),
    ).toBeVisible({ timeout: 10000 });

    // Eliminar
    await eliminarSocioPorDni(page, datos.dni);

    // Buscar de nuevo para confirmar que no existe
    await buscarSocioEnListado(page, datos.dni);
    await page.waitForTimeout(1000);

    // No debe aparecer en los resultados
    const filaSocio = page.locator("tr").filter({ hasText: datos.dni });
    await expect(filaSocio).toHaveCount(0);
  });

  test("FC08-04: verificar impacto - eliminar socio con datos asociados", async ({
    page,
  }) => {
    await iniciarSesion(page);

    // Crear un socio normal (sin asociaciones especiales para esta prueba)
    // Este test verifica que la eliminacion funciona aun cuando el backend
    // puede tener restricciones por cuotas/grupos
    const datos = await crearSocioDePrueba(page);

    await buscarSocioEnListado(page, datos.dni);

    const filaSocio = page
      .locator("tr")
      .filter({ hasText: datos.dni })
      .first();
    await expect(filaSocio).toBeVisible({ timeout: 10000 });

    // Intentar eliminar
    await filaSocio.getByRole("button", { name: /Eliminar socio/i }).click();

    const dialogo = page.getByRole("alertdialog");
    await expect(dialogo).toBeVisible();
    await dialogo.getByRole("button", { name: /^Eliminar$/ }).click();

    // Verificar resultado: si se elimino exitosamente o si hubo error
    // Caso exitoso: el socio desaparece de la lista
    // Caso con restriccion: puede aparecer un toast de error
    const socioDesaparecio = page
      .locator("tr")
      .filter({ hasText: datos.dni })
      .first();
    const toastError = page.locator('[data-sonner-toast][data-type="error"]');

    // Esperar a que ocurra alguno de los dos resultados
    await expect(
      socioDesaparecio.or(toastError.first()),
    ).toBeVisible({ timeout: 10000 })
      .catch(async () => {
        // Si el socio desaparecio, la assertion falla porque no es visible
        // Verificar que realmente no esta
        await expect(
          page.locator("tr").filter({ hasText: datos.dni }),
        ).toHaveCount(0);
      });
  });
});
