import {
  EXTENSION_BY_FORMAT,
  FORMAT_MIME,
  MAX_DIMENSION,
  MAX_PIXELS,
  MAX_QUALITY,
  MIN_QUALITY,
} from "./constants";
import { closeBitmap, createObjectUrl, revokeObjectUrl } from "./objectUrl";
import { computeOutputDimensions } from "./resize";
import { searchQualityForTarget } from "./targetQuality";
import type {
  DecodedImage,
  OutputFormat,
  ProcessProgress,
  ProcessResult,
  ProcessSettings,
} from "./types";
import { validateDecodedDimensions, validateImageFile } from "./validate";
import {
  losslessTargetNote,
  outputLargerNote,
  transparencyWarning,
} from "./warnings";

type Canvas2D = HTMLCanvasElement | OffscreenCanvas;

function uiQualityToEncoder(quality: number): number {
  const clamped = Math.min(100, Math.max(1, quality));
  return Math.min(MAX_QUALITY, Math.max(MIN_QUALITY, clamped / 100));
}

export function encoderQualityToUi(quality: number): number {
  return Math.round(quality * 100);
}

function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) {
    throw new DOMException("Processing was cancelled.", "AbortError");
  }
}

async function createBitmap(file: File): Promise<ImageBitmap> {
  try {
    return await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    return createImageBitmap(file);
  }
}

function sampleHasAlpha(bitmap: ImageBitmap): boolean {
  const width = Math.min(64, bitmap.width);
  const height = Math.min(64, bitmap.height);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) {
    return false;
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  const pixels = ctx.getImageData(0, 0, width, height).data;
  for (let i = 3; i < pixels.length; i += 4) {
    if (pixels[i] < 255) {
      return true;
    }
  }
  return false;
}

export async function decodeImageFile(file: File): Promise<DecodedImage> {
  const validation = validateImageFile(file);
  if (!validation.ok) {
    throw new Error(validation.message);
  }

  const objectUrl = createObjectUrl(file);
  let bitmap: ImageBitmap;
  try {
    bitmap = await createBitmap(file);
  } catch {
    revokeObjectUrl(objectUrl);
    throw new Error(
      "Could not read this image. The file may be damaged, or this browser cannot decode it.",
    );
  }

  const dimensionError = validateDecodedDimensions(
    bitmap.width,
    bitmap.height,
    MAX_PIXELS,
    MAX_DIMENSION,
  );
  if (dimensionError) {
    closeBitmap(bitmap);
    revokeObjectUrl(objectUrl);
    throw new Error(dimensionError);
  }

  let hasAlpha = validation.format !== "jpeg";
  try {
    hasAlpha = sampleHasAlpha(bitmap);
  } catch {
    hasAlpha = validation.format !== "jpeg";
  }

  return {
    file,
    objectUrl,
    bitmap,
    width: bitmap.width,
    height: bitmap.height,
    bytes: file.size,
    format: validation.format,
    mimeType: validation.mimeType,
    hasAlpha,
  };
}

function createCanvas(width: number, height: number): Canvas2D {
  if (typeof OffscreenCanvas !== "undefined") {
    return new OffscreenCanvas(width, height);
  }
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

function getContext(canvas: Canvas2D): CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D {
  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) {
    throw new Error("This browser could not create a drawing surface for encoding.");
  }
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  return ctx;
}

function canvasToBlob(
  canvas: Canvas2D,
  mimeType: string,
  quality?: number,
): Promise<Blob> {
  if ("convertToBlob" in canvas && typeof canvas.convertToBlob === "function") {
    return canvas.convertToBlob(
      quality == null ? { type: mimeType } : { type: mimeType, quality },
    );
  }

  return new Promise((resolve, reject) => {
    const element = canvas as HTMLCanvasElement;
    if (typeof element.toBlob !== "function") {
      try {
        const dataUrl = element.toDataURL(mimeType, quality);
        const blob = dataUrlToBlob(dataUrl);
        resolve(blob);
      } catch (error) {
        reject(error instanceof Error ? error : new Error("Encoding failed."));
      }
      return;
    }

    element.toBlob(
      (blob) => {
        if (!blob) {
          reject(
            new Error(
              "Encoding failed. Try a smaller image, another format, or a different browser.",
            ),
          );
          return;
        }
        resolve(blob);
      },
      mimeType,
      quality,
    );
  });
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, payload] = dataUrl.split(",");
  if (!header || !payload) {
    throw new Error("Encoding failed.");
  }
  const mimeMatch = /data:([^;]+)/.exec(header);
  const bytes = atob(payload);
  const buffer = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i += 1) {
    buffer[i] = bytes.charCodeAt(i);
  }
  return new Blob([buffer], { type: mimeMatch?.[1] ?? "application/octet-stream" });
}

function drawSource(
  source: ImageBitmap,
  width: number,
  height: number,
  flattenToWhite: boolean,
): Canvas2D {
  const canvas = createCanvas(width, height);
  const ctx = getContext(canvas);
  if (flattenToWhite) {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
  } else {
    ctx.clearRect(0, 0, width, height);
  }
  ctx.drawImage(source, 0, 0, width, height);
  return canvas;
}

function releaseCanvas(canvas: Canvas2D) {
  canvas.width = 0;
  canvas.height = 0;
}

export function suggestedDownloadName(
  originalName: string,
  format: OutputFormat,
): string {
  const base = originalName.replace(/\.[^.]+$/, "") || "image";
  return `${base}-fitkb.${EXTENSION_BY_FORMAT[format]}`;
}

export async function processDecodedImage(
  source: DecodedImage,
  settings: ProcessSettings,
  onProgress?: (progress: ProcessProgress) => void,
  signal?: AbortSignal,
): Promise<ProcessResult> {
  throwIfAborted(signal);
  onProgress?.({ phase: "preparing", message: "Preparing canvas…" });

  const dimensions = computeOutputDimensions(
    source,
    settings.resize,
    MAX_DIMENSION,
  );
  const flatten = settings.outputFormat === "jpeg";
  const canvas = drawSource(
    source.bitmap,
    dimensions.width,
    dimensions.height,
    flatten,
  );
  const mimeType = FORMAT_MIME[settings.outputFormat];
  const warnings = [
    transparencyWarning(source.hasAlpha, settings.outputFormat),
    losslessTargetNote(settings.outputFormat),
    dimensions.warning,
  ].filter((item): item is string => Boolean(item));
  const notes: string[] = [];

  const encode = async (quality: number | null) => {
    throwIfAborted(signal);
    try {
      const blob = await canvasToBlob(
        canvas,
        mimeType,
        quality == null ? undefined : quality,
      );
      if (blob.size <= 0) {
        throw new Error("The encoder returned an empty file.");
      }
      if (settings.outputFormat !== "png" && blob.type && blob.type !== mimeType) {
        throw new Error(
          `This browser did not encode ${settings.outputFormat.toUpperCase()}. Choose JPEG or PNG instead.`,
        );
      }
      return blob;
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        throw error;
      }
      throw new Error(
        error instanceof Error
          ? error.message
          : "Encoding failed. Try another format or a smaller size.",
      );
    }
  };

  let blob: Blob;
  let qualityUsed: number | null = null;
  let metTarget = true;
  let targetBytes: number | null = null;

  try {
    if (settings.outputFormat === "png") {
      onProgress?.({ phase: "encoding", message: "Writing a lossless PNG…" });
      blob = await encode(null);
      if (settings.mode === "targetKb") {
        targetBytes = Math.round(settings.targetKb * 1024);
        metTarget = blob.size <= targetBytes;
        if (!metTarget) {
          notes.push(
            `Could not reach ${settings.targetKb} KB with PNG. Lossless PNG cannot go below ${formatKb(blob.size)} at ${dimensions.width}×${dimensions.height}. Resize further or switch to JPEG or WebP.`,
          );
        }
      }
    } else if (settings.mode === "targetKb") {
      targetBytes = Math.round(settings.targetKb * 1024);
      onProgress?.({
        phase: "searching",
        message: "Searching quality values to fit the target size…",
      });
      const search = await searchQualityForTarget({
        targetBytes,
        signal,
        encode: async (quality) => {
          const encoded = await encode(quality);
          return { value: encoded, bytes: encoded.size };
        },
        onProgress: (progress) => {
          onProgress?.({
            phase: "searching",
            message: `Trying quality ${encoderQualityToUi(progress.quality)}…`,
            iteration: progress.iteration,
            maxIterations: progress.maxIterations,
            quality: progress.quality,
            bytes: progress.bytes,
          });
        },
      });
      blob = search.value;
      qualityUsed = encoderQualityToUi(search.quality);
      metTarget = search.metTarget;
      if (!metTarget) {
        notes.push(
          `Could not reach ${settings.targetKb} KB. The smallest lossy encode at this size was ${formatKb(search.smallestBytes)}. Resize to fewer pixels or raise the target.`,
        );
      } else if (search.quality === MAX_QUALITY && blob.size + 1024 < targetBytes) {
        notes.push(
          `Reached under ${settings.targetKb} KB at maximum quality (${formatKb(blob.size)}). The file is smaller than the target because even high-quality encoding fit.`,
        );
      }
    } else {
      const quality = uiQualityToEncoder(settings.quality);
      onProgress?.({
        phase: "encoding",
        message: `Encoding at quality ${settings.quality}…`,
        quality,
      });
      blob = await encode(quality);
      qualityUsed = settings.quality;
    }
  } finally {
    releaseCanvas(canvas);
  }

  const larger = outputLargerNote(source.bytes, blob.size);
  if (larger) {
    notes.push(larger);
  }

  return {
    blob,
    objectUrl: createObjectUrl(blob),
    width: dimensions.width,
    height: dimensions.height,
    bytes: blob.size,
    format: settings.outputFormat,
    mimeType: blob.type || mimeType,
    qualityUsed,
    metTarget,
    targetBytes,
    warnings,
    notes,
  };
}

function formatKb(bytes: number): string {
  return `${(bytes / 1024).toFixed(bytes >= 10240 ? 0 : 1)} KB`;
}

export const defaultProcessSettings = (format: OutputFormat): ProcessSettings => ({
  outputFormat: format === "png" ? "png" : format,
  mode: "targetKb",
  quality: 80,
  targetKb: 200,
  resize: {
    mode: "none",
    width: null,
    height: null,
    percent: 100,
    keepAspect: true,
  },
});
