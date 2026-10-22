import { DocPage } from "@/components/content/DocPage";
import { pageMetadata } from "@/lib/metadata";
import { SITE_NAME } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Contact",
  description: `How to reach the ${SITE_NAME} project. No live inbox is configured in this first version.`,
  path: "/contact/",
});

export default function ContactPage() {
  return (
    <DocPage title="Contact">
      <p>
        {SITE_NAME} does not currently operate a support desk, phone number, or
        physical office. Do not treat placeholder text on this page as a real
        business identity.
      </p>
      <h2>Placeholder mailbox</h2>
      <p>
        When you are ready to accept mail, replace this documented placeholder
        with a real address you control:{" "}
        <span className="font-medium">contact@example.com</span>. Until that
        change is made, messages sent there will not reach a project owner.
      </p>
      <h2>What we can and cannot help with</h2>
      <p>
        This tool cannot recover an image you already compressed elsewhere, and
        it cannot decode HEIC or other unsupported camera formats. For bugs in
        the website code, use the repository where this project is maintained
        once you publish one.
      </p>
    </DocPage>
  );
}
