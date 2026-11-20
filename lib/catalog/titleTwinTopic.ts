import { topicsForCluster, type Subject, type Topic } from "./index";
import { areRedundantNavTitles } from "@/lib/nav/navUtils";

/** Single-topic cluster whose catalog title matches the cluster heading. */
export function titleTwinTopicForCluster(
  subject: Subject,
  clusterId: string,
): Topic | undefined {
  const cluster = subject.clusters.find((entry) => entry.id === clusterId);
  if (!cluster) {
    return undefined;
  }
  const topics = topicsForCluster(subject, clusterId);
  if (topics.length !== 1) {
    return undefined;
  }
  const [topic] = topics;
  return areRedundantNavTitles(cluster.title, topic.title) ? topic : undefined;
}
