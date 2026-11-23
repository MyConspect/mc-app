import { getTopic, isTrackId } from "@/lib/catalog";
import { isInterviewSectionTopic } from "@/lib/nav/navUtils";
import { splitHref } from "@/lib/nav/search";
import type { NavRootSectionId } from "@/lib/nav/types";
import type { Locale } from "./locales";
import { stripLocalePrefix } from "./paths";

export const SECTION_PATH_SLUGS: Record<NavRootSectionId, string> = {
  conspect: "conspect",
  interviews: "interviews",
};

export function isNavSectionSlug(value: string): value is NavRootSectionId {
  return value === "conspect" || value === "interviews";
}

export function sectionHomeHref(
  locale: Locale,
  sectionId: NavRootSectionId,
): string {
  return `/${locale}/${SECTION_PATH_SLUGS[sectionId]}`;
}

export function pathNavRootSection(path: string): NavRootSectionId | null {
  if (path === "/conspect") {
    return "conspect";
  }
  if (path === "/interviews") {
    return "interviews";
  }
  return null;
}

export function isSectionHomePathname(pathname: string): boolean {
  const { path } = stripLocalePrefix(pathname);
  return pathNavRootSection(path) !== null;
}

export function peelSectionPrefix(path: string): {
  section: NavRootSectionId | null;
  rest: string;
} {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const segments = normalized.slice(1).split("/").filter(Boolean);
  if (segments.length === 0) {
    return { section: null, rest: "/" };
  }
  if (isNavSectionSlug(segments[0])) {
    const rest =
      segments.length === 1 ? "/" : `/${segments.slice(1).join("/")}`;
    return { section: segments[0], rest };
  }
  return { section: null, rest: normalized };
}

/** Path with locale and no section segment — for matching and catalog routes. */
export function handbookLogicalPathname(pathname: string): string {
  const { pathname: pathOnly, hash } = splitHref(pathname);
  const { locale, path } = stripLocalePrefix(pathOnly);
  const { rest } = peelSectionPrefix(path);
  const suffix = rest === "/" ? "" : rest;
  return `/${locale}${suffix}${hash}`;
}

export function withHandbookSection(
  href: string,
  sectionId: NavRootSectionId,
): string {
  const { pathname, hash } = splitHref(href);
  const { locale, path } = stripLocalePrefix(pathname);
  const { rest } = peelSectionPrefix(path);
  if (rest === "/instructions" || rest.startsWith("/instructions")) {
    return `/${locale}${rest}${hash}`;
  }
  if (rest === "/" || pathNavRootSection(rest)) {
    return `${sectionHomeHref(locale, sectionId)}${hash}`;
  }
  const core = rest.startsWith("/") ? rest : `/${rest}`;
  return `/${locale}/${SECTION_PATH_SLUGS[sectionId]}${core}${hash}`;
}

export function inferSectionForLegacyPath(
  pathname: string,
): NavRootSectionId | null {
  const { path } = stripLocalePrefix(pathname);
  const { section, rest } = peelSectionPrefix(path);
  if (section) {
    return null;
  }
  if (path === "/" || path === "/instructions" || pathNavRootSection(path)) {
    return null;
  }
  const segments = rest.slice(1).split("/").filter(Boolean);
  const trackSlug = segments[0];
  const topicSlug = segments[1];
  if (!trackSlug || !isTrackId(trackSlug)) {
    return null;
  }
  if (topicSlug) {
    const topic = getTopic(trackSlug, topicSlug);
    if (topic && isInterviewSectionTopic(topic)) {
      return "interviews";
    }
    return "conspect";
  }
  return "conspect";
}