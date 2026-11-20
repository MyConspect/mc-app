import type { Locale } from "@/lib/i18n/locales";
import {
  loadTopicOutline,
  loadTopicPage,
  type Concept,
  type ConceptOutline,
} from "@/lib/parse";
import type { Subject, Topic } from "./index";
import { topicsForCluster } from "./index";
import { conceptsForConspectTopic } from "@/lib/nav/navUtils";

function uniqueClusterTopics(subject: Subject): readonly Topic[] {
  const topics: Topic[] = [];
  const seen = new Set<string>();
  for (const cluster of subject.clusters) {
    for (const topic of topicsForCluster(subject, cluster.id)) {
      const key = `${topic.track}/${topic.slug}`;
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);
      topics.push(topic);
    }
  }
  return topics;
}

export type SubjectHubConcept = Concept | ConceptOutline;

/** All cluster-topic outlines on a subject hub (hash resolution and nav). */
export function subjectHubOutlineConcepts(
  subject: Subject,
  locale: Locale,
): readonly SubjectHubConcept[] {
  const concepts: SubjectHubConcept[] = [];
  for (const topic of uniqueClusterTopics(subject)) {
    concepts.push(
      ...conceptsForConspectTopic(topic, loadTopicOutline(topic, locale)),
    );
  }
  return concepts;
}

/** Parsed concepts with HTML for every cluster topic on a subject hub. */
export async function subjectHubDetailConcepts(
  subject: Subject,
  locale: Locale,
): Promise<readonly Concept[]> {
  const concepts: Concept[] = [];
  for (const topic of uniqueClusterTopics(subject)) {
    const loaded = await loadTopicPage(topic.track, topic.slug, locale);
    if (loaded) {
      concepts.push(
        ...conceptsForConspectTopic(topic, loaded.parsed.concepts),
      );
    }
  }
  return concepts;
}
