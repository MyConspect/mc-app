"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { conceptBackHref } from "@/components/nav/utils/conceptNavBack";
import {
  followHandbookHref,
  clearConceptHash,
  suppressNextConceptNavRecord,
} from "@/components/nav/utils/hash";
import { useHandbookLocation } from "@/components/nav/hooks/useHandbookLocation";
import {
  getBookmarkNavMode,
  getServerBookmarkNavMode,
  setBookmarkNavMode,
  subscribeBookmarkNavMode,
} from "@/components/nav/utils/bookmarkNavMode";
import {
  adjacentConceptId,
  navChainForPath,
  navChainIndex,
  parentHrefForPath,
  siblingNavHrefForPath,
} from "@/components/nav/utils/location";
import { useTopicNavConcepts } from "@/components/topic/context/TopicNavConceptsContext";
import { resolveConceptId } from "@/lib/nav/conceptHash";
import { hashIdFrom } from "@/lib/nav/navUtils";
import { useHandbookNavGroups } from "@/components/nav/context/handbookNavContext";
import { useSearchCorpus } from "@/components/nav/utils/searchCorpus";
import {
  activeBookmarkIndex,
  getServerBookmarks,
  readBookmarks,
  siblingBookmarkHref,
  subscribeBookmarks,
} from "@/lib/nav/bookmarks";
import { chromeFor } from "@/lib/i18n/chrome";
import { localeFromPathname } from "@/lib/i18n/paths";
import { splitHref } from "@/lib/nav";

function siblingHrefFromConceptIds(
  concepts: readonly { readonly id: string }[],
  pathname: string,
  hash: string,
  delta: -1 | 1,
): string | null {
  const conceptId =
    resolveConceptId(hashIdFrom(hash), concepts) || hashIdFrom(hash);
  if (!conceptId || concepts.length <= 1) {
    return null;
  }
  const ids = concepts.map((concept) => concept.id);
  const adjacentId = adjacentConceptId(ids, conceptId, delta);
  if (adjacentId) {
    return `${pathname}#${adjacentId}`;
  }
  if (delta < 0) {
    return ids.indexOf(conceptId) === 0 ? pathname : null;
  }
  const lastId = ids[ids.length - 1];
  return conceptId === lastId ? pathname : null;
}

export function useHandbookTopicNav(options?: {
  conceptOpen?: boolean;
  conceptId?: string;
}) {
  const { pathname, location, activeConceptId } = useHandbookLocation();
  const resolvedConceptId = activeConceptId || options?.conceptId || "";
  const navHash =
    location.hash ||
    (options?.conceptId ? `#${options.conceptId}` : location.hash);
  const conceptOpen = options?.conceptOpen ?? resolvedConceptId.length > 0;
  const router = useRouter();
  const bookmarks = useSyncExternalStore(
    subscribeBookmarks,
    readBookmarks,
    getServerBookmarks,
  );
  const shellNavGroups = useHandbookNavGroups();
  const searchNavGroups = useSearchCorpus(shellNavGroups === null);
  const navGroups = shellNavGroups ?? searchNavGroups;
  const topicNavConcepts = useTopicNavConcepts();
  const locale = localeFromPathname(pathname);
  const chrome = useMemo(() => chromeFor(locale), [locale]);

  const bookmarkNavMode = useSyncExternalStore(
    subscribeBookmarkNavMode,
    getBookmarkNavMode,
    getServerBookmarkNavMode,
  );
  const bookmarkIndex = useMemo(
    () => activeBookmarkIndex(bookmarks, location.pathname, resolvedConceptId),
    [bookmarks, location.pathname, resolvedConceptId],
  );
  const inBookmarks =
    bookmarkNavMode && bookmarkIndex >= 0 && bookmarks.length > 1;

  const chain = useMemo(() => {
    if (!navGroups) {
      return null;
    }
    return navChainForPath(navGroups, location.pathname, location.hash);
  }, [navGroups, location.pathname, location.hash]);

  const chainIndex = useMemo(() => {
    if (!chain) {
      return -1;
    }
    return navChainIndex(chain, location.pathname, location.hash);
  }, [chain, location.pathname, location.hash]);

  const inChain = chainIndex >= 0;

  const topicScopedSibling = useMemo(() => {
    if (!conceptOpen || !resolvedConceptId || !topicNavConcepts) {
      return null;
    }
    const prev = siblingHrefFromConceptIds(
      topicNavConcepts,
      location.pathname,
      navHash,
      -1,
    );
    const next = siblingHrefFromConceptIds(
      topicNavConcepts,
      location.pathname,
      navHash,
      1,
    );
    if (prev === null && next === null) {
      return null;
    }
    return { prev, next };
  }, [
    conceptOpen,
    location.pathname,
    navHash,
    resolvedConceptId,
    topicNavConcepts,
  ]);

  const prevHref = useMemo(() => {
    if (inBookmarks) {
      return siblingBookmarkHref(
        bookmarks,
        location.pathname,
        resolvedConceptId,
        -1,
      );
    }
    const fromHistory =
      conceptOpen && resolvedConceptId
        ? conceptBackHref(location.pathname, resolvedConceptId)
        : null;
    if (fromHistory !== null) {
      return fromHistory;
    }
    if (topicScopedSibling?.prev != null) {
      return topicScopedSibling.prev;
    }
    if (!navGroups) {
      return null;
    }
    return siblingNavHrefForPath(navGroups, location.pathname, navHash, -1);
  }, [
    inBookmarks,
    bookmarks,
    location.pathname,
    navHash,
    resolvedConceptId,
    navGroups,
    topicScopedSibling,
  ]);

  const nextHref = useMemo(() => {
    if (inBookmarks) {
      return siblingBookmarkHref(
        bookmarks,
        location.pathname,
        resolvedConceptId,
        1,
      );
    }
    if (topicScopedSibling?.next != null) {
      return topicScopedSibling.next;
    }
    if (!navGroups) {
      return null;
    }
    return siblingNavHrefForPath(navGroups, location.pathname, navHash, 1);
  }, [
    inBookmarks,
    bookmarks,
    location.pathname,
    navHash,
    resolvedConceptId,
    navGroups,
    topicScopedSibling,
  ]);

  const parentHref = useMemo(() => {
    if (!navGroups) {
      return null;
    }
    return parentHrefForPath(navGroups, location.pathname, navHash, {
      home: chrome.home,
      instructions: chrome.instructions,
    });
  }, [navGroups, location.pathname, navHash, chrome.home, chrome.instructions]);

  const navigate = useCallback(
    (href: string | null, options?: { suppressConceptNavRecord?: boolean }) => {
      if (!href) {
        return;
      }
      const { pathname: targetPath, hash: targetHash } = splitHref(href);
      if (targetPath === pathname && !targetHash && resolvedConceptId) {
        if (!bookmarkNavMode) {
          setBookmarkNavMode(false);
        }
        clearConceptHash(false);
        return;
      }
      if (options?.suppressConceptNavRecord) {
        suppressNextConceptNavRecord();
      }
      followHandbookHref(
        href,
        pathname,
        (path) => {
          router.push(path, { scroll: false });
        },
        { bookmarkNav: bookmarkNavMode },
      );
    },
    [pathname, router, bookmarkNavMode, resolvedConceptId],
  );

  const goBack = useCallback(() => {
    navigate(prevHref, { suppressConceptNavRecord: true });
  }, [navigate, prevHref]);

  const goNext = useCallback(() => {
    navigate(nextHref);
  }, [navigate, nextHref]);

  const goToParent = useCallback(() => {
    navigate(parentHref);
  }, [navigate, parentHref]);

  const onTopicIndex = !hashIdFrom(navHash);

  return {
    inChain: inBookmarks || inChain,
    showBack: inBookmarks
      ? prevHref !== null
      : prevHref !== null && (conceptOpen || onTopicIndex),
    showNext: inBookmarks
      ? nextHref !== null
      : nextHref !== null && (conceptOpen || onTopicIndex),
    goBack,
    goNext,
    goToParent,
    parentHref,
    prevHref,
    nextHref,
  };
}
