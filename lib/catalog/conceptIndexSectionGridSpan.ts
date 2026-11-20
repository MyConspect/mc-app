import { CONCEPT_INDEX_SECTION_LIST_SPLIT_MIN_ITEMS } from "./conceptIndexSectionListSplit";

/**
 * How many grid tracks one index section should span so its list flows
 * horizontally (2nd–4th columns) instead of scrolling in one narrow column.
 */
export function conceptIndexSectionGridSpan(
  listItemCount: number,
  _paneHeightPx: number,
  maxColumns: number,
): number {
  if (listItemCount === 0 || maxColumns <= 1) {
    return 1;
  }
  if (listItemCount < CONCEPT_INDEX_SECTION_LIST_SPLIT_MIN_ITEMS) {
    return 1;
  }

  const need = Math.ceil(
    listItemCount / CONCEPT_INDEX_SECTION_LIST_SPLIT_MIN_ITEMS,
  );

  return Math.min(maxColumns, need);
}
