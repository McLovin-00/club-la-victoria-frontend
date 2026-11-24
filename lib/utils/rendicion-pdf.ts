type TotalMetodo = { metodo: string; centavos: number };

export interface Rendicion {
  cobrador: string;
  desde: string;
  hasta: string;
  totalVerificadoCentavos: number;
  cantidadImporteNoVerificable: number;
  porMetodo: TotalMetodo[];
  cobros: Array<{
    id: number;
    fecha: string;
    socio: string;
    conceptos: string[];
    recibidoCentavos: number | null;
    metodos: TotalMetodo[];
  }>;
}

const moneda = new Intl.NumberFormat("es-AR", {
  style: "currency", currency: "ARS", minimumFractionDigits: 2, maximumFractionDigits: 2,
});
const pesos = (centavos: number) => moneda.format(centavos / 100);
const fechaHora = new Intl.DateTimeFormat("es-AR", {
  timeZone: "America/Argentina/Buenos_Aires",
  dateStyle: "short",
  timeStyle: "short",
});
const fechaLocal = (iso: string) => iso.split("-").reverse().join("/");

export async function guardarPdfRendicion(cobradorId: number, rendicion: Rendicion) {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  doc.setProperties({ title: "Rendición de cobranzas", author: "Club La Victoria" });
  doc.setFontSize(18);
  doc.text("Rendición de cobranzas", 40, 42);
  doc.setFontSize(11);
  doc.text(`Club La Victoria | ${rendicion.cobrador}`, 40, 63);
  doc.text(`${fechaLocal(rendicion.desde)} al ${fechaLocal(rendicion.hasta)}`, 40, 80);

  autoTable(doc, {
    startY: 96,
    head: [["Método de pago", "Importe"]],
    body: [
      ...rendicion.porMetodo.map(({ metodo, centavos }) => [metodo, pesos(centavos)]),
      [
        rendicion.cantidadImporteNoVerificable ? "Total verificable (parcial)" : "Total recaudado",
        pesos(rendicion.totalVerificadoCentavos),
      ],
    ],
    margin: { left: 40, right: 40 },
    columnStyles: { 1: { halign: "right" } },
  });
  const tablaTotales = (doc as typeof doc & { lastAutoTable: { finalY: number } }).lastAutoTable;
  autoTable(doc, {
    startY: tablaTotales.finalY + 18,
    head: [["Fecha", "Socio y conceptos", "Métodos", "Importe recibido"]],
    body: rendicion.cobros.length === 0 ? [
      [{ content: "No se registraron cobros en el período seleccionado.", colSpan: 4 }],
    ] : rendicion.cobros.map((cobro) => [
      fechaHora.format(new Date(cobro.fecha)),
      [`#${cobro.id} · ${cobro.socio}`, ...cobro.conceptos].join("\n"),
      cobro.metodos.map(({ metodo, centavos }) => `${metodo}: ${pesos(centavos)}`).join("\n") || "—",
      cobro.recibidoCentavos === null ? "Importe no verificable" : pesos(cobro.recibidoCentavos),
    ]),
    margin: { left: 40, right: 40 },
    styles: { fontSize: 9, overflow: "linebreak", valign: "top" },
    columnStyles: { 0: { cellWidth: 78 }, 2: { cellWidth: 135 }, 3: { cellWidth: 93, halign: "right" } },
  });
  const paginas = doc.getNumberOfPages();
  for (let pagina = 1; pagina <= paginas; pagina++) {
    doc.setPage(pagina);
    doc.setFontSize(9);
    doc.text(`${pagina} / ${paginas}`, doc.internal.pageSize.getWidth() - 40, doc.internal.pageSize.getHeight() - 19, { align: "right" });
  }
  doc.save(`rendicion-${cobradorId}-${rendicion.desde}_${rendicion.hasta}.pdf`);
}
