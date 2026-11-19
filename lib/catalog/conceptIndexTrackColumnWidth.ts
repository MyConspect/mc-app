import {
  CONCEPT_INDEX_COL_GAP_REM,
  CONCEPT_INDEX_COL_MAX_PX,
  CONCEPT_INDEX_COL_MIN_PX,
} from "./conceptIndexColumnMetrics";

function rootFontSizePx(): number {
  if (typeof document === "undefined") {
    return 16;
  }
  return parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
}

/** One packed track width for measuring section block heights. */
export function conceptIndexTrackColumnWidthPx(
  paneWidthPx: number,
  columnCount: number,
): number {
  if (!Number.isFinite(paneWidthPx) || paneWidthPx <= 0 || columnCount < 1) {
    return CONCEPT_INDEX_COL_MIN_PX;
  }
  const gapPx = CONCEPT_INDEX_COL_GAP_REM * rootFontSizePx();
  const gaps = Math.max(0, columnCount - 1) * gapPx;
  const track = (paneWidthPx - gaps) / columnCount;
  return Math.min(
    CONCEPT_INDEX_COL_MAX_PX,
    Math.max(CONCEPT_INDEX_COL_MIN_PX, track),
  );
}
