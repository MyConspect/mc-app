"use client";

import { useLayoutEffect, useSyncExternalStore } from "react";
import type { ChromeCopy } from "@/lib/nav";
import type { ConceptDepthPreference } from "@/components/nav/utils/uiStorage";
import {
  applyConceptDepth,
  readConceptDepth,
  subscribeUi,
  writeConceptDepth,
} from "@/components/nav/utils/uiStorage";

/** Matches sidebar `SectionSwitcher` track + buttons. */
const TRACK =
  "inline-flex h-8 w-[9.25rem] shrink-0 rounded-md bg-zinc-100 p-0.5 dark:bg-zinc-800";

const BTN =
  "inline-flex min-w-0 flex-1 touch-manipulation cursor-pointer items-center justify-center truncate rounded px-2 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400/60 dark:focus-visible:ring-zinc-500/40";

const BTN_ACTIVE = `${BTN} bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-50`;

const BTN_INACTIVE = `${BTN} text-zinc-600 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100`;

function useConceptDepth(): ConceptDepthPreference {
  return useSyncExternalStore(subscribeUi, readConceptDepth, () => "quick");
}

export { useConceptDepth };

export function ConceptDepthToggle({ chrome }: { chrome: ChromeCopy }) {
  const depth = useConceptDepth();

  useLayoutEffect(() => {
    applyConceptDepth(readConceptDepth());
  }, []);

  function select(next: ConceptDepthPreference) {
    if (next === depth) {
      return;
    }
    writeConceptDepth(next);
    applyConceptDepth(next);
  }

  return (
    <div
      className={TRACK}
      role="radiogroup"
      aria-label={chrome.conceptDepthMode}
    >
      <button
        type="button"
        role="radio"
        aria-checked={depth === "quick"}
        className={depth === "quick" ? BTN_ACTIVE : BTN_INACTIVE}
        onClick={() => select("quick")}
      >
        {chrome.conceptDepthQuick}
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={depth === "detailed"}
        className={depth === "detailed" ? BTN_ACTIVE : BTN_INACTIVE}
        onClick={() => select("detailed")}
      >
        {chrome.conceptDepthDetailed}
      </button>
    </div>
  );
}
