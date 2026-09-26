import { jsPDF } from "jspdf";

export type PredictionResult = {
  result: string;
  confidence: string;
  status: "safe" | "danger";
  healthy: boolean;
  desc: string;
  treatment: string;
  predictedAt: string;
};

type ReportImage = {
  dataUrl: string;
  width: number;
  height: number;
};

// Normalize browser-supported images to JPEG, and limit report size.
async function prepareReportImage(file: File): Promise<ReportImage> {
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    const scale = Math.min(1, 1600 / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Gambar PDF tidak dapat diproses.");
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return {
      dataUrl: canvas.toDataURL("image/jpeg", 0.85),
      width: canvas.width,
      height: canvas.height,
    };
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function createPredictionPdf(
  result: PredictionResult,
  fileName: string,
  image: ReportImage,
) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
  const margin = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const contentWidth = pageWidth - margin * 2;
  const bottom = pageHeight - 24;
  let y = margin;

  doc.setProperties({
    title: "FishDoctor - Hasil Prediksi",
    subject: result.result,
    author: "FishDoctor",
  });

  const ensureSpace = (height: number) => {
    if (y + height > bottom) {
      doc.addPage();
      y = margin;
    }
  };

  const text = (value: string, size = 11, bold = false) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(size);
    doc.setTextColor(35, 35, 35);
    const lines: string[] = doc.splitTextToSize(value, contentWidth);
    const lineHeight = size * 0.3528 * 1.45;
    for (const line of lines) {
      ensureSpace(lineHeight);
      doc.text(line, margin, y);
      y += lineHeight;
    }
    y += 3;
  };

  const section = (title: string, body: string) => {
    // Keep a heading together with at least the first line of its body.
    ensureSpace(20);
    text(title, 12, true);
    text(body);
    y += 2;
  };

  doc.setFillColor(249, 115, 22);
  doc.rect(margin, y, contentWidth, 2, "F");
  y += 12;
  text("FishDoctor - Hasil Prediksi", 20, true);
  text("Tanggal prediksi: " + new Intl.DateTimeFormat("id-ID", {
    dateStyle: "long",
    timeStyle: "long",
  }).format(new Date(result.predictedAt)), 10);
  text("Nama file: " + fileName, 10);

  const scale = Math.min(contentWidth / image.width, 75 / image.height);
  const width = image.width * scale;
  const height = image.height * scale;
  ensureSpace(height + 8);
  doc.addImage(image.dataUrl, "JPEG", (pageWidth - width) / 2, y, width, height);
  y += height + 10;

  section("Hasil prediksi", result.result);
  text("Status: " + (result.healthy ? "Sehat" : "Sakit"), 11, true);
  text("Tingkat keyakinan AI: " + result.confidence);
  section("Deskripsi", result.desc);
  section(result.healthy ? "Rekomendasi Perawatan" : "Rekomendasi Pengobatan", result.treatment);

  const totalPages = doc.getNumberOfPages();
  for (let page = 1; page <= totalPages; page++) {
    doc.setPage(page);
    doc.setDrawColor(220, 220, 220);
    doc.line(margin, pageHeight - 18, pageWidth - margin, pageHeight - 18);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(110, 110, 110);
    doc.text("FishDoctor", margin, pageHeight - 12);
    doc.text("Halaman " + page + " / " + totalPages, pageWidth - margin, pageHeight - 12, { align: "right" });
  }
  return doc;
}

export async function downloadPredictionPdf(result: PredictionResult, file: File) {
  const image = await prepareReportImage(file);
  const doc = createPredictionPdf(result, file.name, image);
  const date = new Date(result.predictedAt);
  const pad = (value: number) => String(value).padStart(2, "0");
  const datePart = [date.getFullYear(), pad(date.getMonth() + 1), pad(date.getDate())].join("-");
  const timePart = [pad(date.getHours()), pad(date.getMinutes()), pad(date.getSeconds())].join("");
  await doc.save("fishdoctor-prediksi-" + datePart + "-" + timePart + ".pdf", { returnPromise: true });
}
