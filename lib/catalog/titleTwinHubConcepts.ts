import type { Locale } from "@/lib/i18n/locales";
import type { Subject } from "@/lib/catalog";
import { topicsForCluster } from "@/lib/catalog";
import { loadTopicOutline } from "@/lib/parse";
import type { Concept, ConceptOutline } from "@/lib/parse";
import { conceptsForConspectTopic, sameTitle } from "@/lib/nav/navUtils";
import { titleTwinTopicForCluster } from "./titleTwinTopic";

/** Outline concepts from every title-twin cluster on a subject hub (for group hash focus). */
export function titleTwinOutlineConceptsForSubject(
  subject: Subject,
  locale: Locale,
): readonly ConceptOutline[] {
  const concepts: ConceptOutline[] = [];
  for (const cluster of subject.clusters) {
    const topics = topicsForCluster(subject, cluster.id);
    if (topics.length !== 1) {
      continue;
    }
    const [topic] = topics;
    if (!sameTitle(cluster.title, topic.title)) {
      continue;
    }
    concepts.push(
      ...conceptsForConspectTopic(topic, loadTopicOutline(topic, locale)),
    );
  }
  return concepts;
}

/** Title-twin cluster drilldown concepts, keyed by cluster id (server-built for client hubs). */
export function titleTwinClusterConceptsByClusterId<T extends { id: string }>(
  subject: Subject,
  locale: Locale,
  conceptPool: readonly T[],
): Readonly<Record<string, readonly T[]>> {
  const result: Record<string, T[]> = {};
  for (const cluster of subject.clusters) {
    const topic = titleTwinTopicForCluster(subject, cluster.id);
    if (!topic) {
      continue;
    }
    const outlineIds = new Set(
      loadTopicOutline(topic, locale).map((entry) => entry.id),
    );
    const pool = conceptPool.filter((concept) => outlineIds.has(concept.id));
    if (pool.length > 0) {
      result[cluster.id] = pool;
    }
  }
  return result;
}