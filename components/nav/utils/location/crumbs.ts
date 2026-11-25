import {
  getCluster,
  getSubject,
  getTopic,
  getTrack,
  isTrackId,
  subjectHref,
  topicHref,
  trackHref,
  type Topic,
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
import {
  isSectionHomePathname,
  peelSectionPrefix,
} from "@/lib/i18n/sectionPaths";
import { isActiveHref, isActiveTrack } from "./active";
import {
  clusterForConceptInSubject,
  clusterTrailCrumbs,
  conceptById,
  omitTopicCrumbForSubjectAlias,
  subjectHubClusterCrumbs,
} from "./shared";

function clusterNavTopicRoots(
  cluster: NavCluster,
): readonly NavTopic[] {
  return [
    ...cluster.topics,
    ...(cluster.nestedClusters?.flatMap((nested) => nested.topics) ?? []),
  ];
}

function findNavTopicBySlug(
  groups: readonly NavGroup[],
  slug: string,
): NavTopic | undefined {
  for (const group of groups) {
    for (const entry of group.entries) {
      if (entry.kind !== "subject") {
        continue;
      }
      for (const cluster of navSubjectClusters(entry.subject)) {
        for (const root of clusterNavTopicRoots(cluster)) {
          const visit = (topic: NavTopic): NavTopic | undefined => {
            if (topic.slug === slug) {
              return topic;
            }
            for (const nested of topic.nestedTopics ?? []) {
              const hit = visit(nested);
              if (hit) {
                return hit;
              }
            }
            return undefined;
          };
          const hit = visit(root);
          if (hit) {
            return hit;
          }
        }
      }
    }
  }
  return undefined;
}

function findNavTopicOnPath(
  groups: readonly NavGroup[],
  pathname: string,
): NavTopic | undefined {
  for (const group of groups) {
    for (const entry of group.entries) {
      if (entry.kind !== "subject") {
        continue;
      }
      for (const cluster of navSubjectClusters(entry.subject)) {
        for (const root of clusterNavTopicRoots(cluster)) {
          const visitExact = (topic: NavTopic): NavTopic | undefined => {
            if (isActiveHref(pathname, topic.href)) {
              return topic;
            }
            for (const nested of topic.nestedTopics ?? []) {
              const hit = visitExact(nested);
              if (hit) {
                return hit;
              }
            }
            return undefined;
          };
          const exact = visitExact(root);
          if (exact) {
            return exact;
          }
        }
        for (const root of clusterNavTopicRoots(cluster)) {
          const trail = navTopicTrailAtPath(root, pathname);
          if (trail?.length) {
            return trail[trail.length - 1];
          }
        }
      }
    }
  }
  return undefined;
}

function catalogTopicFromPathname(pathname: string): Topic | undefined {
  const { path } = stripLocalePrefix(pathname);
  const { rest: logicalPath } = peelSectionPrefix(path);
  const segments = logicalPath.slice(1).split("/").filter(Boolean);
  const trackSlug = segments[0];
  const topicSlug = segments[1];
  if (!trackSlug || !topicSlug || !isTrackId(trackSlug)) {
    return undefined;
  }
  return getTopic(trackSlug, topicSlug);
}

function catalogGroupedTopicCrumbs(
  home: Crumb,
  group: NavGroup,
  subject: NavSubject,
  topic: Topic,
  pathname: string,
  hashId: string,
  locale: ReturnType<typeof localeFromPathname>,
  navGroups: readonly NavGroup[],
): readonly Crumb[] | undefined {
  if (topic.grouping?.subject !== subject.slug) {
    return undefined;
  }
  const catalogSubject = getSubject(group.id, subject.slug);
  if (!catalogSubject) {
    return undefined;
  }
  const trail = catalogTopicTrailCrumbs(
    group,
    catalogSubject,
    topic,
    pathname,
    locale,
  );
  const navTopic =
    findNavTopicBySlug(navGroups, topic.slug) ??
    navSubjectClusters(subject)
      .flatMap((cluster) => cluster.topics)
      .find((item) => item.slug === topic.slug);
  if (navTopic) {
    return withConcept(home, trail, navTopic, hashId);
  }
  return [...[home], ...trail];
}

function catalogTopicTrailCrumbs(
  group: NavGroup,
  subject: NonNullable<ReturnType<typeof getSubject>>,
  topic: Topic,
  pathname: string,
  locale: ReturnType<typeof localeFromPathname>,
): readonly Crumb[] {
  const cluster = topic.grouping
    ? getCluster(subject, topic.grouping.cluster)
    : undefined;
  const trail: Crumb[] = [
    {
      label: catalogBlurb(locale, group.title),
      href: navGroupCrumbHref(group, pathname),
    },
    {
      label: catalogBlurb(locale, subject.title),
      href: navSubjectCrumbHref(
        group,
        {
          slug: subject.slug,
          href: withLocale(locale, subjectHref(subject)),
        },
        pathname,
      ),
    },
  ];
  if (cluster && !subject.flatNav && cluster.title.trim()) {
    trail.push({
      label: catalogBlurb(locale, cluster.title),
      href: withLocale(locale, `${subjectHref(subject)}#${cluster.id}`),
    });
  }
  if (
    !cluster ||
    !areRedundantNavTitles(
      catalogBlurb(locale, cluster.title),
      catalogBlurb(locale, topic.title),
    )
  ) {
    trail.push({
      label: catalogBlurb(locale, topic.title),
      href: withLocale(locale, topicHref(topic)),
    });
  }
  return trail;
}

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
    sections === undefined ? groups : navGroupsForPath(sections, pathname);

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
      (isActiveHref(pathname, group.href) ||
        isActiveHref(pathname, group.leafTopic.href))
    ) {
      return withConcept(
        home,
        [{ label: group.title, href: navGroupCrumbHref(group, pathname) }],
        group.leafTopic,
        hashId,
      );
    }

    if (isActiveHref(pathname, group.href)) {
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
                  {
                    label: group.title,
                    href: navGroupCrumbHref(group, pathname),
                  },
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
            if (cluster && isActiveHref(pathname, entry.subject.href)) {
              const clusterCrumbs = subjectHubClusterCrumbs(
                cluster,
                entry.subject,
                pathname,
              );
              if (clusterCrumbs.length > 0) {
                return [
                  home,
                  {
                    label: group.title,
                    href: navGroupCrumbHref(group, pathname),
                  },
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
          if (!isActiveHref(pathname, entry.topic.href)) {
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
          if (isActiveHref(pathname, entry.subject.href)) {
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
                  {
                    label: group.title,
                    href: navGroupCrumbHref(group, pathname),
                  },
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
              clusterHit.cluster.id === hashId
            ) {
              const clusterCrumbs = subjectHubClusterCrumbs(
                clusterHit.cluster,
                entry.subject,
                pathname,
              );
              if (clusterCrumbs.length > 0) {
                return [
                  home,
                  {
                    label: group.title,
                    href: navGroupCrumbHref(group, pathname),
                  },
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
                  {
                    label: group.title,
                    href: navGroupCrumbHref(group, pathname),
                  },
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
          const catalogTopic = catalogTopicFromPathname(pathname);
          if (catalogTopic?.grouping?.subject === entry.subject.slug) {
            const catalogCrumbs = catalogGroupedTopicCrumbs(
              home,
              group,
              entry.subject,
              catalogTopic,
              pathname,
              hashId,
              locale,
              loopGroups,
            );
            if (catalogCrumbs) {
              return catalogCrumbs;
            }
          }
          for (const cluster of navSubjectClusters(entry.subject)) {
            for (const root of clusterNavTopicRoots(cluster)) {
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
                  {
                    label: group.title,
                    href: navGroupCrumbHref(group, pathname),
                  },
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
          if (isActiveHref(pathname, entry.subjectHref)) {
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
                {
                  label: group.title,
                  href: navGroupCrumbHref(group, pathname),
                },
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

  const { rest: logicalPath } = peelSectionPrefix(path);
  const segments = logicalPath.slice(1).split("/").filter(Boolean);
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
      if (subject && trackGroup) {
        const trail = catalogTopicTrailCrumbs(
          trackGroup,
          subject,
          topic,
          pathname,
          locale,
        );
        const navTopic =
          findNavTopicBySlug(loopGroups, topic.slug) ??
          findNavTopicBySlug(groups, topic.slug) ??
          findNavTopicOnPath(loopGroups, pathname) ??
          findNavTopicOnPath(groups, pathname);
        if (navTopic) {
          return withConcept(home, trail, navTopic, hashId);
        }
        return [...[home], ...trail];
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
