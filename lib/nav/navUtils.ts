import {
  getSubject,
  isInterviewTasksTopic,
  isInterviewTopic,
  type Topic,
} from "@/lib/catalog";
import { catalogBlurb } from "@/lib/i18n/catalog";
import { isBehaviorQuestionsTopic } from "@/lib/i18n/behaviorQuestions";
import type { Locale } from "@/lib/i18n/locales";
import type { Concept } from "@/lib/parse";
import { filterConspectTheoryOutline } from "@/lib/catalog/conspectInterviewGroup";
import type { InterviewSection, NavConcept, NavTopic } from "./types";

export function sameTitle(left: string, right: string): boolean {
  return left.trim().toLowerCase() === right.trim().toLowerCase();
}

function englishNavTitleVariants(title: string): Set<string> {
  const word = title.trim().toLowerCase();
  const out = new Set<string>();
  if (!word) {
    return out;
  }
  out.add(word);
  if (word.endsWith("ies") && word.length > 3) {
    out.add(word.slice(0, -3) + "y");
  }
  if (word.endsWith("s") && word.length > 1 && !word.endsWith("ss")) {
    out.add(word.slice(0, -1));
  }
  out.add(`${word}s`);
  if (word.endsWith("y") && word.length > 1) {
    out.add(`${word.slice(0, -1)}ies`);
  }
  if (word.endsWith("s") || word.endsWith("x") || word.endsWith("z")) {
    out.add(`${word}es`);
  }
  return out;
}

/** Track vs subject, subject vs topic — same label or obvious singular/plural twin. */
export function areRedundantNavTitles(left: string, right: string): boolean {
  if (sameTitle(left, right)) {
    return true;
  }
  const leftVariants = englishNavTitleVariants(left);
  const rightVariants = englishNavTitleVariants(right);
  for (const variant of leftVariants) {
    if (rightVariants.has(variant)) {
      return true;
    }
  }
  return false;
}

const GENERIC_INTERVIEW_TOPIC_TITLES = new Set(["interview", "tasks"]);

/** Subject name for interview section labels (e.g. js-interview → JavaScript). */
export function interviewTopicSubjectTitle(
  topic: Pick<Topic, "track" | "title" | "grouping">,
  locale: Locale,
): string | undefined {
  if (!isInterviewTopic(topic) && !isInterviewTasksTopic(topic)) {
    return undefined;
  }
  const title = topic.title.trim();
  if (
    title.length > 0 &&
    !GENERIC_INTERVIEW_TOPIC_TITLES.has(title.toLowerCase())
  ) {
    return catalogBlurb(locale, title);
  }
  const subjectSlug = topic.grouping?.subject;
  if (subjectSlug) {
    const subject = getSubject(topic.track, subjectSlug);
    if (subject) {
      return catalogBlurb(locale, subject.title);
    }
  }
  return undefined;
}

/** Sidebar/search row that only repeats the topic title (not "Topic — section"). */
export function isRedundantTopicConceptTitle(
  topicTitle: string,
  conceptTitle: string,
): boolean {
  return sameTitle(topicTitle, conceptTitle);
}

/** Subject hub already shows this title — omit a duplicate topic row (AI → Workflow → Workflow). */
export function isRedundantSubjectTopicNavRow(
  subjectTitle: string,
  topicTitle: string,
): boolean {
  return areRedundantNavTitles(subjectTitle, topicTitle);
}

export function withoutRedundantTopicTitles<T>(
  topicTitle: string,
  items: readonly T[],
  titleOf: (item: T) => string,
): T[] {
  return items.filter(
    (item) => !isRedundantTopicConceptTitle(topicTitle, titleOf(item)),
  );
}

/** Hide the topic H1 when the only concept repeats the topic name (one heading, not two). */
export function shouldShowTopicIndexTitle(
  topicTitle: string,
  concepts: readonly { readonly title: string }[],
  groupConceptSections: boolean,
): boolean {
  if (groupConceptSections) {
    return false;
  }
  const only = concepts.length === 1 ? concepts[0] : undefined;
  if (only && isRedundantTopicConceptTitle(topicTitle, only.title)) {
    return false;
  }
  return true;
}

/** Fold when several children remain, or when a title twin was dropped and others stay. */
export function shouldShowTopicConceptFold(
  topicTitle: string,
  allConcepts: readonly { readonly title: string }[],
  visibleCount: number,
): boolean {
  if (visibleCount > 1) {
    return true;
  }
  if (visibleCount < 1) {
    return false;
  }
  return allConcepts.some((concept) =>
    isRedundantTopicConceptTitle(topicTitle, concept.title),
  );
}

export function hashIdFrom(hash: string): string {
  return decodeURIComponent(hash.replace(/^#/, ""));
}

type InterviewConcept = {
  readonly interviewSection?: InterviewSection;
};

export function isQuestionCluster(clusterId: string): boolean {
  return (
    clusterId === "interview" ||
    clusterId.endsWith("-interview") ||
    clusterId === "tasks" ||
    clusterId.endsWith("-tasks")
  );
}

export function isInterviewSectionTopic(
  topic: Pick<Topic, "slug" | "title" | "grouping" | "file">,
): boolean {
  if (isBehaviorQuestionsTopic(topic)) {
    return true;
  }
  if (isInterviewTasksTopic(topic) || isInterviewTopic(topic)) {
    return true;
  }
  return isQuestionCluster(topic.grouping?.cluster ?? "");
}

export function shouldHideSidebarConcepts(
  topic: Pick<Topic, "slug" | "hideSidebarConcepts" | "grouping"> & {
    readonly title?: string;
  },
): boolean {
  return (
    topic.hideSidebarConcepts === true ||
    isInterviewTopic({ slug: topic.slug, title: topic.title ?? "" }) ||
    isInterviewTasksTopic(topic) ||
    isQuestionCluster(topic.grouping?.cluster ?? "")
  );
}

export function filterInterviewConcepts<T extends InterviewConcept>(
  topic: Pick<Topic, "slug"> & { readonly title?: string },
  concepts: readonly T[],
): readonly T[] {
  if (isInterviewTasksTopic(topic)) {
    return concepts.filter((concept) => concept.interviewSection === "tasks");
  }
  if (isInterviewTopic({ slug: topic.slug, title: topic.title ?? "" })) {
    return concepts.filter((concept) => concept.interviewSection !== "tasks");
  }
  return concepts;
}

/** Theory topic pages and conspect hubs — drop embedded interview blocks. */
export function conceptsForConspectTopic<
  T extends InterviewConcept & {
    readonly group?: string;
  },
>(
  topic: Pick<Topic, "slug" | "grouping" | "file"> & {
    readonly title?: string;
  },
  concepts: readonly T[],
): readonly T[] {
  if (isInterviewSectionTopic(topic)) {
    return filterInterviewConcepts(topic, concepts);
  }
  return filterConspectTheoryOutline(concepts);
}

/** Map parsed topic concepts (with `group`) onto sidebar nav shape. */
export function navConceptsFromParseConcepts(
  concepts: readonly Concept[],
): readonly NavConcept[] {
  return concepts.map((concept) => ({
    id: concept.id,
    title: concept.title,
    ...(concept.searchText ? { searchText: concept.searchText } : {}),
    ...(concept.titleSearchText
      ? { titleSearchText: concept.titleSearchText }
      : {}),
    ...(concept.interviewSection
      ? { interviewSection: concept.interviewSection }
      : {}),
    ...(concept.group ? { group: concept.group } : {}),
  }));
}

/** Prefer live parsed concepts on the active topic page (section groups stay in sync). */
export function navTopicWithLiveConcepts(
  topic: NavTopic,
  pathname: string,
  liveConcepts: readonly Concept[] | null,
): NavTopic {
  if (!liveConcepts?.length) {
    return topic;
  }
  if (pathname === topic.href) {
    const topicIds = new Set(topic.concepts.map((concept) => concept.id));
    const scoped =
      topic.concepts.length > 0
        ? liveConcepts.filter((concept) => topicIds.has(concept.id))
        : liveConcepts;
    return {
      ...topic,
      concepts: navConceptsFromParseConcepts(
        scoped.length > 0 ? scoped : liveConcepts,
      ),
    };
  }
  return topic;
}
