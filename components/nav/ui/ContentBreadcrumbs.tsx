"use client";

import { useEffect, useRef } from "react";
import { Breadcrumbs } from "@/components/catalog/Breadcrumbs";
import { ConceptHeaderActions } from "@/components/topic/ConceptTitleHeader";
import { useConceptFooterActions } from "@/components/topic/conceptFooterActionsContext";
import { HANDBOOK_STICKY_INSET_VAR } from "@/components/topic/utils/conceptScroll";
import { HANDBOOK_MAIN_ID } from "@/constants";
import type { ChromeCopy, NavGroup } from "@/lib/nav";
import { useHandbookLocation } from "../hooks/useHandbookLocation";
import { crumbsForPath } from "../utils/location";

const BREADCRUMB_BAR_DIVIDER =
  "mx-0.5 hidden h-5 w-px shrink-0 bg-zinc-200 sm:block dark:bg-zinc-700";

export function ContentBreadcrumbs({
  groups,
  chrome,
}: {
  groups: readonly NavGroup[];
  chrome: ChromeCopy;
}) {
  const { location } = useHandbookLocation();
  const conceptActions = useConceptFooterActions();
  const crumbs = crumbsForPath(groups, location.pathname, location.hash, {
    home: chrome.home,
    instructions: chrome.instructions,
  });
  const barRef = useRef<HTMLDivElement>(null);
  const showNavInBreadcrumb =
    conceptActions !== null &&
    (conceptActions.showBack || conceptActions.showNext);

  useEffect(() => {
    const main = document.getElementById(HANDBOOK_MAIN_ID);
    const bar = barRef.current;
    if (!(main instanceof HTMLElement)) {
      return;
    }
    if (!bar) {
      main.style.removeProperty(HANDBOOK_STICKY_INSET_VAR);
      return;
    }
    const sync = () => {
      main.style.setProperty(
        HANDBOOK_STICKY_INSET_VAR,
        `${bar.offsetHeight}px`,
      );
    };
    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(bar);
    return () => {
      observer.disconnect();
      main.style.removeProperty(HANDBOOK_STICKY_INSET_VAR);
    };
  }, [location.pathname, location.hash, showNavInBreadcrumb]);

  if (crumbs.length < 2) {
    return null;
  }

  return (
    <div
      ref={barRef}
      className="sticky top-0 z-[1] border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950"
    >
      <div className="flex w-full min-w-0 items-center gap-1 overflow-x-auto overscroll-x-contain px-[18px] py-2 sm:gap-2">
        {showNavInBreadcrumb ? (
          <div className="hidden shrink-0 sm:block">
            <ConceptHeaderActions {...conceptActions} segment="nav" />
          </div>
        ) : null}
        {showNavInBreadcrumb ? (
          <span className={BREADCRUMB_BAR_DIVIDER} aria-hidden="true" />
        ) : null}
        <div className="min-w-0 flex-1">
          <Breadcrumbs items={crumbs} compact />
        </div>
      </div>
    </div>
  );
}
