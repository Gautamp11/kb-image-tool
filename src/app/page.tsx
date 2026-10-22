import { FaqList } from "@/components/content/FaqList";
import { ImageTool } from "@/components/tool/ImageTool";
import { HOME_FAQS } from "@/content/faqs";
import { pageMetadata } from "@/lib/metadata";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Compress and resize images",
  description:
    "Browser-based JPEG, PNG, and WebP compressor with target file-size mode, resize controls, and honest feedback when a target cannot be reached. Images stay on your device.",
  path: "/",
});

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: SITE_NAME,
  url: SITE_URL,
  applicationCategory: "MultimediaApplication",
  operatingSystem: "Any",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  description:
    "Compress and resize JPEG, PNG, and WebP files in the browser, including a target size in kilobytes.",
};

const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: HOME_FAQS.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

export default function HomePage() {
  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />

      <div className="max-w-3xl">
        <p className="text-sm font-medium uppercase tracking-[0.16em] text-[#c45c26]">
          Local image utility
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
          Compress images to a file size you can actually check.
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-[#5c534c]">
          FitKB resizes and compresses JPEG, PNG, and WebP in your browser. Aim
          for a target in kilobytes. If that target is impossible at the current
          dimensions, you get a clear miss — not a fake success.
        </p>
      </div>

      <div className="mt-10">
        <ImageTool />
      </div>

      <section className="mt-16 max-w-3xl space-y-6 leading-7 text-[#3f3833]">
        <h2 className="text-2xl font-semibold tracking-tight">How to use it</h2>
        <ol className="list-decimal space-y-3 pl-5">
          <li>Drop a JPEG, PNG, or WebP, or use Choose image.</li>
          <li>Confirm the original name, dimensions, format, and file size.</li>
          <li>
            Pick an output format. Switch away from PNG only if you accept
            lossy compression or flattening transparency for JPEG.
          </li>
          <li>
            Choose Target size to search quality values, or Quality for a
            single encode. Optionally resize by pixels or percent.
          </li>
          <li>Compress, compare before and after, then download. Change image to start over.</li>
        </ol>

        <h2 className="text-2xl font-semibold tracking-tight">Supported formats</h2>
        <p>
          Accepted input: JPEG, PNG, and WebP, up to 30 MB and within the
          in-browser pixel limits. Output: JPEG, PNG, and WebP when this
          browser can encode them. GIF, AVIF, HEIC, TIFF, BMP, and SVG are
          rejected with an explanation.
        </p>

        <h2 className="text-2xl font-semibold tracking-tight">
          How target-size compression works
        </h2>
        <p>
          Target mode is a bounded binary search over the browser&apos;s lossy
          quality range (about 1% to 100%) for JPEG and WebP. FitKB keeps the
          highest quality whose encoded file is still at or under the target.
          If even the lowest quality is too large, the run is marked as not
          met. PNG is lossless, so a target can only succeed if the lossless
          encode already fits — usually after a resize.
        </p>
        <p>
          Limitations: canvas encoders differ by browser; they do not expose
          every professional JPEG option; enlarging never adds real detail;
          and a tiny target on a huge photo may be unreachable without
          shrinking pixels.
        </p>

        <h2 className="text-2xl font-semibold tracking-tight">Privacy</h2>
        <p>
          Selected images are not uploaded to a FitKB server. Processing uses
          browser APIs on this device. Object URLs created for previews are
          revoked when you change images or leave the page. See the{" "}
          <a className="font-medium underline underline-offset-4" href="/privacy/">
            Privacy Policy
          </a>{" "}
          for host and placeholder-ad notes.
        </p>
      </section>

      <section className="mt-16">
        <h2 className="mb-4 text-2xl font-semibold tracking-tight">Questions</h2>
        <FaqList items={HOME_FAQS} />
      </section>
    </main>
  );
}
