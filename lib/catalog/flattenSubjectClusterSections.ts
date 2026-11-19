import type { SubjectClusterSection } from "./clusterConceptIndex";
import { subjectClusterSectionForFlatNavGroup } from "./flatNavGroupSection";

export type GroupedClustersForIndex = {
  readonly section: {
    readonly id: string;
    readonly title: string;
    readonly flatNav?: boolean;
  };
  readonly clusters: readonly SubjectClusterSection[];
};

/** Cluster section order used by {@link ClusterCardSections} on subject hubs. */
export function flattenSubjectClusterSectionsForIndex({
  sections,
  rootSections,
  groupedSections,
  afterRootSections,
}: {
  readonly sections?: readonly SubjectClusterSection[];
  readonly rootSections?: readonly SubjectClusterSection[];
  readonly groupedSections?: readonly GroupedClustersForIndex[];
  readonly afterRootSections?: readonly SubjectClusterSection[];
}): readonly SubjectClusterSection[] {
  const ordered: SubjectClusterSection[] = [];
  if (rootSections?.length) {
    ordered.push(...rootSections);
  }
  if (groupedSections?.length) {
    for (const group of groupedSections) {
      if (group.section.flatNav && group.clusters.length > 0) {
        ordered.push(
          subjectClusterSectionForFlatNavGroup(
            group.section.id,
            group.section.title,
            group.clusters,
          ),
        );
        continue;
      }
      ordered.push(...group.clusters);
    }
  }
  if (afterRootSections?.length) {
    ordered.push(...afterRootSections);
  }
  if (sections?.length) {
    ordered.push(...sections);
  }
  return ordered;
}
