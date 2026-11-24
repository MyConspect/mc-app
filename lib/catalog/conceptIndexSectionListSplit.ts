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
 * Inner list column count. With pane height, prefer one column when all rows fit
 * vertically; otherwise cap width-based columns by height need.
 */
export function conceptIndexSectionListColumnCount(
  itemCount: number,
  paneHeightPx?: number,
): number {
  if (!Number.isFinite(itemCount) || itemCount < 8) {
    return 1;
  }
  const byWidth = sectionListColumnsByWidth(itemCount);
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
): string {
  if (conceptIndexSectionListColumnCount(itemCount, paneHeightPx) > 1) {
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
): ConceptIndexSectionListStyle | undefined {
  const columns = conceptIndexSectionListColumnCount(itemCount, paneHeightPx);
  if (columns <= 1) {
    return undefined;
  }
  return { "--concept-index-list-split-columns": columns };
}
