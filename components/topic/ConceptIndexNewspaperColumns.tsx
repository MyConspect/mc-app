"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import {
  clusterIndexFitsPane,
  conceptIndexClusterIndexPackWeight,
  conceptIndexColumnCountForAvailablePane,
  conceptIndexColumnCountForPaneSpace,
} from "@/lib/catalog/clusterIndexFitsPane";
import {
  CONCEPT_INDEX_COL_MIN_PX,
  conceptIndexColumnCountForWidth,
} from "@/lib/catalog/conceptIndexColumnMetrics";
import { CONCEPT_INDEX_SECTION_LIST_SPLIT_MIN_ITEMS } from "@/lib/catalog/conceptIndexSectionListSplit";
import { conceptIndexFocusedClusterColumnCount } from "@/lib/catalog/conceptIndexFocusedClusterColumnCount";
import { conceptIndexEntryPackWeight } from "@/lib/catalog/conceptIndexEntryPackWeight";
import type { ConceptIndexLayoutColumnNeedOptions } from "@/lib/catalog/conceptIndexLayoutColumnNeed";
import type { ConceptIndexBalancedEntry } from "./ConceptIndexBalancedLayout";
import { useConceptIndexColumnCount } from "./useConceptIndexColumnCount";
import { useConceptIndexLayoutColumnCount } from "./useConceptIndexLayoutColumnCount";
import { useConceptIndexPaneHeight } from "./useConceptIndexPaneHeight";
import {
  CONCEPT_INDEX_RENDERED_FITS_SLACK_PX,
  conceptIndexColumnsFitPaneElement,
  conceptIndexColumnsFitScrollportElement,
  conceptIndexColumnsRenderedHeightPx,
} from "@/lib/catalog/conceptIndexRenderedFitsPane";
import { conceptIndexShouldUsePaneScroll } from "@/lib/catalog/conceptIndexShouldUsePaneScroll";
import { useConceptIndexRenderedFitsPane } from "./useConceptIndexRenderedFitsPane";
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

  const renderedFitsPane = useConceptIndexRenderedFitsPane(
    rootEl,
    effectivePaneHeight,
    panePack && effectivePaneHeight > 0,
  );

  const entryRevision = useMemo(
    () => entries.map((entry) => entry.key).join("\0"),
    [entries],
  );

  const [paneScrollEngaged, setPaneScrollEngaged] = useState(false);
  const [compactPaneHeight, setCompactPaneHeight] = useState<number | null>(
    null,
  );
  /** Painted layout: grow from 1 when overflow; packing model only caps the max. */
  const [domColumnCount, setDomColumnCount] = useState(1);

  useEffect(() => {
    setPaneScrollEngaged(false);
    setCompactPaneHeight(null);
    setDomColumnCount(1);
  }, [entryRevision, widthCapacity]);

  const scrollColumnCount = useMemo(() => {
    if (!panePack || packWeight <= 0 || effectivePaneHeight <= 0) {
      return 1;
    }
    return conceptIndexColumnCountForPaneSpace(
      packWeight,
      effectivePaneHeight,
      widthCapacity,
      { scrollPane: true },
    );
  }, [panePack, packWeight, effectivePaneHeight, widthCapacity]);

  const packFitColumnCount = useMemo(() => {
    if (!panePack) {
      return 1;
    }
    const layoutColumns =
      widthCapacity >= 2
        ? Math.min(columnCount, widthCapacity)
        : Math.max(1, columnCount);
    return Math.max(scrollColumnCount, layoutColumns);
  }, [panePack, scrollColumnCount, columnCount, widthCapacity]);

  const packFitColumnCountForScroll = useMemo(() => {
    if (!panePack || packWeight <= 0 || effectivePaneHeight <= 0) {
      return packFitColumnCount;
    }
    return conceptIndexColumnCountForAvailablePane(
      packWeight,
      effectivePaneHeight,
      widthCapacity,
    );
  }, [
    panePack,
    packWeight,
    effectivePaneHeight,
    widthCapacity,
    packFitColumnCount,
  ]);

  const availablePaneColumnCount = useMemo(() => {
    if (!panePack || packWeight <= 0 || effectivePaneHeight <= 0) {
      return 1;
    }
    return conceptIndexColumnCountForPaneSpace(
      packWeight,
      effectivePaneHeight,
      widthCapacity,
      { sectionEntryCount: entries.length, scrollPane: false },
    );
  }, [
    panePack,
    packWeight,
    effectivePaneHeight,
    widthCapacity,
    entries.length,
  ]);

  const indexFitsPane = useMemo(() => {
    if (!panePack || packWeight <= 0) {
      return true;
    }
    if (effectivePaneHeight <= 0) {
      return true;
    }
    return clusterIndexFitsPane(
      packWeight,
      effectivePaneHeight,
      packFitColumnCountForScroll,
    );
  }, [panePack, packWeight, effectivePaneHeight, packFitColumnCountForScroll]);

  const shouldUsePaneScroll = useMemo(
    () =>
      conceptIndexShouldUsePaneScroll(
        indexFitsPane,
        renderedFitsPane,
        paneScrollEngaged,
      ),
    [paneScrollEngaged, renderedFitsPane, indexFitsPane],
  );

  const resolvedPaneHeight = useMemo(() => {
    if (shouldUsePaneScroll) {
      return effectivePaneHeight;
    }
    if (compactPaneHeight != null && compactPaneHeight > 0) {
      return compactPaneHeight;
    }
    return 0;
  }, [shouldUsePaneScroll, compactPaneHeight, effectivePaneHeight]);

  const compactPaneShell = useMemo(
    () =>
      !shouldUsePaneScroll &&
      compactPaneHeight != null &&
      resolvedPaneHeight <
        effectivePaneHeight - CONCEPT_INDEX_RENDERED_FITS_SLACK_PX,
    [
      shouldUsePaneScroll,
      compactPaneHeight,
      resolvedPaneHeight,
      effectivePaneHeight,
    ],
  );

  const scrollShellRootClassName = useMemo(() => {
    if (!rootClassName || !compactPaneShell) {
      return rootClassName;
    }
    return rootClassName
      .replace(/\bflex-1\b/g, "")
      .replace(/\bbasis-0\b/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }, [rootClassName, compactPaneShell]);

  /** Pane-height multicol needs a definite scrollport; overflow only when tall. */
  const usePaneHeightShell = useMemo(
    () => panePack && effectivePaneHeight > 0,
    [panePack, effectivePaneHeight],
  );

  const modelNewspaperColumnCount = useMemo(() => {
    if (!panePack) {
      return 1;
    }
    if (!paneScrollEngaged && indexFitsPane) {
      return availablePaneColumnCount;
    }
    if (shouldUsePaneScroll && widthCapacity >= 2) {
      return scrollColumnCount;
    }
    if (!shouldUsePaneScroll) {
      return availablePaneColumnCount;
    }
    return scrollColumnCount > 1 ? scrollColumnCount : columnCount;
  }, [
    panePack,
    paneScrollEngaged,
    indexFitsPane,
    shouldUsePaneScroll,
    widthCapacity,
    scrollColumnCount,
    columnCount,
    availablePaneColumnCount,
  ]);

  const newspaperColumnCount = useMemo(() => {
    if (!panePack) {
      return 1;
    }
    if (shouldUsePaneScroll) {
      return Math.max(
        1,
        Math.min(
          widthCapacity,
          Math.max(scrollColumnCount, modelNewspaperColumnCount),
        ),
      );
    }
    if (effectivePaneHeight > 0) {
      return Math.max(1, Math.min(widthCapacity, domColumnCount));
    }
    return modelNewspaperColumnCount;
  }, [
    panePack,
    shouldUsePaneScroll,
    widthCapacity,
    scrollColumnCount,
    modelNewspaperColumnCount,
    domColumnCount,
    effectivePaneHeight,
  ]);

  const style = useMemo(() => {
    const next: {
      columnCount?: number;
      columnWidth?: string;
      columnGap?: string;
      height?: number;
      minHeight?: number;
      maxHeight?: number;
    } = {};

    if (panePack) {
      next.columnCount = newspaperColumnCount;
      if (newspaperColumnCount <= 1) {
        next.columnWidth = `${CONCEPT_INDEX_COL_MIN_PX}px`;
      }
      next.columnGap = "1.25rem";
    } else if (columnCount > 1) {
      next.columnCount = columnCount;
      next.columnGap = "1.25rem";
    }

    if (
      panePack &&
      resolvedPaneHeight > 0 &&
      usePaneHeightShell &&
      shouldUsePaneScroll
    ) {
      next.height = resolvedPaneHeight;
    }

    return Object.keys(next).length > 0 ? next : undefined;
  }, [
    columnCount,
    widthCapacity,
    panePack,
    usePaneHeightShell,
    shouldUsePaneScroll,
    newspaperColumnCount,
    effectivePaneHeight,
    resolvedPaneHeight,
    viewportWidth,
    measurePaneWidthPx,
  ]);

  useLayoutEffect(() => {
    if (!panePack || effectivePaneHeight <= 0) {
      return;
    }
    let frame = 0;
    const measureOverflow = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const shell = rootEl?.classList.contains(
          "concept-index-newspaper-pane-scroll",
        )
          ? rootEl
          : null;
        const columnsEl =
          shell?.firstElementChild instanceof HTMLElement
            ? shell.firstElementChild
            : rootEl?.classList.contains("concept-index-newspaper-columns")
              ? rootEl
              : null;
        if (!columnsEl) {
          return;
        }
        const slack = CONCEPT_INDEX_RENDERED_FITS_SLACK_PX;
        const shellOverflow =
          shell instanceof HTMLElement &&
          shell.scrollHeight > shell.clientHeight + slack;
        const domFits = conceptIndexColumnsFitPaneElement(
          columnsEl,
          effectivePaneHeight,
          slack,
        );
        const shellHeightAuto =
          shell instanceof HTMLElement &&
          shell.style.height.length === 0 &&
          !shell.classList.contains(
            "concept-index-newspaper-pane-shell--compact",
          );
        const scrollportFits =
          shell instanceof HTMLElement && !shellHeightAuto
            ? conceptIndexColumnsFitScrollportElement(columnsEl, shell, slack)
            : domFits;
        const domOverflow = !domFits || !scrollportFits;
        const paintedHeight = conceptIndexColumnsRenderedHeightPx(
          columnsEl,
          slack,
        );
        const paintedColumnCount = Math.max(
          1,
          Math.floor(parseFloat(getComputedStyle(columnsEl).columnCount) || 1),
        );
        const columnCeiling = Math.min(widthCapacity, scrollColumnCount);

        if (shellOverflow || domOverflow) {
          setPaneScrollEngaged(true);
          setCompactPaneHeight(null);
          if (paintedColumnCount < columnCeiling) {
            setDomColumnCount((prev) =>
              Math.min(columnCeiling, Math.max(prev, paintedColumnCount) + 1),
            );
          }
        } else if (
          domFits &&
          scrollportFits &&
          paintedHeight > 0 &&
          paintedHeight < effectivePaneHeight - slack
        ) {
          setPaneScrollEngaged(false);
          setCompactPaneHeight(paintedHeight);
          if (paintedColumnCount > 1) {
            setDomColumnCount((prev) =>
              Math.min(prev, Math.max(1, paintedColumnCount - 1)),
            );
          }
        } else {
          setPaneScrollEngaged(false);
          setCompactPaneHeight(null);
        }
      });
    };
    measureOverflow();
    if (!rootEl) {
      return;
    }
    const observer = new ResizeObserver(measureOverflow);
    observer.observe(rootEl);
    const columnsEl =
      rootEl.classList.contains("concept-index-newspaper-pane-scroll") &&
      rootEl.firstElementChild instanceof HTMLElement
        ? rootEl.firstElementChild
        : rootEl.classList.contains("concept-index-newspaper-columns")
          ? rootEl
          : null;
    if (columnsEl && columnsEl !== rootEl) {
      observer.observe(columnsEl);
    }
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [
    panePack,
    effectivePaneHeight,
    widthCapacity,
    scrollColumnCount,
    rootEl,
    entryRevision,
    newspaperColumnCount,
    renderedFitsPane,
  ]);

  if (entries.length === 0) {
    return null;
  }

  const oneTrackPanePack = panePack && newspaperColumnCount <= 1;
  const columnsClassName = panePack
    ? `${NEWSPAPER_COLUMNS_CLASS} concept-index-newspaper-pane-pack${
        shouldUsePaneScroll ? " concept-index-newspaper-pane-pack--scroll" : ""
      }${oneTrackPanePack ? " concept-index-newspaper-pane-pack--one-track" : ""}`
    : NEWSPAPER_COLUMNS_CLASS;

  const columnNodes = entries.map((entry) => (
    <div key={entry.key} className="concept-index-newspaper-item">
      {entry.node}
    </div>
  ));

  if (usePaneHeightShell && effectivePaneHeight > 0) {
    const scrollShellClassName = `concept-index-newspaper-pane-scroll min-h-0 w-full min-w-0${
      compactPaneShell
        ? " concept-index-newspaper-pane-shell--compact"
        : " flex-1"
    }${scrollShellRootClassName ? ` ${scrollShellRootClassName}` : ""}`;
    return (
      <div
        ref={setRootEl}
        className={scrollShellClassName}
        style={
          shouldUsePaneScroll
            ? {
                height: resolvedPaneHeight,
                maxHeight: effectivePaneHeight,
              }
            : compactPaneShell && resolvedPaneHeight > 0
              ? {
                  height: resolvedPaneHeight,
                  maxHeight: resolvedPaneHeight,
                }
              : undefined
        }
        suppressHydrationWarning
      >
        <div
          className={columnsClassName}
          style={style}
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
      style={style}
      suppressHydrationWarning
    >
      {columnNodes}
    </div>
  );
}
