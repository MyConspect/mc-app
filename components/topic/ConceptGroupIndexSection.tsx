"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import {
  conceptIndexSectionListLayoutClass,
  conceptIndexSectionListSplitStyle,
} from "@/lib/catalog/conceptIndexSectionListSplit";
import { useSearchQuery } from "@/components/search";
import { useConceptIndexColumnCount } from "./useConceptIndexColumnCount";
import { useConceptIndexPaneHeight } from "./useConceptIndexPaneHeight";
import { ConceptGroupSectionHeader } from "./ConceptTitleHeader";
import type { ConceptGroup } from "./conceptIndexGroups";
import { conceptsForIndexSection } from "./conceptIndexGroups";
import type { ChromeCopy } from "@/lib/nav";
import type { SubjectHubConcept } from "@/lib/catalog/subjectHubConcepts";
import {
  CONCEPT_INDEX_CLUSTER_SECTION,
  CONCEPT_INDEX_HEADING_TO_LIST,
  CONCEPT_INDEX_DOT_INTERACTIVE,
  CONCEPT_INDEX_LINK,
  CONCEPT_INDEX_ROW,
} from "./conceptIndexStyles";
import { HighlightedText } from "@/components/search";
import { setHashOnPath } from "@/components/nav/utils/hash";
import { conceptGroupSectionDomId } from "@/lib/nav/conceptGroupSection";

export function ConceptIndexList({
  concepts,
  query,
  pathname,
  chrome,
  conceptHrefFor,
}: {
  concepts: readonly SubjectHubConcept[];
  query: string;
  pathname: string;
  chrome: ChromeCopy;
  conceptHrefFor?: (concept: SubjectHubConcept) => string;
}) {
  const [measureEl, setMeasureEl] = useState<HTMLElement | null>(null);
  const setPaneMeasureRef = useCallback((element: HTMLElement | null) => {
    setMeasureEl(element);
  }, []);
  const paneHeightPx = useConceptIndexPaneHeight(measureEl);
  const widthCapacity = useConceptIndexColumnCount(measureEl);
  const listClass =
    `list-none ${conceptIndexSectionListLayoutClass(concepts.length, paneHeightPx, widthCapacity)}`.trim();
  const listStyle = conceptIndexSectionListSplitStyle(
    concepts.length,
    paneHeightPx,
    widthCapacity,
  );

  return (
    <nav
      ref={setPaneMeasureRef}
      aria-label={chrome.topicsNav}
      className="concept-list min-h-0 w-full min-w-0"
    >
      <ul className={listClass} style={listStyle}>
        {concepts.map((concept) => {
          const href = conceptHrefFor?.(concept);
          const label = (
            <>
              <span
                aria-hidden="true"
                className={CONCEPT_INDEX_DOT_INTERACTIVE}
              />
              <span className="flex-1 text-pretty transition-colors group-hover:text-yellow-500 dark:group-hover:text-yellow-300">
                <HighlightedText text={concept.title} query={query} />
              </span>
            </>
          );
          return (
            <li key={concept.id} id={concept.id} className={CONCEPT_INDEX_ROW}>
              {href ? (
                <Link href={href} className={CONCEPT_INDEX_LINK}>
                  {label}
                </Link>
              ) : (
                <button
                  type="button"
                  className={CONCEPT_INDEX_LINK}
                  onClick={() => setHashOnPath(pathname, concept.id, false)}
                >
                  {label}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function ConceptGroupIndexSection({
  group,
  chrome,
  pathname,
  suppressHeading = false,
}: {
  readonly group: ConceptGroup;
  readonly chrome: ChromeCopy;
  readonly pathname: string;
  readonly suppressHeading?: boolean;
}) {
  const query = useSearchQuery();
  const sectionConcepts = conceptsForIndexSection(group);
  if (sectionConcepts.length === 0 && !group.label) {
    return null;
  }
  const sectionId =
    group.label != null ? conceptGroupSectionDomId(group.label) : undefined;

  return (
    <section
      key={group.key}
      id={sectionId}
      className={CONCEPT_INDEX_CLUSTER_SECTION}
    >
      {group.label && !suppressHeading ? (
        <ConceptGroupSectionHeader title={group.label ?? ""} chrome={chrome} />
      ) : null}
      {sectionConcepts.length > 0 ? (
        <div
          className={
            group.label && !suppressHeading
              ? CONCEPT_INDEX_HEADING_TO_LIST
              : undefined
          }
        >
          <ConceptIndexList
            concepts={sectionConcepts}
            query={query}
            pathname={pathname}
            chrome={chrome}
          />
        </div>
      ) : null}
    </section>
  );
}
