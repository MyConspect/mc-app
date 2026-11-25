export function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) {
    return explicit.replace(/\/$/, "");
  }
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) {
    return `https://${vercel.replace(/\/$/, "")}`;
  }
  return "http://localhost:3000";
}

export const SITE_NAME = "MyConspect";
export const SITE_DESCRIPTION =
  "A browse-only study handbook of frontend, backend, system design, algorithms, data structures, AI, and related concepts.";

/** Default social / LinkedIn link preview image (under `public/`). */
export const SITE_OG_IMAGE_PATH = "/og-image.png";

export type SiteContactId = "linkedin" | "github";

export type SiteContact = {
  readonly id: SiteContactId;
  readonly href: string;
  readonly label: string;
};

export const SITE_CONTACTS: readonly SiteContact[] = [
  {
    id: "github",
    href: "https://github.com/MyConspect",
    label: "GitHub",
  },
  {
    id: "linkedin",
    href: "https://www.linkedin.com/in/radomir-radionov/",
    label: "LinkedIn",
  },
];
