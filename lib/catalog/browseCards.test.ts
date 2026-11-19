import assert from "node:assert/strict";
import test from "node:test";
import {
  SUBJECTS,
  clusterTargetHref,
  getTopic,
  isNavHubTopic,
  navChildBrowseCards,
  subjectClusterCards,
  trackBrowseCards,
  trackLooseBrowseCards,
  trackQuestionSections,
  trackSubjectBrowseBlocks,
  subjectFlatBrowseCards,
} from "@/lib/catalog";

test("subjectClusterCards uses topic title for single-topic cluster items", () => {
  for (const subject of SUBJECTS) {
    const cards = subjectClusterCards(subject);
    for (const { cluster, items } of cards) {
      if (items.length !== 1) {
        continue;
      }
      const topics = cards
        .flatMap((entry) => entry.items)
        .filter((item) => item.href === items[0].href);
      assert.ok(topics.length >= 1);
      assert.ok(
        items[0].description.length > 0,
        `${subject.slug}/${cluster.id}: missing description`,
      );
      assert.notEqual(items[0].title, "");
    }
  }
});

test("navChildBrowseCards lists browser hub children for the hub topic page", () => {
  const hub = getTopic("frontend", "js-browser");
  assert.ok(hub);
  assert.equal(isNavHubTopic(hub), true);
  const cards = navChildBrowseCards(hub);
  assert.equal(cards.length, 8);
  assert.ok(cards.some((card) => card.href === "/frontend/js-events"));
});

test("subjectClusterCards expands nav hub children for the additional cluster", () => {
  const js = SUBJECTS.find((subject) => subject.slug === "javascript");
  assert.ok(js);
  const additional = subjectClusterCards(js).find(
    (entry) => entry.cluster.id === "additional",
  );
  assert.ok(additional);
  assert.equal(additional.items.length, 4);
  assert.ok(
    additional.items.some((item) => item.href === "/frontend/js-import-export"),
  );
  assert.ok(
    additional.items.some((item) => item.href === "/frontend/js-extra"),
  );
  assert.equal(
    clusterTargetHref(js, js.clusters.find((c) => c.id === "additional")!),
    "/frontend/javascript#additional",
  );
});

test("subjectClusterCards expands nav hub children for the browser cluster", () => {
  const js = SUBJECTS.find((subject) => subject.slug === "javascript");
  assert.ok(js);
  const browser = subjectClusterCards(js).find(
    (entry) => entry.cluster.id === "browser",
  );
  assert.ok(browser);
  assert.equal(browser.items.length, 8);
  assert.ok(
    browser.items.some((item) => item.href === "/frontend/js-browser-document"),
  );
  assert.equal(
    clusterTargetHref(js, js.clusters.find((c) => c.id === "browser")!),
    "/frontend/javascript#browser",
  );
});

test("subjectClusterCards expands nav hub children for the core cluster", () => {
  const js = SUBJECTS.find((subject) => subject.slug === "javascript");
  assert.ok(js);
  const core = subjectClusterCards(js).find(
    (entry) => entry.cluster.id === "core",
  );
  assert.ok(core);
  assert.equal(core.items.length, 10);
  assert.ok(core.items.some((item) => item.href === "/frontend/js-core"));
  assert.ok(core.items.some((item) => item.href === "/frontend/js-classes"));
  const hub = getTopic("frontend", "js-core-hub");
  assert.ok(hub);
  assert.equal(isNavHubTopic(hub), true);
  assert.equal(
    clusterTargetHref(js, js.clusters.find((c) => c.id === "core")!),
    "/frontend/javascript#core",
  );
});

test("subjectClusterCards omits interview and tasks clusters from conspect hubs", () => {
  const html = SUBJECTS.find((subject) => subject.slug === "html");
  assert.ok(html);
  const cards = subjectClusterCards(html);
  assert.equal(
    cards.some((entry) => entry.cluster.id === "interview"),
    false,
  );
  assert.equal(
    cards.some((entry) => entry.cluster.id === "tasks"),
    false,
  );
  assert.ok(cards.some((entry) => entry.cluster.id === "additional"));
});

test("trackBrowseCards includes subject and topic blurbs", () => {
  const cards = trackBrowseCards("frontend");
  assert.ok(cards.length > 0);
  for (const card of cards) {
    assert.ok(
      card.description.length > 0,
      `missing description for ${card.title}`,
    );
  }
});

test("trackQuestionSections lifts interview and tasks onto the track", () => {
  const sections = trackQuestionSections("frontend");
  const interview = sections.find((section) => section.id === "interview");
  const tasks = sections.find((section) => section.id === "tasks");
  assert.ok(interview);
  assert.ok(tasks);
  assert.equal(
    interview.items.find((item) => item.href === "/frontend/html-interview")
      ?.title,
    "HTML",
  );
  assert.equal(
    interview.items.find((item) => item.href === "/frontend/vue-interview")
      ?.title,
    "Vue",
  );
  assert.equal(
    interview.items.find((item) => item.href === "/frontend/nuxt-interview")
      ?.title,
    "Nuxt",
  );
  assert.equal(
    interview.items.find((item) => item.href === "/frontend/redux-questions")
      ?.title,
    "Redux",
  );
  assert.equal(tasks.items[0]?.title, "HTML");
  assert.ok(tasks.items.every((item) => item.href.endsWith("-tasks")));
  assert.equal(
    trackBrowseCards("frontend").some((card) => card.title === "Interview"),
    false,
  );
});

test("trackBrowseCards lists Core before HTML on frontend", () => {
  const cards = trackBrowseCards("frontend");
  const coreIndex = cards.findIndex((card) => card.title === "Core");
  const htmlIndex = cards.findIndex((card) => card.title === "HTML");
  assert.ok(coreIndex >= 0, "missing Core subject card");
  assert.ok(htmlIndex >= 0, "missing HTML subject card");
  assert.ok(coreIndex < htmlIndex);
});

test("trackBrowseCards lists subject hubs and loose topics on other", () => {
  const cards = trackBrowseCards("other");
  assert.ok(cards.length >= 7, `expected topics, got ${cards.length}`);
  assert.ok(cards.some((card) => card.title === "Git"));
  assert.ok(cards.some((card) => card.title === "Build & CI"));
  assert.equal(
    cards.some((card) => card.title === "Computer science"),
    false,
  );
});

test("trackBrowseCards lists Core as first computer-science subject", () => {
  const cards = trackBrowseCards("computer-science");
  assert.ok(cards[0]?.title === "Core");
  assert.ok(cards.some((card) => card.title === "Data Structures"));
});

test("trackSubjectBrowseBlocks expands git and build clusters on other", () => {
  const blocks = trackSubjectBrowseBlocks("other");
  assert.equal(blocks.length, 2);
  assert.ok(blocks.some((block) => block.subject.slug === "git"));
  assert.ok(blocks.some((block) => block.subject.slug === "build"));
  const git = blocks.find((block) => block.subject.slug === "git");
  assert.ok(git && git.sections.length >= 2);
});

test("trackSubjectBrowseBlocks lists frontend conspect subjects", () => {
  const blocks = trackSubjectBrowseBlocks("frontend");
  assert.ok(blocks.length >= 8, `expected subjects, got ${blocks.length}`);
  assert.ok(blocks.some((block) => block.subject.slug === "core"));
  assert.ok(blocks.some((block) => block.subject.slug === "html"));
  const core = blocks.find((block) => block.subject.slug === "core");
  assert.ok(core && core.sections.length >= 2);
});

test("trackSubjectBrowseBlocks lists advanced messaging and cloud subjects", () => {
  const blocks = trackSubjectBrowseBlocks("advanced");
  assert.deepEqual(
    blocks.map((block) => block.subject.slug),
    ["message-broker", "cloud"],
  );
  const broker = blocks.find(
    (block) => block.subject.slug === "message-broker",
  );
  assert.ok(broker);
  assert.deepEqual(
    broker.sections.map((section) => section.cluster.title),
    ["Core", "Brokers"],
  );
  const cloud = blocks.find((block) => block.subject.slug === "cloud");
  assert.ok(cloud);
  assert.deepEqual(
    cloud.sections.map((section) => section.cluster.title),
    ["Core", "Providers"],
  );
});

test("trackSubjectBrowseBlocks lists Node.js on the backend track", () => {
  const blocks = trackSubjectBrowseBlocks("backend");
  assert.deepEqual(
    blocks.map((block) => block.subject.slug),
    ["nodejs"],
  );
});

test("trackLooseBrowseCards lists ungrouped other topics", () => {
  const cards = trackLooseBrowseCards("other");
  assert.equal(
    cards.some((card) => card.title === "Computer science"),
    false,
  );
  assert.ok(cards.some((card) => card.title === "VS Code & DevTools"));
  assert.equal(
    cards.some((card) => card.title === "Git"),
    false,
  );
  assert.equal(
    cards.some((card) => card.title === "Interview leftovers"),
    false,
  );
});

test("subjectFlatBrowseCards flattens git clusters into topic links", () => {
  const git = SUBJECTS.find((subject) => subject.slug === "git");
  assert.ok(git);
  const cards = subjectFlatBrowseCards(git);
  assert.ok(cards.some((card) => card.title === "Core"));
  assert.ok(cards.some((card) => card.title === "Branching"));
  assert.equal(
    cards.some((card) => card.title === "Interview"),
    false,
  );
});
