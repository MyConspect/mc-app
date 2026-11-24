/** Quantize pane height so ResizeObserver noise does not reflow the index. */
export const CONCEPT_INDEX_PANE_HEIGHT_QUANTIZE_PX = 32;

export function conceptIndexQuantizedPaneHeightPx(heightPx: number): number {
  if (!Number.isFinite(heightPx) || heightPx <= 0) {
    return 0;
  }
  const step = CONCEPT_INDEX_PANE_HEIGHT_QUANTIZE_PX;
  return Math.round(heightPx / step) * step;
}