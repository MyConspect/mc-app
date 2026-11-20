import type { NavCluster, NavSubject } from "./types";

export function navSubjectClusters(subject: NavSubject): readonly NavCluster[] {
  const pools = subject.sections?.length
    ? [
        ...subject.clusters,
        ...subject.sections.flatMap((section) => section.clusters),
        ...(subject.clustersAfterSections ?? []),
      ]
    : subject.clusters;
  return pools;
}
