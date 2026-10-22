import type { FaqItem } from "@/components/content/FaqList";

export const HOME_FAQS: FaqItem[] = [
  {
    question: "Do my images leave this device?",
    answer:
      "No. FitKB reads the file you choose with browser APIs, draws it to a canvas, and encodes a new file in memory. There is no upload endpoint and no account. If this site is hosted statically, the host still delivers the website files themselves — not your photos.",
  },
  {
    question: "Why didn't the target KB succeed?",
    answer:
      "A target is a maximum, not a guarantee. Pixel count, detail, and format set a floor. JPEG and WebP can only go so far at the lowest quality. PNG is lossless, so size mainly follows resolution. If the smallest encode is still over target, FitKB reports that instead of pretending.",
  },
  {
    question: "Will converting PNG to JPEG keep transparency?",
    answer:
      "No. JPEG has no alpha channel. FitKB warns before that conversion and flattens transparent pixels onto white. Keep PNG or WebP when you need transparency.",
  },
  {
    question: "Which formats can I use?",
    answer:
      "Input: JPEG, PNG, and WebP, within the documented size limits. Output: JPEG, PNG, and WebP when this browser can encode them. GIF, AVIF, HEIC, TIFF, BMP, and SVG are rejected with a reason rather than a silent failure.",
  },
  {
    question: "Can this replace a professional encoder?",
    answer:
      "Not always. This MVP uses the browser's canvas encoder. It is convenient and private, but it is not a substitute for tools that offer 4:4:4 JPEG, chroma options, or specialized PNG crushers. Results vary by browser.",
  },
];
