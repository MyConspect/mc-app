/** Same hover as handbook link/bookmark icons (light grey pill on yellow toolbar). */
export const CONCEPT_DETAIL_TOOLBAR_ICON =
  "concept-detail-toolbar-icon inline-flex shrink-0 touch-manipulation cursor-pointer items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400/60 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 dark:focus-visible:ring-zinc-500/40";

export function conceptDetailToolbarIconSize(size: "md" | "lg" = "md"): string {
  return size === "lg" ? "size-9" : "size-7";
}
