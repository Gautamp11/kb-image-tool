"use client";

import { useId, useState } from "react";

type ComparisonViewProps = {
  beforeUrl: string;
  afterUrl: string;
  beforeAlt: string;
  afterAlt: string;
};

export function ComparisonView({
  beforeUrl,
  afterUrl,
  beforeAlt,
  afterAlt,
}: ComparisonViewProps) {
  const sliderId = useId();
  const [position, setPosition] = useState(50);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <figure className="overflow-hidden rounded-2xl bg-[#1f1a16]/5">
          {/* User-selected local previews; next/image is not used for blob URLs. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={beforeUrl} alt={beforeAlt} className="mx-auto max-h-80 w-full object-contain" />
          <figcaption className="px-3 py-2 text-sm text-[#5c534c]">Original</figcaption>
        </figure>
        <figure className="overflow-hidden rounded-2xl bg-[#1f1a16]/5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={afterUrl} alt={afterAlt} className="mx-auto max-h-80 w-full object-contain" />
          <figcaption className="px-3 py-2 text-sm text-[#5c534c]">Compressed</figcaption>
        </figure>
      </div>

      <div className="relative overflow-hidden rounded-2xl bg-[#1f1a16]/5">
        <p className="px-3 pt-3 text-sm font-medium">Drag to compare</p>
        <div className="relative mt-2 h-64 w-full">
          {/* Blob previews cannot use next/image. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={afterUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-contain"
          />
          <div
            className="absolute inset-0"
            style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={beforeUrl}
              alt=""
              className="h-full w-full object-contain"
            />
          </div>
        </div>
        <label htmlFor={sliderId} className="sr-only">
          Comparison slider
        </label>
        <input
          id={sliderId}
          type="range"
          min={0}
          max={100}
          value={position}
          onChange={(event) => setPosition(Number(event.target.value))}
          className="mb-3 mt-2 w-full accent-[#c45c26]"
        />
      </div>
    </div>
  );
}
