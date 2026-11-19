import type { ReactNode } from "react";
import Link from "next/link";
import {
  CONCEPT_GROUP_SECTION_INSET,
  CONCEPT_INDEX_CLUSTER_SECTION,
  CONCEPT_INDEX_HEADING_LINK,
  CONCEPT_INDEX_SECTION_HEADING,
} from "@/components/topic/conceptIndexStyles";
import { ConceptIndexCardGrid } from "./ConceptIndexCardGrid";
import { CardGrid, type CardGridVariant } from "./CardGrid";
import {
  CATALOG_CLUSTER_HEADING,
  CATALOG_SECTION_SUMMARY,
} from "./catalogListStyles";
import type { BrowseCard } from "@/lib/catalog";
import { sameTitle } from "@/lib/nav/navUtils";
import {
  flatNavGroupBrowseCards,
  subjectClusterSectionForFlatNavGroup,
} from "@/lib/catalog/flatNavGroupSection";

type ClusterSection = {
  readonly cluster: {
    readonly id: string;
    readonly title: string;
    readonly blurb: string;
  };
  readonly items: readonly BrowseCard[];
  readonly headingHref?: string;
};

function isCompactSectionList(sections: readonly ClusterSection[]) {
  return (
    sections.length > 0 &&
    sections.every((section) => section.items.length === 1)
  );
}

function compactSectionItems(sections: readonly ClusterSection[]) {
  return sections.map(({ cluster, items }) => ({
    ...items[0],
    id: cluster.id,
  }));
}

export function ClusterConceptIndexSection({
  section,
  suppressClusterHeading = false,
  subjectTitle,
}: {
  section: ClusterSection;
  suppressClusterHeading?: boolean;
  subjectTitle?: string;
}) {
  return multiItemSection(
    section,
    suppressClusterHeading,
    "concept-index",
    subjectTitle,
  );
}

function multiItemSection(
  { cluster, items, headingHref }: ClusterSection,
  suppressClusterHeading: boolean,
  browseListVariant: CardGridVariant,
  subjectTitle?: string,
) {
  const repeatsSubjectTitle = Boolean(
    subjectTitle && sameTitle(cluster.title, subjectTitle),
  );
  const showHeading =
    !suppressClusterHeading &&
    !repeatsSubjectTitle &&
    cluster.title.trim().length > 0;
  const conceptIndex = browseListVariant === "concept-index";
  const hasGroupHeadings = items.some(
    (item) => item.indexRowKind === "group-heading",
  );
  const headingClass = conceptIndex
    ? `${CONCEPT_INDEX_SECTION_HEADING} ${CONCEPT_GROUP_SECTION_INSET}`
    : CATALOG_CLUSTER_HEADING;
  const sectionClass = conceptIndex
    ? CONCEPT_INDEX_CLUSTER_SECTION
    : "min-w-0 w-full max-w-full scroll-mt-24";
  return (
    <section key={cluster.id} id={cluster.id} className={sectionClass}>
      {showHeading ? (
        <h2 className={headingClass}>
          {headingHref ? (
            <Link href={headingHref} className={CONCEPT_INDEX_HEADING_LINK}>
              {cluster.title}
            </Link>
          ) : (
            cluster.title
          )}
        </h2>
      ) : null}
      {items.length > 0 ? (
        <div
          className={
            showHeading
              ? conceptIndex
                ? hasGroupHeadings
                  ? "mt-3"
                  : "mt-1.5"
                : "mt-3"
              : undefined
          }
        >
          {conceptIndex && hasGroupHeadings ? (
            <ConceptIndexCardGrid items={items} />
          ) : (
            <CardGrid items={items} variant={browseListVariant} />
          )}
        </div>
      ) : null}
    </section>
  );
}

function ClusterBlocks({
  sections,
  suppressClusterHeadings = false,
  browseListVariant = "concept-index",
  embedInParentGrid = false,
  subjectTitle,
}: {
  sections: readonly ClusterSection[];
  suppressClusterHeadings?: boolean;
  browseListVariant?: CardGridVariant;
  embedInParentGrid?: boolean;
  subjectTitle?: string;
}) {
  if (
    !embedInParentGrid &&
    browseListVariant === "catalog" &&
    isCompactSectionList(sections)
  ) {
    return <CardGrid items={compactSectionItems(sections)} />;
  }

  const blocks: ReactNode[] = [];
  let singleBatch: ClusterSection[] = [];

  const flushSingleBatch = () => {
    if (singleBatch.length === 0) {
      return;
    }
    if (embedInParentGrid || browseListVariant === "concept-index") {
      for (const section of singleBatch) {
        blocks.push(
          multiItemSection(
            section,
            suppressClusterHeadings,
            browseListVariant,
            subjectTitle,
          ),
        );
      }
    } else {
      const batchKey = singleBatch
        .map((section) => section.cluster.id)
        .join("-");
      blocks.push(
        <CardGrid
          key={`singles-${batchKey}`}
          items={compactSectionItems(singleBatch)}
        />,
      );
    }
    singleBatch = [];
  };

  for (const section of sections) {
    if (
      !embedInParentGrid &&
      browseListVariant === "catalog" &&
      section.items.length === 1
    ) {
      singleBatch.push(section);
      continue;
    }
    flushSingleBatch();
    blocks.push(
      multiItemSection(
        section,
        suppressClusterHeadings,
        browseListVariant,
        subjectTitle,
      ),
    );
  }
  flushSingleBatch();

  return <>{blocks}</>;
}

export function ClusterCardSections({
  sections,
  groupedSections,
  rootSections,
  afterRootSections,
  suppressClusterHeadings = false,
  browseListVariant = "concept-index",
  embedInParentGrid = false,
  subjectTitle,
}: {
  sections?: readonly ClusterSection[];
  rootSections?: readonly ClusterSection[];
  afterRootSections?: readonly ClusterSection[];
  groupedSections?: readonly {
    readonly section: {
      readonly id: string;
      readonly title: string;
      readonly defaultOpen?: boolean;
      readonly flatNav?: boolean;
    };
    readonly clusters: readonly ClusterSection[];
  }[];
  suppressClusterHeadings?: boolean;
  browseListVariant?: CardGridVariant;
  embedInParentGrid?: boolean;
  subjectTitle?: string;
}) {
  const outerClass = embedInParentGrid
    ? "catalog-sections contents"
    : "catalog-sections space-y-8";

  if (
    groupedSections?.length ||
    rootSections?.length ||
    afterRootSections?.length
  ) {
    return (
      <div className={outerClass}>
        {rootSections?.length ? (
          <ClusterBlocks
            sections={rootSections}
            suppressClusterHeadings={suppressClusterHeadings}
            browseListVariant={browseListVariant}
            embedInParentGrid={embedInParentGrid}
            subjectTitle={subjectTitle}
          />
        ) : null}
        {groupedSections?.map(({ section, clusters }) => {
          if (section.flatNav && clusters.length > 0) {
            const flatSection = subjectClusterSectionForFlatNavGroup(
              section.id,
              section.title,
              clusters,
            );
            if (browseListVariant === "concept-index") {
              return (
                <ClusterConceptIndexSection
                  key={section.id}
                  section={flatSection}
                  subjectTitle={subjectTitle}
                />
              );
            }
            return (
              <section
                key={section.id}
                id={section.id}
                className="catalog-section min-w-0 w-full max-w-full scroll-mt-24"
              >
                <h2 className={CATALOG_CLUSTER_HEADING}>{section.title}</h2>
                <div className="mt-3">
                  <CardGrid
                    items={flatNavGroupBrowseCards(clusters)}
                    variant={browseListVariant}
                  />
                </div>
              </section>
            );
          }
          return (
            <details
              key={section.id}
              id={section.id}
              className="catalog-section scroll-mt-24"
              open={section.defaultOpen ?? true}
            >
              <summary className={CATALOG_SECTION_SUMMARY}>
                {section.title}
              </summary>
              <div className="space-y-8">
                {clusters.length === 0 ? (
                  <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                    No topics yet.
                  </p>
                ) : (
                  <ClusterBlocks
                    sections={clusters}
                    suppressClusterHeadings={suppressClusterHeadings}
                    browseListVariant={browseListVariant}
                    embedInParentGrid={embedInParentGrid}
                    subjectTitle={subjectTitle}
                  />
                )}
              </div>
            </details>
          );
        })}
        {afterRootSections?.length ? (
          <ClusterBlocks
            sections={afterRootSections}
            suppressClusterHeadings={suppressClusterHeadings}
            browseListVariant={browseListVariant}
            embedInParentGrid={embedInParentGrid}
            subjectTitle={subjectTitle}
          />
        ) : null}
      </div>
    );
  }

  const flatSections = sections ?? [];
  const compact =
    !embedInParentGrid &&
    browseListVariant === "catalog" &&
    isCompactSectionList(flatSections);

  return (
    <div
      className={
        embedInParentGrid ? "contents" : compact ? undefined : "space-y-8"
      }
    >
      <ClusterBlocks
        sections={flatSections}
        suppressClusterHeadings={suppressClusterHeadings}
        browseListVariant={browseListVariant}
        embedInParentGrid={embedInParentGrid}
        subjectTitle={subjectTitle}
      />
    </div>
  );
}
