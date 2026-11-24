"use client";

import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { type NavGroup, type SearchMode } from "@/lib/nav";
import { sectionSearchGroups } from "@/lib/nav/sectionSearchGroups";
import { followHandbookHref } from "../utils/hash";
import { useSearchCorpus } from "../utils/searchCorpus";
import { readSearchUi, writeUi } from "../utils/uiStorage";

export function useHandbookSearch(
  groups: readonly NavGroup[],
  onSearchActive?: () => void,
) {
  const pathname = usePathname() ?? "/";
  const router = useRouter();
  const onSearchActiveRef = useRef(onSearchActive);
  const pathnameRef = useRef(pathname);
  const restoreHrefRef = useRef<string | null>(null);
  const [query, setQuery] = useState("");
  const [queryEdited, setQueryEdited] = useState(false);
  const [mode, setMode] = useState<SearchMode>("titles");
  const hydratedRef = useRef(false);
  useEffect(() => {
    if (hydratedRef.current) {
      return;
    }
    hydratedRef.current = true;
    const stored = readSearchUi();
    setQuery(stored.query);
    setMode(stored.mode);
  }, []);
  const notesCorpus = useSearchCorpus(mode === "notes");
  const searchGroups = useMemo(
    () => sectionSearchGroups(groups, notesCorpus, mode),
    [groups, notesCorpus, mode],
  );
  const deferredQuery = useDeferredValue(query);

  useEffect(() => {
    onSearchActiveRef.current = onSearchActive;
    pathnameRef.current = pathname;
  }, [onSearchActive, pathname]);

  function currentHref() {
    return `${pathnameRef.current}${window.location.hash}`;
  }

  const goTo = useCallback(
    (target: string) => {
      followHandbookHref(target, pathnameRef.current, (path) => {
        router.replace(path, { scroll: false });
      });
    },
    [router],
  );

  const restoreSearchLocation = useCallback(() => {
    const restore = restoreHrefRef.current;
    restoreHrefRef.current = null;
    if (restore && restore !== currentHref()) {
      goTo(restore);
    }
  }, [goTo]);

  function changeQuery(value: string) {
    const wasEmpty = query.trim().length === 0;
    const trimmed = value.trim();
    setQueryEdited(true);
    setQuery(value);
    writeUi({ query: value }, { notify: false });
    if (trimmed.length > 0) {
      if (wasEmpty) {
        onSearchActiveRef.current?.();
      }
      if (restoreHrefRef.current === null) {
        restoreHrefRef.current = currentHref();
      }
      return;
    }
    restoreSearchLocation();
  }

  function clearQuery() {
    restoreHrefRef.current = null;
    setQuery("");
    writeUi({ query: "" }, { notify: false });
  }

  /** Keep the current page when the search box is later cleared (e.g. after picking a hit). */
  function commitSearchLocation() {
    restoreHrefRef.current = null;
  }

  function changeMode(nextMode: SearchMode) {
    setMode(nextMode);
    writeUi({ mode: nextMode }, { notify: false });
    if (query.trim().length > 0) {
      onSearchActiveRef.current?.();
    }
  }

  const notesCorpusLoading = mode === "notes" && notesCorpus === null;
  const searchPending = query.trim().length > 0 && query !== deferredQuery;

  return {
    query,
    deferredQuery,
    queryEdited,
    mode,
    searchGroups,
    notesCorpusLoading,
    searchPending,
    changeQuery,
    clearQuery,
    commitSearchLocation,
    changeMode,
  };
}
