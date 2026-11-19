/** Keep in sync with `--concept-index-col-min` in globals.css (214px). */
export const CONCEPT_INDEX_COL_MIN_PX = 214;
export const CONCEPT_INDEX_COL_MIN_REM = CONCEPT_INDEX_COL_MIN_PX / 16;
export const CONCEPT_INDEX_COL_MAX_REM = 22;
export const CONCEPT_INDEX_COL_GAP_REM = 1.25;

const MAX_PACKED_COLUMNS = 8;

/** ~one concept-index row in packing weight units (heading ≈ 2 rows). */
export const CONCEPT_INDEX_WEIGHT_ROW_PX = 22;

/** Title and breadcrumbs below the scroll pane (pack to one column when content fits). */
export const CONCEPT_INDEX_PANE_USABLE_RATIO = 0.82;

/** Horizontal columns needed so each holds ~one pane height of content. */
export function conceptIndexColumnCountForContentHeight(
  totalWeight: number,
  paneHeightPx: number,
): number {
  if (!Number.isFinite(totalWeight) || totalWeight <= 0) {
    return 1;
  }
  if (!Number.isFinite(paneHeightPx) || paneHeightPx <= 0) {
    return 1;
  }
  const rowsPerPane = Math.floor(
    (paneHeightPx * CONCEPT_INDEX_PANE_USABLE_RATIO) /
      CONCEPT_INDEX_WEIGHT_ROW_PX,
  );
  if (rowsPerPane < 1) {
    return 1;
  }
  return Math.max(
    1,
    Math.min(MAX_PACKED_COLUMNS, Math.ceil(totalWeight / rowsPerPane)),
  );
}

/** Grid track list for packed subject/track index columns (`n` from layout, not CSS `attr()`). */
export function conceptIndexPackedGridTemplateColumns(
  columnCount: number,
): string {
  const safe = Math.max(1, Math.min(columnCount, MAX_PACKED_COLUMNS));
  const minTrack = "min(var(--concept-index-col-min), 100%)";
  const maxTrack = "min(var(--concept-index-col-max), max-content)";
  return `repeat(${safe}, minmax(${minTrack}, ${maxTrack}))`;
}

/** Equal-width section tracks that grow to fill the index pane. */
export function conceptIndexSectionsGridTemplateColumns(
  columnCount: number,
): string {
  const safe = Math.max(1, Math.min(columnCount, MAX_PACKED_COLUMNS));
  const minTrack = "min(var(--concept-index-col-min), 100%)";
  return `repeat(${safe}, minmax(${minTrack}, 1fr))`;
}

function rootFontSizePx(): number {
  if (typeof document === "undefined") {
    return 16;
  }
  return parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
}

/** How many packed columns fit without horizontal scroll (uses min track width). */
export function conceptIndexColumnCountForWidth(
  contentWidthPx: number,
  rootPx = rootFontSizePx(),
): number {
  if (!Number.isFinite(contentWidthPx) || contentWidthPx <= 0) {
    return 1;
  }
  const minPx = CONCEPT_INDEX_COL_MIN_PX;
  const gapPx = CONCEPT_INDEX_COL_GAP_REM * rootPx;
  for (let columns = MAX_PACKED_COLUMNS; columns >= 1; columns -= 1) {
    const required = columns * minPx + (columns - 1) * gapPx;
    if (contentWidthPx + 0.5 >= required) {
      return columns;
    }
  }
  return 1;
}
