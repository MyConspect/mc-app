"use client";

import { useCallback, useMemo, useState } from "react";
import {
  clusterIndexShouldLockPaneHeight,
  conceptIndexClusterIndexPackWeight,
} from "@/lib/catalog/clusterIndexFitsPane";
import {
  CONCEPT_INDEX_COL_MIN_PX,
  conceptIndexColumnCountForWidth,
  conceptIndexPanePackScrollColumnCount,
} from "@/lib/catalog/conceptIndexColumnMetrics";
import { CONCEPT_INDEX_SECTION_LIST_SPLIT_MIN_ITEMS } from "@/lib/catalog/conceptIndexSectionListSplit";
import { conceptIndexFocusedClusterColumnCount } from "@/lib/catalog/conceptIndexFocusedClusterColumnCount";
import { conceptIndexEntryPackWeight } from "@/lib/catalog/conceptIndexEntryPackWeight";
import type { ConceptIndexLayoutColumnNeedOptions } from "@/lib/catalog/conceptIndexLayoutColumnNeed";
import type { ConceptIndexBalancedEntry } from "./ConceptIndexBalancedLayout";
import { useConceptIndexColumnCount } from "./useConceptIndexColumnCount";
import { useConceptIndexLayoutColumnCount } from "./useConceptIndexLayoutColumnCount";
import { useConceptIndexPaneHeight } from "./useConceptIndexPaneHeight";
import { useConceptIndexViewportWidth } from "./useConceptIndexViewportWidth";

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
  widthColumnCapacity,
  rootClassName,
  paneMeasureRef,
}: {
  readonly entries: readonly ConceptIndexBalancedEntry[];
  readonly fixedViewportColumns?: boolean;
  readonly columnNeedOptions?: ConceptIndexLayoutColumnNeedOptions;
  /** Parent-measured pane height (locks multicol box so column-fill can use the right). */
  readonly paneHeightPx?: number;
  readonly widthColumnCapacity?: number;
  readonly rootClassName?: string;
  readonly paneMeasureRef?: (element: HTMLDivElement | null) => void;
}) {
  const [rootEl, setRootElState] = useState<HTMLDivElement | null>(null);
  const [widthMeasureEl, setWidthMeasureEl] = useState<HTMLElement | null>(
    null,
  );
  const setRootEl = useCallback(
    (element: HTMLDivElement | null) => {
      setRootElState(element);
      paneMeasureRef?.(element);
      const indexBody = element?.closest(".handbook-subject-index-body");
      setWidthMeasureEl(indexBody instanceof HTMLElement ? indexBody : element);
    },
    [paneMeasureRef],
  );
  const viewportWidth = useConceptIndexViewportWidth();
  const measuredWidthCapacity = useConceptIndexColumnCount(widthMeasureEl);
  const measurePaneWidthPx =
    widthMeasureEl?.clientWidth ?? rootEl?.clientWidth ?? 0;
  const widthCapacityFromPane = useMemo(() => {
    if (measurePaneWidthPx >= 48) {
      return conceptIndexColumnCountForWidth(
        measurePaneWidthPx,
        undefined,
        viewportWidth,
      );
    }
    return measuredWidthCapacity;
  }, [measurePaneWidthPx, measuredWidthCapacity, viewportWidth]);
  const widthCapacity = Math.max(
    widthCapacityFromPane,
    measuredWidthCapacity,
    widthColumnCapacity ?? 0,
  );
  const measuredPaneHeight = useConceptIndexPaneHeight(
    widthMeasureEl ?? rootEl,
  );
  const layoutCapacity = useConceptIndexLayoutColumnCount(
    widthMeasureEl ?? rootEl,
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

  const indexCounts = useMemo(() => {
    const listRowCount = columnNeedOptions?.indexListRowCount ?? 0;
    const groupHeadingCount = columnNeedOptions?.indexGroupHeadingCount ?? 0;
    if (listRowCount > 0 || groupHeadingCount > 0) {
      return { listRowCount, groupHeadingCount };
    }
    return undefined;
  }, [
    columnNeedOptions?.indexListRowCount,
    columnNeedOptions?.indexGroupHeadingCount,
  ]);

  const packWeight = useMemo(() => {
    let weight = 0;
    if (
      columnNeedOptions?.totalListWeight &&
      columnNeedOptions.totalListWeight > 0
    ) {
      weight = columnNeedOptions.totalListWeight;
    } else {
      weight = totalEntryWeight(entries, widthCapacity);
    }
    if (indexCounts) {
      weight = Math.max(
        weight,
        conceptIndexClusterIndexPackWeight(
          indexCounts.listRowCount,
          indexCounts.groupHeadingCount,
          true,
        ),
      );
    }
    const entryRows = entries.reduce(
      (sum, entry) => sum + entry.listItemCount,
      0,
    );
    if (entryRows > 0) {
      weight = Math.max(
        weight,
        conceptIndexClusterIndexPackWeight(entryRows, 0, true),
      );
    }
    return weight;
  }, [entries, widthCapacity, columnNeedOptions?.totalListWeight, indexCounts]);

  const effectivePaneHeight = useMemo(() => {
    if (packPaneHeight > 0) {
      return packPaneHeight;
    }
    if (measuredPaneHeight > 0) {
      return measuredPaneHeight;
    }
    return paneHeightPx ?? 0;
  }, [packPaneHeight, measuredPaneHeight, paneHeightPx]);

  const columnCount = useMemo(() => {
    if (fixedViewportColumns) {
      return widthCapacity;
    }
    if (panePack && packWeight > 0) {
      const singleLongSection =
        entries.length === 1 &&
        entries[0].listItemCount >= CONCEPT_INDEX_SECTION_LIST_SPLIT_MIN_ITEMS;
      return conceptIndexFocusedClusterColumnCount(
        widthCapacity,
        packWeight,
        effectivePaneHeight,
        indexCounts,
        {
          viewportWidthPx: viewportWidth,
          contentWidthPx:
            measurePaneWidthPx > 0 ? measurePaneWidthPx : undefined,
          singleLongSection,
          sectionEntryCount: entries.length,
        },
      );
    }
    return Math.max(1, layoutCapacity);
  }, [
    fixedViewportColumns,
    widthCapacity,
    layoutCapacity,
    panePack,
    packWeight,
    effectivePaneHeight,
    indexCounts,
  ]);

  const paneFits = useMemo(
    () =>
      panePack &&
      effectivePaneHeight > 0 &&
      packWeight > 0 &&
      clusterIndexShouldLockPaneHeight(
        packWeight,
        effectivePaneHeight,
        columnCount,
      ),
    [panePack, effectivePaneHeight, packWeight, columnCount],
  );

  const paneFitsLocked = paneFits && entries.length > 1;

  const lockPaneHeight = useMemo(
    () =>
      panePack && paneFitsLocked && effectivePaneHeight > 0 && columnCount > 1,
    [panePack, paneFitsLocked, effectivePaneHeight, columnCount],
  );

  const scrollColumnCount = useMemo(() => {
    if (!panePack || lockPaneHeight) {
      return 1;
    }
    return conceptIndexPanePackScrollColumnCount(
      widthCapacity,
      columnCount,
      viewportWidth,
      measurePaneWidthPx > 0 ? measurePaneWidthPx : undefined,
    );
  }, [
    panePack,
    lockPaneHeight,
    widthCapacity,
    columnCount,
    viewportWidth,
    measurePaneWidthPx,
  ]);

  const lockScrollPaneHeight = useMemo(
    () =>
      panePack &&
      !lockPaneHeight &&
      scrollColumnCount > 1 &&
      effectivePaneHeight > 0,
    [panePack, lockPaneHeight, scrollColumnCount, effectivePaneHeight],
  );

  const style = useMemo(() => {
    const next: {
      columnCount?: number;
      columnWidth?: string;
      columnGap?: string;
      height?: number;
      maxHeight?: number;
    } = {};

    if (lockPaneHeight) {
      next.columnCount = columnCount;
      next.columnGap = "1.25rem";
      next.height = effectivePaneHeight;
      next.maxHeight = effectivePaneHeight;
    } else if (panePack) {
      if (scrollColumnCount > 1) {
        next.columnCount = scrollColumnCount;
      } else {
        next.columnWidth = `${CONCEPT_INDEX_COL_MIN_PX}px`;
      }
      next.columnGap = "1.25rem";
    } else if (columnCount > 1) {
      next.columnCount = columnCount;
      next.columnGap = "1.25rem";
    }

    return Object.keys(next).length > 0 ? next : undefined;
  }, [
    columnCount,
    widthCapacity,
    panePack,
    lockPaneHeight,
    lockScrollPaneHeight,
    scrollColumnCount,
    effectivePaneHeight,
    viewportWidth,
    measurePaneWidthPx,
  ]);

  const rootStyle = useMemo(() => {
    if (lockPaneHeight && effectivePaneHeight > 0) {
      return {
        ...style,
        height: effectivePaneHeight,
        maxHeight: effectivePaneHeight,
      };
    }
    return style;
  }, [style, lockPaneHeight, effectivePaneHeight]);

  if (entries.length === 0) {
    return null;
  }

  const oneTrackPanePack =
    panePack && columnCount <= 1 && scrollColumnCount <= 1;
  const columnsClassName = panePack
    ? `${NEWSPAPER_COLUMNS_CLASS} concept-index-newspaper-pane-pack${
        paneFitsLocked ? "" : " concept-index-newspaper-pane-pack--scroll"
      }${oneTrackPanePack ? " concept-index-newspaper-pane-pack--one-track" : ""}`
    : NEWSPAPER_COLUMNS_CLASS;

  const columnNodes = entries.map((entry) => (
    <div key={entry.key} className="concept-index-newspaper-item">
      {entry.node}
    </div>
  ));

  if (lockScrollPaneHeight && effectivePaneHeight > 0) {
    const scrollShellClassName = `concept-index-newspaper-pane-scroll min-h-0 w-full min-w-0 flex-1${
      rootClassName ? ` ${rootClassName}` : ""
    }`;
    return (
      <div
        ref={setRootEl}
        className={scrollShellClassName}
        style={{ maxHeight: effectivePaneHeight }}
        suppressHydrationWarning
      >
        <div
          className={columnsClassName}
          style={{
            ...style,
            minHeight: effectivePaneHeight,
          }}
          suppressHydrationWarning
        >
          {columnNodes}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setRootEl}
      className={`${columnsClassName}${rootClassName ? ` ${rootClassName}` : ""}`}
      style={rootStyle}
      suppressHydrationWarning
    >
      {columnNodes}
    </div>
  );
}
