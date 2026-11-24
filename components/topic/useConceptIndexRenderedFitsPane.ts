"use client";

import { useLayoutEffect, useState } from "react";
import {
  conceptIndexColumnsFitPaneElement,
  conceptIndexColumnsFitScrollportElement,
} from "@/lib/catalog/conceptIndexRenderedFitsPane";

function resolveNewspaperColumnsEl(
  rootEl: HTMLElement | null,
): HTMLElement | null {
  if (!rootEl) {
    return null;
  }
  if (rootEl.classList.contains("concept-index-newspaper-pane-scroll")) {
    const inner = rootEl.querySelector(".concept-index-newspaper-columns");
    return inner instanceof HTMLElement ? inner : null;
  }
  if (rootEl.classList.contains("concept-index-newspaper-columns")) {
    return rootEl;
  }
  return null;
}

/** After paint, detect short indexes that the packing model treats as tall. */
export function useConceptIndexRenderedFitsPane(
  rootEl: HTMLElement | null,
  paneHeightPx: number,
  enabled: boolean,
): boolean | null {
  const [fits, setFits] = useState<boolean | null>(null);
  const measureEnabled = enabled && paneHeightPx > 0;

  useLayoutEffect(() => {
    if (!measureEnabled) {
      return;
    }
    let frame = 0;
    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const columns = resolveNewspaperColumnsEl(rootEl);
        if (!columns) {
          setFits(null);
          return;
        }
        let nextFits = conceptIndexColumnsFitPaneElement(columns, paneHeightPx);
        if (
          nextFits &&
          rootEl?.classList.contains("concept-index-newspaper-pane-scroll")
        ) {
          nextFits = conceptIndexColumnsFitScrollportElement(columns, rootEl);
        }
        setFits((prev) => (prev === nextFits ? prev : nextFits));
      });
    };
    measure();
    if (!rootEl) {
      return;
    }
    const observer = new ResizeObserver(measure);
    observer.observe(rootEl);
    const columns = resolveNewspaperColumnsEl(rootEl);
    if (columns && columns !== rootEl) {
      observer.observe(columns);
    }
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [rootEl, paneHeightPx, measureEnabled]);

  return measureEnabled ? fits : null;
}