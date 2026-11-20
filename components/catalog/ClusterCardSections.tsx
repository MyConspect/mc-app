import type { ReactNode } from "react";
import Link from "next/link";
import { SearchHighlightedText } from "@/components/search";
import {
  CONCEPT_GROUP_SECTION_INSET,
  CONCEPT_INDEX_CLUSTER_SECTION,
  CONCEPT_INDEX_HEADING_LINK,
  CONCEPT_INDEX_HEADING_TO_LIST,
  CONCEPT_INDEX_SECTION_HEADING,
} from "@/components/topic/conceptIndexStyles";
import { ConceptIndexCardGrid } from "./ConceptIndexCardGrid";
import { CardGrid, type CardGridVariant } from "./CardGrid";
import {
  CATALOG_CLUSTER_HEADING,
  CATALOG_SECTION_SUMMARY,
} from "./catalogListStyles";
import type { BrowseCard } from "@/lib/catalog";
import { ensureConceptIndexListTitles } from "@/lib/catalog/ensureConceptIndexListTitles";
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
  omitSubjectTitleClusterHeading = true,
}: {
  section: ClusterSection;
  suppressClusterHeading?: boolean;
  subjectTitle?: string;
  omitSubjectTitleClusterHeading?: boolean;
}) {
  return multiItemSection(
    section,
    suppressClusterHeading,
    "concept-index",
    subjectTitle,
    omitSubjectTitleClusterHeading,
  );
}

function multiItemSection(
  { cluster, items, headingHref }: ClusterSection,
  suppressClusterHeading: boolean,
  browseListVariant: CardGridVariant,
  subjectTitle?: string,
  omitSubjectTitleClusterHeading = true,
) {
  const repeatsSubjectTitle = Boolean(
    omitSubjectTitleClusterHeading &&
      subjectTitle &&
      sameTitle(cluster.title, subjectTitle),
  );
  const conceptIndex = browseListVariant === "concept-index";
  const clusterTitle = cluster.title.trim();
  const displayClusterTitle =
    clusterTitle.length > 0 ? cluster.title : subjectTitle?.trim() ?? "";
  const sourceHasGroupHeadings = items.some(
    (item) => item.indexRowKind === "group-heading",
  );
  const useSubjectTitleAsClusterH2 = Boolean(
    conceptIndex &&
      items.length > 0 &&
      clusterTitle.length === 0 &&
      displayClusterTitle.length > 0 &&
      !sourceHasGroupHeadings &&
      !suppressClusterHeading &&
      !repeatsSubjectTitle,
  );
  let showHeading =
    useSubjectTitleAsClusterH2 ||
    (!suppressClusterHeading &&
      !repeatsSubjectTitle &&
      clusterTitle.length > 0);
  let indexItems = items;
  if (conceptIndex && items.length > 0) {
    const fallbackTitle =
      clusterTitle.length > 0 ? clusterTitle : subjectTitle?.trim();
    indexItems = ensureConceptIndexListTitles(items, {
      sectionHeadingVisible: showHeading,
      leadingGroupTitle: fallbackTitle || undefined,
      leadingGroupHref: headingHref ?? items[0]?.href,
      wrapFlatListTitle: showHeading ? undefined : fallbackTitle || undefined,
      wrapFlatListHref: headingHref ?? items[0]?.href,
    });
    if (
      !showHeading &&
      clusterTitle.length > 0 &&
      !repeatsSubjectTitle &&
      !indexItems.some((item) => item.indexRowKind === "group-heading")
    ) {
      showHeading = true;
    }
  }
  const hasGroupHeadings = indexItems.some(
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
              <SearchHighlightedText text={displayClusterTitle} />
            </Link>
          ) : (
            <SearchHighlightedText text={displayClusterTitle} />
          )}
        </h2>
      ) : null}
      {indexItems.length > 0 ? (
        <div
          className={
            showHeading
              ? conceptIndex
                ? hasGroupHeadings
                  ? "mt-3"
                  : CONCEPT_INDEX_HEADING_TO_LIST
                : "mt-3"
              : undefined
          }
        >
          {conceptIndex && hasGroupHeadings ? (
            <ConceptIndexCardGrid
              items={indexItems}
              sectionHeadingVisible={showHeading}
              leadingGroupTitle={
                clusterTitle.length > 0 ? clusterTitle : subjectTitle
              }
            />
          ) : (
            <CardGrid items={indexItems} variant={browseListVariant} />
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
  omitSubjectTitleClusterHeading = true,
}: {
  sections: readonly ClusterSection[];
  suppressClusterHeadings?: boolean;
  browseListVariant?: CardGridVariant;
  embedInParentGrid?: boolean;
  subjectTitle?: string;
  omitSubjectTitleClusterHeading?: boolean;
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
            omitSubjectTitleClusterHeading,
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
        omitSubjectTitleClusterHeading,
      ),
    );
  }
  flushSingleBatch();

  return <>{blocks}</>;
}

function subjectHubClusterSectionCount(
  sections: readonly ClusterSection[] | undefined,
  groupedSections:
    | readonly {
        readonly clusters: readonly ClusterSection[];
      }[]
    | undefined,
  rootSections: readonly ClusterSection[] | undefined,
  afterRootSections: readonly ClusterSection[] | undefined,
): number {
  return (
    (sections?.length ?? 0) +
    (rootSections?.length ?? 0) +
    (afterRootSections?.length ?? 0) +
    (groupedSections?.reduce((sum, group) => sum + group.clusters.length, 0) ??
      0)
  );
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
  const omitSubjectTitleClusterHeading =
    subjectHubClusterSectionCount(
      sections,
      groupedSections,
      rootSections,
      afterRootSections,
    ) === 1;
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
            omitSubjectTitleClusterHeading={omitSubjectTitleClusterHeading}
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
                  omitSubjectTitleClusterHeading={
                    omitSubjectTitleClusterHeading
                  }
                />
              );
            }
            return (
              <section
                key={section.id}
                id={section.id}
                className="catalog-section min-w-0 w-full max-w-full scroll-mt-24"
              >
                <h2 className={CATALOG_CLUSTER_HEADING}>
                  <SearchHighlightedText text={section.title} />
                </h2>
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
                <SearchHighlightedText text={section.title} />
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
                    omitSubjectTitleClusterHeading={
                      omitSubjectTitleClusterHeading
                    }
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
            omitSubjectTitleClusterHeading={omitSubjectTitleClusterHeading}
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
        omitSubjectTitleClusterHeading={omitSubjectTitleClusterHeading}
      />
    </div>
  );
}
