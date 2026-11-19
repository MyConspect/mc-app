"use client";

import { ClusterConceptIndexSection } from "@/components/catalog/ClusterCardSections";
import { ClusterTopicGroupIndexSection } from "@/components/catalog/ClusterTopicGroupIndexSection";
import { partitionBrowseCardsByGroupHeading } from "@/lib/catalog/partitionBrowseCardsByGroupHeading";
import { clusterIndexSectionWeight } from "@/lib/catalog/conceptIndexSectionWeight";
import { flattenSubjectClusterSectionsForIndex } from "@/lib/catalog/flattenSubjectClusterSections";
import type { SubjectClusterSection } from "@/lib/catalog/clusterConceptIndex";
import type { ChromeCopy } from "@/lib/nav";
import { sameTitle } from "@/lib/nav/navUtils";
import type { Concept } from "@/lib/parse";
import type { ConceptIndexBalancedEntry } from "./ConceptIndexBalancedLayout";
import { ConceptGroupIndexSection } from "./ConceptGroupIndexSection";
import {
  conceptIndexSectionWeight,
  conceptsForIndexSection,
  groupConcepts,
  type ConceptGroup,
} from "./conceptIndexGroups";

type SubjectClusterLayout = {
  readonly sections?: readonly SubjectClusterSection[];
  readonly rootSections?: readonly SubjectClusterSection[];
  readonly groupedSections?: readonly {
    readonly section: {
      readonly id: string;
      readonly title: string;
      readonly flatNav?: boolean;
    };
    readonly clusters: readonly SubjectClusterSection[];
  }[];
  readonly afterRootSections?: readonly SubjectClusterSection[];
};

function conceptGroupEntries(
  groups: readonly ConceptGroup[],
  chrome: ChromeCopy,
  pathname: string,
  suppressIntroGroupHeadings: boolean,
): ConceptIndexBalancedEntry[] {
  return groups.flatMap((group) => {
    const sectionConcepts = conceptsForIndexSection(group);
    if (sectionConcepts.length === 0 && !group.label) {
      return [];
    }
    return [
      {
        key: `concept:${group.key}`,
        weight: conceptIndexSectionWeight(group),
        listItemCount: sectionConcepts.length,
        node: (
          <ConceptGroupIndexSection
            group={group}
            chrome={chrome}
            pathname={pathname}
            suppressHeading={suppressIntroGroupHeadings}
          />
        ),
      },
    ];
  });
}

function clusterSectionBalancedEntries(
  section: SubjectClusterSection,
  suppressHeading: boolean,
  splitTopicGroups: boolean,
): ConceptIndexBalancedEntry[] {
  const hasGroupHeadings = section.items.some(
    (item) => item.indexRowKind === "group-heading",
  );
  if (splitTopicGroups && hasGroupHeadings) {
    return partitionBrowseCardsByGroupHeading(section.items).flatMap(
      (block, index) => {
        if (!block.heading) {
          return [
            {
              key: `cluster:${section.cluster.id}:leading:${index}`,
              weight: clusterIndexSectionWeight({
                ...section,
                items: block.items,
              }),
              listItemCount: block.items.length,
              node: (
                <ClusterConceptIndexSection
                  section={{ ...section, items: block.items }}
                  suppressClusterHeading
                />
              ),
            },
          ];
        }
        const pseudoSection: SubjectClusterSection = {
          ...section,
          items: block.items,
        };
        return [
          {
            key: `cluster:${section.cluster.id}:${block.heading.title}:${index}`,
            weight: clusterIndexSectionWeight(pseudoSection) + 2,
            listItemCount: block.items.length,
            node: (
              <ClusterTopicGroupIndexSection
                heading={block.heading}
                items={block.items}
              />
            ),
          },
        ];
      },
    );
  }
  return [
    {
      key: `cluster:${section.cluster.id}`,
      weight: clusterIndexSectionWeight(section),
      listItemCount: section.items.length,
      node: (
        <ClusterConceptIndexSection
          section={section}
          suppressClusterHeading={suppressHeading}
        />
      ),
    },
  ];
}

export function buildConceptIndexBalancedEntries({
  clusterLayout,
  concepts,
  groupInterviewSections,
  chrome,
  pathname,
  suppressIntroGroupHeadings = false,
  suppressClusterHeadings = false,
  splitClusterTopicGroups = false,
  subjectTitle,
}: {
  readonly clusterLayout?: SubjectClusterLayout;
  readonly concepts: readonly Concept[];
  readonly groupInterviewSections: boolean;
  readonly chrome: ChromeCopy;
  readonly pathname: string;
  readonly suppressIntroGroupHeadings?: boolean;
  readonly suppressClusterHeadings?: boolean;
  /** Packable units for pane-height newspaper flow (focused multi-topic cluster). */
  readonly splitClusterTopicGroups?: boolean;
  /** Omit cluster h2 when it repeats the subject page title (e.g. CS → Core). */
  readonly subjectTitle?: string;
}): readonly ConceptIndexBalancedEntry[] {
  const groups = groupConcepts(concepts, groupInterviewSections, chrome);
  const groupEntries = conceptGroupEntries(
    groups,
    chrome,
    pathname,
    suppressIntroGroupHeadings,
  );

  if (!clusterLayout) {
    return groupEntries;
  }

  const clusterEntries: ConceptIndexBalancedEntry[] = [];
  const clusters = flattenSubjectClusterSectionsForIndex(clusterLayout);
  for (const section of clusters) {
    const suppressHeading =
      suppressClusterHeadings ||
      (subjectTitle ? sameTitle(section.cluster.title, subjectTitle) : false);
    clusterEntries.push(
      ...clusterSectionBalancedEntries(
        section,
        suppressHeading,
        splitClusterTopicGroups,
      ),
    );
  }

  // Intro groups (e.g. Work Principles) before cluster outlines — matches catalog order.
  return [...groupEntries, ...clusterEntries];
}
