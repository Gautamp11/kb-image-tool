const LOCAL_SITE_URL = "http://localhost:3000";

function parseSiteOrigin(value: string): URL {
  let url: URL;

  try {
    url = new URL(value);
  } catch {
    throw new Error(
      "NEXT_PUBLIC_SITE_URL must be an absolute HTTP or HTTPS origin.",
    );
  }

  const originAndPath = value.match(/^[a-z][a-z\d+.-]*:\/\/[^/?#]*(.*)$/i);
  if (
    (url.protocol !== "http:" && url.protocol !== "https:") ||
    !url.hostname ||
    url.username ||
    url.password ||
    !originAndPath ||
    (originAndPath[1] !== "" && originAndPath[1] !== "/")
  ) {
    throw new Error(
      "NEXT_PUBLIC_SITE_URL must be an HTTP or HTTPS origin with no path, query, or fragment.",
    );
  }

  return url;
}

const isProduction = process.env.NODE_ENV === "production";
const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

if (isProduction && !configuredSiteUrl) {
  throw new Error(
    "NEXT_PUBLIC_SITE_URL is required for production and must be your public site origin.",
  );
}

const siteUrl = parseSiteOrigin(configuredSiteUrl || LOCAL_SITE_URL);
const hostname = siteUrl.hostname.toLowerCase().replace(/\.$/, "");
const isPlaceholderDomain = ["example.com", "example.net", "example.org"].some(
  (domain) => hostname === domain || hostname.endsWith(`.${domain}`),
);
const isLocalDomain =
  hostname === "localhost" ||
  hostname.endsWith(".localhost") ||
  hostname.startsWith("127.") ||
  hostname === "[::1]";

if (isProduction && (isPlaceholderDomain || isLocalDomain)) {
  throw new Error(
    "NEXT_PUBLIC_SITE_URL must use a real public domain in production, not a placeholder or localhost.",
  );
}

export const SITE_URL = siteUrl.origin;

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
