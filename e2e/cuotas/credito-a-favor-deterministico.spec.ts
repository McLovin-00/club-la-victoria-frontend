import { expect, test, type APIRequestContext, type APIResponse, type Page } from "@playwright/test";

import { iniciarSesion } from "../helpers/auth";

const API_URL = process.env.E2E_API_URL ?? "http://127.0.0.1:3001/api/v1";
const usuarioAdmin = process.env.E2E_USER ?? "admin";
const passwordAdmin = process.env.E2E_PASS ?? "admin";

type SocioResponse = {
  id?: number;
};

type CuotaResponse = {
  id: number;
  periodo: string;
  monto: number;
  estado: "PENDIENTE" | "PAGADA";
};

type CuotasResponse = {
  cuotas: CuotaResponse[];
};

type CuentaCorrienteResponse = {
  creditoIndividual: number;
  cuotas: CuotaResponse[];
};

type MetodoPagoResponse = {
  id: number;
  nombre: string;
};

const crearSufijo = (): string => `${Date.now()}${Math.floor(Math.random() * 1000)}`;

const crearPeriodosActuales = (): [string, string] => {
  const anio = new Date().getFullYear();
  const mesActual = new Date().getMonth() + 1;
  const primerMes = mesActual >= 12 ? 11 : mesActual;
  const segundoMes = primerMes + 1;

  return [
    `${anio}-${String(primerMes).padStart(2, "0")}`,
    `${anio}-${String(segundoMes).padStart(2, "0")}`,
  ];
};

const parseJson = async <T>(response: APIResponse): Promise<T> => {
  return (await response.json()) as T;
};

const expectOk = async (response: APIResponse, accion: string): Promise<void> => {
  const body = await response.text();
  expect(response.ok(), `${accion} fallo con ${response.status()}: ${body}`).toBeTruthy();
};

const loginApi = async (request: APIRequestContext): Promise<string> => {
  const response = await request.post(`${API_URL}/auth/login`, {
    data: {
      usuario: usuarioAdmin,
      password: passwordAdmin,
    },
  });

  await expectOk(response, "login API");

  const text = await response.text();
  try {
    return JSON.parse(text) as string;
  } catch {
    return text;
  }
};

const authHeaders = (token: string): Record<string, string> => ({
  Authorization: `Bearer ${token}`,
});

const crearSocio = async (
  request: APIRequestContext,
  token: string,
  sufijo: string,
): Promise<{ id: number; dni: string; nombre: string; apellido: string }> => {
  const dni = sufijo.slice(-8);
  const nombre = `E2ECred${sufijo.slice(-4)}`;
  const apellido = `Credito${sufijo.slice(-5)}`;

  const response = await request.post(`${API_URL}/socios`, {
    headers: authHeaders(token),
    multipart: {
      nombre,
      apellido,
      dni,
      telefono: `11${sufijo.slice(-8)}`,
      email: `e2e.credito.${sufijo.slice(-6)}@test.local`,
      fechaNacimiento: "1990-06-15",
      direccion: `Calle Credito ${sufijo}`,
      estado: "ACTIVO",
      genero: "MASCULINO",
      overrideManual: "false",
      tarjetaCentro: "false",
    },
  });

  await expectOk(response, "crear socio");
  const socio = await parseJson<SocioResponse>(response);
  expect(socio.id, "la respuesta de socio debe incluir id").toEqual(expect.any(Number));

  return { id: socio.id!, dni, nombre, apellido };
};

const generarCuota = async (
  request: APIRequestContext,
  token: string,
  socioId: number,
  periodo: string,
): Promise<void> => {
  const response = await request.post(`${API_URL}/cobros/generar-seleccion`, {
    headers: authHeaders(token),
    data: {
      periodo,
      socioIds: [socioId],
    },
  });

  await expectOk(response, `generar cuota ${periodo}`);
};

const obtenerCuotaPendiente = async (
  request: APIRequestContext,
  token: string,
  socioId: number,
  periodo: string,
): Promise<CuotaResponse> => {
  const response = await request.get(`${API_URL}/cobros/cuotas`, {
    headers: authHeaders(token),
    params: {
      socioId,
      periodo,
      estado: "PENDIENTE",
      limit: 100,
    },
  });

  await expectOk(response, `obtener cuota ${periodo}`);
  const data = await parseJson<CuotasResponse>(response);
  const cuota = data.cuotas.find((item) => item.periodo === periodo);
  expect(cuota, `debe existir cuota pendiente ${periodo}`).toBeDefined();
  return { ...cuota!, monto: Number(cuota!.monto) };
};

const obtenerMetodoPago = async (
  request: APIRequestContext,
  token: string,
): Promise<MetodoPagoResponse> => {
  const response = await request.get(`${API_URL}/metodos-pago`, {
    headers: authHeaders(token),
  });

  await expectOk(response, "obtener metodos de pago");
  const metodos = await parseJson<MetodoPagoResponse[]>(response);
  expect(metodos.length, "debe existir al menos un metodo de pago activo").toBeGreaterThan(0);
  return metodos[0];
};

const obtenerCuentaCorriente = async (
  request: APIRequestContext,
  token: string,
  socioId: number,
): Promise<CuentaCorrienteResponse> => {
  const response = await request.get(`${API_URL}/cobros/cuenta-corriente/${socioId}`, {
    headers: authHeaders(token),
  });

  await expectOk(response, "obtener cuenta corriente");
  const cuenta = await parseJson<CuentaCorrienteResponse>(response);
  return {
    ...cuenta,
    creditoIndividual: Number(cuenta.creditoIndividual),
    cuotas: cuenta.cuotas.map((cuota) => ({
      ...cuota,
      monto: Number(cuota.monto),
    })),
  };
};

const registrarPago = async (
  request: APIRequestContext,
  token: string,
  cuotaId: number,
  metodoPagoId: number,
  montoPagado: number,
): Promise<void> => {
  const response = await request.post(`${API_URL}/cobros/pagos`, {
    headers: authHeaders(token),
    data: {
      cuotaId,
      metodoPagoId,
      montoPagado,
    },
  });

  await expectOk(response, `registrar pago cuota ${cuotaId}`);
};

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

const abrirCuentaCorriente = async (page: Page, socioId: number): Promise<void> => {
  await page.goto(`/socios/${socioId}/cuenta-corriente`);
  await expect(page.getByText(/^Cuenta Corriente$/).first()).toBeVisible({ timeout: 10000 });
};

test.describe.serial("Credito a favor deterministico", () => {
  let token: string;
  let socioId: number | undefined;

  test.beforeAll(async ({ request }) => {
    token = await loginApi(request);
  });

  test.afterAll(async ({ request }) => {
    if (!token || !socioId) {
      return;
    }

    const response = await request.delete(`${API_URL}/socios/${socioId}`, {
      headers: authHeaders(token),
    });

    if (!response.ok() && response.status() !== 404) {
      console.warn(`No se pudo eliminar el socio E2E ${socioId}: ${response.status()}`);
    }
  });

  test("crea credito con excedente y lo consume con pago $0", async ({ page, request }) => {
    const sufijo = crearSufijo();
    const socio = await crearSocio(request, token, sufijo);
    socioId = socio.id;
    const [periodoConExcedente, periodoCubiertoPorCredito] = crearPeriodosActuales();

    await generarCuota(request, token, socioId, periodoConExcedente);
    await generarCuota(request, token, socioId, periodoCubiertoPorCredito);

    const cuotaConExcedente = await obtenerCuotaPendiente(
      request,
      token,
      socioId,
      periodoConExcedente,
    );
    const cuotaCubiertaPorCredito = await obtenerCuotaPendiente(
      request,
      token,
      socioId,
      periodoCubiertoPorCredito,
    );
    const metodoPago = await obtenerMetodoPago(request, token);

    await registrarPago(
      request,
      token,
      cuotaConExcedente.id,
      metodoPago.id,
      cuotaConExcedente.monto + cuotaCubiertaPorCredito.monto,
    );

    const cuentaConCredito = await obtenerCuentaCorriente(request, token, socioId);
    expect(cuentaConCredito.creditoIndividual).toBe(cuotaCubiertaPorCredito.monto);

    await iniciarSesion(page);
    await abrirCuentaCorriente(page, socioId);
    await expect(page.getByText(/Crédito a favor/i).first()).toBeVisible();
    await expect(page.getByText(formatCurrency(cuotaCubiertaPorCredito.monto)).first()).toBeVisible();

    await registrarPago(request, token, cuotaCubiertaPorCredito.id, metodoPago.id, 0);

    const cuentaSinCredito = await obtenerCuentaCorriente(request, token, socioId);
    expect(cuentaSinCredito.creditoIndividual).toBe(0);
    expect(
      cuentaSinCredito.cuotas.filter((cuota) => cuota.estado === "PAGADA"),
    ).toHaveLength(2);

    await abrirCuentaCorriente(page, socioId);
    await expect(page.getByText(/Crédito a favor/i)).toHaveCount(0);
  });
});
