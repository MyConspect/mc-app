"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import {
  SIDEBAR_COLLAPSE_ALL_EVENT,
  SIDEBAR_COLLAPSE_TRACKS_EVENT,
} from "@/constants";
import type { TrackId } from "@/lib/catalog";
import type { NavRootSection, NavRootSectionId } from "@/lib/nav";
import {
  navGroupsForPath,
  navTrackScope,
  type NavTrackScope,
} from "@/lib/nav/sections";
import { hashIdFrom } from "@/lib/nav/navUtils";
import { handbookLocation } from "../utils/hash";
import {
  isActiveTrack,
  isHomePath,
  locationForPath,
  type NavLocation,
} from "../utils/location";

type NavSnapshot = {
  searching: boolean;
  activeTrackId: TrackId | null;
  pathname: string;
  hash: string;
  activeConceptId: string;
  locationKey: string;
};

function navLocationKey(location: NavLocation): string {
  return `${location.subjectHref ?? ""}\0${location.clusterKey ?? ""}\0${location.sectionKey ?? ""}\0${location.topicHref ?? ""}`;
}

const EMPTY_FOLD: NavLocation = {
  topicHref: null,
  subjectHref: null,
  clusterKey: null,
  sectionKey: null,
};

function foldFromSync(
  location: NavLocation,
  previous: NavLocation | undefined,
  clearingHash: boolean,
): NavLocation {
  let clusterKey: string | null = previous?.clusterKey ?? null;
  if (location.clusterKey) {
    clusterKey = location.clusterKey;
  } else if (!location.subjectHref) {
    clusterKey = null;
  } else if (location.sectionKey) {
    clusterKey = null;
  }

  let sectionKey: string | null = previous?.sectionKey ?? null;
  if (location.sectionKey) {
    sectionKey = location.sectionKey;
  } else if (!location.subjectHref) {
    sectionKey = null;
  } else if (location.clusterKey) {
    sectionKey = null;
  }

  let topicHref: string | null = previous?.topicHref ?? null;
  if (!clearingHash) {
    topicHref = location.topicHref;
  }

  return {
    subjectHref: location.subjectHref,
    clusterKey,
    sectionKey,
    topicHref,
  };
}

export function collapseAllSidebarTracks(
  setOpenTrackIds: Dispatch<SetStateAction<Set<NavTrackScope>>>,
  setTrackFolds: Dispatch<SetStateAction<Map<NavTrackScope, NavLocation>>>,
) {
  setOpenTrackIds(new Set());
  setTrackFolds(new Map());
}

export function dispatchSidebarCollapseAll() {
  if (typeof window === "undefined") {
    return;
  }
  window.dispatchEvent(new Event(SIDEBAR_COLLAPSE_ALL_EVENT));
}

let collapseTracksOnSectionChange = false;

export function dispatchSidebarCollapseTracks() {
  collapseTracksOnSectionChange = true;
  if (typeof window === "undefined") {
    return;
  }
  window.dispatchEvent(new Event(SIDEBAR_COLLAPSE_TRACKS_EVENT));
}

/** True when Conspect/Interviews was switched from the radio (tracks stay closed). */
export function consumeCollapseTracksOnSectionChange(): boolean {
  const next = collapseTracksOnSectionChange;
  collapseTracksOnSectionChange = false;
  return next;
}

export function foldRevision(
  folds: ReadonlyMap<NavTrackScope, NavLocation>,
  openTracks: ReadonlySet<NavTrackScope>,
): string {
  return [...openTracks]
    .sort()
    .map((scope) => {
      const fold = folds.get(scope) ?? EMPTY_FOLD;
      return `${scope}:${fold.subjectHref ?? ""}:${fold.clusterKey ?? ""}:${fold.sectionKey ?? ""}:${fold.topicHref ?? ""}`;
    })
    .join("|");
}

export function sidebarNavLocation(
  sections: readonly NavRootSection[],
  pathname: string,
  hash: string,
): { pathname: string; hash: string; location: NavLocation } {
  const located = handbookLocation(pathname, hash);
  const groups = navGroupsForPath(sections, located.pathname);
  return {
    pathname: located.pathname,
    hash: located.hash,
    location: locationForPath(groups, located.pathname, located.hash),
  };
}

/** Match open-track sync to the effective nav path (includes optimistic pending routes). */
export function activeTrackIdForNavPath(
  sections: readonly NavRootSection[],
  navPathname: string,
): TrackId | null {
  const groups = navGroupsForPath(sections, navPathname);
  return (
    groups.find((group) => isActiveTrack(navPathname, group.href))?.id ?? null
  );
}

export function useSidebarOpen({
  sections,
  pathname,
  hash,
  searching,
  activeRootSectionId,
}: {
  sections: readonly NavRootSection[];
  pathname: string;
  hash: string;
  searching: boolean;
  activeRootSectionId: NavRootSectionId;
}) {
  const nav = sidebarNavLocation(sections, pathname, hash);
  const navTopicHref = nav.location.topicHref;
  const navSubjectHref = nav.location.subjectHref;
  const navClusterKey = nav.location.clusterKey;
  const navSectionKey = nav.location.sectionKey;
  const locationKey = navLocationKey(nav.location);
  const activeTrackId = activeTrackIdForNavPath(sections, nav.pathname);
  const activeConceptId = hashIdFrom(nav.hash);
  const activeTrackScope =
    activeTrackId !== null
      ? navTrackScope(activeRootSectionId, activeTrackId)
      : null;
  const [openRootSectionIds, setOpenRootSectionIds] = useState<
    Set<NavRootSectionId>
  >(() => new Set([activeRootSectionId]));
  const [openTrackIds, setOpenTrackIds] = useState<Set<NavTrackScope>>(() =>
    activeTrackScope ? new Set([activeTrackScope]) : new Set(),
  );
  const [trackFolds, setTrackFolds] = useState<Map<NavTrackScope, NavLocation>>(
    () => {
      if (!activeTrackScope) {
        return new Map();
      }
      return new Map([
        [
          activeTrackScope,
          {
            topicHref: navTopicHref,
            subjectHref: navSubjectHref,
            clusterKey: navClusterKey,
            sectionKey: navSectionKey,
          },
        ],
      ]);
    },
  );
  const navSnapshotRef = useRef<
    NavSnapshot & { activeRootSectionId: NavRootSectionId }
  >({
    searching,
    activeTrackId,
    activeRootSectionId,
    pathname: nav.pathname,
    hash: nav.hash,
    activeConceptId,
    locationKey,
  });

  useLayoutEffect(() => {
    const snapshot = navSnapshotRef.current;
    if (
      searching === snapshot.searching &&
      activeTrackId === snapshot.activeTrackId &&
      activeRootSectionId === snapshot.activeRootSectionId &&
      nav.pathname === snapshot.pathname &&
      nav.hash === snapshot.hash &&
      activeConceptId === snapshot.activeConceptId &&
      snapshot.locationKey === locationKey
    ) {
      return;
    }
    const location: NavLocation = {
      topicHref: navTopicHref,
      subjectHref: navSubjectHref,
      clusterKey: navClusterKey,
      sectionKey: navSectionKey,
    };
    if (!searching) {
      syncOpenState({
        snapshot,
        activeTrackId,
        activeRootSectionId,
        pathname: nav.pathname,
        hash: nav.hash,
        activeConceptId,
        location,
        setOpenTrackIds,
        setTrackFolds,
        setOpenRootSectionIds,
      });
    }
    navSnapshotRef.current = {
      searching,
      activeTrackId,
      activeRootSectionId,
      pathname: nav.pathname,
      hash: nav.hash,
      activeConceptId,
      locationKey,
    };
  }, [
    searching,
    activeTrackId,
    activeRootSectionId,
    nav.pathname,
    nav.hash,
    activeConceptId,
    locationKey,
    navTopicHref,
    navSubjectHref,
    navClusterKey,
    navSectionKey,
  ]);

  const getTrackFold = useCallback(
    (sectionId: NavRootSectionId, trackId: TrackId): NavLocation =>
      trackFolds.get(navTrackScope(sectionId, trackId)) ?? EMPTY_FOLD,
    [trackFolds],
  );

  const patchTrackFold = useCallback(
    (
      sectionId: NavRootSectionId,
      trackId: TrackId,
      patch: Partial<NavLocation>,
    ) => {
      const scope = navTrackScope(sectionId, trackId);
      setTrackFolds((previous) => {
        const next = new Map(previous);
        const current = next.get(scope) ?? EMPTY_FOLD;
        next.set(scope, { ...current, ...patch });
        return next;
      });
    },
    [],
  );

  useEffect(() => {
    function onCollapseTracks() {
      collapseAllSidebarTracks(setOpenTrackIds, setTrackFolds);
    }
    function onCollapseAll() {
      onCollapseTracks();
      setOpenRootSectionIds(new Set(["conspect"]));
    }
    window.addEventListener(SIDEBAR_COLLAPSE_TRACKS_EVENT, onCollapseTracks);
    window.addEventListener(SIDEBAR_COLLAPSE_ALL_EVENT, onCollapseAll);
    return () => {
      window.removeEventListener(
        SIDEBAR_COLLAPSE_TRACKS_EVENT,
        onCollapseTracks,
      );
      window.removeEventListener(SIDEBAR_COLLAPSE_ALL_EVENT, onCollapseAll);
    };
  }, []);

  const toggleRootSectionId = useCallback((sectionId: NavRootSectionId) => {
    setOpenRootSectionIds((previous) => {
      if (previous.has(sectionId)) {
        return new Set();
      }
      return new Set([sectionId]);
    });
  }, []);

  const ensureRootSectionOpen = useCallback((sectionId: NavRootSectionId) => {
    setOpenRootSectionIds((previous) => {
      if (previous.size === 1 && previous.has(sectionId)) {
        return previous;
      }
      return new Set([sectionId]);
    });
  }, []);

  const toggleTrackId = useCallback(
    (sectionId: NavRootSectionId, trackId: TrackId) => {
      const scope = navTrackScope(sectionId, trackId);
      setOpenTrackIds((previous) => {
        if (previous.has(scope)) {
          return new Set();
        }
        return new Set([scope]);
      });
    },
    [],
  );

  const ensureTrackOpen = useCallback(
    (sectionId: NavRootSectionId, trackId: TrackId) => {
      const scope = navTrackScope(sectionId, trackId);
      setOpenTrackIds((previous) => {
        if (previous.size === 1 && previous.has(scope)) {
          return previous;
        }
        return new Set([scope]);
      });
    },
    [],
  );

  const isTrackOpen = useCallback(
    (sectionId: NavRootSectionId, trackId: TrackId) =>
      openTrackIds.has(navTrackScope(sectionId, trackId)),
    [openTrackIds],
  );

  return {
    activeConceptId,
    openRootSectionIds,
    toggleRootSectionId,
    ensureRootSectionOpen,
    toggleTrackId,
    ensureTrackOpen,
    isTrackOpen,
    openTrackIds,
    trackFolds,
    getTrackFold,
    patchTrackFold,
  };
}

function syncOpenState({
  snapshot,
  activeTrackId,
  activeRootSectionId,
  pathname,
  hash,
  activeConceptId,
  location,
  setOpenTrackIds,
  setTrackFolds,
  setOpenRootSectionIds,
}: {
  snapshot: NavSnapshot & { activeRootSectionId: NavRootSectionId };
  activeTrackId: TrackId | null;
  activeRootSectionId: NavRootSectionId;
  pathname: string;
  hash: string;
  activeConceptId: string;
  location: NavLocation;
  setOpenTrackIds: Dispatch<SetStateAction<Set<NavTrackScope>>>;
  setTrackFolds: Dispatch<SetStateAction<Map<NavTrackScope, NavLocation>>>;
  setOpenRootSectionIds: Dispatch<SetStateAction<Set<NavRootSectionId>>>;
}) {
  const leftSearch = snapshot.searching;
  const activeTrackScope =
    activeTrackId !== null
      ? navTrackScope(activeRootSectionId, activeTrackId)
      : null;
  if (!leftSearch && pathname !== snapshot.pathname && isHomePath(pathname)) {
    collapseAllSidebarTracks(setOpenTrackIds, setTrackFolds);
    setOpenRootSectionIds(new Set(["conspect"]));
    return;
  }
  if (!leftSearch && activeRootSectionId !== snapshot.activeRootSectionId) {
    setOpenRootSectionIds(new Set([activeRootSectionId]));
    if (consumeCollapseTracksOnSectionChange() || !activeTrackScope) {
      collapseAllSidebarTracks(setOpenTrackIds, setTrackFolds);
      return;
    }
    setOpenTrackIds(new Set([activeTrackScope]));
    setTrackFolds(new Map([[activeTrackScope, location]]));
    return;
  }
  if (
    leftSearch ||
    activeRootSectionId !== snapshot.activeRootSectionId ||
    pathname !== snapshot.pathname
  ) {
    setOpenRootSectionIds((previous) => {
      if (previous.size === 1 && previous.has(activeRootSectionId)) {
        return previous;
      }
      return new Set([activeRootSectionId]);
    });
  }
  if (
    leftSearch ||
    activeTrackId !== snapshot.activeTrackId ||
    activeRootSectionId !== snapshot.activeRootSectionId ||
    pathname !== snapshot.pathname
  ) {
    if (activeTrackScope) {
      setOpenTrackIds((previous) => {
        if (previous.size === 1 && previous.has(activeTrackScope)) {
          return previous;
        }
        return new Set([activeTrackScope]);
      });
    }
  }
  if (leftSearch || pathname !== snapshot.pathname || hash !== snapshot.hash) {
    if (activeTrackScope) {
      const clearingHash =
        !leftSearch &&
        pathname === snapshot.pathname &&
        snapshot.hash !== "" &&
        hash === "";
      const trackChanged =
        !leftSearch &&
        activeTrackId !== snapshot.activeTrackId &&
        snapshot.activeTrackId !== null;
      setTrackFolds((previous) => {
        const next = new Map(previous);
        next.set(
          activeTrackScope,
          trackChanged
            ? location
            : foldFromSync(
                location,
                previous.get(activeTrackScope),
                clearingHash,
              ),
        );
        return next;
      });
    }
  } else if (activeConceptId && activeConceptId !== snapshot.activeConceptId) {
    if (activeTrackScope && location.topicHref) {
      setTrackFolds((previous) => {
        const next = new Map(previous);
        const current = next.get(activeTrackScope) ?? EMPTY_FOLD;
        next.set(activeTrackScope, {
          ...current,
          topicHref: location.topicHref,
        });
        return next;
      });
    }
  }
}
