"use client";

import type { Concept } from "@/lib/parse";

type ClusterSection = {
  readonly cluster: {
    readonly id: string;
    readonly title: string;
  };
};

type GroupedSection = {
  readonly clusters: readonly ClusterSection[];
};

/** Index titles omitted — breadcrumb and sidebar name the subject/cluster. */
export function SubjectPageTitle(_props: {
  subjectTitle: string;
  introConcepts?: readonly Concept[];
  sections?: readonly ClusterSection[];
  rootSections?: readonly ClusterSection[];
  afterRootSections?: readonly ClusterSection[];
  groupedSections?: readonly GroupedSection[];
}) {
  return null;
}
