"use client";

import {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HighlightedText, useSearchMode } from "@/components/search";
import { HANDBOOK_NAV_ASIDE_ID, HANDBOOK_SIDEBAR_ID } from "@/constants";
import { useSidebarAsideScroll } from "../hooks/useSidebarAsideScroll";
import {
  collectVisibleGroupSearchHits,
  matchesQuery,
  searchNav,
  splitHref,
  type ChromeCopy,
  type NavEntry,
  type NavGroup,
  type NavRootSection,
  type NavRootSectionId,
  type SearchMode,
} from "@/lib/nav";
import {
  groupNavigateHref,
  inferNavRootSection,
  navGroupsForPath,
  navTrackScope,
} from "@/lib/nav/sections";
import {
  bookmarkLookupKey,
  bookmarkStorageKey,
  getServerBookmarks,
  readBookmarks,
  subscribeBookmarks,
} from "@/lib/nav/bookmarks";
import type { TrackId } from "@/lib/catalog";
import { NavChevron, NavFold } from "../ui/NavFold";
import {
  applySameDocumentHref,
  followHandbookHref,
  queueHandbookHref,
} from "../utils/hash";
import { useHandbookLocation } from "../hooks/useHandbookLocation";
import { useStackPathPins } from "../hooks/useMdUp";
import { isActiveHref, isActiveTrack } from "../utils/location";
import { SearchHitList } from "./SearchHitList";
import { pinNavElement, pinNavForHref } from "../utils/sidebarPin";
import {
  measureNavChromeInset,
  measureOpenTrackGuideSpan,
  measureStickyCover,
  measureStickyPathVars,
  stickyVarsEqual,
  syncStickyScopeRelease,
  writeStickyVars,
  type StickyVars,
} from "../utils/sidebarSticky";
import {
  SidebarFoldScopeProvider,
  SidebarNavProvider,
  navPathPinned,
  trackHeaderClass,
  useSidebarChrome,
  useSidebarHighlight,
  useScopedSidebarFold,
  useScopedTrackOpen,
} from "../context/sidebarContext";
import { ClusterRow, SubjectRow, TopicRow } from "./sidebarRows";
import { SidebarNavChrome } from "./SidebarNavChrome";
import { foldRevision, useSidebarOpen } from "../hooks/useSidebarOpen";

export const TopicSidebar = memo(function TopicSidebar({
  sections,
  query,
  chrome,
  onNavigate,
  searchLoading = false,
  hideNavChromeOnMobile = false,
}: {
  sections: readonly NavRootSection[];
  query: string;
  chrome: ChromeCopy;
  onNavigate?: () => void;
  searchLoading?: boolean;
  hideNavChromeOnMobile?: boolean;
}) {
  const { pathname, highlightPathname, location, hash } = useHandbookLocation();
  const mode = useSearchMode();
  const pathGroups = useMemo(
    () => navGroupsForPath(sections, highlightPathname),
    [sections, highlightPathname],
  );
  const activeRootSectionId = inferNavRootSection(highlightPathname);
  const scopedGroups = useMemo(
    () =>
      sections.flatMap((section) =>
        section.groups.map((group) => ({
          sectionId: section.id,
          group,
        })),
      ),
    [sections],
  );
  const { groups: filtered, firstHref } = useMemo(
    () => searchNav(pathGroups, query, mode, pathname),
    [pathGroups, query, mode, pathname],
  );
  const filteredScoped = useMemo(() => {
    const visibleTrackIds = new Set(filtered.map((group) => group.id));
    return scopedGroups.filter(
      (item) =>
        item.sectionId === activeRootSectionId &&
        visibleTrackIds.has(item.group.id),
    );
  }, [filtered, scopedGroups, activeRootSectionId]);
  const first = useMemo(
    () => (firstHref ? splitHref(firstHref) : null),
    [firstHref],
  );
  const searching = query.trim().length > 0;
  const {
    activeConceptId,
    isTrackOpen,
    toggleTrackId,
    ensureTrackOpen,
    trackFolds,
    openTrackIds,
    getTrackFold,
    patchTrackFold,
  } = useSidebarOpen({
    sections,
    pathname: highlightPathname,
    hash: location.hash || hash,
    searching,
    activeRootSectionId,
  });
  const router = useRouter();
  const goToPath = useCallback(
    (path: string) => {
      router.push(path, { scroll: false });
    },
    [router],
  );
  const navHash = location.hash || hash;
  const navRevision = `${foldRevision(trackFolds, openTrackIds)}|${highlightPathname}|${navHash}`;
  const stickyRevision = `${navRevision}|${searching}`;
  useSidebarAsideScroll({
    searching,
    pathname: highlightPathname,
    hash: navHash,
    navRevision,
    firstHref,
    activeConceptId,
    highlightPathname,
  });

  const bookmarks = useSyncExternalStore(
    subscribeBookmarks,
    readBookmarks,
    getServerBookmarks,
  );
  const bookmarkKeys = useMemo(() => {
    const keys = new Set<string>();
    for (const bookmark of bookmarks) {
      keys.add(bookmarkStorageKey(bookmark));
    }
    return keys;
  }, [bookmarks]);
  const bookmarksValue = useMemo(
    () => ({
      isBookmarked: (bookmarkPath: string, conceptId?: string) =>
        bookmarkKeys.has(bookmarkLookupKey(bookmarkPath, conceptId)),
    }),
    [bookmarkKeys],
  );
  const stackPathPins = useStackPathPins();
  const highlightValue = useMemo(
    () => ({ highlightPathname, stackPathPins }),
    [highlightPathname, stackPathPins],
  );
  const chromeValue = useMemo(
    () => ({
      query,
      mode,
      pathname,
      searching,
      first,
      goToPath,
      onNavigate,
    }),
    [query, mode, pathname, searching, first, goToPath, onNavigate],
  );
  const foldValue = useMemo(
    () => ({
      getTrackFold,
      patchTrackFold,
    }),
    [getTrackFold, patchTrackFold],
  );
  const activeValue = useMemo(() => ({ activeConceptId }), [activeConceptId]);
  const trackOpenValue = useMemo(
    () => ({
      toggleTrackId,
      ensureTrackOpen,
      isTrackOpen,
    }),
    [toggleTrackId, ensureTrackOpen, isTrackOpen],
  );

  return (
    <SidebarNavProvider
      chrome={chromeValue}
      highlight={highlightValue}
      bookmarks={bookmarksValue}
      fold={foldValue}
      active={activeValue}
      trackOpen={trackOpenValue}
    >
      <nav
        id={HANDBOOK_SIDEBAR_ID}
        aria-label={chrome.topicsNav}
        className="relative isolate px-2 py-3"
      >
        <SidebarNavChrome
          sections={sections}
          chrome={chrome}
          onNavigate={onNavigate}
          className={
            hideNavChromeOnMobile ? "-mx-2 -mt-3 max-md:hidden" : "-mx-2 -mt-3"
          }
        />
        <div data-nav-sticky-cover="" aria-hidden="true" />
        {filtered.length === 0 ? (
          <p
            className="px-2 text-sm text-zinc-500 dark:text-zinc-400"
            role={searchLoading ? "status" : undefined}
            aria-live={searchLoading ? "polite" : undefined}
          >
            {searchLoading
              ? chrome.searchLoading
              : mode === "notes"
                ? chrome.searchNotesEmpty
                : chrome.searchEmpty}
          </p>
        ) : searching ? (
          <ul className="space-y-0.5">
            {filteredScoped.map(({ sectionId, group }) => (
              <SidebarFoldScopeProvider
                key={navTrackScope(sectionId, group.id)}
                sectionId={sectionId}
              >
                <TrackGroup
                  rootSectionId={sectionId}
                  activeRootSectionId={activeRootSectionId}
                  group={group}
                  query={query}
                  mode={mode}
                  searching={searching}
                  first={first}
                />
              </SidebarFoldScopeProvider>
            ))}
          </ul>
        ) : (
          <SidebarFoldScopeProvider sectionId={activeRootSectionId}>
            <ul className="space-y-0.5">
              {pathGroups.map((group) => (
                <TrackGroup
                  key={group.id}
                  rootSectionId={activeRootSectionId}
                  activeRootSectionId={activeRootSectionId}
                  group={group}
                  query={query}
                  mode={mode}
                  searching={false}
                  first={first}
                />
              ))}
            </ul>
          </SidebarFoldScopeProvider>
        )}
      </nav>
      {stackPathPins ? <StickyPathStyles revision={stickyRevision} /> : null}
    </SidebarNavProvider>
  );
});

function StickyPathStyles({ revision }: { revision: string }) {
  const previousRef = useRef<StickyVars>({});

  const applyVars = useCallback(() => {
    const scroller = document.getElementById(HANDBOOK_NAV_ASIDE_ID);
    const nav = document.getElementById(HANDBOOK_SIDEBAR_ID);
    if (!scroller) {
      return;
    }
    const chromeH = measureNavChromeInset();
    if (chromeH > 0) {
      scroller.style.setProperty("--nav-chrome-h", `${chromeH}px`);
    }
    previousRef.current = writeStickyVars(
      scroller.style,
      measureStickyPathVars(),
      previousRef.current,
    );
    syncStickyScopeRelease(nav);
  }, []);

  const syncPath = useCallback(() => {
    applyVars();
  }, [applyVars]);

  useLayoutEffect(() => {
    syncPath();
    const frame = requestAnimationFrame(() => {
      syncPath();
    });
    return () => {
      cancelAnimationFrame(frame);
    };
  }, [syncPath, revision]);

  useEffect(() => {
    const scroller = document.getElementById(HANDBOOK_NAV_ASIDE_ID);
    const nav = document.getElementById(HANDBOOK_SIDEBAR_ID);
    const chrome = document.querySelector<HTMLElement>(
      `#${HANDBOOK_SIDEBAR_ID} [data-nav-chrome]`,
    );
    let resizeObserver: ResizeObserver | null = null;
    resizeObserver = new ResizeObserver(() => {
      syncPath();
    });
    if (chrome) {
      resizeObserver.observe(chrome);
    }
    if (nav) {
      resizeObserver.observe(nav);
    }
    let frame = 0;
    const onScroll = () => {
      if (frame !== 0) {
        return;
      }
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        if (!scroller) {
          return;
        }
        const nav = document.getElementById(HANDBOOK_SIDEBAR_ID);
        syncStickyScopeRelease(nav);
        const current = previousRef.current;
        const navEl = document.getElementById(HANDBOOK_SIDEBAR_ID);
        const cover = `${measureStickyCover(navEl ?? undefined, current)}px`;
        const currentRest: StickyVars = Object.fromEntries(
          Object.entries(current).filter(
            ([key]) => key !== "--nav-guide-track-span",
          ),
        ) as StickyVars;
        const withCover: StickyVars = {
          ...currentRest,
          "--nav-sticky-cover": cover,
        };
        let nextVars: StickyVars = withCover;
        if (navEl) {
          const span = measureOpenTrackGuideSpan(navEl, withCover);
          if (span !== undefined && span > 0) {
            nextVars = {
              ...withCover,
              "--nav-guide-track-span": `${span}px`,
            };
          }
        }
        if (!stickyVarsEqual(current, nextVars)) {
          previousRef.current = writeStickyVars(
            scroller.style,
            nextVars,
            current,
          );
        }
      });
    };
    scroller?.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", syncPath);
    return () => {
      resizeObserver?.disconnect();
      scroller?.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", syncPath);
      window.cancelAnimationFrame(frame);
    };
  }, [applyVars, syncPath]);

  return null;
}

const TrackGroup = memo(function TrackGroup({
  rootSectionId,
  activeRootSectionId,
  group,
  query,
  mode,
  searching,
  first,
}: {
  rootSectionId: NavRootSectionId;
  activeRootSectionId: NavRootSectionId;
  group: NavGroup;
  query: string;
  mode: SearchMode;
  searching: boolean;
  first: { pathname: string; hash: string } | null;
}) {
  const { isTrackOpen, toggleTrackId, ensureTrackOpen } = useScopedTrackOpen();
  const isLeafTrack = Boolean(group.leafTopic) && group.entries.length === 0;
  const showLeafConcepts = isLeafTrack && !group.leafTopic?.hideSidebarConcepts;
  const hasSidebarChildren =
    group.entries.length > 0 || Boolean(group.hubTopic) || showLeafConcepts;
  const {
    onNavigate,
    goToPath,
    pathname: committedPathname,
  } = useSidebarChrome();
  const { stackPathPins, highlightPathname } = useSidebarHighlight();
  const { patchFold } = useScopedSidebarFold();
  const trackActive = isActiveHref(highlightPathname, group.href);
  const onThisTrack = isActiveTrack(highlightPathname, group.href);
  const trackOpen = searching || (hasSidebarChildren && isTrackOpen(group.id));
  const onPath =
    !searching && rootSectionId === activeRootSectionId && onThisTrack;
  const pinPath = navPathPinned(onPath, trackActive, stackPathPins);
  const needle = query.trim().toLowerCase();
  const trackHighlighted = searching
    ? needle.length > 0 && matchesQuery(group.title, needle)
    : onPath;
  const headerClass = trackHeaderClass(trackHighlighted);
  const stickyScope = onPath && stackPathPins;
  const searchHits = useMemo(
    () =>
      searching
        ? collectVisibleGroupSearchHits(group, query, mode)
        : { hits: [], remaining: 0 },
    [group, mode, query, searching],
  );

  if (searching && searchHits.hits.length === 0) {
    return null;
  }

  const title = (
    <HighlightedText
      text={group.title}
      query={query}
      className="min-w-0 flex-1 truncate"
    />
  );
  const chevron = hasSidebarChildren ? <NavChevron open={trackOpen} /> : null;
  const asButton =
    hasSidebarChildren && (showLeafConcepts ? trackActive : onThisTrack);
  const navigateHref =
    rootSectionId === "interviews"
      ? groupNavigateHref(group, rootSectionId)
      : group.href;

  const trackBody = (
    <>
      {asButton ? (
        <button
          type="button"
          aria-expanded={trackOpen}
          data-nav="track"
          data-nav-id={group.id}
          data-nav-path={pinPath ? "true" : undefined}
          onClick={(event) => {
            // Fold toggles remount nested rows; scroll pin fights sticky remeasure.
            pinNavElement(event.currentTarget, {
              hold: false,
              scrollIntoView: false,
            });
            if (!searching) {
              toggleTrackId(group.id);
            }
          }}
          aria-current={isLeafTrack ? undefined : "true"}
          className={headerClass}
        >
          {title}
          {chevron}
        </button>
      ) : (
        <Link
          href={navigateHref}
          prefetch={false}
          data-nav="track"
          data-nav-id={group.id}
          data-nav-path={pinPath ? "true" : undefined}
          onClick={(event) => {
            pinNavForHref(event.currentTarget, committedPathname, navigateHref);
            if (!hasSidebarChildren) {
              onNavigate?.();
            }
            if (committedPathname === navigateHref && window.location.hash) {
              event.preventDefault();
              applySameDocumentHref(committedPathname, "", committedPathname);
              queueHandbookHref(navigateHref);
              return;
            }
            if (!onThisTrack) {
              patchFold(group.id, {
                topicHref: null,
                subjectHref: null,
                clusterKey: null,
                sectionKey: null,
              });
            }
            followHandbookHref(navigateHref, committedPathname, goToPath);
            if (hasSidebarChildren) {
              ensureTrackOpen(group.id);
            }
          }}
          data-search-hit={
            isLeafTrack && first?.pathname === navigateHref && first.hash === ""
              ? "true"
              : undefined
          }
          aria-expanded={isLeafTrack ? undefined : trackOpen}
          className={headerClass}
        >
          {title}
          {chevron}
        </Link>
      )}
      <NavFold open={hasSidebarChildren && trackOpen} instant={searching} unbox>
        <ul className="mt-1.5 ml-1.5 space-y-0.5 border-l-2 border-yellow-200 pl-2 dark:border-yellow-800">
          {searching ? (
            <SearchHitList
              hits={searchHits.hits}
              remaining={searchHits.remaining}
            />
          ) : (
            <>
              {group.hubTopic ? (
                <TopicRow trackId={group.id} topic={group.hubTopic} hideTitle />
              ) : null}
              {showLeafConcepts && group.leafTopic ? (
                <TopicRow
                  trackId={group.id}
                  topic={group.leafTopic}
                  hideTitle
                />
              ) : (
                group.entries.map((entry) => (
                  <TrackEntry
                    key={entryKey(entry)}
                    entry={entry}
                    trackId={group.id}
                  />
                ))
              )}
            </>
          )}
        </ul>
      </NavFold>
    </>
  );

  return (
    <li
      className={stickyScope ? "contents" : undefined}
      {...(stickyScope ? { "data-nav-sticky-scope": "" } : {})}
    >
      {trackBody}
    </li>
  );
});

function entryKey(entry: NavEntry) {
  switch (entry.kind) {
    case "topic":
      return entry.topic.slug;
    case "subject":
      return entry.subject.slug;
    case "cluster":
      return entry.cluster.id;
    default: {
      const _never: never = entry;
      return _never;
    }
  }
}

function TrackEntry({ entry, trackId }: { entry: NavEntry; trackId: TrackId }) {
  switch (entry.kind) {
    case "topic":
      return <TopicRow trackId={trackId} topic={entry.topic} />;
    case "subject":
      return <SubjectRow trackId={trackId} subject={entry.subject} />;
    case "cluster":
      return (
        <ClusterRow
          trackId={trackId}
          subjectHref={entry.subjectHref}
          cluster={entry.cluster}
        />
      );
    default: {
      const _never: never = entry;
      return _never;
    }
  }
}
