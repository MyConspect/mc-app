import Link from "next/link";
import { SearchHighlightedText } from "@/components/search";
import type { BrowseCard } from "@/lib/catalog";
import {
  CONCEPT_GROUP_SECTION_INSET,
  CONCEPT_INDEX_CLUSTER_SECTION,
  CONCEPT_INDEX_GROUP_HEADING,
  CONCEPT_INDEX_HEADING_LINK,
  CONCEPT_INDEX_HEADING_TO_LIST,
} from "@/components/topic/conceptIndexStyles";
import { ConceptIndexCardGrid } from "./ConceptIndexCardGrid";

const TOPIC_GROUP_INNER_LEADING_TITLE = "Overview";

export function ClusterTopicGroupIndexSection({
  heading,
  items,
}: {
  readonly heading: BrowseCard;
  readonly items: readonly BrowseCard[];
}) {
  return (
    <section className={CONCEPT_INDEX_CLUSTER_SECTION}>
      <h3
        className={`${CONCEPT_INDEX_GROUP_HEADING} ${CONCEPT_GROUP_SECTION_INSET} scroll-mt-24`}
      >
        <Link href={heading.href} className={CONCEPT_INDEX_HEADING_LINK}>
          <SearchHighlightedText text={heading.title} />
        </Link>
      </h3>
      {items.length > 0 ? (
        <div className={CONCEPT_INDEX_HEADING_TO_LIST}>
          <ConceptIndexCardGrid
            items={items}
            sectionHeadingVisible
            leadingGroupTitle={
              items.some((item) => item.indexRowKind === "group-heading")
                ? TOPIC_GROUP_INNER_LEADING_TITLE
                : heading.title
            }
          />
        </div>
      ) : null}
    </section>
  );
}