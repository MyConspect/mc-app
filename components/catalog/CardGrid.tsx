import { BrowseCardCell } from "./BrowseCardCell";

export type CardItem = {
  readonly href: string;
  readonly title: string;
  readonly description: string;
  readonly id?: string;
};

export function CardGrid({ items }: { items: readonly CardItem[] }) {
  return (
    <ul className="grid gap-2 sm:grid-cols-2 sm:gap-4">
      {items.map((item) => (
        <BrowseCardCell key={item.href} item={item} />
      ))}
    </ul>
  );
}
