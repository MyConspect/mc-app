/** Slack for subpixel layout, column gaps, and packing-model drift. */
export const CONCEPT_INDEX_RENDERED_FITS_SLACK_PX = 8;

/** True when measured multicol height fits the pane (no pane/body scroll). */
export function conceptIndexRenderedFitsPane(
  contentHeightPx: number,
  paneHeightPx: number,
  slackPx = CONCEPT_INDEX_RENDERED_FITS_SLACK_PX,
): boolean {
  if (!Number.isFinite(contentHeightPx) || contentHeightPx <= 0) {
    return true;
  }
  if (!Number.isFinite(paneHeightPx) || paneHeightPx <= 0) {
    return true;
  }
  return contentHeightPx <= paneHeightPx + slackPx;
}

/** Bounds check from layout measurements (testable without DOM). */
export function conceptIndexContentBoundsFitPane(
  contentHeightPx: number,
  paneHeightPx: number,
  contentWidthPx: number,
  paneWidthPx: number,
  slackPx = CONCEPT_INDEX_RENDERED_FITS_SLACK_PX,
): boolean {
  if (!Number.isFinite(paneHeightPx) || paneHeightPx <= 0) {
    return true;
  }
  if (!Number.isFinite(paneWidthPx) || paneWidthPx <= 0) {
    return true;
  }
  const verticalOk =
    !Number.isFinite(contentHeightPx) ||
    contentHeightPx <= 0 ||
    contentHeightPx <= paneHeightPx + slackPx;
  const horizontalOk =
    !Number.isFinite(contentWidthPx) ||
    contentWidthPx <= 0 ||
    contentWidthPx <= paneWidthPx + slackPx;
  return verticalOk && horizontalOk;
}

function columnContentExtents(columnsEl: HTMLElement): {
  readonly maxBottom: number;
  readonly maxRight: number;
  readonly boxTop: number;
  readonly boxRight: number;
} {
  const box = columnsEl.getBoundingClientRect();
  const nodes = columnsEl.querySelectorAll(
    ".concept-index-link, .concept-index-cluster-section > h2, .concept-index-cluster-section > h3, .concept-index-topic-group-block > h3, .concept-index-newspaper-item > h2, .concept-index-newspaper-item > h3",
  );
  let maxBottom = box.top;
  let maxRight = box.left;
  for (const node of nodes) {
    if (!(node instanceof HTMLElement)) {
      continue;
    }
    const rect = node.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) {
      continue;
    }
    maxBottom = Math.max(maxBottom, rect.bottom);
    maxRight = Math.max(maxRight, rect.right);
  }
  if (nodes.length === 0) {
    const items = columnsEl.querySelectorAll(".concept-index-newspaper-item");
    for (const node of items) {
      if (!(node instanceof HTMLElement)) {
        continue;
      }
      const rect = node.getBoundingClientRect();
      maxBottom = Math.max(maxBottom, rect.bottom);
      maxRight = Math.max(maxRight, rect.right);
    }
  }
  return { maxBottom, maxRight, boxTop: box.top, boxRight: box.right };
}

/**
 * Multicol may paint past a fixed height without raising scrollHeight — use
 * link/heading bounds vs the pane budget and the column box bottom.
 */
export function conceptIndexColumnsFitPaneElement(
  columnsEl: HTMLElement,
  paneHeightPx: number,
  slackPx = CONCEPT_INDEX_RENDERED_FITS_SLACK_PX,
): boolean {
  if (!Number.isFinite(paneHeightPx) || paneHeightPx <= 0) {
    return true;
  }
  const box = columnsEl.getBoundingClientRect();
  const verticalLimit = Math.min(box.bottom, box.top + paneHeightPx);
  const { maxBottom, maxRight, boxTop, boxRight } =
    columnContentExtents(columnsEl);
  const contentHeight = Math.max(0, maxBottom - boxTop);
  const contentWidth = Math.max(0, maxRight - box.left);
  const fitsBudget = conceptIndexContentBoundsFitPane(
    contentHeight,
    paneHeightPx,
    contentWidth,
    box.width,
    slackPx,
  );
  const fitsBox =
    maxBottom <= verticalLimit + slackPx && maxRight <= boxRight + slackPx;
  return fitsBudget && fitsBox;
}

/** Content must fit the visible scrollport (shell), not only the pack height budget. */
export function conceptIndexColumnsFitScrollportElement(
  columnsEl: HTMLElement,
  scrollportEl: HTMLElement,
  slackPx = CONCEPT_INDEX_RENDERED_FITS_SLACK_PX,
): boolean {
  const scrollport = scrollportEl.getBoundingClientRect();
  const box = columnsEl.getBoundingClientRect();
  const { maxBottom, maxRight } = columnContentExtents(columnsEl);
  const fitsScrollport =
    maxBottom <= scrollport.bottom + slackPx &&
    maxRight <= scrollport.right + slackPx;
  const fitsWidth = maxRight <= box.right + slackPx;
  return fitsScrollport && fitsWidth;
}

/** Painted content height inside a multicol pack (for compact fit sizing). */
export function conceptIndexColumnsRenderedHeightPx(
  columnsEl: HTMLElement,
  slackPx = CONCEPT_INDEX_RENDERED_FITS_SLACK_PX,
): number {
  const box = columnsEl.getBoundingClientRect();
  const { maxBottom, boxTop } = columnContentExtents(columnsEl);
  return Math.max(0, Math.ceil(maxBottom - boxTop + slackPx));
}
