"use client";

import { memo } from "react";
import Link from "next/link";
import { SidebarHighlightedText } from "@/components/search";
import type { TrackId } from "@/lib/catalog";
import {
  CHROME,
  conceptBodySnippet,
  conceptHref,
  conceptMatchesQuery,
  type NavCluster,
  type NavConcept,
  type NavSection,
  type NavSubject,
  type NavTopic,
  type SearchMode,
  splitHref,
} from "@/lib/nav";
import {
  areRedundantNavTitles,
  filterInterviewConcepts,
  isRedundantSubjectTopicNavRow,
  isRedundantTopicConceptTitle,
  navTopicWithLiveConcepts,
  sameTitle,
  shouldShowTopicConceptFold,
} from "@/lib/nav/navUtils";
import { useTopicNavConcepts } from "@/components/topic/context/TopicNavConceptsContext";
import { navTopicTreeContainsHref } from "@/lib/nav/topicTree";
import { BookmarkStar } from "../ui/BookmarkButton";
import { NavChevron, NavFold } from "../ui/NavFold";
import { NavGuide } from "../ui/NavGuide";
import {
  applySameDocumentHref,
  followHandbookHref,
  hashIdFrom,
  queueHandbookHref,
  replacePathHash,
  setHashOnPath,
} from "../utils/hash";
import { pinNavElement, pinNavForHref } from "../utils/sidebarPin";
import { localeFromPathname } from "@/lib/i18n/paths";
import {
  subjectCautionLabel,
  subjectCautionTooltip,
} from "@/lib/nav/subjectCaution";
import {
  closedSectionKey,
  clusterKey,
  isNavSectionCollapsible,
  isNavSectionOpen,
  sectionKey,
  isActiveHref,
  isConceptActiveOnPage,
  closedSubjectKey,
  isOnSubjectPath,
  isSubjectForceClosed,
  topicIsMobileNavLeaf,
} from "../utils/location";
import { clusterHasActiveConcept } from "../utils/location/shared";
import {
  conceptGroupSectionDomId,
  isConceptGroupSectionId,
} from "@/lib/nav/conceptGroupSection";
import { NavCautionBadge } from "../ui/NavCautionBadge";
import { clusterNavigateHref } from "@/lib/nav/sections";
import {
  conspectClusterExpandsInSidebar,
  conspectClusterLeavesInSidebar,
  conspectSubjectHubSectionWithConcepts,
  navSidebarSchema,
} from "@/lib/nav/conspectSidebar";
import {
  closeNavSoon,
  navPathHighlighted,
  navPathPinned,
  NAV_ROW_GAP,
  rowClass,
  useScopedSidebarFold,
  useSidebarActive,
  useSidebarBookmarks,
  useSidebarChrome,
  useSidebarFoldScope,
  useSidebarHighlight,
} from "../context/sidebarContext";
import { useHandbookMobileNavOpen } from "../context/handbookMobileNavContext";
import {
  offHubClusterFoldCollapse,
  subjectHubClusterFoldClick,
  topicPageClusterFoldClick,
} from "@/lib/nav/sidebarClusterFoldToggle";

function applySidebarClusterFoldHash(
  pathname: string,
  replaceHashWith: string | null,
): void {
  if (replaceHashWith === null) {
    return;
  }
  replacePathHash(pathname, replaceHashWith);
}

function nestedClusterFoldMatches(
  cluster: NavCluster,
  subjectPath: string,
  openClusterKey: string | null,
  activeConceptId: string,
  onHub: boolean,
): boolean {
  return (cluster.nestedClusters ?? []).some((nested) => {
    const nestedKey = clusterKey(subjectPath, nested.id);
    if (openClusterKey === nestedKey) {
      return true;
    }
    if (
      onHub &&
      isConceptGroupSectionId(nested.id) &&
      activeConceptId === nested.id
    ) {
      return true;
    }
    return (
      activeConceptId.length > 0 &&
      clusterHasActiveConcept(nested, activeConceptId)
    );
  });
}

function RowTitle({
  text,
  query,
  marker = false,
  open = false,
}: {
  text: string;
  query: string;
  marker?: boolean;
  open?: boolean;
}) {
  return (
    <span className="flex min-w-0 flex-1 items-center gap-1.5">
      {marker ? (
        <span
          aria-hidden="true"
          className="w-3 shrink-0 text-center leading-none text-zinc-500 dark:text-zinc-400"
        >
          {open ? "−" : "+"}
        </span>
      ) : null}
      <SidebarHighlightedText
        text={text}
        query={query}
        className="min-w-0 leading-snug"
      />
    </span>
  );
}

function visibleConcepts(topic: NavTopic, query: string, mode: SearchMode) {
  const needle = query.trim().toLowerCase();
  const matched =
    needle.length === 0
      ? topic.concepts
      : topic.concepts.filter((concept) =>
          conceptMatchesQuery(concept, needle, mode),
        );
  if (matched.length > 1) {
    return matched;
  }
  const only = matched.length === 1 ? matched[0] : undefined;
  if (only && isRedundantTopicConceptTitle(topic.title, only.title)) {
    if (
      mode === "notes" &&
      needle.length > 0 &&
      conceptBodySnippet(only, query, mode)
    ) {
      return matched;
    }
    return [];
  }
  return matched;
}

function conceptRowClass(
  active: boolean,
  indentClass: string,
  rowGapClass: string,
): string {
  const shared =
    "block min-h-11 w-full touch-manipulation cursor-pointer rounded-md px-2 py-1.5 text-sm font-medium ring-1 ring-inset transition-[color,background-color,box-shadow] duration-150 ease-out motion-reduce:transition-none sm:min-h-8";
  const highlight = active
    ? `${shared} text-zinc-900 bg-yellow-50 ring-yellow-200 dark:bg-yellow-950 dark:text-zinc-50 dark:ring-yellow-800`
    : `${shared} text-zinc-600 bg-transparent ring-transparent hover:bg-yellow-50 dark:text-zinc-400 dark:hover:bg-yellow-950/60`;
  return `${highlight} ${indentClass}${rowGapClass ? ` ${rowGapClass}` : ""}`;
}

export const ConceptLink = memo(function ConceptLink({
  topicHref,
  concept,
  isFirstConcept,
  conceptActive,
  onPath = false,
  indentClass = "pl-4",
  rowGapClass = "",
}: {
  topicHref: string;
  concept: NavConcept;
  isFirstConcept: boolean;
  conceptActive: boolean;
  onPath?: boolean;
  indentClass?: string;
  rowGapClass?: string;
}) {
  const { query, mode, pathname, onNavigate, goToPath } = useSidebarChrome();
  const { isBookmarked } = useSidebarBookmarks();
  const snippet = conceptBodySnippet(concept, query, mode);
  const bookmarked = isBookmarked(topicHref, concept.id);
  return (
    <a
      href={conceptHref(topicHref, concept.id)}
      data-concept-id={concept.id}
      data-nav-path={onPath ? "true" : undefined}
      data-search-hit={isFirstConcept ? "true" : undefined}
      data-search-in={snippet ? "notes" : undefined}
      onClick={(event) => {
        event.preventDefault();
        if (pathname === topicHref) {
          setHashOnPath(pathname, concept.id, false);
          closeNavSoon(onNavigate);
          return;
        }
        closeNavSoon(onNavigate);
        followHandbookHref(
          conceptHref(topicHref, concept.id),
          pathname,
          goToPath,
        );
      }}
      className={conceptRowClass(conceptActive, indentClass, rowGapClass)}
    >
      <span className="flex items-baseline justify-between gap-2">
        <span className="min-w-0">
          <SidebarHighlightedText text={concept.title} query={query} />
        </span>
        <span className="flex shrink-0 items-baseline gap-1.5">
          {snippet ? (
            <span className="text-[10px] font-medium tracking-wide text-zinc-400 uppercase dark:text-zinc-500">
              {CHROME.inNotes}
            </span>
          ) : null}
          {bookmarked ? <BookmarkStar /> : null}
        </span>
      </span>
      {snippet ? (
        <span className="mt-0.5 block text-xs font-normal leading-snug text-zinc-500 dark:text-zinc-400">
          <SidebarHighlightedText text={snippet} query={query} />
        </span>
      ) : null}
    </a>
  );
});

function conceptsBySidebarGroup(
  topic: NavTopic,
  concepts: readonly NavConcept[],
  ancestorTitle?: string,
): {
  readonly ungrouped: readonly NavConcept[];
  readonly groups: readonly {
    readonly label: string;
    readonly concepts: readonly NavConcept[];
  }[];
} {
  const ungrouped: NavConcept[] = [];
  const order: string[] = [];
  const byLabel = new Map<string, NavConcept[]>();

  for (const concept of concepts) {
    const rawGroup = concept.group?.trim();
    const useGroup =
      rawGroup != null &&
      rawGroup.length > 0 &&
      !sameTitle(rawGroup, topic.title) &&
      !(ancestorTitle != null && sameTitle(rawGroup, ancestorTitle)) &&
      !sameTitle(rawGroup, concept.title);
    if (!useGroup) {
      ungrouped.push(concept);
      continue;
    }
    if (!byLabel.has(rawGroup)) {
      order.push(rawGroup);
      byLabel.set(rawGroup, []);
    }
    byLabel.get(rawGroup)?.push(concept);
  }

  return {
    ungrouped,
    groups: order.map((label) => ({
      label,
      concepts: byLabel.get(label) ?? [],
    })),
  };
}

const ConceptGroupRow = memo(function ConceptGroupRow({
  trackId,
  topic,
  groupLabel,
  concepts,
  indentClass = "pl-4",
  rowGapClass = "",
}: {
  trackId: TrackId;
  topic: NavTopic;
  groupLabel: string;
  concepts: readonly NavConcept[];
  indentClass?: string;
  rowGapClass?: string;
}) {
  const { query, pathname, searching, first } = useSidebarChrome();
  const { highlightPathname, stackPathPins } = useSidebarHighlight();
  const { fold, patchFold } = useScopedSidebarFold();
  const { activeConceptId } = useSidebarActive();
  const topicPath = topic.href.split("#")[0] ?? topic.href;
  const sectionId = conceptGroupSectionDomId(groupLabel);
  const navigateHref = `${topicPath}#${sectionId}`;
  const key = clusterKey(topicPath, sectionId);
  const { clusterKey: openClusterKey } = fold(trackId);
  const onTopic =
    pathname === topicPath || navTopicTreeContainsHref(topic, pathname);
  const groupHashActive = onTopic && activeConceptId === sectionId;
  const childConceptActive =
    onTopic && concepts.some((concept) => activeConceptId === concept.id);
  const groupOpen =
    searching ||
    openClusterKey === key ||
    groupHashActive ||
    childConceptActive;
  const isHitCluster =
    first?.pathname === topicPath && first.hash === `#${sectionId}`;
  const onPath = !searching && (groupHashActive || childConceptActive);
  const pinPath = navPathPinned(onPath, groupHashActive, stackPathPins);

  return (
    <li className="contents">
      <Link
        href={navigateHref}
        prefetch={false}
        scroll={false}
        data-nav="cluster"
        data-nav-id={sectionId}
        data-nav-path={pinPath ? "true" : undefined}
        data-nav-pin={pinPath ? "cluster" : undefined}
        onClick={(event) => {
          pinNavForHref(event.currentTarget, pathname, navigateHref);
          if (onTopic) {
            event.preventDefault();
            const hashFragment = `#${sectionId}`;
            const sameHash = window.location.hash === hashFragment;
            const click = topicPageClusterFoldClick(
              openClusterKey,
              key,
              hashFragment,
              sameHash,
              groupHashActive,
            );
            if (!searching) {
              patchFold(trackId, {
                clusterKey: click.clusterKey,
                topicHref: topic.href,
              });
            }
            applySidebarClusterFoldHash(pathname, click.replaceHashWith);
            return;
          }
          if (!searching && offHubClusterFoldCollapse(openClusterKey, key)) {
            event.preventDefault();
            patchFold(trackId, { clusterKey: null, topicHref: topic.href });
            return;
          }
          patchFold(trackId, { clusterKey: key, topicHref: topic.href });
          queueHandbookHref(navigateHref);
        }}
        data-search-hit={isHitCluster ? "true" : undefined}
        aria-current={groupHashActive ? "location" : undefined}
        aria-expanded={groupOpen}
        className={`${rowClass(
          navPathHighlighted(
            isHitCluster || groupHashActive,
            onPath,
            stackPathPins,
          ),
          pinPath,
          indentClass,
        )} ${rowGapClass}`}
      >
        <RowTitle text={groupLabel} query={query} marker open={groupOpen} />
        {groupOpen ? (
          <span className="mt-0.5 shrink-0">
            <NavChevron open />
          </span>
        ) : null}
      </Link>
      <NavFold open={groupOpen} instant={searching} unbox>
        <ul className="contents">
          <ConceptFlatLinks
            topic={topic}
            concepts={concepts}
            indentClass={indentClass === "pl-4" ? "pl-8" : "pl-6"}
          />
        </ul>
      </NavFold>
    </li>
  );
});

function ConceptFlatLinks({
  topic,
  concepts,
  indentClass = "pl-4",
}: {
  topic: NavTopic;
  concepts: readonly NavConcept[];
  indentClass?: string;
}) {
  const { first, searching } = useSidebarChrome();
  const { highlightPathname, stackPathPins } = useSidebarHighlight();
  const { activeConceptId } = useSidebarActive();
  return (
    <>
      {concepts.map((concept, index) => {
        const conceptActive = isConceptActiveOnPage(
          highlightPathname,
          topic.href,
          concept.id,
          activeConceptId,
        );
        const isFirstConcept =
          first?.pathname === topic.href && first.hash === `#${concept.id}`;
        const onPath = conceptActive && !searching;
        const pinPath = navPathPinned(onPath, true, stackPathPins);
        return (
          <li key={concept.id} className="contents">
            <ConceptLink
              topicHref={topic.href}
              concept={concept}
              isFirstConcept={isFirstConcept}
              conceptActive={conceptActive}
              onPath={pinPath}
              indentClass={indentClass}
              rowGapClass={index === 0 ? NAV_ROW_GAP : "mt-0.5"}
            />
          </li>
        );
      })}
    </>
  );
}

function ConceptItems({
  trackId,
  topic,
  concepts,
  indentClass = "pl-4",
  ancestorTitle,
}: {
  trackId: TrackId;
  topic: NavTopic;
  concepts: readonly NavConcept[];
  indentClass?: string;
  /** Subject (or track) title already shown on the parent sidebar row. */
  ancestorTitle?: string;
}) {
  const { searching } = useSidebarChrome();
  if (searching) {
    return (
      <ConceptFlatLinks
        topic={topic}
        concepts={concepts}
        indentClass={indentClass}
      />
    );
  }

  const { ungrouped, groups } = conceptsBySidebarGroup(
    topic,
    concepts,
    ancestorTitle,
  );
  if (groups.length === 0) {
    return (
      <ConceptFlatLinks
        topic={topic}
        concepts={concepts}
        indentClass={indentClass}
      />
    );
  }

  return (
    <>
      {ungrouped.length > 0 ? (
        <ConceptFlatLinks
          topic={topic}
          concepts={ungrouped}
          indentClass={indentClass}
        />
      ) : null}
      {groups
        .filter(
          (group) =>
            !(ancestorTitle != null && sameTitle(group.label, ancestorTitle)),
        )
        .map((group, index) => (
          <ConceptGroupRow
            key={group.label}
            trackId={trackId}
            topic={topic}
            groupLabel={group.label}
            concepts={group.concepts}
            indentClass={indentClass}
            rowGapClass={
              index === 0 && ungrouped.length === 0 ? NAV_ROW_GAP : "mt-0.5"
            }
          />
        ))}
    </>
  );
}

const SECTION_TOPIC_INDENT = "pl-6";
const SECTION_TOPIC_CONCEPT_INDENT = "pl-8";

const SectionTopicLink = memo(function SectionTopicLink({
  trackId,
  topic,
  title,
  navId,
  rowGapClass = "",
}: {
  trackId: TrackId;
  topic: NavTopic;
  title: string;
  navId: string;
  rowGapClass?: string;
}) {
  const { query, mode, pathname, searching, first, onNavigate, goToPath } =
    useSidebarChrome();
  const { highlightPathname, stackPathPins } = useSidebarHighlight();
  const { activeConceptId } = useSidebarActive();
  const { fold, patchFold } = useScopedSidebarFold();
  const { topicHref: openTopicHref } = fold(trackId);
  const { isBookmarked } = useSidebarBookmarks();
  const topicNavConcepts = useTopicNavConcepts();
  const navTopic = navTopicWithLiveConcepts(topic, pathname, topicNavConcepts);
  const nestedTopics = topic.nestedTopics ?? [];
  const hasNestedTopics = nestedTopics.length > 0;
  const nestedOnPath =
    !searching &&
    nestedTopics.some((nested) => isActiveHref(highlightPathname, nested.href));
  const nestedOpen =
    hasNestedTopics &&
    nestedTopics.some((nested) => openTopicHref === nested.href);
  const active = isActiveHref(highlightPathname, topic.href);
  const isHitTopic = first?.pathname === topic.href;
  const isFirstTopic = isHitTopic && first.hash === "";
  const onPath = !searching && (active || nestedOnPath);
  const mobileLeaf = topicIsMobileNavLeaf(
    active,
    highlightPathname,
    topic.href,
    activeConceptId,
    nestedOnPath,
  );
  const pinPath = navPathPinned(onPath, mobileLeaf, stackPathPins);
  const bookmarked = isBookmarked(topic.href);
  const concepts = visibleConcepts(navTopic, query, mode);
  const sidebarConcepts = searching
    ? concepts
    : filterInterviewConcepts(navTopic, concepts);
  const hasConceptGroups = navTopic.concepts.some((concept) =>
    Boolean(concept.group),
  );
  const showConceptNav =
    (!navTopic.hideSidebarConcepts || hasConceptGroups) &&
    sidebarConcepts.length > 0 &&
    (!hasNestedTopics || navTopic.concepts.length > 0);
  const showTopicFold =
    (showConceptNav &&
      shouldShowTopicConceptFold(
        navTopic.title,
        navTopic.concepts,
        sidebarConcepts.length,
      )) ||
    (hasNestedTopics && nestedTopics.length > 0);
  const topicFoldOpen =
    openTopicHref === topic.href || nestedOpen || nestedOnPath;
  const topicOpen = searching
    ? showConceptNav || hasNestedTopics
    : showTopicFold && topicFoldOpen;

  const linkClass = `${rowClass(
    navPathHighlighted(isHitTopic || active, onPath, stackPathPins),
    pinPath,
    SECTION_TOPIC_INDENT,
  )}${rowGapClass ? ` ${rowGapClass}` : ""}`;

  return (
    <>
      <Link
        href={topic.href}
        prefetch={false}
        scroll={false}
        data-nav="topic"
        data-nav-id={navId}
        data-nav-path={pinPath ? "true" : undefined}
        data-search-hit={isFirstTopic ? "true" : undefined}
        aria-current={active ? "page" : undefined}
        aria-expanded={showTopicFold ? topicOpen : undefined}
        onClick={(event) => {
          if (pathname === topic.href) {
            event.preventDefault();
            pinNavElement(event.currentTarget, {
              hold: false,
              scrollIntoView: false,
            });
            if (window.location.hash) {
              applySameDocumentHref(pathname, "", pathname);
            }
            if (!searching && showTopicFold) {
              patchFold(trackId, {
                topicHref: openTopicHref === topic.href ? null : topic.href,
              });
            }
            if (!showTopicFold) {
              closeNavSoon(onNavigate);
            }
            return;
          }
          pinNavForHref(event.currentTarget, pathname, topic.href);
          queueHandbookHref(topic.href);
          patchFold(trackId, {
            topicHref: showTopicFold ? topic.href : null,
          });
          if (!showTopicFold) {
            closeNavSoon(onNavigate);
            followHandbookHref(topic.href, pathname, goToPath);
          }
        }}
        className={linkClass}
      >
        <span className="flex min-w-0 flex-1 items-start gap-1.5">
          <RowTitle
            text={title}
            query={query}
            marker={showTopicFold}
            open={topicOpen}
          />
        </span>
        {bookmarked ? <BookmarkStar /> : null}
        {showTopicFold ? (
          <span className="mt-0.5 shrink-0">
            <NavChevron open={topicOpen} />
          </span>
        ) : null}
      </Link>
      <NavFold open={topicOpen && showTopicFold} instant={searching} unbox>
        <ul className="contents">
          {showConceptNav ? (
            <TopicConceptNav
              trackId={trackId}
              topic={navTopic}
              concepts={sidebarConcepts}
              indentClass={SECTION_TOPIC_CONCEPT_INDENT}
            />
          ) : null}
          {nestedTopics.map((nested, index) => (
            <li key={nested.slug} className="contents">
              <SectionTopicLink
                trackId={trackId}
                topic={nested}
                title={nested.title}
                navId={nested.slug}
                rowGapClass={index === 0 ? NAV_ROW_GAP : "mt-0.5"}
              />
            </li>
          ))}
        </ul>
      </NavFold>
    </>
  );
});

function SectionClusterNav({
  flatNav = false,
  clusterLeafInSidebar = false,
  trackId,
  subjectHref,
  cluster,
  rowGapClass = "",
}: {
  flatNav?: boolean;
  clusterLeafInSidebar?: boolean;
  trackId: TrackId;
  subjectHref: string;
  cluster: NavCluster;
  rowGapClass?: string;
}) {
  if (flatNav && clusterLeafInSidebar) {
    return (
      <ClusterRow
        trackId={trackId}
        subjectHref={subjectHref}
        cluster={cluster}
        leafInSidebar
      />
    );
  }

  if (flatNav) {
    return (
      <>
        {cluster.topics.map((topic, index) => (
          <li key={topic.slug} className="contents">
            <SectionTopicLink
              trackId={trackId}
              topic={topic}
              title={cluster.topics.length === 1 ? cluster.title : topic.title}
              navId={cluster.topics.length === 1 ? cluster.id : topic.slug}
              rowGapClass={index === 0 ? rowGapClass : "mt-0.5"}
            />
          </li>
        ))}
      </>
    );
  }

  return (
    <ClusterRow
      trackId={trackId}
      subjectHref={subjectHref}
      cluster={cluster}
      leafInSidebar={clusterLeafInSidebar}
    />
  );
}

function SectionClusterList({
  flatNav = false,
  clusterLeafInSidebar = false,
  trackId,
  subjectHref,
  clusters,
}: {
  flatNav?: boolean;
  clusterLeafInSidebar?: boolean;
  trackId: TrackId;
  subjectHref: string;
  clusters: readonly NavCluster[];
}) {
  return (
    <>
      {clusters.map((cluster, index) => (
        <SectionClusterNav
          key={cluster.id}
          flatNav={flatNav}
          clusterLeafInSidebar={clusterLeafInSidebar}
          trackId={trackId}
          subjectHref={subjectHref}
          cluster={cluster}
          rowGapClass={index === 0 ? NAV_ROW_GAP : "mt-0.5"}
        />
      ))}
    </>
  );
}

function TopicConceptNav({
  trackId,
  topic,
  concepts,
  indentClass = "pl-4",
  ancestorTitle,
}: {
  trackId: TrackId;
  topic: NavTopic;
  concepts: readonly NavConcept[];
  indentClass?: string;
  ancestorTitle?: string;
}) {
  return (
    <ConceptItems
      trackId={trackId}
      topic={topic}
      concepts={concepts}
      indentClass={indentClass}
      ancestorTitle={ancestorTitle}
    />
  );
}

export function TopicRow({
  trackId,
  topic,
  compact = false,
  hideTitle = false,
  navKind = "topic",
  navId,
  linkHref,
  stackSiblingGap = false,
  ancestorTitle,
}: {
  trackId: TrackId;
  topic: NavTopic;
  compact?: boolean;
  hideTitle?: boolean;
  navKind?: "cluster" | "topic";
  navId?: string;
  /** When set, navigation targets this href while fold state uses `topic.href`. */
  linkHref?: string;
  /** Extra bottom gap between this row and the next subject-cluster sibling. */
  stackSiblingGap?: boolean;
  /** Parent subject/track title — suppress duplicate group rows. */
  ancestorTitle?: string;
}) {
  const { query, mode, pathname, searching, first, onNavigate, goToPath } =
    useSidebarChrome();
  const mobileNavOpen = useHandbookMobileNavOpen();
  const { highlightPathname, stackPathPins } = useSidebarHighlight();
  const { activeConceptId } = useSidebarActive();
  const { fold, patchFold } = useScopedSidebarFold();
  const { topicHref: openTopicHref, clusterKey: openClusterKey } =
    fold(trackId);
  const { isBookmarked } = useSidebarBookmarks();
  const topicNavConcepts = useTopicNavConcepts();
  const navHref = linkHref ?? topic.href;
  const { pathname: navHrefPath, hash: navHrefHash } = splitHref(navHref);
  const onSubjectHub =
    navKind === "cluster" &&
    Boolean(navId) &&
    navHrefHash.length > 0 &&
    pathname === navHrefPath;
  const onConspectClusterTopicPage =
    navKind === "cluster" &&
    Boolean(navId) &&
    navHrefHash.length === 0 &&
    pathname === navHrefPath;
  const hubClusterKey =
    onSubjectHub && navId ? clusterKey(navHrefPath, navId) : null;
  const navTopic = navTopicWithLiveConcepts(
    topic,
    pathname === topic.href || onSubjectHub ? pathname : navHrefPath,
    topicNavConcepts,
  );
  const nestedTopics = topic.nestedTopics ?? [];
  const hasNestedTopics = nestedTopics.length > 0;
  const nestedOnPath =
    !searching &&
    nestedTopics.some((nested) => isActiveHref(highlightPathname, nested.href));
  const nestedOpen =
    hasNestedTopics &&
    nestedTopics.some((nested) => openTopicHref === nested.href);
  const hubClusterActive = onSubjectHub && activeConceptId === navId;
  const hubConceptActive =
    (onSubjectHub || onConspectClusterTopicPage) &&
    Boolean(navId) &&
    clusterHasActiveConcept(
      {
        id: navId ?? "",
        title: topic.title,
        href: navHref,
        topics: [navTopic],
      },
      activeConceptId,
    );
  const hubClusterOpen = Boolean(
    hubClusterKey && openClusterKey === hubClusterKey,
  );
  /** Intro groups share `topic.href` with the subject hub; only highlight the active section. */
  const isSubjectHubSectionRow =
    navKind === "cluster" &&
    isActiveHref(highlightPathname, topic.href) &&
    navHrefHash.length > 0;
  const active = isSubjectHubSectionRow
    ? hubClusterActive || hubConceptActive
    : isActiveHref(highlightPathname, topic.href) ||
      hubClusterActive ||
      hubConceptActive;
  const isHitTopic =
    first?.pathname === navHrefPath &&
    (navHrefHash.length === 0 ? first.hash === "" : first.hash === navHrefHash);
  const isFirstTopic = isHitTopic && first.hash === "";
  const concepts = visibleConcepts(navTopic, query, mode);
  const hasConcepts = concepts.length > 0;
  const sidebarConcepts = searching
    ? concepts
    : filterInterviewConcepts(navTopic, concepts);
  const hasConceptGroups = navTopic.concepts.some((concept) =>
    Boolean(concept.group),
  );
  const showConceptNav =
    (!navTopic.hideSidebarConcepts || hasConceptGroups) &&
    sidebarConcepts.length > 0 &&
    (!hasNestedTopics || navTopic.concepts.length > 0);
  const showTopicFold =
    (showConceptNav &&
      shouldShowTopicConceptFold(
        navTopic.title,
        navTopic.concepts,
        sidebarConcepts.length,
      )) ||
    (hasNestedTopics && nestedTopics.length > 1) ||
    (hasNestedTopics && sidebarConcepts.length > 0) ||
    (onSubjectHub && showConceptNav);
  const showLoneNested =
    hasNestedTopics && nestedTopics.length === 1 && !showConceptNav;
  const onPath =
    !searching &&
    (active || nestedOnPath || hubConceptActive || hubClusterOpen);
  const mobileLeaf = topicIsMobileNavLeaf(
    active,
    highlightPathname,
    navTopic.href,
    activeConceptId,
    nestedOnPath,
  );
  const pinPath = navPathPinned(onPath, mobileLeaf, stackPathPins);
  /** Intro concept groups share `topic.href` with the subject hub URL — never key off `openTopicHref` alone. */
  const topicFoldOpen = onSubjectHub
    ? hubClusterOpen || hubConceptActive || nestedOpen || nestedOnPath
    : openTopicHref === navTopic.href ||
      nestedOpen ||
      nestedOnPath ||
      hubClusterOpen ||
      hubConceptActive ||
      (onConspectClusterTopicPage && hubConceptActive);
  const topicOpen = hideTitle
    ? showConceptNav
    : searching
      ? (!navTopic.hideSidebarConcepts || hasConceptGroups) &&
        (hasConcepts || hasNestedTopics)
      : (showTopicFold && topicFoldOpen) ||
        (onSubjectHub && (hubClusterOpen || hubConceptActive));
  const topicBookmarked = isBookmarked(navTopic.href);
  // Flatten sticky headers into the track list so nested containing blocks cannot
  // drag Core/Structure above Frontend/HTML while siblings scroll.
  const indent = compact ? (navKind === "cluster" ? "pl-4" : "pl-6") : "";
  const conceptIndent = compact ? "pl-8" : "pl-4";

  if (hideTitle) {
    if (!showConceptNav && !hasNestedTopics) {
      return null;
    }
    return (
      <li className="contents">
        <ul className="contents">
          {showConceptNav ? (
            <TopicConceptNav
              trackId={trackId}
              topic={navTopic}
              concepts={sidebarConcepts}
              indentClass={conceptIndent}
              ancestorTitle={ancestorTitle}
            />
          ) : null}
          {nestedTopics.map((nested, index) => (
            <li key={nested.slug} className="contents">
              <SectionTopicLink
                trackId={trackId}
                topic={nested}
                title={nested.title}
                navId={nested.slug}
                rowGapClass={index === 0 ? NAV_ROW_GAP : "mt-0.5"}
              />
            </li>
          ))}
        </ul>
      </li>
    );
  }

  return (
    <li className="contents">
      <Link
        href={navHref}
        prefetch={false}
        scroll={false}
        data-nav={navKind}
        data-nav-id={navId ?? topic.slug}
        data-nav-path={pinPath ? "true" : undefined}
        data-nav-pin={navKind === "cluster" && pinPath ? "cluster" : undefined}
        onClick={(event) => {
          if (onSubjectHub && navId) {
            event.preventDefault();
            pinNavForHref(event.currentTarget, pathname, navHref);
            const key = hubClusterKey!;
            const hashFragment = `#${navId}`;
            const sameHash = window.location.hash === hashFragment;
            const click = subjectHubClusterFoldClick(
              openClusterKey,
              key,
              navId,
              hashFragment,
              sameHash,
              hubClusterActive,
            );
            if (!searching) {
              patchFold(trackId, {
                clusterKey: click.clusterKey,
                topicHref: null,
              });
            }
            applySidebarClusterFoldHash(pathname, click.replaceHashWith);
            return;
          }
          if (mobileNavOpen && !searching && showTopicFold) {
            event.preventDefault();
            pinNavElement(event.currentTarget, {
              hold: false,
              scrollIntoView: false,
            });
            patchFold(trackId, {
              topicHref: topicOpen ? null : topic.href,
            });
            return;
          }
          if (pathname === topic.href) {
            event.preventDefault();
            pinNavElement(event.currentTarget, {
              hold: false,
              scrollIntoView: false,
            });
            if (window.location.hash) {
              applySameDocumentHref(pathname, "", pathname);
            }
            if (!searching && showTopicFold) {
              patchFold(trackId, {
                topicHref: openTopicHref === topic.href ? null : topic.href,
              });
            }
            if (!showTopicFold) {
              closeNavSoon(onNavigate);
            }
            return;
          }
          pinNavForHref(event.currentTarget, pathname, topic.href);
          event.preventDefault();
          patchFold(trackId, {
            topicHref: showTopicFold ? topic.href : null,
          });
          if (!showTopicFold) {
            closeNavSoon(onNavigate);
          }
          followHandbookHref(topic.href, pathname, goToPath);
        }}
        data-search-hit={isFirstTopic ? "true" : undefined}
        aria-current={active ? "page" : undefined}
        aria-expanded={showTopicFold ? topicOpen : undefined}
        className={`${rowClass(
          navPathHighlighted(isHitTopic || active, onPath, stackPathPins),
          pinPath,
          indent,
        )} ${stackSiblingGap ? `${NAV_ROW_GAP} mb-1.5` : NAV_ROW_GAP}`}
      >
        <span className="flex min-w-0 flex-1 items-start gap-1.5">
          <RowTitle
            text={topic.title}
            query={query}
            marker={compact && showTopicFold}
            open={topicOpen}
          />
        </span>
        {topicBookmarked ? <BookmarkStar /> : null}
        {showTopicFold ? (
          compact ? (
            topicOpen ? (
              <span className="mt-0.5 shrink-0">
                <NavChevron open />
              </span>
            ) : null
          ) : (
            <span className="mt-0.5 shrink-0">
              <NavChevron open={topicOpen} large />
            </span>
          )
        ) : null}
      </Link>
      <NavFold
        open={showLoneNested || (topicOpen && showTopicFold)}
        instant={searching}
        unbox
      >
        <ul className="contents">
          {showConceptNav ? (
            <TopicConceptNav
              trackId={trackId}
              topic={navTopic}
              concepts={sidebarConcepts}
              indentClass={conceptIndent}
              ancestorTitle={ancestorTitle}
            />
          ) : null}
          {nestedTopics.map((nested, index) => (
            <li key={nested.slug} className="contents">
              <SectionTopicLink
                trackId={trackId}
                topic={nested}
                title={nested.title}
                navId={nested.slug}
                rowGapClass={index === 0 ? NAV_ROW_GAP : "mt-0.5"}
              />
            </li>
          ))}
        </ul>
      </NavFold>
    </li>
  );
}

export function ClusterRow({
  trackId,
  subjectHref: subjectPath,
  cluster,
  hubFoldExclusive = false,
  leafInSidebar = false,
}: {
  trackId: TrackId;
  subjectHref: string;
  cluster: NavCluster;
  /** Handbook clusters that share the subject hub with collapsible sections. */
  hubFoldExclusive?: boolean;
  /** Conspect subject hubs: cluster rows are leaves (no topic/concept folds). */
  leafInSidebar?: boolean;
}) {
  const { query, mode, pathname, searching, first, goToPath, onNavigate } =
    useSidebarChrome();
  const { highlightPathname, stackPathPins } = useSidebarHighlight();
  const { fold, patchFold } = useScopedSidebarFold();
  const sectionId = useSidebarFoldScope();
  const { clusterKey: openClusterKey } = fold(trackId);
  const { activeConceptId } = useSidebarActive();
  const topicNavConcepts = useTopicNavConcepts();
  const onlyTopic = cluster.topics.length === 1 ? cluster.topics[0] : null;
  const navigateHref = clusterNavigateHref(cluster, sectionId, subjectPath);
  const hubSingleTopic = onlyTopic !== null && onlyTopic.href === subjectPath;
  const singleTopicAsTopicRow =
    onlyTopic && cluster.id === onlyTopic.slug && !hubSingleTopic;
  const hasNestedGroups = (cluster.nestedClusters?.length ?? 0) > 0;
  const foldTopicUnderCluster =
    !hasNestedGroups &&
    onlyTopic !== null &&
    !singleTopicAsTopicRow &&
    (hubSingleTopic || areRedundantNavTitles(cluster.title, onlyTopic.title));

  if (leafInSidebar && !searching) {
    if (hasNestedGroups) {
      return (
        <>
          {cluster.nestedClusters?.map((nested) => (
            <ClusterRow
              key={nested.id}
              trackId={trackId}
              subjectHref={subjectPath}
              cluster={nested}
              leafInSidebar
            />
          ))}
        </>
      );
    }
    const onHub = pathname === subjectPath;
    const active = onHub && activeConceptId === cluster.id;
    const hubConceptActive =
      activeConceptId.length > 0 &&
      clusterHasActiveConcept(cluster, activeConceptId);
    const topicMatchesPath = cluster.topics.some((topic) =>
      navTopicTreeContainsHref(topic, highlightPathname),
    );
    const isHitCluster =
      first?.pathname === subjectPath && first.hash === `#${cluster.id}`;
    const onPath =
      !searching && (active || hubConceptActive || topicMatchesPath);
    const pinPath = navPathPinned(onPath, active, stackPathPins);
    const key = clusterKey(subjectPath, cluster.id);
    const hubSection = onlyTopic
      ? conspectSubjectHubSectionWithConcepts(cluster, subjectPath)
      : false;
    const hubTopicNav = onlyTopic
      ? navTopicWithLiveConcepts(onlyTopic, pathname, topicNavConcepts)
      : null;
    const sidebarConcepts =
      hubTopicNav !== null
        ? searching
          ? visibleConcepts(hubTopicNav, query, mode)
          : filterInterviewConcepts(
              hubTopicNav,
              visibleConcepts(hubTopicNav, query, mode),
            )
        : [];
    const sidebarSchema = navSidebarSchema(sectionId);
    const showHubSectionConcepts =
      sidebarSchema.mode === "two-level" &&
      sidebarSchema.hubSectionConcepts &&
      hubSection &&
      hubTopicNav !== null &&
      !hubTopicNav.hideSidebarConcepts &&
      sidebarConcepts.length > 0;
    const sectionConceptsOpen =
      showHubSectionConcepts &&
      (active || hubConceptActive || openClusterKey === key);

    return (
      <li className="contents">
        <Link
          href={navigateHref}
          prefetch={false}
          scroll={false}
          data-nav="cluster"
          data-nav-id={cluster.id}
          data-nav-path={pinPath ? "true" : undefined}
          data-nav-pin={pinPath ? "cluster" : undefined}
          onClick={(event) => {
            pinNavForHref(event.currentTarget, pathname, navigateHref);
            if (onHub) {
              event.preventDefault();
              const hashFragment = `#${cluster.id}`;
              const sameHash = window.location.hash === hashFragment;
              const click = subjectHubClusterFoldClick(
                openClusterKey,
                key,
                cluster.id,
                hashFragment,
                sameHash,
                active,
                {
                  hubSectionConceptsMode: showHubSectionConcepts,
                  sectionConceptsOpen,
                },
              );
              if (!searching) {
                patchFold(trackId, {
                  clusterKey: click.clusterKey,
                  ...(hubFoldExclusive && !click.closing
                    ? { sectionKey: null, topicHref: null }
                    : {}),
                });
              }
              applySidebarClusterFoldHash(pathname, click.replaceHashWith);
              return;
            }
            if (!searching && offHubClusterFoldCollapse(openClusterKey, key)) {
              event.preventDefault();
              patchFold(trackId, { clusterKey: null });
              return;
            }
            patchFold(trackId, { clusterKey: key });
            queueHandbookHref(navigateHref);
          }}
          data-search-hit={isHitCluster ? "true" : undefined}
          aria-current={active ? "location" : undefined}
          aria-expanded={
            showHubSectionConcepts ? sectionConceptsOpen : undefined
          }
          className={`${rowClass(
            navPathHighlighted(isHitCluster || active, onPath, stackPathPins),
            pinPath,
            "pl-4",
          )} ${NAV_ROW_GAP}`}
        >
          <RowTitle
            text={cluster.title}
            query={query}
            marker={
              showHubSectionConcepts || isConceptGroupSectionId(cluster.id)
            }
            open={
              showHubSectionConcepts
                ? sectionConceptsOpen
                : active || hubConceptActive || openClusterKey === key
            }
          />
          {showHubSectionConcepts ? (
            <NavChevron open={sectionConceptsOpen} />
          ) : null}
        </Link>
        {showHubSectionConcepts && hubTopicNav ? (
          <NavFold open={sectionConceptsOpen} instant={searching} unbox>
            <TopicConceptNav
              trackId={trackId}
              topic={hubTopicNav}
              concepts={sidebarConcepts}
              indentClass="pl-8"
            />
          </NavFold>
        ) : null}
      </li>
    );
  }

  if (singleTopicAsTopicRow) {
    return (
      <TopicRow
        trackId={trackId}
        topic={onlyTopic}
        compact
        navKind="cluster"
        navId={cluster.id}
      />
    );
  }

  if (foldTopicUnderCluster && onlyTopic) {
    return (
      <TopicRow
        trackId={trackId}
        topic={{ ...onlyTopic, title: cluster.title }}
        linkHref={navigateHref}
        compact
        navKind="cluster"
        navId={cluster.id}
        stackSiblingGap={!leafInSidebar}
      />
    );
  }

  const key = clusterKey(subjectPath, cluster.id);
  const onHub = pathname === subjectPath;
  const active = onHub && activeConceptId === cluster.id;
  const hubConceptActive =
    onHub &&
    activeConceptId.length > 0 &&
    clusterHasActiveConcept(cluster, activeConceptId);
  const nestedClusterFoldOpen = nestedClusterFoldMatches(
    cluster,
    subjectPath,
    openClusterKey,
    activeConceptId,
    onHub,
  );
  const clusterOpen =
    searching ||
    openClusterKey === key ||
    active ||
    nestedClusterFoldOpen ||
    (isConceptGroupSectionId(cluster.id) && hubConceptActive) ||
    (!searching &&
      hubConceptActive &&
      (!hubFoldExclusive || openClusterKey === null || openClusterKey === key));
  const isHitCluster =
    first?.pathname === subjectPath && first.hash === `#${cluster.id}`;
  const topicMatchesPath = cluster.topics.some((topic) =>
    navTopicTreeContainsHref(topic, highlightPathname),
  );
  const onHubIndex = onHub && activeConceptId.length === 0;
  const onPath =
    !searching &&
    (active ||
      hubConceptActive ||
      nestedClusterFoldOpen ||
      (isConceptGroupSectionId(cluster.id) && (hubConceptActive || active)) ||
      (topicMatchesPath && !(onHub && hubSingleTopic && onHubIndex)));
  const pinPath = navPathPinned(onPath, active, stackPathPins);

  return (
    <li className="contents">
      <Link
        href={navigateHref}
        prefetch={false}
        scroll={false}
        data-nav="cluster"
        data-nav-id={cluster.id}
        data-nav-path={pinPath ? "true" : undefined}
        data-nav-pin={pinPath ? "cluster" : undefined}
        onClick={(event) => {
          pinNavForHref(event.currentTarget, pathname, navigateHref);
          if (onHub) {
            event.preventDefault();
            if (sectionId === "interviews" && cluster.topics[0]) {
              patchFold(trackId, { clusterKey: key });
              queueHandbookHref(cluster.topics[0].href);
              goToPath(cluster.topics[0].href);
              closeNavSoon(onNavigate);
              return;
            }
            const hashFragment = `#${cluster.id}`;
            const sameHash = window.location.hash === hashFragment;
            const click = subjectHubClusterFoldClick(
              openClusterKey,
              key,
              cluster.id,
              hashFragment,
              sameHash,
              active,
            );
            if (!searching) {
              patchFold(trackId, {
                clusterKey: click.clusterKey,
                ...(hubFoldExclusive && !click.closing
                  ? { sectionKey: null, topicHref: null }
                  : {}),
              });
            }
            applySidebarClusterFoldHash(pathname, click.replaceHashWith);
            return;
          }
          if (!searching && offHubClusterFoldCollapse(openClusterKey, key)) {
            event.preventDefault();
            patchFold(trackId, { clusterKey: null });
            return;
          }
          patchFold(trackId, { clusterKey: key });
          queueHandbookHref(navigateHref);
        }}
        data-search-hit={isHitCluster ? "true" : undefined}
        aria-current={active ? "location" : undefined}
        aria-expanded={clusterOpen}
        className={`${rowClass(
          navPathHighlighted(isHitCluster || active, onPath, stackPathPins),
          pinPath,
          "pl-4",
        )} ${NAV_ROW_GAP}`}
      >
        <RowTitle
          text={cluster.title}
          query={query}
          marker
          open={clusterOpen}
        />
        {clusterOpen ? (
          <span className="shrink-0">
            <NavChevron open />
          </span>
        ) : null}
      </Link>
      <NavFold open={clusterOpen} instant={searching} unbox>
        <ul className="contents">
          {hasNestedGroups
            ? cluster.nestedClusters?.map((nested) => (
                <ClusterRow
                  key={nested.id}
                  trackId={trackId}
                  subjectHref={subjectPath}
                  cluster={nested}
                  hubFoldExclusive={hubFoldExclusive}
                  leafInSidebar={leafInSidebar}
                />
              ))
            : cluster.topics.map((topic) => (
                <TopicRow
                  key={cluster.topics.length === 1 ? cluster.id : topic.slug}
                  trackId={trackId}
                  topic={topic}
                  compact
                  navKind="topic"
                  navId={topic.slug}
                />
              ))}
        </ul>
      </NavFold>
    </li>
  );
}

export function SectionRow({
  trackId,
  subjectHref: subjectPath,
  section,
  clusterLeafInSidebar = false,
}: {
  trackId: TrackId;
  subjectHref: string;
  section: NavSection;
  clusterLeafInSidebar?: boolean;
}) {
  const { query, pathname, searching, first } = useSidebarChrome();
  const { highlightPathname, stackPathPins } = useSidebarHighlight();
  const { fold, patchFold } = useScopedSidebarFold();
  const { activeConceptId } = useSidebarActive();
  const collapsible =
    isNavSectionCollapsible(section) || section.clusters.length > 0;

  const key = sectionKey(subjectPath, section.id);
  const { sectionKey: openSectionKey } = fold(trackId);
  const onHub = pathname === subjectPath;
  const hashMatchesSection = activeConceptId === section.id;
  const hasActiveChild = section.clusters.some(
    (cluster) =>
      activeConceptId === cluster.id ||
      cluster.topics.some((topic) =>
        navTopicTreeContainsHref(topic, highlightPathname),
      ),
  );
  const sectionOpen = isNavSectionOpen(
    section,
    subjectPath,
    openSectionKey,
    searching || hasActiveChild,
  );
  const isHitSection =
    first?.pathname === subjectPath && first.hash === `#${section.id}`;
  const onPath = !searching && (hashMatchesSection || hasActiveChild);
  const pinPath = navPathPinned(onPath, hashMatchesSection, stackPathPins);

  return (
    <li className="contents">
      <Link
        href={`${subjectPath}#${section.id}`}
        prefetch={false}
        scroll={false}
        data-nav="section"
        data-nav-id={section.id}
        data-nav-path={pinPath ? "true" : undefined}
        data-nav-pin={pinPath ? "section" : undefined}
        onClick={(event) => {
          pinNavForHref(
            event.currentTarget,
            pathname,
            `${subjectPath}#${section.id}`,
          );
          const closed = closedSectionKey(subjectPath, section.id);
          if (!searching && (onHub || hasActiveChild)) {
            event.preventDefault();
            const next = `#${section.id}`;
            const sameHash = onHub && window.location.hash === next;
            if (sameHash || hasActiveChild) {
              const opening = !sectionOpen;
              patchFold(trackId, {
                sectionKey: sectionOpen ? closed : key,
                ...(opening ? { clusterKey: null } : {}),
              });
            } else {
              patchFold(trackId, { sectionKey: key, clusterKey: null });
            }
            if (onHub && !sameHash) {
              replacePathHash(pathname, next);
            }
            return;
          }
          patchFold(trackId, { sectionKey: key, clusterKey: null });
          queueHandbookHref(`${subjectPath}#${section.id}`);
        }}
        data-search-hit={isHitSection ? "true" : undefined}
        aria-expanded={sectionOpen}
        className={`${rowClass(
          navPathHighlighted(
            isHitSection || hashMatchesSection,
            onPath,
            stackPathPins,
          ),
          pinPath,
          "pl-4",
        )} ${NAV_ROW_GAP}`}
      >
        <RowTitle
          text={section.title}
          query={query}
          marker
          open={sectionOpen}
        />
        {sectionOpen ? <NavChevron open /> : null}
      </Link>
      <NavFold open={sectionOpen} instant={searching} unbox>
        <ul className="contents">
          <SectionClusterList
            flatNav={section.flatNav}
            clusterLeafInSidebar={clusterLeafInSidebar}
            trackId={trackId}
            subjectHref={subjectPath}
            clusters={section.clusters}
          />
        </ul>
      </NavFold>
    </li>
  );
}

export function SubjectRow({
  trackId,
  subject,
}: {
  trackId: TrackId;
  subject: NavSubject;
}) {
  const sectionId = useSidebarFoldScope();
  const clusterLeafInSidebar = conspectClusterLeavesInSidebar(sectionId);
  const { query, pathname, searching, first, goToPath, onNavigate } =
    useSidebarChrome();
  const { highlightPathname, stackPathPins } = useSidebarHighlight();
  const { fold, patchFold } = useScopedSidebarFold();
  const { subjectHref: openSubjectHref } = fold(trackId);
  const active = isActiveHref(highlightPathname, subject.href);
  const subjectOnPath = isOnSubjectPath(highlightPathname, subject);
  const subjectForceClosed = isSubjectForceClosed(
    subject.href,
    openSubjectHref,
  );
  const subjectOpen =
    searching ||
    (!subjectForceClosed &&
      (openSubjectHref === subject.href || subjectOnPath));
  const isHitSubject = first?.pathname === subject.href && first.hash === "";
  const onPath = !searching && isOnSubjectPath(highlightPathname, subject);
  const pinPath = navPathPinned(onPath, active, stackPathPins);
  const locale = localeFromPathname(pathname);
  const cautionTip = subjectCautionTooltip(locale, subject.slug);
  const hubFoldExclusive =
    subject.sections?.some((section) => isNavSectionCollapsible(section)) ??
    false;
  const subjectHasNavChildren =
    (subject.sections?.length ?? 0) > 0 ||
    (subject.clusters?.length ?? 0) > 0 ||
    Boolean(subject.flatNav);

  function sidebarClustersForSubject(clusters: readonly NavCluster[]) {
    if (!clusterLeafInSidebar) {
      return clusters.map((cluster) => (
        <ClusterRow
          key={cluster.id}
          trackId={trackId}
          subjectHref={subject.href}
          cluster={cluster}
          hubFoldExclusive={hubFoldExclusive}
          leafInSidebar={clusterLeafInSidebar}
        />
      ));
    }
    return clusters.flatMap((cluster) => {
      const onlyTopic = cluster.topics.length === 1 ? cluster.topics[0] : null;
      const titleTwinLoneTopic =
        onlyTopic !== null &&
        areRedundantNavTitles(cluster.title, onlyTopic.title) &&
        (onlyTopic.concepts.length > 0 ||
          (onlyTopic.nestedTopics?.length ?? 0) > 0) &&
        !(cluster.nestedClusters?.length ?? 0);
      const loneSubjectCluster =
        clusters.length === 1 && cluster.topics.length === 1;
      if (
        !clusterLeafInSidebar &&
        (areRedundantNavTitles(cluster.title, subject.title) ||
          (titleTwinLoneTopic && loneSubjectCluster)) &&
        cluster.topics.length > 0
      ) {
        return cluster.topics.map((topic) => {
          const hideTopicTitle = isRedundantSubjectTopicNavRow(
            subject.title,
            topic.title,
          );
          return (
            <TopicRow
              key={topic.slug}
              trackId={trackId}
              topic={topic}
              compact
              hideTitle={hideTopicTitle}
              ancestorTitle={hideTopicTitle ? subject.title : undefined}
              navKind="topic"
              navId={topic.slug}
            />
          );
        });
      }
      if (
        conspectClusterExpandsInSidebar(cluster) &&
        cluster.topics.length > 0
      ) {
        return [
          <ClusterRow
            key={cluster.id}
            trackId={trackId}
            subjectHref={subject.href}
            cluster={cluster}
            hubFoldExclusive={hubFoldExclusive}
            leafInSidebar={false}
          />,
        ];
      }
      return [
        <ClusterRow
          key={cluster.id}
          trackId={trackId}
          subjectHref={subject.href}
          cluster={cluster}
          hubFoldExclusive={hubFoldExclusive}
          leafInSidebar={clusterLeafInSidebar}
        />,
      ];
    });
  }

  return (
    <li className="contents">
      <Link
        href={subject.href}
        prefetch={false}
        data-nav="subject"
        data-nav-id={subject.slug}
        data-nav-path={pinPath ? "true" : undefined}
        onClick={(event) => {
          const closedKey = closedSubjectKey(subject.href);
          if (subjectOpen && !searching) {
            event.preventDefault();
            pinNavElement(event.currentTarget, {
              hold: false,
              scrollIntoView: false,
            });
            const onHub = pathname === subject.href;
            const hubHash = hashIdFrom(
              typeof window !== "undefined" ? window.location.hash : "",
            );
            if (!onHub || hubHash.length > 0) {
              patchFold(trackId, {
                subjectHref: subject.href,
                clusterKey: null,
                sectionKey: null,
                topicHref: null,
              });
              followHandbookHref(subject.href, pathname, goToPath);
              closeNavSoon(onNavigate, subjectHasNavChildren);
              return;
            }
            patchFold(trackId, {
              subjectHref: closedKey,
              clusterKey: null,
              sectionKey: null,
              topicHref: null,
            });
            return;
          }
          if (subjectForceClosed) {
            event.preventDefault();
            pinNavForHref(event.currentTarget, pathname, subject.href);
            patchFold(trackId, { subjectHref: subject.href });
            if (pathname !== subject.href) {
              queueHandbookHref(subject.href);
            }
            return;
          }
          if (pathname === subject.href) {
            event.preventDefault();
            pinNavElement(event.currentTarget, {
              hold: false,
              scrollIntoView: false,
            });
            if (!searching) {
              patchFold(trackId, { subjectHref: subject.href });
            }
            return;
          }
          pinNavForHref(event.currentTarget, pathname, subject.href);
          queueHandbookHref(subject.href);
          patchFold(trackId, { subjectHref: subject.href });
        }}
        data-search-hit={isHitSubject ? "true" : undefined}
        aria-current={active ? "page" : undefined}
        aria-expanded={subjectOpen}
        className={`${rowClass(
          navPathHighlighted(isHitSubject || active, onPath, stackPathPins),
          pinPath,
        )} ${NAV_ROW_GAP}`}
      >
        <RowTitle text={subject.title} query={query} />
        {cautionTip ? (
          <NavCautionBadge
            label={subjectCautionLabel(locale)}
            tip={cautionTip}
          />
        ) : null}
        <NavChevron open={subjectOpen} large />
      </Link>
      <NavFold open={subjectOpen} instant={searching} unbox>
        <ul className="contents">
          {stackPathPins ? <NavGuide level="subject" /> : null}
          {subject.sections?.length ? (
            <>
              {sidebarClustersForSubject(subject.clusters)}
              {subject.sections.map((section) => (
                <SectionRow
                  key={section.id}
                  trackId={trackId}
                  subjectHref={subject.href}
                  section={section}
                  clusterLeafInSidebar={clusterLeafInSidebar}
                />
              ))}
              {subject.clustersAfterSections?.map((cluster) => (
                <ClusterRow
                  key={cluster.id}
                  trackId={trackId}
                  subjectHref={subject.href}
                  cluster={cluster}
                  hubFoldExclusive={hubFoldExclusive}
                  leafInSidebar={clusterLeafInSidebar}
                />
              ))}
            </>
          ) : subject.flatNav ? (
            subject.clusters.flatMap((cluster) =>
              cluster.topics.map((topic) => {
                const hideTopicTitle = isRedundantSubjectTopicNavRow(
                  subject.title,
                  topic.title,
                );
                return (
                  <TopicRow
                    key={topic.slug}
                    trackId={trackId}
                    topic={topic}
                    compact
                    hideTitle={hideTopicTitle}
                    ancestorTitle={hideTopicTitle ? subject.title : undefined}
                    navKind="topic"
                    navId={topic.slug}
                  />
                );
              }),
            )
          ) : (
            sidebarClustersForSubject(subject.clusters)
          )}
        </ul>
      </NavFold>
    </li>
  );
}
