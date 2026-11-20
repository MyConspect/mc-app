import type { SubjectClusterSection } from "./clusterConceptIndex";

export function clusterIndexSectionWeight(section: SubjectClusterSection): number {
  const showHeading = section.cluster.title.trim().length > 0;
  return section.items.length + (showHeading ? 2 : 0);
}