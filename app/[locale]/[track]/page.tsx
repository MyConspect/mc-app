import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CardGrid, ClusterCardSections } from "@/components/catalog";
import { ConceptList, PageTitleHeader } from "@/components/topic";
import {
  TRACKS,
  getTrack,
  isInterviewTopic,
  isTrackId,
  leafTopicForTrack,
  subjectClusterCards,
  subjectForTrack,
  trackBrowseCards,
} from "@/lib/catalog";
import { catalogBlurb } from "@/lib/i18n/catalog";
import {
  behaviorPageTitle,
  isBehaviorQuestionsTopic,
  localizeBehaviorConcepts,
} from "@/lib/i18n/behaviorQuestions";
import { FALLBACK_NOTE_BADGE } from "@/lib/i18n/chrome";
import { isLocale, localeStaticParams, type Locale } from "@/lib/i18n/locales";
import { withLocale } from "@/lib/i18n/paths";
import { loadHubPage, loadParsedTopic, loadTopicPage } from "@/lib/parse";

export const dynamicParams = false;

export function generateStaticParams() {
  return localeStaticParams().flatMap(({ locale }) =>
    TRACKS.map((track) => ({ locale, track: track.id })),
  );
}

function localizeCards(
  locale: Locale,
  items: readonly { href: string; title: string; description: string }[],
) {
  return items.map((item) => ({
    ...item,
    href: withLocale(locale, item.href),
    description: catalogBlurb(locale, item.description),
  }));
}

function localizeClusterSections(
  locale: Locale,
  sections: ReturnType<typeof subjectClusterCards>,
) {
  return sections.map((section) => ({
    cluster: {
      ...section.cluster,
      blurb: catalogBlurb(locale, section.cluster.blurb),
    },
    items: localizeCards(locale, section.items),
  }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/[track]">): Promise<Metadata> {
  const { locale: localeParam, track: trackId } = await params;
  if (!isLocale(localeParam)) {
    return { title: "Not found" };
  }
  const locale = localeParam;
  const track = getTrack(trackId);
  if (!track) {
    return { title: "Not found" };
  }
  const path = withLocale(locale, `/${trackId}`);
  const alternates = {
    canonical: path,
    languages: {
      en: withLocale("en", `/${trackId}`),
      ru: withLocale("ru", `/${trackId}`),
    },
  };
  const subject = isTrackId(trackId) ? subjectForTrack(trackId) : undefined;
  if (subject) {
    return {
      title: subject.title,
      description: catalogBlurb(locale, subject.blurb),
      alternates,
    };
  }
  if (isTrackId(trackId)) {
    const leaf = leafTopicForTrack(trackId);
    if (leaf) {
      const parsed = await loadParsedTopic(leaf, locale);
      return {
        title: behaviorPageTitle(locale, parsed.title),
        description: parsed.description,
        alternates,
      };
    }
  }
  return {
    title: track.title,
    description: catalogBlurb(locale, track.description),
    alternates,
  };
}

export default async function TrackPage({
  params,
}: PageProps<"/[locale]/[track]">) {
  const { locale: localeParam, track: trackId } = await params;
  if (!isLocale(localeParam) || !isTrackId(trackId)) {
    notFound();
  }
  const locale = localeParam;
  const track = getTrack(trackId);
  if (!track) {
    notFound();
  }

  const subject = subjectForTrack(track.id);
  if (subject) {
    const hub = await loadHubPage(track.id, locale);
    const sections = localizeClusterSections(
      locale,
      subjectClusterCards(subject),
    );
    return (
      <main className="w-full max-w-5xl px-4 pt-5 pb-10 sm:px-6">
        <PageTitleHeader title={subject.title} />
        {hub ? (
          <>
            {hub.usedFallback ? (
              <p className="mt-2 text-sm text-amber-700 dark:text-amber-300">
                {FALLBACK_NOTE_BADGE[locale]}
              </p>
            ) : null}
            <div className="max-w-3xl">
              <ConceptList
                concepts={hub.parsed.concepts}
                emptyMessage="No concepts were parsed from this track hub."
              />
            </div>
          </>
        ) : null}
        <div className={hub ? "mt-10" : "mt-8"}>
          <ClusterCardSections sections={sections} />
        </div>
      </main>
    );
  }

  const leaf = leafTopicForTrack(track.id);
  if (leaf) {
    const loaded = await loadTopicPage(track.id, leaf.slug, locale);
    if (!loaded) {
      notFound();
    }
    const concepts = isBehaviorQuestionsTopic(leaf)
      ? localizeBehaviorConcepts(loaded.parsed.concepts, locale)
      : loaded.parsed.concepts;
    return (
      <main className="w-full max-w-3xl px-4 pt-5 pb-10 sm:px-6">
        {loaded.usedFallback ? (
          <p className="mb-4 text-sm text-amber-700 dark:text-amber-300">
            {FALLBACK_NOTE_BADGE[locale]}
          </p>
        ) : null}
        <ConceptList
          concepts={concepts}
          emptyMessage="No concepts were parsed from this topic."
          groupInterviewSections={isInterviewTopic(leaf)}
        />
      </main>
    );
  }

  return (
    <main className="w-full max-w-5xl px-4 pt-5 pb-10 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        {track.title}
      </h1>
      <p className="mt-3 max-w-2xl text-base leading-7 text-zinc-600 dark:text-zinc-400">
        {catalogBlurb(locale, track.description)}
      </p>
      <div className="mt-8">
        <CardGrid items={localizeCards(locale, trackBrowseCards(track.id))} />
      </div>
    </main>
  );
}
