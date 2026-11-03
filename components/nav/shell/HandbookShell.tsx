"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type PointerEvent,
} from "react";
import { usePathname } from "next/navigation";
import { SearchQueryContext } from "@/components/search";
import { HANDBOOK_MAIN_ID, HANDBOOK_NAV_ASIDE_ID } from "@/constants";
import { HandbookMobileNavProvider } from "../context/handbookMobileNavContext";
import { HandbookNavGroupsProvider } from "../context/handbookNavContext";
import { useApplyPendingHash } from "../hooks/useApplyPendingHash";
import { useEnrichedNavSections } from "../hooks/useEnrichedNavSections";
import { useHandbookSearch } from "../hooks/useHandbookSearch";
import { useHandbookShortcuts } from "../hooks/useHandbookShortcuts";
import { useMobileNav } from "../hooks/useMobileNav";
import { useRememberLocation } from "../hooks/useRememberLocation";
import { useResetMainScroll } from "../hooks/useResetMainScroll";
import { dispatchSidebarCollapseAll } from "../hooks/useSidebarOpen";
import { useSidebarCollapsed } from "../hooks/useSidebarCollapsed";
import { SidebarDockButton } from "../header/SidebarDockButton";
import { DrawerFooter, SiteHeader } from "../header/SiteHeader";
import { localeFromPathname } from "@/lib/i18n/paths";
import { SidebarNavChrome } from "../sidebar/SidebarNavChrome";
import { TopicSidebar } from "../sidebar/TopicSidebar";
import { ContentBreadcrumbs } from "../ui/ContentBreadcrumbs";
import { ConceptFooterActionsProvider } from "@/components/topic/conceptFooterActionsContext";
import { HandbookBusyIndicator } from "../ui/HandbookBusyIndicator";
import { ScrollToTopButton } from "../ui/ScrollToTopButton";
import {
  getPendingPathname,
  getServerPendingPathname,
  subscribePendingPath,
} from "../utils/hash";
import type { ChromeCopy, NavRootSection } from "@/lib/nav";
import { allNavGroups, navGroupsForPath } from "@/lib/nav/sections";

const SIDEBAR_MOTION =
  "transition-[width,transform,box-shadow] duration-200 ease-out motion-reduce:transition-none";
const SIDEBAR_MOBILE_FRAME =
  "fixed inset-x-0 top-14 z-40 flex h-[calc(100dvh-3.5rem)] w-full flex-col max-md:touch-manipulation";
const SIDEBAR_DESKTOP =
  "md:pointer-events-auto md:z-20 md:cursor-pointer md:shrink-0 md:translate-x-0 md:overflow-visible md:border-r md:border-zinc-200 dark:md:border-zinc-800";
const SIDEBAR_DESKTOP_WIDTH = "md:w-[300px]";
const SIDEBAR_DESKTOP_OPEN = `${SIDEBAR_DESKTOP} md:relative md:inset-auto md:top-auto md:right-auto md:bottom-auto md:left-auto md:h-auto ${SIDEBAR_DESKTOP_WIDTH} md:shadow-none`;
const SIDEBAR_DESKTOP_COLLAPSED = `${SIDEBAR_DESKTOP} md:absolute md:inset-y-0 md:left-0 md:top-0 md:bottom-0 md:h-auto md:w-10 md:shadow-none`;
const SIDEBAR_DESKTOP_PEEK = `${SIDEBAR_DESKTOP} md:absolute md:inset-y-0 md:left-0 md:top-0 md:bottom-0 md:z-30 md:h-auto ${SIDEBAR_DESKTOP_WIDTH} md:shadow-lg`;
const SIDEBAR_PANEL_MOTION =
  "flex min-h-0 flex-1 flex-col overflow-hidden transition-opacity duration-200 ease-out motion-reduce:transition-none";
const PEEK_LEAVE_MS = 80;
const PEEK_TOGGLE_LOCK_MS = 300;

export function HandbookShell({
  sections,
  chrome,
  lastUpdatedIso,
  lastUpdatedLabel,
  children,
}: {
  sections: readonly NavRootSection[];
  chrome: ChromeCopy;
  lastUpdatedIso: string;
  lastUpdatedLabel: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname() ?? "/";
  const locale = localeFromPathname(pathname);
  const shellGroups = useMemo(() => allNavGroups(sections), [sections]);
  const sectionGroups = useMemo(
    () => navGroupsForPath(sections, pathname),
    [sections, pathname],
  );
  const { navOpen, closeNav, toggleNav, openNav } = useMobileNav();
  const { collapsed, expandSidebar, toggleSidebar } = useSidebarCollapsed();
  const [searchSheetDismissed, setSearchSheetDismissed] = useState(true);
  const revealSearchNav = useCallback(() => {
    expandSidebar();
    setSearchSheetDismissed(false);
    openNav();
  }, [expandSidebar, openNav]);
  const dismissNav = useCallback(() => {
    closeNav();
    setSearchSheetDismissed(true);
  }, [closeNav]);
  const {
    query,
    deferredQuery,
    queryEdited,
    mode,
    notesCorpusLoading,
    searchPending,
    changeQuery,
    clearQuery,
    changeMode,
    commitSearchLocation,
  } = useHandbookSearch(sectionGroups, revealSearchNav);
  const pendingPathname = useSyncExternalStore(
    subscribePendingPath,
    getPendingPathname,
    getServerPendingPathname,
  );
  const routePending =
    pendingPathname.length > 0 && pendingPathname !== pathname;
  const selectNavResult = useCallback(() => {
    dismissNav();
    commitSearchLocation();
  }, [commitSearchLocation, dismissNav]);
  const onQueryChange = useCallback(
    (value: string) => {
      if (value.trim().length === 0) {
        setSearchSheetDismissed(false);
      }
      changeQuery(value);
    },
    [changeQuery],
  );
  const onHomeClick = useCallback(() => {
    dispatchSidebarCollapseAll();
    clearQuery();
    setSearchSheetDismissed(false);
    dismissNav();
  }, [clearQuery, dismissNav]);
  const searchValue = useMemo(
    () => ({ query: deferredQuery, mode, queryEdited }),
    [deferredQuery, mode, queryEdited],
  );
  const searching = query.trim().length > 0;
  const enrichedSections = useEnrichedNavSections(sections, mode === "notes");
  const groups = useMemo(
    () => allNavGroups(enrichedSections),
    [enrichedSections],
  );
  const busyLabel = routePending
    ? chrome.pageLoading
    : notesCorpusLoading || searchPending
      ? chrome.searchLoading
      : chrome.pageLoading;
  const showBusy =
    routePending || searchPending || (searching && notesCorpusLoading);
  const sidebarQuery = deferredQuery;
  const searchSheet = searching && !searchSheetDismissed && navOpen;
  const menuOpen = navOpen;
  const onToggleNav = useCallback(() => {
    if (searchSheet) {
      dismissNav();
      return;
    }
    toggleNav();
  }, [dismissNav, searchSheet, toggleNav]);
  useHandbookShortcuts({
    query,
    clearQuery,
    searchSheetOpen: searchSheet,
    dismissNav,
  });
  const desktopCollapsed = collapsed;
  const peekEnabled = desktopCollapsed;
  const {
    peeking,
    onAsidePointerEnter,
    onAsidePointerLeave,
    onDockPointerLeave,
    suppressPeek,
  } = useDesktopSidebarPeek(peekEnabled);
  const onToggleSidebar = useCallback(() => {
    if (desktopCollapsed && peeking) {
      suppressPeek(PEEK_TOGGLE_LOCK_MS);
      return;
    }
    toggleSidebar();
    suppressPeek(PEEK_TOGGLE_LOCK_MS);
  }, [desktopCollapsed, peeking, suppressPeek, toggleSidebar]);
  const desktopClass = desktopCollapsed
    ? peeking
      ? SIDEBAR_DESKTOP_PEEK
      : SIDEBAR_DESKTOP_COLLAPSED
    : SIDEBAR_DESKTOP_OPEN;
  useRememberLocation(shellGroups);
  useApplyPendingHash();
  useResetMainScroll();

  return (
    <HandbookMobileNavProvider navOpen={navOpen}>
      <SearchQueryContext.Provider value={searchValue}>
        <div className="flex h-dvh max-h-dvh flex-col overflow-hidden">
          <div className="relative z-50 shrink-0 overflow-hidden md:overflow-visible">
            <HandbookBusyIndicator busy={showBusy} label={busyLabel} />
            <SiteHeader
              query={query}
              onQueryChange={onQueryChange}
              onHomeClick={onHomeClick}
              mode={mode}
              onModeChange={changeMode}
              chrome={chrome}
              navOpen={menuOpen}
              onToggleNav={onToggleNav}
            />
            <SidebarDockButton
              collapsed={desktopCollapsed}
              peeking={peeking}
              collapseLabel={chrome.collapseSidebar}
              expandLabel={chrome.expandSidebar}
              onToggle={onToggleSidebar}
              onPointerLeave={onDockPointerLeave}
            />
          </div>
          <div
            className="relative flex min-h-0 flex-1"
            style={{ overflow: "hidden" }}
          >
            <button
              type="button"
              className={
                navOpen && !searching
                  ? "fixed inset-x-0 top-14 z-20 h-[calc(100dvh-3.5rem)] bg-zinc-900/30 opacity-100 transition-opacity duration-200 ease-out motion-reduce:transition-none md:hidden"
                  : "max-md:hidden fixed inset-x-0 top-14 z-20 h-[calc(100dvh-3.5rem)] bg-zinc-900/30 md:hidden"
              }
              tabIndex={-1}
              aria-hidden="true"
              aria-label={chrome.closeMenu}
              onClick={closeNav}
            />
            {desktopCollapsed ? (
              <div
                className="hidden w-10 shrink-0 md:block"
                aria-hidden="true"
              />
            ) : null}
            <aside
              className={
                menuOpen
                  ? `${SIDEBAR_MOBILE_FRAME} max-md:translate-x-0 border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 ${SIDEBAR_MOTION} ${desktopClass}`
                  : `max-md:hidden ${SIDEBAR_MOBILE_FRAME} border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 ${SIDEBAR_MOTION} ${desktopClass}`
              }
              onPointerEnter={onAsidePointerEnter}
              onPointerLeave={onAsidePointerLeave}
            >
              <div
                className={
                  desktopCollapsed && !peeking
                    ? `${SIDEBAR_PANEL_MOTION} h-full min-h-0 w-full opacity-100 md:pointer-events-none md:opacity-0`
                    : `${SIDEBAR_PANEL_MOTION} h-full min-h-0 w-full min-w-0 opacity-100`
                }
              >
                <div
                  className={`flex h-full min-h-0 min-w-0 flex-1 flex-col ${SIDEBAR_DESKTOP_WIDTH}`}
                >
                  <SidebarNavChrome
                    sections={enrichedSections}
                    chrome={chrome}
                    onNavigate={selectNavResult}
                    className="shrink-0 border-b border-zinc-200 pb-3 md:hidden dark:border-zinc-800"
                  />
                  <div
                    id={HANDBOOK_NAV_ASIDE_ID}
                    className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto"
                    style={{ overscrollBehavior: "contain" }}
                  >
                    <TopicSidebar
                      sections={enrichedSections}
                      query={sidebarQuery}
                      chrome={chrome}
                      onNavigate={selectNavResult}
                      hideNavChromeOnMobile
                      searchLoading={
                        searchPending || (searching && notesCorpusLoading)
                      }
                    />
                  </div>
                  <DrawerFooter
                    chrome={chrome}
                    locale={locale}
                    onNavigate={selectNavResult}
                    lastUpdatedIso={lastUpdatedIso}
                    lastUpdatedLabel={lastUpdatedLabel}
                  />
                </div>
              </div>
            </aside>
            <div
              id={HANDBOOK_MAIN_ID}
              inert={navOpen ? true : undefined}
              aria-busy={routePending || undefined}
              className={
                navOpen
                  ? "relative z-0 min-w-0 flex-1 max-md:pointer-events-none"
                  : "relative min-w-0 flex-1"
              }
              style={{
                minHeight: 0,
                overflow: "auto",
                overscrollBehavior: "contain",
                touchAction: "manipulation",
              }}
            >
              <ConceptFooterActionsProvider>
                <ContentBreadcrumbs groups={groups} chrome={chrome} />
                <HandbookNavGroupsProvider groups={groups}>
                  {children}
                </HandbookNavGroupsProvider>
              </ConceptFooterActionsProvider>
              <ScrollToTopButton label={chrome.scrollToTop} />
            </div>
          </div>
        </div>
      </SearchQueryContext.Provider>
    </HandbookMobileNavProvider>
  );
}

function isDockTarget(target: EventTarget | null): boolean {
  return (
    target instanceof Element && target.closest("[data-sidebar-dock]") !== null
  );
}

function isSidebarTarget(target: EventTarget | null): boolean {
  return target instanceof Element && target.closest("aside") !== null;
}

function useDesktopSidebarPeek(peekEnabled: boolean) {
  const [peeking, setPeeking] = useState(false);
  const closeTimer = useRef(0);
  const unlockTimer = useRef(0);
  const peekLocked = useRef(false);
  const pointerOverDock = useRef(false);

  if (!peekEnabled && peeking) {
    setPeeking(false);
  }

  const cancelClose = useCallback(() => {
    window.clearTimeout(closeTimer.current);
  }, []);

  const cancelUnlock = useCallback(() => {
    window.clearTimeout(unlockTimer.current);
  }, []);

  const scheduleClose = useCallback(() => {
    cancelClose();
    closeTimer.current = window.setTimeout(() => {
      if (pointerOverDock.current) {
        return;
      }
      peekLocked.current = false;
      setPeeking(false);
    }, PEEK_LEAVE_MS);
  }, [cancelClose]);

  useEffect(() => {
    if (!peekEnabled) {
      peekLocked.current = false;
      pointerOverDock.current = false;
      cancelClose();
      cancelUnlock();
    }
  }, [cancelClose, cancelUnlock, peekEnabled]);

  useEffect(() => {
    return () => {
      window.clearTimeout(closeTimer.current);
      window.clearTimeout(unlockTimer.current);
    };
  }, []);

  const onAsidePointerEnter = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      if (event.pointerType !== "mouse" || !peekEnabled || peekLocked.current) {
        return;
      }
      cancelClose();
      setPeeking(true);
    },
    [cancelClose, peekEnabled],
  );

  const onAsidePointerLeave = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      if (!peekEnabled) {
        return;
      }
      const next = event.relatedTarget;
      if (next instanceof Element && isDockTarget(next)) {
        pointerOverDock.current = true;
        cancelClose();
        return;
      }
      if (next instanceof Element && isSidebarTarget(next)) {
        return;
      }
      pointerOverDock.current = false;
      scheduleClose();
    },
    [cancelClose, peekEnabled, scheduleClose],
  );

  const onDockPointerLeave = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      if (event.pointerType !== "mouse" || !peekEnabled) {
        return;
      }
      const next = event.relatedTarget;
      if (
        next instanceof Element &&
        (isDockTarget(next) || isSidebarTarget(next))
      ) {
        return;
      }
      pointerOverDock.current = false;
      scheduleClose();
    },
    [peekEnabled, scheduleClose],
  );

  const suppressPeek = useCallback(
    (lockMs = PEEK_LEAVE_MS) => {
      pointerOverDock.current = false;
      peekLocked.current = true;
      cancelClose();
      setPeeking(false);
      cancelUnlock();
      unlockTimer.current = window.setTimeout(() => {
        peekLocked.current = false;
      }, lockMs);
    },
    [cancelClose, cancelUnlock],
  );

  return {
    peeking: peekEnabled && peeking,
    onAsidePointerEnter,
    onAsidePointerLeave,
    onDockPointerLeave,
    suppressPeek,
  };
}
