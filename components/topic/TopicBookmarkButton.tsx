"use client";

import { usePathname } from "next/navigation";
import { BookmarkButton } from "@/components/nav/ui/BookmarkButton";
import type { ChromeCopy } from "@/lib/nav";

export function TopicBookmarkButton({
  title,
  chrome,
  conceptId,
  size = "lg",
  className,
  revealOnHover = false,
}: {
  title: string;
  chrome: ChromeCopy;
  conceptId?: string;
  size?: "md" | "lg";
  className?: string;
  revealOnHover?: boolean;
}) {
  const pathname = usePathname() ?? "/";

  return (
    <BookmarkButton
      pathname={pathname}
      title={title}
      conceptId={conceptId}
      chrome={chrome}
      size={size}
      className={className}
      revealOnHover={revealOnHover}
    />
  );
}
