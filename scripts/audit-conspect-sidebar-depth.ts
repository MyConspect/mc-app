#!/usr/bin/env npx tsx
/** Lists conspect clusters where sidebar may show an extra topic row (cluster title ≠ topic title). */

import { handbookNavSections } from "@/lib/nav/handbook";
import {
  areRedundantNavTitles,
  sameTitle,
} from "@/lib/nav/navUtils";

const lines: string[] = [];

for (const section of handbookNavSections("en")) {
  if (section.id !== "conspect") {
    continue;
  }
  for (const group of section.groups) {
    for (const entry of group.entries) {
      if (entry.kind === "subject") {
        const prefix = `${group.id}/${entry.subject.slug}`;
        for (const cluster of entry.subject.clusters) {
          inspect(prefix, cluster);
        }
      } else if (entry.kind === "cluster") {
        inspect(`TRACK/${group.id}`, entry.cluster);
      }
    }
  }
}

function inspect(
  prefix: string,
  cluster: { readonly id: string; readonly title: string; readonly topics: readonly { readonly title: string; readonly concepts: readonly unknown[]; readonly nestedTopics?: readonly unknown[] }[]; readonly nestedClusters?: readonly unknown[] },
) {
  if ((cluster.nestedClusters?.length ?? 0) > 0) {
    lines.push(`${prefix}/${cluster.id}: nestedClusters=${cluster.nestedClusters!.length}`);
    return;
  }
  if (cluster.topics.length !== 1) {
    return;
  }
  const topic = cluster.topics[0]!;
  const hasChildren =
    topic.concepts.length > 0 || (topic.nestedTopics?.length ?? 0) > 0;
  if (!hasChildren) {
    return;
  }
  if (
    sameTitle(cluster.title, topic.title) ||
    areRedundantNavTitles(cluster.title, topic.title)
  ) {
    return;
  }
  lines.push(
    `${prefix}/${cluster.id}: cluster "${cluster.title}" → topic "${topic.title}" (${topic.concepts.length} concepts)`,
  );
}

if (lines.length === 0) {
  console.log("No cluster/topic title mismatches (sidebar uses hideTitle for single-topic clusters).");
} else {
  console.log("# Sidebar depth audit (rename catalog topic or unwrap content)\n");
  for (const line of lines) {
    console.log(line);
  }
}