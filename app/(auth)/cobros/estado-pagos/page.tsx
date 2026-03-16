"use client";

import { useMemo, useState } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CalendarCheck, ChevronLeft, ChevronRight, Download, Loader2, Printer } from "lucide-react";
import apiClient from "@/lib/api/client";
import {
  CategoriaSocioFiltro,
  EstadoPagosResponse,
  SocioPagosAnual,
  TarjetaCentroEstadoMes,
  useEstadoPagos,
} from "@/hooks/api/cobros/useEstadoPagos";
import { PAGINACION } from "@/lib/constants";

const meses = [
  { key: "01", label: "Enero" },
  { key: "02", label: "Febrero" },
  { key: "03", label: "Marzo" },
  { key: "04", label: "Abril" },
  { key: "05", label: "Mayo" },
  { key: "06", label: "Junio" },
  { key: "07", label: "Julio" },
  { key: "08", label: "Agosto" },
  { key: "09", label: "Septiembre" },
  { key: "10", label: "Octubre" },
  { key: "11", label: "Noviembre" },
  { key: "12", label: "Diciembre" },
];

const defaultPageSize = PAGINACION.TAMAÑO_PAGINA_POR_DEFECTO;

const filtrosCategoriaSocio: {
  label: string;
  value: "TODOS" | CategoriaSocioFiltro;
}[] = [
  { label: "Todos", value: "TODOS" },
  { label: "Activo", value: "ACTIVO" },
  { label: "Adherente", value: "ADHERENTE" },
];

const filtrosTarjetaCentro: {
  label: string;
  value: "TODOS" | "SI" | "NO";
}[] = [
  { label: "Todos", value: "TODOS" },
  { label: "Con tarjeta", value: "SI" },
  { label: "Sin tarjeta", value: "NO" },
];

export default function EstadoPagosPage() {
  const currentYear = new Date().getFullYear();
  const [anio, setAnio] = useState(currentYear);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(defaultPageSize);
  const [busqueda, setBusqueda] = useState("");
  const [busquedaAplicada, setBusquedaAplicada] = useState("");
  const [categoriaSocio, setCategoriaSocio] = useState<"TODOS" | CategoriaSocioFiltro>("TODOS");
  const [tarjetaCentro, setTarjetaCentro] = useState<"TODOS" | "SI" | "NO">("TODOS");
  const [exportandoExcel, setExportandoExcel] = useState(false);
  const [imprimiendoPlanilla, setImprimiendoPlanilla] = useState(false);

  const filtrosBase = useMemo(
    () => ({
      anio,
      busqueda: busquedaAplicada || undefined,
      categoriaSocio: categoriaSocio === "TODOS" ? undefined : categoriaSocio,
      tarjetaCentro: tarjetaCentro === "TODOS" ? undefined : tarjetaCentro === "SI",
    }),
    [anio, busquedaAplicada, categoriaSocio, tarjetaCentro],
  );

  const filtros = useMemo(
    () => ({
      ...filtrosBase,
      page,
      limit: pageSize,
    }),
    [filtrosBase, page, pageSize],
  );

  const { data, isLoading } = useEstadoPagos(filtros);

  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const currentPage = data?.page ?? page;

  const handleAnioChange = (value: string) => {
    const parsed = Number.parseInt(value, 10);
    if (!Number.isNaN(parsed)) {
      setAnio(parsed);
      setPage(1);
    }
  };

  const handleBusquedaAplicada = () => {
    setBusquedaAplicada(busqueda.trim());
    setPage(1);
  };

  const handlePageSizeChange = (value: string) => {
    const newSize = Number.parseInt(value, 10);
    if (!Number.isNaN(newSize)) {
      setPageSize(newSize);
      setPage(1);
    }
  };

  const limpiarBusqueda = () => {
    setBusqueda("");
    setBusquedaAplicada("");
    setPage(1);
  };

  const buildEstadoExcel = (estado: string | null) => {
    if (estado === "PAGADA") {
      return "✓";
    }

    if (estado === "PENDIENTE") {
      return "X";
    }

    return "-";
  };

  const buildEstadoImpresion = (estado: string | null) => {
    if (estado === "PAGADA") {
      return "✓";
    }

    if (estado === "PENDIENTE") {
      return "X";
    }

    return "-";
  };

  const escapeHtml = (value: string) =>
    value
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");

  const obtenerSociosParaExportar = async (): Promise<SocioPagosAnual[]> => {
    const socios: SocioPagosAnual[] = [];
    const limitExport = 500;
    let pageExport = 1;
    let totalPagesExport = 1;

    do {
      const { data: response } = await apiClient.get<EstadoPagosResponse>(
        "/cobros/estado-pagos",
        {
          params: {
            ...filtrosBase,
            page: pageExport,
            limit: limitExport,
          },
        },
      );

      socios.push(...response.socios);
      totalPagesExport = response.totalPages;
      pageExport += 1;
    } while (pageExport <= totalPagesExport);

    return socios;
  };

  const exportarExcelCsv = async () => {
    setExportandoExcel(true);

    try {
      const socios = await obtenerSociosParaExportar();

      const escapeCsv = (value: string) => {
        const escaped = value.replace(/"/g, '""');
        return `"${escaped}"`;
      };

      const header = ["Socio", "DNI", ...meses.map((m) => m.label)];
      const rows = socios.map((socio) => {
        const columnasMes = meses.map((mesItem) =>
          buildEstadoExcel(socio.meses[mesItem.key] ?? null),
        );

        return [
          `${socio.apellido}, ${socio.nombre}`,
          socio.dni ?? "",
          ...columnasMes,
        ];
      });

      const contenido = [header, ...rows]
        .map((fila) => fila.map((valor) => escapeCsv(String(valor))).join(";"))
        .join("\n");

      const blob = new Blob(["\uFEFF" + contenido], {
        type: "text/csv;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `estado-pagos-${anio}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } finally {
      setExportandoExcel(false);
    }
  };

  const imprimirPlanilla = async () => {
    setImprimiendoPlanilla(true);

    try {
      const socios = await obtenerSociosParaExportar();
      const filasHtml = socios
        .map((socio) => {
          const columnasMes = meses
            .map(
              (mesItem) =>
                `<td>${buildEstadoImpresion(socio.meses[mesItem.key] ?? null)}</td>`,
            )
            .join("");

          return `<tr><td>${escapeHtml(`${socio.apellido}, ${socio.nombre}`)}</td><td>${escapeHtml(socio.dni ?? "-")}</td>${columnasMes}</tr>`;
        })
        .join("");

      const tabla = `
        <html>
          <head>
            <title>Estado de pagos ${anio}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 16px; }
              h1 { margin: 0 0 8px; font-size: 20px; }
              p { margin: 0 0 12px; color: #555; }
              .referencia { font-size: 12px; margin-bottom: 12px; }
              table { border-collapse: collapse; width: 100%; font-size: 12px; }
              th, td { border: 1px solid #ddd; padding: 6px; text-align: center; }
              th:first-child, td:first-child, th:nth-child(2), td:nth-child(2) { text-align: left; }
              th { background: #f4f4f4; }
              @media print {
                @page { size: landscape; margin: 10mm; }
              }
            </style>
          </head>
          <body>
            <h1>Estado de pagos ${anio}</h1>
            <p>Generado el ${new Date().toLocaleString("es-AR")}</p>
            <p class="referencia">Referencia: ✓ pagada, X pendiente, - sin cuota</p>
            <table>
              <thead>
                <tr>
                  <th>Socio</th>
                  <th>DNI</th>
                  ${meses.map((mesItem) => `<th>${mesItem.label}</th>`).join("")}
                </tr>
              </thead>
              <tbody>
                ${filasHtml}
              </tbody>
            </table>
          </body>
        </html>
      `;

      const printWindow = window.open("", "_blank", "width=1200,height=800");
      if (!printWindow) {
        return;
      }

      printWindow.document.open();
      printWindow.document.write(tabla);
      printWindow.document.close();

      const ejecutarImpresion = () => {
        printWindow.onafterprint = () => printWindow.close();
        printWindow.focus();
        printWindow.print();
      };

      if (printWindow.document.readyState === "complete") {
        ejecutarImpresion();
      } else {
        printWindow.addEventListener("load", ejecutarImpresion, { once: true });
      }
    } finally {
      setImprimiendoPlanilla(false);
    }
  };

  const renderEstadoTarjetaCentroMes = (
    estadoTarjeta: TarjetaCentroEstadoMes,
  ) => {
    if (estadoTarjeta === "TARJETA_RECHAZADA_PAGADA") {
      return (
        <div className="flex flex-col items-center gap-1">
          <span className="inline-flex items-center justify-center rounded-md bg-red-100 px-2 py-1 text-[10px] font-semibold text-red-700">
            Tarjeta rechazada
          </span>
          <span className="inline-flex items-center justify-center rounded-md bg-emerald-100 px-2 py-1 text-[10px] font-semibold text-emerald-700">
            Pagado
          </span>
        </div>
      );
    }

    if (estadoTarjeta === "TARJETA_RECHAZADA_PENDIENTE") {
      return (
        <div className="flex flex-col items-center gap-1">
          <span className="inline-flex items-center justify-center rounded-md bg-red-100 px-2 py-1 text-[10px] font-semibold text-red-700">
            Tarjeta rechazada
          </span>
          <span className="inline-flex items-center justify-center rounded-md bg-blue-100 px-2 py-1 text-[10px] font-semibold text-blue-700">
            Pendiente
          </span>
        </div>
      );
    }

    if (estadoTarjeta === "TARJETA_APROBADA") {
      return (
        <span className="inline-flex items-center justify-center rounded-md bg-emerald-100 px-2 py-1 text-[10px] font-semibold text-emerald-700">
          Tarjeta aprobada
        </span>
      );
    }

    return (
      <span className="inline-flex items-center justify-center rounded-md bg-blue-100 px-2 py-1 text-[10px] font-semibold text-blue-700">
        Tarjeta pendiente
      </span>
    );
  };

  const renderEstadoMes = (
    estado: string | null,
    estadoTarjeta: TarjetaCentroEstadoMes | null,
    tieneTarjetaCentro: boolean,
  ) => {
    if (tieneTarjetaCentro && estadoTarjeta) {
      return renderEstadoTarjetaCentroMes(estadoTarjeta);
    }

    if (estado === "PAGADA") {
      return <span className="text-lg font-semibold leading-none text-emerald-600">✓</span>;
    }

    if (estado === "PENDIENTE") {
      return <span className="text-lg font-semibold leading-none text-red-600">✕</span>;
    }

    return <span className="text-muted-foreground">-</span>;
  };

  return (
    <DashboardLayout title="Estado de Pagos" description="Seguimiento anual de pagos por socio y por mes">
      <div className="space-y-6">
        <div className="page-header">
          <h1 className="page-title">Estado de pagos</h1>
          <p className="page-description">
            Revisa pagos por socio, mes y año con filtros y exportación.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarCheck className="h-5 w-5" />
              Estado anual de pagos
            </CardTitle>
            <CardDescription>
              Consulte de forma consolidada qué meses están pagados, pendientes o sin cuota generada.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-5">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="busqueda">Buscar socio</Label>
                <div className="flex gap-2">
                  <Input
                    id="busqueda"
                    value={busqueda}
                    placeholder="Nombre, apellido o DNI"
                    onChange={(e) => setBusqueda(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleBusquedaAplicada();
                      }
                    }}
                  />
                  <Button variant="outline" onClick={handleBusquedaAplicada}>
                    Aplicar
                  </Button>
                  {busquedaAplicada && (
                    <Button variant="ghost" onClick={limpiarBusqueda}>
                      Limpiar
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Periodo de referencia</Label>
                <Input
                  id="anio"
                  type="number"
                  value={anio}
                  onChange={(e) => handleAnioChange(e.target.value)}
                  min={2000}
                  max={2100}
                  aria-label="Año de referencia"
                />
              </div>

              <div className="space-y-2">
                <Label>Categoría socio</Label>
                <Select
                  value={categoriaSocio}
                  onValueChange={(value) => {
                    setCategoriaSocio(value as "TODOS" | CategoriaSocioFiltro);
                    setPage(1);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {filtrosCategoriaSocio.map((filtro) => (
                      <SelectItem key={filtro.value} value={filtro.value}>
                        {filtro.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Tarjeta Centro</Label>
                <Select
                  value={tarjetaCentro}
                  onValueChange={(value) => {
                    setTarjetaCentro(value as "TODOS" | "SI" | "NO");
                    setPage(1);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {filtrosTarjetaCentro.map((filtro) => (
                      <SelectItem key={filtro.value} value={filtro.value}>
                        {filtro.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Grilla de estado de pagos</CardTitle>
            <CardDescription>
              Total de socios: {total}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  void exportarExcelCsv();
                }}
                disabled={exportandoExcel || total === 0}
              >
                <Download className="mr-2 h-4 w-4" />
                {exportandoExcel ? "Exportando..." : "Exportar Excel (.csv)"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  void imprimirPlanilla();
                }}
                disabled={imprimiendoPlanilla || total === 0}
              >
                <Printer className="mr-2 h-4 w-4" />
                {imprimiendoPlanilla ? "Preparando impresión..." : "Imprimir planilla"}
              </Button>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Cargando estado de pagos...
              </div>
            ) : (
              <>
                <p className="mb-3 text-xs text-muted-foreground sm:hidden">
                  Desliza la tabla hacia los lados para ver todos los meses.
                </p>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[220px]">Socio</TableHead>
                        <TableHead className="min-w-[100px]">Tarjeta Centro</TableHead>
                        {meses.map((mes) => (
                          <TableHead key={mes.key} className="text-center">
                            {mes.label}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(data?.socios ?? []).map((socio) => (
                        <TableRow key={socio.socioId}>
                          <TableCell className="font-medium">
                            {socio.apellido}, {socio.nombre}
                          </TableCell>
                          <TableCell>
                            {socio.tarjetaCentro ? (
                              <span className="text-emerald-600 font-medium">Sí</span>
                            ) : (
                              <span className="text-muted-foreground">No</span>
                            )}
                          </TableCell>
                          {meses.map((mes) => (
                            <TableCell key={`${socio.socioId}-${mes.key}`} className="text-center">
                              {renderEstadoMes(
                                socio.meses[mes.key] ?? null,
                                socio.mesesTarjetaCentro?.[mes.key] ?? null,
                                socio.tarjetaCentro,
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {(data?.socios ?? []).length === 0 && (
                  <p className="py-8 text-center text-muted-foreground">
                    No hay datos de pagos para el año seleccionado.
                  </p>
                )}

                <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Página {currentPage} de {totalPages}
                    </span>
                    <div className="flex items-center gap-2 ml-4">
                      <span className="whitespace-nowrap text-xs text-muted-foreground">Mostrar:</span>
                      <Select
                        value={pageSize.toString()}
                        onValueChange={handlePageSizeChange}
                      >
                        <SelectTrigger className="h-8 w-20 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PAGINACION.OPCIONES_TAMAÑO_PAGINA.map((size) => (
                            <SelectItem key={size} value={size.toString()}>
                              {size}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage <= 1}
                    >
                      <ChevronLeft className="mr-1 h-4 w-4" />
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={currentPage >= totalPages}
                    >
                      Siguiente
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
