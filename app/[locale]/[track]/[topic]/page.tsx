import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NavHubBrowseIndex, SubjectClusterHub } from "@/components/catalog";
import {
  ConceptList,
  SubjectIntroBody,
  SubjectPageTitle,
  TopicNavConceptsProvider,
} from "@/components/topic";
import { HANDBOOK_SUBJECT_INDEX_BODY } from "@/components/topic/conceptIndexStyles";
import {
  getSubject,
  getTrack,
  isInterviewTasksTopic,
  isInterviewTopic,
  isNavHubTopic,
  navChildBrowseCards,
  subjectAfterSectionClusterCards,
  subjectIntroTopicSlug,
  subjectRootClusterCards,
  subjectSectionClusterCards,
  topicRouteParams,
  type Topic,
} from "@/lib/catalog";
import {
  localizedClusterSectionsForSubject,
  subjectClusterSectionsForLocale,
} from "@/lib/catalog/localizeSubjectClusters";
import { filterSubjectClusterSectionsForIntro } from "@/lib/catalog/subjectIntroClusters";
import {
  subjectHubDetailConcepts,
  subjectHubOutlineConcepts,
} from "@/lib/catalog/subjectHubConcepts";
import {
  titleTwinClusterConceptsByClusterId,
  titleTwinOutlineConceptsForSubject,
} from "@/lib/catalog/titleTwinHubConcepts";
import { catalogBlurb } from "@/lib/i18n/catalog";
import { FALLBACK_NOTE_BADGE } from "@/lib/i18n/chrome";
import { isLocale, localeStaticParams, type Locale } from "@/lib/i18n/locales";
import { withLocale } from "@/lib/i18n/paths";
import {
  conceptsForConspectTopic,
  interviewTopicSubjectTitle,
} from "@/lib/nav/navUtils";
import {
  loadTopicPage,
  loadTypesHubConcepts,
  topicUsesGroupedConceptIndex,
  type Concept,
} from "@/lib/parse";

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

function localizeGroupedClusterSections(
  locale: Locale,
  subject: NonNullable<ReturnType<typeof getSubject>>,
  sections: ReturnType<typeof subjectSectionClusterCards>,
) {
  return sections.map((section) => ({
    section: section.section,
    clusters: localizedClusterSectionsForSubject(
      locale,
      subject,
      section.clusters.map((entry) => ({
        cluster: entry.cluster,
        items: entry.items,
      })),
    ),
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
          subject,
          subjectSectionClusterCards(subject),
        )
      : undefined;
    const rootSections = subject.sections?.length
      ? localizedClusterSectionsForSubject(
          locale,
          subject,
          subjectRootClusterCards(subject),
        )
      : undefined;
    const afterRootSections = subject.sections?.length
      ? localizedClusterSectionsForSubject(
          locale,
          subject,
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
        : subjectClusterSectionsForLocale(locale, subject);
    const clusterSectionsNested =
      clusterSections === undefined
        ? undefined
        : subjectClusterSectionsForLocale(locale, subject, {
            multiTopicChildren: "nested",
          });
    const sections = clusterSections
      ? filterSubjectClusterSectionsForIntro(
          subject,
          clusterSections,
          Boolean(introLoaded),
        )
      : clusterSections;
    const sectionsNested = clusterSectionsNested
      ? filterSubjectClusterSectionsForIntro(
          subject,
          clusterSectionsNested,
          Boolean(introLoaded),
        )
      : clusterSectionsNested;
    const titleTwinHubConcepts = titleTwinOutlineConceptsForSubject(
      subject,
      locale,
    );
    const hubOutlineConcepts = subjectHubOutlineConcepts(subject, locale);
    const hubDetailConcepts = introLoaded
      ? conceptsForConspectTopic(introLoaded.topic, introLoaded.parsed.concepts)
      : await subjectHubDetailConcepts(subject, locale);
    const hubGroupConcepts = introLoaded
      ? conceptsForConspectTopic(introLoaded.topic, introLoaded.parsed.concepts)
      : hubOutlineConcepts;
    const conceptPoolForTitleTwin = hubDetailConcepts ?? hubOutlineConcepts;
    const titleTwinConceptsByClusterId = titleTwinClusterConceptsByClusterId(
      subject,
      locale,
      conceptPoolForTitleTwin,
    );
    return (
      <main className="handbook-subject-main flex min-h-0 w-full max-w-none flex-1 flex-col px-4 pt-5 pb-10 sm:px-6">
        <SubjectPageTitle
          subjectTitle={subject.title}
          introConcepts={hubGroupConcepts}
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
            concepts={conceptsForConspectTopic(
              introLoaded.topic,
              introLoaded.parsed.concepts,
            )}
            hubOutlineConcepts={titleTwinHubConcepts}
            emptyMessage="No concepts were parsed from this topic."
            groupInterviewSections={conceptsForConspectTopic(
              introLoaded.topic,
              introLoaded.parsed.concepts,
            ).some((concept) => Boolean(concept.group))}
            clusterIndex={{
              sections,
              rootSections,
              groupedSections,
              afterRootSections,
            }}
          />
        ) : (
          <div className={HANDBOOK_SUBJECT_INDEX_BODY}>
            <SubjectClusterHub
              sections={sections}
              sectionsNested={sectionsNested}
              rootSections={rootSections}
              groupedSections={groupedSections}
              afterRootSections={afterRootSections}
              hubOutlineConcepts={hubGroupConcepts}
              detailConcepts={hubDetailConcepts}
              titleTwinConceptsByClusterId={titleTwinConceptsByClusterId}
              browseListVariant="concept-index"
              subjectTitle={subject.title}
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
    const hubCards = localizeCards(locale, navChildBrowseCards(loaded.topic));
    return (
      <main className="handbook-subject-main flex min-h-0 w-full max-w-none flex-1 flex-col px-4 pt-5 pb-10 sm:px-6">
        {loaded.usedFallback ? (
          <p className="mb-4 text-sm text-amber-700 dark:text-amber-300">
            {FALLBACK_NOTE_BADGE[locale]}
          </p>
        ) : null}
        {hubCards.length > 0 ? (
          <div className={HANDBOOK_SUBJECT_INDEX_BODY}>
            <NavHubBrowseIndex items={hubCards} />
          </div>
        ) : null}
      </main>
    );
  }

  const groupedHubConcepts = topicUsesGroupedConceptIndex(loaded.topic)
    ? await loadTypesHubConcepts(trackId, locale)
    : undefined;
  const pageConcepts = conceptsForConspectTopic(
    loaded.topic,
    groupedHubConcepts ?? loaded.parsed.concepts,
  );
  const groupedTheoryLayout =
    groupedHubConcepts !== undefined ||
    pageConcepts.some((concept) => Boolean(concept.group));
  const groupConceptSections =
    groupedTheoryLayout ||
    pageConcepts.some((concept) => Boolean(concept.interviewSection));
  const interviewAccordionIndex =
    isInterviewTopic(loaded.topic) && !isInterviewTasksTopic(loaded.topic);
  return (
    <main className="handbook-topic-main w-full max-w-5xl px-4 pt-5 pb-10 sm:px-6">
      {loaded.usedFallback ? (
        <p className="mb-4 text-sm text-amber-700 dark:text-amber-300">
          {FALLBACK_NOTE_BADGE[locale]}
        </p>
      ) : null}
      <TopicNavConceptsProvider concepts={pageConcepts}>
        <ConceptList
          concepts={pageConcepts}
          emptyMessage="No concepts were parsed from this topic."
          groupInterviewSections={groupConceptSections}
          interviewAccordionIndex={interviewAccordionIndex}
          topicTitle={interviewTopicSubjectTitle(loaded.topic, locale)}
        />
      </TopicNavConceptsProvider>
    </main>
  );
}
