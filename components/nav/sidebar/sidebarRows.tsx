"use client";

import { memo } from "react";
import Link from "next/link";
import { HighlightedText } from "@/components/search";
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
} from "@/lib/nav";
import {
  filterInterviewConcepts,
  isRedundantTopicConceptTitle,
  navTopicWithLiveConcepts,
  sameTitle,
  shouldShowTopicConceptFold,
  withoutRedundantTopicTitles,
} from "@/lib/nav/navUtils";
import { useTopicNavConcepts } from "@/components/topic/context/TopicNavConceptsContext";
import { navTopicTreeContainsHref } from "@/lib/nav/topicTree";
import { BookmarkStar } from "../ui/BookmarkButton";
import { NavChevron, NavFold } from "../ui/NavFold";
import { NavGuide } from "../ui/NavGuide";
import {
  applySameDocumentHref,
  followHandbookHref,
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
  isOnSubjectPath,
  topicIsMobileNavLeaf,
} from "../utils/location";
import { NavCautionBadge } from "../ui/NavCautionBadge";
import { clusterNavigateHref } from "@/lib/nav/sections";
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
    <span className="flex min-w-0 flex-1 items-center">
      {marker ? (
        <span
          aria-hidden="true"
          className="mr-1.5 w-3 shrink-0 text-center text-zinc-500 dark:text-zinc-400"
        >
          {open ? "−" : "+"}
        </span>
      ) : null}
      <HighlightedText text={text} query={query} className="min-w-0" />
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
  const nested = withoutRedundantTopicTitles(
    topic.title,
    matched,
    (concept) => concept.title,
  );
  if (nested.length > 0) {
    return nested;
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
          <HighlightedText text={concept.title} query={query} />
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
          <HighlightedText text={snippet} query={query} />
        </span>
      ) : null}
    </a>
  );
});

function ConceptItems({
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
        const group = concept.group;
        const showGroup =
          group != null &&
          group !== concepts[index - 1]?.group &&
          !sameTitle(group, topic.title) &&
          !sameTitle(group, concept.title);
        const groupPad = index === 0 ? "pt-1" : "pt-3";
        return (
          <li key={concept.id} className="contents">
            {showGroup ? (
              <p
                role="heading"
                aria-level={3}
                className={`${indentClass} pb-1 ${groupPad} text-[11px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400`}
              >
                {concept.group}
              </p>
            ) : null}
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
  const active = isActiveHref(highlightPathname, topic.href);
  const isHitTopic = first?.pathname === topic.href;
  const isFirstTopic = isHitTopic && first.hash === "";
  const onPath = !searching && active;
  const mobileLeaf = topicIsMobileNavLeaf(
    active,
    highlightPathname,
    topic.href,
    activeConceptId,
    false,
  );
  const pinPath = navPathPinned(onPath, mobileLeaf, stackPathPins);
  const bookmarked = isBookmarked(topic.href);
  const concepts = visibleConcepts(navTopic, query, mode);
  const sidebarConcepts = searching
    ? concepts
    : filterInterviewConcepts(navTopic, concepts);
  const showConceptNav =
    !navTopic.hideSidebarConcepts && sidebarConcepts.length > 0;
  const showTopicFold =
    showConceptNav &&
    shouldShowTopicConceptFold(
      navTopic.title,
      navTopic.concepts,
      sidebarConcepts.length,
    );
  const topicFoldOpen = openTopicHref === topic.href;
  const topicOpen = searching ? showConceptNav : showTopicFold && topicFoldOpen;

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
        <span className="flex min-w-0 flex-1 items-center gap-1.5">
          <RowTitle
            text={title}
            query={query}
            marker={showTopicFold}
            open={topicOpen}
          />
        </span>
        {bookmarked ? <BookmarkStar /> : null}
        {showTopicFold ? <NavChevron open={topicOpen} /> : null}
      </Link>
      <NavFold open={topicOpen && showTopicFold} instant={searching} unbox>
        <ul className="contents">
          {showConceptNav ? (
            <TopicConceptNav
              topic={navTopic}
              concepts={sidebarConcepts}
              indentClass={SECTION_TOPIC_CONCEPT_INDENT}
            />
          ) : null}
        </ul>
      </NavFold>
    </>
  );
});

function SectionClusterNav({
  flatNav = false,
  trackId,
  subjectHref,
  cluster,
  rowGapClass = "",
}: {
  flatNav?: boolean;
  trackId: TrackId;
  subjectHref: string;
  cluster: NavCluster;
  rowGapClass?: string;
}) {
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
    <ClusterRow trackId={trackId} subjectHref={subjectHref} cluster={cluster} />
  );
}

function SectionClusterList({
  flatNav = false,
  trackId,
  subjectHref,
  clusters,
}: {
  flatNav?: boolean;
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
  topic,
  concepts,
  indentClass = "pl-4",
}: {
  topic: NavTopic;
  concepts: readonly NavConcept[];
  indentClass?: string;
}) {
  return (
    <ConceptItems topic={topic} concepts={concepts} indentClass={indentClass} />
  );
}

export function TopicRow({
  trackId,
  topic,
  compact = false,
  hideTitle = false,
  navKind = "topic",
  navId,
}: {
  trackId: TrackId;
  topic: NavTopic;
  compact?: boolean;
  hideTitle?: boolean;
  navKind?: "cluster" | "topic";
  navId?: string;
}) {
  const { query, mode, pathname, searching, first, onNavigate, goToPath } =
    useSidebarChrome();
  const mobileNavOpen = useHandbookMobileNavOpen();
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
  const concepts = visibleConcepts(navTopic, query, mode);
  const hasConcepts = concepts.length > 0;
  const sidebarConcepts = searching
    ? concepts
    : filterInterviewConcepts(navTopic, concepts);
  const showConceptNav =
    !navTopic.hideSidebarConcepts &&
    sidebarConcepts.length > 0 &&
    !hasNestedTopics;
  const showTopicFold =
    (showConceptNav &&
      shouldShowTopicConceptFold(
        navTopic.title,
        navTopic.concepts,
        sidebarConcepts.length,
      )) ||
    (hasNestedTopics && nestedTopics.length > 1);
  const showLoneNested =
    hasNestedTopics && nestedTopics.length === 1 && !showConceptNav;
  const onPath = !searching && (active || nestedOnPath);
  const mobileLeaf = topicIsMobileNavLeaf(
    active,
    highlightPathname,
    navTopic.href,
    activeConceptId,
    nestedOnPath,
  );
  const pinPath = navPathPinned(onPath, mobileLeaf, stackPathPins);
  const topicFoldOpen =
    openTopicHref === navTopic.href || nestedOpen || nestedOnPath;
  const topicOpen = hideTitle
    ? showConceptNav
    : searching
      ? !navTopic.hideSidebarConcepts && (hasConcepts || hasNestedTopics)
      : showTopicFold && topicFoldOpen;
  const topicBookmarked = isBookmarked(navTopic.href);
  // Flatten sticky headers into the track list so nested containing blocks cannot
  // drag Core/Structure above Frontend/HTML while siblings scroll.
  const indent = compact ? (navKind === "cluster" ? "pl-4" : "pl-6") : "";
  const conceptIndent = compact ? "pl-8" : "pl-4";

  if (hideTitle) {
    if (!showConceptNav) {
      return null;
    }
    return (
      <TopicConceptNav
        topic={navTopic}
        concepts={sidebarConcepts}
        indentClass={conceptIndent}
      />
    );
  }

  return (
    <li className="contents">
      <Link
        href={topic.href}
        prefetch={false}
        scroll={false}
        data-nav={navKind}
        data-nav-id={navId ?? topic.slug}
        data-nav-path={pinPath ? "true" : undefined}
        onClick={(event) => {
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
          closeNavSoon(onNavigate);
          followHandbookHref(topic.href, pathname, goToPath);
        }}
        data-search-hit={isFirstTopic ? "true" : undefined}
        aria-current={active ? "page" : undefined}
        aria-expanded={showTopicFold ? topicOpen : undefined}
        className={`${rowClass(
          navPathHighlighted(isHitTopic || active, onPath, stackPathPins),
          pinPath,
          indent,
        )} ${NAV_ROW_GAP}`}
      >
        <span className="flex min-w-0 flex-1 items-center gap-1.5">
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
              <NavChevron open />
            ) : null
          ) : (
            <NavChevron open={topicOpen} large />
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
              topic={navTopic}
              concepts={sidebarConcepts}
              indentClass={conceptIndent}
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
}: {
  trackId: TrackId;
  subjectHref: string;
  cluster: NavCluster;
  /** Handbook clusters that share the subject hub with collapsible sections. */
  hubFoldExclusive?: boolean;
}) {
  const { query, pathname, searching, first, goToPath, onNavigate } =
    useSidebarChrome();
  const { highlightPathname, stackPathPins } = useSidebarHighlight();
  const { fold, patchFold } = useScopedSidebarFold();
  const sectionId = useSidebarFoldScope();
  const { clusterKey: openClusterKey } = fold(trackId);
  const { activeConceptId } = useSidebarActive();
  const onlyTopic = cluster.topics.length === 1 ? cluster.topics[0] : null;
  const navigateHref = clusterNavigateHref(cluster, sectionId, subjectPath);

  if (onlyTopic) {
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

  const key = clusterKey(subjectPath, cluster.id);
  const clusterOpen = searching || openClusterKey === key;
  const onHub = pathname === subjectPath;
  const active = onHub && activeConceptId === cluster.id;
  const isHitCluster =
    first?.pathname === subjectPath && first.hash === `#${cluster.id}`;
  const onPath =
    !searching &&
    (active ||
      cluster.topics.some((topic) =>
        navTopicTreeContainsHref(topic, highlightPathname),
      ));
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
            const next = `#${cluster.id}`;
            const sameHash = window.location.hash === next;
            if (!searching) {
              const opening = openClusterKey !== key;
              if (sameHash) {
                patchFold(trackId, {
                  clusterKey: opening ? key : null,
                  ...(hubFoldExclusive && opening ? { sectionKey: null } : {}),
                });
              } else {
                patchFold(trackId, {
                  clusterKey: key,
                  ...(hubFoldExclusive ? { sectionKey: null } : {}),
                });
              }
            }
            if (!sameHash) {
              replacePathHash(pathname, next);
            }
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
        {clusterOpen ? <NavChevron open /> : null}
      </Link>
      <NavFold open={clusterOpen} instant={searching} unbox>
        <ul className="contents">
          {cluster.topics.map((topic) => (
            <TopicRow
              key={topic.slug}
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
}: {
  trackId: TrackId;
  subjectHref: string;
  section: NavSection;
}) {
  const { query, pathname, searching, first } = useSidebarChrome();
  const { highlightPathname, stackPathPins } = useSidebarHighlight();
  const { fold, patchFold } = useScopedSidebarFold();
  const { activeConceptId } = useSidebarActive();
  const collapsible = isNavSectionCollapsible(section);

  if (!collapsible) {
    return (
      <li className="contents">
        <div
          className={`px-2 pt-2 pb-0.5 text-[10px] font-semibold tracking-wide text-zinc-500 uppercase dark:text-zinc-400 ${NAV_ROW_GAP}`}
        >
          <HighlightedText text={section.title} query={query} />
        </div>
        <ul className="contents">
          <SectionClusterList
            flatNav={section.flatNav}
            trackId={trackId}
            subjectHref={subjectPath}
            clusters={section.clusters}
          />
        </ul>
      </li>
    );
  }

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
  const { query, pathname, searching, first } = useSidebarChrome();
  const { highlightPathname, stackPathPins } = useSidebarHighlight();
  const { fold, patchFold } = useScopedSidebarFold();
  const { subjectHref: openSubjectHref } = fold(trackId);
  const active = isActiveHref(highlightPathname, subject.href);
  const subjectOpen = searching || openSubjectHref === subject.href;
  const isHitSubject = first?.pathname === subject.href && first.hash === "";
  const onPath = !searching && isOnSubjectPath(highlightPathname, subject);
  const pinPath = navPathPinned(onPath, active, stackPathPins);
  const locale = localeFromPathname(pathname);
  const cautionTip = subjectCautionTooltip(locale, subject.slug);
  const hubFoldExclusive =
    subject.sections?.some((section) => isNavSectionCollapsible(section)) ??
    false;

  return (
    <li className="contents">
      <Link
        href={subject.href}
        prefetch={false}
        data-nav="subject"
        data-nav-id={subject.slug}
        data-nav-path={pinPath ? "true" : undefined}
        onClick={(event) => {
          if (pathname === subject.href) {
            event.preventDefault();
            pinNavElement(event.currentTarget, {
              hold: false,
              scrollIntoView: false,
            });
            if (!searching) {
              patchFold(trackId, {
                subjectHref:
                  openSubjectHref === subject.href ? null : subject.href,
              });
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
              {subject.clusters.map((cluster) => (
                <ClusterRow
                  key={cluster.id}
                  trackId={trackId}
                  subjectHref={subject.href}
                  cluster={cluster}
                  hubFoldExclusive={hubFoldExclusive}
                />
              ))}
              {subject.sections.map((section) => (
                <SectionRow
                  key={section.id}
                  trackId={trackId}
                  subjectHref={subject.href}
                  section={section}
                />
              ))}
              {subject.clustersAfterSections?.map((cluster) => (
                <ClusterRow
                  key={cluster.id}
                  trackId={trackId}
                  subjectHref={subject.href}
                  cluster={cluster}
                  hubFoldExclusive={hubFoldExclusive}
                />
              ))}
            </>
          ) : subject.flatNav ? (
            subject.clusters.flatMap((cluster) =>
              cluster.topics.map((topic) => (
                <TopicRow
                  key={topic.slug}
                  trackId={trackId}
                  topic={topic}
                  compact
                  navKind="topic"
                  navId={topic.slug}
                />
              )),
            )
          ) : (
            subject.clusters.map((cluster) => (
              <ClusterRow
                key={cluster.id}
                trackId={trackId}
                subjectHref={subject.href}
                cluster={cluster}
              />
            ))
          )}
        </ul>
      </NavFold>
    </li>
  );
}
