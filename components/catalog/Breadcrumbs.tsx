"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import {
  applySameDocumentHref,
  queueHandbookHref,
  getHash,
  getServerHash,
  hashIdFrom,
  subscribeHash,
} from "@/components/nav/utils/hash";
import {
  CHROME,
  crumbsWithActive,
  splitHref,
  type Crumb,
  type HashCrumb,
} from "@/lib/nav";
import { scrollToConceptGroupSection } from "@/components/topic/utils/scrollToConceptGroupSection";

export function Breadcrumbs({
  items,
  pageHref,
  hashCrumbs = [],
  compact = false,
  inBar = false,
}: {
  items: readonly Crumb[];
  pageHref?: string;
  hashCrumbs?: readonly HashCrumb[];
  compact?: boolean;
  inBar?: boolean;
}) {
  const hash = useSyncExternalStore(subscribeHash, getHash, getServerHash);
  const trail =
    pageHref && hashCrumbs.length > 0
      ? crumbsWithActive(items, pageHref, hashCrumbs, hashIdFrom(hash))
      : items;

  if (!compact && trail.length < 2) {
    return null;
  }
  if (trail.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label={CHROME.breadcrumbs}
      className={
        compact
          ? inBar
            ? "handbook-breadcrumb-trail min-w-0"
            : "min-w-0"
          : "mb-6"
      }
    >
      <ol
        className={
          compact
            ? "flex flex-nowrap items-center gap-x-0.5 text-sm"
            : "-ml-2 flex flex-wrap items-center gap-x-0.5 gap-y-1 text-sm"
        }
      >
        {trail.map((item, index) => {
          const isLast = index === trail.length - 1;
          const sectionScrollId = item.sectionScrollId;
          const isSectionScroll = Boolean(sectionScrollId) && !isLast;
          const sectionScrollBarClass =
            "cursor-pointer px-1.5 py-0 text-left font-medium leading-5 text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50";
          const sectionScrollClass =
            "cursor-pointer px-1.5 py-0.5 text-left font-medium text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50";

          return (
            <li
              key={`${item.label}-${item.href ?? sectionScrollId ?? index}`}
              className="flex shrink-0 items-center gap-x-0.5"
            >
              {index === 0 ? null : (
                <span
                  aria-hidden="true"
                  className="text-zinc-300 dark:text-zinc-600"
                >
                  /
                </span>
              )}
              {isSectionScroll ? (
                <button
                  type="button"
                  className={inBar ? sectionScrollBarClass : sectionScrollClass}
                  onClick={() =>
                    scrollToConceptGroupSection(sectionScrollId ?? "")
                  }
                >
                  {item.label}
                </button>
              ) : item.href && !isLast ? (
                <Link
                  href={item.href}
                  scroll={false}
                  onClick={(event) => {
                    const href = item.href;
                    if (!href) {
                      return;
                    }
                    const { pathname, hash } = splitHref(href);
                    if (
                      applySameDocumentHref(
                        pathname,
                        hash,
                        window.location.pathname,
                      )
                    ) {
                      event.preventDefault();
                      return;
                    }
                    queueHandbookHref(href);
                  }}
                  className={
                    inBar
                      ? "cursor-pointer rounded-md px-1.5 py-0 font-medium leading-5 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
                      : "cursor-pointer rounded-md px-1.5 py-0.5 font-medium text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
                  }
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={isLast ? "page" : undefined}
                  className={
                    inBar
                      ? "px-1.5 py-0 font-medium leading-5 text-zinc-900 dark:text-zinc-50"
                      : "px-1.5 py-0.5 font-medium text-zinc-900 dark:text-zinc-50"
                  }
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
