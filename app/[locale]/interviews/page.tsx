import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InterviewHomeSectionGate } from "@/components/catalog/InterviewHomeSectionGate";
import { isLocale, type Locale } from "@/lib/i18n/locales";
import { SITE_DESCRIPTION } from "@/lib/site";

const COPY: Record<Locale, { title: string; description: string }> = {
  en: {
    title: "Interview questions",
    description: SITE_DESCRIPTION,
  },
  ru: {
    title: "Вопросы с собеседований",
    description:
      "Подборка вопросов для подготовки к собеседованиям по разным направлениям.",
  },
};

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/interviews">): Promise<Metadata> {
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
        en: "/en/interviews",
        ru: "/ru/interviews",
      },
    },
  };
}

export default async function InterviewsHomePage({
  params,
}: PageProps<"/[locale]/interviews">) {
  const { locale: localeParam } = await params;
  if (!isLocale(localeParam)) {
    notFound();
  }

  return (
    <InterviewHomeSectionGate>
      <main className="hidden" aria-hidden />
    </InterviewHomeSectionGate>
  );
}