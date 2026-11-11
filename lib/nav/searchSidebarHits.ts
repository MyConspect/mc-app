import {
  conceptBodySnippet,
  conceptHref,
  conceptMatchesQuery,
  matchesQuery,
} from "./search";
import {
  isRedundantTopicConceptTitle,
  sameTitle,
  withoutRedundantTopicTitles,
} from "./navUtils";
import {
  searchIndexFor,
  topicSearchConcepts,
  trigramBodyHits,
  type HandbookSearchIndex,
  type IndexedConceptMatch,
} from "./searchIndex";
import { navSubjectClusters } from "./subjectClusters";
import type {
  NavCluster,
  NavConcept,
  NavEntry,
  NavGroup,
  NavSubject,
  NavTopic,
  SearchMode,
} from "./types";

export const SIDEBAR_SEARCH_HIT_CAP = 40;

const groupIndexCache = new WeakMap<NavGroup, HandbookSearchIndex>();

export type SearchSidebarHit = {
  readonly href: string;
  readonly concept: NavConcept;
  readonly topic: NavTopic;
  readonly topicHref: string;
  readonly context: string;
  readonly snippet: string | null;
};

function indexForGroup(group: NavGroup): HandbookSearchIndex {
  const cached = groupIndexCache.get(group);
  if (cached) {
    return cached;
  }
  const index = searchIndexFor([group]);
  groupIndexCache.set(group, index);
  return index;
}

function fallbackMatches(
  topic: NavTopic,
  needle: string,
  mode: SearchMode,
): readonly IndexedConceptMatch[] {
  const matches: IndexedConceptMatch[] = [];
  for (const concept of topic.concepts) {
    if (!conceptMatchesQuery(concept, needle, mode)) {
      continue;
    }
    const titleMatch =
      matchesQuery(concept.title, needle) ||
      matchesQuery(concept.titleSearchText ?? "", needle);
    matches.push({
      concept,
      bodyOnly: mode === "notes" && !titleMatch,
    });
  }
  return matches;
}

function visibleConcepts(
  topic: NavTopic,
  needle: string,
  mode: SearchMode,
  index: HandbookSearchIndex,
  bodyHits: Set<number> | null,
): readonly IndexedConceptMatch[] {
  const matched =
    needle.length === 0
      ? topic.concepts.map(
          (concept): IndexedConceptMatch => ({ concept, bodyOnly: false }),
        )
      : index.topicOf.has(topic)
        ? topicSearchConcepts(index, topic, needle, mode, bodyHits)
        : fallbackMatches(topic, needle, mode);
  const nested = withoutRedundantTopicTitles(
    topic.title,
    matched,
    (item) => item.concept.title,
  );
  if (nested.length > 0) {
    return nested;
  }
  const only = matched.length === 1 ? matched[0] : undefined;
  if (only && isRedundantTopicConceptTitle(topic.title, only.concept.title)) {
    if (mode === "notes" && needle.length > 0 && only.bodyOnly) {
      return matched;
    }
    if (
      matchesQuery(topic.title, needle) ||
      matchesQuery(topic.blurb, needle)
    ) {
      return matched;
    }
    return [];
  }
  return matched;
}

function contextLabel(parts: readonly string[]): string {
  const labels: string[] = [];
  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) {
      continue;
    }
    if (labels.some((label) => sameTitle(label, trimmed))) {
      continue;
    }
    labels.push(trimmed);
  }
  return labels.join(" · ");
}

type PendingHit = {
  readonly href: string;
  readonly concept: NavConcept;
  readonly topic: NavTopic;
  readonly topicHref: string;
  readonly context: string;
  readonly bodyOnly: boolean;
};

type HitBudget = {
  readonly cap: number;
  remaining: number;
};

function matchKept(
  topic: NavTopic,
  match: IndexedConceptMatch,
  needle: string,
): boolean {
  return (
    match.bodyOnly ||
    matchesQuery(topic.title, needle) ||
    matchesQuery(topic.blurb, needle) ||
    matchesQuery(match.concept.title, needle) ||
    matchesQuery(match.concept.titleSearchText ?? "", needle)
  );
}

function pushMatch(
  hits: PendingHit[],
  budget: HitBudget,
  topic: NavTopic,
  match: IndexedConceptMatch,
  context: string,
  needle: string,
) {
  if (!matchKept(topic, match, needle)) {
    return;
  }
  if (hits.length >= budget.cap) {
    budget.remaining += 1;
    return;
  }
  hits.push({
    href: conceptHref(topic.href, match.concept.id),
    concept: match.concept,
    topic,
    topicHref: topic.href,
    context,
    bodyOnly: match.bodyOnly,
  });
}

function pushTopicHits(
  hits: PendingHit[],
  budget: HitBudget,
  topic: NavTopic,
  contextParts: readonly string[],
  needle: string,
  mode: SearchMode,
  index: HandbookSearchIndex,
  bodyHits: Set<number> | null,
) {
  let concepts = visibleConcepts(topic, needle, mode, index, bodyHits);
  if (
    concepts.length === 0 &&
    needle.length > 0 &&
    (matchesQuery(topic.title, needle) || matchesQuery(topic.blurb, needle))
  ) {
    const first = topic.concepts[0];
    concepts = first ? [{ concept: first, bodyOnly: false }] : [];
  }
  const context = contextLabel(contextParts);
  for (const match of concepts) {
    pushMatch(hits, budget, topic, match, context, needle);
  }
  for (const nested of topic.nestedTopics ?? []) {
    pushTopicHits(
      hits,
      budget,
      nested,
      [...contextParts, topic.title, nested.title],
      needle,
      mode,
      index,
      bodyHits,
    );
  }
}

function collectClusterHits(
  hits: PendingHit[],
  budget: HitBudget,
  cluster: NavCluster,
  contextParts: readonly string[],
  needle: string,
  mode: SearchMode,
  index: HandbookSearchIndex,
  bodyHits: Set<number> | null,
) {
  const onlyTopic = cluster.topics.length === 1 ? cluster.topics[0] : null;
  if (onlyTopic && sameTitle(cluster.title, onlyTopic.title)) {
    pushTopicHits(
      hits,
      budget,
      onlyTopic,
      contextParts,
      needle,
      mode,
      index,
      bodyHits,
    );
    return;
  }

  for (const topic of cluster.topics) {
    pushTopicHits(
      hits,
      budget,
      topic,
      [...contextParts, cluster.title, topic.title],
      needle,
      mode,
      index,
      bodyHits,
    );
  }
}

function collectSubjectHits(
  hits: PendingHit[],
  budget: HitBudget,
  subject: NavSubject,
  needle: string,
  mode: SearchMode,
  index: HandbookSearchIndex,
  bodyHits: Set<number> | null,
) {
  for (const cluster of navSubjectClusters(subject)) {
    collectClusterHits(
      hits,
      budget,
      cluster,
      [subject.title],
      needle,
      mode,
      index,
      bodyHits,
    );
  }
}

function collectEntryHits(
  hits: PendingHit[],
  budget: HitBudget,
  entry: NavEntry,
  needle: string,
  mode: SearchMode,
  index: HandbookSearchIndex,
  bodyHits: Set<number> | null,
) {
  switch (entry.kind) {
    case "topic":
      pushTopicHits(
        hits,
        budget,
        entry.topic,
        [entry.topic.title],
        needle,
        mode,
        index,
        bodyHits,
      );
      return;
    case "subject":
      collectSubjectHits(
        hits,
        budget,
        entry.subject,
        needle,
        mode,
        index,
        bodyHits,
      );
      return;
    case "cluster":
      collectClusterHits(
        hits,
        budget,
        entry.cluster,
        [entry.cluster.title],
        needle,
        mode,
        index,
        bodyHits,
      );
      return;
    default: {
      const _never: never = entry;
      return _never;
    }
  }
}

export type CappedSearchHits = {
  readonly hits: readonly SearchSidebarHit[];
  readonly remaining: number;
};

export function collectVisibleGroupSearchHits(
  group: NavGroup,
  query: string,
  mode: SearchMode,
  cap = SIDEBAR_SEARCH_HIT_CAP,
): CappedSearchHits {
  const needle = query.trim().toLowerCase();
  if (needle.length === 0) {
    return { hits: [], remaining: 0 };
  }

  const index = indexForGroup(group);
  const bodyHits = mode === "notes" ? trigramBodyHits(index, needle) : null;
  const pending: PendingHit[] = [];
  const budget: HitBudget = { cap, remaining: 0 };
  if (group.leafTopic) {
    pushTopicHits(
      pending,
      budget,
      group.leafTopic,
      [],
      needle,
      mode,
      index,
      bodyHits,
    );
  }
  if (group.hubTopic) {
    pushTopicHits(
      pending,
      budget,
      group.hubTopic,
      [],
      needle,
      mode,
      index,
      bodyHits,
    );
  }
  for (const entry of group.entries) {
    collectEntryHits(pending, budget, entry, needle, mode, index, bodyHits);
  }

  return {
    hits: pending.map((hit) => ({
      href: hit.href,
      concept: hit.concept,
      topic: hit.topic,
      topicHref: hit.topicHref,
      context: hit.context,
      snippet: hit.bodyOnly
        ? conceptBodySnippet(hit.concept, query, mode)
        : null,
    })),
    remaining: budget.remaining,
  };
}

export function collectGroupSearchHits(
  group: NavGroup,
  query: string,
  mode: SearchMode,
): readonly SearchSidebarHit[] {
  return collectVisibleGroupSearchHits(
    group,
    query,
    mode,
    Number.POSITIVE_INFINITY,
  ).hits;
}
