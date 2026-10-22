import { describe, expect, it } from "vitest";
import { formatBytes, formatReductionLabel, sizeReductionPercent } from "./format";

describe("formatBytes", () => {
  it("formats bytes, kilobytes, and megabytes", () => {
    expect(formatBytes(512)).toBe("512 B");
    expect(formatBytes(2048)).toBe("2.00 KB");
    expect(formatBytes(1024 * 1024)).toBe("1.00 MB");
  });
});

describe("sizeReductionPercent", () => {
  it("reports shrinkage and growth", () => {
    expect(sizeReductionPercent(1000, 400)).toBe(60);
    expect(sizeReductionPercent(1000, 1500)).toBe(-50);
    expect(sizeReductionPercent(0, 10)).toBeNull();
  });
});

describe("formatReductionLabel", () => {
  it("describes smaller and larger outputs", () => {
    expect(formatReductionLabel(1000, 250)).toBe("75.0% smaller");
    expect(formatReductionLabel(1000, 2000)).toBe("100.0% larger");
    expect(formatReductionLabel(1000, 1000)).toBe("about the same size");
  });
});
