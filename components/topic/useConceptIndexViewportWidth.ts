"use client";

import { useCallback, useSyncExternalStore } from "react";
import { CONCEPT_INDEX_TWO_COLUMN_MAX_VIEWPORT_PX } from "@/lib/catalog/conceptIndexColumnMetrics";

/** Live viewport width for index column viewport rules (resize-aware). */
export function useConceptIndexViewportWidth(): number {
  const subscribe = useCallback((onStoreChange: () => void) => {
    window.addEventListener("resize", onStoreChange);
    return () => window.removeEventListener("resize", onStoreChange);
  }, []);

  const getSnapshot = useCallback(() => window.innerWidth, []);

  return useSyncExternalStore(
    subscribe,
    getSnapshot,
    () => CONCEPT_INDEX_TWO_COLUMN_MAX_VIEWPORT_PX,
  );
}