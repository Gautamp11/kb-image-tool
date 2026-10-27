import { cleanup, fireEvent, render, screen } from "@testing-library/react";
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
        formats={["jpeg", "png", "webp"]}
        inputFormat="png"
        hasAlpha
        webpSupported
        busy={false}
        onChange={vi.fn()}
        onProcess={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "Quality" })).toHaveProperty("disabled", true);
    expect(screen.getAllByRole("status")[0].textContent).toMatch(/no lossy quality slider/i);
  });

  it("warns before jpeg conversion when the source has transparency", () => {
    render(
      <SettingsPanel
        settings={defaultProcessSettings("jpeg")}
        formats={["jpeg", "png", "webp"]}
        inputFormat="webp"
        hasAlpha
        webpSupported
        busy={false}
        onChange={vi.fn()}
        onProcess={vi.fn()}
      />,
    );

    expect(screen.getByRole("status").textContent).toMatch(/cannot keep transparency/i);
  });

  it("warns before converting PNG to JPEG even if sampled alpha was not detected", () => {
    render(
      <SettingsPanel
        settings={defaultProcessSettings("jpeg")}
        formats={["jpeg", "png", "webp"]}
        inputFormat="png"
        hasAlpha={false}
        webpSupported
        busy={false}
        onChange={vi.fn()}
        onProcess={vi.fn()}
      />,
    );

    expect(screen.getByRole("status").textContent).toMatch(/may contain transparent pixels/i);
    expect(screen.getByRole("status").textContent).toMatch(/flattened onto white/i);
  });

  it("labels WebP as recommended and preserves manual format selection", () => {
    const onChange = vi.fn();
    const settings = defaultProcessSettings("png", true);
    render(
      <SettingsPanel
        settings={settings}
        formats={["jpeg", "png", "webp"]}
        inputFormat="png"
        hasAlpha
        webpSupported
        busy={false}
        onChange={onChange}
        onProcess={vi.fn()}
      />,
    );

    expect(
      (screen.getByRole("radio", {
        name: /webp.*recommended for smaller files/i,
      }) as HTMLInputElement).checked,
    ).toBe(true);
    fireEvent.click(screen.getByRole("radio", { name: /^png$/i }));
    expect(onChange).toHaveBeenLastCalledWith({
      ...settings,
      outputFormat: "png",
    });

    fireEvent.click(screen.getByRole("radio", { name: /^jpeg$/i }));
    expect(onChange).toHaveBeenLastCalledWith({
      ...settings,
      outputFormat: "jpeg",
    });
  });

  it("keeps the PNG selector hint brief and reports unsupported WebP", () => {
    render(
      <SettingsPanel
        settings={defaultProcessSettings("png")}
        formats={["jpeg", "png"]}
        inputFormat="png"
        hasAlpha={false}
        webpSupported={false}
        busy={false}
        onChange={vi.fn()}
        onProcess={vi.fn()}
      />,
    );

    const statuses = screen.getAllByRole("status");
    expect(statuses).toHaveLength(2);
    expect(statuses[0].textContent).toMatch(/lossless and has no lossy quality slider/i);
    expect(statuses[0].textContent).not.toMatch(/reduce dimensions|target was missed/i);
    expect(statuses[1].textContent).toMatch(/webp encoding is unavailable/i);
    expect(statuses[1].textContent).toMatch(/png remains available/i);
  });
});
