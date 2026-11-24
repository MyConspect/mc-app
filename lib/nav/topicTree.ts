import { handbookLogicalPathname } from "@/lib/i18n/sectionPaths";
import type { NavTopic } from "./types";

function navHrefMatches(pathname: string, href: string): boolean {
  return handbookLogicalPathname(pathname) === handbookLogicalPathname(href);
}

export function flattenNavTopics(topic: NavTopic): readonly NavTopic[] {
  return [
    topic,
    ...(topic.nestedTopics?.flatMap((nested) => flattenNavTopics(nested)) ??
      []),
  ];
}

export function navTopicTreeContainsHref(
  topic: NavTopic,
  pathname: string,
): boolean {
  if (navHrefMatches(pathname, topic.href)) {
    return true;
  }
  return (
    topic.nestedTopics?.some((nested) =>
      navTopicTreeContainsHref(nested, pathname),
    ) ?? false
  );
}

export function navTopicAtPath(
  topic: NavTopic,
  pathname: string,
): NavTopic | undefined {
  const trail = navTopicTrailAtPath(topic, pathname);
  return trail?.[trail.length - 1];
}

/** Root-to-leaf nav topics for a pathname (includes nested `navParentSlug` children). */
export function navTopicTrailAtPath(
  topic: NavTopic,
  pathname: string,
): readonly NavTopic[] | undefined {
  if (navHrefMatches(pathname, topic.href)) {
    return [topic];
  }
  for (const nested of topic.nestedTopics ?? []) {
    const trail = navTopicTrailAtPath(nested, pathname);
    if (trail) {
      return [topic, ...trail];
    }
  }
  return undefined;
}
