import {
  CONCEPT_INDEX_PANE_USABLE_RATIO,
  CONCEPT_INDEX_WEIGHT_ROW_PX,
} from "./conceptIndexColumnMetrics";

/** Weight units that fit in one index pane (one screen column). */
/** @param usableRatio Fraction of pane height used for packing. */
export function conceptIndexRowsPerPane(
  paneHeightPx: number,
  usableRatio = CONCEPT_INDEX_PANE_USABLE_RATIO,
): number {
  if (!Number.isFinite(paneHeightPx) || paneHeightPx <= 0) {
    return 1;
  }
  return Math.max(
    1,
    Math.floor((paneHeightPx * usableRatio) / CONCEPT_INDEX_WEIGHT_ROW_PX),
  );
}

export function packSectionsToPaneHeight<T>(
  items: readonly T[],
  paneHeightPx: number,
  maxTracks: number,
  weightOf: (item: T) => number,
  paneUsableRatio?: number,
): readonly (readonly T[])[] {
  if (items.length === 0) {
    return [];
  }
  const tracksCap = Math.max(1, maxTracks);
  if (tracksCap === 1) {
    return [items];
  }

  const paneCapacity = conceptIndexRowsPerPane(paneHeightPx, paneUsableRatio);
  const tracks: T[][] = [];
  let current: T[] = [];
  let used = 0;

  for (const item of items) {
    const weight = weightOf(item);
    const paneFull = current.length > 0 && used + weight > paneCapacity;
    const canOpenTrack = tracks.length < tracksCap - 1;

    if (paneFull && canOpenTrack) {
      tracks.push(current);
      current = [item];
      used = weight;
    } else {
      current.push(item);
      used += weight;
    }
  }
  if (current.length > 0) {
    tracks.push(current);
  }

  while (tracks.length > tracksCap) {
    const overflow = tracks.pop();
    if (overflow?.length) {
      tracks[tracks.length - 1]!.push(...overflow);
    }
  }

  return tracks;
}

/** Default list length that forces the next section into the next column. */
export const CONCEPT_INDEX_LARGE_LIST_BREAK_ITEMS = 7;

/**
 * Like {@link packSectionsToPaneHeight}, but when the current column already
 * holds a long bullet list, the next section starts a new column (horizontal
 * flow instead of stacking Modules under Core in the same track).
 */
export function packSectionsToPaneHeightWithLargeListBreak<T>(
  items: readonly T[],
  paneHeightPx: number,
  maxTracks: number,
  weightOf: (item: T) => number,
  listItemCountOf: (item: T) => number,
  largeListMinItems = CONCEPT_INDEX_LARGE_LIST_BREAK_ITEMS,
): readonly (readonly T[])[] {
  if (items.length === 0) {
    return [];
  }
  const tracksCap = Math.max(1, maxTracks);
  if (tracksCap === 1) {
    return [items];
  }

  const paneCapacity = conceptIndexRowsPerPane(paneHeightPx);
  const tracks: T[][] = [];
  let current: T[] = [];
  let used = 0;

  const currentHasLargeList = () =>
    current.some((item) => listItemCountOf(item) >= largeListMinItems);

  for (const item of items) {
    const weight = weightOf(item);
    const paneFull = current.length > 0 && used + weight > paneCapacity;
    const breakAfterLargeList = current.length > 0 && currentHasLargeList();
    const canOpenTrack = tracks.length < tracksCap - 1;

    if ((paneFull || breakAfterLargeList) && canOpenTrack) {
      tracks.push(current);
      current = [item];
      used = weight;
    } else {
      current.push(item);
      used += weight;
    }
  }
  if (current.length > 0) {
    tracks.push(current);
  }

  while (tracks.length > tracksCap) {
    const overflow = tracks.pop();
    if (overflow?.length) {
      tracks[tracks.length - 1]!.push(...overflow);
    }
  }

  return tracks;
}

/** After a very short section, stack the next one beneath it in the same column. */
const SHORT_SECTION_STACK_THRESHOLD = 4;

/** Lone trailing sections at most this weight may sit in the middle column (between neighbors). */
export const INTERSTITIAL_SINGLE_SECTION_MAX = 12;

/** Sections at most this weight may stack to balance a taller neighbor column. */
const STACKABLE_SECTION_MAX = INTERSTITIAL_SINGLE_SECTION_MAX;

/**
 * Spread sections across horizontal columns first (shortest column), so the page
 * uses width before any one column grows tall enough to scroll.
 */
export function packSectionsBalanceHorizontally<T>(
  items: readonly T[],
  _paneHeightPx: number,
  maxColumns: number,
  weightOf: (item: T) => number,
): readonly (readonly T[])[] {
  if (items.length === 0) {
    return [];
  }
  if (maxColumns <= 1) {
    return [items];
  }

  const columnCount = Math.min(maxColumns, items.length);
  if (columnCount <= 1) {
    return [items];
  }

  return packIndexSectionsIntoColumns(items, columnCount, weightOf);
}

/** Place each section into the shortest column (in DOM order). */
export function packIndexSectionsIntoColumns<T>(
  items: readonly T[],
  columnCount: number,
  weightOf: (item: T) => number,
): readonly (readonly T[])[] {
  if (items.length === 0) {
    return [];
  }
  if (columnCount <= 1) {
    return [items];
  }

  const columns: T[][] = Array.from({ length: columnCount }, () => []);
  const heights = Array<number>(columnCount).fill(0);
  let previousColumn: number | null = null;
  let previousWeight = 0;

  for (const item of items) {
    const weight = weightOf(item);
    let target: number;
    const hasEmptyColumn =
      columnCount >= 3 &&
      heights.some((h, index) => index !== previousColumn && h === 0);

    if (
      previousColumn !== null &&
      weight <= STACKABLE_SECTION_MAX &&
      previousWeight <= SHORT_SECTION_STACK_THRESHOLD &&
      !hasEmptyColumn
    ) {
      target = previousColumn;
    } else {
      target = 0;
      for (let col = 1; col < columnCount; col += 1) {
        if (heights[col]! < heights[target]!) {
          target = col;
        }
      }
    }
    columns[target]!.push(item);
    heights[target]! += weight;
    previousColumn = target;
    previousWeight = weight;
  }

  return columns;
}

/** One section per track when every section fits without stacking (subject hubs). */
export function assignSectionsOnePerColumnWhenFits<T>(
  items: readonly T[],
  columnCount: number,
): readonly (readonly T[])[] | null {
  if (columnCount < 2 || items.length === 0 || items.length > columnCount) {
    return null;
  }
  return items.map((item) => [item]);
}

/**
 * When `columnCount + 1` sections fit in `columnCount` tracks, keep the first and
 * last in their own columns and stack the middle group (Core on lg: A | S+WP | B).
 */
export function spreadSectionsAcrossViewportColumns<T>(
  items: readonly T[],
  columnCount: number,
): readonly (readonly T[])[] | null {
  if (columnCount < 2 || items.length !== columnCount + 1) {
    return null;
  }
  return [[items[0]!], items.slice(1, -1), [items[items.length - 1]!]];
}

/**
 * Two-column index: when the first track is one tall section and the second is a
 * pile of shorter sections, stack the middle sections in column one and leave the
 * lightest section in column two (Core: Accessibility + Security + Work Principles | Browser).
 */
export function stackCompactSectionsUnderPrimaryColumn<T>(
  columns: readonly (readonly T[])[],
  weightOf: (item: T) => number,
): readonly (readonly T[])[] {
  const active = columns.filter((column) => column.length > 0);
  if (active.length !== 2) {
    return columns;
  }
  const left = active[0]!;
  const right = active[1]!;
  if (left.length !== 1 || right.length < 2) {
    return columns;
  }
  const leftWeight = weightOf(left[0]!);
  const rightWeight = right.reduce((sum, item) => sum + weightOf(item), 0);
  if (leftWeight >= rightWeight) {
    return columns;
  }
  const tail = right[right.length - 1]!;
  const middle = right.slice(0, -1);
  if (middle.length === 0) {
    return columns;
  }
  return [[...left, ...middle], [tail], ...columns.slice(2)];
}

/**
 * When three columns are used and the last holds one short section, move it
 * between the first and second stacks (e.g. Core: Accessibility | Browser | Security…).
 */
export function applyInterstitialMiddleColumn<T>(
  columns: readonly (readonly T[])[],
  weightOf: (item: T) => number,
): readonly (readonly T[])[] {
  if (columns.length !== 3) {
    return columns;
  }
  const left = columns[0];
  const middle = columns[1];
  const right = columns[2];
  if (!left?.length || !middle?.length || right?.length !== 1) {
    return columns;
  }
  const lone = right[0]!;
  if (weightOf(lone) > INTERSTITIAL_SINGLE_SECTION_MAX) {
    return columns;
  }
  const leftWeight = left.reduce((sum, item) => sum + weightOf(item), 0);
  const middleWeight = middle.reduce((sum, item) => sum + weightOf(item), 0);
  if (leftWeight <= middleWeight) {
    return columns;
  }
  return [left, [lone], middle];
}

/**
 * When the third column holds a single short section, stack it on the middle
 * column instead of leaving an almost-empty track (Core: Browser under Security).
 */
export function collapseLoneTailColumn<T>(
  columns: readonly (readonly T[])[],
  weightOf: (item: T) => number,
): readonly (readonly T[])[] {
  if (columns.length !== 3) {
    return columns;
  }
  const left = columns[0];
  const middle = columns[1];
  const right = columns[2];
  if (!left?.length || !middle?.length || right?.length !== 1) {
    return columns;
  }
  const lone = right[0]!;
  if (weightOf(lone) > INTERSTITIAL_SINGLE_SECTION_MAX) {
    return columns;
  }
  const leftWeight = left.reduce((sum, item) => sum + weightOf(item), 0);
  const middleWeight = middle.reduce((sum, item) => sum + weightOf(item), 0);
  if (leftWeight >= middleWeight) {
    return [left, [...middle, lone], []];
  }
  return columns;
}
