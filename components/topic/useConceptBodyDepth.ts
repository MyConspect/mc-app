"use client";

import { useLayoutEffect } from "react";
import type { ConceptDepthPreference } from "@/components/nav/utils/uiStorage";
import { applyConceptDepth } from "@/components/nav/utils/uiStorage";

function setBlockVisible(el: HTMLElement, visible: boolean) {
  el.toggleAttribute("hidden", !visible);
  el.style.display = visible ? "" : "none";
}

export function useConceptBodyDepth(
  rootRef: React.RefObject<HTMLElement | null>,
  conceptDepth: ConceptDepthPreference,
  hasOptionalDepth: boolean,
  html: string,
) {
  useLayoutEffect(() => {
    if (!hasOptionalDepth) {
      return;
    }
    applyConceptDepth(conceptDepth);
    const root = rootRef.current;
    if (!root) {
      return;
    }

    const quick = root.querySelector(".concept-depth-quick");
    const detailed = root.querySelector(".concept-depth-detailed");

    if (quick instanceof HTMLElement) {
      setBlockVisible(quick, conceptDepth === "quick");
    }
    if (detailed instanceof HTMLElement) {
      setBlockVisible(detailed, conceptDepth === "detailed");
    }
  }, [conceptDepth, hasOptionalDepth, html, rootRef]);
}
