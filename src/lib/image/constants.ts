export const MAX_FILE_BYTES = 30 * 1024 * 1024;
export const MAX_PIXELS = 40_000_000;
export const MAX_DIMENSION = 8192;
export const MIN_QUALITY = 0.01;
export const MAX_QUALITY = 1;
export const TARGET_SEARCH_ITERATIONS = 12;
export const ACCEPT_ATTRIBUTE = "image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp";

export const FORMAT_MIME: Record<"jpeg" | "png" | "webp", string> = {
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

export const EXTENSION_BY_FORMAT: Record<"jpeg" | "png" | "webp", string> = {
  jpeg: "jpg",
  png: "png",
  webp: "webp",
};
