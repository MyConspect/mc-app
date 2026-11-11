"use client";

import { usePathname } from "next/navigation";
import { useMemo, useSyncExternalStore } from "react";
import { resolveConceptId } from "@/lib/nav/conceptHash";
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
  const highlightPathname = pendingPathname || pathname;
  const location = useMemo(() => {
    if (pendingPathname) {
      return { pathname: pendingPathname, hash: pendingHash };
    }
    return handbookLocation(pathname, hash);
  }, [pathname, hash, pendingPathname, pendingHash]);
  const topicConcepts = useTopicNavConcepts();
  const rawConceptId = hashIdFrom(location.hash);
  const resolvedFromTopic = topicConcepts
    ? resolveConceptId(rawConceptId, topicConcepts)
    : "";
  const activeConceptId = resolvedFromTopic || rawConceptId;

  return {
    pathname,
    highlightPathname,
    hash,
    location,
    activeConceptId,
  };
}
