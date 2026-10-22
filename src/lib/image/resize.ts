import type { ResizeSettings } from "./types";

export type DimensionResult = {
  width: number;
  height: number;
  warning: string | null;
};

function clampInt(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Math.round(value)));
}

export function computeOutputDimensions(
  source: { width: number; height: number },
  resize: ResizeSettings,
  maxDimension: number,
): DimensionResult {
  if (resize.mode === "none") {
    return { width: source.width, height: source.height, warning: null };
  }

  if (resize.mode === "percent") {
    const percent = Number.isFinite(resize.percent) ? resize.percent : 100;
    if (percent <= 0) {
      throw new Error("Resize percent must be greater than 0.");
    }
    const scale = percent / 100;
    const width = clampInt(source.width * scale, 1, maxDimension);
    const height = clampInt(source.height * scale, 1, maxDimension);
    return {
      width,
      height,
      warning:
        scale > 1
          ? "Enlarging cannot invent detail. The file may get larger without looking sharper."
          : null,
    };
  }

  const hasWidth = resize.width != null && resize.width > 0;
  const hasHeight = resize.height != null && resize.height > 0;
  if (!hasWidth && !hasHeight) {
    throw new Error("Enter a width, a height, or both to resize by dimensions.");
  }

  const aspect = source.width / source.height;
  let width = hasWidth ? Math.round(resize.width as number) : 0;
  let height = hasHeight ? Math.round(resize.height as number) : 0;

  if (resize.keepAspect) {
    if (hasWidth && !hasHeight) {
      height = Math.round(width / aspect);
    } else if (hasHeight && !hasWidth) {
      width = Math.round(height * aspect);
    } else {
      const widthScale = width / source.width;
      const heightScale = height / source.height;
      const scale = Math.min(widthScale, heightScale);
      width = Math.round(source.width * scale);
      height = Math.round(source.height * scale);
    }
  } else {
    if (!hasWidth) {
      width = source.width;
    }
    if (!hasHeight) {
      height = source.height;
    }
  }

  width = clampInt(width, 1, maxDimension);
  height = clampInt(height, 1, maxDimension);

  const enlarged = width > source.width || height > source.height;
  return {
    width,
    height,
    warning: enlarged
      ? "Enlarging cannot invent detail. The file may get larger without looking sharper."
      : null,
  };
}
