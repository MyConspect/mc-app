import { CONCEPT_INDEX_SECTION_LIST_SPLIT_MIN_ITEMS } from "./conceptIndexSectionListSplit";

/** Lone section may span two grid tracks when its list is this long. */
export const CONCEPT_INDEX_TRACK_SPAN_MIN_ITEMS =
  CONCEPT_INDEX_SECTION_LIST_SPLIT_MIN_ITEMS * 2;

export function conceptIndexTrackColumnSpans(
  trackSizes: readonly number[],
  listItemCounts: readonly (readonly number[])[],
  maxColumns: number,
): readonly number[] {
  if (maxColumns < 2 || trackSizes.length === 0) {
    return trackSizes.map(() => 1);
  }

  const spans: number[] = [];
  let usedColumns = 0;

  for (let i = 0; i < trackSizes.length; i += 1) {
    const lists = listItemCounts[i] ?? [];
    const tracksAfter = trackSizes.length - i - 1;
    const room = maxColumns - usedColumns - tracksAfter;
    let span = 1;
    const loneLong =
      trackSizes[i] === 1 &&
      lists.length === 1 &&
      lists[0]! >= CONCEPT_INDEX_TRACK_SPAN_MIN_ITEMS;

    if (loneLong && room >= 2) {
      span = 2;
    }

    spans.push(span);
    usedColumns += span;
  }

  while (usedColumns > maxColumns) {
    const wide = spans.findIndex((span) => span > 1);
    if (wide < 0) {
      break;
    }
    spans[wide] = 1;
    usedColumns -= 1;
  }

  return spans;
}
