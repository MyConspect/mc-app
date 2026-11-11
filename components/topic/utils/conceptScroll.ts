import { isMdUp } from "@/components/nav/hooks/useMdUp";
import { HANDBOOK_MAIN_ID } from "@/constants";

export const HANDBOOK_STICKY_INSET_VAR = "--handbook-sticky-inset";
/** Matches SiteHeader `h-14` — main scrolls under the fixed header. */
const HANDBOOK_HEADER_INSET_PX = 56;
const PIN_SCROLL_GAP_PX = 0;
const PIN_FLASH_MS = 550;

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function pinScrollTop(element: HTMLElement, scroller: HTMLElement): number {
  const target = conceptPinTarget(element);
  const inset = mainScrollInset(scroller);
  return Math.max(
    0,
    target.getBoundingClientRect().top -
      scroller.getBoundingClientRect().top +
      scroller.scrollTop -
      inset -
      PIN_SCROLL_GAP_PX,
  );
}

export function handbookMain() {
  const scroller = document.getElementById(HANDBOOK_MAIN_ID);
  return scroller instanceof HTMLElement ? scroller : null;
}

export function conceptDetailBodyScroll(): HTMLElement | null {
  const node = document.querySelector<HTMLElement>(
    "article.concept-detail-article .concept-detail-body-scroll",
  );
  return node;
}

/** Where handbook reading scroll happens (concept body pane, or main column). */
export function handbookScrollContainer(): HTMLElement | null {
  return conceptDetailBodyScroll() ?? handbookMain();
}

/** Put the reading pane at the start of the opened item (not leftover index/article scroll). */
export function resetHandbookReadingScroll() {
  const main = handbookMain();
  if (main) {
    main.scrollTop = 0;
  }
  const body = conceptDetailBodyScroll();
  if (body && body !== main) {
    body.scrollTop = 0;
  }
}

export function conceptPinTarget(element: HTMLElement): HTMLElement {
  if (element instanceof HTMLDetailsElement) {
    const summary = element.querySelector(":scope > summary");
    if (summary instanceof HTMLElement) {
      return summary;
    }
  }
  return element;
}

export function mainScrollInset(scroller: HTMLElement): number {
  const raw = getComputedStyle(scroller)
    .getPropertyValue(HANDBOOK_STICKY_INSET_VAR)
    .trim();
  const px = Number.parseFloat(raw);
  const crumbs = Number.isFinite(px) ? px : 0;
  return HANDBOOK_HEADER_INSET_PX + crumbs;
}

export function closeSiblingAccordions(opened: HTMLDetailsElement) {
  const parent = opened.parentElement;
  if (!parent) {
    return;
  }
  for (const node of parent.children) {
    if (node instanceof HTMLDetailsElement && node !== opened) {
      node.open = false;
    }
  }
}

export function compensateScrollForLayout(
  element: HTMLElement,
  viewportTop: number,
) {
  const scroller = handbookScrollContainer();
  if (!scroller) {
    return;
  }
  const delta = element.getBoundingClientRect().top - viewportTop;
  if (delta !== 0) {
    scroller.scrollTop += delta;
  }
}

function isConceptSummaryVisible(element: HTMLElement, scroller: HTMLElement) {
  const pin = conceptPinTarget(element);
  const inset = mainScrollInset(scroller);
  const scrollerRect = scroller.getBoundingClientRect();
  const pinRect = pin.getBoundingClientRect();
  const topBound = scrollerRect.top + inset;
  return pinRect.top >= topBound && pinRect.bottom <= scrollerRect.bottom;
}

export function revealConceptInMain(element: HTMLElement) {
  const scroller = handbookMain();
  if (!scroller || isConceptSummaryVisible(element, scroller)) {
    return;
  }
  scroller.scrollTo({ top: pinScrollTop(element, scroller) });
}

function whenPinScrollEnds(scroller: HTMLElement, onDone: () => void) {
  const finish = () => {
    window.clearTimeout(fallback);
    scroller.removeEventListener("scrollend", finish);
    onDone();
  };
  const fallback = window.setTimeout(finish, PIN_FLASH_MS);
  scroller.addEventListener("scrollend", finish, { once: true });
}

export function flashConceptPin(element: HTMLElement) {
  if (isMdUp()) {
    return;
  }
  element.setAttribute("data-concept-pinned", "");
  const clear = () => {
    element.removeAttribute("data-concept-pinned");
    element.removeEventListener("animationend", clear);
  };
  element.addEventListener("animationend", clear);
  window.setTimeout(clear, PIN_FLASH_MS + 50);
}

export function scrollConceptToTop(
  element: HTMLElement,
  onComplete?: () => void,
) {
  const scroller = handbookMain();
  if (!scroller) {
    onComplete?.();
    return;
  }
  const top = pinScrollTop(element, scroller);
  const smooth = !isMdUp() && !prefersReducedMotion();
  if (Math.abs(scroller.scrollTop - top) < 1) {
    onComplete?.();
    return;
  }
  const apply = () => {
    scroller.scrollTo({ top: pinScrollTop(element, scroller) });
  };
  if (!smooth) {
    apply();
    onComplete?.();
    return;
  }
  scroller.scrollTo({ top, behavior: "smooth" });
  if (onComplete) {
    whenPinScrollEnds(scroller, () => {
      apply();
      onComplete();
    });
  }
}

export function pinConceptToView(element: HTMLElement) {
  scrollConceptToTop(element, () => flashConceptPin(element));
}
