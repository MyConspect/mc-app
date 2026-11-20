import type { ConceptIndexBalancedEntry } from "@/components/topic/ConceptIndexBalancedLayout";
import { CONCEPT_INDEX_CLUSTER_SECTION } from "@/components/topic/conceptIndexStyles";
import type { BrowseCard } from "@/lib/catalog";
import { BrowseCardCell } from "./BrowseCardCell";

/** One packable row per card so newspaper columns can use horizontal tracks. */
export function buildFlatBrowseBalancedEntries(
  items: readonly BrowseCard[],
  keyPrefix = "browse",
): readonly ConceptIndexBalancedEntry[] {
  const visible = items.filter((item) => item.title.trim().length > 0);
  return visible.map((item) => ({
    key: `${keyPrefix}:${item.href}`,
    weight: 2,
    listItemCount: 1,
    node: (
      <section className={CONCEPT_INDEX_CLUSTER_SECTION}>
        <ul className="list-none">
          <BrowseCardCell item={item} variant="concept-index" />
        </ul>
      </section>
    ),
  }));
}