import Link from "next/link";
import { SITE_NAME } from "@/lib/site";
import { AdSlot } from "./AdSlot";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-[#e4d8c8] bg-[#fffaf3]">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6">
        <AdSlot placement="footer" label="Footer banner" />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[#5c534c]">
            {SITE_NAME} processes images in your browser. Nothing you drop here
            is uploaded to a server by this app.
          </p>
          <nav aria-label="Footer">
            <ul className="flex flex-wrap gap-x-4 gap-y-2 text-sm font-medium">
              <li>
                <Link className="underline-offset-4 hover:underline" href="/about/">
                  About
                </Link>
              </li>
              <li>
                <Link className="underline-offset-4 hover:underline" href="/privacy/">
                  Privacy
                </Link>
              </li>
              <li>
                <Link className="underline-offset-4 hover:underline" href="/terms/">
                  Terms
                </Link>
              </li>
              <li>
                <Link className="underline-offset-4 hover:underline" href="/contact/">
                  Contact
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}
