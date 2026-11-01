import { SEARCH_QUERY_MAX_LENGTH, UI_STORAGE_KEY } from "@/constants";
import type { SearchMode } from "@/lib/nav";

export type ThemePreference = "light" | "dark";
export type StoredTheme = ThemePreference | null;
export type ConceptDepthPreference = "quick" | "detailed";

export type StoredUi = {
  readonly query: string;
  readonly mode: SearchMode;
  readonly href: string;
  readonly sidebarCollapsed: boolean;
  readonly theme: StoredTheme;
  readonly conceptDepth: ConceptDepthPreference;
};

const EMPTY: StoredUi = {
  query: "",
  mode: "titles",
  href: "/",
  sidebarCollapsed: false,
  theme: null,
  conceptDepth: "quick",
};
const EMPTY_SEARCH = { query: EMPTY.query, mode: EMPTY.mode };

let cache: StoredUi | null = null;
let searchCache: { query: string; mode: SearchMode } = EMPTY_SEARCH;
const listeners = new Set<() => void>();
let queryPersistTimer: number | null = null;
const QUERY_PERSIST_MS = 400;

export type WriteUiOptions = {
  /** When false, subscribers are not notified (debounced search typing). */
  notify?: boolean;
  /** When false, localStorage is updated on the next debounced flush only. */
  persist?: boolean;
};

function emitUi() {
  for (const listener of listeners) {
    listener();
  }
}

export function subscribeUi(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
  };
}

function searchSnapshot(ui: StoredUi) {
  if (ui.query === EMPTY_SEARCH.query && ui.mode === EMPTY_SEARCH.mode) {
    searchCache = EMPTY_SEARCH;
    return searchCache;
  }
  if (searchCache.query !== ui.query || searchCache.mode !== ui.mode) {
    searchCache = { query: ui.query, mode: ui.mode };
  }
  return searchCache;
}

export function readSearchUi() {
  return searchSnapshot(readUi());
}

export function getServerSearchUi() {
  return EMPTY_SEARCH;
}

function asSearchMode(value: unknown): SearchMode {
  switch (value) {
    case "notes":
      return "notes";
    case "titles":
      return "titles";
    default:
      return "titles";
  }
}

function asQuery(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }
  return value.slice(0, SEARCH_QUERY_MAX_LENGTH);
}

function asHref(value: unknown): string {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//")
  ) {
    return "/";
  }
  return value;
}

function asTheme(value: unknown): StoredTheme {
  switch (value) {
    case "light":
      return "light";
    case "dark":
      return "dark";
    default:
      return null;
  }
}

function asConceptDepth(value: unknown): ConceptDepthPreference {
  return value === "detailed" ? "detailed" : "quick";
}

function parseStoredUi(raw: string): StoredUi {
  const parsed: unknown = JSON.parse(raw);
  if (!parsed || typeof parsed !== "object") {
    return EMPTY;
  }
  const record = parsed as Record<string, unknown>;
  return {
    query: asQuery(record.query),
    mode: asSearchMode(record.mode),
    href: asHref(record.href),
    sidebarCollapsed: record.sidebarCollapsed === true,
    theme: asTheme(record.theme),
    conceptDepth: asConceptDepth(record.conceptDepth),
  };
}

function flushUiPersist() {
  if (cache === null) {
    return;
  }
  try {
    window.localStorage.setItem(UI_STORAGE_KEY, JSON.stringify(cache));
  } catch {
    // Private mode or a full quota should not break browsing.
  }
}

function scheduleQueryPersist() {
  if (queryPersistTimer !== null) {
    window.clearTimeout(queryPersistTimer);
  }
  queryPersistTimer = window.setTimeout(() => {
    queryPersistTimer = null;
    flushUiPersist();
  }, QUERY_PERSIST_MS);
}

export function readUi(): StoredUi {
  try {
    const raw = window.localStorage.getItem(UI_STORAGE_KEY);
    if (!raw) {
      cache = EMPTY;
      return cache;
    }
    if (cache !== null) {
      return cache;
    }
    cache = parseStoredUi(raw);
    return cache;
  } catch {
    cache = EMPTY;
    return cache;
  }
}

export function readSidebarCollapsed() {
  return readUi().sidebarCollapsed;
}

export function getServerSidebarCollapsed() {
  return EMPTY.sidebarCollapsed;
}

export function readTheme(): StoredTheme {
  return readUi().theme;
}

export function getServerTheme(): StoredTheme {
  return EMPTY.theme;
}

export function systemTheme(): ThemePreference {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function resolveTheme(
  stored: StoredTheme = readTheme(),
): ThemePreference {
  return stored ?? systemTheme();
}

export function applyThemeClass(theme: ThemePreference) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

export function writeTheme(theme: ThemePreference) {
  writeUi({ theme });
  applyThemeClass(theme);
}

export function applyConceptDepth(depth: ConceptDepthPreference) {
  document.documentElement.dataset.conceptDepth = depth;
}

export function readConceptDepth(): ConceptDepthPreference {
  return readUi().conceptDepth;
}

export function getServerConceptDepth(): ConceptDepthPreference {
  return EMPTY.conceptDepth;
}

export function writeConceptDepth(depth: ConceptDepthPreference) {
  writeUi({ conceptDepth: depth });
  applyConceptDepth(depth);
}

export function writeUi(patch: Partial<StoredUi>, options?: WriteUiOptions) {
  cache = { ...readUi(), ...patch };
  searchSnapshot(cache);
  const notify = options?.notify !== false;
  const persist = options?.persist !== false;
  if (persist) {
    if (Object.keys(patch).length === 1 && "query" in patch) {
      scheduleQueryPersist();
    } else {
      if (queryPersistTimer !== null) {
        window.clearTimeout(queryPersistTimer);
        queryPersistTimer = null;
      }
      flushUiPersist();
    }
  }
  if (notify) {
    emitUi();
  }
}

/** Inline boot script: apply `.dark` before paint to avoid FOUC. */
export function themeBootScript(): string {
  return `(function(){try{var k=${JSON.stringify(UI_STORAGE_KEY)};var t=null;var d="quick";var r=localStorage.getItem(k);if(r){var p=JSON.parse(r);if(p&&(p.theme==="light"||p.theme==="dark"))t=p.theme;if(p&&p.conceptDepth==="detailed")d="detailed";}if(t===null)t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";document.documentElement.classList.toggle("dark",t==="dark");document.documentElement.dataset.conceptDepth=d;}catch(e){}})();`;
}
