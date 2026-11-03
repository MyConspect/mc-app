import type { ReactNode } from "react";
import { CardGrid } from "./CardGrid";
import type { BrowseCard } from "@/lib/catalog";

type ClusterSection = {
  readonly cluster: {
    readonly id: string;
    readonly title: string;
    readonly blurb: string;
  };
  readonly items: readonly BrowseCard[];
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

function multiItemSection(
  { cluster, items }: ClusterSection,
  suppressClusterHeading: boolean,
) {
  const showHeading =
    !suppressClusterHeading && cluster.title.trim().length > 0;
  return (
    <section key={cluster.id} id={cluster.id} className="scroll-mt-24">
      {showHeading ? (
        <h2 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          {cluster.title}
        </h2>
      ) : null}
      <div className={showHeading ? "mt-4" : undefined}>
        <CardGrid items={items} />
      </div>
    </section>
  );
}

function ClusterBlocks({
  sections,
  suppressClusterHeadings = false,
}: {
  sections: readonly ClusterSection[];
  suppressClusterHeadings?: boolean;
}) {
  if (isCompactSectionList(sections)) {
    return <CardGrid items={compactSectionItems(sections)} />;
  }

  const blocks: ReactNode[] = [];
  let singleBatch: ClusterSection[] = [];

  const flushSingleBatch = () => {
    if (singleBatch.length === 0) {
      return;
    }
    const batchKey = singleBatch.map((section) => section.cluster.id).join("-");
    blocks.push(
      <CardGrid
        key={`singles-${batchKey}`}
        items={compactSectionItems(singleBatch)}
      />,
    );
    singleBatch = [];
  };

  for (const section of sections) {
    if (section.items.length === 1) {
      singleBatch.push(section);
      continue;
    }
    flushSingleBatch();
    blocks.push(multiItemSection(section, suppressClusterHeadings));
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
}: {
  sections?: readonly ClusterSection[];
  rootSections?: readonly ClusterSection[];
  afterRootSections?: readonly ClusterSection[];
  groupedSections?: readonly {
    readonly section: {
      readonly id: string;
      readonly title: string;
      readonly defaultOpen?: boolean;
    };
    readonly clusters: readonly ClusterSection[];
  }[];
  suppressClusterHeadings?: boolean;
}) {
  if (
    groupedSections?.length ||
    rootSections?.length ||
    afterRootSections?.length
  ) {
    return (
      <div className="catalog-sections space-y-4">
        {rootSections?.length ? (
          <div className="space-y-6 sm:space-y-10">
            <ClusterBlocks
              sections={rootSections}
              suppressClusterHeadings={suppressClusterHeadings}
            />
          </div>
        ) : null}
        {groupedSections?.map(({ section, clusters }) => (
          <details
            key={section.id}
            id={section.id}
            className="catalog-section scroll-mt-24 rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
            open={section.defaultOpen ?? true}
          >
            <summary className="cursor-pointer px-4 py-3 text-left text-xl font-semibold tracking-tight text-zinc-900 sm:px-5 sm:py-4 dark:text-zinc-50">
              {section.title}
            </summary>
            <div className="space-y-6 border-t border-zinc-200 px-4 pt-4 pb-5 sm:space-y-10 sm:px-5 sm:pb-6 dark:border-zinc-800">
              {clusters.length === 0 ? (
                <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                  No topics yet.
                </p>
              ) : (
                <ClusterBlocks
                  sections={clusters}
                  suppressClusterHeadings={suppressClusterHeadings}
                />
              )}
            </div>
          </details>
        ))}
        {afterRootSections?.length ? (
          <div className="space-y-6 sm:space-y-10">
            <ClusterBlocks
              sections={afterRootSections}
              suppressClusterHeadings={suppressClusterHeadings}
            />
          </div>
        ) : null}
      </div>
    );
  }

  const flatSections = sections ?? [];
  const compact = isCompactSectionList(flatSections);

  return (
    <div className={compact ? undefined : "space-y-6 sm:space-y-10"}>
      <ClusterBlocks
        sections={flatSections}
        suppressClusterHeadings={suppressClusterHeadings}
      />
    </div>
  );
}
