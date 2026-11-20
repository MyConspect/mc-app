"use client";

import { useCallback, useSyncExternalStore } from "react";
import { HANDBOOK_MAIN_ID } from "@/constants";

function measurePaneWidth(element: HTMLElement | null): number {
  const indexBody = element?.closest(".handbook-subject-index-body");
  if (indexBody instanceof HTMLElement && indexBody.clientWidth >= 48) {
    return indexBody.clientWidth;
  }
  const parent = element?.parentElement;
  if (parent && parent.clientWidth >= 48) {
    return parent.clientWidth;
  }
  const handbookMain = document.getElementById(HANDBOOK_MAIN_ID);
  if (handbookMain && handbookMain.clientWidth >= 48) {
    return handbookMain.clientWidth;
  }
  return element?.clientWidth ?? 0;
}

/** Index body width for track-column measurement. */
export function useConceptIndexPaneWidth(
  anchorElement: HTMLElement | null,
): number {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      if (!anchorElement) {
        return () => {};
      }
      const observer = new ResizeObserver(onStoreChange);
      observer.observe(anchorElement);
      const indexBody = anchorElement.closest(".handbook-subject-index-body");
      if (indexBody instanceof HTMLElement) {
        observer.observe(indexBody);
      }
      return () => observer.disconnect();
    },
    [anchorElement],
  );

  const getSnapshot = useCallback(
    () => measurePaneWidth(anchorElement),
    [anchorElement],
  );

  return useSyncExternalStore(subscribe, getSnapshot, () => 0);
}
