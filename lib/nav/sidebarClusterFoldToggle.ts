import { isConceptGroupSectionId } from "./conceptGroupSection";

/**
 * Subject-hub cluster rows (catalog clusters, not `#concept-group-*` leaves).
 * Used for toggle state — concept-group sections follow topic-page rules instead.
 */
export function clusterFoldOpenForClusterRow(
  openClusterKey: string | null,
  foldKey: string,
  clusterDomId: string,
): boolean {
  return (
    openClusterKey === foldKey && !isConceptGroupSectionId(clusterDomId)
  );
}

export type SidebarClusterFoldClick = {
  readonly clusterKey: string | null;
  readonly closing: boolean;
  /**
   * `""` clears the hash; `"#id"` sets it; `null` leaves the hash unchanged.
   */
  readonly replaceHashWith: string | null;
};

export type SubjectHubClusterFoldOptions = {
  /** CS-style hub section with inline concepts under the cluster row. */
  readonly hubSectionConceptsMode?: boolean;
  readonly sectionConceptsOpen?: boolean;
  /** Hash or child selection already shows the row expanded — used when `clusterKey` lags URL sync. */
  readonly foldVisuallyOpen?: boolean;
};

/** Expandable cluster row on a subject hub (`pathname === subjectPath`). */
export function subjectHubClusterFoldClick(
  openClusterKey: string | null,
  foldKey: string,
  clusterDomId: string,
  hashFragment: string,
  sameHash: boolean,
  _active: boolean,
  options: SubjectHubClusterFoldOptions = {},
): SidebarClusterFoldClick {
  /** Markdown `##` groups on a subject hub: sidebar fold only — no hub hash jump. */
  if (isConceptGroupSectionId(clusterDomId)) {
    const foldOpen = options.foldVisuallyOpen ?? openClusterKey === foldKey;
    const closing = foldOpen;
    return {
      clusterKey: closing ? null : foldKey,
      closing,
      replaceHashWith: null,
    };
  }
  const foldOpen =
    options.foldVisuallyOpen ??
    clusterFoldOpenForClusterRow(openClusterKey, foldKey, clusterDomId);
  const closing = foldOpen;

  let replaceHashWith: string | null = null;
  if (closing) {
    replaceHashWith = "";
  } else if (!sameHash) {
    replaceHashWith = hashFragment;
  }

  return {
    clusterKey: closing ? null : foldKey,
    closing,
    replaceHashWith,
  };
}

/** Cluster / concept-group row on a topic URL (not the subject hub). */
export function topicPageClusterFoldClick(
  openClusterKey: string | null,
  foldKey: string,
  hashFragment: string,
  sameHash: boolean,
  _active: boolean,
  foldVisuallyOpen?: boolean,
): SidebarClusterFoldClick {
  const foldOpen = foldVisuallyOpen ?? openClusterKey === foldKey;
  const closing = foldOpen;

  let replaceHashWith: string | null = null;
  if (closing) {
    replaceHashWith = "";
  } else if (!sameHash) {
    replaceHashWith = hashFragment;
  }

  return {
    clusterKey: closing ? null : foldKey,
    closing,
    replaceHashWith,
  };
}

/** Leaf cluster row when navigation would leave the current subject context. */
export function offHubClusterFoldCollapse(
  openClusterKey: string | null,
  foldKey: string,
): boolean {
  return openClusterKey === foldKey;
}

/** Topic concept accordion — `topicHref` in scoped fold state (Conspect + Interviews). */
export function topicConceptFoldClick(
  openTopicHref: string | null,
  topicHref: string,
  foldVisuallyOpen?: boolean,
): { readonly topicHref: string | null; readonly closing: boolean } {
  const foldOpen = foldVisuallyOpen ?? openTopicHref === topicHref;
  return {
    topicHref: foldOpen ? null : topicHref,
    closing: foldOpen,
  };
}

/** Persisted + hash cluster toggle — omit path-derived “looks open” (e.g. `topicMatchesPath`). */
export function clusterRowToggleOpen(
  openClusterKey: string | null,
  foldKey: string,
  options: {
    readonly active: boolean;
    readonly hubConceptActive: boolean;
    readonly nestedClusterFoldOpen: boolean;
    readonly clusterDomId: string;
  },
): boolean {
  const { active, hubConceptActive, nestedClusterFoldOpen, clusterDomId } =
    options;
  if (openClusterKey === foldKey) {
    return true;
  }
  if (isConceptGroupSectionId(clusterDomId)) {
    return active;
  }
  return active || hubConceptActive || nestedClusterFoldOpen;
}