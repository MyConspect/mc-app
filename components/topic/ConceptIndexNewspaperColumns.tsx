"use client";

import { useMemo, useState } from "react";
import { conceptIndexColumnCountForContentHeight } from "@/lib/catalog/conceptIndexColumnMetrics";
import { conceptIndexEntryPackWeight } from "@/lib/catalog/conceptIndexEntryPackWeight";
import type { ConceptIndexLayoutColumnNeedOptions } from "@/lib/catalog/conceptIndexLayoutColumnNeed";
import type { ConceptIndexBalancedEntry } from "./ConceptIndexBalancedLayout";
import { useConceptIndexColumnCount } from "./useConceptIndexColumnCount";
import { useConceptIndexLayoutColumnCount } from "./useConceptIndexLayoutColumnCount";
import { useConceptIndexPaneHeight } from "./useConceptIndexPaneHeight";

const NEWSPAPER_COLUMNS_CLASS =
  "concept-list-index concept-index-newspaper-columns w-full";

function panePackActive(
  options: ConceptIndexLayoutColumnNeedOptions | undefined,
): boolean {
  return options?.oneTrackPerEntry === false;
}

function totalEntryWeight(
  entries: readonly ConceptIndexBalancedEntry[],
  widthCapacity: number,
): number {
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
}

/**
 * Pane-height CSS columns: fill track 1 top-to-bottom before track 2.
 * Cluster sections may break across tracks when one block does not fit below the prior.
 */
export function ConceptIndexNewspaperColumns({
  entries,
  fixedViewportColumns = false,
  columnNeedOptions,
  paneHeightPx,
}: {
  readonly entries: readonly ConceptIndexBalancedEntry[];
  readonly fixedViewportColumns?: boolean;
  readonly columnNeedOptions?: ConceptIndexLayoutColumnNeedOptions;
  /** Parent-measured pane height (locks multicol box so column-fill can use the right). */
  readonly paneHeightPx?: number;
}) {
  const [rootEl, setRootEl] = useState<HTMLDivElement | null>(null);
  const widthCapacity = useConceptIndexColumnCount(rootEl);
  const measuredPaneHeight = useConceptIndexPaneHeight(rootEl);
  const layoutCapacity = useConceptIndexLayoutColumnCount(
    rootEl,
    entries,
    columnNeedOptions,
  );

  const panePack = panePackActive(columnNeedOptions);

  const packPaneHeight = useMemo(() => {
    if (!panePack) {
      return 0;
    }
    const candidates = [measuredPaneHeight, paneHeightPx ?? 0].filter(
      (value) => Number.isFinite(value) && value > 0,
    );
    if (candidates.length === 0) {
      return 0;
    }
    return Math.min(...candidates);
  }, [panePack, measuredPaneHeight, paneHeightPx]);

  const columnCount = useMemo(() => {
    if (fixedViewportColumns) {
      return widthCapacity;
    }
    let count = layoutCapacity;
    if (panePack && packPaneHeight > 0 && entries.length > 0) {
      const weight =
        columnNeedOptions?.totalListWeight &&
        columnNeedOptions.totalListWeight > 0
          ? columnNeedOptions.totalListWeight
          : totalEntryWeight(entries, widthCapacity);
      const heightNeed = conceptIndexColumnCountForContentHeight(
        weight,
        packPaneHeight,
      );
      count = Math.min(widthCapacity, Math.max(count, heightNeed));
    }
    return count;
  }, [
    fixedViewportColumns,
    widthCapacity,
    layoutCapacity,
    panePack,
    packPaneHeight,
    entries,
    columnNeedOptions?.totalListWeight,
  ]);

  const style = useMemo(() => {
    const next: {
      columnCount?: number;
      columnGap?: string;
      height?: number;
      maxHeight?: number;
    } = {};

    if (columnCount > 1) {
      next.columnCount = columnCount;
      next.columnGap = "1.25rem";
      if (panePack && packPaneHeight > 0) {
        next.height = packPaneHeight;
        next.maxHeight = packPaneHeight;
      }
    }

    return Object.keys(next).length > 0 ? next : undefined;
  }, [columnCount, panePack, packPaneHeight]);

  if (entries.length === 0) {
    return null;
  }

  const className = panePack
    ? `${NEWSPAPER_COLUMNS_CLASS} concept-index-newspaper-pane-pack`
    : NEWSPAPER_COLUMNS_CLASS;

  return (
    <div
      ref={setRootEl}
      className={className}
      style={style}
      suppressHydrationWarning
    >
      {entries.map((entry) => (
        <div key={entry.key} className="concept-index-newspaper-item">
          {entry.node}
        </div>
      ))}
    </div>
  );
}