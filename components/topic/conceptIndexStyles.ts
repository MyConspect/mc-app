/** Shared layout for topic index rows and group section headers. */
export const CONCEPT_INDEX_ROW_INSET = "px-3";

/** Group title sits slightly left of index row padding (bullets stay at px-3). */
export const CONCEPT_GROUP_SECTION_INSET = "pl-1.5 pr-3";

/** Cluster / subject section title on concept-index hubs (parent of topic groups). */
export const CONCEPT_INDEX_SECTION_HEADING =
  "m-0 text-pretty text-xl font-semibold leading-snug tracking-tight text-zinc-900 dark:text-zinc-50";

/**
 * Gap from section heading (h2/h3) to the first bullet row.
 * Required on all concept-index sections — see handbook-index-layout.mdc.
 */
export const CONCEPT_INDEX_HEADING_TO_LIST = "mt-1.5";

/** Topic group title inside a cluster section (e.g. Styles under Architecture). */
export const CONCEPT_INDEX_GROUP_HEADING =
  "m-0 text-pretty text-lg font-semibold leading-snug tracking-tight text-zinc-800 dark:text-zinc-100";

/** Cluster / subject titles on concept-index browse grids. */
export const CONCEPT_INDEX_HEADING_LINK =
  "concept-index-heading-link rounded-sm hover:text-yellow-500 hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400/60 dark:focus-visible:ring-zinc-500/40 dark:hover:text-yellow-300";

export const CONCEPT_INDEX_ROW_GAP = "gap-2";

export const CONCEPT_INDEX_DOT =
  "size-1.5 shrink-0 rounded-full bg-zinc-400 dark:bg-zinc-500";

export const CONCEPT_INDEX_DOT_INTERACTIVE = `${CONCEPT_INDEX_DOT} mt-2 shrink-0 transition-colors group-hover:bg-yellow-500 dark:group-hover:bg-yellow-300`;

export const CONCEPT_INDEX_ROW = "group";

export const CONCEPT_INDEX_LINK = `concept-index-link flex touch-manipulation cursor-pointer items-start ${CONCEPT_INDEX_ROW_GAP} ${CONCEPT_INDEX_ROW_INSET} py-1 text-left text-base font-medium leading-snug text-zinc-700 transition-colors hover:text-yellow-500 hover:no-underline group-hover:text-yellow-500 dark:text-zinc-400 dark:hover:text-yellow-300 dark:group-hover:text-yellow-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400/60 dark:focus-visible:ring-zinc-500/40`;

/**
 * Row-major grid for uniform sections. Column track sizes live in
 * {@code .concept-index-sections-grid} (globals.css). Prefer
 * {@link CONCEPT_INDEX_BALANCED_LAYOUT_BASE} when section heights vary.
 */
export const CONCEPT_INDEX_SECTIONS_GRID =
  "concept-list-index concept-index-sections-grid grid w-full items-start justify-items-start gap-y-6 md:justify-start md:gap-x-5 md:gap-y-8 lg:justify-start lg:gap-x-5 lg:gap-y-8";

export {
  CONCEPT_INDEX_SECTION_LIST_SPLIT_MIN_ITEMS,
  conceptIndexSectionListLayoutClass,
} from "@/lib/catalog/conceptIndexSectionListSplit";

export const CONCEPT_INDEX_CLUSTER_SECTION =
  "concept-index-cluster-section min-w-0 w-full max-w-full scroll-mt-24";

/** Fills `main.handbook-subject-main` for pane measure + column flow. */
export const HANDBOOK_SUBJECT_INDEX_BODY =
  "handbook-subject-index-body min-h-0 min-w-0 w-full max-w-full flex-1 basis-0";

/**
 * Topic `h1` + in-pane scroll/multicol: section and list slot fill remaining main height.
 * Pair with `ConceptIndexPaneLayout` (not a bare `ConceptIndexList`).
 */
export const HANDBOOK_INDEX_PANE_SECTION = `${CONCEPT_INDEX_CLUSTER_SECTION} flex min-h-0 min-w-0 w-full flex-1 flex-col`;

/** Gap after topic `h1` (flex + scroll sizing lives in globals.css on the multicol root). */
export const HANDBOOK_INDEX_PANE_LIST_SLOT = CONCEPT_INDEX_HEADING_TO_LIST;

/**
 * Breadcrumb → first heading: `main` uses `pt-5` only (see page routes).
 * Cluster `h2` / topic `h1` stay `margin-top: 0` (globals.css).
 */
export const HANDBOOK_INDEX_MAIN_PAD =
  "px-4 pt-5 pb-10 sm:px-6";

/** Legacy grid packing (concept detail flows use pane columns above). */
export const CONCEPT_INDEX_BALANCED_LAYOUT_BASE =
  "concept-list-index handbook-subject-index-grid grid h-full min-h-0 w-full max-w-full flex-1 items-start justify-start gap-x-5 gap-y-8";

export const CONCEPT_INDEX_BALANCED_COLUMN =
  "flex h-full min-h-0 w-full min-w-0 flex-col gap-8";

/** Grows empty space at the column foot so tracks match pane height. */
export const CONCEPT_INDEX_BALANCED_COLUMN_FILL = "min-h-0 flex-1 shrink";
