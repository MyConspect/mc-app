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
};

/** Expandable cluster row on a subject hub (`pathname === subjectPath`). */
export function subjectHubClusterFoldClick(
  openClusterKey: string | null,
  foldKey: string,
  clusterDomId: string,
  hashFragment: string,
  sameHash: boolean,
  active: boolean,
  options: SubjectHubClusterFoldOptions = {},
): SidebarClusterFoldClick {
  /** Markdown `##` groups on a subject hub: sidebar fold only — no hub hash jump. */
  if (isConceptGroupSectionId(clusterDomId)) {
    const foldOpen = openClusterKey === foldKey;
    const closing = foldOpen;
    return {
      clusterKey: closing ? null : foldKey,
      closing,
      replaceHashWith: null,
    };
  }
  const foldOpen = clusterFoldOpenForClusterRow(
    openClusterKey,
    foldKey,
    clusterDomId,
  );
  const hubSection =
    options.hubSectionConceptsMode === true &&
    options.sectionConceptsOpen === true &&
    sameHash;
  const closing = hubSection || (foldOpen && !options.hubSectionConceptsMode);

  let replaceHashWith: string | null = null;
  if (closing) {
    if (sameHash || active || options.sectionConceptsOpen === true) {
      replaceHashWith = "";
    }
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
  active: boolean,
): SidebarClusterFoldClick {
  const foldOpen = openClusterKey === foldKey;
  /** Close on repeat click only when the section hash is focused — not when a child concept is open. */
  const closing = foldOpen && (sameHash || active);

  let replaceHashWith: string | null = null;
  if (closing) {
    if (sameHash || active) {
      replaceHashWith = "";
    }
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