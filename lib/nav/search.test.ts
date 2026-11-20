import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  BODY_QUERY_MIN_LENGTH,
  conceptBodySnippet,
  conceptMatchesQuery,
  firstSearchHref,
  searchNav,
} from "./search";
import { searchIndexFor, trigramBodyHits } from "./searchIndex";
import type { NavGroup } from "./types";

const fixtureGroup: NavGroup = {
  id: "other",
  title: "Fixture",
  href: "/en/other",
  entries: [
    {
      kind: "topic",
      topic: {
        slug: "sample",
        href: "/en/other/sample",
        title: "Sample Topic",
        blurb: "Overview of programming paradigms",
        concepts: [
          { id: "title-hit", title: "Programming Basics" },
          {
            id: "body-only",
            title: "Scheduling",
            searchText: "the event loop queues microtasks before macrotasks",
          },
          {
            id: "short-token-body",
            title: "Go runtime",
            searchText: "go routines and channels",
          },
        ],
      },
    },
  ],
};

const titleHit = fixtureGroup.entries[0]!.kind === "topic"
  ? fixtureGroup.entries[0].topic.concepts[0]!
  : (() => {
      throw new Error("fixture topic missing");
    })();

const bodyOnly = fixtureGroup.entries[0]!.kind === "topic"
  ? fixtureGroup.entries[0].topic.concepts[1]!
  : (() => {
      throw new Error("fixture topic missing");
    })();

describe("conceptMatchesQuery (Topics vs Notes)", () => {
  it("matches titles in both modes", () => {
    assert.equal(conceptMatchesQuery(titleHit, "programming", "titles"), true);
    assert.equal(conceptMatchesQuery(titleHit, "programming", "notes"), true);
  });

  it("ignores body text in Topics mode", () => {
    assert.equal(conceptMatchesQuery(bodyOnly, "microtasks", "titles"), false);
  });

  it("matches body text in Notes when query length meets minimum", () => {
    assert.equal(
      conceptMatchesQuery(bodyOnly, "microtasks", "notes"),
      true,
    );
    assert.equal(BODY_QUERY_MIN_LENGTH, 3);
  });

  it("rejects body match in Notes when query is shorter than body minimum", () => {
    assert.equal(conceptMatchesQuery(bodyOnly, "ab", "notes"), false);
    assert.equal(conceptMatchesQuery(bodyOnly, "lo", "notes"), false);
  });

  it("uses the full trimmed query string for nav, not per-token OR", () => {
    assert.equal(
      conceptMatchesQuery(titleHit, "programming para", "titles"),
      false,
    );
    assert.equal(
      conceptMatchesQuery(bodyOnly, "event loop micro", "notes"),
      false,
    );
  });

  it("treats empty query as universal match", () => {
    assert.equal(conceptMatchesQuery(titleHit, "  ", "titles"), true);
  });
});

describe("conceptBodySnippet", () => {
  it("returns null in Topics mode", () => {
    assert.equal(conceptBodySnippet(bodyOnly, "microtasks", "titles"), null);
  });

  it("returns null when the title already matches", () => {
    assert.equal(
      conceptBodySnippet(titleHit, "programming", "notes"),
      null,
    );
  });

  it("returns an excerpt for body-only hits in Notes mode", () => {
    const snippet = conceptBodySnippet(bodyOnly, "microtasks", "notes");
    assert.ok(snippet);
    assert.match(snippet, /microtasks/i);
  });
});

describe("searchNav and firstSearchHref", () => {
  it("filters by title in Topics mode and ignores body-only concepts", () => {
    const result = searchNav([fixtureGroup], "programming", "titles");
    assert.ok(result.groups.length > 0);
    assert.ok(result.firstHref);
    assert.match(result.firstHref, /title-hit/);
    assert.equal(searchNav([fixtureGroup], "microtasks", "titles").firstHref, null);
  });

  it("finds body-only concepts in Notes mode", () => {
    const result = searchNav([fixtureGroup], "microtasks", "notes");
    assert.ok(result.groups.length > 0);
    assert.equal(result.firstHref, "/en/fixture/sample#body-only");
    assert.equal(
      firstSearchHref([fixtureGroup], "microtasks", undefined, "notes"),
      "/en/fixture/sample#body-only",
    );
  });

  it("returns no body jump for short queries in Notes mode", () => {
    assert.equal(searchNav([fixtureGroup], "ab", "notes").firstHref, null);
  });
});

describe("trigramBodyHits", () => {
  it("returns empty when query is shorter than BODY_QUERY_MIN_LENGTH", () => {
    const index = searchIndexFor([fixtureGroup]);
    assert.equal(trigramBodyHits(index, "ab").size, 0);
  });

  it("indexes concept bodies for Notes trigram intersection", () => {
    const index = searchIndexFor([fixtureGroup]);
    const hits = trigramBodyHits(index, "microtasks");
    assert.ok(hits.size >= 1);
  });
});