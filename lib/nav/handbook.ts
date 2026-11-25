import {
  filterConspectTheoryOutline,
  isConspectInterviewGroupLabel,
} from "@/lib/catalog/conspectInterviewGroup";
import {
  SUBJECTS,
  subjectsForTrack,
  TRACKS,
  clusterHref,
  clusterTargetHref,
  getSubject,
  getTopic,
  hubFileForTrack,
  leafTopicForTrack,
  leafTopicInterviewsHref,
  subjectHref,
  subjectClusterNavPlacement,
  subjectIntroTopicSlug,
  topicHref,
  topicsForCluster,
  topicsForTrack,
  trackHref,
  type Subject,
  type Topic,
  type TrackId,
} from "@/lib/catalog";
import {
  SUBJECT_INTRO_OMIT_CLUSTER_IDS,
  subjectCatalogKey,
} from "@/lib/catalog/subjectIntroOmitIds";
import { catalogBlurb } from "@/lib/i18n/catalog";
import {
  isBehaviorQuestionsTopic,
  localizeBehaviorOutline,
} from "@/lib/i18n/behaviorQuestions";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/locales";
import { withLocale } from "@/lib/i18n/paths";
import { loadFileOutline, loadTopicOutline } from "@/lib/parse";
import {
  areRedundantNavTitles,
  conceptsForConspectTopic,
  isInterviewSectionTopic,
  isQuestionCluster,
  sameTitle,
  shouldHideSidebarConcepts,
} from "./navUtils";
import { conceptGroupSectionDomId } from "./conceptGroupSection";
import {
  groupNavConceptsByMarkdownGroup,
  navConceptsFromOutline,
} from "./topicMarkdownGroups";
import { titleTwinMarkdownGroupClusters } from "./titleTwinTopicGroupNav";
import type {
  NavCluster,
  NavConcept,
  NavEntry,
  NavGroup,
  NavRootSection,
  NavRootSectionId,
  NavSubject,
  NavTopic,
} from "./types";
import { allNavGroups } from "./sections";

function localizeHref(locale: Locale, href: string): string {
  return withLocale(locale, href);
}

/** Concept-group rows for subject hubs whose intro topic renders on the subject URL. */
export function subjectIntroNavClusters(
  subject: Subject,
  locale: Locale,
): NavCluster[] {
  const introSlug = subjectIntroTopicSlug(subject);
  if (!introSlug) {
    return [];
  }
  const topic = getTopic(subject.track, introSlug);
  if (!topic) {
    return [];
  }
  const outline = loadTopicOutline(topic, locale);
  if (outline.length === 0) {
    return [];
  }

  const subjectPath = withLocale(locale, subjectHref(subject));
  const grouped = groupNavConceptsByMarkdownGroup(
    navConceptsFromOutline(outline),
    topic.title,
    topic.slug,
  );

  return grouped
    .filter(
      (entry) =>
        entry.concepts.length > 0 &&
        !isConspectInterviewGroupLabel(entry.label),
    )
    .map(({ label, concepts }) => {
      const id = conceptGroupSectionDomId(label);
      const navTopic: NavTopic = {
        slug: topic.slug,
        href: subjectPath,
        title: label,
        blurb: "",
        concepts,
      };
      return {
        id,
        title: label,
        href: `${subjectPath}#${id}`,
        topics: [
          {
            ...navTopic,
            concepts: filterConspectTheoryOutline(navTopic.concepts),
          },
        ],
      };
    });
}

function omitCatalogClustersForIntro(
  subject: Subject,
  clusterIds: readonly string[],
): readonly string[] {
  const introSlug = subjectIntroTopicSlug(subject);
  if (!introSlug) {
    return clusterIds;
  }
  const omit = SUBJECT_INTRO_OMIT_CLUSTER_IDS[subjectCatalogKey(subject)];
  if (!omit?.length) {
    return clusterIds;
  }
  const blocked = new Set(omit);
  return clusterIds.filter((id) => !blocked.has(id));
}

function hubNavTopic(
  trackId: (typeof TRACKS)[number]["id"],
  locale: Locale,
): NavTopic | undefined {
  const file = hubFileForTrack(trackId);
  if (!file) {
    return undefined;
  }
  const concepts = loadFileOutline(file, locale);
  if (concepts.length === 0) {
    return undefined;
  }
  return {
    slug: "hub",
    href: localizeHref(locale, trackHref(trackId)),
    title: "",
    blurb: "",
    concepts,
  };
}

function toNavTopic(topic: Topic, locale: Locale): NavTopic {
  const outline = conceptsForConspectTopic(
    topic,
    loadTopicOutline(topic, locale),
  );
  return {
    slug: topic.slug,
    href: localizeHref(locale, topicHref(topic)),
    title: catalogBlurb(locale, topic.title),
    blurb: catalogBlurb(locale, topic.blurb),
    concepts: isBehaviorQuestionsTopic(topic)
      ? localizeBehaviorOutline(outline, locale)
      : outline,
    hideSidebarConcepts: shouldHideSidebarConcepts(topic),
  };
}

function attachNestedNavTopics(
  roots: readonly Topic[],
  all: readonly Topic[],
  locale: Locale,
): NavTopic[] {
  const childrenByParent = new Map<string, Topic[]>();
  for (const topic of all) {
    if (!topic.navParentSlug) {
      continue;
    }
    const list = childrenByParent.get(topic.navParentSlug) ?? [];
    list.push(topic);
    childrenByParent.set(topic.navParentSlug, list);
  }
  function buildNav(topic: Topic): NavTopic {
    const nav = toNavTopic(topic, locale);
    const children = childrenByParent.get(topic.slug);
    if (!children?.length) {
      return nav;
    }
    return {
      ...nav,
      concepts: [],
      nestedTopics: children.map((child) => buildNav(child)),
    };
  }
  return roots.map((topic) => buildNav(topic));
}

function navTopicsForFlatTrack(
  trackId: (typeof TRACKS)[number]["id"],
  locale: Locale,
): NavTopic[] {
  const all = topicsForTrack(trackId).filter((topic) => !topic.grouping);
  const visible = all.filter((topic) => !topic.hideFromSubjectNav);
  return attachNestedNavTopics(visible, all, locale);
}

function navTopicsForCluster(
  subject: (typeof SUBJECTS)[number],
  clusterId: string,
  locale: Locale,
): NavTopic[] {
  const visible = topicsForCluster(subject, clusterId);
  const nestedByParent = new Map<string, NavTopic[]>();
  for (const topic of topicsForCluster(subject, clusterId, {
    includeHiddenNav: true,
  })) {
    if (!topic.navParentSlug) {
      continue;
    }
    const nested = toNavTopic(topic, locale);
    const list = nestedByParent.get(topic.navParentSlug) ?? [];
    list.push(nested);
    nestedByParent.set(topic.navParentSlug, list);
  }
  return visible.map((topic) => {
    const nav = toNavTopic(topic, locale);
    const nestedTopics = nestedByParent.get(topic.slug);
    if (!nestedTopics?.length) {
      return nav;
    }
    return { ...nav, nestedTopics, concepts: [] };
  });
}

function subjectNavEntry(
  subject: Subject,
  locale: Locale,
): NavEntry | undefined {
  const introClusters = subjectIntroNavClusters(subject, locale);
  const catalogClusterIds = omitCatalogClustersForIntro(
    subject,
    subject.clusters.map((cluster) => cluster.id),
  );
  const clusters = [
    ...introClusters,
    ...subject.clusters
      .filter((cluster) => catalogClusterIds.includes(cluster.id))
      .map((cluster) => {
        const subjectPath = localizeHref(locale, subjectHref(subject));
        const topics = navTopicsForCluster(subject, cluster.id, locale);
        const clusterDefinition = subject.clusters.find(
          (item) => item.id === cluster.id,
        );
        if (
          clusterDefinition &&
          topics.some((topic) => (topic.nestedTopics?.length ?? 0) > 0)
        ) {
          return {
            id: cluster.id,
            title: cluster.title,
            href: localizeHref(
              locale,
              clusterTargetHref(subject, clusterDefinition),
            ),
            topics,
          };
        }
        const catalogTopics = topicsForCluster(subject, cluster.id);
        let nestedClusters: NavCluster[] | undefined;
        const catalogTopic = catalogTopics[0];
        const titleTwinDedicatedTopic =
          catalogTopics.length === 1 &&
          topics.length === 1 &&
          catalogTopic &&
          clusterDefinition &&
          areRedundantNavTitles(cluster.title, catalogTopic.title) &&
          clusterTargetHref(subject, clusterDefinition) !==
            clusterHref(subject, clusterDefinition);
        if (titleTwinDedicatedTopic) {
          const nested = titleTwinMarkdownGroupClusters(
            subjectPath,
            cluster.title,
            catalogTopic,
            locale,
          );
          const promoteMarkdownGroups =
            nested.length > 1 ||
            (nested.length === 1 && nested[0]?.title !== "Overview");
          return {
            id: cluster.id,
            title: cluster.title,
            href: localizeHref(
              locale,
              clusterTargetHref(subject, clusterDefinition),
            ),
            topics,
            ...(subject.flatNav &&
            promoteMarkdownGroups &&
            nested.length > 0
              ? { nestedClusters: [...nested] }
              : {}),
          };
        }
        if (
          catalogTopics.length === 1 &&
          topics.length === 1 &&
          catalogTopic &&
          areRedundantNavTitles(cluster.title, catalogTopic.title)
        ) {
          const nested = titleTwinMarkdownGroupClusters(
            subjectPath,
            cluster.title,
            catalogTopic,
            locale,
          );
          const promoteMarkdownGroups =
            nested.length > 1 ||
            (nested.length === 1 && nested[0]?.title !== "Overview");
          if (promoteMarkdownGroups && nested.length > 0) {
            nestedClusters = [...nested];
          }
        }
        const hubNested =
          nestedClusters?.length && catalogTopic
            ? [
                {
                  slug: catalogTopic.slug,
                  href: `${subjectPath}#${cluster.id}`,
                  title: cluster.title,
                  blurb: catalogBlurb(locale, catalogTopic.blurb),
                  concepts: navConceptsFromOutline(
                    conceptsForConspectTopic(
                      catalogTopic,
                      loadTopicOutline(catalogTopic, locale),
                    ),
                  ),
                  hideSidebarConcepts: true,
                },
              ]
            : undefined;
        return {
          id: cluster.id,
          title: cluster.title,
          href: nestedClusters?.length
            ? `${subjectPath}#${cluster.id}`
            : localizeHref(locale, clusterTargetHref(subject, cluster)),
          topics: hubNested ?? topics,
          ...(nestedClusters?.length ? { nestedClusters } : {}),
        };
      })
      .filter(
        (cluster) =>
          cluster.topics.length > 0 ||
          (cluster.nestedClusters?.length ?? 0) > 0,
      ),
  ];
  if (clusters.length === 0) {
    return undefined;
  }
  const sections = subject.sections?.map((section) => ({
    id: section.id,
    title: section.title,
    defaultOpen: section.defaultOpen,
    collapsible: section.collapsible,
    flatNav: section.flatNav,
    clusters: clusters.filter((cluster) => {
      const definition = subject.clusters.find(
        (item) => item.id === cluster.id,
      );
      return definition
        ? subjectClusterNavPlacement(definition) === "section" &&
            definition.section === section.id
        : false;
    }),
  }));
  const rootClusters = clusters.filter((cluster) => {
    const definition = subject.clusters.find((item) => item.id === cluster.id);
    return definition
      ? subjectClusterNavPlacement(definition) === "root"
      : false;
  });
  const clustersAfterSections = clusters.filter((cluster) => {
    const definition = subject.clusters.find((item) => item.id === cluster.id);
    return definition
      ? subjectClusterNavPlacement(definition) === "after-sections"
      : false;
  });
  return {
    kind: "subject",
    subject: {
      slug: subject.slug,
      href: localizeHref(locale, subjectHref(subject)),
      title: subject.title,
      blurb: catalogBlurb(locale, subject.blurb),
      flatNav: subject.flatNav,
      sections: sections?.length ? sections : undefined,
      clusters: sections?.length ? rootClusters : clusters,
      clustersAfterSections: sections?.length
        ? clustersAfterSections
        : undefined,
    },
  };
}

function entriesForTrack(
  trackId: (typeof TRACKS)[number]["id"],
  locale: Locale,
): readonly NavEntry[] {
  const entries: NavEntry[] = [];

  for (const subject of subjectsForTrack(trackId)) {
    const entry = subjectNavEntry(subject, locale);
    if (!entry) {
      continue;
    }
    entries.push(entry);
  }

  for (const navTopic of navTopicsForFlatTrack(trackId, locale)) {
    entries.push({ kind: "topic", topic: navTopic });
  }

  return entries;
}

function isGenericQuestionTitle(title: string): boolean {
  return title === "Interview" || title === "Tasks";
}

/** Interview hoist must keep catalog topic URLs, not subject-hub cluster hashes. */
function interviewNavTopicFromCatalog(
  trackId: TrackId,
  topic: NavTopic,
  locale: Locale,
): NavTopic {
  const catalog = getTopic(trackId, topic.slug);
  if (!catalog) {
    return topic;
  }
  return {
    ...topic,
    href: localizeHref(locale, topicHref(catalog)),
    hideSidebarConcepts: shouldHideSidebarConcepts(catalog),
  };
}

function hoistedTopicTitle(
  trackId: TrackId,
  subject: NavSubject,
  cluster: NavCluster,
  topic: NavTopic,
  locale: Locale,
): string {
  if (!isGenericQuestionTitle(topic.title)) {
    return topic.title;
  }
  const catalogSubject = getSubject(trackId, subject.slug);
  const definition = catalogSubject?.clusters.find(
    (item) => item.id === cluster.id,
  );
  const section = catalogSubject?.sections?.find(
    (item) => item.id === definition?.section,
  );
  if (section) {
    return catalogBlurb(locale, section.title);
  }
  return subject.title;
}

function interviewNavTopicsInCluster(
  trackId: TrackId,
  subject: NavSubject,
  cluster: NavCluster,
  locale: Locale,
): NavTopic[] {
  return cluster.topics.map((topic) => {
    const canonical = interviewNavTopicFromCatalog(trackId, topic, locale);
    return {
      ...canonical,
      title: hoistedTopicTitle(
        trackId,
        subject,
        cluster,
        canonical,
        locale,
      ),
    };
  });
}

function interviewQuestionClustersInList(
  trackId: TrackId,
  subject: NavSubject,
  clusters: readonly NavCluster[],
  locale: Locale,
  includeTasks: boolean,
): NavCluster[] {
  const out: NavCluster[] = [];
  for (const cluster of clusters) {
    if (!isQuestionCluster(cluster.id)) {
      continue;
    }
    const isTasks =
      cluster.id === "tasks" || cluster.id.endsWith("-tasks");
    if (includeTasks !== isTasks) {
      continue;
    }
    const topics = interviewNavTopicsInCluster(trackId, subject, cluster, locale);
    if (topics.length === 0) {
      continue;
    }
    out.push({
      ...cluster,
      href:
        topics.length === 1
          ? topics[0]!.href
          : cluster.href,
      topics,
    });
  }
  return out;
}

function takeQuestionClusters(
  trackId: TrackId,
  subject: NavSubject,
  locale: Locale,
): {
  readonly subject: NavSubject;
  readonly interview: readonly NavTopic[];
  readonly tasks: readonly NavTopic[];
} {
  const interview: NavTopic[] = [];
  const tasks: NavTopic[] = [];

  const split = (clusters: readonly NavCluster[]): NavCluster[] => {
    const kept: NavCluster[] = [];
    for (const cluster of clusters) {
      if (!isQuestionCluster(cluster.id)) {
        kept.push(cluster);
        continue;
      }
      const topics = interviewNavTopicsInCluster(
        trackId,
        subject,
        cluster,
        locale,
      );
      if (cluster.id === "tasks" || cluster.id.endsWith("-tasks")) {
        tasks.push(...topics);
      } else {
        interview.push(...topics);
      }
    }
    return kept;
  };

  const root = split(subject.clusters);
  const sections = subject.sections
    ?.map((section) => ({ ...section, clusters: split(section.clusters) }))
    .filter((section) => section.clusters.length > 0);
  const after = subject.clustersAfterSections
    ? split(subject.clustersAfterSections)
    : undefined;

  return {
    subject: {
      ...subject,
      clusters: root,
      sections: sections?.length ? sections : undefined,
      clustersAfterSections: after?.length ? after : undefined,
    },
    interview,
    tasks,
  };
}

function questionClusterEntry(
  trackHref: string,
  id: string,
  title: string,
  topics: readonly NavTopic[],
): NavEntry | null {
  if (topics.length === 0) {
    return null;
  }
  return {
    kind: "cluster",
    subjectHref: trackHref,
    cluster: {
      id,
      title,
      href: topics.length === 1 ? topics[0].href : trackHref,
      topics,
    },
  };
}

function subjectHasNavContent(subject: NavSubject): boolean {
  if (subject.clusters.length > 0) {
    return true;
  }
  if ((subject.clustersAfterSections?.length ?? 0) > 0) {
    return true;
  }
  return (
    subject.sections?.some((section) => section.clusters.length > 0) ?? false
  );
}

function stripQuestionEntries(
  entries: readonly NavEntry[],
  trackId: TrackId,
  locale: Locale,
): readonly NavEntry[] {
  const next: NavEntry[] = [];
  for (const entry of entries) {
    if (entry.kind === "topic") {
      const catalog = getTopic(trackId, entry.topic.slug);
      if (catalog && isInterviewSectionTopic(catalog)) {
        continue;
      }
      next.push(entry);
      continue;
    }
    if (entry.kind !== "subject") {
      next.push(entry);
      continue;
    }
    const pulled = takeQuestionClusters(trackId, entry.subject, locale);
    if (subjectHasNavContent(pulled.subject)) {
      next.push({ kind: "subject", subject: pulled.subject });
    }
  }
  return next;
}

function clusterTitleFromCatalog(
  trackId: TrackId,
  subjectSlug: string,
  clusterId: string,
  locale: Locale,
): string {
  const subject = getSubject(trackId, subjectSlug);
  const cluster = subject?.clusters.find((item) => item.id === clusterId);
  return cluster ? catalogBlurb(locale, cluster.title) : clusterId;
}

function mergeInterviewFlatTopicIntoSubject(
  trackId: TrackId,
  subject: NavSubject,
  topic: NavTopic,
  locale: Locale,
): NavSubject {
  const catalog = getTopic(trackId, topic.slug);
  const clusterId = catalog?.grouping?.cluster;
  if (!catalog || !clusterId) {
    return subject;
  }
  const canonical = interviewNavTopicFromCatalog(trackId, topic, locale);
  const shell: NavCluster = {
    id: clusterId,
    title: clusterTitleFromCatalog(trackId, subject.slug, clusterId, locale),
    href: canonical.href,
    topics: [],
  };
  const navTopic = {
    ...canonical,
    title: hoistedTopicTitle(trackId, subject, shell, canonical, locale),
  };

  const upsertCluster = (clusters: readonly NavCluster[]): NavCluster[] => {
    const idx = clusters.findIndex((item) => item.id === clusterId);
    if (idx >= 0) {
      const existing = clusters[idx]!;
      const topics = existing.topics.some((item) => item.slug === navTopic.slug)
        ? existing.topics
        : [...existing.topics, navTopic];
      return clusters.map((item, index) =>
        index === idx ? { ...existing, topics } : item,
      );
    }
    return [
      ...clusters,
      {
        id: clusterId,
        title: shell.title,
        href: navTopic.href,
        topics: [navTopic],
      },
    ];
  };

  return {
    ...subject,
    clusters: upsertCluster(subject.clusters),
    sections: subject.sections?.map((section) => ({
      ...section,
      clusters: upsertCluster(section.clusters),
    })),
    clustersAfterSections: subject.clustersAfterSections
      ? upsertCluster(subject.clustersAfterSections)
      : undefined,
  };
}

/** Sidebar rows only mount `clusters` and section clusters, not `clustersAfterSections`. */
function promoteInterviewClustersForSidebar(subject: NavSubject): NavSubject {
  const after = subject.clustersAfterSections ?? [];
  if (after.length === 0) {
    return subject;
  }
  return {
    ...subject,
    clusters: [...subject.clusters, ...after],
    clustersAfterSections: undefined,
  };
}

function buildInterviewSubject(
  trackId: TrackId,
  subject: NavSubject,
  locale: Locale,
): NavSubject | null {
  const clusters = interviewQuestionClustersInList(
    trackId,
    subject,
    subject.clusters,
    locale,
    false,
  );
  const sections = subject.sections
    ?.map((section) => ({
      ...section,
      clusters: interviewQuestionClustersInList(
        trackId,
        subject,
        section.clusters,
        locale,
        false,
      ),
    }))
    .filter((section) => section.clusters.length > 0);
  const after = subject.clustersAfterSections
    ? interviewQuestionClustersInList(
        trackId,
        subject,
        subject.clustersAfterSections,
        locale,
        false,
      )
    : undefined;
  const built = promoteInterviewClustersForSidebar({
    ...subject,
    clusters,
    sections: sections?.length ? sections : undefined,
    clustersAfterSections: after?.length ? after : undefined,
  });
  if (!subjectHasNavContent(built)) {
    return null;
  }
  return built;
}

function collectInterviewTaskTopics(
  trackId: TrackId,
  subject: NavSubject,
  locale: Locale,
): NavTopic[] {
  const tasks: NavTopic[] = [];
  const addFrom = (list: readonly NavCluster[]) => {
    for (const cluster of interviewQuestionClustersInList(
      trackId,
      subject,
      list,
      locale,
      true,
    )) {
      tasks.push(...cluster.topics);
    }
  };
  addFrom(subject.clusters);
  if (subject.sections) {
    for (const section of subject.sections) {
      addFrom(section.clusters);
    }
  }
  if (subject.clustersAfterSections) {
    addFrom(subject.clustersAfterSections);
  }
  return tasks;
}

function interviewSubjectEntries(
  entries: readonly NavEntry[],
  trackId: TrackId,
  locale: Locale,
  localizedTrackHref: string,
): readonly NavEntry[] {
  const subjects = new Map<string, NavSubject>();
  const tasks: NavTopic[] = [];
  for (const entry of entries) {
    if (entry.kind !== "subject") {
      continue;
    }
    const built = buildInterviewSubject(trackId, entry.subject, locale);
    if (built) {
      subjects.set(entry.subject.slug, built);
    }
    tasks.push(...collectInterviewTaskTopics(trackId, entry.subject, locale));
  }
  for (const entry of entries) {
    if (entry.kind !== "topic") {
      continue;
    }
    const catalog = getTopic(trackId, entry.topic.slug);
    if (!catalog || !isInterviewSectionTopic(catalog)) {
      continue;
    }
    const subjectSlug = catalog.grouping?.subject;
    if (!subjectSlug) {
      continue;
    }
    const rawSubject = entries.find(
      (item) =>
        item.kind === "subject" && item.subject.slug === subjectSlug,
    );
    if (rawSubject?.kind !== "subject") {
      continue;
    }
    const base =
      subjects.get(subjectSlug) ??
      buildInterviewSubject(trackId, rawSubject.subject, locale) ?? {
        slug: rawSubject.subject.slug,
        href: rawSubject.subject.href,
        title: rawSubject.subject.title,
        blurb: rawSubject.subject.blurb,
        clusters: [],
        sections: rawSubject.subject.sections?.map((section) => ({
          ...section,
          clusters: [],
        })),
        clustersAfterSections: [],
      };
    subjects.set(
      subjectSlug,
      promoteInterviewClustersForSidebar(
        mergeInterviewFlatTopicIntoSubject(
          trackId,
          base,
          entry.topic,
          locale,
        ),
      ),
    );
  }
  const next: NavEntry[] = [...subjects.values()]
    .filter((subject) => subjectHasNavContent(subject))
    .map((subject) => ({ kind: "subject" as const, subject }));
  const tasksEntry = questionClusterEntry(
    localizedTrackHref,
    "tasks",
    catalogBlurb(locale, "Tasks"),
    tasks,
  );
  if (tasksEntry) {
    next.push(tasksEntry);
  }
  return next;
}

function interviewClustersAtTrackLevel(
  trackId: TrackId,
  subject: NavSubject,
  locale: Locale,
  trackHref: string,
): NavEntry[] {
  const built = buildInterviewSubject(trackId, subject, locale);
  const tasks = collectInterviewTaskTopics(trackId, subject, locale);
  const entries: NavEntry[] = [];
  if (built) {
    const promote = [
      ...built.clusters,
      ...(built.sections?.flatMap((section) => section.clusters) ?? []),
      ...(built.clustersAfterSections ?? []),
    ];
    for (const cluster of promote) {
      entries.push({
        kind: "cluster",
        subjectHref: built.href,
        cluster,
      });
    }
  }
  const tasksEntry = questionClusterEntry(
    trackHref,
    "tasks",
    catalogBlurb(locale, "Tasks"),
    tasks,
  );
  if (tasksEntry) {
    entries.push(tasksEntry);
  }
  return entries;
}

function interviewsNavGroup(
  track: (typeof TRACKS)[number],
  entries: readonly NavEntry[],
  locale: Locale,
  href: string,
): NavGroup | null {
  if (entries.length === 0) {
    return null;
  }
  const interviewTopics = entries.flatMap((entry) =>
    entry.kind === "topic" ? [entry.topic] : [],
  );
  const hasTasks = entries.some(
    (entry) => entry.kind === "cluster" && entry.cluster.id === "tasks",
  );
  if (interviewTopics.length === 1 && !hasTasks) {
    return {
      id: track.id,
      title: catalogBlurb(locale, track.title),
      href,
      entries: [],
      leafTopic: interviewTopics[0],
    };
  }
  return {
    id: track.id,
    title: catalogBlurb(locale, track.title),
    href,
    entries,
  };
}

function buildTrackNavGroup(
  track: (typeof TRACKS)[number],
  locale: Locale,
  section: NavRootSectionId,
): NavGroup | null {
  const href = localizeHref(locale, trackHref(track.id));
  const leaf = leafTopicForTrack(track.id);
  const isLeafTrack = Boolean(leaf && sameTitle(leaf.title, track.title));

  if (isLeafTrack) {
    const flatTopics = navTopicsForFlatTrack(track.id, locale);
    let leafNav =
      flatTopics.find((topic) => topic.slug === leaf!.slug) ??
      toNavTopic(leaf!, locale);
    if (section === "interviews") {
      const interviewsHref = leafTopicInterviewsHref(leaf!);
      if (interviewsHref) {
        leafNav = {
          ...leafNav,
          href: localizeHref(locale, interviewsHref),
        };
      }
    }
    return {
      id: track.id,
      title: catalogBlurb(locale, track.title),
      href,
      entries: [],
      leafTopic: leafNav,
    };
  }

  const rawEntries = entriesForTrack(track.id, locale);
  const only = rawEntries.length === 1 ? rawEntries[0] : undefined;
  const isSingleSubjectTrack =
    only?.kind === "subject" &&
    areRedundantNavTitles(track.title, only.subject.title);

  if (section === "conspect" && isSingleSubjectTrack) {
    const pulled = takeQuestionClusters(track.id, only.subject, locale);
    const clusters = pulled.subject.clusters;
    if (clusters.length === 0 && !hubNavTopic(track.id, locale)) {
      return null;
    }
    return {
      id: track.id,
      title: catalogBlurb(locale, track.title),
      href,
      hubTopic: hubNavTopic(track.id, locale),
      entries: clusters.map((cluster) => ({
        kind: "cluster" as const,
        subjectHref: pulled.subject.href,
        cluster,
      })),
    };
  }

  if (
    section === "interviews" &&
    isSingleSubjectTrack &&
    only?.kind === "subject"
  ) {
    return interviewsNavGroup(
      track,
      interviewClustersAtTrackLevel(track.id, only.subject, locale, href),
      locale,
      href,
    );
  }

  const entries =
    section === "conspect"
      ? stripQuestionEntries(rawEntries, track.id, locale)
      : interviewSubjectEntries(rawEntries, track.id, locale, href);

  if (section === "interviews") {
    return interviewsNavGroup(track, entries, locale, href);
  }

  if (entries.length === 0) {
    return null;
  }

  return {
    id: track.id,
    title: catalogBlurb(locale, track.title),
    href,
    entries,
  };
}

function buildNavSection(
  id: NavRootSectionId,
  title: string,
  locale: Locale,
): NavRootSection {
  const groups = TRACKS.map((track) =>
    buildTrackNavGroup(track, locale, id),
  ).filter((group): group is NavGroup => group !== null);
  return { id, title, groups };
}

export function handbookNavSections(
  locale: Locale = DEFAULT_LOCALE,
): readonly NavRootSection[] {
  return [
    buildNavSection("conspect", catalogBlurb(locale, "Conspect"), locale),
    buildNavSection("interviews", catalogBlurb(locale, "Interviews"), locale),
  ];
}

export function handbookNav(
  locale: Locale = DEFAULT_LOCALE,
): readonly NavGroup[] {
  return allNavGroups(handbookNavSections(locale));
}

export function handbookNavForTrack(
  locale: Locale,
  trackId: TrackId,
): readonly NavGroup[] {
  return allNavGroups(handbookNavSections(locale)).filter(
    (group) => group.id === trackId,
  );
}
