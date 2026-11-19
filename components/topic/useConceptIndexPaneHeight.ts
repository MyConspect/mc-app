"use client";

import { useCallback, useSyncExternalStore } from "react";
import { HANDBOOK_MAIN_ID } from "@/constants";

function viewportPaneBudgetPx(): number {
  return Math.max(400, window.innerHeight * 0.92);
}

function measurePaneHeight(element: HTMLElement | null): number {
  if (typeof window === "undefined") {
    return 640;
  }
  const indexBody = element?.closest(".handbook-subject-index-body");
  if (indexBody instanceof HTMLElement && indexBody.clientHeight >= 120) {
    return indexBody.clientHeight;
  }
  const subjectMain = element?.closest("main.handbook-subject-main");
  if (subjectMain instanceof HTMLElement && subjectMain.clientHeight >= 120) {
    const indexInMain = subjectMain.querySelector(".handbook-subject-index-body");
    if (indexInMain instanceof HTMLElement && indexInMain.clientHeight >= 120) {
      return indexInMain.clientHeight;
    }
    return subjectMain.clientHeight;
  }
  const handbookMain = document.getElementById(HANDBOOK_MAIN_ID);
  if (handbookMain && handbookMain.clientHeight >= 120) {
    return Math.min(handbookMain.clientHeight, viewportPaneBudgetPx());
  }
  return viewportPaneBudgetPx();
}

function observeTargets(
  gridElement: HTMLElement,
  onStoreChange: () => void,
): () => void {
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
  const handbookMain = document.getElementById(HANDBOOK_MAIN_ID);
  if (handbookMain) {
    observer.observe(handbookMain);
  }
  return () => observer.disconnect();
}

/** Scroll pane height for packing index sections (~one viewport column). */
export function useConceptIndexPaneHeight(
  gridElement: HTMLElement | null,
): number {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      if (!gridElement) {
        return () => {};
      }
      return observeTargets(gridElement, onStoreChange);
    },
    [gridElement],
  );

  const getSnapshot = useCallback(
    () => measurePaneHeight(gridElement),
    [gridElement],
  );

  return useSyncExternalStore(subscribe, getSnapshot, () => 640);
}
