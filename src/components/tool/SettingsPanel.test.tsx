import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { defaultProcessSettings } from "@/lib/image/process";
import { qualityControlEnabled, SettingsPanel } from "./SettingsPanel";

afterEach(() => {
  cleanup();
});

describe("qualityControlEnabled", () => {
  it("disables quality for png only", () => {
    expect(qualityControlEnabled("png")).toBe(false);
    expect(qualityControlEnabled("jpeg")).toBe(true);
    expect(qualityControlEnabled("webp")).toBe(true);
  });
});

describe("SettingsPanel", () => {
  it("disables the quality mode control for png", () => {
    render(
      <SettingsPanel
        settings={{ ...defaultProcessSettings("png"), outputFormat: "png" }}
        formats={["jpeg", "png"]}
        hasAlpha
        busy={false}
        onChange={vi.fn()}
        onProcess={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "Quality" })).toHaveProperty("disabled", true);
    expect(screen.getByRole("status").textContent).toMatch(/png is lossless/i);
  });

  it("warns before jpeg conversion when the source has transparency", () => {
    render(
      <SettingsPanel
        settings={defaultProcessSettings("jpeg")}
        formats={["jpeg", "png", "webp"]}
        hasAlpha
        busy={false}
        onChange={vi.fn()}
        onProcess={vi.fn()}
      />,
    );

    expect(screen.getByRole("status").textContent).toMatch(/cannot keep transparency/i);
  });
});
