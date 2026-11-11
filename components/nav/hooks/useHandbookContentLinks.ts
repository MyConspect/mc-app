"use client";

import { useEffect, type RefObject } from "react";
import { usePathname, useRouter } from "next/navigation";
import { followHandbookHref } from "../utils/hash";

function shouldIgnoreAnchorClick(
  event: MouseEvent,
  anchor: HTMLAnchorElement,
): boolean {
  if (event.defaultPrevented || event.button !== 0) {
    return true;
  }
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
    return true;
  }
  if (anchor.target && anchor.target !== "_self") {
    return true;
  }
  if (anchor.hasAttribute("download")) {
    return true;
  }
  return false;
}

function handbookHrefFromAnchor(anchor: HTMLAnchorElement): string | null {
  let url: URL;
  try {
    url = new URL(anchor.href, window.location.href);
  } catch {
    return null;
  }
  if (url.origin !== window.location.origin) {
    return null;
  }
  return `${url.pathname}${url.search}${url.hash}`;
}

/** Keep concept hashes when note-body <a> clicks are client-navigated. */
export function useHandbookContentLinks(
  rootRef: RefObject<HTMLElement | null>,
  html: string,
) {
  const pathname = usePathname() ?? "/";
  const router = useRouter();

  useEffect(() => {
    const container = rootRef.current;
    if (!container) {
      return;
    }
    const rootEl: HTMLElement = container;

    function onClick(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }
      const anchor = target.closest("a");
      if (!(anchor instanceof HTMLAnchorElement) || !rootEl.contains(anchor)) {
        return;
      }
      if (shouldIgnoreAnchorClick(event, anchor)) {
        return;
      }
      const href = handbookHrefFromAnchor(anchor);
      if (!href) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      followHandbookHref(href, pathname, (path) => {
        router.push(path, { scroll: false });
      });
    }

    rootEl.addEventListener("click", onClick, true);
    return () => rootEl.removeEventListener("click", onClick, true);
  }, [html, pathname, rootRef, router]);
}
