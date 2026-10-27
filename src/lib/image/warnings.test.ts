import { describe, expect, it } from "vitest";
import { outputLargerNote, pngFormatHint, transparencyWarning } from "./warnings";

describe("transparencyWarning", () => {
  it("warns only when flattening alpha into JPEG", () => {
    expect(transparencyWarning(true, "jpeg", "webp")).toMatch(/transparent/i);
    expect(transparencyWarning(true, "png", "png")).toBeNull();
    expect(transparencyWarning(true, "webp", "webp")).toBeNull();
    expect(transparencyWarning(false, "jpeg", "jpeg")).toBeNull();
  });

  it("warns before converting PNG even when alpha sampling missed transparency", () => {
    expect(transparencyWarning(false, "jpeg", "png")).toMatch(
      /may contain transparent pixels/i,
    );
  });
});

describe("pngFormatHint", () => {
  it("briefly explains lossless re-encoding", () => {
    expect(pngFormatHint("png")).toMatch(/lossless/i);
    expect(pngFormatHint("png")).toMatch(/no lossy quality slider/i);
    expect(pngFormatHint("png")).toMatch(/may make the file larger/i);
    expect(pngFormatHint("jpeg")).toBeNull();
  });
});

describe("outputLargerNote", () => {
  it("explains browser PNG re-encoding overhead when the file grew", () => {
    expect(outputLargerNote(1000, 1200, "png")).toMatch(/larger/i);
    expect(outputLargerNote(1000, 1200, "png")).toMatch(/browser's PNG encoder/i);
    expect(outputLargerNote(1000, 800, "png")).toBeNull();
  });
});
