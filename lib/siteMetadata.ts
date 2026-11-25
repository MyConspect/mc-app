import type { Metadata } from "next";

import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_OG_IMAGE_PATH,
  siteUrl,
} from "@/lib/site";

export function buildRootMetadata(): Metadata {
  const base = siteUrl();

  return {
    metadataBase: new URL(base),
    title: {
      default: SITE_NAME,
      template: `%s · ${SITE_NAME}`,
    },
    description: SITE_DESCRIPTION,
    openGraph: {
      type: "website",
      locale: "en_US",
      alternateLocale: ["ru_RU"],
      url: base,
      siteName: SITE_NAME,
      title: SITE_NAME,
      description: SITE_DESCRIPTION,
      images: [
        {
          url: SITE_OG_IMAGE_PATH,
          width: 1200,
          height: 1200,
          alt: `${SITE_NAME} logo`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: SITE_NAME,
      description: SITE_DESCRIPTION,
      images: [SITE_OG_IMAGE_PATH],
    },
  };
}