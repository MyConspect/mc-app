"use client";

import { useLayoutEffect, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { resetHandbookReadingScroll } from "@/components/topic/utils/conceptScroll";
import {
  getHash,
  getServerHash,
  subscribeHash,
} from "../utils/hash";

export function useResetMainScroll() {
  const pathname = usePathname() ?? "/";
  const hash = useSyncExternalStore(subscribeHash, getHash, getServerHash);

  useLayoutEffect(() => {
    resetHandbookReadingScroll();
  }, [pathname, hash]);
}
