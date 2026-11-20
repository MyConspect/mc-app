/** Keep in sync with `--concept-index-col-min` in globals.css (300px). */
export const CONCEPT_INDEX_COL_MIN_PX = 300;
export const CONCEPT_INDEX_COL_MAX_PX = 300;
export const CONCEPT_INDEX_COL_MIN_REM = CONCEPT_INDEX_COL_MIN_PX / 16;
export const CONCEPT_INDEX_COL_MAX_REM = CONCEPT_INDEX_COL_MAX_PX / 16;
export const CONCEPT_INDEX_COL_GAP_REM = 1.25;

const MAX_PACKED_COLUMNS = 8;

/**
 * Below this viewport width, index panes use at most two newspaper columns
 * (includes responsive-tool widths just above 1280, e.g. 1285).
 * Wider viewports may use more tracks from pane width / content height.
 */
export const CONCEPT_INDEX_TWO_COLUMN_MAX_VIEWPORT_PX = 1320;

export const CONCEPT_INDEX_NARROW_VIEWPORT_MAX_COLUMNS = 2;

/** Prefer two index columns from this viewport up to {@link CONCEPT_INDEX_TWO_COLUMN_MAX_VIEWPORT_PX}. */
export const CONCEPT_INDEX_DUAL_COLUMN_MIN_VIEWPORT_PX = 640;

export function conceptIndexViewportWidthPx(): number | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }
  return window.innerWidth;
}

function conceptIndexTwoTrackWidthPx(rootPx: number): number {
  return (
    2 * CONCEPT_INDEX_COL_MIN_PX +
    (CONCEPT_INDEX_NARROW_VIEWPORT_MAX_COLUMNS - 1) *
      CONCEPT_INDEX_COL_GAP_REM *
      rootPx
  );
}

/** Width-based column fit before viewport min/max rules. */
export function conceptIndexRawColumnCountForWidth(
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

/** Cap / floor column count on narrow viewports (see {@link CONCEPT_INDEX_TWO_COLUMN_MAX_VIEWPORT_PX}). */
export function conceptIndexClampColumnCountForViewport(
  columnCount: number,
  viewportWidthPx: number | undefined = conceptIndexViewportWidthPx(),
  contentWidthPx?: number,
  rootPx = rootFontSizePx(),
): number {
  if (
    viewportWidthPx === undefined ||
    viewportWidthPx >= CONCEPT_INDEX_TWO_COLUMN_MAX_VIEWPORT_PX
  ) {
    return columnCount;
  }
  let count = Math.min(columnCount, CONCEPT_INDEX_NARROW_VIEWPORT_MAX_COLUMNS);
  const paneFitsTwo =
    contentWidthPx !== undefined &&
    contentWidthPx + 0.5 >= conceptIndexTwoTrackWidthPx(rootPx);
  const shouldPreferTwo =
    viewportWidthPx >= CONCEPT_INDEX_DUAL_COLUMN_MIN_VIEWPORT_PX &&
    (columnCount >= 2 || paneFitsTwo);
  if (shouldPreferTwo) {
    count = Math.max(count, CONCEPT_INDEX_NARROW_VIEWPORT_MAX_COLUMNS);
  }
  return count;
}

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
  viewportWidthPx: number | undefined = conceptIndexViewportWidthPx(),
): number {
  if (!Number.isFinite(contentWidthPx) || contentWidthPx <= 0) {
    return 1;
  }
  const raw = conceptIndexRawColumnCountForWidth(contentWidthPx, rootPx);
  return conceptIndexClampColumnCountForViewport(
    raw,
    viewportWidthPx,
    contentWidthPx,
    rootPx,
  );
}

export function conceptIndexDualColumnViewportActive(
  viewportWidthPx: number,
): boolean {
  return (
    viewportWidthPx >= CONCEPT_INDEX_DUAL_COLUMN_MIN_VIEWPORT_PX &&
    viewportWidthPx < CONCEPT_INDEX_TWO_COLUMN_MAX_VIEWPORT_PX
  );
}

/** Pane-pack scroll mode: column-count for multicol (never column-width-only in dual viewport). */
export function conceptIndexPanePackScrollColumnCount(
  widthCapacity: number,
  columnCount: number,
  viewportWidthPx: number,
  contentWidthPx?: number,
  rootPx = rootFontSizePx(),
): number {
  let scrollColumns = Math.max(
    1,
    Math.min(widthCapacity, Math.max(columnCount, widthCapacity >= 2 ? 2 : 1)),
  );
  if (conceptIndexDualColumnViewportActive(viewportWidthPx)) {
    const paneFitsTwo =
      contentWidthPx === undefined ||
      (Number.isFinite(contentWidthPx) &&
        contentWidthPx + 0.5 >= conceptIndexTwoTrackWidthPx(rootPx));
    if (paneFitsTwo) {
      scrollColumns = Math.max(
        scrollColumns,
        CONCEPT_INDEX_NARROW_VIEWPORT_MAX_COLUMNS,
      );
      scrollColumns = Math.min(
        scrollColumns,
        CONCEPT_INDEX_NARROW_VIEWPORT_MAX_COLUMNS,
      );
    }
  }
  return scrollColumns;
}
