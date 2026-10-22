import { DocPage } from "@/components/content/DocPage";
import { pageMetadata } from "@/lib/metadata";
import { SITE_NAME } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Terms of Use",
  description: `Terms for using the free ${SITE_NAME} image compression website. The tool is provided as-is.`,
  path: "/terms/",
});

export default function TermsPage() {
  return (
    <DocPage title="Terms of Use">
      <p>
        By using {SITE_NAME} you agree to these terms. This is a free utility
        provided as-is. It is not a consumer contract with a registered company,
        and it is not legal advice.
      </p>
      <h2>The service</h2>
      <p>
        {SITE_NAME} lets you compress and resize images in your browser. Results
        depend on your device and browser. The site may be unavailable, and
        features may change.
      </p>
      <h2>Your files</h2>
      <p>
        You are responsible for having the right to process the images you
        select. Do not use the tool to create or distribute material you are not
        allowed to handle. Because processing is local, you also remain
        responsible for what you download and share afterward.
      </p>
      <h2>No warranty</h2>
      <p>
        The software is provided without warranties of any kind, including
        fitness for a particular file-size target, encoder quality, or
        uninterrupted availability. You use it at your own risk.
      </p>
      <h2>Limitation of liability</h2>
      <p>
        To the extent permitted by law, the authors are not liable for lost
        files, unexpected visual changes, or damages arising from use of this
        website.
      </p>
    </DocPage>
  );
}
