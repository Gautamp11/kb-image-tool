import { DocPage } from "@/components/content/DocPage";
import { pageMetadata } from "@/lib/metadata";
import { SITE_NAME } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Privacy Policy",
  description: `${SITE_NAME} processes images in the browser and does not upload selected photos to an application server.`,
  path: "/privacy/",
});

export default function PrivacyPage() {
  return (
    <DocPage title="Privacy Policy">
      <p>
        This policy describes the {SITE_NAME} website as shipped in this
        repository. It is not legal advice. Update it before you attach a real
        domain, analytics, or advertising network.
      </p>
      <h2>Images you select</h2>
      <p>
        Files you drop into the compressor are read locally with browser APIs.
        This application does not include an upload API, account system, or
        remote image processor. Previews use temporary object URLs that are
        revoked when you change images or leave the page.
      </p>
      <h2>Website hosting</h2>
      <p>
        The static files that make up this site (HTML, CSS, JavaScript, icons)
        are delivered by whatever host you deploy to. That host may see normal
        web request logs such as IP address, user agent, and which public pages
        were requested. Those logs are about fetching the website, not about
        receiving your photos.
      </p>
      <h2>Cookies and tracking</h2>
      <p>
        This first version does not set analytics cookies and does not load an
        ad network. Advertisement regions on the page are labelled development
        placeholders.
      </p>
      <h2>Contact</h2>
      <p>
        No personal data inbox is configured. See the{" "}
        <a href="/contact/">Contact</a> page for the placeholder address that
        must be replaced before anyone should send mail.
      </p>
    </DocPage>
  );
}
