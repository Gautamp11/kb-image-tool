import { FORMAT_MIME } from "./constants";
import type { OutputFormat } from "./types";

export async function detectWebpEncodingSupport(): Promise<boolean> {
  if (typeof document === "undefined") {
    return false;
  }
  const canvas = document.createElement("canvas");
  canvas.width = 2;
  canvas.height = 2;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return false;
  }
  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, 2, 2);

  if (typeof canvas.toBlob !== "function") {
    return canvas.toDataURL(FORMAT_MIME.webp).startsWith("data:image/webp");
  }

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        resolve(Boolean(blob && blob.type === FORMAT_MIME.webp && blob.size > 0));
      },
      FORMAT_MIME.webp,
      0.8,
    );
  });
}

export function defaultOutputFormats(webpSupported: boolean): OutputFormat[] {
  return webpSupported ? ["jpeg", "png", "webp"] : ["jpeg", "png"];
}
