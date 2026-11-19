import { BrowseCardCell } from "./BrowseCardCell";

export type CardItem = {
  readonly href: string;
  readonly title: string;
  readonly description: string;
  readonly id?: string;
  readonly indexRowKind?: "group-heading";
};

export type CardGridVariant = "catalog" | "concept-index";

export function CardGrid({
  items,
  variant = "catalog",
}: {
  items: readonly CardItem[];
  variant?: CardGridVariant;
}) {
  const visibleItems = items.filter((item) => item.title.trim().length > 0);
  if (visibleItems.length === 0) {
    return null;
  }
  const listClass =
    variant === "concept-index"
      ? "list-none"
      : "divide-y divide-zinc-200 dark:divide-zinc-800";

  return (
    <ul className={listClass}>
      {visibleItems.map((item) => (
        <BrowseCardCell key={item.href} item={item} variant={variant} />
      ))}
    </ul>
  );
}
