"use client";

import { useCallback, useSyncExternalStore } from "react";
import { conceptIndexColumnCountForWidth } from "@/lib/catalog/conceptIndexColumnMetrics";

function measureContentWidth(element: HTMLElement): number {
  const indexBody = element.closest(".handbook-subject-index-body");
  if (indexBody instanceof HTMLElement) {
    const paneWidth = indexBody.clientWidth;
    if (paneWidth >= 48) {
      return paneWidth;
    }
  }
  const self = element.clientWidth;
  const parent = element.parentElement?.clientWidth ?? 0;
  if (parent >= 48 && parent > self + 1) {
    return parent;
  }
  if (self >= 48) {
    return self;
  }
  if (parent >= 48) {
    return parent;
  }
  return self;
}

function readColumnCount(element: HTMLElement | null): number {
  if (!element) {
    return 1;
  }
  return conceptIndexColumnCountForWidth(measureContentWidth(element));
}

/** Packed column count from grid container width (not viewport breakpoints). */
export function useConceptIndexColumnCount(
  gridElement: HTMLElement | null,
): number {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      if (!gridElement) {
        return () => {};
      }
      const observer = new ResizeObserver(onStoreChange);
      observer.observe(gridElement);
      const indexBody = gridElement.closest(".handbook-subject-index-body");
      if (indexBody instanceof HTMLElement) {
        observer.observe(indexBody);
      }
      const subjectMain = gridElement.closest("main.handbook-subject-main");
      if (subjectMain instanceof HTMLElement) {
        observer.observe(subjectMain);
      }
      return () => observer.disconnect();
    },
    [gridElement],
  );

  const getSnapshot = useCallback(
    () => readColumnCount(gridElement),
    [gridElement],
  );

  return useSyncExternalStore(
    subscribe,
    getSnapshot,
    /** Single column on SSR — avoids overflow before the grid is measured. */
    () => 1,
  );
}
