import html2canvas from "html2canvas-pro";
import { jsPDF } from "jspdf";

export default async function downloadPdf(node, fileName = "ticket.pdf") {
  if (!node) {
    return;
  }

  const canvas = await html2canvas(node, {
    scale: 3,
    useCORS: true,
    backgroundColor: "#ffffff",
    logging: false,
  });

  const imgData = canvas.toDataURL("image/png");

  const marginMm = 6;
  const widthMm = 110;
  const heightMm = Math.round((canvas.height / canvas.width) * widthMm * 10) / 10;
  const pageWidth = widthMm + marginMm * 2;
  const pageHeight = heightMm + marginMm * 2;

  const pdf = new jsPDF({
    orientation: heightMm > widthMm ? "portrait" : "landscape",
    unit: "mm",
    format: [pageWidth, pageHeight],
  });

  pdf.setFillColor(255, 255, 255);
  pdf.rect(0, 0, pageWidth, pageHeight, "F");
  pdf.addImage(imgData, "PNG", marginMm, marginMm, widthMm, heightMm);
  pdf.save(fileName);
}
