import Link from "next/link";
import type { BrowseCard } from "@/lib/catalog";
import {
  CONCEPT_GROUP_SECTION_INSET,
  CONCEPT_INDEX_CLUSTER_SECTION,
  CONCEPT_INDEX_GROUP_HEADING,
  CONCEPT_INDEX_HEADING_LINK,
} from "@/components/topic/conceptIndexStyles";
import { CardGrid } from "./CardGrid";

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
          {heading.title}
        </Link>
      </h3>
      {items.length > 0 ? (
        <div className="mt-1.5">
          <CardGrid items={items} variant="concept-index" />
        </div>
      ) : null}
    </section>
  );
}