/** Core browser platform topic (`core-browser-platform`) — handbook section groups. */
export const CORE_BROWSER_TOPIC_SLUG = "core-browser-platform";

/** Section title → concept `<summary>` titles in handbook order. */
export const CORE_BROWSER_TOPIC_SECTIONS: readonly {
  readonly section: string;
  readonly concepts: readonly string[];
}[] = [
  {
    section: "Work Principles",
    concepts: [
      "Work Principles",
      "Navigation and fetching",
      "HTML parsing and the DOM",
      "CSSOM and style computation",
      "Layout, paint, and compositing",
      "JavaScript engine and main thread",
      "Event loop and task queues",
      "Multi-process architecture",
      "Sandbox and same-origin policy",
    ],
  },
  {
    section: "Browser platform",
    concepts: [
      "Browser platform architecture",
      "Web platform stack (HTML, CSS, JavaScript)",
      "Security model overview",
      "Critical rendering path (detailed stages)",
      "Browser environment (JavaScript host)",
    ],
  },
];

const titleToSection = new Map<string, string>(
  CORE_BROWSER_TOPIC_SECTIONS.flatMap(({ section, concepts }) =>
    concepts.map((title) => [title, section]),
  ),
);

export function isCoreBrowserTopicSlug(slug: string): boolean {
  return slug === CORE_BROWSER_TOPIC_SLUG;
}

export function coreBrowserConceptSection(title: string): string | undefined {
  return titleToSection.get(title);
}

export function withCoreBrowserConceptGroups<
  T extends { readonly title: string },
>(items: readonly T[]): (T & { group?: string })[] {
  return items.map((item) => {
    const group = coreBrowserConceptSection(item.title);
    return group ? { ...item, group } : item;
  });
}
