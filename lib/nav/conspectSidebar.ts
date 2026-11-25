import type { NavCluster, NavRootSectionId } from "./types";

/**
 * Conspect: track → subject → section rows; concept links under the active
 * subject-hub section (like Computer Science Core), not full topic-page trees.
 */
export type ConspectSidebarSchema = {
  readonly mode: "two-level";
  readonly clusterLeaves: true;
  readonly trackHeader: true;
  /**
   * Advanced gold: intro groups on subject hubs are hash leaves only — no concept
   * accordion in the sidebar (concepts on topic URLs and main column hash focus).
   */
  readonly hubSectionConcepts: false;
};

export type InterviewsSidebarSchema = ConspectSidebarSchema;

export type NavSidebarSchema = ConspectSidebarSchema;

const HANDBOOK_SIDEBAR_SCHEMA: ConspectSidebarSchema = {
  mode: "two-level",
  clusterLeaves: true,
  trackHeader: true,
  hubSectionConcepts: false,
};

export function navSidebarSchema(
  _rootSectionId: NavRootSectionId,
): NavSidebarSchema {
  return HANDBOOK_SIDEBAR_SCHEMA;
}

/** Subject-hub cluster leaves (hash or hub) — same tree policy for Conspect and Interviews. */
export function conspectClusterLeavesInSidebar(
  _rootSectionId: NavRootSectionId,
): boolean {
  return HANDBOOK_SIDEBAR_SCHEMA.clusterLeaves;
}

/**
 * Conspect: single-topic cluster may show a fold (concepts / `##` groups) in the sidebar,
 * not only a hash leaf on the subject hub.
 */
export function conspectSingleTopicClusterExpandsInSidebar(
  cluster: NavCluster,
): boolean {
  if ((cluster.nestedClusters?.length ?? 0) > 0) {
    return false;
  }
  if (cluster.topics.length !== 1) {
    return false;
  }
  return conspectClusterExpandsInSidebar(cluster);
}

/** Single-topic cluster with outline concepts or nested topics — expandable in Conspect sidebar. */
export function conspectClusterExpandsInSidebar(cluster: NavCluster): boolean {
  if ((cluster.nestedClusters?.length ?? 0) > 0) {
    return true;
  }
  if (cluster.topics.length > 1) {
    return true;
  }
  const only = cluster.topics.length === 1 ? cluster.topics[0] : null;
  if (!only) {
    return false;
  }
  return only.concepts.length > 0 || (only.nestedTopics?.length ?? 0) > 0;
}

/** Intro groups and catalog clusters anchored on a subject hub URL. */
export function conspectSubjectHubSectionWithConcepts(
  cluster: NavCluster,
  subjectHref: string,
): boolean {
  if ((cluster.nestedClusters?.length ?? 0) > 0) {
    return false;
  }
  const only = cluster.topics.length === 1 ? cluster.topics[0] : null;
  if (!only || only.concepts.length === 0) {
    return false;
  }
  const hubPath = subjectHref.split("#")[0] ?? subjectHref;
  return only.href === hubPath || only.href.startsWith(`${hubPath}#`);
}
