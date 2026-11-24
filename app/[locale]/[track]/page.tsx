import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  SubjectClusterHub,
  TrackBrowseIndex,
  type TrackBrowseIndexBlock,
} from "@/components/catalog";
import { ConceptList, SubjectIntroBody } from "@/components/topic";
import {
  HANDBOOK_INDEX_MAIN_PAD,
  HANDBOOK_SUBJECT_INDEX_BODY,
} from "@/components/topic/conceptIndexStyles";
import {
  SUBJECTS,
  subjectsForTrack,
  TRACKS,
  getTrack,
  isInterviewTopic,
  isTrackId,
  leafTopicForTrack,
  subjectForTrack,
  subjectHref,
  trackLooseBrowseCards,
  trackSubjectBrowseBlocks,
  type TrackId,
} from "@/lib/catalog";
import {
  localizedClusterSectionsForSubject,
  subjectClusterSectionsForLocale,
} from "@/lib/catalog/localizeSubjectClusters";
import { titleTwinClusterConceptsByClusterId } from "@/lib/catalog/titleTwinHubConcepts";
import { catalogBlurb } from "@/lib/i18n/catalog";
import {
  behaviorPageTitle,
  isBehaviorQuestionsTopic,
  localizeBehaviorConcepts,
} from "@/lib/i18n/behaviorQuestions";
import { FALLBACK_NOTE_BADGE } from "@/lib/i18n/chrome";
import { isLocale, localeStaticParams, type Locale } from "@/lib/i18n/locales";
import { withLocale } from "@/lib/i18n/paths";
import { interviewTopicSubjectTitle } from "@/lib/nav/navUtils";
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

function localizeTrackBrowseBlocks(
  locale: Locale,
  trackId: TrackId,
): TrackBrowseIndexBlock[] {
  const blocks = trackSubjectBrowseBlocks(trackId);
  return blocks.map(({ subject, sections }) => ({
    subjectSlug: subject.slug,
    subjectTitle: subject.title,
    subjectHref: withLocale(locale, subjectHref(subject)),
    catalogSubject: subject,
    locale,
    sections: localizedClusterSectionsForSubject(locale, subject, sections, {
      expandTitleTwinTopics: subject.expandTitleTwinOnTrackHub ?? false,
    }),
    clusterLinksOnly: true,
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
    const sections = subjectClusterSectionsForLocale(locale, subject, {
      multiTopicChildren: "nested",
    });
    const titleTwinConceptsByClusterId = titleTwinClusterConceptsByClusterId(
      subject,
      locale,
      [],
    );
    return (
      <main
          className={`handbook-subject-main flex min-h-0 w-full max-w-none flex-1 flex-col ${HANDBOOK_INDEX_MAIN_PAD}`}
        >
          {hub ? (
            <div className={HANDBOOK_SUBJECT_INDEX_BODY}>
              <SubjectIntroBody
                fallbackBanner={
                  hub.usedFallback ? (
                    <p className="mb-4 text-sm text-amber-700 dark:text-amber-300">
                      {FALLBACK_NOTE_BADGE[locale]}
                    </p>
                  ) : null
                }
                concepts={hub.parsed.concepts}
                emptyMessage="No concepts were parsed from this track hub."
                groupInterviewSections={hub.parsed.concepts.some((concept) =>
                  Boolean(concept.group),
                )}
                clusterIndex={{ sections }}
              />
            </div>
          ) : (
            <div className={HANDBOOK_SUBJECT_INDEX_BODY}>
              <SubjectClusterHub
                sections={sections}
                titleTwinConceptsByClusterId={titleTwinConceptsByClusterId}
                browseListVariant="concept-index"
                subjectTitle={subject.title}
              />
            </div>
          )}
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
      <main
          className={`handbook-topic-main flex min-h-0 w-full max-w-none flex-1 flex-col ${HANDBOOK_INDEX_MAIN_PAD}`}
        >
          {loaded.usedFallback ? (
            <p className="mb-4 text-sm text-amber-700 dark:text-amber-300">
              {FALLBACK_NOTE_BADGE[locale]}
            </p>
          ) : null}
          <div className={HANDBOOK_SUBJECT_INDEX_BODY}>
            <ConceptList
              concepts={concepts}
              emptyMessage="No concepts were parsed from this topic."
              groupInterviewSections={
                isInterviewTopic(leaf) ||
                concepts.some((concept) => Boolean(concept.group))
              }
              interviewAccordionIndex={isInterviewTopic(leaf)}
              topicTitle={interviewTopicSubjectTitle(leaf, locale)}
            />
          </div>
        </main>
    );
  }

  const browseBlocks = localizeTrackBrowseBlocks(locale, track.id);
  const looseCards = localizeCards(locale, trackLooseBrowseCards(track.id));

  return (
    <main
        className={`handbook-subject-main flex min-h-0 w-full max-w-none flex-1 flex-col ${HANDBOOK_INDEX_MAIN_PAD}`}
      >
        {browseBlocks.length > 0 || looseCards.length > 0 ? (
          <div className={HANDBOOK_SUBJECT_INDEX_BODY}>
            <TrackBrowseIndex blocks={browseBlocks} looseCards={looseCards} />
          </div>
        ) : null}
      </main>
  );
}
