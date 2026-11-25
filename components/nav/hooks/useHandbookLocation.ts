"use client";

import { usePathname } from "next/navigation";
import { useLayoutEffect, useMemo, useSyncExternalStore } from "react";
import { handbookLogicalPathname } from "@/lib/i18n/sectionPaths";
import { shouldUsePendingNavPath } from "@/lib/nav/pendingHighlight";
import { activeNavHashId } from "@/lib/nav/activeNavHashId";
import { hashIdFrom } from "@/lib/nav/navUtils";
import { useTopicNavConcepts } from "@/components/topic/context/TopicNavConceptsContext";
import {
  getHash,
  getPendingHash,
  getPendingPathname,
  getServerHash,
  getServerPendingHash,
  getServerPendingPathname,
  handbookLocation,
  subscribeHash,
  subscribePendingPath,
  clearPendingPathHash,
} from "../utils/hash";

export function useHandbookLocation() {
  const pathname = usePathname() ?? "/";
  const hash = useSyncExternalStore(subscribeHash, getHash, getServerHash);
  const pendingPathname = useSyncExternalStore(
    subscribePendingPath,
    getPendingPathname,
    getServerPendingPathname,
  );
  const pendingHash = useSyncExternalStore(
    subscribePendingPath,
    getPendingHash,
    getServerPendingHash,
  );
  const usePending = shouldUsePendingNavPath(pathname, pendingPathname);

  useLayoutEffect(() => {
    if (!pendingPathname) {
      return;
    }
    if (
      handbookLogicalPathname(pendingPathname) ===
        handbookLogicalPathname(pathname) &&
      hashIdFrom(pendingHash).length > 0 &&
      hashIdFrom(pendingHash) === hashIdFrom(hash)
    ) {
      clearPendingPathHash();
      return;
    }
    if (!usePending) {
      clearPendingPathHash();
    }
  }, [pathname, hash, pendingPathname, pendingHash, usePending]);

  const highlightPathname = usePending ? pendingPathname : pathname;
  const location = useMemo(() => {
    if (usePending) {
      return { pathname: pendingPathname, hash: pendingHash };
    }
    return handbookLocation(pathname, hash);
  }, [pathname, hash, pendingPathname, pendingHash, usePending]);
  const topicConcepts = useTopicNavConcepts();
  /** Pending nav can omit hash while the committed URL still has `#concept` — keep ancestor highlights. */
  const rawConceptId = hashIdFrom(
    hashIdFrom(location.hash).length > 0 ? location.hash : hash,
  );
  const activeConceptId = activeNavHashId(rawConceptId, topicConcepts);

  return {
    pathname,
    highlightPathname,
    hash,
    location,
    activeConceptId,
  };
}
