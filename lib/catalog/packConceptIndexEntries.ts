import {
  applyInterstitialMiddleColumn,
  collapseLoneTailColumn,
  CONCEPT_INDEX_LARGE_LIST_BREAK_ITEMS,
  packSectionsToPaneHeightWithLargeListBreak,
  spreadSectionsAcrossViewportColumns,
  stackCompactSectionsUnderPrimaryColumn,
} from "./conceptIndexColumnPack";

export type ConceptIndexPackableEntry = {
  readonly key: string;
  readonly weight: number;
  readonly listItemCount: number;
};

function postProcessColumns<T>(
  columns: readonly (readonly T[])[],
  weightOf: (item: T) => number,
): readonly (readonly T[])[] {
  let next = stackCompactSectionsUnderPrimaryColumn(columns, weightOf);
  next = applyInterstitialMiddleColumn(next, weightOf);
  next = collapseLoneTailColumn(next, weightOf);
  return next.filter((column) => column.length > 0);
}

/** Pack index sections into grid tracks (replaces raw CSS column flow). */
export function packConceptIndexEntries<T extends ConceptIndexPackableEntry>(
  entries: readonly T[],
  paneHeightPx: number,
  maxColumns: number,
): readonly (readonly T[])[] {
  if (entries.length === 0) {
    return [];
  }
  if (maxColumns <= 1) {
    return [entries];
  }

  const weightOf = (entry: T) => entry.weight;
  const listItemCountOf = (entry: T) => entry.listItemCount;

  if (entries.length === maxColumns + 1) {
    const spread = spreadSectionsAcrossViewportColumns(entries, maxColumns);
    if (spread) {
      return postProcessColumns(spread, weightOf);
    }
  }

  const packed = packSectionsToPaneHeightWithLargeListBreak(
    entries,
    paneHeightPx,
    maxColumns,
    weightOf,
    listItemCountOf,
    CONCEPT_INDEX_LARGE_LIST_BREAK_ITEMS,
  );

  return postProcessColumns(packed, weightOf);
}