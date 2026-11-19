/** Minimum bullet rows before a section list may use multi-column layout. */
/** Avoid inner lanes on medium lists (e.g. HTML appendix); split long catalogs only. */
export const CONCEPT_INDEX_SECTION_LIST_SPLIT_MIN_ITEMS = 12;

/** Average rows per column before adding another (7 items → one column). */
export const CONCEPT_INDEX_SECTION_LIST_MIN_ITEMS_PER_COLUMN = 4;

const CONCEPT_INDEX_SECTION_LIST_MAX_COLUMNS = 8;

/** Multi-column list when the section is wide enough (see globals.css). */
export const CONCEPT_INDEX_SECTION_LIST_SPLIT_CLASS =
  "concept-index-section-list-split [&>li]:break-inside-avoid-column";

export function conceptIndexSectionListColumnCount(itemCount: number): number {
  if (!Number.isFinite(itemCount) || itemCount < 8) {
    return 1;
  }
  return Math.min(
    CONCEPT_INDEX_SECTION_LIST_MAX_COLUMNS,
    Math.ceil(itemCount / CONCEPT_INDEX_SECTION_LIST_MIN_ITEMS_PER_COLUMN),
  );
}

export function conceptIndexSectionListLayoutClass(itemCount: number): string {
  if (conceptIndexSectionListColumnCount(itemCount) > 1) {
    return CONCEPT_INDEX_SECTION_LIST_SPLIT_CLASS;
  }
  return "";
}

export type ConceptIndexSectionListStyle = {
  readonly "--concept-index-list-split-columns"?: number;
};

export function conceptIndexSectionListSplitStyle(
  itemCount: number,
): ConceptIndexSectionListStyle | undefined {
  const columns = conceptIndexSectionListColumnCount(itemCount);
  if (columns <= 1) {
    return undefined;
  }
  return { "--concept-index-list-split-columns": columns };
}
