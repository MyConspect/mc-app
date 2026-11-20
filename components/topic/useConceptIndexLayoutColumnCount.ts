"use client";

import { useMemo } from "react";
import { conceptIndexColumnCountForContentHeight } from "@/lib/catalog/conceptIndexColumnMetrics";
import { conceptIndexEntryPackWeight } from "@/lib/catalog/conceptIndexEntryPackWeight";
import {
  conceptIndexLayoutColumnNeed,
  type ConceptIndexLayoutColumnNeedOptions,
} from "@/lib/catalog/conceptIndexLayoutColumnNeed";
import type { ConceptIndexBalancedEntry } from "./ConceptIndexBalancedLayout";
import { useConceptIndexColumnCount } from "./useConceptIndexColumnCount";
import { useConceptIndexPaneHeight } from "./useConceptIndexPaneHeight";

/** Width cap × height-based need (default one full-pane column). */
export function useConceptIndexLayoutColumnCount(
  gridElement: HTMLElement | null,
  entries: readonly ConceptIndexBalancedEntry[],
  options?: ConceptIndexLayoutColumnNeedOptions,
): number {
  const widthCapacity = useConceptIndexColumnCount(gridElement);
  const paneHeight = useConceptIndexPaneHeight(gridElement);
  const totalWeight = useMemo(() => {
    if (
      options?.totalListWeight !== undefined &&
      Number.isFinite(options.totalListWeight) &&
      options.totalListWeight > 0
    ) {
      return options.totalListWeight;
    }
    return entries.reduce(
      (sum, entry) =>
        sum +
        conceptIndexEntryPackWeight(
          entry.weight,
          entry.listItemCount,
          widthCapacity,
        ),
      0,
    );
  }, [entries, widthCapacity, options?.totalListWeight]);
  const heightCapacity = conceptIndexColumnCountForContentHeight(
    totalWeight,
    paneHeight,
  );
  return conceptIndexLayoutColumnNeed(
    widthCapacity,
    heightCapacity,
    entries.length,
    options,
  );
}
