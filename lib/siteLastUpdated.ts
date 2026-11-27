import { BUILD_SITE_LAST_UPDATED_ISO } from "./build/siteLastUpdated.generated";
import { siteLastUpdatedIsoLive } from "./siteLastUpdatedLive";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function maxIsoDate(
  dates: readonly (string | null | undefined)[],
): string | null {
  let max: string | null = null;
  for (const date of dates) {
    if (!date || !ISO_DATE.test(date)) continue;
    if (!max || date > max) max = date;
  }
  return max;
}

export function siteLastUpdatedIso(): string {
  if (
    process.env.NODE_ENV === "production" &&
    BUILD_SITE_LAST_UPDATED_ISO &&
    ISO_DATE.test(BUILD_SITE_LAST_UPDATED_ISO)
  ) {
    return BUILD_SITE_LAST_UPDATED_ISO;
  }
  return siteLastUpdatedIsoLive();
}

export function formatSiteLastUpdated(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
