"use client";

import Link from "next/link";
import {
  conceptIndexSectionListLayoutClass,
  conceptIndexSectionListSplitStyle,
} from "@/lib/catalog/conceptIndexSectionListSplit";
import {
  CONCEPT_GROUP_SECTION_INSET,
  CONCEPT_INDEX_GROUP_HEADING,
  CONCEPT_INDEX_HEADING_LINK,
} from "@/components/topic/conceptIndexStyles";
import { BrowseCardCell } from "./BrowseCardCell";
import type { CardItem } from "./CardGrid";

type ConceptIndexBlock = {
  readonly heading?: CardItem;
  readonly items: readonly CardItem[];
};

function partitionConceptIndexItems(
  items: readonly CardItem[],
): readonly ConceptIndexBlock[] {
  const blocks: ConceptIndexBlock[] = [];
  let index = 0;

  const leading: CardItem[] = [];
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
    const groupItems: CardItem[] = [];
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

function ConceptIndexItemList({
  items,
}: {
  readonly items: readonly CardItem[];
}) {
  if (items.length === 0) {
    return null;
  }

  const listClass =
    `list-none ${conceptIndexSectionListLayoutClass(items.length)}`.trim();
  const listStyle = conceptIndexSectionListSplitStyle(items.length);

  return (
    <ul className={listClass} style={listStyle}>
      {items.map((item) => (
        <BrowseCardCell key={item.href} item={item} variant="concept-index" />
      ))}
    </ul>
  );
}

/** Concept-index cluster lists (viewport columns handle flow on track hubs). */
export function ConceptIndexCardGrid({
  items,
}: {
  readonly items: readonly CardItem[];
}) {
  if (items.length === 0) {
    return null;
  }

  const hasGroupHeadings = items.some(
    (item) => item.indexRowKind === "group-heading",
  );
  if (!hasGroupHeadings) {
    return <ConceptIndexItemList items={items} />;
  }

  const blocks = partitionConceptIndexItems(items);

  return (
    <div className="space-y-4">
      {blocks.map((block) => {
        const blockKey =
          block.heading?.href ?? block.items[0]?.href ?? "leading";
        return (
          <div
            key={blockKey}
            className="concept-index-topic-group-block min-w-0 space-y-2"
          >
            {block.heading ? (
              <h3
                className={`${CONCEPT_INDEX_GROUP_HEADING} ${CONCEPT_GROUP_SECTION_INSET} scroll-mt-24`}
              >
                <Link
                  href={block.heading.href}
                  className={CONCEPT_INDEX_HEADING_LINK}
                >
                  {block.heading.title}
                </Link>
              </h3>
            ) : null}
            <ConceptIndexItemList items={block.items} />
          </div>
        );
      })}
    </div>
  );
}
