"use client";

import { useCallback, useState, type MouseEvent } from "react";
import { usePathname } from "next/navigation";
import { copyText } from "@/lib/clipboard";
import type { ChromeCopy } from "@/lib/nav";
import { conceptShareUrl, pageShareUrl } from "./utils/conceptLink";

const COPIED_MS = 2000;

const CONCEALED_CLASS =
  "opacity-0 group-hover:opacity-100 group-open:opacity-100 group-focus-within:opacity-100";

const DEFAULT_BTN_CLASS =
  "concept-copy-link inline-flex shrink-0 cursor-pointer items-center justify-center rounded-md text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 dark:focus-visible:ring-zinc-500";

export function CopyConceptLinkButton({
  conceptId,
  chrome,
  size = "md",
  concealed = true,
  className,
}: {
  conceptId?: string;
  chrome: ChromeCopy;
  size?: "md" | "lg";
  concealed?: boolean;
  className?: string;
}) {
  const pathname = usePathname() ?? "/";
  const [copied, setCopied] = useState(false);
  const buttonClass = className
    ? className
    : `${DEFAULT_BTN_CLASS} ${size === "lg" ? "size-9" : "size-7"}`;

  const onCopy = useCallback(
    async (event: MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();
      const url = conceptId
        ? conceptShareUrl(window.location.origin, pathname, conceptId)
        : pageShareUrl(window.location.origin, pathname);
      const ok = await copyText(url);
      if (!ok) {
        return;
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), COPIED_MS);
    },
    [conceptId, pathname],
  );

  return (
    <button
      type="button"
      className={`concept-copy-link ${buttonClass} ${concealed ? CONCEALED_CLASS : ""}`.trim()}
      aria-label={copied ? chrome.copiedLink : chrome.copyLink}
      title={copied ? chrome.copiedLink : chrome.copyLink}
      onClick={onCopy}
      onMouseDown={(event) => event.stopPropagation()}
    >
      {copied ? (
        <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4">
          <path
            d="M5 13l4 4L19 7"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4">
          <path
            d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}
