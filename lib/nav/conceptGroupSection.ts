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
