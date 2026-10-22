import { DocPage } from "@/components/content/DocPage";
import { pageMetadata } from "@/lib/metadata";
import { SITE_NAME } from "@/lib/site";

export const metadata = pageMetadata({
  title: "About",
  description: `What ${SITE_NAME} is, how in-browser compression works, and what this first version does not claim.`,
  path: "/about/",
});

export default function AboutPage() {
  return (
    <DocPage title={`About ${SITE_NAME}`}>
      <p>
        {SITE_NAME} is a free, browser-based utility for compressing and
        resizing raster images. It is built as a static website: the pages can
        be hosted anywhere that serves files, and the compression work stays in
        the visitor&apos;s browser.
      </p>
      <h2>Why it exists</h2>
      <p>
        Many compressors hide the trade-off. This project is built around a
        practical question: can this image fit a stated number of kilobytes
        without lying about the result? Target mode searches quality values and
        reports a miss when the floor is still too high.
      </p>
      <h2>What this project is not</h2>
      <p>
        This is an independent utility, not a registered company page. There is
        no office address, no invented team bio, and no claim that the tool will
        rank in search results. Quality depends on the visitor&apos;s browser
        encoder.
      </p>
      <h2>Source and hosting</h2>
      <p>
        The app is a Next.js static export. Configure{" "}
        <code>NEXT_PUBLIC_SITE_URL</code> when a real domain is chosen. Until
        then, canonical URLs use the documented placeholder host.
      </p>
    </DocPage>
  );
}
