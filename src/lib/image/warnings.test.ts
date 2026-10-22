import { describe, expect, it } from "vitest";
import { losslessTargetNote, outputLargerNote, transparencyWarning } from "./warnings";

describe("transparencyWarning", () => {
  it("warns only when flattening alpha into JPEG", () => {
    expect(transparencyWarning(true, "jpeg")).toMatch(/transparent/i);
    expect(transparencyWarning(true, "png")).toBeNull();
    expect(transparencyWarning(true, "webp")).toBeNull();
    expect(transparencyWarning(false, "jpeg")).toBeNull();
  });
});

describe("losslessTargetNote", () => {
  it("explains PNG quality limits", () => {
    expect(losslessTargetNote("png")).toMatch(/lossless/i);
    expect(losslessTargetNote("jpeg")).toBeNull();
  });
});

describe("outputLargerNote", () => {
  it("mentions re-encode overhead when the file grew", () => {
    expect(outputLargerNote(1000, 1200)).toMatch(/larger/i);
    expect(outputLargerNote(1000, 800)).toBeNull();
  });
});
