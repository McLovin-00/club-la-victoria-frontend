import { expect, test } from "@playwright/test";
import { iniciarSesion } from "../helpers/auth";

test("descarga la rendición del período seleccionado como PDF", async ({ page }) => {
  await iniciarSesion(page);
  await page.route("**/cobradores/activos", (route) => route.fulfill({
    json: [{ id: 91, nombre: "Cobradora de prueba", activo: true }],
  }));
  await page.route("**/cobradores/91/cuenta-corriente", (route) => route.fulfill({
    json: { cobradorId: 91, saldo: 0, movimientos: [] },
  }));
  await page.route("**/cobradores/91/rendicion?**", async (route) => {
    expect(route.request().headers().authorization).toMatch(/^Bearer /);
    expect(new URL(route.request().url()).searchParams.get("periodo")).toBe("2026-02");
    await route.fulfill({
      json: {
        cobrador: "Cobradora de prueba", desde: "2026-02-01", hasta: "2026-02-28",
        totalVerificadoCentavos: 1000050, cantidadImporteNoVerificable: 1,
        porMetodo: [{ metodo: "Efectivo", centavos: 600050 }, { metodo: "Transferencia", centavos: 400000 }],
        cobros: [{
          id: 1, fecha: "2026-02-10T14:00:00Z", socio: "Socio de prueba",
          conceptos: ["Cuota 2026-02", "Inscripción"], recibidoCentavos: 1000050,
          metodos: [{ metodo: "Efectivo", centavos: 600050 }, { metodo: "Transferencia", centavos: 400000 }],
        }, {
          id: 2, fecha: "2026-02-11T14:00:00Z", socio: "Otro socio ficticio",
          conceptos: ["Actividad"], recibidoCentavos: null, metodos: [],
        }],
      },
    });
  });
  await page.goto("/cobradores/cuenta-corriente");
  await page.getByLabel("Mes de rendición").fill("2026-02");
  const descarga = page.waitForEvent("download");
  await page.getByRole("button", { name: "Descargar PDF" }).click();
  const pdf = await descarga;
  expect(pdf.suggestedFilename()).toBe("rendicion-91-2026-02-01_2026-02-28.pdf");
  const contenido = await pdf.createReadStream();
  const chunks: Buffer[] = [];
  for await (const fragmento of contenido) chunks.push(Buffer.from(fragmento));
  const archivo = Buffer.concat(chunks).toString("latin1");
  const texto = [...archivo.matchAll(/\(((?:\\.|[^\\()])*)\) Tj/g)]
    .map(([, linea]) => linea).join(" ");
  expect(archivo.startsWith("%PDF-")).toBeTruthy();
  for (const fragmento of ["Cobradora de prueba", "Socio de prueba", "Cuota 2026-02", "Inscripción",
    "Efectivo", "Transferencia", "6.000,50", "4.000,00", "10.000,50", "Importe no verificable", "Total verificable"]) {
    expect(texto).toContain(fragmento);
  }
  expect(texto).not.toMatch(/comisi[oó]n|\bDNI\b/i);
});
