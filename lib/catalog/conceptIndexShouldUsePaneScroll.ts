/** When the newspaper pane needs inner scroll vs fixed-height multicol. */
export function conceptIndexShouldUsePaneScroll(
  indexFitsPane: boolean,
  renderedFitsPane: boolean | null,
  paneScrollEngaged = false,
  /** When false, grow column-count toward width capacity before pane scroll. */
  columnCapacityExhausted = true,
): boolean {
  if (paneScrollEngaged) {
    return true;
  }
  if (!columnCapacityExhausted) {
    return false;
  }
  if (renderedFitsPane === true) {
    return false;
  }
  if (renderedFitsPane === false) {
    return true;
  }
  if (!indexFitsPane) {
    return true;
  }
  return false;
}
