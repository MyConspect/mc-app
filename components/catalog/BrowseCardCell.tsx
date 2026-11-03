"use client";

import Link from "next/link";
import { useMemo } from "react";
import { usePathname } from "next/navigation";
import {
  BookmarkButton,
  useIsBookmarked,
} from "@/components/nav/ui/BookmarkButton";
import { CopyConceptLinkButton } from "@/components/topic/CopyConceptLinkButton";
import { chromeFor } from "@/lib/i18n/chrome";
import { localeFromPathname } from "@/lib/i18n/paths";
import type { CardItem } from "./CardGrid";

function sharePathFromHref(href: string): string {
  return href.startsWith("/") ? href : `/${href}`;
}

export function BrowseCardCell({ item }: { item: CardItem }) {
  const pathname = usePathname() ?? "/en";
  const chrome = useMemo(
    () => chromeFor(localeFromPathname(pathname)),
    [pathname],
  );
  const sharePath = sharePathFromHref(item.href);
  const saved = useIsBookmarked(sharePath);

  return (
    <li
      id={item.id}
      className={`group relative${item.id ? " scroll-mt-24" : ""}`}
    >
      <Link
        href={item.href}
        className="block h-full touch-manipulation rounded-xl border border-zinc-200 bg-white p-4 transition-colors hover:border-zinc-400 hover:bg-zinc-50 sm:p-5 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
      >
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          {item.title}
        </h2>
        {item.description ? (
          <p className="mt-1.5 text-sm leading-6 text-zinc-600 sm:mt-2 dark:text-zinc-400">
            {item.description}
          </p>
        ) : null}
      </Link>
      <div
        className={
          saved
            ? "absolute top-3 right-3 flex items-center gap-0.5 sm:top-4 sm:right-4"
            : "pointer-events-none absolute top-3 right-3 flex items-center gap-0.5 max-sm:pointer-events-auto sm:top-4 sm:right-4 group-hover:pointer-events-auto group-focus-within:pointer-events-auto"
        }
      >
        <CopyConceptLinkButton
          chrome={chrome}
          sharePathname={sharePath}
          size="md"
        />
        <BookmarkButton
          pathname={sharePath}
          title={item.title}
          chrome={chrome}
          revealOnHover
          size="md"
        />
      </div>
    </li>
  );
}
