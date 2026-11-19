import { loadTopicOutline, type ConceptOutline } from "@/lib/parse";
import type { Locale } from "@/lib/i18n/locales";
import { DEFAULT_LOCALE } from "@/lib/i18n/locales";
import { stripLocalePrefix, withLocale } from "@/lib/i18n/paths";
import { conceptGroupSectionDomId } from "@/lib/nav/conceptGroupSection";
import { areRedundantNavTitles, sameTitle } from "@/lib/nav/navUtils";
import {
  getSubject,
  getTopic,
  subjectHref,
  topicHref,
  topicsForCluster,
  type BrowseCard,
  type Subject,
  type Topic,
  type TopicCluster,
} from "./index";
import { filterConspectTheoryOutline } from "./conspectInterviewGroup";
import { titleTwinTopicForCluster } from "./titleTwinTopic";
export { titleTwinTopicForCluster } from "./titleTwinTopic";

export type SubjectClusterSection = {
  readonly cluster: TopicCluster;
  readonly items: readonly BrowseCard[];
  /** Localized destination for the cluster section title (topic or subject hash). */
  readonly headingHref?: string;
};

function orderedGroupLabels(outline: readonly ConceptOutline[]): string[] {
  const labels: string[] = [];
  const seen = new Set<string>();
  for (const entry of outline) {
    const label = entry.group?.trim();
    if (!label || seen.has(label)) {
      continue;
    }
    seen.add(label);
    labels.push(label);
  }
  return labels;
}

function theoryOutline(outline: readonly ConceptOutline[]): ConceptOutline[] {
  return [...filterConspectTheoryOutline(outline)];
}

export type ConceptIndexBrowseCardsOptions = {
  /** Subject hub path for `concept-group-*` hashes (sidebar and cluster drilldown). */
  readonly groupHashBase?: string;
};

function subjectPathForGroupedTopic(
  topic: Topic,
  locale: Locale,
): string | undefined {
  const grouping = topic.grouping;
  if (!grouping) {
    return undefined;
  }
  const subject = getSubject(topic.track, grouping.subject);
  if (!subject) {
    return undefined;
  }
  return withLocale(locale, subjectHref(subject));
}

function skipsRedundantConceptTitle(
  cluster: TopicCluster,
  topic: Topic,
): (title: string) => boolean {
  return (title) =>
    sameTitle(cluster.title, title) ||
    sameTitle(topic.title, title) ||
    areRedundantNavTitles(cluster.title, title) ||
    areRedundantNavTitles(topic.title, title);
}

function theoryConceptBrowseCard(
  entry: ConceptOutline,
  topicPath: string,
  skipTitle: (title: string) => boolean,
): BrowseCard | undefined {
  if (skipTitle(entry.title)) {
    return undefined;
  }
  return {
    href: `${topicPath}#${entry.id}`,
    title: entry.title,
    description: "",
  };
}

/** Replace a lone topic row that repeats the cluster title with grouped index rows. */
export function conceptIndexBrowseCardsForTopic(
  cluster: TopicCluster,
  topic: Topic,
  locale: Locale = DEFAULT_LOCALE,
  options?: ConceptIndexBrowseCardsOptions,
): readonly BrowseCard[] {
  const outline = loadTopicOutline(topic, locale);
  if (outline.length === 0) {
    return [];
  }
  const skipTitle = skipsRedundantConceptTitle(cluster, topic);
  const topicPath = withLocale(locale, topicHref(topic));
  const groupHashBase =
    options?.groupHashBase ??
    subjectPathForGroupedTopic(topic, locale) ??
    topicPath;
  const theory = theoryOutline(outline);
  const theoryGroupLabels = orderedGroupLabels(theory);
  const cards: BrowseCard[] = [];

  if (theoryGroupLabels.length > 0) {
    for (const entry of theory) {
      if (entry.group?.trim()) {
        continue;
      }
      const card = theoryConceptBrowseCard(entry, topicPath, skipTitle);
      if (card) {
        cards.push(card);
      }
    }
    for (const title of theoryGroupLabels.filter(
      (label) => !skipTitle(label) && !sameTitle(cluster.title, label),
    )) {
      cards.push({
        href: `${groupHashBase}#${conceptGroupSectionDomId(title)}`,
        title,
        description: "",
        indexRowKind: "group-heading" as const,
      });
      for (const entry of theory) {
        if (entry.group?.trim() !== title) {
          continue;
        }
        const card = theoryConceptBrowseCard(entry, topicPath, skipTitle);
        if (card) {
          cards.push(card);
        }
      }
    }
  } else {
    cards.push(
      ...theory
        .filter((entry) => !skipTitle(entry.title))
        .map((entry) => ({
          href: `${topicPath}#${entry.id}`,
          title: entry.title,
          description: "",
        })),
    );
  }

  return cards;
}

/** Concept bullets when the standard expansion omits same-titled outline rows. */
function titleTwinResidualBrowseCards(
  cluster: TopicCluster,
  topic: Topic,
  locale: Locale,
): readonly BrowseCard[] {
  const outline = theoryOutline(loadTopicOutline(topic, locale));
  if (outline.length === 0) {
    return [];
  }
  const skipTitle = skipsRedundantConceptTitle(cluster, topic);
  const topicPath = withLocale(locale, topicHref(topic));
  const distinct = outline.filter((entry) => !skipTitle(entry.title));
  if (distinct.length > 0) {
    return distinct.map((entry) => ({
      href: `${topicPath}#${entry.id}`,
      title: entry.title,
      description: "",
    }));
  }
  return [];
}

function topicFromBrowseHref(href: string): Topic | undefined {
  const { path } = stripLocalePrefix(href);
  const [track, slug] = path.split("/").filter(Boolean);
  if (!track || !slug) {
    return undefined;
  }
  return getTopic(track, slug);
}

/** One catalog topic shares the cluster heading (e.g. Core → Core). */
function isTitleTwinClusterTopic(
  section: SubjectClusterSection,
  topic: Topic,
): boolean {
  const grouping = topic.grouping;
  if (!grouping) {
    return false;
  }
  const subject = getSubject(topic.track, grouping.subject);
  if (!subject) {
    return false;
  }
  return titleTwinTopicForCluster(subject, section.cluster.id) !== undefined;
}

function stripRedundantClusterTitleItems(
  section: SubjectClusterSection,
): SubjectClusterSection {
  if (section.items.length <= 1) {
    return section;
  }
  const filtered = section.items.filter(
    (item) => !sameTitle(item.title, section.cluster.title),
  );
  if (filtered.length === section.items.length || filtered.length === 0) {
    return section;
  }
  return { ...section, items: filtered };
}

function expandTopicBrowseCards(
  locale: Locale,
  cluster: TopicCluster,
  topic: Topic,
  fallback: BrowseCard,
): readonly BrowseCard[] {
  const pseudoCluster: TopicCluster = {
    ...cluster,
    id: `${cluster.id}:${topic.slug}`,
    title: topic.title,
  };
  const expanded = conceptIndexBrowseCardsForTopic(
    pseudoCluster,
    topic,
    locale,
    {
      groupHashBase: subjectPathForGroupedTopic(topic, locale),
    },
  );
  if (expanded.length > 0) {
    return expanded;
  }
  const residual = titleTwinResidualBrowseCards(pseudoCluster, topic, locale);
  if (residual.length > 0) {
    return residual;
  }
  return [fallback];
}

/** Subject-hub index: list catalog topics only — do not inline their concepts. */
function expandMultiTopicClusterSectionTopicsOnly(
  _locale: Locale,
  section: SubjectClusterSection,
): SubjectClusterSection[] {
  const items: BrowseCard[] = [];
  for (const card of section.items) {
    if (card.indexRowKind === "group-heading") {
      continue;
    }
    if (!card.title.trim()) {
      continue;
    }
    items.push({
      href: card.href,
      title: card.title,
      description: card.description ?? "",
    });
  }
  if (items.length === 0) {
    return [section];
  }
  return [{ ...section, items }];
}

/** Nested topic headings + concept rows (when index fits one pane). */
function expandMultiTopicClusterSectionNested(
  locale: Locale,
  section: SubjectClusterSection,
): SubjectClusterSection[] {
  const items: BrowseCard[] = [];
  for (const card of section.items) {
    if (card.indexRowKind === "group-heading") {
      continue;
    }
    const topic = topicFromBrowseHref(card.href);
    if (!topic) {
      continue;
    }
    const topicCards = expandTopicBrowseCards(
      locale,
      section.cluster,
      topic,
      card,
    );
    const childItems = topicCards.filter(
      (item) =>
        item.indexRowKind !== "group-heading" &&
        !sameTitle(item.title, card.title),
    );
    if (childItems.length > 0) {
      items.push({
        href: card.href,
        title: card.title,
        description: "",
        indexRowKind: "group-heading",
      });
      items.push(...childItems);
      continue;
    }
    if (topicCards.length > 0 || card.title.trim().length > 0) {
      items.push({
        href: card.href,
        title: card.title,
        description: card.description,
      });
      continue;
    }
    items.push(card);
  }
  if (items.length === 0) {
    return [section];
  }
  return [{ ...section, items }];
}

export type ClusterConceptIndexExpandOptions = {
  /** Multi-topic cluster rows on subject hub indexes (default: topic links only). */
  readonly multiTopicChildren?: "topics" | "nested";
};

/** Expand already-localized cluster sections (topic hrefs may include locale). */
export function expandClusterSectionsForConceptIndex(
  locale: Locale,
  sections: readonly SubjectClusterSection[],
  options?: ClusterConceptIndexExpandOptions,
): SubjectClusterSection[] {
  return sections
    .flatMap((section) =>
      expandClusterSectionForConceptIndex(locale, section, options),
    )
    .map(stripRedundantClusterTitleItems);
}

function expandClusterSectionForConceptIndex(
  locale: Locale,
  section: SubjectClusterSection,
  options?: ClusterConceptIndexExpandOptions,
): SubjectClusterSection[] {
  const { cluster, items } = section;
  if (items.length > 1) {
    return options?.multiTopicChildren === "nested"
      ? expandMultiTopicClusterSectionNested(locale, section)
      : expandMultiTopicClusterSectionTopicsOnly(locale, section);
  }
  if (items.length === 0) {
    return [section];
  }
  const [card] = items;
  const topic = topicFromBrowseHref(card.href);
  if (!topic) {
    return [section];
  }
  if (isTitleTwinClusterTopic(section, topic)) {
    return [{ ...section, cluster, items: [] }];
  }
  const expanded = conceptIndexBrowseCardsForTopic(cluster, topic, locale, {
    groupHashBase: subjectPathForGroupedTopic(topic, locale),
  });
  if (expanded.length > 0) {
    return [{ ...section, cluster, items: expanded }];
  }
  const residual = titleTwinResidualBrowseCards(cluster, topic, locale);
  if (residual.length > 0) {
    return [{ ...section, cluster, items: residual }];
  }
  const theory = theoryOutline(loadTopicOutline(topic, locale));
  if (theory.length > 0) {
    return [{ ...section, cluster, items: [] }];
  }
  return [section];
}
