import type { Metadata } from "next";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "./site";

export function pageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  const url = new URL(path, `${SITE_URL}/`).toString();
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      siteName: SITE_NAME,
      title: `${title} · ${SITE_NAME}`,
      description,
    },
    twitter: {
      card: "summary",
      title: `${title} · ${SITE_NAME}`,
      description,
    },
  };
}

export const defaultMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Compress images to a target file size`,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Compress images to a target file size`,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary",
    title: `${SITE_NAME} — Compress images to a target file size`,
    description: SITE_DESCRIPTION,
  },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
};
