"use client";

import type { ChromeCopy, NavRootSection } from "@/lib/nav";
import { BookmarksPanel } from "./BookmarksPanel";
import { SectionSwitcher } from "./SectionSwitcher";

export function SidebarNavChrome({
  sections,
  chrome,
  onNavigate,
  className = "",
}: {
  sections: readonly NavRootSection[];
  chrome: ChromeCopy;
  onNavigate?: () => void;
  className?: string;
}) {
  return (
    <div
      data-nav-chrome=""
      className={`bg-(--chrome-surface) px-2 md:pt-3 ${className}`}
    >
      <div className="px-2 py-3 max-md:mb-0 max-md:py-2.5 md:mb-3">
        <SectionSwitcher sections={sections} chrome={chrome} />
      </div>
      <BookmarksPanel chrome={chrome} onNavigate={onNavigate} />
    </div>
  );
}
