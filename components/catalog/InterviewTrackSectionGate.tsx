"use client";

import { usePathname } from "next/navigation";
import { useMemo, type ReactNode } from "react";
import { useHandbookNavSections } from "@/components/nav/context/handbookNavContext";
import {
  HANDBOOK_INDEX_MAIN_PAD,
  HANDBOOK_SUBJECT_INDEX_BODY,
} from "@/components/topic/conceptIndexStyles";
import { isTrackId, type TrackId } from "@/lib/catalog";
import { stripLocalePrefix } from "@/lib/i18n/paths";
import { navTopics } from "@/lib/nav";
import { inferNavRootSection, navGroupsForRootSection } from "@/lib/nav/sections";
import { NavHubBrowseIndex } from "./NavHubBrowseIndex";

export function InterviewTrackSectionGate({
  trackId,
  children,
}: {
  trackId: TrackId;
  children: ReactNode;
}) {
  const pathname = usePathname() ?? "/en";
  const sections = useHandbookNavSections();
  const showInterviews = useMemo(() => {
    const { path } = stripLocalePrefix(pathname);
    const segments = path.slice(1).split("/").filter(Boolean);
    return (
      segments.length === 1 &&
      segments[0] === trackId &&
      inferNavRootSection(pathname) === "interviews"
    );
  }, [pathname, trackId]);

  const items = useMemo(() => {
    if (!showInterviews || !sections || !isTrackId(trackId)) {
      return [];
    }
    const group = navGroupsForRootSection(sections, "interviews").find(
      (entry) => entry.id === trackId,
    );
    if (!group) {
      return [];
    }
    return navTopics([group]).map((topic) => ({
      href: topic.href,
      title: topic.title,
      description: topic.blurb,
    }));
  }, [showInterviews, sections, trackId]);

  if (!showInterviews || items.length === 0) {
    return children;
  }

  return (
    <main
      className={`handbook-subject-main flex min-h-0 w-full max-w-none flex-1 flex-col ${HANDBOOK_INDEX_MAIN_PAD}`}
    >
      <div className={HANDBOOK_SUBJECT_INDEX_BODY}>
        <NavHubBrowseIndex items={items} keyPrefix={`${trackId}-interview`} />
      </div>
    </main>
  );
}