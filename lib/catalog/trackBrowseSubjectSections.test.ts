import assert from "node:assert/strict";
import test from "node:test";
import {
  getSubject,
  subjectClusterCards,
  trackLooseBrowseCards,
} from "@/lib/catalog";
import { localizedClusterSectionsForSubject } from "./localizeSubjectClusters";
import {
  isMergedTrackTopicListSection,
  normalizeTrackBrowseSections,
} from "./trackBrowseSubjectSections";

test("Node.js track browse lists Core, Modules, HTTP, and Additional as bullets", () => {
  const nodejs = getSubject("backend", "nodejs");
  assert.ok(nodejs);
  const sections = localizedClusterSectionsForSubject(
    "en",
    nodejs,
    subjectClusterCards(nodejs),
    { expandTitleTwinTopics: false },
  );
  const normalized = normalizeTrackBrowseSections(nodejs.slug, sections);
  assert.equal(normalized.length, 1);
  assert.equal(normalized[0]?.cluster.title, "");
  assert.deepEqual(
    normalized[0]?.items.map((item) => item.title),
    ["Core", "Modules", "HTTP", "Additional"],
  );
  assert.ok(
    normalized[0]?.items.every((item) => item.href.includes("/backend/")),
  );
});

test("Computer Science track browse lists Core cluster topic under Core subject", () => {
  const core = getSubject("computer-science", "core");
  assert.ok(core);
  const sections = localizedClusterSectionsForSubject(
    "en",
    core,
    subjectClusterCards(core),
    { expandTitleTwinTopics: false },
  );
  const normalized = normalizeTrackBrowseSections(core.slug, sections, {
    clusterLinksOnly: true,
  });
  assert.equal(normalized.length, 1);
  assert.deepEqual(
    normalized[0]?.items.map((item) => item.title),
    ["Computer Science"],
  );
  assert.ok(
    normalized[0]?.items[0]?.href.includes(
      "/computer-science/computer-science",
    ),
  );
});

test("Computer Science track browse lists system-design clusters only", () => {
  const systemDesign = getSubject("computer-science", "system-design");
  assert.ok(systemDesign);
  const sections = localizedClusterSectionsForSubject(
    "en",
    systemDesign,
    subjectClusterCards(systemDesign),
    { expandTitleTwinTopics: false },
  );
  const normalized = normalizeTrackBrowseSections(systemDesign.slug, sections, {
    clusterLinksOnly: true,
  });
  assert.equal(normalized.length, 1);
  assert.deepEqual(
    normalized[0]?.items.map((item) => item.title),
    ["Core", "Architecture", "Principles"],
  );
});

test("HTML track browse lists cluster and Reference section links only (Advanced gold)", () => {
  const html = getSubject("frontend", "html");
  assert.ok(html);
  const sections = localizedClusterSectionsForSubject(
    "en",
    html,
    subjectClusterCards(html),
    { expandTitleTwinTopics: false },
  );
  const normalized = normalizeTrackBrowseSections(html.slug, sections, {
    clusterLinksOnly: true,
    subject: html,
    locale: "en",
  });
  assert.equal(normalized.length, 1);
  assert.ok(isMergedTrackTopicListSection(normalized[0]!));
  assert.deepEqual(
    normalized[0]?.items.map((item) => item.title),
    ["Core", "Document", "Browser", "Additional", "Reference"],
  );
});

test("AI track browse expands Workflow and Engineering hub concepts", () => {
  for (const slug of ["workflow", "engineering"] as const) {
    const subject = getSubject("ai", slug);
    assert.ok(subject);
    const sections = localizedClusterSectionsForSubject(
      "en",
      subject,
      subjectClusterCards(subject),
      { expandTitleTwinTopics: subject.expandTitleTwinOnTrackHub ?? false },
    );
    const normalized = normalizeTrackBrowseSections(subject.slug, sections, {
      clusterLinksOnly: true,
    });
    assert.equal(normalized.length, 1);
    assert.ok(
      (normalized[0]?.items.length ?? 0) > 1,
      `${slug} should list hub concepts on the track index`,
    );
  }
});

test("trackLooseBrowseCards omits grouped AI workflow hubs", () => {
  const loose = trackLooseBrowseCards("ai");
  assert.equal(
    loose.some(
      (card) => card.title === "Workflow" || card.title === "Engineering",
    ),
    false,
  );
});

test("SDLC track browse lists lifecycle topics when cluster title is empty", () => {
  const sdlc = getSubject("ai", "sdlc");
  assert.ok(sdlc);
  const sections = localizedClusterSectionsForSubject(
    "en",
    sdlc,
    subjectClusterCards(sdlc),
    { expandTitleTwinTopics: false },
  );
  const normalized = normalizeTrackBrowseSections(sdlc.slug, sections, {
    clusterLinksOnly: true,
  });
  assert.equal(normalized.length, 1);
  assert.ok(normalized[0]?.items.every((item) => item.title.trim().length > 0));
  assert.ok(normalized[0]?.items.some((item) => item.title === "Agentic SDLC"));
});

test("Database track browse keeps NoSQL multi-topic cluster as its own section", () => {
  const database = getSubject("databases", "database");
  assert.ok(database);
  const sections = localizedClusterSectionsForSubject(
    "en",
    database,
    subjectClusterCards(database),
    { expandTitleTwinTopics: false },
  );
  const normalized = normalizeTrackBrowseSections(database.slug, sections);
  const flat = normalized.find(
    (section) => section.cluster.id === "database-track-topics",
  );
  const nosql = normalized.find((section) => section.cluster.id === "nosql");
  assert.ok(flat);
  assert.deepEqual(
    flat.items.map((item) => item.title),
    ["Core", "SQL", "ORM", "Additional"],
  );
  assert.ok(nosql);
  assert.ok(nosql.items.length > 1);
  assert.ok(nosql.items.some((item) => item.title === "MongoDB"));
});
