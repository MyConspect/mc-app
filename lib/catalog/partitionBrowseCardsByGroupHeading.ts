import type { BrowseCard } from "./index";

export type BrowseCardGroupBlock = {
  readonly heading?: BrowseCard;
  readonly items: readonly BrowseCard[];
};

/** Split cluster browse rows into topic group blocks (`indexRowKind: group-heading`). */
export function partitionBrowseCardsByGroupHeading(
  items: readonly BrowseCard[],
): readonly BrowseCardGroupBlock[] {
  const blocks: BrowseCardGroupBlock[] = [];
  let index = 0;

  const leading: BrowseCard[] = [];
  while (
    index < items.length &&
    items[index].indexRowKind !== "group-heading"
  ) {
    leading.push(items[index]);
    index += 1;
  }
  if (leading.length > 0) {
    blocks.push({ items: leading });
  }

  while (index < items.length) {
    const heading = items[index];
    if (heading.indexRowKind !== "group-heading") {
      index += 1;
      continue;
    }
    index += 1;
    const groupItems: BrowseCard[] = [];
    while (
      index < items.length &&
      items[index].indexRowKind !== "group-heading"
    ) {
      groupItems.push(items[index]);
      index += 1;
    }
    blocks.push({ heading, items: groupItems });
  }

  return blocks;
}

export function topicGroupHeadingCount(items: readonly BrowseCard[]): number {
  return items.filter((item) => item.indexRowKind === "group-heading").length;
}