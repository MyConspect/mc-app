"use client";

import { memo } from "react";
import Link from "next/link";
import { SidebarHighlightedText } from "@/components/search";
import { chromeFor } from "@/lib/i18n/chrome";
import { localeFromPathname } from "@/lib/i18n/paths";
import { CHROME, splitHref, type SearchSidebarHit } from "@/lib/nav";
import {
  NAV_ROW_GAP,
  useSidebarChrome,
} from "../context/sidebarContext";
import {
  navigateHandbookConcept,
  parseConceptLeafHref,
} from "../utils/navigateHandbookConcept";

export const SearchHitList = memo(function SearchHitList({
  hits,
  remaining = 0,
}: {
  hits: readonly SearchSidebarHit[];
  remaining?: number;
}) {
  const { query, pathname, first, goToPath, onNavigate } = useSidebarChrome();

  if (hits.length === 0) {
    return null;
  }

  const moreLabel =
    remaining > 0
      ? chromeFor(localeFromPathname(pathname)).searchMoreHits.replace(
          "{count}",
          String(remaining),
        )
      : "";

  return (
    <>
      {hits.map((hit, index) => {
        const { pathname: hitPath, hash } = splitHref(hit.href);
        const isFirstHit = first?.pathname === hitPath && first.hash === hash;
        return (
          <li key={`${hit.href}:${hit.concept.id}`}>
            <Link
              href={hit.href}
              prefetch={false}
              scroll={false}
              data-concept-id={hit.concept.id}
              data-search-hit={isFirstHit ? "true" : undefined}
              data-search-in={hit.snippet ? "notes" : undefined}
              onNavigate={(event) => {
                event.preventDefault();
                const leaf = parseConceptLeafHref(hit.href);
                navigateHandbookConcept({
                  topicHref: hit.topicHref || leaf.topicHref,
                  conceptId: hit.concept.id,
                  committedPathname: pathname,
                  href: hit.href,
                  goToPath,
                  onNavigate,
                });
              }}
              className={`block w-full cursor-pointer rounded-md bg-yellow-50 px-2 py-1.5 text-sm font-medium text-zinc-900 ring-1 ring-yellow-200 dark:bg-yellow-950 dark:text-zinc-50 dark:ring-yellow-800 pl-4${
                index === 0 ? ` ${NAV_ROW_GAP}` : " mt-0.5"
              }`}
            >
              <span className="flex items-baseline justify-between gap-2">
                <SidebarHighlightedText text={hit.concept.title} query={query} />
                {hit.snippet ? (
                  <span className="shrink-0 text-[10px] font-medium tracking-wide text-zinc-400 uppercase dark:text-zinc-500">
                    {CHROME.inNotes}
                  </span>
                ) : null}
              </span>
              {hit.snippet ? (
                <span className="mt-0.5 block text-xs font-normal leading-snug text-zinc-500 dark:text-zinc-400">
                  <SidebarHighlightedText text={hit.snippet} query={query} />
                </span>
              ) : null}
            </Link>
          </li>
        );
      })}
      {remaining > 0 ? (
        <li className="px-2 py-1 text-xs text-zinc-500 dark:text-zinc-400">
          {moreLabel}
        </li>
      ) : null}
    </>
  );
});
