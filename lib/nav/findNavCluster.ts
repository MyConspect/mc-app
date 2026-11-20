import { isConceptGroupSectionId } from "./conceptGroupSection";
import { navSubjectClusters } from "./subjectClusters";
import type { NavCluster, NavSubject } from "./types";

export function findNavClusterInSubject(
  subject: NavSubject,
  clusterId: string,
): { readonly cluster: NavCluster; readonly parent?: NavCluster } | undefined {
  for (const cluster of navSubjectClusters(subject)) {
    if (cluster.id === clusterId) {
      return { cluster };
    }
    for (const nested of cluster.nestedClusters ?? []) {
      if (nested.id === clusterId) {
        return { cluster: nested, parent: cluster };
      }
    }
  }
  return undefined;
}

export function navClusterIdsInSubject(subject: NavSubject): Set<string> {
  const ids = new Set<string>();
  for (const cluster of navSubjectClusters(subject)) {
    ids.add(cluster.id);
    for (const nested of cluster.nestedClusters ?? []) {
      ids.add(nested.id);
    }
  }
  return ids;
}

export function isSubjectHubGroupHash(
  subject: NavSubject,
  hashId: string,
): boolean {
  if (!isConceptGroupSectionId(hashId)) {
    return false;
  }
  return navClusterIdsInSubject(subject).has(hashId);
}