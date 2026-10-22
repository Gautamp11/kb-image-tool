import { describe, expect, it } from "vitest";
import { computeOutputDimensions } from "./resize";

const source = { width: 2000, height: 1000 };

describe("computeOutputDimensions", () => {
  it("leaves dimensions unchanged when resize is off", () => {
    const result = computeOutputDimensions(
      source,
      { mode: "none", width: null, height: null, percent: 100, keepAspect: true },
      8192,
    );
    expect(result).toEqual({ width: 2000, height: 1000, warning: null });
  });

  it("scales by percent and warns when enlarging", () => {
    const smaller = computeOutputDimensions(
      source,
      { mode: "percent", width: null, height: null, percent: 50, keepAspect: true },
      8192,
    );
    expect(smaller.width).toBe(1000);
    expect(smaller.height).toBe(500);
    expect(smaller.warning).toBeNull();

    const larger = computeOutputDimensions(
      source,
      { mode: "percent", width: null, height: null, percent: 150, keepAspect: true },
      8192,
    );
    expect(larger.width).toBe(3000);
    expect(larger.warning).toMatch(/enlarging/i);
  });

  it("derives the missing side when aspect is locked", () => {
    const fromWidth = computeOutputDimensions(
      source,
      { mode: "dimensions", width: 500, height: null, percent: 100, keepAspect: true },
      8192,
    );
    expect(fromWidth).toMatchObject({ width: 500, height: 250 });

    const fromHeight = computeOutputDimensions(
      source,
      { mode: "dimensions", width: null, height: 200, percent: 100, keepAspect: true },
      8192,
    );
    expect(fromHeight).toMatchObject({ width: 400, height: 200 });
  });

  it("throws when dimension mode has no size", () => {
    expect(() =>
      computeOutputDimensions(
        source,
        { mode: "dimensions", width: null, height: null, percent: 100, keepAspect: true },
        8192,
      ),
    ).toThrow(/width/i);
  });
});
