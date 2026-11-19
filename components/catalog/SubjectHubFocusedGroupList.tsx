"use client";

import { useSearchQuery } from "@/components/search";
import { ConceptIndexList } from "@/components/topic/ConceptGroupIndexSection";
import { CONCEPT_INDEX_CLUSTER_SECTION } from "@/components/topic/conceptIndexStyles";
import type { ChromeCopy } from "@/lib/nav";
import type { Concept } from "@/lib/parse";

/** Dot list under {@link SubjectPageTitle} for `#concept-group-*` hub focus. */
export function SubjectHubFocusedGroupList({
  concepts,
  pathname,
  chrome,
}: {
  readonly concepts: readonly Concept[];
  readonly pathname: string;
  readonly chrome: ChromeCopy;
}) {
  const query = useSearchQuery();
  if (concepts.length === 0) {
    return null;
  }
  return (
    <section
      className={`${CONCEPT_INDEX_CLUSTER_SECTION} concept-list-index w-full`}
    >
      <ConceptIndexList
        concepts={concepts}
        query={query}
        pathname={pathname}
        chrome={chrome}
      />
    </section>
  );
}
