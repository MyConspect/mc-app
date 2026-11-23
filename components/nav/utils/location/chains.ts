import type {
  NavCluster,
  NavEntry,
  NavGroup,
  NavRootSection,
  NavSection,
  NavSubject,
  NavTopic,
} from "@/lib/nav";
import { navSubjectClusters } from "@/lib/nav/subjectClusters";
import {
  flattenNavTopics,
  navTopicAtPath,
  navTopicTreeContainsHref,
} from "@/lib/nav/topicTree";
import { hashIdFrom } from "@/lib/nav/navUtils";
import { isActiveTrack } from "./active";
import { crumbsForPath } from "./crumbs";
import { isTopicAliasCluster } from "./shared";

export type NavStep = {
  readonly pathname: string;
  readonly hash: string;
};

function topicsFromEntry(entry: NavEntry): readonly NavTopic[] {
  switch (entry.kind) {
    case "topic":
      return flattenNavTopics(entry.topic);
    case "subject":
      return navSubjectClusters(entry.subject).flatMap((cluster) =>
        cluster.topics.flatMap((topic) => flattenNavTopics(topic)),
      );
    case "cluster":
      return entry.cluster.topics.flatMap((topic) => flattenNavTopics(topic));
    default: {
      const _never: never = entry;
      return _never;
    }
  }
}

export function collectTopicsForGroup(group: NavGroup): readonly NavTopic[] {
  if (group.leafTopic) {
    return [group.leafTopic];
  }
  const topics: NavTopic[] = [];
  for (const entry of group.entries) {
    topics.push(...topicsFromEntry(entry));
  }
  return topics;
}

function appendTopicSteps(chain: NavStep[], topic: NavTopic): void {
  const topicIndex: NavStep = { pathname: topic.href, hash: "" };
  const last = chain[chain.length - 1];
  const skipTopicIndex =
    last !== undefined &&
    last.pathname === topicIndex.pathname &&
    last.hash === topicIndex.hash;

  if (topic.concepts.length <= 1) {
    if (!skipTopicIndex) {
      chain.push(topicIndex);
    }
    return;
  }

  if (!skipTopicIndex) {
    chain.push(topicIndex);
  }
  for (const concept of topic.concepts) {
    chain.push({ pathname: topic.href, hash: concept.id });
  }
}

function flattenedClusterTopics(cluster: NavCluster): readonly NavTopic[] {
  return cluster.topics.flatMap((topic) => flattenNavTopics(topic));
}

function appendTopicTreeSteps(chain: NavStep[], topic: NavTopic): void {
  for (const flat of flattenNavTopics(topic)) {
    appendTopicSteps(chain, flat);
  }
}

function findTopicInGroup(group: NavGroup, pathname: string): NavTopic | null {
  for (const topic of collectTopicsForGroup(group)) {
    const hit = navTopicAtPath(topic, pathname);
    if (hit) {
      return hit;
    }
  }
  return null;
}

function findSubjectForPath(
  group: NavGroup,
  pathname: string,
): NavSubject | null {
  for (const entry of group.entries) {
    if (entry.kind !== "subject") {
      continue;
    }
    if (entry.subject.href === pathname) {
      return entry.subject;
    }
    for (const cluster of navSubjectClusters(entry.subject)) {
      if (
        cluster.topics.some((topic) =>
          navTopicTreeContainsHref(topic, pathname),
        )
      ) {
        return entry.subject;
      }
    }
  }
  return null;
}

type ClusterScope = {
  readonly subjectHref: string;
  readonly cluster: NavCluster;
};

function findClusterForPath(
  group: NavGroup,
  pathname: string,
): ClusterScope | null {
  for (const entry of group.entries) {
    switch (entry.kind) {
      case "cluster":
        if (
          entry.cluster.topics.some((topic) =>
            navTopicTreeContainsHref(topic, pathname),
          )
        ) {
          return { subjectHref: entry.subjectHref, cluster: entry.cluster };
        }
        break;
      case "subject":
        for (const cluster of navSubjectClusters(entry.subject)) {
          if (
            cluster.topics.some((topic) =>
              navTopicTreeContainsHref(topic, pathname),
            )
          ) {
            return { subjectHref: entry.subject.href, cluster };
          }
        }
        break;
      default:
        break;
    }
  }
  return null;
}

function findClusterOnHub(
  group: NavGroup,
  subject: NavSubject | null,
  hash: string,
): ClusterScope | null {
  const clusterId = hashIdFrom(hash);
  if (!clusterId) {
    return null;
  }
  if (subject) {
    const cluster = navSubjectClusters(subject).find(
      (item) => item.id === clusterId,
    );
    if (cluster) {
      return { subjectHref: subject.href, cluster };
    }
    return null;
  }
  for (const entry of group.entries) {
    if (entry.kind === "cluster" && entry.cluster.id === clusterId) {
      return { subjectHref: entry.subjectHref, cluster: entry.cluster };
    }
  }
  return null;
}

function buildTrackHubChain(group: NavGroup): NavStep[] {
  const chain: NavStep[] = [{ pathname: group.href, hash: "" }];
  if (group.leafTopic) {
    appendTopicSteps(chain, group.leafTopic);
    return chain;
  }

  const hasNestedSubjects = group.entries.some(
    (entry) => entry.kind === "subject" && entry.subject.href !== group.href,
  );
  if (hasNestedSubjects) {
    for (const entry of group.entries) {
      if (entry.kind === "subject") {
        chain.push({ pathname: entry.subject.href, hash: "" });
      } else if (entry.kind === "topic") {
        chain.push({ pathname: entry.topic.href, hash: "" });
      }
    }
    return chain;
  }

  for (const topic of collectTopicsForGroup(group)) {
    appendTopicSteps(chain, topic);
  }
  return chain;
}

function buildSubjectChain(subject: NavSubject): NavStep[] {
  const chain: NavStep[] = [{ pathname: subject.href, hash: "" }];
  for (const cluster of navSubjectClusters(subject)) {
    for (const topic of cluster.topics) {
      appendTopicTreeSteps(chain, topic);
    }
  }
  return chain;
}

function buildClusterChain(
  subjectHref: string,
  cluster: NavCluster,
): NavStep[] {
  const chain: NavStep[] = [];
  if (!isTopicAliasCluster(cluster)) {
    chain.push({ pathname: subjectHref, hash: cluster.id });
  }
  for (const topic of cluster.topics) {
    appendTopicTreeSteps(chain, topic);
  }
  return chain;
}

type FlatSectionScope = {
  readonly subject: NavSubject;
  readonly section: NavSection;
  readonly sectionIndex: number;
};

function findFlatSectionScope(
  subject: NavSubject,
  pathname: string,
): FlatSectionScope | null {
  if (!subject.sections?.length) {
    return null;
  }
  for (let index = 0; index < subject.sections.length; index += 1) {
    const section = subject.sections[index];
    if (!section?.flatNav) {
      continue;
    }
    for (const cluster of section.clusters) {
      if (
        cluster.topics.some((topic) =>
          navTopicTreeContainsHref(topic, pathname),
        )
      ) {
        return { subject, section, sectionIndex: index };
      }
    }
  }
  return null;
}

function buildFlatSectionChain(section: NavSection): NavStep[] {
  const chain: NavStep[] = [];
  for (const cluster of section.clusters) {
    for (const topic of cluster.topics) {
      appendTopicTreeSteps(chain, topic);
    }
  }
  return chain;
}

function lastTopicStep(topic: NavTopic): NavStep {
  if (topic.concepts.length <= 1) {
    return { pathname: topic.href, hash: "" };
  }
  const lastConcept = topic.concepts[topic.concepts.length - 1];
  return { pathname: topic.href, hash: lastConcept?.id ?? "" };
}

function lastTopicStepInSection(section: NavSection): NavStep | null {
  const lastCluster = section.clusters[section.clusters.length - 1];
  if (!lastCluster) {
    return null;
  }
  const flat = flattenedClusterTopics(lastCluster);
  const lastTopic = flat[flat.length - 1];
  if (!lastTopic) {
    return null;
  }
  return lastTopicStep(lastTopic);
}

function firstTopicStepInSection(section: NavSection): NavStep | null {
  const firstCluster = section.clusters[0];
  if (!firstCluster) {
    return null;
  }
  const flat = flattenedClusterTopics(firstCluster);
  const firstTopic = flat[0];
  if (!firstTopic) {
    return null;
  }
  return firstTopicStep(firstTopic);
}

function lastTopicStepInClusters(
  clusters: readonly NavCluster[],
): NavStep | null {
  const lastCluster = clusters[clusters.length - 1];
  if (!lastCluster) {
    return null;
  }
  const flat = flattenedClusterTopics(lastCluster);
  const lastTopic = flat[flat.length - 1];
  if (!lastTopic) {
    return null;
  }
  return lastTopicStep(lastTopic);
}

function flatSectionPrevBoundary(scope: FlatSectionScope): NavStep | null {
  const sections = scope.subject.sections ?? [];
  for (let index = scope.sectionIndex - 1; index >= 0; index -= 1) {
    const section = sections[index];
    if (!section) {
      continue;
    }
    const step = lastTopicStepInSection(section);
    if (step) {
      return step;
    }
  }
  return lastTopicStepInClusters(scope.subject.clusters);
}

function flatSectionNextBoundary(scope: FlatSectionScope): NavStep | null {
  const sections = scope.subject.sections ?? [];
  for (
    let index = scope.sectionIndex + 1;
    index < sections.length;
    index += 1
  ) {
    const section = sections[index];
    if (!section) {
      continue;
    }
    const step = firstTopicStepInSection(section);
    if (step) {
      return step;
    }
  }
  const after = scope.subject.clustersAfterSections;
  if (after?.length) {
    const firstTopic = after[0]?.topics[0];
    return firstTopic ? firstTopicStep(firstTopic) : null;
  }
  return null;
}

function buildFullTrackChain(group: NavGroup): NavStep[] {
  const chain: NavStep[] = [{ pathname: group.href, hash: "" }];
  for (const topic of collectTopicsForGroup(group)) {
    appendTopicSteps(chain, topic);
  }
  return chain;
}

function activeNavGroupForPath(
  groups: readonly NavGroup[],
  pathname: string,
): NavGroup | undefined {
  const matches = groups.filter((item) => isActiveTrack(pathname, item.href));
  if (matches.length === 0) {
    return undefined;
  }
  if (matches.length === 1) {
    return matches[0];
  }
  for (const group of matches) {
    if (
      group.leafTopic &&
      (pathname === group.href || pathname === group.leafTopic.href)
    ) {
      return group;
    }
    if (findTopicInGroup(group, pathname)) {
      return group;
    }
    const subject = findSubjectForPath(group, pathname);
    if (subject && pathname === subject.href) {
      return group;
    }
    if (findClusterForPath(group, pathname)) {
      return group;
    }
  }
  for (const group of matches) {
    if (
      pathname === group.href &&
      group.entries.some((entry) => entry.kind === "subject")
    ) {
      return group;
    }
  }
  return matches[0];
}

export function navChainForPath(
  groups: readonly NavGroup[],
  pathname: string,
  hash: string,
): readonly NavStep[] | null {
  const group = activeNavGroupForPath(groups, pathname);
  if (!group) {
    return null;
  }

  const subject = findSubjectForPath(group, pathname);

  if (pathname === group.href) {
    const clusterOnHub = findClusterOnHub(group, subject, hash);
    if (clusterOnHub) {
      return buildClusterChain(clusterOnHub.subjectHref, clusterOnHub.cluster);
    }
    return buildTrackHubChain(group);
  }

  if (subject && pathname === subject.href) {
    const clusterOnHub = findClusterOnHub(group, subject, hash);
    if (clusterOnHub) {
      return buildClusterChain(clusterOnHub.subjectHref, clusterOnHub.cluster);
    }
    return buildSubjectChain(subject);
  }

  const clusterMatch = findClusterForPath(group, pathname);
  if (clusterMatch && findTopicInGroup(group, pathname)) {
    const scopedSubject = resolveSubjectForClusterNav(group, pathname);
    const flatScope =
      scopedSubject && findFlatSectionScope(scopedSubject, pathname);
    if (flatScope) {
      return buildFlatSectionChain(flatScope.section);
    }
    return buildClusterChain(clusterMatch.subjectHref, clusterMatch.cluster);
  }

  if (findTopicInGroup(group, pathname)) {
    return buildFullTrackChain(group);
  }

  return null;
}

export function navChainIndex(
  chain: readonly NavStep[],
  pathname: string,
  hash: string,
): number {
  const hashId = hashIdFrom(hash);
  return chain.findIndex(
    (step) => step.pathname === pathname && step.hash === hashId,
  );
}

function stepHref(step: NavStep): string {
  return step.hash ? `${step.pathname}#${step.hash}` : step.pathname;
}

function wrapToFirstClusterStep(chain: readonly NavStep[]): NavStep | null {
  if (chain.length <= 1) {
    return null;
  }
  const first = chain[0];
  const second = chain[1];
  if (
    first &&
    second &&
    first.hash === "" &&
    first.pathname === second.pathname &&
    chain.every((step) => step.pathname === first.pathname)
  ) {
    return second;
  }
  return first ?? null;
}

function shouldWrapClusterAtBoundary(cluster: NavCluster): boolean {
  return cluster.topics.length === 1;
}

function firstTopicStep(topic: NavTopic): NavStep {
  if (topic.concepts.length <= 1) {
    return { pathname: topic.href, hash: "" };
  }
  const first = topic.concepts[0];
  return { pathname: topic.href, hash: first?.id ?? "" };
}

function firstClusterStep(cluster: NavCluster): NavStep | null {
  const flat = flattenedClusterTopics(cluster);
  const firstTopic = flat[0];
  if (!firstTopic) {
    return null;
  }
  return firstTopicStep(firstTopic);
}

function lastClusterStep(cluster: NavCluster): NavStep | null {
  const flat = flattenedClusterTopics(cluster);
  const lastTopic = flat[flat.length - 1];
  if (!lastTopic) {
    return null;
  }
  if (lastTopic.concepts.length <= 1) {
    return { pathname: lastTopic.href, hash: "" };
  }
  const lastConcept = lastTopic.concepts[lastTopic.concepts.length - 1];
  if (!lastConcept) {
    return null;
  }
  return { pathname: lastTopic.href, hash: lastConcept.id };
}

function adjacentCluster(
  subject: NavSubject,
  clusterId: string,
  delta: -1 | 1,
): NavCluster | null {
  const clusters = navSubjectClusters(subject);
  const index = clusters.findIndex((item) => item.id === clusterId);
  if (index < 0) {
    return null;
  }
  const nextIndex = index + delta;
  if (nextIndex < 0 || nextIndex >= clusters.length) {
    return null;
  }
  return clusters[nextIndex] ?? null;
}

function resolveSubjectForClusterNav(
  group: NavGroup,
  pathname: string,
): NavSubject | null {
  const fromPath = findSubjectForPath(group, pathname);
  if (fromPath) {
    return fromPath;
  }
  const clusterScope = findClusterForPath(group, pathname);
  if (!clusterScope) {
    return null;
  }
  for (const entry of group.entries) {
    if (
      entry.kind === "subject" &&
      entry.subject.href === clusterScope.subjectHref
    ) {
      return entry.subject;
    }
  }
  return null;
}

function crossClusterStep(
  groups: readonly NavGroup[],
  pathname: string,
  cluster: NavCluster,
  delta: -1 | 1,
): NavStep | null {
  const group = groups.find((item) => isActiveTrack(pathname, item.href));
  if (!group) {
    return null;
  }
  const subject = resolveSubjectForClusterNav(group, pathname);
  if (!subject) {
    return null;
  }
  const neighbor = adjacentCluster(subject, cluster.id, delta);
  if (!neighbor) {
    return null;
  }
  return delta > 0 ? firstClusterStep(neighbor) : lastClusterStep(neighbor);
}

function isLastConceptStepInTopic(
  chain: readonly NavStep[],
  current: NavStep,
): boolean {
  if (!current.hash) {
    return false;
  }
  let lastConcept: NavStep | null = null;
  for (const step of chain) {
    if (step.pathname === current.pathname && step.hash !== "") {
      lastConcept = step;
    }
  }
  return lastConcept?.hash === current.hash;
}

function findTopicInGroups(
  groups: readonly NavGroup[],
  pathname: string,
): NavTopic | null {
  for (const group of groups) {
    const topic = findTopicInGroup(group, pathname);
    if (topic) {
      return topic;
    }
  }
  return null;
}

/** Prev/next within one topic's concept list (handbook topic page). */
export function siblingConceptHrefForPath(
  groups: readonly NavGroup[],
  pathname: string,
  hash: string,
  delta: -1 | 1,
): string | null {
  const conceptId = hashIdFrom(hash);
  if (!conceptId) {
    return null;
  }
  const topic = findTopicInGroups(groups, pathname);
  if (!topic || topic.concepts.length <= 1) {
    return null;
  }
  const ids = topic.concepts.map((concept) => concept.id);
  const adjacentId = adjacentConceptId(ids, conceptId, delta);
  if (adjacentId) {
    return `${pathname}#${adjacentId}`;
  }
  if (delta < 0) {
    return ids.indexOf(conceptId) === 0 ? pathname : null;
  }
  const lastId = ids[ids.length - 1];
  return conceptId === lastId ? pathname : null;
}

export function siblingNavHrefForPath(
  groups: readonly NavGroup[],
  pathname: string,
  hash: string,
  delta: -1 | 1,
): string | null {
  if (hashIdFrom(hash)) {
    const topic = findTopicInGroups(groups, pathname);
    if (topic && topic.concepts.length > 1) {
      const scoped = siblingConceptHrefForPath(groups, pathname, hash, delta);
      if (scoped !== null) {
        return scoped;
      }
    }
  }

  const chain = navChainForPath(groups, pathname, hash);
  if (!chain || chain.length === 0) {
    return null;
  }

  const index = navChainIndex(chain, pathname, hash);
  if (index < 0) {
    return null;
  }

  const group = groups.find((item) => isActiveTrack(pathname, item.href));
  const clusterScope = group ? findClusterForPath(group, pathname) : null;
  const cluster = clusterScope?.cluster ?? null;

  const scopedSubject = group
    ? resolveSubjectForClusterNav(group, pathname)
    : null;
  const flatScope =
    scopedSubject && findFlatSectionScope(scopedSubject, pathname);

  const nextIndex = index + delta;
  if (nextIndex < 0) {
    if (flatScope && index === 0) {
      const boundary = flatSectionPrevBoundary(flatScope);
      if (boundary) {
        return stepHref(boundary);
      }
    }
    if (delta < 0 && cluster && !shouldWrapClusterAtBoundary(cluster)) {
      const step = crossClusterStep(groups, pathname, cluster, -1);
      return step ? stepHref(step) : null;
    }
    return null;
  }
  if (nextIndex >= chain.length) {
    if (delta > 0) {
      const current = chain[index];
      if (current?.hash) {
        return stepHref({ pathname: current.pathname, hash: "" });
      }
      if (flatScope && index === chain.length - 1) {
        const boundary = flatSectionNextBoundary(flatScope);
        if (boundary) {
          return stepHref(boundary);
        }
      }
      if (cluster && !shouldWrapClusterAtBoundary(cluster)) {
        const step = crossClusterStep(groups, pathname, cluster, 1);
        if (step) {
          return stepHref(step);
        }
      }
      const step = wrapToFirstClusterStep(chain);
      return step ? stepHref(step) : null;
    }
    return null;
  }

  const step = chain[nextIndex];
  if (!step) {
    return null;
  }
  const current = chain[index];
  if (delta > 0 && current?.hash && isLastConceptStepInTopic(chain, current)) {
    return stepHref({ pathname: current.pathname, hash: "" });
  }
  return stepHref(step);
}

export function adjacentConceptId(
  conceptIds: readonly string[],
  currentId: string,
  delta: -1 | 1,
): string | null {
  if (conceptIds.length === 0) {
    return null;
  }
  const index = conceptIds.indexOf(currentId);
  const fromIndex = index < 0 ? (delta > 0 ? -1 : conceptIds.length) : index;
  const nextIndex = fromIndex + delta;
  if (nextIndex < 0 || nextIndex >= conceptIds.length) {
    return null;
  }
  return conceptIds[nextIndex] ?? null;
}
export function parentHrefForPath(
  groups: readonly NavGroup[],
  pathname: string,
  hash: string,
  labels: { home: string; instructions: string },
  sections?: readonly NavRootSection[],
): string | null {
  const crumbs = crumbsForPath(groups, pathname, hash, labels, sections);
  for (let index = crumbs.length - 2; index >= 0; index -= 1) {
    const href = crumbs[index]?.href;
    if (href) {
      return href;
    }
  }
  return null;
}
