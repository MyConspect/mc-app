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

  useLayoutEffect(() => {
    if (!enabled || paneHeightPx <= 0) {
      setFits(null);
      return;
    }
    let frame = 0;
    let observer: ResizeObserver | undefined;
    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const columns = resolveNewspaperColumnsEl(rootEl);
        if (!columns) {
          setFits(null);
          return;
        }
        let fits = conceptIndexColumnsFitPaneElement(columns, paneHeightPx);
        if (
          fits &&
          rootEl?.classList.contains("concept-index-newspaper-pane-scroll")
        ) {
          fits = conceptIndexColumnsFitScrollportElement(columns, rootEl);
        }
        setFits((prev) => (prev === fits ? prev : fits));
      });
    };
    measure();
    if (!rootEl) {
      return;
    }
    observer = new ResizeObserver(measure);
    observer.observe(rootEl);
    const columns = resolveNewspaperColumnsEl(rootEl);
    if (columns && columns !== rootEl) {
      observer.observe(columns);
    }
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [rootEl, paneHeightPx, enabled]);

  return fits;
}
