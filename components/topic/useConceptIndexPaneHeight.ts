"use client";

import { useCallback, useSyncExternalStore } from "react";
import { HANDBOOK_MAIN_ID } from "@/constants";
import {
  CONCEPT_INDEX_PANE_HEIGHT_QUANTIZE_PX,
  conceptIndexQuantizedPaneHeightPx,
} from "@/lib/catalog/conceptIndexPaneHeightQuantize";

function viewportPaneBudgetPx(): number {
  return Math.max(400, window.innerHeight * 0.92);
}

function indexMainForMeasure(
  element: HTMLElement | null,
): HTMLElement | null {
  if (!element) {
    return null;
  }
  const topicMain = element.closest("main.handbook-topic-main");
  if (topicMain instanceof HTMLElement) {
    return topicMain;
  }
  const subjectMain = element.closest("main.handbook-subject-main");
  if (subjectMain instanceof HTMLElement) {
    return subjectMain;
  }
  return element.closest("main");
}

function measurePaneHeight(element: HTMLElement | null): number {
  if (typeof window === "undefined") {
    return 640;
  }
  const main = indexMainForMeasure(element);
  const anchor =
    element?.closest(".concept-index-newspaper-pane-scroll") ??
    element?.closest(".concept-index-newspaper-columns") ??
    element?.closest(".handbook-subject-index-body > .min-h-0") ??
    element;
  if (main instanceof HTMLElement && anchor instanceof HTMLElement) {
    const available = Math.floor(
      main.getBoundingClientRect().bottom - anchor.getBoundingClientRect().top,
    );
    if (available >= 200) {
      return available;
    }
  }
  const indexBody = element?.closest(".handbook-subject-index-body");
  if (indexBody instanceof HTMLElement && indexBody.clientHeight >= 120) {
    return indexBody.clientHeight;
  }
  if (main instanceof HTMLElement && main.clientHeight >= 120) {
    return main.clientHeight;
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
  let lastQuantized = conceptIndexQuantizedPaneHeightPx(
    measurePaneHeight(gridElement),
  );
  const observer = new ResizeObserver(() => {
    const quantized = conceptIndexQuantizedPaneHeightPx(
      measurePaneHeight(gridElement),
    );
    if (Math.abs(quantized - lastQuantized) < CONCEPT_INDEX_PANE_HEIGHT_QUANTIZE_PX) {
      return;
    }
    lastQuantized = quantized;
    onStoreChange();
  });
  observer.observe(gridElement);
  const indexBody = gridElement.closest(".handbook-subject-index-body");
  if (indexBody instanceof HTMLElement) {
    observer.observe(indexBody);
  }
  const main = indexMainForMeasure(gridElement);
  if (main instanceof HTMLElement) {
    observer.observe(main);
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
    () => conceptIndexQuantizedPaneHeightPx(measurePaneHeight(gridElement)),
    [gridElement],
  );

  return useSyncExternalStore(subscribe, getSnapshot, () => 640);
}
