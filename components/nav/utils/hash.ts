import { splitHref } from "@/lib/nav";
import { hashIdFrom } from "@/lib/nav/navUtils";
import { setBookmarkNavMode } from "./bookmarkNavMode";
import { clearConceptNavForPath, recordConceptNav } from "./conceptNavBack";

let suppressConceptNavRecord = false;

/** Skip recording on the next same-document hash change (concept back/forward chrome). */
export function suppressNextConceptNavRecord() {
  suppressConceptNavRecord = true;
}

function maybeRecordConceptNav(
  pathname: string,
  fromConceptId: string,
  toConceptId: string,
) {
  if (suppressConceptNavRecord) {
    suppressConceptNavRecord = false;
    return;
  }
  recordConceptNav(pathname, fromConceptId, toConceptId);
}

export { hashIdFrom };

const hashListeners = new Set<() => void>();

function notifyHashListeners() {
  for (const listener of hashListeners) {
    listener();
  }
}

export function subscribeHash(onStoreChange: () => void) {
  hashListeners.add(onStoreChange);
  window.addEventListener("hashchange", onStoreChange);
  return () => {
    hashListeners.delete(onStoreChange);
    window.removeEventListener("hashchange", onStoreChange);
  };
}

export function getHash() {
  return window.location.hash;
}

export function getServerHash() {
  return "";
}

export function dispatchHashChange(scroll?: boolean) {
  notifyHashListeners();
  if (scroll === undefined) {
    window.dispatchEvent(new Event("hashchange"));
    return;
  }
  window.dispatchEvent(new CustomEvent("hashchange", { detail: { scroll } }));
}

type PendingPathHash = {
  readonly pathname: string;
  readonly hash: string;
};

let pendingPathHash: PendingPathHash | null = null;
const pendingPathListeners = new Set<() => void>();

function notifyPendingPathListeners() {
  for (const listener of pendingPathListeners) {
    listener();
  }
}

function clearPendingPathHash() {
  if (!pendingPathHash) {
    return;
  }
  pendingPathHash = null;
  notifyPendingPathListeners();
}

export function subscribePendingPath(onStoreChange: () => void) {
  pendingPathListeners.add(onStoreChange);
  return () => pendingPathListeners.delete(onStoreChange);
}

export function getPendingPathname() {
  return pendingPathHash?.pathname ?? "";
}

export function getServerPendingPathname() {
  return "";
}

export function getPendingHash() {
  return pendingPathHash?.hash ?? "";
}

export function getServerPendingHash() {
  return "";
}

export function handbookLocation(
  pathname: string,
  hash: string,
): { readonly pathname: string; readonly hash: string } {
  if (pendingPathHash) {
    return {
      pathname: pendingPathHash.pathname,
      hash: pendingPathHash.hash,
    };
  }
  return { pathname, hash };
}

export function applySameDocumentHref(
  nextPath: string,
  nextHash: string,
  currentPath: string,
): boolean {
  const currentHash = window.location.hash;
  if (nextPath === currentPath && nextHash === currentHash) {
    clearPendingPathHash();
    dispatchHashChange();
    return true;
  }
  if (nextPath === currentPath) {
    maybeRecordConceptNav(
      nextPath,
      hashIdFrom(currentHash),
      hashIdFrom(nextHash),
    );
    window.history.replaceState(
      window.history.state,
      "",
      `${nextPath}${nextHash}`,
    );
    clearPendingPathHash();
    dispatchHashChange();
    return true;
  }
  return false;
}

export function queueHandbookHref(href: string): void {
  const { pathname, hash } = splitHref(href);
  if (
    pendingPathHash?.pathname === pathname &&
    hash === "" &&
    pendingPathHash.hash !== ""
  ) {
    return;
  }
  pendingPathHash = { pathname, hash };
  notifyPendingPathListeners();
}

export function followHandbookHref(
  href: string,
  currentPath: string,
  push: (pathname: string) => void,
  options?: { bookmarkNav?: boolean },
): void {
  if (!options?.bookmarkNav) {
    setBookmarkNavMode(false);
  }
  const { pathname, hash } = splitHref(href);
  if (applySameDocumentHref(pathname, hash, currentPath)) {
    return;
  }
  queueHandbookHref(href);
  push(pathname);
}

export function takePendingHashForPath(pathname: string): string | null {
  if (!pendingPathHash) {
    return null;
  }
  if (pendingPathHash.pathname !== pathname) {
    pendingPathHash = null;
    notifyPendingPathListeners();
    return null;
  }
  const { hash } = pendingPathHash;
  pendingPathHash = null;
  notifyPendingPathListeners();
  return hash;
}

export function setHashOnPath(pathname: string, id: string, scroll = true) {
  const next = `#${id}`;
  const url = `${pathname}${window.location.search}${next}`;
  if (
    `${window.location.pathname}${window.location.search}${window.location.hash}` !==
    url
  ) {
    maybeRecordConceptNav(pathname, hashIdFrom(window.location.hash), id);
    window.history.replaceState(window.history.state, "", url);
  }
  clearPendingPathHash();
  dispatchHashChange(scroll);
}

export function setHashIfChanged(id: string, scroll = true) {
  const next = `#${id}`;
  if (window.location.hash === next) {
    return false;
  }
  setHashOnPath(window.location.pathname, id, scroll);
  return true;
}

export function replacePathHash(pathname: string, hash: string) {
  window.history.replaceState(window.history.state, "", `${pathname}${hash}`);
  dispatchHashChange(true);
}

export function clearConceptHash(scroll = false) {
  const next = `${window.location.pathname}${window.location.search}`;
  if (`${next}${window.location.hash}` !== next) {
    window.history.replaceState(window.history.state, "", next);
  }
  clearConceptNavForPath(window.location.pathname);
  clearPendingPathHash();
  dispatchHashChange(scroll);
}

export function shouldScrollFromHashEvent(event?: Event): boolean {
  if (event == null) {
    return true;
  }
  if (event instanceof CustomEvent) {
    const detail = event.detail as { scroll?: boolean } | undefined;
    return detail?.scroll !== false;
  }
  return true;
}
