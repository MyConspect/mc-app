import {
  HANDBOOK_NAV_ASIDE_ID,
  HANDBOOK_SIDEBAR_ID,
  SIDEBAR_PIN_HOLD_MS,
} from "@/constants";
import { stripLocalePrefix } from "@/lib/i18n/paths";
import { splitHref } from "@/lib/nav";

/** Reset aside scroll when leaving a track; keep position for sibling topics in the same track. */
export function shouldResetNavAsideScroll(
  previousPathname: string,
  nextPathname: string,
): boolean {
  const prevTrack =
    stripLocalePrefix(previousPathname).path.split("/").filter(Boolean)[0] ??
    "";
  const nextTrack =
    stripLocalePrefix(nextPathname).path.split("/").filter(Boolean)[0] ?? "";
  return prevTrack !== nextTrack;
}

export type PinNavOptions = {
  scrollIntoView?: boolean;
  /** Track scroll position while folds animate; skip when the route will reset aside scroll. */
  hold?: boolean;
};

type SidebarPin = {
  element: HTMLElement;
  nav: string;
  id: string;
  top: number;
};

let sidebarPin: SidebarPin | null = null;

/** True while a click handler is holding scroll under a pinned row (fold / track swap). */
export function isSidebarPinHeld(): boolean {
  return sidebarPin !== null;
}
let pinCleanup: (() => void) | null = null;
let restoringPin = false;
let pinFrame = 0;

function followPin() {
  pinFrame = 0;
  if (!sidebarPin) {
    return;
  }
  restoreSidebarPin();
  pinFrame = window.requestAnimationFrame(followPin);
}

export function navAside() {
  const scroller = document.getElementById(HANDBOOK_NAV_ASIDE_ID);
  return scroller instanceof HTMLElement ? scroller : null;
}

export function scrollSidebarHit(hit: HTMLElement) {
  const scroller = navAside();
  if (!scroller) {
    return;
  }
  const scrollerBox = scroller.getBoundingClientRect();
  const hitBox = hit.getBoundingClientRect();
  if (hitBox.top < scrollerBox.top || hitBox.bottom > scrollerBox.bottom) {
    hit.scrollIntoView({ block: "nearest" });
  }
}

/** Scroll the deepest active path row into view after route or fold changes. */
export function scrollSidebarActivePath() {
  const nav = document.getElementById(HANDBOOK_SIDEBAR_ID);
  if (!nav) {
    return;
  }
  const pathRows = nav.querySelectorAll<HTMLElement>('[data-nav-path="true"]');
  const target = pathRows.item(pathRows.length - 1);
  if (target) {
    scrollSidebarHit(target);
  }
}

export function resetNavAsideScroll() {
  pinCleanup?.();
  const scroller = navAside();
  if (scroller) {
    scroller.scrollTop = 0;
  }
}

function pinTarget(pin: SidebarPin) {
  if (pin.element.isConnected) {
    return pin.element;
  }
  const element = document.querySelector(
    `#${HANDBOOK_SIDEBAR_ID} [data-nav="${pin.nav}"][data-nav-id="${pin.id}"]`,
  );
  return element instanceof HTMLElement ? element : null;
}

export function restoreSidebarPin() {
  const pin = sidebarPin;
  const scroller = navAside();
  if (!pin || !scroller || restoringPin) {
    return;
  }
  const element = pinTarget(pin);
  if (!element) {
    return;
  }
  const delta = element.getBoundingClientRect().top - pin.top;
  if (Math.abs(delta) < 1) {
    return;
  }
  restoringPin = true;
  scroller.scrollTop += delta;
  restoringPin = false;
}

export function pinNavForHref(
  element: HTMLElement,
  currentPathname: string,
  href: string,
) {
  const samePath = splitHref(href).pathname === currentPathname;
  pinNavElement(element, { scrollIntoView: samePath, hold: samePath });
}

export function pinNavElement(element: HTMLElement, options?: PinNavOptions) {
  const scrollIntoView = options?.scrollIntoView ?? true;
  const hold = options?.hold ?? true;
  const nav = element.getAttribute("data-nav");
  const id = element.getAttribute("data-nav-id");
  const scroller = navAside() ?? element.closest(`#${HANDBOOK_NAV_ASIDE_ID}`);
  if (!nav || !id || !(scroller instanceof HTMLElement)) {
    return;
  }
  pinCleanup?.();
  if (!hold) {
    return;
  }
  const scrollerBox = scroller.getBoundingClientRect();
  const box = element.getBoundingClientRect();
  if (
    scrollIntoView &&
    (box.top < scrollerBox.top || box.bottom > scrollerBox.bottom)
  ) {
    element.scrollIntoView({ block: "nearest" });
  }
  sidebarPin = {
    element,
    nav,
    id,
    top: element.getBoundingClientRect().top,
  };
  window.cancelAnimationFrame(pinFrame);
  pinFrame = window.requestAnimationFrame(followPin);
  const timeout = window.setTimeout(() => {
    pinCleanup?.();
  }, SIDEBAR_PIN_HOLD_MS);
  pinCleanup = () => {
    window.clearTimeout(timeout);
    window.cancelAnimationFrame(pinFrame);
    pinFrame = 0;
    sidebarPin = null;
    pinCleanup = null;
  };
}
