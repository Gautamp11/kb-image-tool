import { describe, expect, it } from "vitest";
import { searchQualityForTarget } from "./targetQuality";

function encoderFromCurve(curve: (quality: number) => number) {
  return async (quality: number) => ({
    value: `q:${quality.toFixed(3)}`,
    bytes: Math.round(curve(quality)),
  });
}

describe("searchQualityForTarget", () => {
  it("keeps maximum quality when the high encode already fits", async () => {
    const result = await searchQualityForTarget({
      targetBytes: 50_000,
      encode: encoderFromCurve((q) => 10_000 + q * 1_000),
    });
    expect(result.metTarget).toBe(true);
    expect(result.quality).toBe(1);
    expect(result.attempts).toBe(1);
  });

  it("reports failure when even the lowest quality exceeds the target", async () => {
    const result = await searchQualityForTarget({
      targetBytes: 100,
      encode: encoderFromCurve(() => 5_000),
      maxIterations: 4,
    });
    expect(result.metTarget).toBe(false);
    expect(result.bytes).toBe(5_000);
    expect(result.quality).toBe(0.01);
  });

  it("finds a high quality that still fits between the bounds", async () => {
    const result = await searchQualityForTarget({
      targetBytes: 20_000,
      encode: encoderFromCurve((q) => q * 40_000),
      maxIterations: 14,
    });
    expect(result.metTarget).toBe(true);
    expect(result.bytes).toBeLessThanOrEqual(20_000);
    expect(result.quality).toBeGreaterThan(0.4);
    expect(result.quality).toBeLessThanOrEqual(0.55);
  });

  it("stops when aborted", async () => {
    const controller = new AbortController();
    controller.abort();
    await expect(
      searchQualityForTarget({
        targetBytes: 1000,
        encode: encoderFromCurve(() => 10),
        signal: controller.signal,
      }),
    ).rejects.toMatchObject({ name: "AbortError" });
  });
});
