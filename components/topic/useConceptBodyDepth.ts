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

    const quickBlocks = root.querySelectorAll(".concept-depth-quick");
    const detailedBlocks = root.querySelectorAll(".concept-depth-detailed");

    for (const quick of quickBlocks) {
      if (quick instanceof HTMLElement) {
        setBlockVisible(quick, conceptDepth === "quick");
      }
    }
    for (const detailed of detailedBlocks) {
      if (detailed instanceof HTMLElement) {
        setBlockVisible(detailed, conceptDepth === "detailed");
      }
    }

    const detailedOnlyParts = root.querySelectorAll(
      ".concept-part--detailed-only",
    );
    for (const part of detailedOnlyParts) {
      if (part instanceof HTMLElement) {
        setBlockVisible(part, conceptDepth === "detailed");
      }
    }
  }, [conceptDepth, hasOptionalDepth, html, rootRef]);
}
