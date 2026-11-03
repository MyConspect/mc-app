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
