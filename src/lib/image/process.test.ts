import { afterEach, describe, expect, it, vi } from "vitest";
import {
  decodeImageFile,
  defaultProcessSettings,
  processDecodedImage,
  suggestedDownloadName,
} from "./process";
import type { DecodedImage, ProcessSettings } from "./types";

vi.mock("./objectUrl", () => ({
  closeBitmap: vi.fn(),
  createObjectUrl: vi.fn(() => "blob:processed"),
  revokeObjectUrl: vi.fn(),
}));

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function stubAlphaReadback(
  width: number,
  height: number,
  transparentPixel?: { x: number; y: number },
  failReadback = false,
) {
  let tileY = 0;
  const context = {
    clearRect: vi.fn(),
    drawImage: vi.fn((_bitmap: ImageBitmap, ...args: number[]) => {
      tileY = args[1] ?? 0;
    }),
    getImageData: vi.fn(
      (_x: number, _y: number, tileWidth: number, tileHeight: number) => {
        if (failReadback) {
          throw new Error("Pixel readback unavailable.");
        }
        const data = new Uint8ClampedArray(tileWidth * tileHeight * 4);
        for (let i = 3; i < data.length; i += 4) {
          data[i] = 255;
        }
        if (
          transparentPixel &&
          transparentPixel.y >= tileY &&
          transparentPixel.y < tileY + tileHeight
        ) {
          const pixelIndex =
            ((transparentPixel.y - tileY) * tileWidth + transparentPixel.x) *
            4;
          data[pixelIndex + 3] = 0;
        }
        return { data } as ImageData;
      },
    ),
  };
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
    context as unknown as CanvasRenderingContext2D,
  );
  vi.stubGlobal(
    "createImageBitmap",
    vi.fn(async () => ({ width, height, close: vi.fn() })),
  );
  return context;
}

function pngFile() {
  return new File(["image"], "photo.png", { type: "image/png" });
}

describe("suggestedDownloadName", () => {
  it("replaces the extension for the chosen output format", () => {
    expect(suggestedDownloadName("Holiday Photo.PNG", "jpeg")).toBe("Holiday Photo-fitkb.jpg");
    expect(suggestedDownloadName("shot", "webp")).toBe("shot-fitkb.webp");
  });
});

describe("defaultProcessSettings", () => {
  it("starts in target-size mode", () => {
    expect(defaultProcessSettings("jpeg").mode).toBe("targetKb");
    expect(defaultProcessSettings("png").outputFormat).toBe("png");
  });

  it("defaults PNG input to WebP only when encoding support is confirmed", () => {
    expect(defaultProcessSettings("png", true).outputFormat).toBe("webp");
    expect(defaultProcessSettings("png", false).outputFormat).toBe("png");
    expect(defaultProcessSettings("jpeg", true).outputFormat).toBe("jpeg");
  });
});

describe("processDecodedImage", () => {
  it("detects a single transparent pixel at full source resolution", async () => {
    const context = stubAlphaReadback(128, 128, { x: 127, y: 127 });

    const decoded = await decodeImageFile(pngFile());

    expect(decoded.hasAlpha).toBe(true);
    expect(context.getImageData).toHaveBeenCalledTimes(2);
    expect(context.drawImage).toHaveBeenCalledTimes(2);
  });

  it("detects a fully opaque PNG without marking it transparent", async () => {
    const context = stubAlphaReadback(128, 128);

    const decoded = await decodeImageFile(pngFile());

    expect(decoded.hasAlpha).toBe(false);
    expect(context.getImageData).toHaveBeenCalledTimes(2);
  });

  it("assumes transparency when full-resolution alpha readback fails", async () => {
    stubAlphaReadback(128, 128, undefined, true);

    const decoded = await decodeImageFile(pngFile());

    expect(decoded.hasAlpha).toBe(true);
  });

  it("keeps the alpha-enabled canvas path for PNG-to-WebP output", async () => {
    const context = {
      clearRect: vi.fn(),
      drawImage: vi.fn(),
      fillRect: vi.fn(),
      imageSmoothingEnabled: false,
      imageSmoothingQuality: "low",
      fillStyle: "",
    };
    const convertToBlob = vi.fn(
      async ({ type }: BlobPropertyBag) => new Blob(["webp"], { type }),
    );
    class TestOffscreenCanvas {
      width: number;
      height: number;

      constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
      }

      getContext = vi.fn((_contextId: string, options: { alpha: boolean }) => {
        expect(options.alpha).toBe(true);
        return context;
      });

      convertToBlob = convertToBlob;
    }
    vi.stubGlobal("OffscreenCanvas", TestOffscreenCanvas);

    const source: DecodedImage = {
      file: new File(["png"], "transparent.png", { type: "image/png" }),
      objectUrl: "blob:source",
      bitmap: { width: 2, height: 2 } as ImageBitmap,
      width: 2,
      height: 2,
      bytes: 3,
      format: "png",
      mimeType: "image/png",
      hasAlpha: true,
    };
    const settings: ProcessSettings = {
      ...defaultProcessSettings("png", true),
      mode: "quality",
      outputFormat: "webp",
    };

    const result = await processDecodedImage(source, settings);

    expect(context.clearRect).toHaveBeenCalled();
    expect(context.drawImage).toHaveBeenCalled();
    expect(context.fillRect).not.toHaveBeenCalled();
    expect(convertToBlob).toHaveBeenCalledWith({
      type: "image/webp",
      quality: expect.any(Number),
    });
    expect(result.format).toBe("webp");
    expect(result.mimeType).toBe("image/webp");
  });

  it("reports WebP encoding failure and leaves a safe format fallback", async () => {
    class FailingOffscreenCanvas {
      width: number;
      height: number;

      constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
      }

      getContext() {
        return {
          clearRect: vi.fn(),
          drawImage: vi.fn(),
          fillRect: vi.fn(),
          imageSmoothingEnabled: false,
          imageSmoothingQuality: "low",
          fillStyle: "",
        };
      }

      convertToBlob = vi.fn(async () => new Blob(["png"], { type: "image/png" }));
    }
    vi.stubGlobal("OffscreenCanvas", FailingOffscreenCanvas);

    const source: DecodedImage = {
      file: new File(["png"], "transparent.png", { type: "image/png" }),
      objectUrl: "blob:source",
      bitmap: { width: 2, height: 2 } as ImageBitmap,
      width: 2,
      height: 2,
      bytes: 3,
      format: "png",
      mimeType: "image/png",
      hasAlpha: true,
    };

    await expect(
      processDecodedImage(source, {
        ...defaultProcessSettings("png", true),
        outputFormat: "webp",
      }),
    ).rejects.toThrow(/select PNG to preserve transparency/i);
  });

  it("reports PNG target status from actual output bytes without repeating the selector hint", async () => {
    class OversizedPngCanvas {
      width: number;
      height: number;

      constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
      }

      getContext() {
        return {
          clearRect: vi.fn(),
          drawImage: vi.fn(),
          fillRect: vi.fn(),
          imageSmoothingEnabled: false,
          imageSmoothingQuality: "low",
          fillStyle: "",
        };
      }

      convertToBlob = vi.fn(
        async () => new Blob([new Uint8Array(2048)], { type: "image/png" }),
      );
    }
    vi.stubGlobal("OffscreenCanvas", OversizedPngCanvas);

    const source: DecodedImage = {
      file: new File(["original"], "image.png", { type: "image/png" }),
      objectUrl: "blob:source",
      bitmap: { width: 2, height: 2 } as ImageBitmap,
      width: 2,
      height: 2,
      bytes: 7,
      format: "png",
      mimeType: "image/png",
      hasAlpha: false,
    };

    const result = await processDecodedImage(source, {
      ...defaultProcessSettings("png"),
      targetKb: 1,
    });

    expect(result.bytes).toBe(2048);
    expect(result.metTarget).toBe(false);
    expect(result.warnings.join(" ")).not.toMatch(/PNG is lossless/i);
    expect(result.notes.join(" ")).toMatch(/smallest size achieved in this attempt/i);
  });
});
