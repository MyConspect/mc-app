"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HANDBOOK_HEADER_ID,
  HANDBOOK_SEARCH_INPUT_ID,
  HANDBOOK_SIDEBAR_ID,
} from "@/constants";
import { type ChromeCopy, type SearchMode } from "@/lib/nav";
import { homeHref, localeFromPathname } from "@/lib/i18n/paths";
import { SITE_NAME } from "@/lib/site";
import { MobileHandbookFooter } from "../ui/MobileHandbookFooter";
import { ContactLinks } from "./ContactLinks";
import { HeaderChromeActions } from "./HeaderChromeActions";
import { SiteMark } from "./SiteMark";

export function SiteHeader({
  query,
  onQueryChange,
  onHomeClick,
  mode,
  onModeChange,
  chrome,
  navOpen,
  onToggleNav,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  onHomeClick: () => void;
  mode: SearchMode;
  onModeChange: (mode: SearchMode) => void;
  chrome: ChromeCopy;
  navOpen: boolean;
  onToggleNav: () => void;
}) {
  const pathname = usePathname() ?? "/en";
  const locale = localeFromPathname(pathname);

  return (
    <div id={HANDBOOK_HEADER_ID} className="relative z-40 shrink-0">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex h-14 min-w-0 items-center overflow-hidden">
          <div className="flex shrink-0 items-center bg-white pl-(--chrome-inline) pr-1 sm:pr-2 max-md:relative md:sticky md:left-0 md:z-10 dark:bg-zinc-950">
            <Link
              href={homeHref(locale)}
              onClick={onHomeClick}
              className="inline-flex h-9 shrink-0 items-center gap-2 rounded-md px-1.5 text-zinc-900 hover:bg-zinc-100 dark:text-zinc-50 dark:hover:bg-zinc-800"
            >
              <SiteMark />
              <span className="hidden text-sm font-semibold tracking-tight sm:inline">
                {SITE_NAME}
              </span>
              <span className="sr-only sm:hidden">{SITE_NAME}</span>
            </Link>
          </div>
          <div className="flex min-w-0 flex-1 items-center px-1.5 sm:px-3">
            <div className="relative min-w-0 flex-1 max-w-2xl">
              <label className="block min-w-0">
                <span className="sr-only">
                  {mode === "notes"
                    ? chrome.searchNotesPlaceholder
                    : chrome.searchPlaceholder}
                </span>
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400"
                >
                  <circle
                    cx="11"
                    cy="11"
                    r="6.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                  />
                  <path
                    d="M16 16l4 4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                  />
                </svg>
                <input
                  id={HANDBOOK_SEARCH_INPUT_ID}
                  type="search"
                  value={query}
                  onChange={(event) => onQueryChange(event.target.value)}
                  placeholder={
                    mode === "notes"
                      ? chrome.searchNotesPlaceholder
                      : chrome.searchPlaceholder
                  }
                  className={
                    query.length > 0
                      ? "h-9 w-full appearance-none rounded-md border border-zinc-200 bg-zinc-50 py-1.5 pr-9 pl-9 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-400 focus:bg-white max-sm:pr-[4.25rem] sm:pr-[6.25rem] md:pr-[9.75rem] dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-500 dark:focus:bg-zinc-900 [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none"
                      : "h-9 w-full appearance-none rounded-md border border-zinc-200 bg-zinc-50 py-1.5 pr-3 pl-9 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-400 focus:bg-white max-sm:pr-9 sm:pr-[4.25rem] md:pr-[7.75rem] dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-500 dark:focus:bg-zinc-900 [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none"
                  }
                />
              </label>
              <div className="absolute inset-y-0 right-1 flex items-center gap-0.5">
                {query.length > 0 ? (
                  <button
                    type="button"
                    aria-label={chrome.clearSearch}
                    title={chrome.clearSearch}
                    onClick={() => onQueryChange("")}
                    className="inline-flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                  >
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      className="size-4"
                    >
                      <path
                        d="M6 6l12 12M18 6L6 18"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.75"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                ) : null}
                <SearchModeMobileToggle
                  mode={mode}
                  searchModeLabel={chrome.searchMode}
                  titlesLabel={chrome.searchModeTitles}
                  notesLabel={chrome.searchModeNotes}
                  onModeChange={onModeChange}
                />
                <div
                  role="radiogroup"
                  aria-label={chrome.searchMode}
                  className="hidden h-7 shrink-0 rounded-md bg-zinc-100 p-0.5 sm:flex dark:bg-zinc-800"
                >
                  <SearchModeButton
                    checked={mode === "titles"}
                    label={chrome.searchModeTitles}
                    value="titles"
                    onSelect={onModeChange}
                  />
                  <SearchModeButton
                    checked={mode === "notes"}
                    label={chrome.searchModeNotes}
                    value="notes"
                    onSelect={onModeChange}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="flex h-9 shrink-0 items-center gap-1 bg-white pr-(--chrome-inline) pl-1 max-md:relative sm:pl-2 md:sticky md:right-0 md:z-10 dark:bg-zinc-950">
            <div className="hidden items-center gap-0.5 md:flex">
              <HeaderChromeActions
                chrome={chrome}
                locale={locale}
                parts="locale"
              />
            </div>
            <button
              type="button"
              className={
                navOpen
                  ? "inline-flex size-9 shrink-0 touch-manipulation cursor-pointer items-center justify-center self-center rounded-md border border-zinc-900 bg-zinc-900 text-white md:hidden dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                  : "inline-flex size-9 shrink-0 touch-manipulation cursor-pointer items-center justify-center self-center rounded-md border border-zinc-300 bg-zinc-50 text-zinc-800 hover:border-zinc-400 hover:bg-zinc-100 md:hidden dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-500 dark:hover:bg-zinc-800"
              }
              aria-expanded={navOpen}
              aria-controls={HANDBOOK_SIDEBAR_ID}
              onClick={onToggleNav}
            >
              <span className="sr-only">
                {navOpen ? chrome.closeMenu : chrome.openMenu}
              </span>
              <MenuGlyph open={navOpen} />
            </button>
          </div>
        </div>
      </header>
    </div>
  );
}

const DRAWER_FOOTER_SURFACE =
  "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950";

export function DrawerFooter({
  chrome,
  locale,
  onNavigate,
  lastUpdatedIso,
  lastUpdatedLabel,
}: {
  chrome: ChromeCopy;
  locale: ReturnType<typeof localeFromPathname>;
  onNavigate?: () => void;
  lastUpdatedIso: string;
  lastUpdatedLabel: string;
}) {
  return (
    <div
      className={`flex shrink-0 flex-col max-md:border-t ${DRAWER_FOOTER_SURFACE}`}
    >
      <MobileHandbookFooter
        chrome={chrome}
        locale={locale}
        onNavigate={onNavigate}
        lastUpdatedIso={lastUpdatedIso}
        lastUpdatedLabel={lastUpdatedLabel}
      />
      <div className="hidden items-center justify-between gap-2 px-2 py-1.5 md:flex">
        <div className="flex min-w-0 items-center gap-1">
          <HeaderChromeActions
            chrome={chrome}
            locale={locale}
            onInstructionsClick={onNavigate}
            parts="instructions"
          />
          <span
            className="mx-0.5 h-5 w-px shrink-0 bg-zinc-200 dark:bg-zinc-700"
            aria-hidden="true"
          />
          <ContactLinks />
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <time
            dateTime={lastUpdatedIso}
            className="pr-1 text-right text-[11px] leading-tight text-zinc-500 dark:text-zinc-400"
          >
            <span className="block">{chrome.lastUpdated}</span>
            <span className="tabular-nums text-zinc-600 dark:text-zinc-300">
              {lastUpdatedLabel}
            </span>
          </time>
        </div>
      </div>
    </div>
  );
}

function MenuGlyph({ open }: { open: boolean }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5 shrink-0">
      {open ? (
        <path
          d="M6 6l12 12M18 6L6 18"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
      ) : (
        <path
          d="M5 7h14M5 12h14M5 17h14"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}

function SearchModeMobileToggle({
  mode,
  searchModeLabel,
  titlesLabel,
  notesLabel,
  onModeChange,
}: {
  mode: SearchMode;
  searchModeLabel: string;
  titlesLabel: string;
  notesLabel: string;
  onModeChange: (mode: SearchMode) => void;
}) {
  const activeLabel = mode === "titles" ? titlesLabel : notesLabel;
  const nextMode: SearchMode = mode === "titles" ? "notes" : "titles";
  const nextLabel = nextMode === "titles" ? titlesLabel : notesLabel;

  return (
    <button
      type="button"
      aria-pressed={mode === "notes"}
      aria-label={`${searchModeLabel}: ${activeLabel}. Switch to ${nextLabel}.`}
      title={`${activeLabel} — tap for ${nextLabel}`}
      data-search-mode={mode}
      onClick={() => onModeChange(nextMode)}
      className="inline-flex size-7 shrink-0 touch-manipulation cursor-pointer items-center justify-center rounded-md text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 sm:hidden dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
    >
      <SearchModeIcon mode={mode} className="size-4" />
    </button>
  );
}

function SearchModeButton({
  checked,
  label,
  value,
  onSelect,
}: {
  checked: boolean;
  label: string;
  value: SearchMode;
  onSelect: (mode: SearchMode) => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      aria-label={label}
      title={label}
      data-search-mode={value}
      onClick={() => onSelect(value)}
      className={
        checked
          ? "inline-flex size-9 touch-manipulation cursor-pointer items-center justify-center rounded bg-white text-zinc-900 shadow-sm sm:size-6 sm:h-auto sm:w-auto sm:px-1.5 dark:bg-zinc-700 dark:text-zinc-50"
          : "inline-flex size-9 touch-manipulation cursor-pointer items-center justify-center rounded text-zinc-500 hover:text-zinc-800 sm:size-6 sm:h-auto sm:w-auto sm:px-1.5 dark:text-zinc-400 dark:hover:text-zinc-100"
      }
    >
      <SearchModeIcon mode={value} />
      <span className="hidden text-xs font-medium sm:inline">{label}</span>
    </button>
  );
}

function SearchModeIcon({
  mode,
  className = "size-3.5 sm:hidden",
}: {
  mode: SearchMode;
  className?: string;
}) {
  switch (mode) {
    case "titles":
      return (
        <svg aria-hidden="true" viewBox="0 0 24 24" className={className}>
          <circle cx="4.75" cy="7" r="2" fill="currentColor" />
          <circle cx="4.75" cy="12" r="2" fill="currentColor" />
          <circle cx="4.75" cy="17" r="2" fill="currentColor" />
          <path
            d="M9.5 7H19.5M9.5 12H19.5M9.5 17H15.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
        </svg>
      );
    case "notes":
      return (
        <svg aria-hidden="true" viewBox="0 0 24 24" className={className}>
          <path
            d="M7 4.5h7.5L18 8v11.5H7z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
          <path
            d="M14.5 4.5V8H18M9.5 12h5M9.5 15.5h5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    default: {
      const exhaustive: never = mode;
      return exhaustive;
    }
  }
}
