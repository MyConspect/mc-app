"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  inferNavRootSection,
  sectionSwitchHref,
  type ChromeCopy,
  type NavRootSection,
  type NavRootSectionId,
} from "@/lib/nav";
import { persistNavRootSection } from "@/lib/nav/rootSectionPreference";
import { useHandbookLocation } from "../hooks/useHandbookLocation";
import { dispatchSidebarCollapseTracks } from "../hooks/useSidebarOpen";
import { queueHandbookHref } from "../utils/hash";

export function SectionSwitcher({
  sections,
  chrome,
}: {
  sections: readonly NavRootSection[];
  chrome: ChromeCopy;
}) {
  const pathname = usePathname() ?? "/en";
  const { highlightPathname } = useHandbookLocation();
  const router = useRouter();
  const pathForSection = highlightPathname || pathname;
  const inferredSection = inferNavRootSection(pathForSection);
  const [optimisticSection, setOptimisticSection] = useState<{
    section: NavRootSectionId;
    fromPath: string;
  } | null>(null);

  const activeSection =
    optimisticSection !== null && optimisticSection.fromPath === pathname
      ? optimisticSection.section
      : inferredSection;

  const onSelectSection = (sectionId: NavRootSectionId) => {
    if (sectionId === activeSection) {
      return;
    }
    dispatchSidebarCollapseTracks();
    persistNavRootSection(sectionId);
    setOptimisticSection({ section: sectionId, fromPath: pathname });
    const href = sectionSwitchHref(sections, pathForSection, sectionId);
    queueHandbookHref(href, pathname);
    if (href === pathname || href === pathForSection) {
      router.refresh();
      return;
    }
    router.push(href, { scroll: false });
  };

  return (
    <div
      role="radiogroup"
      aria-label={chrome.sectionNav}
      className="flex h-7 rounded-md bg-zinc-100 p-0.5 md:h-8 dark:bg-zinc-800"
    >
      <SectionButton
        checked={activeSection === "conspect"}
        hint={chrome.conspectNavHint}
        label={chrome.conspectNav}
        value="conspect"
        onSelect={onSelectSection}
      />
      <SectionButton
        checked={activeSection === "interviews"}
        hint={chrome.interviewsNavHint}
        label={chrome.interviewsNav}
        value="interviews"
        onSelect={onSelectSection}
      />
    </div>
  );
}

function SectionButton({
  checked,
  hint,
  label,
  value,
  onSelect,
}: {
  checked: boolean;
  hint: string;
  label: string;
  value: NavRootSectionId;
  onSelect: (sectionId: NavRootSectionId) => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      aria-label={label}
      title={`${label} — ${hint}`}
      data-nav-section={value}
      onClick={() => onSelect(value)}
      className={
        checked
          ? "inline-flex min-w-0 flex-1 cursor-pointer items-center justify-center truncate rounded bg-white px-2 text-xs font-medium text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-50"
          : "inline-flex min-w-0 flex-1 cursor-pointer items-center justify-center truncate rounded px-2 text-xs font-medium text-zinc-600 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100"
      }
    >
      {label}
    </button>
  );
}
