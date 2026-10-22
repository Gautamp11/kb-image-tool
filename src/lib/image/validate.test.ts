import { describe, expect, it } from "vitest";
import { MAX_FILE_BYTES } from "./constants";
import { validateDecodedDimensions, validateImageFile } from "./validate";

function file(name: string, type: string, size = 128) {
  const blob = new Blob([new Uint8Array(size)], { type });
  return new File([blob], name, { type });
}

describe("validateImageFile", () => {
  it("accepts jpeg, png, and webp", () => {
    expect(validateImageFile(file("photo.jpg", "image/jpeg")).ok).toBe(true);
    expect(validateImageFile(file("graphic.png", "image/png")).ok).toBe(true);
    expect(validateImageFile(file("shot.webp", "image/webp")).ok).toBe(true);
  });

  it("falls back to the file extension when mime type is empty", () => {
    const result = validateImageFile(file("holiday.PNG", ""));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.format).toBe("png");
    }
  });

  it("rejects unsupported formats with a readable reason", () => {
    const gif = validateImageFile(file("loop.gif", "image/gif"));
    expect(gif.ok).toBe(false);
    if (!gif.ok) {
      expect(gif.message).toMatch(/GIF/i);
    }

    const heic = validateImageFile(file("IMG_0001.HEIC", "image/heic"));
    expect(heic.ok).toBe(false);
    if (!heic.ok) {
      expect(heic.message).toMatch(/HEIC/i);
    }
  });

  it("rejects empty and oversized files", () => {
    const empty = validateImageFile(file("empty.jpg", "image/jpeg", 0));
    expect(empty.ok).toBe(false);

    const huge = new File([new Uint8Array(8)], "huge.jpg", { type: "image/jpeg" });
    Object.defineProperty(huge, "size", { value: MAX_FILE_BYTES + 1 });
    const result = validateImageFile(huge);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toMatch(/too large/i);
    }
  });
});

describe("validateDecodedDimensions", () => {
  it("rejects invalid, oversized, and ultra-dense images", () => {
    expect(validateDecodedDimensions(0, 10, 100, 50)).toMatch(/invalid/i);
    expect(validateDecodedDimensions(80, 10, 100, 50)).toMatch(/each side/i);
    expect(validateDecodedDimensions(20, 20, 100, 50)).toMatch(/too many pixels/i);
    expect(validateDecodedDimensions(10, 10, 1000, 50)).toBeNull();
  });
});
