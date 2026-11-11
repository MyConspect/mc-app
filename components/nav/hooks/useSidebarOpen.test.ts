import assert from "node:assert/strict";
import test from "node:test";
import type { NavRootSection } from "@/lib/nav";
import { queueHandbookHref, takePendingHashForPath } from "../utils/hash";
import {
  activeTrackIdForNavPath,
  consumeCollapseTracksOnSectionChange,
  dispatchSidebarCollapseTracks,
  sidebarNavLocation,
} from "./useSidebarOpen";

const sections: readonly NavRootSection[] = [
  {
    id: "conspect",
    title: "Conspect",
    groups: [
      {
        id: "frontend",
        title: "Frontend",
        href: "/en/frontend",
        entries: [],
      },
      {
        id: "ai",
        title: "AI",
        href: "/en/ai",
        entries: [],
      },
      {
        id: "backend",
        title: "Backend",
        href: "/en/backend",
        entries: [],
      },
    ],
  },
  {
    id: "interviews",
    title: "Interviews",
    groups: [
      {
        id: "backend",
        title: "Backend",
        href: "/en/backend",
        entries: [
          {
            kind: "topic",
            topic: {
              slug: "nodejs-interview",
              href: "/en/backend/nodejs-interview",
              title: "Node.js",
              blurb: "",
              concepts: [],
            },
          },
        ],
      },
    ],
  },
];

test("queued track change ignores the previous track hash", () => {
  queueHandbookHref("/en/backend");
  try {
    const nav = sidebarNavLocation(sections, "/en/frontend", "#interview");
    assert.equal(nav.pathname, "/en/backend");
    assert.equal(nav.hash, "");
    assert.equal(nav.location.clusterKey, null);
    assert.equal(activeTrackIdForNavPath(sections, nav.pathname), "backend");
  } finally {
    takePendingHashForPath("/en/backend");
  }
});

test("active track follows pending path while router pathname is stale", () => {
  queueHandbookHref("/en/ai");
  try {
    assert.equal(activeTrackIdForNavPath(sections, "/en/frontend"), "frontend");
    const nav = sidebarNavLocation(sections, "/en/frontend", "");
    assert.equal(activeTrackIdForNavPath(sections, nav.pathname), "ai");
  } finally {
    takePendingHashForPath("/en/ai");
  }
});

test("an interview topic does not open a cluster", () => {
  const nav = sidebarNavLocation(sections, "/en/backend/nodejs-interview", "");
  assert.equal(nav.location.clusterKey, null);
});

test("section radio collapse is consumed once and does not leak to the next nav", () => {
  consumeCollapseTracksOnSectionChange();
  dispatchSidebarCollapseTracks();
  assert.equal(consumeCollapseTracksOnSectionChange(), true);
  assert.equal(consumeCollapseTracksOnSectionChange(), false);
});
