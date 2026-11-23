import { getTopic, isTrackId, type TrackId } from "@/lib/catalog";
import {
  homeHref,
  localeFromPathname,
  stripLocalePrefix,
} from "@/lib/i18n/paths";
import {
  pathNavRootSection,
  peelSectionPrefix,
  sectionHomeHref,
  withHandbookSection,
} from "@/lib/i18n/sectionPaths";
import { isInterviewSectionTopic } from "./navUtils";
import {
  persistNavRootSection,
  readPersistedNavRootSection,
} from "./rootSectionPreference";
import { navTopics } from "./search";
import type {
  NavCluster,
  NavGroup,
  NavRootSection,
  NavRootSectionId,
  NavSubject,
  NavTopic,
} from "./types";

export type NavTrackScope = `${NavRootSectionId}:${TrackId}`;

export function navTrackScope(
  sectionId: NavRootSectionId,
  trackId: TrackId,
): NavTrackScope {
  return `${sectionId}:${trackId}`;
}

export function inferNavRootSection(pathname: string): NavRootSectionId {
  const { path } = stripLocalePrefix(pathname);
  const peeled = peelSectionPrefix(path);
  if (peeled.section) {
    persistNavRootSection(peeled.section);
    if (peeled.rest === "/" || peeled.rest === "") {
      return peeled.section;
    }
    return peeled.section;
  }
  const fromPath = pathNavRootSection(path);
  if (fromPath) {
    persistNavRootSection(fromPath);
    return fromPath;
  }
  if (path === "/") {
    return readPersistedNavRootSection() ?? "conspect";
  }
  if (path === "/instructions") {
    return "conspect";
  }
  const segments = peeled.rest.slice(1).split("/").filter(Boolean);
  const trackSlug = segments[0];
  const topicSlug = segments[1];
  if (!trackSlug || !isTrackId(trackSlug)) {
    const persisted = readPersistedNavRootSection();
    return persisted ?? "conspect";
  }
  if (topicSlug) {
    const topic = getTopic(trackSlug, topicSlug);
    if (topic && isInterviewSectionTopic(topic)) {
      persistNavRootSection("interviews");
      return "interviews";
    }
    persistNavRootSection("conspect");
    return "conspect";
  }
  const persisted = readPersistedNavRootSection();
  return persisted ?? "conspect";
}

export function navGroupsForRootSection(
  sections: readonly NavRootSection[],
  sectionId: NavRootSectionId,
): readonly NavGroup[] {
  return sections.find((section) => section.id === sectionId)?.groups ?? [];
}

export function navGroupsForPath(
  sections: readonly NavRootSection[],
  pathname: string,
): readonly NavGroup[] {
  return navGroupsForRootSection(sections, inferNavRootSection(pathname));
}

export function allNavGroups(
  sections: readonly NavRootSection[],
): readonly NavGroup[] {
  return sections.flatMap((section) => section.groups);
}

export function groupLandingHref(group: NavGroup): string {
  if (group.leafTopic) {
    return group.leafTopic.href;
  }
  if (group.hubTopic) {
    return group.hubTopic.href;
  }
  return group.href;
}

export function groupNavigateHref(
  group: NavGroup,
  sectionId: NavRootSectionId,
): string {
  if (sectionId === "interviews") {
    const first = firstTopicInGroup(group);
    if (first) {
      return first.href;
    }
  }
  return groupLandingHref(group);
}

export function clusterNavigateHref(
  cluster: NavCluster,
  sectionId: NavRootSectionId,
  subjectHref: string,
  trackId?: TrackId,
): string {
  if (sectionId === "interviews") {
    if (trackId) {
      for (const topic of cluster.topics) {
        const catalog = getTopic(trackId, topic.slug);
        if (catalog && isInterviewSectionTopic(catalog)) {
          return withHandbookSection(topic.href, sectionId);
        }
      }
    }
    if (cluster.topics[0]) {
      return withHandbookSection(cluster.topics[0].href, sectionId);
    }
  }
  return withHandbookSection(cluster.href, sectionId);
}

function firstTopicInGroup(group: NavGroup): NavTopic | null {
  return navTopics([group])[0] ?? null;
}

function subjectTopicsInGroup(
  group: NavGroup,
  subjectSlug: string,
): readonly NavTopic[] {
  for (const entry of group.entries) {
    if (entry.kind === "subject" && entry.subject.slug === subjectSlug) {
      return navTopics([
        {
          ...group,
          entries: [entry],
          hubTopic: undefined,
          leafTopic: undefined,
        },
      ]);
    }
  }
  return [];
}

function pairingKeywords(topicSlug: string): string[] {
  return topicSlug
    .replace(/-interview-tasks$/, "")
    .replace(/-interview$/, "")
    .replace(/-questions$/, "")
    .split("-")
    .filter((part) => part.length > 1);
}

function bestKeywordMatch(
  keywords: readonly string[],
  topics: readonly NavTopic[],
): NavTopic | null {
  for (const keyword of [...keywords].reverse()) {
    const hit = topics.find((topic) => topic.slug.includes(keyword));
    if (hit) {
      return hit;
    }
  }
  return null;
}

function pairedBySubject(
  group: NavGroup,
  trackSlug: TrackId,
  topicSlug: string,
  targetSectionId: NavRootSectionId,
): NavTopic | null {
  const source = getTopic(trackSlug, topicSlug);
  if (!source?.grouping) {
    return null;
  }
  const subjectSlug = source.grouping.subject;
  const keywords = pairingKeywords(topicSlug);

  if (targetSectionId === "interviews") {
    const interviews = navTopics([group]).filter((topic) => {
      const catalog = getTopic(trackSlug, topic.slug);
      return (
        catalog?.grouping?.subject === subjectSlug &&
        isInterviewSectionTopic(catalog)
      );
    });
    const keywordMatch = bestKeywordMatch(keywords, interviews);
    if (keywordMatch?.slug.endsWith("-questions")) {
      return keywordMatch;
    }
    const preferred = interviews.find(
      (topic) => topic.slug === `${subjectSlug}-interview`,
    );
    if (preferred) {
      return preferred;
    }
    return keywordMatch ?? interviews[0] ?? null;
  }

  const conspect = subjectTopicsInGroup(group, subjectSlug);
  return bestKeywordMatch(keywords, conspect) ?? conspect[0] ?? null;
}

function pairedTopicInGroup(
  group: NavGroup,
  pathname: string,
  targetSectionId: NavRootSectionId,
): NavTopic | null {
  const { path } = stripLocalePrefix(pathname);
  const { rest } = peelSectionPrefix(path);
  const segments = rest.slice(1).split("/").filter(Boolean);
  const trackSlug = segments[0];
  const topicSlug = segments[1];
  if (!trackSlug || !isTrackId(trackSlug) || !topicSlug) {
    return null;
  }

  const topics = navTopics([group]);
  const exact = topics.find((topic) => topic.href === pathname);
  if (exact) {
    return exact;
  }

  const bySubject = pairedBySubject(
    group,
    trackSlug,
    topicSlug,
    targetSectionId,
  );
  if (bySubject) {
    return bySubject;
  }

  if (targetSectionId === "interviews") {
    const candidates = [
      `${topicSlug}-interview`,
      `${topicSlug}-questions`,
      `${topicSlug.replace(/-fundamentals$/, "")}-interview`,
    ];
    for (const slug of candidates) {
      const hit = topics.find((topic) => topic.slug === slug);
      if (hit) {
        return hit;
      }
    }
    return (
      topics.find(
        (topic) =>
          topic.slug.startsWith(`${topicSlug}-`) ||
          topic.slug.startsWith(topicSlug),
      ) ?? null
    );
  }

  const base = topicSlug
    .replace(/-interview-tasks$/, "")
    .replace(/-interview$/, "")
    .replace(/-questions$/, "");
  const direct = topics.find((topic) => topic.slug === base);
  if (direct) {
    return direct;
  }
  return topics.find((topic) => topic.slug.startsWith(`${base}-`)) ?? null;
}

export function sectionGroupLandingHref(
  group: NavGroup,
  pathname: string,
  targetSectionId: NavRootSectionId,
): string {
  const paired = pairedTopicInGroup(group, pathname, targetSectionId);
  if (paired) {
    return paired.href;
  }

  if (targetSectionId === "interviews") {
    const first = firstTopicInGroup(group);
    if (first) {
      return first.href;
    }
  }

  return groupLandingHref(group);
}

/** Track row in breadcrumbs — interviews open an interview topic, not the conspect track hub. */
export function navGroupCrumbHref(group: NavGroup, pathname: string): string {
  const sectionId = inferNavRootSection(pathname);
  if (sectionId === "interviews") {
    persistNavRootSection("interviews");
  }
  const href = groupNavigateHref(group, sectionId);
  return withHandbookSection(href, sectionId);
}

export function navBreadcrumbHomeHref(
  _sections: readonly NavRootSection[],
  pathname: string,
): string {
  const locale = localeFromPathname(pathname);
  const sectionId = inferNavRootSection(pathname);
  persistNavRootSection(sectionId);
  return sectionHomeHref(locale, sectionId);
}

export function navSubjectNavigateHref(
  group: NavGroup,
  subject: Pick<NavSubject, "slug" | "href">,
  sectionId: NavRootSectionId,
): string {
  let target = subject.href;
  if (sectionId === "interviews") {
    const trackSlug = group.id;
    if (!isTrackId(trackSlug)) {
      return withHandbookSection(subject.href, sectionId);
    }
    const interviews = subjectTopicsInGroup(group, subject.slug).filter(
      (topic) => {
        const catalog = getTopic(trackSlug, topic.slug);
        return catalog !== undefined && isInterviewSectionTopic(catalog);
      },
    );
    const preferred = interviews.find(
      (topic) => topic.slug === `${subject.slug}-interview`,
    );
    target =
      preferred?.href ??
      interviews[0]?.href ??
      groupNavigateHref(group, "interviews");
  }
  return withHandbookSection(target, sectionId);
}

export function navSubjectCrumbHref(
  group: NavGroup,
  subject: Pick<NavSubject, "slug" | "href">,
  pathname: string,
): string {
  const sectionId = inferNavRootSection(pathname);
  if (sectionId === "conspect") {
    return withHandbookSection(subject.href, sectionId);
  }
  const trackSlug = group.id;
  if (!isTrackId(trackSlug)) {
    return withHandbookSection(subject.href, sectionId);
  }
  const { path } = stripLocalePrefix(pathname);
  const { rest } = peelSectionPrefix(path);
  const topicSlug = rest.slice(1).split("/").filter(Boolean)[1];
  if (topicSlug) {
    const paired = pairedBySubject(group, trackSlug, topicSlug, "interviews");
    if (paired) {
      return withHandbookSection(paired.href, sectionId);
    }
  }
  return navSubjectNavigateHref(group, subject, "interviews");
}

export function navClusterCrumbHref(
  cluster: NavCluster,
  group: NavGroup,
  subjectHref: string,
  pathname: string,
): string {
  return clusterNavigateHref(
    cluster,
    inferNavRootSection(pathname),
    subjectHref,
    group.id,
  );
}

export function sectionSwitchHref(
  _sections: readonly NavRootSection[],
  pathname: string,
  targetSectionId: NavRootSectionId,
): string {
  const { locale } = stripLocalePrefix(pathname);
  return sectionHomeHref(locale, targetSectionId);
}
