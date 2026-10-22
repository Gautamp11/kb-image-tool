import type { OutputFormat } from "./types";

export function transparencyWarning(
  hasAlpha: boolean,
  outputFormat: OutputFormat,
): string | null {
  if (!hasAlpha) {
    return null;
  }
  if (outputFormat === "jpeg") {
    return "This image has transparent pixels. JPEG cannot keep transparency; transparent areas are flattened onto white.";
  }
  return null;
}

export function losslessTargetNote(outputFormat: OutputFormat): string | null {
  if (outputFormat === "png") {
    return "PNG encoding is lossless. Quality sliders do not apply. A target size can only be met by resizing or by switching to JPEG or WebP.";
  }
  return null;
}

export function outputLargerNote(
  originalBytes: number,
  outputBytes: number,
): string | null {
  if (outputBytes > originalBytes) {
    return "The output is larger than the original. Re-encoding can add overhead, especially at high quality or when converting between formats.";
  }
  return null;
}
