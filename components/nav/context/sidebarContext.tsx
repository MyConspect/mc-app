"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { TrackId } from "@/lib/catalog";
import type { NavRootSectionId, SearchMode } from "@/lib/nav";
import type { NavLocation } from "../utils/location";

export type SearchHit = {
  pathname: string;
  hash: string;
};

export type SidebarChromeValue = {
  query: string;
  mode: SearchMode;
  pathname: string;
  searching: boolean;
  first: SearchHit | null;
  goToPath: (path: string) => void;
  onNavigate?: () => void;
};

export type SidebarHighlightValue = {
  /** Path used for sidebar active highlights; includes optimistic nav targets. */
  highlightPathname: string;
  /** When false (viewport under 1024px), only the leaf row is pinned/highlighted. */
  stackPathPins: boolean;
};

/** Pin this row in the sticky path stack (ancestors only on desktop). */
export function navPathPinned(
  onPath: boolean,
  pinLeaf: boolean,
  stackPathPins: boolean,
): boolean {
  if (!onPath) {
    return false;
  }
  return stackPathPins || pinLeaf;
}

/** Yellow active surface for every row on the current path (mobile and desktop). */
export function navPathHighlighted(
  highlighted: boolean,
  onPath: boolean,
  _stackPathPins: boolean,
): boolean {
  void _stackPathPins;
  return highlighted || onPath;
}

export type SidebarBookmarksValue = {
  isBookmarked: (pathname: string, conceptId?: string) => boolean;
};

export type SidebarFoldValue = {
  getTrackFold: (sectionId: NavRootSectionId, trackId: TrackId) => NavLocation;
  patchTrackFold: (
    sectionId: NavRootSectionId,
    trackId: TrackId,
    patch: Partial<NavLocation>,
  ) => void;
};

export type SidebarActiveValue = {
  activeConceptId: string;
};

export type SidebarTrackOpenValue = {
  toggleTrackId: (sectionId: NavRootSectionId, trackId: TrackId) => void;
  ensureTrackOpen: (sectionId: NavRootSectionId, trackId: TrackId) => void;
  isTrackOpen: (sectionId: NavRootSectionId, trackId: TrackId) => boolean;
};

const SidebarChromeContext = createContext<SidebarChromeValue | null>(null);
const SidebarHighlightContext = createContext<SidebarHighlightValue | null>(
  null,
);
const SidebarBookmarksContext = createContext<SidebarBookmarksValue | null>(
  null,
);
const SidebarFoldContext = createContext<SidebarFoldValue | null>(null);
const SidebarFoldScopeContext = createContext<NavRootSectionId | null>(null);
const SidebarActiveContext = createContext<SidebarActiveValue | null>(null);
const SidebarTrackOpenContext = createContext<SidebarTrackOpenValue | null>(
  null,
);

export function SidebarNavProvider({
  chrome,
  highlight,
  bookmarks,
  fold,
  active,
  trackOpen,
  children,
}: {
  chrome: SidebarChromeValue;
  highlight: SidebarHighlightValue;
  bookmarks: SidebarBookmarksValue;
  fold: SidebarFoldValue;
  active: SidebarActiveValue;
  trackOpen: SidebarTrackOpenValue;
  children: ReactNode;
}) {
  return (
    <SidebarChromeContext.Provider value={chrome}>
      <SidebarHighlightContext.Provider value={highlight}>
        <SidebarBookmarksContext.Provider value={bookmarks}>
          <SidebarFoldContext.Provider value={fold}>
            <SidebarTrackOpenContext.Provider value={trackOpen}>
              <SidebarActiveContext.Provider value={active}>
                {children}
              </SidebarActiveContext.Provider>
            </SidebarTrackOpenContext.Provider>
          </SidebarFoldContext.Provider>
        </SidebarBookmarksContext.Provider>
      </SidebarHighlightContext.Provider>
    </SidebarChromeContext.Provider>
  );
}

export function useSidebarChrome() {
  const value = useContext(SidebarChromeContext);
  if (!value) {
    throw new Error("useSidebarChrome must be used within TopicSidebar");
  }
  return value;
}

export function useSidebarHighlight() {
  const value = useContext(SidebarHighlightContext);
  if (!value) {
    throw new Error("useSidebarHighlight must be used within TopicSidebar");
  }
  return value;
}

export function useSidebarBookmarks() {
  const value = useContext(SidebarBookmarksContext);
  if (!value) {
    throw new Error("useSidebarBookmarks must be used within TopicSidebar");
  }
  return value;
}

export function useSidebarFold() {
  const value = useContext(SidebarFoldContext);
  if (!value) {
    throw new Error("useSidebarFold must be used within TopicSidebar");
  }
  return value;
}

export function SidebarFoldScopeProvider({
  sectionId,
  children,
}: {
  sectionId: NavRootSectionId;
  children: ReactNode;
}) {
  return (
    <SidebarFoldScopeContext.Provider value={sectionId}>
      {children}
    </SidebarFoldScopeContext.Provider>
  );
}

export function useSidebarFoldScope(): NavRootSectionId {
  const sectionId = useContext(SidebarFoldScopeContext);
  if (!sectionId) {
    throw new Error(
      "useSidebarFoldScope must be used within SidebarFoldScopeProvider",
    );
  }
  return sectionId;
}

export function useScopedSidebarFold() {
  const sectionId = useSidebarFoldScope();
  const { getTrackFold, patchTrackFold } = useSidebarFold();
  return {
    sectionId,
    fold: (trackId: TrackId) => getTrackFold(sectionId, trackId),
    patchFold: (trackId: TrackId, patch: Partial<NavLocation>) =>
      patchTrackFold(sectionId, trackId, patch),
  };
}

function useSidebarTrackOpen() {
  const value = useContext(SidebarTrackOpenContext);
  if (!value) {
    throw new Error("useSidebarTrackOpen must be used within TopicSidebar");
  }
  return value;
}

/** Stable per-scope track open/toggle handlers for memoized track rows. */
export function useScopedTrackOpen() {
  const sectionId = useSidebarFoldScope();
  const { toggleTrackId, ensureTrackOpen, isTrackOpen } = useSidebarTrackOpen();
  return useMemo(
    () => ({
      toggleTrackId: (trackId: TrackId) => toggleTrackId(sectionId, trackId),
      ensureTrackOpen: (trackId: TrackId) =>
        ensureTrackOpen(sectionId, trackId),
      isTrackOpen: (trackId: TrackId) => isTrackOpen(sectionId, trackId),
    }),
    [sectionId, toggleTrackId, ensureTrackOpen, isTrackOpen],
  );
}

export function useSidebarActive() {
  const value = useContext(SidebarActiveContext);
  if (!value) {
    throw new Error("useSidebarActive must be used within TopicSidebar");
  }
  return value;
}

export function closeNavSoon(onNavigate?: () => void) {
  queueMicrotask(() => onNavigate?.());
}

/** Shared vertical gap between nested sidebar path rows. */
export const NAV_ROW_GAP = "mt-1.5";

const NAV_ROW_SURFACE =
  "ring-1 ring-inset transition-[color,background-color,box-shadow] duration-150 ease-out motion-reduce:transition-none";

export function rowClass(active: boolean, sticky = false, indentClass = "") {
  // Indent with padding (not margin) so `w-full` rows keep one shared right edge.
  // Inactive rows keep a transparent ring so active highlight does not shift layout.
  const shared = `flex min-h-11 w-full touch-manipulation cursor-pointer items-center justify-between gap-2 rounded-md px-2 py-2 text-left text-base font-medium max-md:min-h-11 ${NAV_ROW_SURFACE}`;
  const highlight = active
    ? `${shared} text-zinc-900 bg-yellow-50 ring-yellow-200 dark:bg-yellow-950 dark:text-zinc-50 dark:ring-yellow-800`
    : `${shared} text-zinc-600 bg-transparent ring-transparent hover:bg-yellow-50 dark:text-zinc-400 dark:hover:bg-yellow-950/60`;
  const stickyClass = sticky ? " sticky" : "";
  const indent = indentClass ? ` ${indentClass}` : "";
  return `${highlight}${stickyClass}${indent}`;
}

export function trackHeaderClass(highlighted: boolean) {
  const shared = `flex min-h-[var(--nav-sticky-row)] w-full touch-manipulation cursor-pointer items-center justify-between gap-2 rounded-md px-2 py-2 text-left text-base font-medium max-md:min-h-11 ${NAV_ROW_SURFACE}`;
  return highlighted
    ? `${shared} text-zinc-900 bg-yellow-50 ring-yellow-200 dark:bg-yellow-950 dark:text-zinc-50 dark:ring-yellow-800`
    : `${shared} text-zinc-500 bg-transparent ring-transparent hover:bg-yellow-50/80 dark:text-zinc-400 dark:hover:bg-yellow-950/40`;
}
