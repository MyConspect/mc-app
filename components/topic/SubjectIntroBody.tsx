"use client";

import type { ReactNode } from "react";
import { useLayoutEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import { useHandbookLocation } from "@/components/nav/hooks/useHandbookLocation";
import { hashIdFrom } from "@/lib/nav/navUtils";
import { chromeFor } from "@/lib/i18n/chrome";
import { localeFromPathname } from "@/lib/i18n/paths";
import type { SubjectClusterSection } from "@/lib/catalog/clusterConceptIndex";
import {
  filterSubjectHubClusterLayout,
  introConceptsForSubjectHubIndex,
  resolveSubjectHubHashFocus,
  subjectHubIndexFocusId,
} from "@/lib/catalog/filterSubjectHubByHash";
import { SubjectHubFocusedGroupList } from "@/components/catalog/SubjectHubFocusedGroupList";
import { ConceptList } from "./ConceptList";
import { TopicNavConceptsProvider } from "./context/TopicNavConceptsContext";
import type { Concept } from "@/lib/parse";
import { ConceptIndexBalancedLayout } from "./ConceptIndexBalancedLayout";
import { buildConceptIndexBalancedEntries } from "./buildConceptIndexBalancedEntries";
import { resetHandbookReadingScroll } from "./utils/conceptScroll";

function mergeFocusConceptPools(
  primary: readonly Concept[],
  extra?: readonly Concept[],
): readonly Concept[] {
  if (!extra?.length) {
    return primary;
  }
  const seen = new Set(primary.map((concept) => concept.id));
  const merged = [...primary];
  for (const concept of extra) {
    if (seen.has(concept.id)) {
      continue;
    }
    seen.add(concept.id);
    merged.push(concept);
  }
  return merged;
}

export function SubjectIntroBody({
  fallbackBanner,
  concepts,
  hubOutlineConcepts = [],
  emptyMessage,
  groupInterviewSections,
  clusterIndex,
}: {
  fallbackBanner: ReactNode;
  concepts: readonly Concept[];
  hubOutlineConcepts?: readonly Concept[];
  emptyMessage: string;
  groupInterviewSections: boolean;
  clusterIndex: {
    readonly sections?: readonly SubjectClusterSection[];
    readonly rootSections?: readonly SubjectClusterSection[];
    readonly groupedSections?: readonly {
      readonly section: {
        readonly id: string;
        readonly title: string;
        readonly defaultOpen?: boolean;
      };
      readonly clusters: readonly SubjectClusterSection[];
    }[];
    readonly afterRootSections?: readonly SubjectClusterSection[];
  };
}) {
  const pathname = usePathname() ?? "/en";
  const chrome = useMemo(
    () => chromeFor(localeFromPathname(pathname)),
    [pathname],
  );
  const { location } = useHandbookLocation();
  const hashId = hashIdFrom(location.hash);
  const focusConcepts = useMemo(
    () => mergeFocusConceptPools(concepts, hubOutlineConcepts),
    [concepts, hubOutlineConcepts],
  );
  const hubFocus = useMemo(
    () =>
      resolveSubjectHubHashFocus({
        hashId,
        concepts: focusConcepts,
        clusterLayout: clusterIndex,
      }),
    [hashId, focusConcepts, clusterIndex],
  );

  const conceptOpen = hubFocus.kind === "concept";

  const indexFocusId = subjectHubIndexFocusId(hubFocus);

  useLayoutEffect(() => {
    if (!indexFocusId) {
      return;
    }
    resetHandbookReadingScroll();
  }, [indexFocusId, location.pathname]);

  const filteredConcepts = useMemo(
    () => introConceptsForSubjectHubIndex(concepts, focusConcepts, hubFocus),
    [concepts, focusConcepts, hubFocus],
  );

  const filteredClusterLayout = useMemo(
    () => filterSubjectHubClusterLayout(clusterIndex, hubFocus),
    [clusterIndex, hubFocus],
  );

  const balancedEntries = useMemo(
    () =>
      buildConceptIndexBalancedEntries({
        clusterLayout: filteredClusterLayout,
        concepts: filteredConcepts,
        groupInterviewSections,
        chrome,
        pathname,
        suppressIntroGroupHeadings: hubFocus.kind === "concept-group",
        suppressClusterHeadings: hubFocus.kind === "cluster",
      }),
    [
      filteredClusterLayout,
      filteredConcepts,
      groupInterviewSections,
      chrome,
      pathname,
      hubFocus.kind,
    ],
  );

  if (hubFocus.kind === "concept-group") {
    return (
      <div className="handbook-subject-index-body w-full">
        {fallbackBanner}
        <SubjectHubFocusedGroupList
          concepts={filteredConcepts}
          pathname={pathname}
          chrome={chrome}
        />
      </div>
    );
  }

  if (conceptOpen) {
    return (
      <div className="handbook-intro-concept-pane flex min-h-0 max-w-3xl flex-1 flex-col">
        {fallbackBanner}
        <TopicNavConceptsProvider concepts={concepts}>
          <ConceptList
            concepts={concepts}
            emptyMessage={emptyMessage}
            groupInterviewSections={groupInterviewSections}
          />
        </TopicNavConceptsProvider>
      </div>
    );
  }

  return (
    <div className="handbook-subject-index-body w-full">
      {fallbackBanner}
      <ConceptIndexBalancedLayout
        entries={balancedEntries}
        usePaneColumnFlow={false}
      />
    </div>
  );
}
