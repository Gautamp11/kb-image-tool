const PLACEHOLDER_SITE_URL = "https://www.example.com";

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

/**
 * Canonical site origin. Until a production domain is chosen, this stays on
 * the IANA documentation host example.com so crawlers are not pointed at a
 * fabricated brand domain.
 */
export const SITE_URL = trimTrailingSlash(
  process.env.NEXT_PUBLIC_SITE_URL || PLACEHOLDER_SITE_URL,
);

export const SITE_NAME = "FitKB";

export const SITE_TAGLINE =
  "Compress and resize images in your browser, including a target size in kilobytes.";

export const SITE_DESCRIPTION =
  "Free browser-based image compressor and resizer. Drop a JPEG, PNG, or WebP, aim for a file size in KB, and download the result. Images stay on your device.";

export const NAV_LINKS = [
  { href: "/", label: "Tool" },
  { href: "/about/", label: "About" },
  { href: "/contact/", label: "Contact" },
  { href: "/privacy/", label: "Privacy" },
  { href: "/terms/", label: "Terms" },
] as const;

export const PAGE_PATHS = ["/", "/about/", "/privacy/", "/terms/", "/contact/"] as const;
