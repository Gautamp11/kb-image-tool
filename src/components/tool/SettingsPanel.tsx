"use client";

import type {
  InputFormat,
  OutputFormat,
  ProcessSettings,
} from "@/lib/image/types";
import { pngFormatHint } from "@/lib/image/warnings";

type SettingsPanelProps = {
  settings: ProcessSettings;
  formats: OutputFormat[];
  inputFormat: InputFormat;
  hasAlpha: boolean;
  webpSupported: boolean;
  busy: boolean;
  onChange: (next: ProcessSettings) => void;
  onProcess: () => void;
};

export function qualityControlEnabled(format: OutputFormat): boolean {
  return format !== "png";
}

export function SettingsPanel({
  settings,
  formats,
  inputFormat,
  hasAlpha,
  webpSupported,
  busy,
  onChange,
  onProcess,
}: SettingsPanelProps) {
  const qualityEnabled = qualityControlEnabled(settings.outputFormat);
  const jpegWarning =
    settings.outputFormat === "jpeg" && (hasAlpha || inputFormat === "png");

  return (
    <section
      aria-labelledby="settings-heading"
      className="rounded-3xl border border-[#e4d8c8] bg-[#fffaf3] p-5 shadow-[0_12px_40px_rgba(31,26,22,0.06)]"
    >
      <h2
        id="settings-heading"
        className="text-lg font-semibold tracking-tight"
      >
        Output settings
      </h2>
      <p className="mt-1 text-sm text-[#5c534c]">
        Compression happens locally. Target KB mode searches quality values; it
        will not claim success if the file still exceeds the target.
      </p>

      <fieldset className="mt-5">
        <legend className="text-sm font-medium">Output format</legend>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {formats.map((format) => (
            <label
              key={format}
              className={`flex min-h-11 cursor-pointer items-center justify-center rounded-2xl border text-sm font-medium capitalize ${
                settings.outputFormat === format
                  ? "border-[#1f1a16] bg-[#1f1a16] text-[#fffaf3]"
                  : "border-[#e4d8c8] bg-white"
              }`}
            >
              <input
                type="radio"
                className="sr-only"
                name="output-format"
                value={format}
                checked={settings.outputFormat === format}
                onChange={() =>
                  onChange({
                    ...settings,
                    outputFormat: format,
                    mode: format === "png" ? "targetKb" : settings.mode,
                  })
                }
              />
              {format === "webp" ? "WebP" : format}
            </label>
          ))}
        </div>
      </fieldset>

      {jpegWarning ? (
        <p
          className="mt-3 rounded-2xl bg-[#fde8d6] px-3 py-2 text-sm text-[#7a3410]"
          role="status"
        >
          {inputFormat === "png"
            ? "PNG may contain transparent pixels. JPEG cannot preserve them; any transparent areas will be flattened onto white."
            : "JPEG cannot keep transparency. Transparent pixels will be flattened onto white."}
        </p>
      ) : null}

      {settings.outputFormat === "png" ? (
        <p className="mt-3 text-sm text-[#5c534c]" role="status">
          {pngFormatHint(settings.outputFormat)}
        </p>
      ) : null}

      {!webpSupported ? (
        <p className="mt-3 text-sm text-[#5c534c]" role="status">
          WebP encoding is unavailable in this browser. PNG remains available
          for transparency; JPEG flattens transparent areas onto white.
        </p>
      ) : null}

      <fieldset className="mt-5">
        <legend className="text-sm font-medium">Compression</legend>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <ModeButton
            selected={settings.mode === "targetKb"}
            onSelect={() => onChange({ ...settings, mode: "targetKb" })}
            label="Target size"
          />
          <ModeButton
            selected={settings.mode === "quality"}
            onSelect={() => onChange({ ...settings, mode: "quality" })}
            label="Quality"
            disabled={!qualityEnabled}
          />
        </div>
      </fieldset>

      {settings.mode === "targetKb" ? (
        <div className="mt-4">
          <label htmlFor="target-kb" className="text-sm font-medium">
            Target file size (KB)
          </label>
          <input
            id="target-kb"
            type="number"
            inputMode="decimal"
            min={1}
            step={1}
            value={settings.targetKb}
            onChange={(event) =>
              onChange({
                ...settings,
                targetKb: Number(event.target.value),
              })
            }
            className="mt-2 min-h-11 w-full rounded-2xl border border-[#e4d8c8] bg-white px-3"
          />
        </div>
      ) : (
        <div className="mt-4">
          <label
            htmlFor="quality"
            className="flex justify-between text-sm font-medium"
          >
            <span>Quality</span>
            <span>{settings.quality}</span>
          </label>
          <input
            id="quality"
            type="range"
            min={10}
            max={100}
            step={1}
            value={settings.quality}
            disabled={!qualityEnabled}
            onChange={(event) =>
              onChange({ ...settings, quality: Number(event.target.value) })
            }
            className="mt-3 w-full accent-[#c45c26]"
          />
        </div>
      )}

      <fieldset className="mt-5">
        <legend className="text-sm font-medium">Resize</legend>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {(["none", "dimensions", "percent"] as const).map((mode) => (
            <ModeButton
              key={mode}
              selected={settings.resize.mode === mode}
              onSelect={() =>
                onChange({
                  ...settings,
                  resize: { ...settings.resize, mode },
                })
              }
              label={
                mode === "none"
                  ? "None"
                  : mode === "percent"
                    ? "Percent"
                    : "Size"
              }
            />
          ))}
        </div>
      </fieldset>

      {settings.resize.mode === "percent" ? (
        <div className="mt-4">
          <label htmlFor="resize-percent" className="text-sm font-medium">
            Scale (%)
          </label>
          <input
            id="resize-percent"
            type="number"
            min={1}
            max={400}
            value={settings.resize.percent}
            onChange={(event) =>
              onChange({
                ...settings,
                resize: {
                  ...settings.resize,
                  percent: Number(event.target.value),
                },
              })
            }
            className="mt-2 min-h-11 w-full rounded-2xl border border-[#e4d8c8] bg-white px-3"
          />
        </div>
      ) : null}

      {settings.resize.mode === "dimensions" ? (
        <div className="mt-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="resize-width" className="text-sm font-medium">
                Width (px)
              </label>
              <input
                id="resize-width"
                type="number"
                min={1}
                value={settings.resize.width ?? ""}
                onChange={(event) =>
                  onChange({
                    ...settings,
                    resize: {
                      ...settings.resize,
                      width:
                        event.target.value === ""
                          ? null
                          : Number(event.target.value),
                    },
                  })
                }
                className="mt-2 min-h-11 w-full rounded-2xl border border-[#e4d8c8] bg-white px-3"
              />
            </div>
            <div>
              <label htmlFor="resize-height" className="text-sm font-medium">
                Height (px)
              </label>
              <input
                id="resize-height"
                type="number"
                min={1}
                value={settings.resize.height ?? ""}
                onChange={(event) =>
                  onChange({
                    ...settings,
                    resize: {
                      ...settings.resize,
                      height:
                        event.target.value === ""
                          ? null
                          : Number(event.target.value),
                    },
                  })
                }
                className="mt-2 min-h-11 w-full rounded-2xl border border-[#e4d8c8] bg-white px-3"
              />
            </div>
          </div>
          <label className="flex min-h-11 items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={settings.resize.keepAspect}
              onChange={(event) =>
                onChange({
                  ...settings,
                  resize: {
                    ...settings.resize,
                    keepAspect: event.target.checked,
                  },
                })
              }
            />
            Keep aspect ratio
          </label>
        </div>
      ) : null}

      <button
        type="button"
        onClick={onProcess}
        disabled={busy}
        className="mt-6 flex min-h-12 w-full items-center justify-center rounded-full bg-[#c45c26] px-5 text-base font-semibold text-[#fffaf3] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy ? "Working…" : "Compress image"}
      </button>
    </section>
  );
}

function ModeButton({
  selected,
  onSelect,
  label,
  disabled,
}: {
  selected: boolean;
  onSelect: () => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onSelect}
      className={`min-h-11 rounded-2xl border text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40 ${
        selected
          ? "border-[#1f1a16] bg-[#1f1a16] text-[#fffaf3]"
          : "border-[#e4d8c8] bg-white"
      }`}
    >
      {label}
    </button>
  );
}
