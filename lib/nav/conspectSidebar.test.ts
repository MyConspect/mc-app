import assert from "node:assert/strict";
import test from "node:test";
import { subjectsForTrack } from "@/lib/catalog";
import { conceptGroupSectionDomId } from "./conceptGroupSection";
import { handbookNavSections } from "./handbook";
import { groupNavigateHref } from "./sections";
import {
  conspectClusterExpandsInSidebar,
  conspectClusterLeavesInSidebar,
  conspectSingleTopicClusterExpandsInSidebar,
  conspectSubjectHubSectionWithConcepts,
  navSidebarSchema,
} from "./conspectSidebar";
import { isRedundantSubjectTopicNavRow } from "./navUtils";

const GOLD_TRACK = "computer-science" as const;

/** Tracks that mirror CS: track row → subject rows (not flat topic rows at L2). */
const MULTI_SUBJECT_CONSPECT_TRACKS = [
  "computer-science",
  "frontend",
  "backend",
  "advanced",
] as const;

function conspectGroup(trackId: string) {
  const conspect = handbookNavSections("en").find(
    (section) => section.id === "conspect",
  );
  assert.ok(conspect);
  const group = conspect.groups.find((item) => item.id === trackId);
  assert.ok(group, trackId);
  return group;
}

function subjectInGroup(trackId: string, subjectSlug: string) {
  const group = conspectGroup(trackId);
  const entry = group.entries.find(
    (item) => item.kind === "subject" && item.subject.slug === subjectSlug,
  );
  assert.equal(entry?.kind, "subject");
  if (entry?.kind !== "subject") {
    return undefined;
  }
  return entry.subject;
}

test("web-api subject uses flatNav for hub topic siblings", () => {
  const web = subjectInGroup("frontend", "web-api");
  assert.ok(web);
  assert.equal(web.flatNav, true);
  const topicTitles = web.clusters.flatMap((cluster) => {
    if ((cluster.nestedClusters?.length ?? 0) > 0) {
      return cluster.nestedClusters!.map((nested) => nested.title);
    }
    return cluster.topics.map((topic) => topic.title);
  });
  assert.deepEqual(topicTitles, [
    "Internet",
    "HTTP",
    "Performance",
    "API styles",
    "Auth & storage",
    "10. Protocols",
    "11. Real-time & rendering",
    "12. Types of web apps",
  ]);
});

test("conspect sidebar schema is two-level cluster leaves", () => {
  assert.deepEqual(navSidebarSchema("conspect"), {
    mode: "two-level",
    clusterLeaves: true,
    trackHeader: true,
    hubSectionConcepts: false,
  });
  assert.deepEqual(navSidebarSchema("interviews"), { mode: "topic-tree" });
  assert.equal(conspectClusterLeavesInSidebar("conspect"), true);
  assert.equal(conspectClusterLeavesInSidebar("interviews"), false);
});

test("single-subject track Databases promotes clusters like Testing", () => {
  const testing = conspectGroup("testing");
  const databases = conspectGroup("databases");
  assert.equal(
    databases.entries.every((entry) => entry.kind === "cluster"),
    true,
  );
  assert.equal(
    databases.entries.some((entry) => entry.kind === "subject"),
    false,
  );
  assert.equal(
    testing.entries.every((entry) => entry.kind === "cluster"),
    true,
  );
  assert.ok(
    databases.entries.some(
      (entry) => entry.kind === "cluster" && entry.cluster.id === "core",
    ),
  );
});

test("multi-subject conspect tracks share CS-shaped sidebar entries", () => {
  const conspect = handbookNavSections("en").find(
    (section) => section.id === "conspect",
  );
  assert.ok(conspect);
  const gold = conspectGroup(GOLD_TRACK);

  for (const trackId of MULTI_SUBJECT_CONSPECT_TRACKS) {
    const group = conspectGroup(trackId);
    assert.ok(group.href.endsWith(`/${trackId}`), trackId);
    assert.ok(
      group.entries.every((entry) => entry.kind === "subject"),
      `${trackId}: conspect track rows should be subjects only`,
    );
    assert.ok(
      group.entries.length >= 1,
      `${trackId}: expected at least one subject row`,
    );
    assert.ok(
      subjectsForTrack(trackId).length >= 1,
      `${trackId}: catalog subjects`,
    );
  }

  const csSubjects = gold.entries.map(
    (entry) => entry.kind === "subject" && entry.subject.slug,
  );
  assert.deepEqual(csSubjects, [
    "core",
    "data-structures",
    "algorithms",
    "system-design",
  ]);
});

test("spot-check hubs expose cluster leaves like Computer Science", () => {
  const core = subjectInGroup("frontend", "core");
  assert.ok(core);
  const platform = core.clusters.find((cluster) => cluster.id === "platform");
  assert.ok(platform, "frontend/core missing Platform cluster");
  assert.ok(
    platform.topics.some((topic) => topic.slug === "core-browser-platform"),
  );
  assert.ok(platform.topics[0]?.concepts.length);
  assert.equal(platform.nestedClusters?.length ?? 0, 0);

  const nodejs = subjectInGroup("backend", "nodejs");
  assert.ok(nodejs);
  const clusterIds = nodejs.clusters.map((cluster) => cluster.id);
  assert.deepEqual(clusterIds, ["core", "modules", "http", "additional"]);

  const nodeCore = nodejs.clusters.find((cluster) => cluster.id === "core");
  assert.ok(nodeCore);
  assert.equal(nodeCore.topics.length, 1);
  assert.ok(conspectSingleTopicClusterExpandsInSidebar(nodeCore));
  assert.ok(conspectClusterExpandsInSidebar(nodeCore));
});

test("every conspect subject cluster with concepts expands in sidebar policy", () => {
  const conspect = handbookNavSections("en").find(
    (section) => section.id === "conspect",
  );
  assert.ok(conspect);
  const gaps: string[] = [];

  for (const group of conspect.groups) {
    for (const entry of group.entries) {
      if (entry.kind !== "subject") {
        continue;
      }
      const { subject } = entry;
      const allClusters = [
        ...subject.clusters,
        ...(subject.sections?.flatMap((section) => section.clusters) ?? []),
        ...(subject.clustersAfterSections ?? []),
      ];
      for (const cluster of allClusters) {
        const topic = cluster.topics.length === 1 ? cluster.topics[0] : null;
        if (!topic || topic.concepts.length === 0) {
          continue;
        }
        if (!conspectClusterExpandsInSidebar(cluster)) {
          gaps.push(`${group.id}/${subject.slug}/${cluster.id}`);
        }
        if (
          topic.href !== subject.href &&
          conspectSubjectHubSectionWithConcepts(cluster, subject.href)
        ) {
          gaps.push(
            `${group.id}/${subject.slug}/${cluster.id}:misclassified-as-hub-intro`,
          );
        }
      }
    }
  }

  assert.deepEqual(gaps, []);
});

test("title-twin core clusters use topic URLs, not subject hub intro helper", () => {
  for (const [trackId, subjectSlug] of [
    ["frontend", "html"],
    ["advanced", "message-broker"],
    ["advanced", "cloud"],
  ] as const) {
    const subject = subjectInGroup(trackId, subjectSlug);
    assert.ok(subject);
    const core = subject.clusters.find((cluster) => cluster.id === "core");
    assert.ok(core, `${trackId}/${subjectSlug} missing core cluster`);
    const topic = core.topics[0];
    assert.ok(topic);
    assert.ok(
      topic.concepts.length > 0,
      `${topic.href} needs outline concepts`,
    );
    assert.notEqual(
      topic.href,
      subject.href,
      `${topic.href} should be a topic page, not the hub`,
    );
    assert.equal(
      conspectSubjectHubSectionWithConcepts(core, subject.href),
      false,
      `${subjectSlug}: core concepts must use expandable cluster sidebar, not hub-only helper`,
    );
  }
});

test("interview nav topics keep catalog URLs after hoist from subject clusters", () => {
  const interviews = handbookNavSections("en").find(
    (section) => section.id === "interviews",
  );
  assert.ok(interviews);
  const frontend = interviews.groups.find((group) => group.id === "frontend");
  const testing = interviews.groups.find((group) => group.id === "testing");
  assert.ok(frontend && testing);

  assert.equal(
    groupNavigateHref(frontend, "interviews"),
    "/en/frontend/web-security-questions",
  );
  assert.equal(testing.leafTopic?.href, "/en/testing/interview");

  const htmlInterview = frontend.entries.find(
    (entry) => entry.kind === "topic" && entry.topic.slug === "html-interview",
  );
  assert.equal(
    htmlInterview?.kind === "topic" ? htmlInterview.topic.href : "",
    "/en/frontend/html-interview",
  );
});

test("multi-topic cluster store topics are leaves with title-twin concepts", () => {
  const brokers = subjectInGroup("advanced", "message-broker")?.clusters.find(
    (cluster) => cluster.id === "brokers",
  );
  assert.ok(brokers);
  assert.ok(brokers.topics.length > 1);
  const kafka = brokers.topics.find(
    (topic) => topic.slug === "message-broker-kafka",
  );
  const nosqlEntry = conspectGroup("databases").entries.find(
    (entry) => entry.kind === "cluster" && entry.cluster.id === "nosql",
  );
  assert.equal(nosqlEntry?.kind, "cluster");
  const redis =
    nosqlEntry?.kind === "cluster"
      ? nosqlEntry.cluster.topics.find(
          (topic) => topic.slug === "database-redis",
        )
      : undefined;
  assert.ok(kafka && redis);
  for (const topic of [kafka, redis]) {
    assert.equal(topic.concepts.length, 1);
    assert.equal(
      topic.concepts[0]?.title.toLowerCase(),
      topic.title.toLowerCase(),
    );
  }
});

test("title-twin flatNav subjects flag duplicate sidebar topic rows", () => {
  for (const subjectSlug of ["workflow", "engineering"] as const) {
    const subject = subjectInGroup("ai", subjectSlug);
    assert.ok(subject, subjectSlug);
    assert.equal(subject.flatNav, true, subjectSlug);
    const hub = subject.clusters.find((cluster) => cluster.id === "hub");
    assert.ok(hub, `${subjectSlug} hub cluster`);
    const topic = hub.topics[0];
    assert.ok(topic, subjectSlug);
    assert.equal(
      isRedundantSubjectTopicNavRow(subject.title, topic.title),
      true,
      `${subjectSlug}: subject/topic titles must dedupe`,
    );
  }
});
