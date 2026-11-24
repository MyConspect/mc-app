const LEADING_SECTION_ORDINAL = /^\d+\.\s*/;

/**
 * UI label for markdown `## N. Title` groups — strips the leading ordinal only.
 * Hashes and `conceptGroupSectionDomId` keep the full parser string.
 */
export function conceptGroupDisplayLabel(groupLabel: string): string {
  const trimmed = groupLabel.trim();
  const stripped = trimmed.replace(LEADING_SECTION_ORDINAL, "");
  return stripped.length > 0 ? stripped : trimmed;
}

import { sameTitle } from "./navUtils";

/** True when a markdown `##` group label repeats the topic (or ancestor) title in the sidebar. */
export function sidebarGroupRepeatsTopicLabel(
  groupLabel: string,
  topicTitle: string,
): boolean {
  const displayGroup = conceptGroupDisplayLabel(groupLabel);
  const displayTopic = conceptGroupDisplayLabel(topicTitle);
  return (
    sameTitle(groupLabel, topicTitle) ||
    sameTitle(displayGroup, topicTitle) ||
    sameTitle(displayGroup, displayTopic)
  );
}

/** DOM id for a concept list group heading (breadcrumb scroll target). */
export function conceptGroupSectionDomId(groupLabel: string): string {
  const slug = groupLabel
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug ? `concept-group-${slug}` : "concept-group";
}

export function isConceptGroupSectionId(id: string): boolean {
  return id === "concept-group" || id.startsWith("concept-group-");
}

export function findConceptGroupBySectionId<
  T extends { readonly label: string | null },
>(groups: readonly T[], sectionId: string): T | null {
  if (!isConceptGroupSectionId(sectionId)) {
    return null;
  }
  return (
    groups.find(
      (group) =>
        group.label != null &&
        conceptGroupSectionDomId(group.label) === sectionId,
    ) ?? null
  );
}
