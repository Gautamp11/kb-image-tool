import { MAX_FILE_BYTES } from "./constants";
import type { InputFormat, ValidationResult } from "./types";

const MIME_TO_FORMAT: Record<string, InputFormat> = {
  "image/jpeg": "jpeg",
  "image/pjpeg": "jpeg",
  "image/jpg": "jpeg",
  "image/png": "png",
  "image/webp": "webp",
};

const EXTENSION_TO_FORMAT: Record<string, InputFormat> = {
  jpg: "jpeg",
  jpeg: "jpeg",
  png: "png",
  webp: "webp",
};

const UNSUPPORTED_HINTS: Record<string, string> = {
  gif: "Animated and still GIF files are not supported. Export a JPEG, PNG, or WebP first.",
  avif: "AVIF is not accepted in this version. Convert to JPEG, PNG, or WebP, then try again.",
  heic: "HEIC/HEIF camera files are not decoded here. Export JPEG or PNG from your phone or OS first.",
  heif: "HEIC/HEIF camera files are not decoded here. Export JPEG or PNG from your phone or OS first.",
  tif: "TIFF files are not supported. Export a JPEG, PNG, or WebP first.",
  tiff: "TIFF files are not supported. Export a JPEG, PNG, or WebP first.",
  bmp: "BMP files are not accepted. Save as JPEG, PNG, or WebP first.",
  svg: "SVG is vector artwork, not a raster photo format this tool can compress.",
};

export function fileExtension(name: string): string {
  const parts = name.toLowerCase().split(".");
  if (parts.length < 2) {
    return "";
  }
  return parts[parts.length - 1] ?? "";
}

export function formatFromMimeOrName(
  mimeType: string,
  fileName: string,
): InputFormat | null {
  const fromMime = MIME_TO_FORMAT[mimeType.toLowerCase()];
  if (fromMime) {
    return fromMime;
  }
  return EXTENSION_TO_FORMAT[fileExtension(fileName)] ?? null;
}

export function validateImageFile(file: File): ValidationResult {
  if (file.size <= 0) {
    return { ok: false, message: "That file is empty. Choose a JPEG, PNG, or WebP image." };
  }

  if (file.size > MAX_FILE_BYTES) {
    const limitMb = Math.round(MAX_FILE_BYTES / (1024 * 1024));
    return {
      ok: false,
      message: `This file is too large for in-browser processing (limit ${limitMb} MB). Try a smaller original.`,
    };
  }

  const format = formatFromMimeOrName(file.type, file.name);
  if (!format) {
    const ext = fileExtension(file.name);
    const hint = UNSUPPORTED_HINTS[ext];
    return {
      ok: false,
      message:
        hint ??
        "This file type is not supported. Use JPEG, PNG, or WebP.",
    };
  }

  return {
    ok: true,
    format,
    mimeType: file.type || `image/${format === "jpeg" ? "jpeg" : format}`,
  };
}

export function validateDecodedDimensions(
  width: number,
  height: number,
  maxPixels: number,
  maxDimension: number,
): string | null {
  if (width < 1 || height < 1) {
    return "This image has invalid dimensions and cannot be processed.";
  }
  if (width > maxDimension || height > maxDimension) {
    return `Each side must be ${maxDimension.toLocaleString()} pixels or fewer. This image is ${width}×${height}.`;
  }
  if (width * height > maxPixels) {
    return `This image has too many pixels for a reliable in-browser encode (${width}×${height}). Try a smaller export from your editor.`;
  }
  return null;
}
