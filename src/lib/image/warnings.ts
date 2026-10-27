import type { InputFormat, OutputFormat } from "./types";

export function transparencyWarning(
  hasAlpha: boolean,
  outputFormat: OutputFormat,
  inputFormat: InputFormat,
): string | null {
  if (outputFormat === "jpeg" && inputFormat === "png") {
    return "This PNG may contain transparent pixels. JPEG cannot preserve transparency; any transparent areas will be flattened onto white.";
  }
  if (hasAlpha && outputFormat === "jpeg") {
    return "This image has transparent pixels. JPEG cannot keep transparency; transparent areas are flattened onto white.";
  }
  return null;
}

export function pngFormatHint(outputFormat: OutputFormat): string | null {
  if (outputFormat === "png") {
    return "PNG is lossless and has no lossy quality slider. Browser re-encoding may make the file larger.";
  }
  return null;
}

export function outputLargerNote(
  originalBytes: number,
  outputBytes: number,
  outputFormat: OutputFormat,
): string | null {
  if (outputBytes > originalBytes) {
    if (outputFormat === "png") {
      return "The output is larger than the original. Re-encoding through this browser's PNG encoder can produce a less compact file, even though PNG preserves image pixels.";
    }
    return "The output is larger than the original. Re-encoding can add overhead, especially at high quality or when converting between formats.";
  }
  return null;
}
