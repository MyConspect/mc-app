"use client";

import { useMemo } from "react";
import { ConceptIndexPaneLayout } from "@/components/topic/ConceptIndexPaneLayout";
import { buildConceptIndexBalancedEntries } from "@/components/topic/buildConceptIndexBalancedEntries";
import type { ChromeCopy } from "@/lib/nav";
import type { SubjectHubConcept } from "@/lib/catalog/subjectHubConcepts";

/** Dot list under {@link SubjectPageTitle} for `#concept-group-*` hub focus. */
export function SubjectHubFocusedGroupList({
  concepts,
  pathname,
  chrome,
}: {
  readonly concepts: readonly SubjectHubConcept[];
  readonly pathname: string;
  readonly chrome: ChromeCopy;
}) {
  const entries = useMemo(
    () =>
      buildConceptIndexBalancedEntries({
        concepts,
        groupInterviewSections: false,
        chrome,
        pathname,
      }),
    [concepts, chrome, pathname],
  );

  if (concepts.length === 0) {
    return null;
  }

  return (
    <ConceptIndexPaneLayout entries={entries} layoutMode="newspaper" />
  );
}