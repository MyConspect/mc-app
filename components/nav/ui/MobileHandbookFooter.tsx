"use client";

import type { ChromeCopy } from "@/lib/nav";
import type { localeFromPathname } from "@/lib/i18n/paths";
import { ContactLinks } from "../header/ContactLinks";
import { HeaderChromeActions } from "../header/HeaderChromeActions";

const FOOTER_SURFACE =
  "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950";

export function MobileHandbookFooter({
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
    <footer
      className={`shrink-0 touch-manipulation border-t md:hidden ${FOOTER_SURFACE}`}
    >
      <div
        className={`grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 px-3 py-2 pb-[max(0.625rem,env(safe-area-inset-bottom))] pr-11 ${FOOTER_SURFACE}`}
      >
        <div className="flex min-w-0 items-center gap-1">
          <HeaderChromeActions
            chrome={chrome}
            locale={locale}
            onInstructionsClick={onNavigate}
            languageVariant="select"
            parts="all"
          />
          <span
            className="mx-1 h-5 w-px shrink-0 bg-zinc-200 dark:bg-zinc-700"
            aria-hidden="true"
          />
          <ContactLinks />
        </div>
        <time
          dateTime={lastUpdatedIso}
          className="max-w-[9.5rem] shrink-0 self-center text-right text-[11px] leading-tight text-zinc-500 dark:text-zinc-400"
        >
          <span className="block">{chrome.lastUpdated}</span>
          <span className="block truncate tabular-nums text-zinc-600 dark:text-zinc-300">
            {lastUpdatedLabel}
          </span>
        </time>
      </div>
    </footer>
  );
}
