import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CardGrid, SubjectClusterHub } from "@/components/catalog";
import {
  ConceptList,
  PageTitleHeader,
  SubjectIntroBody,
  SubjectPageTitle,
  TopicNavConceptsProvider,
  TopicPageTitle,
} from "@/components/topic";
import {
  getSubject,
  getTrack,
  isInterviewTasksTopic,
  isInterviewTopic,
  isNavHubTopic,
  navChildBrowseCards,
  subjectAfterSectionClusterCards,
  subjectClusterCards,
  subjectIntroTopicSlug,
  subjectRootClusterCards,
  subjectSectionClusterCards,
  topicRouteParams,
  type Topic,
} from "@/lib/catalog";
import { catalogBlurb } from "@/lib/i18n/catalog";
import { FALLBACK_NOTE_BADGE } from "@/lib/i18n/chrome";
import { isLocale, localeStaticParams, type Locale } from "@/lib/i18n/locales";
import { withLocale } from "@/lib/i18n/paths";
import {
  loadTopicPage,
  loadTypesHubConcepts,
  topicUsesGroupedConceptIndex,
  type Concept,
} from "@/lib/parse";

function conceptsForInterviewTopic(
  topic: Topic,
  concepts: readonly Concept[],
): readonly Concept[] {
  if (isInterviewTasksTopic(topic)) {
    return concepts.filter((concept) => concept.interviewSection === "tasks");
  }
  if (isInterviewTopic(topic)) {
    return concepts.filter((concept) => concept.interviewSection !== "tasks");
  }
  return concepts;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return localeStaticParams().flatMap(({ locale }) =>
    topicRouteParams().map((param) => ({
      locale,
      track: param.track,
      topic: param.topic,
    })),
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

function localizeGroupedClusterSections(
  locale: Locale,
  sections: ReturnType<typeof subjectSectionClusterCards>,
) {
  return sections.map((section) => ({
    section: section.section,
    clusters: section.clusters.map((entry) => ({
      cluster: {
        ...entry.cluster,
        blurb: catalogBlurb(locale, entry.cluster.blurb),
      },
      items: localizeCards(locale, entry.items),
    })),
  }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/[track]/[topic]">): Promise<Metadata> {
  const { locale: localeParam, track, topic: slug } = await params;
  if (!isLocale(localeParam)) {
    return { title: "Not found" };
  }
  const locale = localeParam;
  const path = withLocale(locale, `/${track}/${slug}`);
  const alternates = {
    canonical: path,
    languages: {
      en: withLocale("en", `/${track}/${slug}`),
      ru: withLocale("ru", `/${track}/${slug}`),
    },
  };
  const subject = getSubject(track, slug);
  if (subject) {
    return {
      title: subject.title,
      description: catalogBlurb(locale, subject.blurb),
      alternates,
    };
  }
  const loaded = await loadTopicPage(track, slug, locale);
  if (!loaded) {
    return { title: "Not found" };
  }
  return {
    title: loaded.parsed.title,
    description: loaded.parsed.description,
    alternates,
  };
}

export default async function TopicPage({
  params,
}: PageProps<"/[locale]/[track]/[topic]">) {
  const { locale: localeParam, track: trackId, topic: slug } = await params;
  if (!isLocale(localeParam)) {
    notFound();
  }
  const locale = localeParam;
  const track = getTrack(trackId);
  const subject = getSubject(trackId, slug);
  if (subject && track) {
    const groupedSections = subject.sections?.length
      ? localizeGroupedClusterSections(
          locale,
          subjectSectionClusterCards(subject),
        )
      : undefined;
    const rootSections = subject.sections?.length
      ? localizeClusterSections(locale, subjectRootClusterCards(subject))
      : undefined;
    const afterRootSections = subject.sections?.length
      ? localizeClusterSections(
          locale,
          subjectAfterSectionClusterCards(subject),
        )
      : undefined;
    const introSlug = subjectIntroTopicSlug(subject);
    const introLoaded = introSlug
      ? await loadTopicPage(trackId, introSlug, locale)
      : undefined;
    const clusterSections =
      groupedSections || rootSections || afterRootSections
        ? undefined
        : localizeClusterSections(locale, subjectClusterCards(subject));
    const sections =
      introLoaded && clusterSections
        ? clusterSections.filter((section) => section.cluster.id !== "platform")
        : clusterSections;
    return (
      <main className="handbook-subject-main w-full max-w-5xl px-4 pt-5 pb-10 sm:px-6">
        <SubjectPageTitle
          subjectTitle={subject.title}
          sections={sections}
          rootSections={rootSections}
          groupedSections={groupedSections}
          afterRootSections={afterRootSections}
        />
        {introLoaded ? (
          <SubjectIntroBody
            fallbackBanner={
              introLoaded.usedFallback ? (
                <p className="mb-4 text-sm text-amber-700 dark:text-amber-300">
                  {FALLBACK_NOTE_BADGE[locale]}
                </p>
              ) : null
            }
            concepts={introLoaded.parsed.concepts}
            emptyMessage="No concepts were parsed from this topic."
            groupInterviewSections={introLoaded.parsed.concepts.some(
              (concept) => Boolean(concept.group),
            )}
            clusterHub={
              <SubjectClusterHub
                sections={sections}
                rootSections={rootSections}
                groupedSections={groupedSections}
                afterRootSections={afterRootSections}
              />
            }
          />
        ) : (
          <div>
            <SubjectClusterHub
              sections={sections}
              rootSections={rootSections}
              groupedSections={groupedSections}
              afterRootSections={afterRootSections}
            />
          </div>
        )}
      </main>
    );
  }

  const loaded = await loadTopicPage(trackId, slug, locale);
  if (!loaded || !track) {
    notFound();
  }

  if (isNavHubTopic(loaded.topic)) {
    const pageTitle = loaded.parsed.title;
    const hubCards = localizeCards(locale, navChildBrowseCards(loaded.topic));
    const hubConcepts = conceptsForInterviewTopic(
      loaded.topic,
      loaded.parsed.concepts,
    );
    const showHubConcepts = hubConcepts.length > 0;
    return (
      <main
        className={
          showHubConcepts
            ? "handbook-topic-main w-full max-w-3xl px-4 pt-5 pb-10 sm:px-6"
            : "w-full max-w-5xl px-4 pt-5 pb-10 sm:px-6"
        }
      >
        {loaded.usedFallback ? (
          <p className="mb-4 text-sm text-amber-700 dark:text-amber-300">
            {FALLBACK_NOTE_BADGE[locale]}
          </p>
        ) : null}
        {showHubConcepts ? (
          <TopicPageTitle title={loaded.topic.title} />
        ) : (
          <PageTitleHeader title={pageTitle} />
        )}
        {!showHubConcepts && loaded.parsed.description ? (
          <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            {loaded.parsed.description}
          </p>
        ) : null}
        {showHubConcepts ? (
          <TopicNavConceptsProvider concepts={hubConcepts}>
            <ConceptList
              concepts={hubConcepts}
              emptyMessage="No concepts were parsed from this topic."
              groupInterviewSections
            />
          </TopicNavConceptsProvider>
        ) : null}
        {hubCards.length > 0 ? (
          <div className={showHubConcepts ? "mt-10" : "mt-8"}>
            <CardGrid items={hubCards} />
          </div>
        ) : null}
      </main>
    );
  }

  const groupedHubConcepts = topicUsesGroupedConceptIndex(loaded.topic)
    ? await loadTypesHubConcepts(trackId, locale)
    : undefined;
  const pageConcepts = conceptsForInterviewTopic(
    loaded.topic,
    groupedHubConcepts ?? loaded.parsed.concepts,
  );
  const groupConceptSections =
    groupedHubConcepts !== undefined ||
    pageConcepts.some((concept) => Boolean(concept.group)) ||
    (isInterviewTopic(loaded.topic) && !isInterviewTasksTopic(loaded.topic));
  const showTopicIndexTitle = !groupConceptSections;

  return (
    <main className="handbook-topic-main w-full max-w-3xl px-4 pt-5 pb-10 sm:px-6">
      {loaded.usedFallback ? (
        <p className="mb-4 text-sm text-amber-700 dark:text-amber-300">
          {FALLBACK_NOTE_BADGE[locale]}
        </p>
      ) : null}
      {showTopicIndexTitle ? (
        <TopicPageTitle title={loaded.topic.title} />
      ) : null}
      <TopicNavConceptsProvider concepts={pageConcepts}>
        <ConceptList
          concepts={pageConcepts}
          emptyMessage="No concepts were parsed from this topic."
          groupInterviewSections={groupConceptSections}
        />
      </TopicNavConceptsProvider>
    </main>
  );
}
