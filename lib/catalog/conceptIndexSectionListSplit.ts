import type { CSSProperties } from "react";
import {
  CONCEPT_INDEX_PANE_USABLE_RATIO,
  CONCEPT_INDEX_WEIGHT_ROW_PX,
} from "./conceptIndexColumnMetrics";

/** Minimum bullet rows before a section list may use multi-column layout. */
/** Avoid inner lanes on medium lists (e.g. HTML appendix); split long catalogs only. */
export const CONCEPT_INDEX_SECTION_LIST_SPLIT_MIN_ITEMS = 12;

/** Average rows per column before adding another (7 items → one column). */
export const CONCEPT_INDEX_SECTION_LIST_MIN_ITEMS_PER_COLUMN = 4;

const CONCEPT_INDEX_SECTION_LIST_MAX_COLUMNS = 8;

/** Multi-column list when the section is wide enough (see globals.css). */
export const CONCEPT_INDEX_SECTION_LIST_SPLIT_CLASS =
  "concept-index-section-list-split [&>li]:break-inside-avoid-column";

function sectionListColumnsByWidth(itemCount: number): number {
  return Math.min(
    CONCEPT_INDEX_SECTION_LIST_MAX_COLUMNS,
    Math.ceil(itemCount / CONCEPT_INDEX_SECTION_LIST_MIN_ITEMS_PER_COLUMN),
  );
}

function rowsPerPaneForSplit(paneHeightPx: number): number {
  return Math.floor(
    (paneHeightPx * CONCEPT_INDEX_PANE_USABLE_RATIO) /
      CONCEPT_INDEX_WEIGHT_ROW_PX,
  );
}

/**
 * Inner list column count. Lists under {@link CONCEPT_INDEX_SECTION_LIST_SPLIT_MIN_ITEMS}
 * stay one column unless the pane is too short. Longer lists split by height first;
 * width-based columns apply only before pane height is known (SSR).
 */
export function conceptIndexSectionListColumnCount(
  itemCount: number,
  paneHeightPx?: number,
  _widthCapacity?: number,
): number {
  if (!Number.isFinite(itemCount) || itemCount < 8) {
    return 1;
  }
  const byWidth = sectionListColumnsByWidth(itemCount);

  if (itemCount < CONCEPT_INDEX_SECTION_LIST_SPLIT_MIN_ITEMS) {
    if (
      paneHeightPx === undefined ||
      !Number.isFinite(paneHeightPx) ||
      paneHeightPx <= 0
    ) {
      return 1;
    }
    const rowsPerPane = rowsPerPaneForSplit(paneHeightPx);
    if (rowsPerPane < 1 || itemCount <= rowsPerPane) {
      return 1;
    }
    return Math.min(
      byWidth,
      Math.min(
        CONCEPT_INDEX_SECTION_LIST_MAX_COLUMNS,
        Math.ceil(itemCount / rowsPerPane),
      ),
    );
  }

  if (
    paneHeightPx === undefined ||
    !Number.isFinite(paneHeightPx) ||
    paneHeightPx <= 0
  ) {
    return byWidth;
  }
  const rowsPerPane = rowsPerPaneForSplit(paneHeightPx);
  if (rowsPerPane < 1) {
    return byWidth;
  }
  if (itemCount <= rowsPerPane) {
    return 1;
  }
  const byHeight = Math.min(
    CONCEPT_INDEX_SECTION_LIST_MAX_COLUMNS,
    Math.ceil(itemCount / rowsPerPane),
  );
  return Math.min(byWidth, Math.max(1, byHeight));
}

export function conceptIndexSectionListLayoutClass(
  itemCount: number,
  paneHeightPx?: number,
  widthCapacity?: number,
): string {
  if (
    conceptIndexSectionListColumnCount(itemCount, paneHeightPx, widthCapacity) >
    1
  ) {
    return CONCEPT_INDEX_SECTION_LIST_SPLIT_CLASS;
  }
  return "";
}

export type ConceptIndexSectionListStyle = CSSProperties & {
  readonly "--concept-index-list-split-columns"?: number;
};

export function conceptIndexSectionListSplitStyle(
  itemCount: number,
  paneHeightPx?: number,
  widthCapacity?: number,
): ConceptIndexSectionListStyle | undefined {
  const columns = conceptIndexSectionListColumnCount(
    itemCount,
    paneHeightPx,
    widthCapacity,
  );
  if (columns <= 1) {
    return undefined;
  }
  return { "--concept-index-list-split-columns": columns };
}
