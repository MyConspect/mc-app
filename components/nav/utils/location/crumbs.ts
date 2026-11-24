import {
  getSubject,
  getTopic,
  getTrack,
  isTrackId,
  subjectHref,
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
  navBreadcrumbHomeHref,
  navGroupCrumbHref,
  navSubjectCrumbHref,
  type Crumb,
  type NavCluster,
  type NavGroup,
  type NavRootSection,
  type NavSubject,
  type NavTopic,
} from "@/lib/nav";
import { navGroupsForPath } from "@/lib/nav/sections";
import { findNavClusterInSubject } from "@/lib/nav/findNavCluster";
import { navSubjectClusters } from "@/lib/nav/subjectClusters";
import { navTopicTrailAtPath } from "@/lib/nav/topicTree";
import { areRedundantNavTitles, hashIdFrom } from "@/lib/nav/navUtils";
import {
  conceptGroupSectionDomId,
  isConceptGroupSectionId,
} from "@/lib/nav/conceptGroupSection";
import {
  homeHref,
  localeFromPathname,
  stripLocalePrefix,
} from "@/lib/i18n/paths";
import { isSectionHomePathname } from "@/lib/i18n/sectionPaths";
import { isActiveTrack } from "./active";
import {
  clusterForConceptInSubject,
  clusterTrailCrumbs,
  conceptById,
  isTopicAliasCluster,
  omitTopicCrumbForSubjectAlias,
  subjectHubClusterCrumbs,
} from "./shared";

export function crumbsForPath(
  groups: readonly NavGroup[],
  pathname: string,
  hash: string,
  labels: { home: string; instructions: string },
  sections?: readonly NavRootSection[],
): readonly Crumb[] {
  const hashId = hashIdFrom(hash);
  const locale = localeFromPathname(pathname);
  const { path } = stripLocalePrefix(pathname);
  const home: Crumb = {
    label: labels.home,
    href: sections
      ? navBreadcrumbHomeHref(sections, pathname)
      : homeHref(locale),
  };
  const loopGroups =
    sections === undefined
      ? groups
      : navGroupsForPath(sections, pathname);

  if (path === "/" || isSectionHomePathname(pathname)) {
    return [{ label: labels.home }];
  }
  if (path === INSTRUCTIONS_HREF) {
    return [home, { label: labels.instructions }];
  }

  for (const group of loopGroups) {
    if (!isActiveTrack(pathname, group.href)) {
      continue;
    }

    if (
      group.leafTopic &&
      (pathname === group.href || pathname === group.leafTopic.href)
    ) {
      return withConcept(
        home,
        [{ label: group.title, href: navGroupCrumbHref(group, pathname) }],
        group.leafTopic,
        hashId,
      );
    }

    if (pathname === group.href) {
      if (group.hubTopic) {
        return withConcept(
          home,
          [{ label: group.title, href: navGroupCrumbHref(group, pathname) }],
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
                  { label: group.title, href: navGroupCrumbHref(group, pathname) },
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
                  { label: group.title, href: navGroupCrumbHref(group, pathname) },
                  {
                    label: entry.subject.title,
                    href: navSubjectCrumbHref(group, entry.subject, pathname),
                  },
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
              { label: group.title, href: navGroupCrumbHref(group, pathname) },
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
                  { label: group.title, href: navGroupCrumbHref(group, pathname) },
                  {
                    label: entry.subject.title,
                    href: navSubjectCrumbHref(group, entry.subject, pathname),
                  },
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
                  { label: group.title, href: navGroupCrumbHref(group, pathname) },
                  {
                    label: entry.subject.title,
                    href: navSubjectCrumbHref(group, entry.subject, pathname),
                  },
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
                  { label: group.title, href: navGroupCrumbHref(group, pathname) },
                  {
                    label: entry.subject.title,
                    href: navSubjectCrumbHref(group, entry.subject, pathname),
                  },
                ],
                conceptTopic,
                hashId,
              );
            }
            return [
              home,
              { label: group.title, href: navGroupCrumbHref(group, pathname) },
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
                pathname,
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
                pathname,
              );
              if (utilityTrail) {
                return withConcept(home, utilityTrail, topic, hashId);
              }
              const subjectAliasTopic = omitTopicCrumbForSubjectAlias(
                entry.subject,
                cluster,
                topic,
              );
              return withConcept(
                home,
                [
                  { label: group.title, href: navGroupCrumbHref(group, pathname) },
                  {
                    label: entry.subject.title,
                    href: navSubjectCrumbHref(group, entry.subject, pathname),
                  },
                  ...(subjectAliasTopic
                    ? []
                    : [
                        ...clusterTrailCrumbs(cluster, entry.subject),
                        ...ancestors.map((ancestor) => ({
                          label: ancestor.title,
                          href: ancestor.href,
                        })),
                        { label: topic.title, href: topic.href },
                      ]),
                ],
                topic,
                hashId,
                { suppressConceptCrumbs: subjectAliasTopic },
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
                { label: group.title, href: navGroupCrumbHref(group, pathname) },
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
      const trackGroup =
        loopGroups.find((group) => group.id === trackSlug) ??
        groups.find((group) => group.id === trackSlug);
      const trackCrumbHref = trackGroup
        ? navGroupCrumbHref(trackGroup, pathname)
        : withLocale(locale, trackHref(trackSlug));
      const subject =
        topic.grouping && getSubject(trackSlug, topic.grouping.subject);
      const subjectCrumbHref =
        subject && trackGroup
          ? navSubjectCrumbHref(
              trackGroup,
              {
                slug: subject.slug,
                href: withLocale(locale, subjectHref(subject)),
              },
              pathname,
            )
          : subject
            ? withLocale(locale, subjectHref(subject))
            : undefined;
      if (
        subject &&
        areRedundantNavTitles(
          catalogBlurb(locale, subject.title),
          catalogBlurb(locale, topic.title),
        )
      ) {
        return [
          home,
          {
            label: catalogBlurb(locale, track.title),
            href: trackCrumbHref,
          },
          {
            label: catalogBlurb(locale, subject.title),
            href: subjectCrumbHref,
          },
        ];
      }
      return [
        home,
        {
          label: catalogBlurb(locale, track.title),
          href: trackCrumbHref,
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
  pathname: string,
): readonly Crumb[] | undefined {
  if (!typesHub) {
    return undefined;
  }
  const base: Crumb[] = [
    { label: group.title, href: navGroupCrumbHref(group, pathname) },
    {
      label: subject.title,
      href: navSubjectCrumbHref(group, subject, pathname),
    },
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
  pathname: string,
): readonly Crumb[] | undefined {
  void _cluster;
  if (!utilityHub) {
    return undefined;
  }
  const base: Crumb[] = [
    { label: group.title, href: navGroupCrumbHref(group, pathname) },
    {
      label: subject.title,
      href: navSubjectCrumbHref(group, subject, pathname),
    },
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
  options?: { readonly suppressConceptCrumbs?: boolean },
): readonly Crumb[] {
  const concept = conceptById(topic.concepts, hashId);
  const crumbs = [home, ...trail];
  if (concept && !options?.suppressConceptCrumbs) {
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
