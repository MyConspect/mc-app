/** When the newspaper pane needs inner scroll vs fixed-height multicol. */
export function conceptIndexShouldUsePaneScroll(
  indexFitsPane: boolean,
  renderedFitsPane: boolean | null,
  paneScrollEngaged = false,
): boolean {
  if (paneScrollEngaged) {
    return true;
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
