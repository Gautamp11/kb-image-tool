import Link from "next/link";
import { SITE_NAME } from "@/lib/site";

export function SiteHeader() {
  return (
    <header className="border-b border-[#e4d8c8] bg-[#fffaf3]/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2 rounded-lg">
          <span
            aria-hidden="true"
            className="grid h-9 w-9 place-items-center rounded-xl bg-[#1f1a16] text-sm font-semibold tracking-tight text-[#fffaf3]"
          >
            KB
          </span>
          <span className="text-lg font-semibold tracking-tight">{SITE_NAME}</span>
        </Link>
        <nav aria-label="Primary">
          <ul className="flex items-center gap-1 text-sm font-medium">
            <li>
              <Link className="rounded-lg px-3 py-2 hover:bg-[#f0e6d8]" href="/">
                Tool
              </Link>
            </li>
            <li>
              <Link className="rounded-lg px-3 py-2 hover:bg-[#f0e6d8]" href="/about/">
                About
              </Link>
            </li>
            <li>
              <Link className="rounded-lg px-3 py-2 hover:bg-[#f0e6d8]" href="/contact/">
                Contact
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
