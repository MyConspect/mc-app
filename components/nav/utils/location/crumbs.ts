import {
  getTopic,
  getTrack,
  isTrackId,
  topicHref,
  trackHref,
} from "@/lib/catalog";
import { catalogBlurb } from "@/lib/i18n/catalog";
import { withLocale } from "@/lib/i18n/paths";
import {
  isTypesHubSectionSlug,
  typesHubSectionGroup,
  TYPES_HUB_SLUG,
} from "@/lib/catalog/typesHub";
import {
  isUtilityTypesHubSectionSlug,
  UTILITY_TYPES_HUB_SLUG,
} from "@/lib/catalog/utilityTypesHub";
import {
  INSTRUCTIONS_HREF,
  type Crumb,
  type NavCluster,
  type NavGroup,
  type NavSubject,
  type NavTopic,
} from "@/lib/nav";
import { findNavClusterInSubject } from "@/lib/nav/findNavCluster";
import { navSubjectClusters } from "@/lib/nav/subjectClusters";
import { navTopicTrailAtPath } from "@/lib/nav/topicTree";
import { hashIdFrom } from "@/lib/nav/navUtils";
import {
  conceptGroupSectionDomId,
  isConceptGroupSectionId,
} from "@/lib/nav/conceptGroupSection";
import {
  homeHref,
  localeFromPathname,
  stripLocalePrefix,
} from "@/lib/i18n/paths";
import { isActiveTrack } from "./active";
import {
  clusterForConceptInSubject,
  clusterTrailCrumbs,
  conceptById,
  isTopicAliasCluster,
  subjectHubClusterCrumbs,
} from "./shared";

export function crumbsForPath(
  groups: readonly NavGroup[],
  pathname: string,
  hash: string,
  labels: { home: string; instructions: string },
): readonly Crumb[] {
  const hashId = hashIdFrom(hash);
  const locale = localeFromPathname(pathname);
  const { path } = stripLocalePrefix(pathname);
  const home: Crumb = { label: labels.home, href: homeHref(locale) };

  if (path === "/") {
    return [{ label: labels.home }];
  }
  if (path === INSTRUCTIONS_HREF) {
    return [home, { label: labels.instructions }];
  }

  for (const group of groups) {
    if (!isActiveTrack(pathname, group.href)) {
      continue;
    }

    if (
      group.leafTopic &&
      (pathname === group.href || pathname === group.leafTopic.href)
    ) {
      return withConcept(
        home,
        [{ label: group.title, href: group.href }],
        group.leafTopic,
        hashId,
      );
    }

    if (pathname === group.href) {
      if (group.hubTopic) {
        return withConcept(
          home,
          [{ label: group.title, href: group.href }],
          group.hubTopic,
          hashId,
        );
      }
      for (const entry of group.entries) {
        switch (entry.kind) {
          case "cluster":
            if (hashId === entry.cluster.id) {
              const clusterCrumbs = clusterTrailCrumbs(entry.cluster);
              if (clusterCrumbs.length > 0) {
                return [
                  home,
                  { label: group.title, href: group.href },
                  ...clusterCrumbs,
                ];
              }
            }
            break;
          case "subject": {
            const cluster = hashId
              ? navSubjectClusters(entry.subject).find(
                  (item) => item.id === hashId,
                )
              : undefined;
            if (cluster && pathname === entry.subject.href) {
              const clusterCrumbs = subjectHubClusterCrumbs(
                cluster,
                entry.subject,
                pathname,
              );
              if (clusterCrumbs.length > 0) {
                return [
                  home,
                  { label: group.title, href: group.href },
                  { label: entry.subject.title, href: entry.subject.href },
                  ...clusterCrumbs,
                ];
              }
            }
            break;
          }
          case "topic":
            break;
          default: {
            const _never: never = entry;
            return _never;
          }
        }
      }
      return [home, { label: group.title }];
    }

    let hubTitle: string | null = null;
    for (const entry of group.entries) {
      switch (entry.kind) {
        case "topic": {
          if (entry.topic.href !== pathname) {
            break;
          }
          return withConcept(
            home,
            [
              { label: group.title, href: group.href },
              { label: entry.topic.title, href: entry.topic.href },
            ],
            entry.topic,
            hashId,
          );
        }
        case "subject": {
          if (pathname === entry.subject.href) {
            const clusterHit = hashId
              ? findNavClusterInSubject(entry.subject, hashId)
              : undefined;
            if (clusterHit && isConceptGroupSectionId(hashId)) {
              const clusterCrumbs = subjectHubClusterCrumbs(
                clusterHit.cluster,
                entry.subject,
                pathname,
              );
              const parentCrumbs = clusterHit.parent
                ? subjectHubClusterCrumbs(
                    clusterHit.parent,
                    entry.subject,
                    pathname,
                  )
                : [];
              if (clusterCrumbs.length > 0) {
                return [
                  home,
                  { label: group.title, href: group.href },
                  { label: entry.subject.title, href: entry.subject.href },
                  ...parentCrumbs,
                  ...clusterCrumbs,
                ];
              }
            }
            if (
              clusterHit &&
              !isConceptGroupSectionId(hashId) &&
              clusterHit.cluster.id === hashId &&
              !isTopicAliasCluster(clusterHit.cluster)
            ) {
              const clusterCrumbs = subjectHubClusterCrumbs(
                clusterHit.cluster,
                entry.subject,
                pathname,
              );
              if (clusterCrumbs.length > 0) {
                return [
                  home,
                  { label: group.title, href: group.href },
                  { label: entry.subject.title, href: entry.subject.href },
                  ...clusterCrumbs,
                ];
              }
            }
            const conceptTopic = clusterForConceptInSubject(
              entry.subject,
              hashId,
            )?.topic;
            if (conceptTopic) {
              return withConcept(
                home,
                [
                  { label: group.title, href: group.href },
                  { label: entry.subject.title, href: entry.subject.href },
                ],
                conceptTopic,
                hashId,
              );
            }
            return [
              home,
              { label: group.title, href: group.href },
              { label: entry.subject.title },
            ];
          }
          for (const cluster of navSubjectClusters(entry.subject)) {
            for (const root of cluster.topics) {
              const trail = navTopicTrailAtPath(root, pathname);
              if (!trail?.length) {
                continue;
              }
              const topic = trail[trail.length - 1]!;
              const ancestors = trail.slice(0, -1);
              const typesHub = findTypesHubTopic(entry.subject);
              const typesTrail = typesHubSectionTrail(
                topic,
                typesHub,
                entry.subject,
                group,
                cluster,
              );
              if (typesTrail) {
                return withConcept(home, typesTrail, topic, hashId);
              }
              const utilityHub = findUtilityTypesHubTopic(entry.subject);
              const utilityTrail = utilityTypesHubSectionTrail(
                topic,
                utilityHub,
                entry.subject,
                group,
                cluster,
              );
              if (utilityTrail) {
                return withConcept(home, utilityTrail, topic, hashId);
              }
              return withConcept(
                home,
                [
                  { label: group.title, href: group.href },
                  { label: entry.subject.title, href: entry.subject.href },
                  ...clusterTrailCrumbs(cluster, entry.subject),
                  ...ancestors.map((ancestor) => ({
                    label: ancestor.title,
                    href: ancestor.href,
                  })),
                  { label: topic.title, href: topic.href },
                ],
                topic,
                hashId,
              );
            }
          }
          break;
        }
        case "cluster": {
          if (pathname === entry.subjectHref) {
            if (hashId === entry.cluster.id) {
              const clusterCrumbs = clusterTrailCrumbs(entry.cluster);
              if (clusterCrumbs.length > 0) {
                return [
                  home,
                  { label: group.title, href: entry.subjectHref },
                  ...clusterCrumbs,
                ];
              }
            }
            hubTitle = group.title;
            break;
          }
          for (const root of entry.cluster.topics) {
            const trail = navTopicTrailAtPath(root, pathname);
            if (!trail?.length) {
              continue;
            }
            const topic = trail[trail.length - 1]!;
            const ancestors = trail.slice(0, -1);
            return withConcept(
              home,
              [
                { label: group.title, href: group.href },
                ...clusterTrailCrumbs(entry.cluster),
                ...ancestors.map((ancestor) => ({
                  label: ancestor.title,
                  href: ancestor.href,
                })),
                { label: topic.title, href: topic.href },
              ],
              topic,
              hashId,
            );
          }
          break;
        }
        default: {
          const _never: never = entry;
          return _never;
        }
      }
    }
    if (hubTitle) {
      return [home, { label: hubTitle }];
    }
  }

  const segments = path.slice(1).split("/").filter(Boolean);
  const trackSlug = segments[0];
  const topicSlug = segments[1];
  if (trackSlug && topicSlug && isTrackId(trackSlug)) {
    const topic = getTopic(trackSlug, topicSlug);
    const track = getTrack(trackSlug);
    if (topic && track) {
      return [
        home,
        {
          label: catalogBlurb(locale, track.title),
          href: withLocale(locale, trackHref(trackSlug)),
        },
        {
          label: catalogBlurb(locale, topic.title),
          href: withLocale(locale, topicHref(topic)),
        },
      ];
    }
  }

  return [home];
}

function findTypesHubTopic(subject: NavSubject): NavTopic | undefined {
  return findHubTopic(subject, TYPES_HUB_SLUG);
}

function findUtilityTypesHubTopic(subject: NavSubject): NavTopic | undefined {
  return findHubTopic(subject, UTILITY_TYPES_HUB_SLUG);
}

function findHubTopic(
  subject: NavSubject,
  hubSlug: string,
): NavTopic | undefined {
  for (const cluster of navSubjectClusters(subject)) {
    const hub = cluster.topics.find((item) => item.slug === hubSlug);
    if (hub) {
      return hub;
    }
  }
  return undefined;
}

function typesHubSectionTrail(
  topic: NavTopic,
  typesHub: NavTopic | undefined,
  subject: NavSubject,
  group: NavGroup,
  cluster: NavCluster,
): readonly Crumb[] | undefined {
  if (!typesHub) {
    return undefined;
  }
  const base: Crumb[] = [
    { label: group.title, href: group.href },
    { label: subject.title, href: subject.href },
    ...clusterTrailCrumbs(cluster, subject),
    { label: typesHub.title, href: typesHub.href },
  ];
  if (topic.slug === TYPES_HUB_SLUG) {
    return base;
  }
  if (!isTypesHubSectionSlug(topic.slug)) {
    return undefined;
  }
  const section = typesHubSectionGroup(topic.slug);
  return section ? [...base, { label: section }] : base;
}

function utilityTypesHubSectionTrail(
  topic: NavTopic,
  utilityHub: NavTopic | undefined,
  subject: NavSubject,
  group: NavGroup,
  _cluster: NavCluster,
): readonly Crumb[] | undefined {
  void _cluster;
  if (!utilityHub) {
    return undefined;
  }
  const base: Crumb[] = [
    { label: group.title, href: group.href },
    { label: subject.title, href: subject.href },
    { label: utilityHub.title, href: utilityHub.href },
  ];
  if (topic.slug === UTILITY_TYPES_HUB_SLUG) {
    return base;
  }
  if (!isUtilityTypesHubSectionSlug(topic.slug)) {
    return undefined;
  }
  return [...base, { label: topic.title, href: topic.href }];
}

function withConcept(
  home: Crumb,
  trail: readonly Crumb[],
  topic: NavTopic,
  hashId: string,
): readonly Crumb[] {
  const concept = conceptById(topic.concepts, hashId);
  const crumbs = [home, ...trail];
  if (concept) {
    const tail: Crumb[] = [];
    if (concept.group) {
      tail.push({
        label: concept.group,
        sectionScrollId: conceptGroupSectionDomId(concept.group),
      });
    }
    tail.push({ label: concept.title });
    return [...crumbs, ...tail];
  }
  const last = crumbs[crumbs.length - 1];
  if (!last) {
    return crumbs;
  }
  return [...crumbs.slice(0, -1), { label: last.label }];
}
