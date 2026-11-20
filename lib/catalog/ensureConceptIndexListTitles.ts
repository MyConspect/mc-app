import type { BrowseCard } from "./index";

export type EnsureConceptIndexListTitlesOptions = {
  /** Title for concept rows that appear before the first `group-heading`. */
  readonly leadingGroupTitle?: string;
  readonly leadingGroupHref?: string;
  /**
   * When the section has no visible cluster `h2`, wrap a flat list under one
   * `group-heading` (rendered as topic-group `h3`).
   */
  readonly wrapFlatListTitle?: string;
  readonly wrapFlatListHref?: string;
  /** Cluster / subject `h2` is already shown above the list. */
  readonly sectionHeadingVisible?: boolean;
};

function isGroupHeading(item: BrowseCard): boolean {
  return item.indexRowKind === "group-heading";
}

/**
 * Ensures every concept-index bullet list has a title row (`group-heading` → h3)
 * or relies on {@link EnsureConceptIndexListTitlesOptions.sectionHeadingVisible}.
 */
export function ensureConceptIndexListTitles(
  items: readonly BrowseCard[],
  options?: EnsureConceptIndexListTitlesOptions,
): readonly BrowseCard[] {
  if (items.length === 0) {
    return items;
  }

  const hasGroupHeading = items.some(isGroupHeading);
  const firstIsGroupHeading = isGroupHeading(items[0]);

  if (
    hasGroupHeading &&
    !firstIsGroupHeading &&
    options?.leadingGroupTitle?.trim()
  ) {
    const title = options.leadingGroupTitle.trim();
    const href = options.leadingGroupHref ?? items[0]?.href ?? "#";
    return [
      {
        href,
        title,
        description: "",
        indexRowKind: "group-heading",
      },
      ...items,
    ];
  }

  if (
    !hasGroupHeading &&
    !options?.sectionHeadingVisible &&
    options?.wrapFlatListTitle?.trim()
  ) {
    const title = options.wrapFlatListTitle.trim();
    const href = options.wrapFlatListHref ?? items[0]?.href ?? "#";
    return [
      {
        href,
        title,
        description: "",
        indexRowKind: "group-heading",
      },
      ...items,
    ];
  }

  return items;
}