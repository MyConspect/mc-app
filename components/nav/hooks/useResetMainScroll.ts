"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  handbookMain,
  handbookScrollContainer,
} from "@/components/topic/utils/conceptScroll";

export function useResetMainScroll() {
  const pathname = usePathname() ?? "/";

  useEffect(() => {
    if (window.location.hash) {
      return;
    }
    const main = handbookMain();
    if (main instanceof HTMLElement) {
      main.scrollTop = 0;
    }
    const body = handbookScrollContainer();
    if (body instanceof HTMLElement && body !== main) {
      body.scrollTop = 0;
    }
  }, [pathname]);
}
