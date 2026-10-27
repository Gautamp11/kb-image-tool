import { FORMAT_MIME } from "./constants";
import type { OutputFormat } from "./types";

type Canvas2D = HTMLCanvasElement | OffscreenCanvas;
type Context2D =
  | CanvasRenderingContext2D
  | OffscreenCanvasRenderingContext2D;

function createCanvas(): Canvas2D {
  if (typeof OffscreenCanvas !== "undefined") {
    return new OffscreenCanvas(2, 2);
  }
  if (typeof document !== "undefined") {
    const canvas = document.createElement("canvas");
    canvas.width = 2;
    canvas.height = 2;
    return canvas;
  }
  throw new Error("Canvas encoding is unavailable.");
}

function getContext(canvas: Canvas2D): Context2D {
  const context = canvas.getContext("2d", { alpha: true });
  if (!context) {
    throw new Error("Canvas encoding is unavailable.");
  }
  return context;
}

async function encodeWebp(canvas: Canvas2D): Promise<Blob> {
  if ("convertToBlob" in canvas && typeof canvas.convertToBlob === "function") {
    return canvas.convertToBlob({ type: FORMAT_MIME.webp, quality: 0.8 });
  }

  const element = canvas as HTMLCanvasElement;
  if (typeof element.toBlob === "function") {
    return new Promise((resolve, reject) => {
      element.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("WebP encoding failed."));
          }
        },
        FORMAT_MIME.webp,
        0.8,
      );
    });
  }

  const dataUrl = element.toDataURL(FORMAT_MIME.webp, 0.8);
  const response = await fetch(dataUrl);
  return response.blob();
}

export async function detectWebpEncodingSupport(): Promise<boolean> {
  let canvas: Canvas2D | null = null;
  let verificationCanvas: Canvas2D | null = null;
  let bitmap: ImageBitmap | null = null;

  try {
    if (typeof createImageBitmap !== "function") {
      return false;
    }

    canvas = createCanvas();
    const context = getContext(canvas);
    context.clearRect(0, 0, 2, 2);
    context.fillStyle = "rgba(255, 0, 0, 0.5)";
    context.fillRect(0, 0, 1, 1);

    const blob = await encodeWebp(canvas);
    if (blob.type !== FORMAT_MIME.webp || blob.size <= 0) {
      return false;
    }

    bitmap = await createImageBitmap(blob);
    verificationCanvas = createCanvas();
    const verificationContext = getContext(verificationCanvas);
    verificationContext.clearRect(0, 0, 2, 2);
    verificationContext.drawImage(bitmap, 0, 0);
    const alpha = verificationContext.getImageData(0, 0, 1, 1).data[3];
    return alpha > 0 && alpha < 255;
  } catch {
    return false;
  } finally {
    bitmap?.close();
    if (canvas) {
      canvas.width = 0;
      canvas.height = 0;
    }
    if (verificationCanvas) {
      verificationCanvas.width = 0;
      verificationCanvas.height = 0;
    }
  }
}

export function defaultOutputFormats(webpSupported: boolean): OutputFormat[] {
  return webpSupported ? ["jpeg", "png", "webp"] : ["jpeg", "png"];
}
