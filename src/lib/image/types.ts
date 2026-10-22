export const INPUT_FORMATS = ["jpeg", "png", "webp"] as const;
export const OUTPUT_FORMATS = ["jpeg", "png", "webp"] as const;

export type InputFormat = (typeof INPUT_FORMATS)[number];
export type OutputFormat = (typeof OUTPUT_FORMATS)[number];

export type CompressionMode = "quality" | "targetKb";
export type ResizeMode = "none" | "dimensions" | "percent";

export type ResizeSettings = {
  mode: ResizeMode;
  width: number | null;
  height: number | null;
  percent: number;
  keepAspect: boolean;
};

export type ProcessSettings = {
  outputFormat: OutputFormat;
  mode: CompressionMode;
  quality: number;
  targetKb: number;
  resize: ResizeSettings;
};

export type DecodedImage = {
  file: File;
  objectUrl: string;
  bitmap: ImageBitmap;
  width: number;
  height: number;
  bytes: number;
  format: InputFormat;
  mimeType: string;
  hasAlpha: boolean;
};

export type ProcessProgress = {
  phase: "preparing" | "encoding" | "searching";
  message: string;
  iteration?: number;
  maxIterations?: number;
  quality?: number;
  bytes?: number;
};

export type ProcessResult = {
  blob: Blob;
  objectUrl: string;
  width: number;
  height: number;
  bytes: number;
  format: OutputFormat;
  mimeType: string;
  qualityUsed: number | null;
  metTarget: boolean;
  targetBytes: number | null;
  warnings: string[];
  notes: string[];
};

export type ValidationSuccess = {
  ok: true;
  format: InputFormat;
  mimeType: string;
};

export type ValidationFailure = {
  ok: false;
  message: string;
};

export type ValidationResult = ValidationSuccess | ValidationFailure;
