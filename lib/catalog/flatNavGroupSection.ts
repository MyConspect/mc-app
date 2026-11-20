import type { SubjectClusterSection } from "./clusterConceptIndex";
import type { BrowseCard } from "./index";

/** One bullet per appendix cluster (Elements, Attributes, …), not per concept. */
export function flatNavGroupBrowseCards(
  clusters: readonly SubjectClusterSection[],
): readonly BrowseCard[] {
  return clusters.flatMap((entry) => {
    const href =
      entry.headingHref ?? entry.items[0]?.href ?? `#${entry.cluster.id}`;
    const title = entry.cluster.title.trim();
    if (title.length > 0) {
      return [{ href, title, description: "" }];
    }
    return entry.items.filter((item) => item.title.trim().length > 0);
  });
}

export function flatNavGroupSectionWeight(
  clusters: readonly SubjectClusterSection[],
): number {
  return clusters.length + 2;
}

export function subjectClusterSectionForFlatNavGroup(
  sectionId: string,
  sectionTitle: string,
  clusters: readonly SubjectClusterSection[],
): SubjectClusterSection {
  return {
    cluster: {
      id: sectionId,
      title: sectionTitle,
      blurb: "",
    },
    items: flatNavGroupBrowseCards(clusters),
  };
}
