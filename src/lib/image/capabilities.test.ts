import { afterEach, describe, expect, it, vi } from "vitest";
import {
  defaultOutputFormats,
  detectWebpEncodingSupport,
} from "./capabilities";

afterEach(() => {
  vi.unstubAllGlobals();
});

function installCanvasProbe(
  outputType: string,
  decodedAlpha = 128,
) {
  const context = {
    clearRect: vi.fn(),
    fillRect: vi.fn(),
    drawImage: vi.fn(),
    getImageData: vi.fn(() => ({ data: new Uint8ClampedArray([255, 0, 0, decodedAlpha]) })),
    fillStyle: "",
  };
  class TestOffscreenCanvas {
    width: number;
    height: number;

    constructor(width: number, height: number) {
      this.width = width;
      this.height = height;
    }

    getContext = vi.fn(() => context);
    convertToBlob = vi.fn(async () => new Blob(["encoded"], { type: outputType }));
  }

  vi.stubGlobal("OffscreenCanvas", TestOffscreenCanvas);
  vi.stubGlobal(
    "createImageBitmap",
    vi.fn(async () => ({ close: vi.fn() })),
  );
  return context;
}

describe("detectWebpEncodingSupport", () => {
  it("requires a real WebP encode and verifies transparency round-trips", async () => {
    const context = installCanvasProbe("image/webp");

    await expect(detectWebpEncodingSupport()).resolves.toBe(true);
    expect(context.fillRect).toHaveBeenCalled();
    expect(context.drawImage).toHaveBeenCalled();
    expect(context.getImageData).toHaveBeenCalled();
  });

  it("rejects fallback encodes that return another format", async () => {
    installCanvasProbe("image/png");

    await expect(detectWebpEncodingSupport()).resolves.toBe(false);
  });

  it("rejects WebP encoding that loses alpha", async () => {
    installCanvasProbe("image/webp", 255);

    await expect(detectWebpEncodingSupport()).resolves.toBe(false);
  });
});

describe("defaultOutputFormats", () => {
  it("offers WebP only after encoding support has been confirmed", () => {
    expect(defaultOutputFormats(true)).toContain("webp");
    expect(defaultOutputFormats(false)).not.toContain("webp");
  });
});
