import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

const waitForElementImages = async (element, timeoutMs = 2500) => {
  if (!element) return;

  const images = Array.from(element.querySelectorAll("img"));
  if (!images.length) return;

  await Promise.all(
    images.map(
      (img) =>
        new Promise((resolve) => {
          if (img.complete && img.naturalWidth > 0) {
            resolve(true);
            return;
          }

          const done = () => resolve(true);
          img.addEventListener("load", done, { once: true });
          img.addEventListener("error", done, { once: true });
          setTimeout(done, timeoutMs);
        }),
    ),
  );
};

export const generateCouponPdfBlobFromElement = async (
  element,
  options = {},
) => {
  if (!element) {
    throw new Error("Coupon preview is not available");
  }

  const widthIn = Number(options.widthIn) > 0 ? Number(options.widthIn) : 6;
  const heightIn = Number(options.heightIn) > 0 ? Number(options.heightIn) : 4;

  await waitForElementImages(element);

  const canvas = await html2canvas(element, {
    scale: Number(options.scale) > 0 ? Number(options.scale) : 2,
    backgroundColor: "#ffffff",
    useCORS: true,
    logging: false,
  });

  const imageData = canvas.toDataURL("image/png", 0.92);
  const doc = new jsPDF({
    orientation: widthIn >= heightIn ? "landscape" : "portrait",
    unit: "in",
    format: [widthIn, heightIn],
    compress: true,
  });

  const sourceRatio = canvas.width / canvas.height;
  const targetRatio = widthIn / heightIn;
  let drawWidth = widthIn;
  let drawHeight = heightIn;
  let offsetX = 0;
  let offsetY = 0;

  if (sourceRatio > targetRatio) {
    drawHeight = widthIn / sourceRatio;
    offsetY = (heightIn - drawHeight) / 2;
  } else if (sourceRatio < targetRatio) {
    drawWidth = heightIn * sourceRatio;
    offsetX = (widthIn - drawWidth) / 2;
  }

  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, widthIn, heightIn, "F");
  doc.addImage(
    imageData,
    "PNG",
    offsetX,
    offsetY,
    drawWidth,
    drawHeight,
    undefined,
    "FAST",
  );

  return doc.output("blob");
};
