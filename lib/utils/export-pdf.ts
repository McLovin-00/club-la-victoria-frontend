// Cliente: genera un PDF con la lista de socios de una temporada
// Usa jsPDF y jspdf-autotable (se importan dinámicamente para evitar SSR issues)
import { Temporada } from "@/lib/types";

async function fetchImageAsDataUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    return null;
  }
}

export interface SocioTemporadaMinimal {
  id: number | string;
  socio: {
    nombre: string;
    apellido: string;
    dni: string;
    fotoUrl?: string;
  };
}

export async function generateSociosPdf(
  temporada: Temporada | { id?: string; nombre?: string; fechaInicio?: string; fechaFin?: string },
  socios: SocioTemporadaMinimal[]
): Promise<void> {
  // Import dinámico
  const { jsPDF } = await import("jspdf");
  await import("jspdf-autotable");

  const doc = new jsPDF({ unit: "pt", format: "a4" });

  const title = `Socios - ${temporada?.nombre ?? "Temporada"}`;
  const dateStr = new Date().toLocaleString();
  doc.setFontSize(14);
  doc.text(title, 40, 40);
  doc.setFontSize(10);
  doc.text(`Generado: ${dateStr}`, 40, 56);

  // Preload images (convert to data URLs)
  const imageDataMap: Record<string, string | null> = {};
  await Promise.all(
    socios.map(async (s) => {
      const key = String(s.id);
      if (s.socio?.fotoUrl) {
        imageDataMap[key] = await fetchImageAsDataUrl(s.socio.fotoUrl);
      } else {
        imageDataMap[key] = null;
      }
    })
  );

  // Prepare rows as objects. Provide an empty 'foto' field so autoTable
  // doesn't render the id or a dataURL string; we'll draw the image manually
  // in didDrawCell using the row.id to look up the preloaded image.
  const rows = socios.map((s) => ({
    id: s.id,
    foto: "",
    nombre: `${s.socio.nombre} ${s.socio.apellido}`,
    dni: s.socio.dni ? s.socio.dni : "-",
  }));

  // Use autoTable. Import the default export and call it with the doc.
  const autoTable = (await import("jspdf-autotable")).default as (
    doc: any,
    options: any
  ) => void;

  autoTable(doc, {
    startY: 72,
    // Use columns with dataKey so body can be an array of objects
    columns: [
      { header: "Foto", dataKey: "foto" },
      { header: "Nombre", dataKey: "nombre" },
      { header: "DNI", dataKey: "dni" },
    ],
      body: rows,
      // center content vertically in cells
      styles: { fontSize: 16, cellPadding: 6, minCellHeight: 72, valign: "middle" },
      columnStyles: {
        0: { cellWidth: 120, valign: "middle" }, // foto
        1: { cellWidth: 280, valign: "middle" },
        2: { cellWidth: 120, valign: "middle" },
    },
    didDrawCell: (data: any) => {
      // Foto column has dataKey === 'foto'
      if (data.section === "body" && data.column?.dataKey === "foto") {
        const row = data.row.raw as any;
        const img = imageDataMap[String(row.id)];
        if (img) {
          const padding = 6;
          // center the image vertically and horizontally within the cell
          const imgSize = Math.min(64, data.cell.height - padding * 2, data.cell.width - padding * 2) + 6;
          const x = data.cell.x + (data.cell.width - imgSize) / 2;
          const y = data.cell.y + (data.cell.height - imgSize) / 2;
          try {
            // determine mime type from data URL
            let format: any = undefined;
            const m = /^data:(image\/(png|jpeg|jpg));base64,/.exec(img);
            if (m) {
              const t = m[2];
              if (t === "png") format = "PNG";
              else format = "JPEG";
            }
            if (format) {
              doc.addImage(img, format, x, y, imgSize, imgSize);
            } else {
              // fallback without format
              doc.addImage(img, x, y, imgSize, imgSize);
            }
          } catch (e) {
            // ignore image drawing errors
          }
        }
      }
    },
    didDrawPage: (data: any) => {
      const pageCount = doc.getNumberOfPages();
      const page = data.pageNumber;
      doc.setFontSize(9);
      const footer = `Página ${page} / ${pageCount}`;
      doc.text(footer, doc.internal.pageSize.getWidth() - 80, doc.internal.pageSize.getHeight() - 20);
    },
  });

  // Filename
  const filename = `socios-temporada-${temporada?.id ?? "export"}-${new Date()
    .toISOString()
    .slice(0, 10)}.pdf`;

  doc.save(filename);
}

export default generateSociosPdf;
