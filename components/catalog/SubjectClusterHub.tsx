"use client";

import { useLayoutEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import { useHandbookLocation } from "@/components/nav/hooks/useHandbookLocation";
import { buildConceptIndexBalancedEntries } from "@/components/topic/buildConceptIndexBalancedEntries";
import type { ConceptIndexLayoutMode } from "@/components/topic/ConceptIndexBalancedLayout";
import { ConceptIndexPaneLayout } from "@/components/topic/ConceptIndexPaneLayout";
import { resetHandbookReadingScroll } from "@/components/topic/utils/conceptScroll";
import { chromeFor } from "@/lib/i18n/chrome";
import { localeFromPathname } from "@/lib/i18n/paths";
import { hashIdFrom, sameTitle } from "@/lib/nav/navUtils";
import {
  filterIntroConceptsForHashFocus,
  filterSubjectHubClusterLayout,
  focusedClusterIdInLayout,
  resolveSubjectHubHashFocus,
  subjectHubIndexFocusId,
  type SubjectHubGroupedSection,
} from "@/lib/catalog/filterSubjectHubByHash";
import type { SubjectClusterSection } from "@/lib/catalog/clusterConceptIndex";
import {
  findSubjectClusterSection,
  mergeNestedClusterSection,
} from "@/lib/catalog/mergeNestedClusterIndexSection";
import {
  clusterSectionIndexStats,
} from "@/lib/catalog/clusterIndexFitsPane";
import { conceptIndexLayoutModeForEntries } from "@/lib/catalog/conceptIndexPaneLayoutMode";
import type { Concept } from "@/lib/parse";
import { ConceptList } from "@/components/topic/ConceptList";
import { TopicNavConceptsProvider } from "@/components/topic/context/TopicNavConceptsContext";
import { ClusterCardSections } from "./ClusterCardSections";
import { SubjectHubFocusedGroupList } from "./SubjectHubFocusedGroupList";
import type { CardGridVariant } from "./CardGrid";

type ClusterSection = SubjectClusterSection;

function clusterSectionPools(layout: {
  readonly sections?: readonly ClusterSection[];
  readonly rootSections?: readonly ClusterSection[];
  readonly groupedSections?: readonly {
    readonly clusters: readonly ClusterSection[];
  }[];
  readonly afterRootSections?: readonly ClusterSection[];
}): readonly ClusterSection[] {
  return [
    ...(layout.sections ?? []),
    ...(layout.rootSections ?? []),
    ...(layout.afterRootSections ?? []),
    ...(layout.groupedSections?.flatMap((entry) => entry.clusters) ?? []),
  ];
}

export function SubjectClusterHub({
  sections,
  sectionsNested,
  groupedSections,
  rootSections,
  afterRootSections,
  hubOutlineConcepts = [],
  detailConcepts,
  browseListVariant = "concept-index",
  embedInParentGrid = false,
  subjectTitle,
  titleTwinConceptsByClusterId,
}: {
  sections?: readonly ClusterSection[];
  /** Multi-topic clusters with nested concept rows (pane fit picks vs `sections`). */
  sectionsNested?: readonly ClusterSection[];
  rootSections?: readonly ClusterSection[];
  afterRootSections?: readonly ClusterSection[];
  groupedSections?: readonly SubjectHubGroupedSection[];
  hubOutlineConcepts?: readonly Concept[];
  /** Full parsed concepts for hash drilldown (subject hubs without an intro topic). */
  detailConcepts?: readonly Concept[];
  browseListVariant?: CardGridVariant;
  embedInParentGrid?: boolean;
  /** Subject page title — hides redundant cluster h2 (e.g. Core / Core). */
  readonly subjectTitle?: string;
  /** Pre-parsed title-twin cluster concepts (avoids node:fs on the client). */
  titleTwinConceptsByClusterId?: Readonly<Record<string, readonly Concept[]>>;
}) {
  const pathname = usePathname() ?? "/en";
  const chrome = useMemo(
    () => chromeFor(localeFromPathname(pathname)),
    [pathname],
  );
  const { location } = useHandbookLocation();
  const hashId = hashIdFrom(location.hash);
  const conceptPool = detailConcepts ?? hubOutlineConcepts;

  const clusterLayout = useMemo(
    () => ({
      sections,
      groupedSections,
      rootSections,
      afterRootSections,
    }),
    [sections, groupedSections, rootSections, afterRootSections],
  );

  const groupInterviewSections = useMemo(
    () => hubOutlineConcepts.some((concept) => Boolean(concept.group)),
    [hubOutlineConcepts],
  );

  const hubFocus = useMemo(
    () =>
      resolveSubjectHubHashFocus({
        hashId,
        concepts: conceptPool,
        clusterLayout,
      }),
    [hashId, conceptPool, clusterLayout],
  );

  const conceptOpen = hubFocus.kind === "concept";

  const filteredConcepts = useMemo(
    () => filterIntroConceptsForHashFocus(hubOutlineConcepts, hubFocus),
    [hubOutlineConcepts, hubFocus],
  );

  const filtered = useMemo(
    () => filterSubjectHubClusterLayout(clusterLayout, hubFocus),
    [clusterLayout, hubFocus],
  );

  const nestedClusterLayout = useMemo(() => {
    if (hubFocus.kind !== "cluster" || !sectionsNested?.length) {
      return filtered;
    }
    const clusterId = hubFocus.clusterId;
    const nestedPool = {
      sections: sectionsNested,
      rootSections,
      groupedSections,
      afterRootSections,
    };
    const nestedFiltered = filterSubjectHubClusterLayout(nestedPool, hubFocus);
    const nestedSection = findSubjectClusterSection(nestedFiltered, clusterId);
    const collapsedSection = findSubjectClusterSection(filtered, clusterId);
    return mergeNestedClusterSection(
      filtered,
      clusterId,
      nestedSection,
      collapsedSection,
    );
  }, [
    hubFocus,
    sectionsNested,
    filtered,
    rootSections,
    groupedSections,
    afterRootSections,
  ]);

  const focusedClusterId = useMemo(
    () =>
      hubFocus.kind === "cluster"
        ? focusedClusterIdInLayout(hubFocus.clusterId, filtered)
        : null,
    [hubFocus, filtered],
  );

  const indexFocusId = subjectHubIndexFocusId(hubFocus);

  const titleTwinClusterConcepts = useMemo(() => {
    if (hubFocus.kind !== "cluster" || conceptOpen) {
      return null;
    }
    const section = clusterSectionPools(filtered).find(
      (entry) => entry.cluster.id === hubFocus.clusterId,
    );
    if (!section) {
      return null;
    }
    const loneIndexRow =
      section.items.length === 0 ||
      (section.items.length === 1 &&
        !section.items[0].indexRowKind &&
        sameTitle(section.cluster.title, section.items[0].title));
    if (!loneIndexRow) {
      return null;
    }
    const pool = titleTwinConceptsByClusterId?.[hubFocus.clusterId];
    return pool && pool.length > 0 ? pool : null;
  }, [conceptOpen, filtered, hubFocus, titleTwinConceptsByClusterId]);

  useLayoutEffect(() => {
    if (!indexFocusId) {
      return;
    }
    resetHandbookReadingScroll();
  }, [indexFocusId, location.pathname]);

  const focusedClusterPaneFlow = hubFocus.kind === "cluster";

  const hubSplitsTopicGroups = useMemo(
    () =>
      clusterSectionPools(nestedClusterLayout).some((section) =>
        section.items.some((item) => item.indexRowKind === "group-heading"),
      ),
    [nestedClusterLayout],
  );

  const balancedEntries = useMemo(() => {
    if (hubFocus.kind === "concept-group") {
      return [];
    }
    return buildConceptIndexBalancedEntries({
      clusterLayout: {
        sections: nestedClusterLayout.sections,
        rootSections: nestedClusterLayout.rootSections,
        groupedSections: nestedClusterLayout.groupedSections,
        afterRootSections: nestedClusterLayout.afterRootSections,
      },
      concepts: [],
      groupInterviewSections: false,
      chrome,
      pathname,
      suppressClusterHeadings: focusedClusterId !== null,
      /** One packable unit per topic group (Styles, Data, …) for multi-column grid. */
      splitClusterTopicGroups: focusedClusterPaneFlow || hubSplitsTopicGroups,
      subjectTitle,
    });
  }, [
    hubFocus.kind,
    filteredConcepts,
    groupInterviewSections,
    nestedClusterLayout,
    chrome,
    pathname,
    focusedClusterId,
    focusedClusterPaneFlow,
    hubSplitsTopicGroups,
    subjectTitle,
  ]);

  const indexLayoutMode: ConceptIndexLayoutMode =
    browseListVariant === "concept-index"
      ? conceptIndexLayoutModeForEntries(balancedEntries, {
          preferNewspaperFrom: 1,
        })
      : conceptIndexLayoutModeForEntries(balancedEntries);

  const focusedClusterIndexStats = useMemo(() => {
    if (!focusedClusterPaneFlow || hubFocus.kind !== "cluster") {
      return undefined;
    }
    const section = findSubjectClusterSection(
      nestedClusterLayout,
      hubFocus.clusterId,
    );
    return section ? clusterSectionIndexStats(section) : undefined;
  }, [focusedClusterPaneFlow, hubFocus, nestedClusterLayout]);

  if (hubFocus.kind === "concept-group") {
    return (
      <SubjectHubFocusedGroupList
        concepts={filteredConcepts}
        pathname={pathname}
        chrome={chrome}
      />
    );
  }

  if (conceptOpen) {
    const conceptsForDetail = detailConcepts ?? hubOutlineConcepts;
    return (
      <TopicNavConceptsProvider concepts={conceptsForDetail}>
        <ConceptList
          concepts={conceptsForDetail}
          emptyMessage="No concepts were parsed from this topic."
          groupInterviewSections={groupInterviewSections}
        />
      </TopicNavConceptsProvider>
    );
  }

  if (titleTwinClusterConcepts) {
    return (
      <TopicNavConceptsProvider concepts={titleTwinClusterConcepts}>
        <ConceptList
          concepts={titleTwinClusterConcepts}
          emptyMessage="No concepts were parsed from this topic."
          groupInterviewSections={titleTwinClusterConcepts.some((concept) =>
            Boolean(concept.group),
          )}
        />
      </TopicNavConceptsProvider>
    );
  }

  if (browseListVariant === "concept-index") {
    return (
      <ConceptIndexPaneLayout
        entries={balancedEntries}
        layoutMode={indexLayoutMode}
        packStatsOverride={
          focusedClusterPaneFlow ? focusedClusterIndexStats : undefined
        }
      />
    );
  }

  return (
    <ClusterCardSections
      sections={filtered.sections}
      rootSections={filtered.rootSections}
      groupedSections={filtered.groupedSections}
      afterRootSections={filtered.afterRootSections}
      suppressClusterHeadings={focusedClusterId !== null}
      browseListVariant={browseListVariant}
      embedInParentGrid={embedInParentGrid}
      subjectTitle={subjectTitle}
    />
  );
}
