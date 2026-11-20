"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

const DESKTOP_QUERY = "(min-width: 768px)";
const MOBILE_VIEWPORT_QUERY = "(max-width: 767px)";

export function useHandbookMobileViewport() {
  return useSyncExternalStore(
    (onStoreChange) => {
      const mq = window.matchMedia(MOBILE_VIEWPORT_QUERY);
      mq.addEventListener("change", onStoreChange);
      return () => mq.removeEventListener("change", onStoreChange);
    },
    () => window.matchMedia(MOBILE_VIEWPORT_QUERY).matches,
    () => false,
  );
}

export function isHandbookMobileViewport() {
  return window.matchMedia(MOBILE_VIEWPORT_QUERY).matches;
}

export function useMobileNav() {
  const [navOpen, setNavOpen] = useState(false);
  const openNav = useCallback(() => setNavOpen(true), []);
  const closeNav = useCallback(() => setNavOpen(false), []);
  const toggleNav = useCallback(() => setNavOpen((open) => !open), []);

  useEffect(() => {
    if (!navOpen) {
      return;
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setNavOpen(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [navOpen]);

  useEffect(() => {
    const desktop = window.matchMedia(DESKTOP_QUERY);
    const onBreakpointChange = (event: MediaQueryListEvent) => {
      if (event.matches) {
        setNavOpen(false);
      }
    };
    desktop.addEventListener("change", onBreakpointChange);
    return () => desktop.removeEventListener("change", onBreakpointChange);
  }, []);

  return { navOpen, openNav, closeNav, toggleNav };
}
