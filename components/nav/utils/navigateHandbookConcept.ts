import { conceptHref, splitHref } from "@/lib/nav";
import { hashIdFrom } from "@/lib/nav/navUtils";
import { closeNavWhenLeafConcept } from "../context/sidebarContext";
import { isActiveHref } from "./location/active";
import { applySameTopicConceptHash, followHandbookHref } from "./hash";

export type NavigateHandbookConceptInput = {
  /** Catalog topic href (logical, may omit section segment). */
  topicHref: string;
  conceptId: string;
  committedPathname: string;
  goToPath: (pathname: string) => void;
  onNavigate?: () => void;
  /** When false, hash change does not request scroll-from-hash behavior. */
  scroll?: boolean;
  /** Full handbook href; defaults to `conceptHref(topicHref, conceptId)`. */
  href?: string;
  followOptions?: { bookmarkNav?: boolean };
};

/**
 * Single entry for sidebar, search, and bookmark leaf navigations to a concept.
 */
export function navigateHandbookConcept(
  input: NavigateHandbookConceptInput,
): void {
  const {
    topicHref,
    conceptId,
    committedPathname,
    goToPath,
    onNavigate,
    scroll = true,
    followOptions,
  } = input;
  const href = input.href ?? conceptHref(topicHref, conceptId);

  if (isActiveHref(committedPathname, topicHref)) {
    applySameTopicConceptHash(topicHref, conceptId, committedPathname, scroll);
    closeNavWhenLeafConcept(conceptId, onNavigate);
    return;
  }

  followHandbookHref(href, committedPathname, goToPath, followOptions);
  closeNavWhenLeafConcept(conceptId, onNavigate);
}

/** Resolve topic + concept id from a full handbook href for chrome navigators. */
export function parseConceptLeafHref(href: string): {
  topicHref: string;
  conceptId: string;
} {
  const { pathname, hash } = splitHref(href);
  return { topicHref: pathname, conceptId: hashIdFrom(hash) };
}