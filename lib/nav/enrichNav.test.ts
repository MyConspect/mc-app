import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { handbookNavSections } from "./handbook";
import { enrichNavSections, mergeTopicConcepts } from "./enrichNav";
import { sectionSwitchHref } from "./sections";
import { trackIndexCacheKey } from "./trackIndexCache";
import type { NavGroup, NavRootSection, NavTopic } from "./types";

describe("enrichNavSections", () => {
  it("keeps conspect and interview section trees separate", () => {
    const structure = handbookNavSections("en");
    const loaded = new Map([
      [
        "frontend",
        structure.flatMap((section) =>
          section.groups.filter((group) => group.id === "frontend"),
        ),
      ],
    ]);

    const enriched = enrichNavSections(structure, loaded);
    const conspectFrontend = enriched
      .find((section) => section.id === "conspect")
      ?.groups.find((group) => group.id === "frontend");
    const interviewsFrontend = enriched
      .find((section) => section.id === "interviews")
      ?.groups.find((group) => group.id === "frontend");

    assert.ok(conspectFrontend);
    assert.ok(interviewsFrontend);
    assert.notDeepEqual(conspectFrontend.entries, interviewsFrontend.entries);

    assert.equal(
      sectionSwitchHref(enriched, "/en/frontend/html-interview", "conspect"),
      "/en/conspect",
    );
    assert.equal(
      sectionSwitchHref(enriched, "/en/frontend/css", "interviews"),
      "/en/interviews",
    );
  });

  it("appends shell outline concepts missing from a stale search index", () => {
    const structure = handbookNavSections("en");
    const basicsHref = "/en/frontend/ts-basics";
    const shell = structure.flatMap((section) => section.groups);
    const basicsTopic = shell
      .flatMap((group) => group.entries)
      .find(
        (entry) =>
          entry.kind === "subject" &&
          entry.subject.clusters.some((cluster) =>
            cluster.topics.some((topic) => topic.href === basicsHref),
          ),
      );
    assert.ok(basicsTopic?.kind === "subject");

    const topicInShell = basicsTopic.subject.clusters
      .flatMap((cluster) => cluster.topics)
      .find((topic) => topic.href === basicsHref);
    assert.ok(topicInShell);
    const modern = topicInShell.concepts.find(
      (concept) => concept.id === "modern-typescript",
    );
    assert.ok(modern);

    const staleRich = {
      ...topicInShell,
      concepts: topicInShell.concepts.filter(
        (concept) => concept.id !== "modern-typescript",
      ),
    };
    const loaded = new Map([
      [
        "frontend",
        [
          {
            id: "frontend" as const,
            title: "Frontend",
            href: "/en/frontend",
            entries: [{ kind: "topic" as const, topic: staleRich }],
          },
        ],
      ],
    ]);

    const enriched = enrichNavSections(structure, loaded);
    const enrichedBasics = enriched
      .flatMap((section) => section.groups)
      .flatMap((group) => group.entries)
      .flatMap((entry) =>
        entry.kind === "subject"
          ? entry.subject.clusters.flatMap((cluster) => cluster.topics)
          : entry.kind === "topic"
            ? [entry.topic]
            : [],
      )
      .find((topic) => topic.href === basicsHref);

    assert.ok(
      enrichedBasics?.concepts.some((c) => c.id === "modern-typescript"),
    );
  });

  it("keeps concept group from the rich index when the shell outline lacks it", () => {
    const merged = mergeTopicConcepts(
      [{ id: "flexbox", title: "Flexbox" }],
      [{ id: "flexbox", title: "Flexbox", group: "Flexbox" }],
    );
    assert.equal(merged[0]?.group, "Flexbox");
  });
});

describe("mergeTopicConcepts", () => {
  it("preserves group when search text is unchanged", () => {
    const merged = mergeTopicConcepts(
      [{ id: "a", title: "A", searchText: "alpha" }],
      [{ id: "a", title: "A", searchText: "alpha", group: "Section A" }],
    );
    assert.equal(merged[0]?.group, "Section A");
  });

  it("returns the same list when the index adds nothing", () => {
    const base = [
      { id: "a", title: "A", searchText: "alpha", group: "Section A" },
    ];
    assert.equal(
      mergeTopicConcepts(base, [
        { id: "a", title: "A", searchText: "alpha", group: "Section A" },
      ]),
      base,
    );
  });
});

function shellTopic(href: string, searchText?: string): NavTopic {
  return {
    slug: href,
    href,
    title: href,
    blurb: "",
    concepts: [
      {
        id: "concept",
        title: "Concept",
        ...(searchText ? { searchText } : {}),
      },
    ],
  };
}

function shellGroup(id: NavGroup["id"], topic: NavTopic): NavGroup {
  return {
    id,
    title: id,
    href: `/${id}`,
    entries: [{ kind: "topic", topic }],
  };
}

describe("enrichNavSections identity", () => {
  const kept = shellTopic("/en/frontend/kept");
  const changed = shellTopic("/en/frontend/changed");
  const keptGroup = shellGroup("backend", kept);
  const changedGroup = shellGroup("frontend", changed);
  const structure: readonly NavRootSection[] = [
    {
      id: "conspect",
      title: "Conspect",
      groups: [keptGroup, changedGroup],
    },
  ];

  it("keeps groups whose concepts did not change", () => {
    const loaded = new Map([
      [
        trackIndexCacheKey("en", "frontend"),
        [
          shellGroup(
            "frontend",
            shellTopic("/en/frontend/changed", "body text"),
          ),
        ],
      ],
      [
        trackIndexCacheKey("ru", "frontend"),
        [shellGroup("frontend", shellTopic("/en/frontend/kept", "russian"))],
      ],
    ]);

    const enriched = enrichNavSections(structure, loaded, "en");
    assert.equal(enriched[0]?.groups[0], keptGroup);
    assert.notEqual(enriched[0]?.groups[1], changedGroup);
    const enrichedTopic = enriched[0]?.groups[1]?.entries[0];
    assert.equal(enrichedTopic?.kind, "topic");
    if (enrichedTopic?.kind === "topic") {
      assert.equal(enrichedTopic.topic.concepts[0]?.searchText, "body text");
    }
    assert.equal(kept.concepts[0]?.searchText, undefined);
  });

  it("merges note text into nested topics without copying the parent concepts", () => {
    const nested = shellTopic("/en/frontend/nested");
    const parent: NavTopic = {
      ...shellTopic("/en/frontend/parent"),
      nestedTopics: [nested],
    };
    const group = shellGroup("frontend", parent);
    const structure: readonly NavRootSection[] = [
      { id: "conspect", title: "Conspect", groups: [group] },
    ];
    const loaded = new Map([
      [
        trackIndexCacheKey("en", "frontend"),
        [
          shellGroup("frontend", {
            ...shellTopic("/en/frontend/parent"),
            nestedTopics: [shellTopic("/en/frontend/nested", "nested body")],
          }),
        ],
      ],
    ]);

    const enriched = enrichNavSections(structure, loaded, "en");
    const entry = enriched[0]?.groups[0]?.entries[0];
    assert.equal(entry?.kind, "topic");
    if (entry?.kind !== "topic") {
      return;
    }
    assert.equal(entry.topic.concepts, parent.concepts);
    assert.equal(
      entry.topic.nestedTopics?.[0]?.concepts[0]?.searchText,
      "nested body",
    );
    assert.notEqual(entry.topic, parent);
  });
});
