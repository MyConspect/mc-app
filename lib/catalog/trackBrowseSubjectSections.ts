import type { SubjectClusterSection } from "./clusterConceptIndex";
import { flatNavGroupBrowseCards } from "./flatNavGroupSection";
import { subjectHref, type BrowseCard, type Subject } from "./index";

function isRichTrackBrowseSection(section: SubjectClusterSection): boolean {
  return section.items.length > 1;
}

/** Multi-subject track hub: cluster title when set, else topic rows (flatNav / `title: ""`). */
function trackHubClusterLinkItems(
  sections: readonly SubjectClusterSection[],
): readonly BrowseCard[] {
  return sections.flatMap((section) => {
    const clusterTitle = section.cluster.title.trim();
    if (clusterTitle.length > 0) {
      return [sparseSectionBrowseCard(section)];
    }
    return section.items.filter((item) => item.title.trim().length > 0);
  });
}

function sparseSectionBrowseCard(section: SubjectClusterSection): BrowseCard {
  if (section.items.length === 1) {
    return section.items[0];
  }
  const clusterTitle = section.cluster.title.trim();
  if (clusterTitle.length > 0) {
    const href =
      section.headingHref ?? section.items[0]?.href ?? `#${section.cluster.id}`;
    return {
      href,
      title: clusterTitle,
      description: "",
    };
  }
  const href =
    section.headingHref ?? section.items[0]?.href ?? `#${section.cluster.id}`;
  return {
    href,
    title: section.cluster.title,
    description: "",
  };
}

/** Flattened cluster-title lists on multi-subject track hubs (`*-track-topics`). */
export function isMergedTrackTopicListSection(
  section: SubjectClusterSection,
): boolean {
  return section.cluster.id.endsWith("-track-topics");
}

export type NormalizeTrackBrowseSectionsOptions = {
  /**
   * Track hubs (Advanced gold): list cluster / section names only — never
   * grandchild topic rows on `/{track}`.
   */
  readonly clusterLinksOnly?: boolean;
  /** Required when `clusterLinksOnly` and subject has `flatNav` catalog sections. */
  readonly subject?: Subject;
  readonly locale?: "en" | "ru";
};

function collapseFlatNavSectionsForTrackHub(
  subject: Subject,
  sections: readonly SubjectClusterSection[],
  locale: "en" | "ru",
): readonly SubjectClusterSection[] {
  const flatNavSections =
    subject.sections?.filter((item) => item.flatNav) ?? [];
  if (flatNavSections.length === 0) {
    return sections;
  }
  const flatIds = new Set(flatNavSections.map((item) => item.id));
  const primary: SubjectClusterSection[] = [];
  const buckets = new Map<string, SubjectClusterSection[]>();

  for (const section of sections) {
    const sectionId = section.cluster.section;
    if (sectionId && flatIds.has(sectionId)) {
      const bucket = buckets.get(sectionId) ?? [];
      bucket.push(section);
      buckets.set(sectionId, bucket);
    } else {
      primary.push(section);
    }
  }

  const hub = subjectHref(subject);
  const grouped: SubjectClusterSection[] = [];
  for (const spec of flatNavSections) {
    const bucket = buckets.get(spec.id);
    if (!bucket?.length) {
      continue;
    }
    const hashHref = `/${locale}${hub}#${spec.id}`;
    grouped.push({
      cluster: { id: spec.id, title: spec.title, blurb: "" },
      headingHref: hashHref,
      items: [
        {
          href: hashHref,
          title: spec.title,
          description: "",
        },
      ],
    });
  }

  return [...primary, ...grouped];
}

/**
 * Track hub index: lone cluster headings (title-twin expansion with no concepts)
 * become one bullet list under the subject title — same pattern as flatNav groups.
 */
export function normalizeTrackBrowseSections(
  subjectSlug: string,
  sections: readonly SubjectClusterSection[],
  options: NormalizeTrackBrowseSectionsOptions = {},
): readonly SubjectClusterSection[] {
  if (sections.length === 0) {
    return sections;
  }

  if (options.clusterLinksOnly) {
    const collapsed =
      options.subject && options.locale
        ? collapseFlatNavSectionsForTrackHub(
            options.subject,
            sections,
            options.locale,
          )
        : sections;
    const items = trackHubClusterLinkItems(collapsed);
    return [
      {
        cluster: {
          id: `${subjectSlug}-track-topics`,
          title: "",
          blurb: "",
        },
        items,
      },
    ];
  }

  const sparse: SubjectClusterSection[] = [];
  const rich: SubjectClusterSection[] = [];

  for (const section of sections) {
    if (isRichTrackBrowseSection(section)) {
      rich.push(section);
    } else {
      sparse.push(section);
    }
  }

  if (sparse.length === 0) {
    return sections;
  }

  const mergedSparse: SubjectClusterSection = {
    cluster: {
      id: `${subjectSlug}-track-topics`,
      title: "",
      blurb: "",
    },
    items: flatNavGroupBrowseCards(sparse),
  };

  return [mergedSparse, ...rich];
}
