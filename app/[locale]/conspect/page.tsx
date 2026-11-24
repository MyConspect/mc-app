import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NavHubBrowseIndex } from "@/components/catalog";
import { TRACKS } from "@/lib/catalog";
import { catalogBlurb } from "@/lib/i18n/catalog";
import { HANDBOOK_INDEX_MAIN_PAD } from "@/components/topic/conceptIndexStyles";
import { isLocale, type Locale } from "@/lib/i18n/locales";
import { withLocale } from "@/lib/i18n/paths";
import { withHandbookSection } from "@/lib/i18n/sectionPaths";
import { SITE_DESCRIPTION } from "@/lib/site";

const COPY: Record<Locale, { title: string; description: string }> = {
  en: {
    title: "Study handbook",
    description: SITE_DESCRIPTION,
  },
  ru: {
    title: "Учебный справочник",
    description:
      "Конспект для подготовки к собеседованиям: HTML, CSS, JavaScript, React и смежные темы.",
  },
};

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/conspect">): Promise<Metadata> {
  const { locale: localeParam } = await params;
  if (!isLocale(localeParam)) {
    return { title: "Not found" };
  }
  const copy = COPY[localeParam];
  return {
    title: copy.title,
    description: copy.description,
    alternates: {
      languages: {
        en: "/en/conspect",
        ru: "/ru/conspect",
      },
    },
  };
}

export default async function ConspectHomePage({
  params,
}: PageProps<"/[locale]/conspect">) {
  const { locale: localeParam } = await params;
  if (!isLocale(localeParam)) {
    notFound();
  }
  const locale = localeParam;
  const trackCards = TRACKS.map((track) => ({
    href: withHandbookSection(withLocale(locale, `/${track.id}`), "conspect"),
    title: catalogBlurb(locale, track.title),
    description: catalogBlurb(locale, track.description),
  }));

  return (
    <main
      className={`handbook-subject-main flex min-h-0 w-full max-w-none flex-1 flex-col ${HANDBOOK_INDEX_MAIN_PAD}`}
    >
      <NavHubBrowseIndex items={trackCards} keyPrefix="home-track" />
    </main>
  );
}
