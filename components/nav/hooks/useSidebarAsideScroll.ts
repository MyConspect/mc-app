"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { HANDBOOK_SIDEBAR_ID, NAV_FOLD_OPEN_MS } from "@/constants";
import { splitHref } from "@/lib/nav";
import {
  isSidebarPinHeld,
  resetNavAsideScroll,
  restoreSidebarPin,
  scrollSidebarActivePath,
  scrollSidebarHit,
  shouldResetNavAsideScroll,
} from "../utils/sidebarPin";

/** Keeps aside scroll, pin restore, and active-row scrolling in one place. */
export function useSidebarAsideScroll({
  searching,
  pathname,
  hash,
  navRevision,
  firstHref,
  activeConceptId,
  highlightPathname,
}: {
  searching: boolean;
  pathname: string;
  hash: string;
  navRevision: string;
  firstHref: string | null;
  activeConceptId: string;
  highlightPathname: string;
}) {
  const wasSearching = useRef(false);
  const prevPathnameRef = useRef(pathname);
  const skipPinRestoreRef = useRef(false);

  useLayoutEffect(() => {
    if (searching) {
      if (!wasSearching.current) {
        resetNavAsideScroll();
      }
      wasSearching.current = true;
      return;
    }
    wasSearching.current = false;
    if (prevPathnameRef.current !== pathname) {
      const previous = prevPathnameRef.current;
      prevPathnameRef.current = pathname;
      if (shouldResetNavAsideScroll(previous, pathname)) {
        if (isSidebarPinHeld()) {
          skipPinRestoreRef.current = false;
        } else {
          skipPinRestoreRef.current = true;
          resetNavAsideScroll();
        }
      }
      return;
    }
    restoreSidebarPin();
  }, [searching, navRevision, pathname, hash]);

  useEffect(() => {
    if (searching) {
      return;
    }
    const frame = window.requestAnimationFrame(() => {
      if (!skipPinRestoreRef.current) {
        restoreSidebarPin();
      }
    });
    const later = window.setTimeout(() => {
      if (skipPinRestoreRef.current) {
        scrollSidebarActivePath();
        skipPinRestoreRef.current = false;
        return;
      }
      restoreSidebarPin();
    }, NAV_FOLD_OPEN_MS + 20);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(later);
    };
  }, [navRevision, pathname, hash, searching]);

  useEffect(() => {
    if (!firstHref || searching) {
      return;
    }
    const nav = document.getElementById(HANDBOOK_SIDEBAR_ID);
    const hit = nav?.querySelector("[data-search-hit='true']");
    if (hit instanceof HTMLElement) {
      scrollSidebarHit(hit);
    }
  }, [firstHref, searching]);

  useEffect(() => {
    if (!activeConceptId || searching) {
      return;
    }
    const frame = window.requestAnimationFrame(() => {
      const nav = document.getElementById(HANDBOOK_SIDEBAR_ID);
      const hits = nav?.querySelectorAll(
        `[data-concept-id="${CSS.escape(activeConceptId)}"]`,
      );
      if (!hits) {
        return;
      }
      for (const hit of hits) {
        if (!(hit instanceof HTMLElement)) {
          continue;
        }
        const href = hit.getAttribute("href");
        if (!href || splitHref(href).pathname !== highlightPathname) {
          continue;
        }
        scrollSidebarHit(hit);
        break;
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, [activeConceptId, highlightPathname, navRevision, searching]);
}
