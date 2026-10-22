"use client";

import { useId, useState } from "react";
import { ACCEPT_ATTRIBUTE } from "@/lib/image/constants";
import { validateImageFile } from "@/lib/image/validate";

type DropzoneProps = {
  disabled?: boolean;
  onFile: (file: File) => void;
  onError: (message: string) => void;
};

export function Dropzone({ disabled, onFile, onError }: DropzoneProps) {
  const inputId = useId();
  const [dragging, setDragging] = useState(false);

  function takeFile(file: File | undefined) {
    if (!file) {
      return;
    }
    const result = validateImageFile(file);
    if (!result.ok) {
      onError(result.message);
      return;
    }
    onFile(file);
  }

  return (
    <div
      onDragEnter={(event) => {
        event.preventDefault();
        if (!disabled) {
          setDragging(true);
        }
      }}
      onDragOver={(event) => {
        event.preventDefault();
      }}
      onDragLeave={(event) => {
        if (event.currentTarget.contains(event.relatedTarget as Node)) {
          return;
        }
        setDragging(false);
      }}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        if (disabled) {
          return;
        }
        takeFile(event.dataTransfer.files[0]);
      }}
      className={`rounded-3xl border-2 border-dashed px-6 py-12 text-center transition ${
        dragging
          ? "border-[#c45c26] bg-[#fde8d6]"
          : "border-[#d7c7b2] bg-[#fffaf3]"
      } ${disabled ? "opacity-60" : ""}`}
    >
      <label htmlFor={inputId} className="mx-auto block max-w-lg cursor-pointer">
        <span className="block text-xl font-semibold tracking-tight">
          Drop an image here
        </span>
        <span className="mt-2 block text-[#5c534c]">
          JPEG, PNG, or WebP. Processed on this device only — nothing is
          uploaded.
        </span>
        <span className="mt-6 inline-flex min-h-12 min-w-44 items-center justify-center rounded-full bg-[#c45c26] px-6 text-base font-semibold text-[#fffaf3]">
          Choose image
        </span>
      </label>
      <input
        id={inputId}
        type="file"
        accept={ACCEPT_ATTRIBUTE}
        disabled={disabled}
        className="sr-only"
        onChange={(event) => {
          takeFile(event.target.files?.[0]);
          event.target.value = "";
        }}
      />
    </div>
  );
}
