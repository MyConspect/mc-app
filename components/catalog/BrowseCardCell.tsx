import Link from "next/link";
import {
  CONCEPT_INDEX_DOT_INTERACTIVE,
  CONCEPT_INDEX_LINK,
  CONCEPT_INDEX_ROW,
} from "@/components/topic/conceptIndexStyles";
import type { CardGridVariant } from "./CardGrid";
import type { CardItem } from "./CardGrid";
import { BROWSE_LIST_LINK, BROWSE_LIST_ROW } from "./catalogListStyles";

function ConceptIndexListRow({ item }: { item: CardItem }) {
  return (
    <li
      id={item.id}
      className={`${CONCEPT_INDEX_ROW}${item.id ? " scroll-mt-24" : ""}`}
    >
      <Link href={item.href} className={CONCEPT_INDEX_LINK}>
        <span aria-hidden="true" className={CONCEPT_INDEX_DOT_INTERACTIVE} />
        <span className="min-w-0 transition-colors group-hover:text-yellow-500 dark:group-hover:text-yellow-300">
          {item.title}
        </span>
      </Link>
    </li>
  );
}

export function BrowseCardCell({
  item,
  variant = "catalog",
}: {
  item: CardItem;
  variant?: CardGridVariant;
}) {
  if (variant === "concept-index") {
    return <ConceptIndexListRow item={item} />;
  }

  return (
    <li
      id={item.id}
      className={`${BROWSE_LIST_ROW}${item.id ? " scroll-mt-24" : ""}`}
    >
      <Link href={item.href} className={BROWSE_LIST_LINK}>
        {item.title}
      </Link>
    </li>
  );
}
