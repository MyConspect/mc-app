import type { NavRootSectionId } from "./types";

const STORAGE_KEY = "handbook-nav-root-section";

export function persistNavRootSection(section: NavRootSectionId): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    sessionStorage.setItem(STORAGE_KEY, section);
  } catch {
    /* ignore quota / private mode */
  }
}

export function readPersistedNavRootSection(): NavRootSectionId | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const value = sessionStorage.getItem(STORAGE_KEY);
    return value === "interviews" || value === "conspect" ? value : null;
  } catch {
    return null;
  }
}