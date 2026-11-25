"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import type { Bookmark } from "@/lib/nav/bookmarks";
import { splitHref } from "@/lib/nav";
import {
  bookmarkMatchesPage,
  clearAllBookmarks,
  getServerBookmarks,
  readBookmarks,
  removeBookmark,
  subscribeBookmarks,
} from "@/lib/nav/bookmarks";
import type { ChromeCopy } from "@/lib/nav";
import { hashIdFrom } from "@/lib/nav/navUtils";
import {
  followHandbookHref,
  queueHandbookHref,
  setHashOnPath,
} from "../utils/hash";
import { setBookmarkNavMode } from "../utils/bookmarkNavMode";
import { useHandbookLocation } from "../hooks/useHandbookLocation";
import { trackHeaderClass } from "../context/sidebarContext";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { NavFold } from "../ui/NavFold";

export function BookmarksPanel({
  chrome,
  onNavigate,
}: {
  chrome: ChromeCopy;
  onNavigate?: () => void;
}) {
  const { pathname, location, activeConceptId } = useHandbookLocation();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);
  const bookmarks = useSyncExternalStore(
    subscribeBookmarks,
    readBookmarks,
    getServerBookmarks,
  );

  if (bookmarks.length === 0) {
    return null;
  }

  const isActive = (bookmark: Bookmark) =>
    bookmarkMatchesPage(
      location.pathname,
      activeConceptId,
      bookmark.href,
      bookmark.conceptId,
    );

  const hasActiveBookmark = bookmarks.some(isActive);

  return (
    <section className="border-b border-zinc-200 pb-3 max-md:pt-0 dark:border-zinc-800">
      <div className={`group ${trackHeaderClass(hasActiveBookmark)}`}>
        <button
          type="button"
          data-nav="bookmarks"
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
          className="min-w-0 flex-1 text-left"
        >
          {chrome.bookmarksNav}
        </button>
        <div className="relative size-7 shrink-0">
          <span
            aria-hidden="true"
            className="absolute inset-0 flex items-center justify-center text-xs font-medium tabular-nums text-zinc-400 transition-opacity group-hover:opacity-0 dark:text-zinc-500"
          >
            {bookmarks.length}
          </span>
          <button
            type="button"
            className="pointer-events-none absolute inset-0 inline-flex items-center justify-center rounded-md text-zinc-400 opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100 hover:bg-zinc-100 hover:text-zinc-700 focus-visible:pointer-events-auto focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 dark:focus-visible:ring-zinc-500"
            aria-label={chrome.clearAllBookmarks}
            onClick={() => setClearConfirmOpen(true)}
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="size-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 6h18" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
              <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              <path d="M10 11v6" />
              <path d="M14 11v6" />
            </svg>
          </button>
        </div>
      </div>
      <NavFold open={open}>
        <div className="mt-1.5 ml-1.5 border-l-2 border-yellow-200 pl-2 dark:border-yellow-800">
          <ul className="space-y-0.5">
            {bookmarks.map((bookmark) => {
              const active = isActive(bookmark);
              return (
                <li key={`${bookmark.href}:${bookmark.conceptId ?? ""}`}>
                  <div
                    className={
                      active
                        ? "group flex w-full items-center gap-0.5 rounded-md bg-yellow-50 px-1 ring-1 ring-yellow-200 dark:bg-yellow-950 dark:ring-yellow-800"
                        : "group flex w-full items-center gap-0.5 rounded-md px-1 hover:bg-yellow-50 dark:hover:bg-yellow-950/60"
                    }
                  >
                    <Link
                      href={bookmark.href}
                      prefetch={false}
                      aria-current={active ? "page" : undefined}
                      className={
                        active
                          ? "min-w-0 flex-1 py-1.5 pl-1 text-sm font-medium text-zinc-900 dark:text-zinc-50"
                          : "min-w-0 flex-1 py-1.5 pl-1 text-sm font-normal text-zinc-700 group-hover:text-zinc-800 dark:text-zinc-300 dark:group-hover:text-zinc-50"
                      }
                      onClick={(event) => {
                        event.preventDefault();
                        const { pathname: targetPath, hash } = splitHref(
                          bookmark.href,
                        );
                        if (targetPath === pathname) {
                          if (hash) {
                            setHashOnPath(pathname, hashIdFrom(hash));
                          }
                          setBookmarkNavMode(true);
                          onNavigate?.();
                          return;
                        }
                        setBookmarkNavMode(true);
                        queueHandbookHref(bookmark.href);
                        followHandbookHref(
                          bookmark.href,
                          pathname,
                          (path) => {
                            router.push(path, { scroll: false });
                          },
                          { bookmarkNav: true },
                        );
                        onNavigate?.();
                      }}
                    >
                      <span className="line-clamp-2">{bookmark.title}</span>
                    </Link>
                    <button
                      type="button"
                      className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-zinc-400 opacity-100 group-hover:text-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100 dark:group-hover:text-zinc-200 dark:focus-visible:ring-zinc-500"
                      aria-label={chrome.removeBookmark}
                      title={chrome.removeBookmark}
                      onClick={() =>
                        removeBookmark(bookmark.href, bookmark.conceptId)
                      }
                    >
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        className="size-3.5"
                      >
                        <path
                          d="M6 6l12 12M18 6 6 18"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </NavFold>
      <ConfirmDialog
        open={clearConfirmOpen}
        title={chrome.clearAllBookmarksConfirm}
        confirmLabel={chrome.confirmYes}
        cancelLabel={chrome.confirmNo}
        onConfirm={() => {
          clearAllBookmarks();
          setOpen(false);
          setClearConfirmOpen(false);
        }}
        onCancel={() => setClearConfirmOpen(false)}
      />
    </section>
  );
}
