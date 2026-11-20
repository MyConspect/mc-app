import type { SubjectClusterSection } from "./clusterConceptIndex";
import {
  conceptGroupSectionDomId,
  findConceptGroupBySectionId,
  isConceptGroupSectionId,
} from "@/lib/nav/conceptGroupSection";
import { resolveConceptId } from "@/lib/nav/conceptHash";
import type { ConceptOutline } from "@/lib/parse";

export type SubjectHubHashConcept = ConceptOutline;

export type SubjectHubGroupedSection = {
  readonly section: {
    readonly id: string;
    readonly title: string;
    readonly defaultOpen?: boolean;
    readonly flatNav?: boolean;
  };
  readonly clusters: readonly SubjectClusterSection[];
};

export type SubjectHubClusterLayout = {
  readonly sections?: readonly SubjectClusterSection[];
  readonly rootSections?: readonly SubjectClusterSection[];
  readonly groupedSections?: readonly SubjectHubGroupedSection[];
  readonly afterRootSections?: readonly SubjectClusterSection[];
};

export type SubjectHubHashFocus =
  | { readonly kind: "none" }
  | { readonly kind: "concept" }
  | { readonly kind: "concept-group"; readonly sectionId: string }
  | { readonly kind: "cluster"; readonly clusterId: string };

function introGroupLabels(
  concepts: readonly SubjectHubHashConcept[],
): readonly { readonly label: string }[] {
  const labels: string[] = [];
  const seen = new Set<string>();
  for (const concept of concepts) {
    const label = concept.group?.trim();
    if (!label || seen.has(label)) {
      continue;
    }
    seen.add(label);
    labels.push(label);
  }
  return labels.map((label) => ({ label }));
}

function clusterSectionPools(
  layout: SubjectHubClusterLayout | undefined,
): readonly SubjectClusterSection[] {
  if (!layout) {
    return [];
  }
  const grouped =
    layout.groupedSections?.flatMap((entry) => entry.clusters) ?? [];
  return [
    ...(layout.sections ?? []),
    ...(layout.rootSections ?? []),
    ...(layout.afterRootSections ?? []),
    ...grouped,
  ];
}

/** Catalog cluster id or a split topic section (`principles:solid`). */
function clusterSectionMatchesId(
  sectionClusterId: string,
  clusterId: string,
): boolean {
  return (
    sectionClusterId === clusterId ||
    sectionClusterId.startsWith(`${clusterId}:`)
  );
}

function layoutHasClusterId(
  layout: SubjectHubClusterLayout | undefined,
  clusterId: string,
): boolean {
  return clusterSectionPools(layout).some((section) =>
    clusterSectionMatchesId(section.cluster.id, clusterId),
  );
}

export function resolveSubjectHubHashFocus({
  hashId,
  concepts,
  clusterLayout,
}: {
  readonly hashId: string;
  readonly concepts: readonly SubjectHubHashConcept[];
  readonly clusterLayout?: SubjectHubClusterLayout;
}): SubjectHubHashFocus {
  if (!hashId) {
    return { kind: "none" };
  }
  if (isConceptGroupSectionId(hashId)) {
    const hit = findConceptGroupBySectionId(introGroupLabels(concepts), hashId);
    if (hit) {
      return { kind: "concept-group", sectionId: hashId };
    }
  }
  if (layoutHasClusterId(clusterLayout, hashId)) {
    return { kind: "cluster", clusterId: hashId };
  }
  if (resolveConceptId(hashId, concepts)) {
    return { kind: "concept" };
  }
  return { kind: "none" };
}

export function filterClusterSectionsById(
  sections: readonly SubjectClusterSection[] | undefined,
  clusterId: string,
): readonly SubjectClusterSection[] | undefined {
  if (!sections?.length || !clusterId) {
    return sections;
  }
  const hit = sections.filter((section) =>
    clusterSectionMatchesId(section.cluster.id, clusterId),
  );
  return hit;
}

export function filterGroupedSectionsByClusterId(
  grouped: readonly SubjectHubGroupedSection[] | undefined,
  clusterId: string,
): readonly SubjectHubGroupedSection[] | undefined {
  if (!grouped?.length || !clusterId) {
    return grouped;
  }
  const next = grouped
    .map((entry) => ({
      ...entry,
      clusters: entry.clusters.filter((section) =>
        clusterSectionMatchesId(section.cluster.id, clusterId),
      ),
    }))
    .filter((entry) => entry.clusters.length > 0);
  return next;
}

export function filterSubjectHubClusterLayout(
  layout: SubjectHubClusterLayout,
  focus: SubjectHubHashFocus,
): SubjectHubClusterLayout {
  if (focus.kind === "none" || focus.kind === "concept") {
    return layout;
  }
  if (focus.kind === "concept-group") {
    return {
      sections: [],
      rootSections: [],
      groupedSections: [],
      afterRootSections: [],
    };
  }
  const clusterId = focus.clusterId;
  return {
    sections: filterClusterSectionsById(layout.sections, clusterId),
    groupedSections: filterGroupedSectionsByClusterId(
      layout.groupedSections,
      clusterId,
    ),
    rootSections: filterClusterSectionsById(layout.rootSections, clusterId),
    afterRootSections: filterClusterSectionsById(
      layout.afterRootSections,
      clusterId,
    ),
  };
}

export function filterIntroConceptsForHashFocus(
  concepts: readonly SubjectHubHashConcept[],
  focus: SubjectHubHashFocus,
): readonly SubjectHubHashConcept[] {
  if (focus.kind === "none" || focus.kind === "concept") {
    return concepts;
  }
  if (focus.kind === "cluster") {
    return [];
  }
  return concepts.filter((concept) => {
    const group = concept.group?.trim();
    if (!group) {
      return false;
    }
    return conceptGroupSectionDomId(group) === focus.sectionId;
  });
}

/**
 * Intro index rows on subject hubs with an intro topic. Title-twin cluster outlines
 * (e.g. Interview) are merged for hash resolution only — not as extra h2 sections.
 */
export function introConceptsForSubjectHubIndex(
  introConcepts: readonly SubjectHubHashConcept[],
  focusConcepts: readonly SubjectHubHashConcept[],
  focus: SubjectHubHashFocus,
): readonly SubjectHubHashConcept[] {
  if (focus.kind === "none") {
    return introConcepts;
  }
  return filterIntroConceptsForHashFocus(focusConcepts, focus);
}

export function introGroupTitleForSectionId(
  sectionId: string,
  concepts: readonly SubjectHubHashConcept[],
): string | undefined {
  if (!isConceptGroupSectionId(sectionId)) {
    return undefined;
  }
  const hit = findConceptGroupBySectionId(
    introGroupLabels(concepts),
    sectionId,
  );
  return hit?.label;
}

export function subjectHubIndexFocusId(
  focus: SubjectHubHashFocus,
): string | null {
  if (focus.kind === "concept-group") {
    return focus.sectionId;
  }
  if (focus.kind === "cluster") {
    return focus.clusterId;
  }
  return null;
}

export function focusedClusterIdInLayout(
  clusterId: string,
  layout: SubjectHubClusterLayout,
): string | null {
  if (!clusterId) {
    return null;
  }
  const hit = clusterSectionPools(layout).find((section) =>
    clusterSectionMatchesId(section.cluster.id, clusterId),
  );
  return hit?.cluster.id ?? null;
}
