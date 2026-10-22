type AdPlacement = "sidebar" | "footer" | "article";

type AdSlotProps = {
  placement: AdPlacement;
  label: string;
};

export function AdSlot({ placement, label }: AdSlotProps) {
  const minHeight =
    placement === "footer" ? "min-h-20" : placement === "sidebar" ? "min-h-40" : "min-h-24";

  return (
    <aside
      aria-label="Advertisement placeholder"
      data-ad-placement={placement}
      className={`rounded-2xl border border-dashed border-[#d7c7b2] bg-[#f7f1e8] px-4 py-3 text-sm text-[#6b6158] ${minHeight}`}
    >
      <p className="font-medium text-[#4f463f]">Ad slot · {label}</p>
      <p className="mt-1 max-w-prose leading-6">
        Development placeholder only. No ad network, tracker, or production
        script is loaded. This region stays out of the upload, preview, and
        download controls so the tool still works if ads are absent or blocked.
      </p>
    </aside>
  );
}
