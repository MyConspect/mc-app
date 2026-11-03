"use client";

import { useLayoutEffect, useMemo } from "react";
import { HANDBOOK_MAIN_ID } from "@/constants";
import { useHandbookLocation } from "@/components/nav/hooks/useHandbookLocation";
import { hashIdFrom } from "@/lib/nav/navUtils";
import { ClusterCardSections } from "./ClusterCardSections";
import type { BrowseCard } from "@/lib/catalog";

type ClusterSection = {
  readonly cluster: {
    readonly id: string;
    readonly title: string;
    readonly blurb: string;
  };
  readonly items: readonly BrowseCard[];
};

type GroupedSection = {
  readonly section: {
    readonly id: string;
    readonly title: string;
    readonly defaultOpen?: boolean;
  };
  readonly clusters: readonly ClusterSection[];
};

function filterClusterSections(
  sections: readonly ClusterSection[] | undefined,
  clusterId: string,
): readonly ClusterSection[] | undefined {
  if (!sections?.length || !clusterId) {
    return sections;
  }
  const hit = sections.filter((section) => section.cluster.id === clusterId);
  return hit.length > 0 ? hit : sections;
}

function filterGroupedSections(
  grouped: readonly GroupedSection[] | undefined,
  clusterId: string,
): readonly GroupedSection[] | undefined {
  if (!grouped?.length || !clusterId) {
    return grouped;
  }
  const next = grouped
    .map((entry) => ({
      ...entry,
      clusters: entry.clusters.filter(
        (section) => section.cluster.id === clusterId,
      ),
    }))
    .filter((entry) => entry.clusters.length > 0);
  return next.length > 0 ? next : grouped;
}

export function SubjectClusterHub({
  sections,
  groupedSections,
  rootSections,
  afterRootSections,
}: {
  sections?: readonly ClusterSection[];
  rootSections?: readonly ClusterSection[];
  afterRootSections?: readonly ClusterSection[];
  groupedSections?: readonly GroupedSection[];
}) {
  const { location } = useHandbookLocation();
  const clusterId = hashIdFrom(location.hash);

  const filtered = useMemo(() => {
    if (!clusterId) {
      return { sections, groupedSections, rootSections, afterRootSections };
    }
    return {
      sections: filterClusterSections(sections, clusterId),
      groupedSections: filterGroupedSections(groupedSections, clusterId),
      rootSections: filterClusterSections(rootSections, clusterId),
      afterRootSections: filterClusterSections(afterRootSections, clusterId),
    };
  }, [clusterId, sections, groupedSections, rootSections, afterRootSections]);

  const focusedClusterId = useMemo(() => {
    if (!clusterId) {
      return null;
    }
    const pools: (readonly ClusterSection[] | undefined)[] = [
      filtered.sections,
      filtered.rootSections,
      filtered.afterRootSections,
      filtered.groupedSections?.flatMap((entry) => entry.clusters),
    ];
    for (const pool of pools) {
      const hit = pool?.find((section) => section.cluster.id === clusterId);
      if (hit) {
        return hit.cluster.id;
      }
    }
    return null;
  }, [clusterId, filtered]);

  useLayoutEffect(() => {
    if (!focusedClusterId) {
      return;
    }
    const main = document.getElementById(HANDBOOK_MAIN_ID);
    if (main instanceof HTMLElement) {
      main.scrollTop = 0;
    }
  }, [focusedClusterId, location.pathname]);

  return (
    <ClusterCardSections
      sections={filtered.sections}
      rootSections={filtered.rootSections}
      groupedSections={filtered.groupedSections}
      afterRootSections={filtered.afterRootSections}
      suppressClusterHeadings={focusedClusterId !== null}
    />
  );
}
