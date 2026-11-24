import type { ConceptOutline } from "@/lib/parse";

export const DATABASE_NOSQL_CORE_SLUG = "database-nosql-core";
export const DATABASE_NOSQL_CORE_FILE = "9_database_nosql_core.md";

/** Extra sidebar folds on Intro (title-twin topic) — study notes stay flat under Intro. */
const REDUNDANT_INTRO_GROUPS = /^(intro|nosql\s+foundations)$/i;

export function isDatabaseNosqlCoreSlug(slug: string): boolean {
  return slug === DATABASE_NOSQL_CORE_SLUG;
}

export function withDatabaseNosqlCoreConceptGroups<
  T extends Pick<ConceptOutline, "group">,
>(outline: readonly T[]): T[] {
  return outline.map((entry) => {
    const group = entry.group?.trim();
    if (group && REDUNDANT_INTRO_GROUPS.test(group)) {
      const { group: _omit, ...rest } = entry;
      return rest as T;
    }
    return entry;
  });
}

/** Lift study notes out of legacy Intro → NoSQL foundations wrappers. */
export function normalizeNosqlCoreMarkdown(
  file: string,
  markdown: string,
): string {
  if (file !== DATABASE_NOSQL_CORE_FILE) {
    return markdown;
  }
  let next = markdown.replace(/^##\s+NoSQL foundations\s*$/gim, "");
  const pattern =
    /<details>\s*<summary>\s*NoSQL foundations\s*<\/summary>\s*([\s\S]*?)<\/details>/gi;
  next = next.replace(pattern, "$1");
  return next;
}