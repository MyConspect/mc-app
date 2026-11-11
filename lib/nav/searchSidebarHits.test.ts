import assert from "node:assert/strict";
import test from "node:test";
import { handbookNavSections } from "./handbook";
import { navGroupsForRootSection } from "./sections";
import { navTopics } from "./search";
import {
  collectGroupSearchHits,
  collectVisibleGroupSearchHits,
  SIDEBAR_SEARCH_HIT_CAP,
} from "./searchSidebarHits";
import type { NavGroup } from "./types";

const frontendGroup: NavGroup = {
  id: "frontend",
  title: "Frontend",
  href: "/en/frontend",
  entries: [
    {
      kind: "subject",
      subject: {
        slug: "javascript",
        href: "/en/frontend/javascript",
        title: "JavaScript",
        blurb: "",
        clusters: [
          {
            id: "core",
            title: "Core",
            href: "/en/frontend/javascript#core",
            topics: [
              {
                slug: "js-language",
                href: "/en/frontend/js-language",
                title: "Language",
                blurb: "",
                concepts: [
                  { id: "solid-classes", title: "SOLID in Classes" },
                  { id: "solid-functions", title: "SOLID in Functions" },
                ],
              },
            ],
          },
        ],
      },
    },
    {
      kind: "subject",
      subject: {
        slug: "react",
        href: "/en/frontend/react",
        title: "React",
        blurb: "",
        clusters: [
          {
            id: "core",
            title: "Core",
            href: "/en/frontend/react#core",
            topics: [
              {
                slug: "react-basics",
                href: "/en/frontend/react-basics",
                title: "Basics",
                blurb: "",
                concepts: [{ id: "solid-react", title: "SOLID in React" }],
              },
            ],
          },
        ],
      },
    },
  ],
};

test("collectGroupSearchHits returns a flat list of matching concepts", () => {
  const hits = collectGroupSearchHits(frontendGroup, "solid", "titles");
  assert.equal(hits.length, 3);
  assert.deepEqual(
    hits.map((hit) => hit.concept.title),
    ["SOLID in Classes", "SOLID in Functions", "SOLID in React"],
  );
  assert.equal(hits[0]?.concept.title, "SOLID in Classes");
  assert.equal(hits[2]?.concept.title, "SOLID in React");
});

test("collectGroupSearchHits keeps overview sections when the topic title matches", () => {
  const group: NavGroup = {
    id: "frontend",
    title: "Frontend",
    href: "/en/frontend",
    entries: [
      {
        kind: "subject",
        subject: {
          slug: "javascript",
          href: "/en/frontend/javascript",
          title: "JavaScript",
          blurb: "",
          clusters: [
            {
              id: "async",
              title: "Async",
              href: "/en/frontend/javascript#async",
              topics: [
                {
                  slug: "js-async-event-loop",
                  href: "/en/frontend/js-async-event-loop",
                  title: "Event Loop",
                  blurb: "Call stack, microtasks, macrotasks.",
                  concepts: [
                    { id: "event-loop", title: "Event loop overview" },
                    { id: "call-stack", title: "Call stack" },
                  ],
                },
              ],
            },
          ],
        },
      },
    ],
  };

  const hits = collectGroupSearchHits(group, "event loop", "titles");
  assert.equal(hits.length, 1);
  assert.equal(hits[0]?.topic.slug, "js-async-event-loop");
  assert.equal(hits[0]?.concept.title, "Event loop overview");
});

test("collectGroupSearchHits drops a title twin when a distinct sibling also matches", () => {
  const group: NavGroup = {
    id: "frontend",
    title: "Frontend",
    href: "/en/frontend",
    entries: [
      {
        kind: "topic",
        topic: {
          slug: "ts-enums",
          href: "/en/frontend/ts-enums",
          title: "Enums",
          blurb: "Numeric and string enums.",
          concepts: [
            { id: "enums", title: "Enums" },
            { id: "enums-fresher", title: "Enums (fresher)" },
          ],
        },
      },
    ],
  };

  const hits = collectGroupSearchHits(group, "enums", "titles");
  assert.deepEqual(
    hits.map((hit) => hit.concept.title),
    ["Enums (fresher)"],
  );
});

test("collectGroupSearchHits keeps topics when the only match repeats the topic title", () => {
  const group: NavGroup = {
    id: "frontend",
    title: "Frontend",
    href: "/en/frontend",
    entries: [
      {
        kind: "topic",
        topic: {
          slug: "js-variables",
          href: "/en/frontend/js-variables",
          title: "Variables",
          blurb: "var, let, const, and scope.",
          concepts: [{ id: "variables", title: "Variables" }],
        },
      },
    ],
  };

  const hits = collectGroupSearchHits(group, "variables", "titles");
  assert.equal(hits.length, 1);
  assert.equal(hits[0]?.topic.slug, "js-variables");
  assert.equal(hits[0]?.concept.title, "Variables");
});

test("title-shaped lone concept matches stay searchable across conspect", () => {
  const groups = navGroupsForRootSection(handbookNavSections("en"), "conspect");
  const topics = navTopics(groups);
  const missing: string[] = [];

  for (const topic of topics) {
    if (topic.concepts.length === 0) {
      continue;
    }
    const query = topic.title.trim().toLowerCase();
    const matched = topic.concepts.filter((concept) =>
      concept.title.toLowerCase().includes(query),
    );
    if (matched.length !== 1) {
      continue;
    }
    const only = matched[0];
    const topicKey = topic.title.trim().toLowerCase();
    const conceptKey = only.title.trim().toLowerCase();
    const legacyRedundant =
      topicKey === conceptKey ||
      conceptKey.startsWith(`${topicKey} `) ||
      topicKey.startsWith(`${conceptKey} `);
    if (!legacyRedundant) {
      continue;
    }

    const group = groups.find((candidate) =>
      navTopics([candidate]).some((item) => item.slug === topic.slug),
    );
    if (!group) {
      missing.push(`${topic.slug} (no group)`);
      continue;
    }
    const hits = collectGroupSearchHits(group, query, "titles");
    if (!hits.some((hit) => hit.topic.slug === topic.slug)) {
      missing.push(topic.slug);
    }
  }

  assert.deepEqual(missing, []);
});

test("collectVisibleGroupSearchHits caps a track and counts the rest", () => {
  const concepts = Array.from({ length: SIDEBAR_SEARCH_HIT_CAP + 5 }, (_, index) => ({
    id: `alpha-${index}`,
    title: `Alpha ${index}`,
  }));
  const group: NavGroup = {
    id: "frontend",
    title: "Frontend",
    href: "/en/frontend",
    entries: [
      {
        kind: "topic",
        topic: {
          slug: "alpha",
          href: "/en/frontend/alpha",
          title: "Reference",
          blurb: "",
          concepts,
        },
      },
    ],
  };

  const visible = collectVisibleGroupSearchHits(group, "alpha", "titles");
  assert.equal(visible.hits.length, SIDEBAR_SEARCH_HIT_CAP);
  assert.equal(visible.remaining, 5);
  assert.equal(
    collectGroupSearchHits(group, "alpha", "titles").length,
    SIDEBAR_SEARCH_HIT_CAP + 5,
  );
});

test("collectGroupSearchHits matches note bodies from the search index", () => {
  const group: NavGroup = {
    id: "frontend",
    title: "Frontend",
    href: "/en/frontend",
    entries: [
      {
        kind: "topic",
        topic: {
          slug: "loops",
          href: "/en/frontend/loops",
          title: "Timers",
          blurb: "",
          concepts: [
            {
              id: "event-loop",
              title: "Scheduling",
              searchText: "the event loop queues microtasks",
            },
          ],
        },
      },
    ],
  };

  const hits = collectGroupSearchHits(group, "microtasks", "notes");
  assert.equal(hits.length, 1);
  assert.equal(hits[0]?.concept.id, "event-loop");
  assert.match(hits[0]?.snippet ?? "", /microtasks/);
});

test("collectGroupSearchHits searches nested module topics", () => {
  const groups = navGroupsForRootSection(handbookNavSections("en"), "conspect");
  const frontend = groups.find((group) => group.id === "frontend");
  assert.ok(frontend);

  const hits = collectGroupSearchHits(frontend, "export and import", "titles");
  assert.ok(
    hits.some((hit) => hit.topic.slug === "js-import-export"),
    "expected js-import-export in search hits",
  );
});
