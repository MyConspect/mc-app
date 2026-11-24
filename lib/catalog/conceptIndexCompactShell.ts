import { CONCEPT_INDEX_RENDERED_FITS_SLACK_PX } from "./conceptIndexRenderedFitsPane";

/** Compact shell shrinks below painted height; skip when multicol uses multiple tracks. */
export function conceptIndexShouldUseCompactShell(
  shellOverflow: boolean,
  domOverflow: boolean,
  paintedHeight: number,
  effectivePaneHeight: number,
  paintedColumnCount: number,
  slackPx = CONCEPT_INDEX_RENDERED_FITS_SLACK_PX,
): boolean {
  if (shellOverflow || domOverflow) {
    return false;
  }
  if (paintedHeight <= 0) {
    return false;
  }
  if (paintedHeight >= effectivePaneHeight - slackPx) {
    return false;
  }
  if (paintedColumnCount > 1) {
    return false;
  }
  return true;
}