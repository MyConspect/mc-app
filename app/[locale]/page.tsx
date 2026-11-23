import { notFound, redirect } from "next/navigation";
import { isLocale } from "@/lib/i18n/locales";
import { sectionHomeHref } from "@/lib/i18n/sectionPaths";

export default async function LocaleHomeRedirect({
  params,
}: PageProps<"/[locale]">) {
  const { locale: localeParam } = await params;
  if (!isLocale(localeParam)) {
    notFound();
  }
  redirect(sectionHomeHref(localeParam, "conspect"));
}