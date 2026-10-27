"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { formatBytes, formatReductionLabel } from "@/lib/format";
import {
  defaultOutputFormats,
  detectWebpEncodingSupport,
} from "@/lib/image/capabilities";
import { closeBitmap, revokeObjectUrl } from "@/lib/image/objectUrl";
import {
  defaultProcessSettings,
  decodeImageFile,
  processDecodedImage,
  suggestedDownloadName,
} from "@/lib/image/process";
import type {
  DecodedImage,
  ProcessResult,
  ProcessSettings,
} from "@/lib/image/types";
import { AdSlot } from "@/components/layout/AdSlot";
import { ComparisonView } from "./ComparisonView";
import { Dropzone } from "./Dropzone";
import { SettingsPanel } from "./SettingsPanel";
import { StatList } from "./StatList";

export function ImageTool() {
  const [source, setSource] = useState<DecodedImage | null>(null);
  const [result, setResult] = useState<ProcessResult | null>(null);
  const [settings, setSettings] = useState<ProcessSettings>(defaultProcessSettings("jpeg"));
  const [webpSupported, setWebpSupported] = useState<boolean | null>(null);
  const formats = defaultOutputFormats(webpSupported === true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    let active = true;
    detectWebpEncodingSupport().then((supported) => {
      if (!active) {
        return;
      }
      setWebpSupported(supported);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (source) {
        revokeObjectUrl(source.objectUrl);
        closeBitmap(source.bitmap);
      }
      if (result) {
        revokeObjectUrl(result.objectUrl);
      }
    };
  }, [source, result]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  function resetSource() {
    abortRef.current?.abort();
    setSource(null);
    setResult(null);
    setError(null);
    setProgress(null);
    setBusy(false);
  }

  async function handleFile(file: File) {
    abortRef.current?.abort();
    if (result) {
      setResult(null);
    }
    setError(null);
    setBusy(true);
    setProgress("Reading image…");
    try {
      const supportsWebp =
        webpSupported ?? (await detectWebpEncodingSupport());
      setWebpSupported(supportsWebp);
      const decoded = await decodeImageFile(file);
      const nextSettings = defaultProcessSettings(decoded.format, supportsWebp);
      nextSettings.targetKb = Math.max(10, Math.round((decoded.bytes / 1024) * 0.5));
      nextSettings.resize.width = decoded.width;
      nextSettings.resize.height = decoded.height;
      setSource(decoded);
      setSettings(nextSettings);
    } catch (caught) {
      setSource(null);
      setError(caught instanceof Error ? caught.message : "Could not open that image.");
    } finally {
      setBusy(false);
      setProgress(null);
    }
  }

  async function runProcess() {
    if (!source) {
      return;
    }
    if (settings.mode === "targetKb" && !(settings.targetKb > 0)) {
      setError("Enter a target size greater than 0 KB.");
      return;
    }
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setBusy(true);
    setError(null);
    setProgress("Starting…");
    try {
      const next = await processDecodedImage(
        source,
        settings,
        (update) => setProgress(update.message),
        controller.signal,
      );
      setResult(next);
      if (!next.metTarget) {
        setError(null);
      }
    } catch (caught) {
      if (caught instanceof DOMException && caught.name === "AbortError") {
        return;
      }
      setError(caught instanceof Error ? caught.message : "Processing failed.");
    } finally {
      setBusy(false);
      setProgress(null);
    }
  }

  function downloadResult() {
    if (!result || !source) {
      return;
    }
    const link = document.createElement("a");
    link.href = result.objectUrl;
    link.download = suggestedDownloadName(source.file.name, result.format);
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  const originalStats = useMemo(() => {
    if (!source) {
      return [];
    }
    return [
      { label: "File", value: source.file.name },
      { label: "Format", value: source.format.toUpperCase() },
      { label: "Dimensions", value: `${source.width} × ${source.height}` },
      { label: "Size", value: formatBytes(source.bytes) },
    ];
  }, [source]);

  return (
    <div className="space-y-6">
      {!source ? (
        <Dropzone disabled={busy} onFile={handleFile} onError={setError} />
      ) : null}

      {error ? (
        <p className="rounded-2xl bg-[#fde8e8] px-4 py-3 text-[#9b2c2c]" role="alert">
          {error}
        </p>
      ) : null}

      {source ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.8fr)]">
          <section className="space-y-4 rounded-3xl border border-[#e4d8c8] bg-[#fffaf3] p-5 shadow-[0_12px_40px_rgba(31,26,22,0.06)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold tracking-tight">Workspace</h2>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="min-h-11 rounded-full border border-[#e4d8c8] px-4 text-sm font-medium"
                  onClick={resetSource}
                >
                  Change image
                </button>
                <button
                  type="button"
                  className="min-h-11 rounded-full bg-[#1f1a16] px-4 text-sm font-medium text-[#fffaf3] disabled:opacity-50"
                  onClick={downloadResult}
                  disabled={!result}
                >
                  Download
                </button>
              </div>
            </div>

            <StatList items={originalStats} />

            {source.hasAlpha ? (
              <p className="text-sm text-[#345c7a]">
                Transparency detected. Keep PNG or WebP if you need an alpha channel.
              </p>
            ) : null}

            {busy && progress ? (
              <p className="rounded-2xl bg-[#eef4f1] px-4 py-3 text-sm text-[#1f6b56]" role="status" aria-live="polite">
                {progress}
              </p>
            ) : null}

            {result ? (
              <>
                <ResultBanner result={result} originalBytes={source.bytes} />
                <ComparisonView
                  beforeUrl={source.objectUrl}
                  afterUrl={result.objectUrl}
                  beforeAlt={`Original ${source.file.name}`}
                  afterAlt={`Compressed ${source.file.name}`}
                />
              </>
            ) : (
              <figure className="overflow-hidden rounded-2xl bg-[#1f1a16]/5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={source.objectUrl}
                  alt={`Preview of ${source.file.name}`}
                  className="mx-auto max-h-96 w-full object-contain"
                />
                <figcaption className="px-3 py-2 text-sm text-[#5c534c]">
                  Original preview. Choose settings, then compress.
                </figcaption>
              </figure>
            )}
          </section>

          <div className="space-y-4 lg:sticky lg:top-4 lg:self-start">
            <SettingsPanel
              settings={settings}
              formats={formats}
              inputFormat={source.format}
              hasAlpha={source.hasAlpha}
              webpSupported={webpSupported === true}
              busy={busy}
              onChange={setSettings}
              onProcess={runProcess}
            />
            <AdSlot placement="sidebar" label="Sidebar" />
          </div>
        </div>
      ) : (
        <AdSlot placement="article" label="Below uploader" />
      )}
    </div>
  );
}

function ResultBanner({
  result,
  originalBytes,
}: {
  result: ProcessResult;
  originalBytes: number;
}) {
  const status =
    result.targetBytes == null
      ? "Encoded"
      : result.metTarget
        ? "Target met"
        : "Target not met";
  return (
    <div
      className={`rounded-2xl px-4 py-3 ${result.targetBytes == null || result.metTarget ? "bg-[#eef4f1] text-[#1f6b56]" : "bg-[#fde8d6] text-[#7a3410]"}`}
      role="status"
    >
      <p className="font-medium">
        {status} · {formatBytes(result.bytes)} ·{" "}
        {result.width} × {result.height} · {formatReductionLabel(originalBytes, result.bytes)}
      </p>
      {result.qualityUsed != null ? (
        <p className="mt-1 text-sm">Encoder quality used: {result.qualityUsed}.</p>
      ) : null}
      {result.warnings.map((warning) => (
        <p key={warning} className="mt-1 text-sm">
          {warning}
        </p>
      ))}
      {result.notes.map((note) => (
        <p key={note} className="mt-1 text-sm">
          {note}
        </p>
      ))}
    </div>
  );
}
