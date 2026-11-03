"use client";

import { useEffect, useMemo, useRef } from "react";
import { Breadcrumbs } from "@/components/catalog/Breadcrumbs";
import { useConceptFooterActions } from "@/components/topic/conceptFooterActionsContext";
import { HANDBOOK_STICKY_INSET_VAR } from "@/components/topic/utils/conceptScroll";
import { HANDBOOK_MAIN_ID } from "@/constants";
import type { ChromeCopy, NavGroup } from "@/lib/nav";
import { useHandbookLocation } from "../hooks/useHandbookLocation";
import { crumbsForPath } from "../utils/location";

const BREADCRUMB_BAR_HEIGHT_CLASS =
  "handbook-breadcrumb-bar h-[40px] max-h-[40px] min-h-[40px]";

function crumbsWithOpenConcept(
  crumbs: ReturnType<typeof crumbsForPath>,
  conceptTitle: string | undefined,
): ReturnType<typeof crumbsForPath> {
  if (!conceptTitle) {
    return crumbs;
  }
  const last = crumbs[crumbs.length - 1];
  if (last?.label === conceptTitle) {
    return crumbs;
  }
  return [...crumbs, { label: conceptTitle }];
}

export function ContentBreadcrumbs({
  groups,
  chrome,
}: {
  groups: readonly NavGroup[];
  chrome: ChromeCopy;
}) {
  const { location } = useHandbookLocation();
  const conceptActions = useConceptFooterActions();
  const crumbs = useMemo(() => {
    const trail = crumbsForPath(groups, location.pathname, location.hash, {
      home: chrome.home,
      instructions: chrome.instructions,
    });
    if (conceptActions?.variant !== "detail") {
      return trail;
    }
    return crumbsWithOpenConcept(trail, conceptActions.title);
  }, [
    groups,
    location.pathname,
    location.hash,
    chrome.home,
    chrome.instructions,
    conceptActions,
  ]);
  const barRef = useRef<HTMLDivElement>(null);

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
  }, [location.pathname, location.hash]);

  if (crumbs.length < 2) {
    return null;
  }

  return (
    <div
      ref={barRef}
      className={`${BREADCRUMB_BAR_HEIGHT_CLASS} sticky top-0 z-[1] box-border overflow-hidden border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950`}
    >
      <div className="handbook-breadcrumb-bar__row flex h-full w-full min-w-0 items-center gap-1 overflow-x-auto overscroll-x-contain px-[18px] sm:gap-2">
        <div className="min-w-0 flex-1">
          <Breadcrumbs items={crumbs} compact inBar />
        </div>
      </div>
    </div>
  );
}
