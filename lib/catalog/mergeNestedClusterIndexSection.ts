import type { SubjectClusterSection } from "./clusterConceptIndex";
import {
  clusterIndexFitsPane,
  clusterSectionListWeight,
} from "./clusterIndexFitsPane";
import type { SubjectHubClusterLayout } from "./filterSubjectHubByHash";

function replaceSectionInList(
  list: readonly SubjectClusterSection[] | undefined,
  clusterId: string,
  replacement: SubjectClusterSection,
): readonly SubjectClusterSection[] | undefined {
  if (!list?.length) {
    return list;
  }
  let changed = false;
  const next = list.map((section) => {
    if (section.cluster.id !== clusterId) {
      return section;
    }
    changed = true;
    return replacement;
  });
  return changed ? next : list;
}

/** Replace a focused cluster section with nested topic groups + concept rows. */
export function mergeNestedClusterSection(
  layout: SubjectHubClusterLayout,
  clusterId: string,
  nestedSection: SubjectClusterSection | undefined,
  collapsedSection: SubjectClusterSection | undefined,
): SubjectHubClusterLayout {
  if (!clusterId || !nestedSection || !collapsedSection) {
    return layout;
  }
  if (nestedSection.items.length <= collapsedSection.items.length) {
    return layout;
  }
  return {
    sections: replaceSectionInList(layout.sections, clusterId, nestedSection),
    rootSections: replaceSectionInList(
      layout.rootSections,
      clusterId,
      nestedSection,
    ),
    afterRootSections: replaceSectionInList(
      layout.afterRootSections,
      clusterId,
      nestedSection,
    ),
    groupedSections: layout.groupedSections?.map((group) => ({
      ...group,
      clusters: replaceSectionInList(group.clusters, clusterId, nestedSection)!,
    })),
  };
}

/** Swap a focused multi-topic cluster for nested rows when content fits the pane. */
export function mergeNestedClusterSectionWhenFits(
  layout: SubjectHubClusterLayout,
  clusterId: string,
  nestedSection: SubjectClusterSection | undefined,
  collapsedSection: SubjectClusterSection | undefined,
  paneHeightPx: number,
  columnCount: number,
): SubjectHubClusterLayout {
  if (!clusterId || !nestedSection || !collapsedSection) {
    return layout;
  }
  if (nestedSection.items.length <= collapsedSection.items.length) {
    return layout;
  }
  const weight = clusterSectionListWeight(nestedSection);
  if (!clusterIndexFitsPane(weight, paneHeightPx, columnCount)) {
    return layout;
  }
  return mergeNestedClusterSection(
    layout,
    clusterId,
    nestedSection,
    collapsedSection,
  );
}

export function findSubjectClusterSection(
  layout: SubjectHubClusterLayout,
  clusterId: string,
): SubjectClusterSection | undefined {
  const pools = [
    ...(layout.sections ?? []),
    ...(layout.rootSections ?? []),
    ...(layout.afterRootSections ?? []),
    ...(layout.groupedSections?.flatMap((entry) => entry.clusters) ?? []),
  ];
  return pools.find((section) => section.cluster.id === clusterId);
}