"use client";

import { HANDBOOK_NAV_ASIDE_ID, HANDBOOK_SIDEBAR_ID } from "@/constants";

const PATH_ATTR = "data-nav-path";
const TOP_VARS = {
  "root-section": "--nav-sticky-top-root-section",
  track: "--nav-sticky-top-track",
  subject: "--nav-sticky-top-subject",
  section: "--nav-sticky-top-section",
  cluster: "--nav-sticky-top-cluster",
  topic: "--nav-sticky-top-topic",
  "concept-group": "--nav-sticky-top-concept-group",
  "interview-section": "--nav-sticky-top-interview",
  concept: "--nav-sticky-top-concept",
} as const;

/** Per-row offset; each pinned path row gets its own top so kinds are not shared. */
export const STICKY_TOP_SELF_VAR = "--nav-sticky-top-self";

/**
 * The track row draws the thick guide. The subject row draws the thin guide
 * that continues under every later active row.
 */
const GUIDE_VARS: Record<string, string | undefined> = {
  track: "--nav-guide-track",
  subject: "--nav-guide-subject",
};

/** Matches `0.375rem` rounded-corner trim on `[data-nav-guide]`. */
const GUIDE_END_TRIM_PX = 6;

const TRACK_CHILD_ROW =
  '[data-nav="subject"], [data-nav="topic"], [data-nav="concept-group"], [data-nav="interview-section"], [data-nav="cluster"], [data-nav="section"]';
const TRACK_BOUNDARY = '[data-nav="track"], [data-nav="root-section"]';

function scrollerContentY(scroller: HTMLElement, element: HTMLElement): number {
  const scrollerRect = scroller.getBoundingClientRect();
  return (
    element.getBoundingClientRect().top - scrollerRect.top + scroller.scrollTop
  );
}

function followsInDocument(after: Element, before: Element): boolean {
  return (
    (after.compareDocumentPosition(before) &
      Node.DOCUMENT_POSITION_FOLLOWING) !==
    0
  );
}

/** Last visible row in an open track (`display: contents` safe). */
export function lastNavRowInTrack(
  nav: HTMLElement,
  trackHeader: HTMLElement,
): HTMLElement {
  const tracks = [...nav.querySelectorAll<HTMLElement>(TRACK_BOUNDARY)];
  const nextTrack =
    tracks.find(
      (track) => track !== trackHeader && followsInDocument(track, trackHeader),
    ) ?? null;
  let last: HTMLElement = trackHeader;
  for (const row of nav.querySelectorAll<HTMLElement>(TRACK_CHILD_ROW)) {
    if (!followsInDocument(row, trackHeader)) {
      continue;
    }
    if (nextTrack && !followsInDocument(nextTrack, row)) {
      continue;
    }
    last = row;
  }
  return last;
}

function stickySpacing(nav: Element) {
  const scroller =
    nav.closest(`#${HANDBOOK_NAV_ASIDE_ID}`) ??
    document.getElementById(HANDBOOK_NAV_ASIDE_ID);
  const styles = scroller ? getComputedStyle(scroller) : null;
  return {
    inset:
      Number.parseFloat(styles?.getPropertyValue("--nav-sticky-inset") ?? "") ||
      8,
    gap:
      Number.parseFloat(styles?.getPropertyValue("--nav-sticky-gap") ?? "") ||
      6,
  };
}

function topVarName(element: HTMLElement) {
  const kind =
    element.getAttribute("data-nav") ??
    element.getAttribute("data-nav-pin") ??
    element
      .querySelector<HTMLElement>(":scope > [data-nav]")
      ?.getAttribute("data-nav");
  switch (kind) {
    case "root-section":
    case "track":
    case "subject":
    case "section":
    case "cluster":
    case "topic":
    case "concept-group":
    case "interview-section":
      return TOP_VARS[kind];
    default:
      return TOP_VARS.concept;
  }
}

function pathElements(nav: Element) {
  return nav.querySelectorAll<HTMLElement>(
    `[${PATH_ATTR}="true"], [data-nav-pin]`,
  );
}

export type StickyVars = Readonly<Record<string, string>>;

export function stickyVarsEqual(left: StickyVars, right: StickyVars): boolean {
  const keys = Object.keys(left);
  if (keys.length !== Object.keys(right).length) {
    return false;
  }
  for (const key of keys) {
    if (left[key] !== right[key]) {
      return false;
    }
  }
  return true;
}

type StickyStyleRead = {
  getPropertyValue(name: string): string;
};

type StickyStyle = StickyStyleRead & {
  setProperty(name: string, value: string): void;
  removeProperty(name: string): string;
};

/** Write CSS vars without React state so scroll/measure does not rerender the tree. */
export function writeStickyVars(
  style: StickyStyle,
  next: StickyVars,
  previous: StickyVars,
): StickyVars {
  for (const key of Object.keys(previous)) {
    if (next[key] === undefined) {
      style.removeProperty(key);
    }
  }
  for (const [key, value] of Object.entries(next)) {
    if (style.getPropertyValue(key) !== value) {
      style.setProperty(key, value);
    }
  }
  return next;
}

export function measureNavChromeInset(navElement?: HTMLElement | null): number {
  if (navElement === null) {
    return 0;
  }
  const nav = navElement ?? document.getElementById(HANDBOOK_SIDEBAR_ID);
  if (!nav) {
    return 0;
  }
  const chrome = nav.querySelector<HTMLElement>("[data-nav-chrome]");
  if (!chrome) {
    return 0;
  }
  return Math.max(0, Math.round(chrome.offsetHeight));
}

/**
 * Height of the thick track guide through the open track subtree. The cover-based
 * height only spans pinned rows, so it collapses to zero when the track header is
 * the sole pinned row even though nested subjects/topics are visible.
 */
export function measureOpenTrackGuideSpan(
  nav: Element,
  _vars: StickyVars,
): number | undefined {
  void _vars;
  const scopeLi = nav.querySelector("li[data-nav-sticky-scope]");
  const trackHeader = scopeLi?.querySelector<HTMLElement>('[data-nav="track"]');
  if (!trackHeader || !(nav instanceof HTMLElement)) {
    return undefined;
  }
  const scroller =
    nav.closest(`#${HANDBOOK_NAV_ASIDE_ID}`) ??
    document.getElementById(HANDBOOK_NAV_ASIDE_ID);
  if (!(scroller instanceof HTMLElement)) {
    return undefined;
  }
  const { gap } = stickySpacing(nav);
  const guideStart =
    scrollerContentY(scroller, trackHeader) + trackHeader.offsetHeight + gap;
  const lastRow = lastNavRowInTrack(nav, trackHeader);
  const boundary = scrollerContentY(scroller, lastRow) + lastRow.offsetHeight;
  const span = boundary - guideStart - GUIDE_END_TRIM_PX;
  return Math.max(0, Math.round(span));
}

function applyOpenTrackGuideSpan(
  nav: Element,
  vars: Record<string, string>,
): void {
  const scopeLi = nav.querySelector("li[data-nav-sticky-scope]");
  const trackHeader = scopeLi?.querySelector<HTMLElement>('[data-nav="track"]');
  const scroller =
    nav.closest(`#${HANDBOOK_NAV_ASIDE_ID}`) ??
    document.getElementById(HANDBOOK_NAV_ASIDE_ID);
  const span = measureOpenTrackGuideSpan(nav, vars);
  if (
    span === undefined ||
    span <= 0 ||
    !trackHeader ||
    !(scroller instanceof HTMLElement)
  ) {
    delete vars["--nav-guide-track-span"];
    return;
  }
  const { gap } = stickySpacing(nav);
  const guideStart =
    scrollerContentY(scroller, trackHeader) + trackHeader.offsetHeight + gap;
  vars["--nav-guide-track"] = `${Math.round(guideStart)}px`;
  vars["--nav-guide-track-span"] = `${span}px`;
}

export function measureStickyPathVars(
  navElement?: HTMLElement | null,
): StickyVars {
  const nav = navElement ?? document.getElementById(HANDBOOK_SIDEBAR_ID);
  if (!nav) {
    return {};
  }
  const inset = measureNavChromeInset(nav);
  const { gap } = stickySpacing(nav);
  const vars: Record<string, string> = { "--nav-sticky-inset": `${inset}px` };
  clearStickyTopSelf(nav);
  // Border edge of the active first row stays one gap below the chrome while stuck.
  let top = inset + gap;
  for (const element of pathElements(nav)) {
    element.style.setProperty(STICKY_TOP_SELF_VAR, `${top}px`);
    vars[topVarName(element)] = `${top}px`;
    top += element.offsetHeight + gap;
    const kind =
      element.getAttribute("data-nav") ??
      element.getAttribute("data-nav-pin") ??
      "";
    const guideVar = GUIDE_VARS[kind];
    if (guideVar) {
      // The thick line starts with the first child. The thin line starts at
      // the subject row's bottom so each later active row has a connector,
      // and the first row does not get a second line.
      const guideTop = kind === "track" ? top : top - gap;
      vars[guideVar] = `${guideTop}px`;
    }
  }
  vars["--nav-sticky-cover"] = `${measureStickyCover(nav, vars)}px`;
  applyOpenTrackGuideSpan(nav, vars);
  return vars;
}

/**
 * The cover masks rows scrolling under the pinned path. It may only be as tall
 * as the rows that are pinned right now, otherwise it blanks out rows that are
 * still sitting in normal flow. It ends one gap below the lowest pinned row.
 */
export function resolveStickyTopPx(
  varName: string,
  vars: StickyVars | undefined,
  scrollerStyle: StickyStyleRead,
): number {
  return (
    Number.parseFloat(vars?.[varName] ?? "") ||
    Number.parseFloat(scrollerStyle.getPropertyValue(varName)) ||
    0
  );
}

export function stickyTopPxForElement(
  element: HTMLElement,
  scrollerStyle: StickyStyleRead,
  vars?: StickyVars,
): number {
  const self = element.style.getPropertyValue(STICKY_TOP_SELF_VAR).trim();
  if (self) {
    const parsed = Number.parseFloat(self);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return resolveStickyTopPx(topVarName(element), vars, scrollerStyle);
}

function stickyTopPx(
  element: HTMLElement,
  scrollerStyle: StickyStyleRead,
  vars?: StickyVars,
): number {
  return stickyTopPxForElement(element, scrollerStyle, vars);
}

function clearStickyTopSelf(nav: Element): void {
  for (const element of nav.querySelectorAll<HTMLElement>(
    `[${PATH_ATTR}="true"], [data-nav-pin]`,
  )) {
    element.style.removeProperty(STICKY_TOP_SELF_VAR);
  }
}

/**
 * Viewport Y where the pinned path ends: last path row's sticky top plus its height.
 * The cover's bottom gap is not included, so a collapsed track is not shifted up.
 */
export function stickyStackBottomPx(
  nav: HTMLElement,
  scroller: HTMLElement,
): number {
  const paths = pathElements(nav);
  const last = paths[paths.length - 1];
  if (!last) {
    return scroller.getBoundingClientRect().top;
  }
  const scrollerStyle = getComputedStyle(scroller);
  const top = stickyTopPxForElement(last, scrollerStyle);
  return scroller.getBoundingClientRect().top + top + last.offsetHeight;
}

/** True when the next track would scroll into the pinned path stack. */
export function shouldReleaseStickyScope(
  nextTrackTop: number,
  stickyBottom: number,
): boolean {
  return nextTrackTop <= stickyBottom + 2;
}

/**
 * Slide the pinned path up with the scroll once the next first-tier track
 * reaches it, so Frontend/HTML/Core leave with their track instead of vanishing
 * or staying on top of Backend.
 */
export function syncStickyScopeRelease(
  navElement?: HTMLElement | null,
): number {
  const nav = navElement ?? document.getElementById(HANDBOOK_SIDEBAR_ID);
  const scroller = document.getElementById(HANDBOOK_NAV_ASIDE_ID);
  if (!nav || !scroller) {
    return 0;
  }
  const scope = nav.querySelector<HTMLElement>("[data-nav-sticky-scope]");
  const nextHeader = scope?.nextElementSibling?.querySelector<HTMLElement>(
    '[data-nav="track"], [data-nav="root-section"]',
  );
  let stickyBottom = stickyStackBottomPx(nav, scroller);
  const nextTrackBoundary = scope?.nextElementSibling;
  if (nextTrackBoundary instanceof HTMLElement) {
    stickyBottom = Math.max(
      stickyBottom,
      nextTrackBoundary.getBoundingClientRect().top,
    );
  }
  const overflow =
    scope && nextHeader
      ? Math.max(0, stickyBottom - nextHeader.getBoundingClientRect().top)
      : 0;
  const shift = overflow > 0 ? `translateY(-${overflow}px)` : "";
  for (const element of pathElements(nav)) {
    if (element.style.transform !== shift) {
      element.style.transform = shift;
    }
  }
  for (const guide of nav.querySelectorAll<HTMLElement>("[data-nav-guide]")) {
    if (guide.style.transform !== shift) {
      guide.style.transform = shift;
    }
  }
  if (overflow > 0) {
    scroller.setAttribute("data-nav-sticky-sliding", "");
  } else {
    scroller.removeAttribute("data-nav-sticky-sliding");
  }
  return overflow;
}

/** Bottom Y (scroller-relative) of the pinned path stack — not the document offset of the last row. */
export function pinnedPathStackCoverBottomPx(
  rows: ReadonlyArray<{
    stickyTop: number;
    height: number;
    shifted: boolean;
    relativeTop: number;
  }>,
  gap: number,
): number {
  let stackBottom = 0;
  for (const row of rows) {
    const bottom = row.shifted
      ? row.relativeTop + row.height
      : row.stickyTop + row.height;
    stackBottom = Math.max(stackBottom, bottom);
  }
  if (stackBottom <= 0) {
    return 0;
  }
  return Math.max(0, Math.round(stackBottom + gap));
}

export function measureStickyCover(
  navElement?: HTMLElement,
  vars?: StickyVars,
): number {
  const nav = navElement ?? document.getElementById(HANDBOOK_SIDEBAR_ID);
  const scroller = document.getElementById(HANDBOOK_NAV_ASIDE_ID);
  if (!nav || !scroller) {
    return 0;
  }
  const scrollerStyle = getComputedStyle(scroller);
  const scrollerTop = scroller.getBoundingClientRect().top;
  const { gap } = stickySpacing(nav);
  const pinnedRows: Array<{
    stickyTop: number;
    height: number;
    shifted: boolean;
    relativeTop: number;
  }> = [];
  for (const element of pathElements(nav)) {
    const rect = element.getBoundingClientRect();
    const relativeTop = rect.top - scrollerTop;
    const stickyTop = stickyTopPx(element, scrollerStyle, vars);
    const pinned = relativeTop <= stickyTop + 0.5;
    if (pinned) {
      pinnedRows.push({
        stickyTop,
        height: element.offsetHeight,
        shifted: element.style.transform.includes("translateY"),
        relativeTop,
      });
    }
  }
  return pinnedPathStackCoverBottomPx(pinnedRows, gap);
}
