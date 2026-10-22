export function createObjectUrl(source: Blob): string {
  return URL.createObjectURL(source);
}

export function revokeObjectUrl(url: string | null | undefined) {
  if (url) {
    URL.revokeObjectURL(url);
  }
}

export function closeBitmap(bitmap: ImageBitmap | null | undefined) {
  if (bitmap && typeof bitmap.close === "function") {
    bitmap.close();
  }
}
