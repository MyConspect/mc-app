import type { NavCluster } from "@/lib/nav";

/** Row `padding-left` ladder (px): 8 → 11 → 15 → 17 (`docs/sidebar-nest-step-ladder-8-14.prompt.md`). */
export const NAV_NEST_STEP_1 = "pl-2";
export const NAV_NEST_STEP_2 = "pl-[11px]";
export const NAV_NEST_STEP_3 = "pl-[15px]";
export const NAV_NEST_STEP_4 = "pl-[17px]";

export type NavNestStep = 1 | 2 | 3 | 4;

export function navRowNestStepClass(step: NavNestStep): string {
  switch (step) {
    case 1:
      return NAV_NEST_STEP_1;
    case 2:
      return NAV_NEST_STEP_2;
    case 3:
      return NAV_NEST_STEP_3;
    case 4:
      return NAV_NEST_STEP_4;
    default: {
      const _exhaustive: never = step;
      return _exhaustive;
    }
  }
}

/** Children under an expanded track header (yellow left rail). */
export const NAV_TRACK_CHILD_LIST_CLASS =
  "mt-1.5 ml-1.5 space-y-0.5 border-l-2 border-yellow-200 pl-2 dark:border-yellow-800";

/** Expanded track without route path (browse another track while URL stays put). */
export const NAV_TRACK_CHILD_DRILL_LIST_CLASS =
  "mt-1.5 ml-1.5 space-y-0.5 border-l-2 border-zinc-200 pl-2 dark:border-zinc-700";

export function trackChildListClass(pathChromeActive: boolean): string {
  return pathChromeActive
    ? NAV_TRACK_CHILD_LIST_CLASS
    : NAV_TRACK_CHILD_DRILL_LIST_CLASS;
}

/** Horizontal inset shared by track rail and multi-topic child lists. */
export const NAV_NEST_CHILD_RAIL_INSET_CLASS = "ml-1.5 pl-2";

/** Extra inset for topic rows under a multi-topic cluster (NoSQL, Brokers) — no border rail. */
export const NAV_MULTI_TOPIC_CHILD_LIST_CLASS = `mt-1.5 ${NAV_NEST_CHILD_RAIL_INSET_CLASS}`;

export const SECTION_TOPIC_INDENT = NAV_NEST_STEP_2;
export const SECTION_TOPIC_CONCEPT_INDENT = NAV_NEST_STEP_3;

/**
 * First row inside the track child rail — matches expanded subject (System design):
 * track `ul` already has `pl-2`; no extra row `pl-*`.
 */
export const NAV_SUBJECT_CHILD_INDENT = "";

/** Section / concept-group folds directly under a subject-child row. */
export const NAV_FOLD_CHILD_INDENT = NAV_NEST_STEP_2;

/** Concept links under an expanded fold (Foundations → overview, HR → TMAY). */
export const NAV_CONCEPT_UNDER_FOLD_INDENT = NAV_NEST_STEP_3;

/** Nested cluster rows under another cluster header (step 3). */
export const NAV_CLUSTER_DEEPER_INDENT = NAV_NEST_STEP_3;

/** Deepest concept row under an already-nested fold (step 4). */
export const NAV_CONCEPT_DEEPEST_INDENT = NAV_NEST_STEP_4;

export type NavConceptTreeIndents = {
  readonly group: string;
  readonly concept: string;
};

export type NavConceptTreeIndentOptions = {
  /**
   * First sidebar rows live directly under the track child rail (no subject/cluster
   * pill above them) — e.g. interviews leaf track, Intro-style subject siblings.
   */
  readonly firstRowUnderTrackRail?: boolean;
};

/** Indents for concept groups + links under a compact/topic row at `parentRowIndent`. */
/** Flat concept list under track rail (no `##` groups) vs nested under a topic fold. */
export function flatConceptListIndent(
  trackRailStepOne: boolean,
  groupIndent: string,
  leafIndent: string,
): string {
  return trackRailStepOne ? groupIndent : leafIndent;
}

export function navConceptTreeIndents(
  parentRowIndent: string,
  options: NavConceptTreeIndentOptions = {},
): NavConceptTreeIndents {
  if (
    parentRowIndent === NAV_SUBJECT_CHILD_INDENT &&
    options.firstRowUnderTrackRail
  ) {
    return {
      group: NAV_SUBJECT_CHILD_INDENT,
      concept: NAV_FOLD_CHILD_INDENT,
    };
  }
  if (parentRowIndent === NAV_SUBJECT_CHILD_INDENT) {
    return {
      group: NAV_FOLD_CHILD_INDENT,
      concept: NAV_CONCEPT_UNDER_FOLD_INDENT,
    };
  }
  if (parentRowIndent === NAV_NEST_STEP_2) {
    return {
      group: NAV_NEST_STEP_3,
      /** Flat concepts under a step-2 row (Intro → Merge sort). */
      concept: NAV_NEST_STEP_3,
    };
  }
  return {
    group: NAV_NEST_STEP_3,
    concept: NAV_NEST_STEP_3,
  };
}

/** Concept links nested under a `##` group header at `groupIndent`. */
export function conceptIndentBelowGroupHeader(groupIndent: string): string {
  switch (groupIndent) {
    case NAV_SUBJECT_CHILD_INDENT:
    case NAV_NEST_STEP_1:
      return NAV_FOLD_CHILD_INDENT;
    case NAV_FOLD_CHILD_INDENT:
    case NAV_NEST_STEP_2:
      return NAV_CONCEPT_UNDER_FOLD_INDENT;
    case NAV_NEST_STEP_3:
      return NAV_NEST_STEP_4;
    case NAV_NEST_STEP_4:
      return NAV_NEST_STEP_4;
    default:
      return NAV_CONCEPT_DEEPEST_INDENT;
  }
}

export function clusterHasMultiTopicChildren(cluster: NavCluster): boolean {
  return cluster.topics.length > 1;
}

/** Split path only — hash sections on the subject hub stay step 1; topic URLs step 2. */
function navPathBase(href: string): string {
  return href.split("#")[0] ?? href;
}

/**
 * Cluster row under an expanded subject: navigates to the subject hub (hash section)
 * → step 1 (`Architecture` on system-design); separate topic URL → step 2 (`Hash & heap`).
 */
export function clusterRowNestIndent(
  navigateHref: string,
  subjectHref: string,
): string {
  if (navPathBase(navigateHref) === navPathBase(subjectHref)) {
    return NAV_SUBJECT_CHILD_INDENT;
  }
  return NAV_FOLD_CHILD_INDENT;
}

export function clusterChildTopicNestIndent(
  cluster: NavCluster,
): string | undefined {
  return clusterHasMultiTopicChildren(cluster)
    ? NAV_FOLD_CHILD_INDENT
    : undefined;
}