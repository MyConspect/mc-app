"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ChromeCopy } from "@/lib/nav";
import { instructionsHref, type localeFromPathname } from "@/lib/i18n/paths";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeToggle } from "./ThemeToggle";

export function HeaderChromeActions({
  chrome,
  locale,
  onInstructionsClick,
  languageVariant = "links",
  parts = "all",
}: {
  chrome: ChromeCopy;
  locale: ReturnType<typeof localeFromPathname>;
  onInstructionsClick?: () => void;
  languageVariant?: "links" | "select";
  parts?: "all" | "instructions" | "locale";
}) {
  const pathname = usePathname() ?? "/en";
  const instructionsPath = instructionsHref(locale);
  const onInstructions = pathname === instructionsPath;
  const showInstructions = parts === "all" || parts === "instructions";
  const showLocale = parts === "all" || parts === "locale";

  return (
    <div className="flex shrink-0 items-center gap-1">
      {showInstructions ? (
        <Link
          href={instructionsPath}
          onClick={onInstructionsClick}
          aria-label={chrome.instructions}
          title={chrome.instructions}
          aria-current={onInstructions ? "page" : undefined}
          className={
            onInstructions
              ? "inline-flex size-9 touch-manipulation items-center justify-center rounded-md text-zinc-900 dark:text-zinc-50"
              : "inline-flex size-9 touch-manipulation items-center justify-center rounded-md text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
          }
        >
          <InstructionsIcon />
        </Link>
      ) : null}
      {showLocale ? (
        <>
          <LanguageSwitcher locale={locale} variant={languageVariant} />
          <ThemeToggle />
        </>
      ) : null}
    </div>
  );
}

function InstructionsIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none">
      <path
        d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
