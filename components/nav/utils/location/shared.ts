import type {
  Crumb,
  NavCluster,
  NavConcept,
  NavSubject,
  NavTopic,
} from "@/lib/nav";
import { resolveConceptId } from "@/lib/nav/conceptHash";
import { isConceptGroupSectionId } from "@/lib/nav/conceptGroupSection";
import { navSubjectClusters } from "@/lib/nav/subjectClusters";
import { areRedundantNavTitles, sameTitle } from "@/lib/nav/navUtils";
import { isActiveHref } from "./active";

export function conceptById(
  concepts: readonly NavConcept[],
  id: string,
): NavConcept | undefined {
  if (!id) {
    return undefined;
  }
  return (
    concepts.find((concept) => concept.id === id) ??
    concepts.find((concept) => concept.id === resolveConceptId(id, concepts))
  );
}

function topicTreeHasConcept(topic: NavTopic, hashId: string): boolean {
  if (conceptById(topic.concepts, hashId)) {
    return true;
  }
  for (const nested of topic.nestedTopics ?? []) {
    if (topicTreeHasConcept(nested, hashId)) {
      return true;
    }
  }
  return false;
}

export function clusterForConceptInSubject(
  subject: NavSubject,
  hashId: string,
): { cluster: NavCluster; topic: NavTopic } | undefined {
  if (!hashId) {
    return undefined;
  }
  for (const cluster of navSubjectClusters(subject)) {
    for (const topic of cluster.topics) {
      if (topicTreeHasConcept(topic, hashId)) {
        return { cluster, topic };
      }
    }
  }
  return undefined;
}

export function clusterHasActiveConcept(
  cluster: NavCluster,
  hashId: string,
): boolean {
  if (!hashId) {
    return false;
  }
  return cluster.topics.some((topic) => topicTreeHasConcept(topic, hashId));
}

/** Breadcrumbs for a catalog cluster on a subject hub (`/track/subject#cluster-id`). */
export function subjectHubClusterCrumbs(
  cluster: NavCluster,
  subject: Pick<NavSubject, "href" | "flatNav">,
  pathname: string,
): readonly Crumb[] {
  const trail = clusterTrailCrumbs(cluster, subject);
  if (trail.length > 0) {
    return trail;
  }
  if (isActiveHref(pathname, subject.href)) {
    return [
      {
        label: cluster.title,
        href: `${subject.href}#${cluster.id}`,
      },
    ];
  }
  return [];
}

export function clusterTrailCrumbs(
  cluster: NavCluster,
  subject?: Pick<NavSubject, "flatNav">,
): readonly Crumb[] {
  if (isConceptGroupSectionId(cluster.id)) {
    if (!cluster.title.trim()) {
      return [];
    }
    return [{ label: cluster.title, href: cluster.href }];
  }
  if (isTopicAliasCluster(cluster)) {
    return [];
  }
  if (subject?.flatNav) {
    return [];
  }
  if (!cluster.title.trim()) {
    return [];
  }
  return [{ label: cluster.title, href: cluster.href }];
}

export function isTopicAliasCluster(cluster: NavCluster): boolean {
  return Boolean(aliasTopicForCluster(cluster));
}

export function aliasTopicForCluster(
  cluster: NavCluster,
): NavTopic | undefined {
  const only = cluster.topics.length === 1 ? cluster.topics[0] : undefined;
  if (!only || !sameTitle(cluster.title, only.title)) {
    return undefined;
  }
  return only;
}

/** Subject already names this topic (CS Core) — breadcrumbs/sidebar stop at subject. */
export function omitTopicCrumbForSubjectAlias(
  subject: Pick<NavSubject, "title">,
  cluster: NavCluster,
  topic: NavTopic,
): boolean {
  return (
    areRedundantNavTitles(subject.title, topic.title) ||
    (isTopicAliasCluster(cluster) &&
      areRedundantNavTitles(subject.title, cluster.title))
  );
}
