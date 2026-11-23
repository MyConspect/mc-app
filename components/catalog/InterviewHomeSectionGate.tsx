"use client";

import { usePathname } from "next/navigation";
import { useMemo, type ReactNode } from "react";
import { useHandbookNavSections } from "@/components/nav/context/handbookNavContext";
import {
  HANDBOOK_INDEX_MAIN_PAD,
  HANDBOOK_SUBJECT_INDEX_BODY,
} from "@/components/topic/conceptIndexStyles";
import { TRACKS } from "@/lib/catalog";
import { catalogBlurb } from "@/lib/i18n/catalog";
import { localeFromPathname, stripLocalePrefix } from "@/lib/i18n/paths";
import { pathNavRootSection } from "@/lib/i18n/sectionPaths";
import { groupNavigateHref, navGroupsForRootSection } from "@/lib/nav/sections";
import { withHandbookSection } from "@/lib/i18n/sectionPaths";
import { NavHubBrowseIndex } from "./NavHubBrowseIndex";

export function InterviewHomeSectionGate({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "/en";
  const sections = useHandbookNavSections();
  const showInterviews = useMemo(() => {
    const { path } = stripLocalePrefix(pathname);
    return pathNavRootSection(path) === "interviews";
  }, [pathname]);

  const items = useMemo(() => {
    if (!showInterviews || !sections) {
      return [];
    }
    const locale = localeFromPathname(pathname);
    return navGroupsForRootSection(sections, "interviews").map((group) => {
      const track = TRACKS.find((entry) => entry.id === group.id);
      return {
        href: withHandbookSection(
          groupNavigateHref(group, "interviews"),
          "interviews",
        ),
        title: group.title,
        description: track
          ? catalogBlurb(locale, track.description)
          : "",
      };
    });
  }, [showInterviews, sections, pathname]);

  if (!showInterviews || items.length === 0) {
    return children;
  }

  return (
    <main
      className={`handbook-subject-main flex min-h-0 w-full max-w-none flex-1 flex-col ${HANDBOOK_INDEX_MAIN_PAD}`}
    >
      <div className={HANDBOOK_SUBJECT_INDEX_BODY}>
        <NavHubBrowseIndex items={items} keyPrefix="home-interview-track" />
      </div>
    </main>
  );
}