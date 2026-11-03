"use client";

import { useMemo } from "react";
import { useHandbookLocation } from "@/components/nav/hooks/useHandbookLocation";
import { hashIdFrom } from "@/lib/nav/navUtils";
import { PageTitleHeader } from "./PageTitleHeader";

type ClusterSection = {
  readonly cluster: {
    readonly id: string;
    readonly title: string;
  };
};

type GroupedSection = {
  readonly clusters: readonly ClusterSection[];
};

function clusterTitleForHash(
  clusterId: string,
  pools: (readonly ClusterSection[] | undefined)[],
): string | undefined {
  for (const pool of pools) {
    const hit = pool?.find((section) => section.cluster.id === clusterId);
    if (hit) {
      return hit.cluster.title;
    }
  }
  return undefined;
}

/** Subject hub title; uses cluster name from the URL hash when present. */
export function SubjectPageTitle({
  subjectTitle,
  sections,
  rootSections,
  afterRootSections,
  groupedSections,
}: {
  subjectTitle: string;
  sections?: readonly ClusterSection[];
  rootSections?: readonly ClusterSection[];
  afterRootSections?: readonly ClusterSection[];
  groupedSections?: readonly GroupedSection[];
}) {
  const { location, activeConceptId } = useHandbookLocation();
  const clusterId = hashIdFrom(location.hash);

  const clusterPools = useMemo(
    () =>
      [
        sections,
        rootSections,
        afterRootSections,
        groupedSections?.flatMap((entry) => entry.clusters),
      ] as const,
    [afterRootSections, groupedSections, rootSections, sections],
  );

  const clusterTitle = useMemo(() => {
    if (!clusterId) {
      return undefined;
    }
    return clusterTitleForHash(clusterId, [...clusterPools]);
  }, [clusterId, clusterPools]);

  const title = clusterTitle ?? subjectTitle;

  if (activeConceptId && !clusterTitle) {
    return null;
  }

  return <PageTitleHeader title={title} />;
}
