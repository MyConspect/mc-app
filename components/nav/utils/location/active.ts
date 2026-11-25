import {
  coreBrowserConceptSection,
  isCoreBrowserTopicSlug,
} from "@/lib/catalog/coreBrowserHub";
import type { NavConcept, NavGroup, NavSubject, NavTopic } from "@/lib/nav";
import {
  conceptGroupSectionDomId,
  isConceptGroupSectionId,
} from "@/lib/nav/conceptGroupSection";
import { findNavClusterInSubject } from "@/lib/nav/findNavCluster";
import { navSubjectClusters } from "@/lib/nav/subjectClusters";
import { navTopicAtPath, navTopicTreeContainsHref } from "@/lib/nav/topicTree";
import { hashIdFrom } from "@/lib/nav/navUtils";
import { splitHref } from "@/lib/nav/search";
import { stripLocalePrefix } from "@/lib/i18n/paths";
import {
  handbookLogicalPathname,
  isSectionHomePathname,
} from "@/lib/i18n/sectionPaths";
import {
  aliasTopicForCluster,
  clusterForConceptInSubject,
  conceptById,
} from "./shared";

export type NavLocation = {
  topicHref: string | null;
  subjectHref: string | null;
  clusterKey: string | null;
  sectionKey: string | null;
};

export function isHomePath(pathname: string): boolean {
  const { path } = stripLocalePrefix(pathname);
  return path === "/" || isSectionHomePathname(pathname);
}

export function isActiveHref(pathname: string, href: string): boolean {
  return handbookLogicalPathname(pathname) === handbookLogicalPathname(href);
}

function logicalNavPath(pathname: string): string {
  const { pathname: pathOnly } = splitHref(pathname);
  return handbookLogicalPathname(pathOnly);
}

function navPathsEqual(pathname: string, href: string): boolean {
  return logicalNavPath(pathname) === logicalNavPath(href);
}

function navPathUnderSubject(pathname: string, subjectHref: string): boolean {
  const logical = logicalNavPath(pathname);
  const hub = logicalNavPath(subjectHref);
  return logical === hub || logical.startsWith(`${hub}/`);
}

export function isActiveTrack(pathname: string, href: string): boolean {
  const current = handbookLogicalPathname(pathname);
  const target = handbookLogicalPathname(href);
  return current === target || current.startsWith(`${target}/`);
}

export function isConceptActiveOnPage(
  pathname: string,
  topicHref: string,
  conceptId: string,
  activeConceptId: string,
): boolean {
  return (
    activeConceptId.length > 0 &&
    navPathsEqual(pathname, topicHref) &&
    conceptId === activeConceptId
  );
}

/** True when a nested topic or concept row is the current target, not this topic link. */
export function topicHasDeeperNavSelection(
  pathname: string,
  topicHref: string,
  activeConceptId: string,
  nestedOnPath: boolean,
): boolean {
  if (nestedOnPath) {
    return true;
  }
  return activeConceptId.length > 0 && navPathsEqual(pathname, topicHref);
}

/** On mobile, only the deepest row in the path is pinned/highlighted as active. */
export function topicIsMobileNavLeaf(
  active: boolean,
  pathname: string,
  topicHref: string,
  activeConceptId: string,
  nestedOnPath: boolean,
): boolean {
  return (
    active &&
    !topicHasDeeperNavSelection(
      pathname,
      topicHref,
      activeConceptId,
      nestedOnPath,
    )
  );
}

export function isOnSubjectPath(
  pathname: string,
  subject: NavSubject,
): boolean {
  if (navPathsEqual(pathname, subject.href)) {
    return true;
  }
  for (const cluster of navSubjectClusters(subject)) {
    if (
      cluster.topics.some((topic) => navTopicTreeContainsHref(topic, pathname))
    ) {
      return true;
    }
  }
  return false;
}

export function clusterKey(subjectHref: string, clusterId: string) {
  return `${subjectHref}#${clusterId}`;
}

function conceptInTopicTree(
  topic: NavTopic,
  hashId: string,
): NavConcept | undefined {
  const atRoot = conceptById(topic.concepts, hashId);
  if (atRoot) {
    return atRoot;
  }
  for (const nested of topic.nestedTopics ?? []) {
    const hit = conceptInTopicTree(nested, hashId);
    if (hit) {
      return hit;
    }
  }
  return undefined;
}

function conceptGroupLabelForFold(
  concept: NavConcept,
  topic: NavTopic,
): string | undefined {
  const fromNav = concept.group?.trim();
  if (fromNav) {
    return fromNav;
  }
  if (isCoreBrowserTopicSlug(topic.slug)) {
    return coreBrowserConceptSection(concept.title);
  }
  return undefined;
}

/** Topic-page `#concept-group-*` folds use the topic path, not the subject hub hash. */
function foldClusterKeyOnTopicPage(
  topicPath: string,
  hashId: string,
  topic: NavTopic,
  catalogClusterKey: string,
): string {
  if (isConceptGroupSectionId(hashId)) {
    return clusterKey(topicPath, hashId);
  }
  if (!hashId) {
    return catalogClusterKey;
  }
  const concept =
    conceptInTopicTree(topic, hashId) ??
    conceptById(navTopicAtPath(topic, topicPath)?.concepts ?? [], hashId);
  const group = concept ? conceptGroupLabelForFold(concept, topic) : undefined;
  if (group) {
    return clusterKey(topicPath, conceptGroupSectionDomId(group));
  }
  return catalogClusterKey;
}

function activeTopicForPath(
  cluster: { readonly topics: readonly NavTopic[] },
  pathname: string,
): NavTopic | undefined {
  return cluster.topics.find((topic) =>
    navTopicTreeContainsHref(topic, pathname),
  );
}

/** Deepest nav topic for pathname (sibling pages under a hub), not merely a containing tree root. */
function deepestActiveTopicForPath(
  cluster: { readonly topics: readonly NavTopic[] },
  pathname: string,
): NavTopic | undefined {
  for (const topic of cluster.topics) {
    const atPath = navTopicAtPath(topic, pathname);
    if (atPath) {
      return atPath;
    }
  }
  return undefined;
}

export function sectionKey(subjectHref: string, sectionId: string) {
  return `${subjectHref}#${sectionId}`;
}

export function closedSectionKey(subjectHref: string, sectionId: string) {
  return `!${sectionKey(subjectHref, sectionId)}`;
}

export function closedSubjectKey(subjectHref: string) {
  return `!${subjectHref}`;
}

export function isSubjectForceClosed(
  subjectHref: string,
  openSubjectHref: string | null | undefined,
): boolean {
  return openSubjectHref === closedSubjectKey(subjectHref);
}

export function isNavSectionOpen(
  section: { readonly id: string; readonly defaultOpen?: boolean },
  subjectHref: string,
  foldSectionKey: string | null,
  forceOpen: boolean,
): boolean {
  const key = sectionKey(subjectHref, section.id);
  const closed = closedSectionKey(subjectHref, section.id);
  if (foldSectionKey === closed) {
    return false;
  }
  if (forceOpen) {
    return true;
  }
  if (foldSectionKey === key) {
    return true;
  }
  return section.defaultOpen ?? true;
}

export function isNavSectionCollapsible(section: {
  readonly defaultOpen?: boolean;
  readonly collapsible?: boolean;
}): boolean {
  return section.collapsible ?? section.defaultOpen !== undefined;
}

export function locationForPath(
  groups: readonly NavGroup[],
  pathname: string,
  hash: string,
): NavLocation {
  const clusterId = hashIdFrom(hash);
  const logicalPath = logicalNavPath(pathname);
  let hubSubjectHref: string | null = null;
  for (const group of groups) {
    if (group.hubTopic && navPathsEqual(pathname, group.href)) {
      return {
        topicHref: group.href,
        subjectHref: null,
        clusterKey: null,
        sectionKey: null,
      };
    }
    if (
      group.leafTopic &&
      (navPathsEqual(pathname, group.href) ||
        navPathsEqual(pathname, group.leafTopic.href))
    ) {
      return {
        topicHref: group.leafTopic.href,
        subjectHref: null,
        clusterKey: null,
        sectionKey: null,
      };
    }
    for (const entry of group.entries) {
      switch (entry.kind) {
        case "topic":
          if (navPathsEqual(pathname, entry.topic.href)) {
            return {
              topicHref: entry.topic.href,
              subjectHref: null,
              clusterKey: null,
              sectionKey: null,
            };
          }
          break;
        case "cluster":
          if (clusterId === entry.cluster.id) {
            const onSubject = navPathUnderSubject(pathname, entry.subjectHref);
            if (onSubject) {
              const onThisTopic = entry.cluster.topics.some((topic) =>
                navTopicTreeContainsHref(topic, pathname),
              );
              const aliasTopic =
                !onThisTopic && navPathsEqual(pathname, entry.subjectHref)
                  ? aliasTopicForCluster(entry.cluster)
                  : undefined;
              return {
                topicHref: onThisTopic
                  ? (entry.cluster.topics.find((topic) =>
                      navTopicTreeContainsHref(topic, pathname),
                    )?.href ?? null)
                  : (aliasTopic?.href ?? null),
                subjectHref: entry.subjectHref,
                clusterKey: clusterKey(entry.subjectHref, entry.cluster.id),
                sectionKey: null,
              };
            }
          }
          if (navPathsEqual(pathname, entry.subjectHref)) {
            hubSubjectHref = entry.subjectHref;
          } else {
            const activeTopic =
              deepestActiveTopicForPath(entry.cluster, pathname) ??
              activeTopicForPath(entry.cluster, pathname);
            if (activeTopic) {
              const catalogClusterKey = clusterKey(
                entry.subjectHref,
                entry.cluster.id,
              );
              return {
                topicHref: activeTopic.href,
                subjectHref: entry.subjectHref,
                clusterKey: foldClusterKeyOnTopicPage(
                  logicalPath,
                  clusterId,
                  activeTopic,
                  catalogClusterKey,
                ),
                sectionKey: null,
              };
            }
          }
          break;
        case "subject":
          if (navPathsEqual(pathname, entry.subject.href)) {
            const navSection = entry.subject.sections?.find(
              (section) =>
                isNavSectionCollapsible(section) && section.id === clusterId,
            );
            if (navSection) {
              return {
                topicHref: null,
                subjectHref: entry.subject.href,
                clusterKey: null,
                sectionKey: sectionKey(entry.subject.href, navSection.id),
              };
            }
            const clusterHit = findNavClusterInSubject(
              entry.subject,
              clusterId,
            );
            const cluster = clusterHit?.cluster;
            const aliasTopic = cluster
              ? aliasTopicForCluster(cluster)
              : undefined;
            const catalogClusterId =
              clusterHit?.parent?.id ?? cluster?.id ?? clusterId;
            const parentSection = catalogClusterId
              ? collapsibleSectionForCluster(entry.subject, catalogClusterId)
              : undefined;
            if (cluster) {
              return {
                topicHref:
                  clusterHit?.parent || !aliasTopic ? null : aliasTopic.href,
                subjectHref: entry.subject.href,
                clusterKey: clusterKey(entry.subject.href, cluster.id),
                sectionKey: parentSection
                  ? sectionKey(entry.subject.href, parentSection.id)
                  : null,
              };
            }
            const conceptHit = clusterForConceptInSubject(
              entry.subject,
              clusterId,
            );
            if (conceptHit) {
              const parentSectionForConcept = collapsibleSectionForCluster(
                entry.subject,
                conceptHit.cluster.id,
              );
              const catalogClusterKey = clusterKey(
                entry.subject.href,
                conceptHit.cluster.id,
              );
              const onSubjectHub = navPathsEqual(pathname, entry.subject.href);
              return {
                topicHref: onSubjectHub
                  ? entry.subject.href
                  : conceptHit.topic.href,
                subjectHref: entry.subject.href,
                clusterKey: foldClusterKeyOnTopicPage(
                  logicalPath,
                  clusterId,
                  conceptHit.topic,
                  catalogClusterKey,
                ),
                sectionKey: parentSectionForConcept
                  ? sectionKey(entry.subject.href, parentSectionForConcept.id)
                  : null,
              };
            }
            return {
              topicHref: null,
              subjectHref: entry.subject.href,
              clusterKey: null,
              sectionKey: null,
            };
          }
          for (const cluster of navSubjectClusters(entry.subject)) {
            const activeTopic =
              deepestActiveTopicForPath(cluster, pathname) ??
              activeTopicForPath(cluster, pathname);
            if (activeTopic) {
              const parentSection = collapsibleSectionForCluster(
                entry.subject,
                cluster.id,
              );
              const catalogClusterKey = clusterKey(
                entry.subject.href,
                cluster.id,
              );
              return {
                topicHref: activeTopic.href,
                subjectHref: entry.subject.href,
                clusterKey: foldClusterKeyOnTopicPage(
                  logicalPath,
                  clusterId,
                  activeTopic,
                  catalogClusterKey,
                ),
                sectionKey: parentSection
                  ? sectionKey(entry.subject.href, parentSection.id)
                  : null,
              };
            }
          }
          break;
        default: {
          const _never: never = entry;
          return _never;
        }
      }
    }
  }
  if (hubSubjectHref) {
    return {
      topicHref: null,
      subjectHref: hubSubjectHref,
      clusterKey: null,
      sectionKey: null,
    };
  }
  return {
    topicHref: null,
    subjectHref: null,
    clusterKey: null,
    sectionKey: null,
  };
}

function collapsibleSectionForCluster(subject: NavSubject, clusterId: string) {
  return subject.sections?.find(
    (section) =>
      isNavSectionCollapsible(section) &&
      section.clusters.some((cluster) => cluster.id === clusterId),
  );
}
