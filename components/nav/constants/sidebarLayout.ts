import type { NavCluster } from "@/lib/nav";

/** Per-level inset matching the track children list (`pl-2` on the bordered `ul`). */
export const NAV_NEST_STEP_1 = "pl-2";
export const NAV_NEST_STEP_2 = "pl-4";
export const NAV_NEST_STEP_3 = "pl-6";

/** Children under an expanded track header (yellow left rail). */
export const NAV_TRACK_CHILD_LIST_CLASS =
  "mt-1.5 ml-1.5 space-y-0.5 border-l-2 border-yellow-200 pl-2 dark:border-yellow-800";

/** Horizontal inset shared by track rail and multi-topic child lists. */
export const NAV_NEST_CHILD_RAIL_INSET_CLASS = "ml-1.5 pl-2";

/** Extra inset for topic rows under a multi-topic cluster (NoSQL, Brokers) — no border rail. */
export const NAV_MULTI_TOPIC_CHILD_LIST_CLASS = `mt-1.5 ${NAV_NEST_CHILD_RAIL_INSET_CLASS}`;

export const SECTION_TOPIC_INDENT = NAV_NEST_STEP_2;
export const SECTION_TOPIC_CONCEPT_INDENT = NAV_NEST_STEP_3;

export function clusterHasMultiTopicChildren(cluster: NavCluster): boolean {
  return cluster.topics.length > 1;
}

/** Multi-topic cluster headers align with compact single-topic `TopicRow` siblings (`pl-4`). */
export function clusterRowNestIndent(cluster: NavCluster): string {
  return cluster.topics.length > 1 ? NAV_NEST_STEP_2 : NAV_NEST_STEP_1;
}

export function clusterChildTopicNestIndent(
  cluster: NavCluster,
): string | undefined {
  return clusterHasMultiTopicChildren(cluster) ? NAV_NEST_STEP_2 : undefined;
}