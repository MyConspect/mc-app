import { notFound } from "next/navigation";
import { HandbookShell } from "@/components/nav";
import { LocaleHtmlLang } from "@/components/nav/ui/LocaleHtmlLang";
import { chromeFor } from "@/lib/i18n/chrome";
import { isLocale, localeStaticParams, type Locale } from "@/lib/i18n/locales";
import { withSidebarConceptOutlinesSections } from "@/lib/nav/chromeNav";
import { handbookNavSections } from "@/lib/nav/handbook";
import {
  formatSiteLastUpdated,
  siteLastUpdatedIso,
} from "@/lib/siteLastUpdated";

/** Content changes only on deploy — avoid time-based ISR revalidation. */
export const revalidate = false;

export function generateStaticParams() {
  return localeStaticParams();
}

export default async function LocaleLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale: localeParam } = await params;
  if (!isLocale(localeParam)) {
    notFound();
  }
  const locale = localeParam as Locale;
  const lastUpdatedIso = siteLastUpdatedIso();

  return (
    <>
      <LocaleHtmlLang locale={locale} />
      <HandbookShell
        sections={withSidebarConceptOutlinesSections(
          handbookNavSections(locale),
        )}
        chrome={chromeFor(locale)}
        lastUpdatedIso={lastUpdatedIso}
        lastUpdatedLabel={formatSiteLastUpdated(lastUpdatedIso)}
      >
        {children}
      </HandbookShell>
    </>
  );
}
