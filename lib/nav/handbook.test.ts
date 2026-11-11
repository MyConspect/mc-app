import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { handbookNavSections } from "./handbook";
import { searchNav } from "./search";
import {
  clusterNavigateHref,
  groupNavigateHref,
  inferNavRootSection,
  navGroupsForRootSection,
  sectionSwitchHref,
} from "./sections";
import type { NavCluster, NavGroup, NavSubject, NavTopic } from "./types";

function findSubject(
  slug: string,
  sectionId: "conspect" | "interviews" = "conspect",
): NavSubject {
  const groups = navGroupsForRootSection(handbookNavSections("en"), sectionId);
  for (const group of groups) {
    for (const entry of group.entries) {
      if (entry.kind === "subject" && entry.subject.slug === slug) {
        return entry.subject;
      }
    }
  }
  throw new Error(`Subject not found: ${slug} in ${sectionId}`);
}

function findGroup(
  trackId: string,
  sectionId: "conspect" | "interviews" = "conspect",
) {
  return navGroupsForRootSection(handbookNavSections("en"), sectionId).find(
    (group) => group.id === trackId,
  );
}

function allSubjectClusters(subject: NavSubject): readonly NavCluster[] {
  return [
    ...subject.clusters,
    ...(subject.sections?.flatMap((section) => section.clusters) ?? []),
    ...(subject.clustersAfterSections ?? []),
  ];
}

function interviewTopicsInGroup(group: NavGroup): readonly NavTopic[] {
  return group.entries
    .filter((entry) => entry.kind === "topic")
    .map((entry) => entry.topic);
}

function tasksClusterInGroup(group: NavGroup): NavCluster | undefined {
  const entry = group.entries.find(
    (item) => item.kind === "cluster" && item.cluster.id === "tasks",
  );
  return entry?.kind === "cluster" ? entry.cluster : undefined;
}

describe("handbookNavSections layout", () => {
  it("places study tracks under Conspect and interviews under Interviews", () => {
    const sections = handbookNavSections("en");
    assert.equal(sections.length, 2);
    assert.equal(sections[0]?.id, "conspect");
    assert.equal(sections[1]?.id, "interviews");

    const conspectFrontend = findGroup("frontend", "conspect");
    const interviewsFrontend = findGroup("frontend", "interviews");
    assert.ok(conspectFrontend);
    assert.ok(interviewsFrontend);
    assert.equal(
      conspectFrontend?.entries.some(
        (entry) => entry.kind === "cluster" && entry.cluster.id === "interview",
      ),
      false,
    );
    assert.equal(
      interviewsFrontend?.entries.some(
        (entry) => entry.kind === "cluster" && entry.cluster.id === "interview",
      ),
      false,
    );
    assert.ok(
      interviewTopicsInGroup(interviewsFrontend!).some(
        (topic) => topic.slug === "html-interview",
      ),
    );
    assert.equal(
      findGroup("behavior", "conspect")?.leafTopic?.slug,
      "behavior-questions",
    );
    assert.equal(
      findGroup("behavior", "interviews")?.leafTopic?.slug,
      "behavior-questions",
    );
  });

  it("marks TypeScript Reference as flat appendix nav", () => {
    const typescript = findSubject("typescript");
    const reference = typescript.sections?.find(
      (section) => section.id === "reference",
    );
    assert.equal(reference?.flatNav, true);
    assert.equal(reference?.collapsible, true);
  });

  it("splits HTML Core principles from Document topics in the sidebar", () => {
    const html = findSubject("html");
    const rootClusterIds = html.clusters.map((cluster) => cluster.id);
    assert.deepEqual(rootClusterIds.slice(0, 3), [
      "core",
      "document",
      "browser",
    ]);
    const coreTopics = html.clusters
      .find((cluster) => cluster.id === "core")
      ?.topics.map((topic) => topic.slug);
    const documentTopics = html.clusters
      .find((cluster) => cluster.id === "document")
      ?.topics.map((topic) => topic.slug);
    assert.deepEqual(coreTopics, ["html-core"]);
    assert.deepEqual(documentTopics, [
      "html-structure",
      "html-semantics",
      "html-forms",
      "html-media",
    ]);
  });

  it("marks HTML Reference as flat appendix nav", () => {
    const html = findSubject("html");
    const reference = html.sections?.find(
      (section) => section.id === "reference",
    );
    assert.equal(reference?.flatNav, true);
    assert.equal(reference?.collapsible, true);
    assert.deepEqual(
      reference?.clusters.map((cluster) => cluster.id),
      [
        "ref-elements",
        "ref-attributes",
        "ref-global-attributes",
        "ref-attributes-by-element",
        "ref-attribute-values",
      ],
    );
  });

  it("places Utility Types in its own section between handbook and Reference", () => {
    const typescript = findSubject("typescript");
    const sectionIds = typescript.sections?.map((section) => section.id);
    assert.deepEqual(sectionIds, ["utility-types", "reference"]);
    const utility = typescript.sections?.find(
      (section) => section.id === "utility-types",
    );
    assert.equal(utility?.collapsible, true);
    assert.equal(utility?.flatNav, true);
    const utilitySection = typescript.sections?.find(
      (section) => section.id === "utility-types",
    );
    assert.ok(utilitySection);
    assert.ok(
      utilitySection?.clusters.some(
        (cluster) => cluster.id === "utility-types",
      ),
    );
    assert.ok(
      utilitySection?.clusters.some(
        (cluster) => cluster.id === "utility-object",
      ),
    );
    const referenceSection = typescript.sections?.find(
      (section) => section.id === "reference",
    );
    assert.ok(
      referenceSection?.clusters.every(
        (cluster) => cluster.id !== "utility-types",
      ),
    );
  });

  it("keeps Vue and Nuxt sections as expandable cluster rows", () => {
    const vueNuxt = findSubject("vue-nuxt");
    for (const section of vueNuxt.sections ?? []) {
      assert.equal(section.flatNav, undefined);
      assert.ok(section.clusters.length > 0);
    }
  });

  it("keeps TypeScript interview topics under Interviews only", () => {
    const typescript = findSubject("typescript");
    assert.equal(typescript.clustersAfterSections, undefined);
    const interviewsFrontend = findGroup("frontend", "interviews");
    assert.ok(interviewsFrontend);
    const tasks = tasksClusterInGroup(interviewsFrontend);
    assert.ok(
      interviewTopicsInGroup(interviewsFrontend).some(
        (topic) => topic.slug === "ts-interview",
      ),
    );
    assert.ok(
      tasks?.topics.some((topic) => topic.slug === "ts-interview-tasks"),
    );
    assert.equal(
      interviewTopicsInGroup(interviewsFrontend).find(
        (topic) => topic.slug === "ts-interview",
      )?.hideSidebarConcepts,
      true,
    );
  });

  it("hides sidebar concepts for interview and task topics", () => {
    const interviewsFrontend = findGroup("frontend", "interviews");
    assert.ok(interviewsFrontend);
    const tasks = tasksClusterInGroup(interviewsFrontend);
    assert.ok(
      interviewTopicsInGroup(interviewsFrontend).every(
        (topic) => topic.hideSidebarConcepts,
      ),
    );
    assert.ok(tasks?.topics.every((topic) => topic.hideSidebarConcepts));
    assert.ok(
      (interviewTopicsInGroup(interviewsFrontend)[0]?.concepts.length ?? 0) > 0,
    );
  });

  it("hides sidebar concepts for every interview and task topic", () => {
    for (const section of handbookNavSections("en")) {
      for (const group of section.groups) {
        for (const entry of group.entries) {
          if (section.id === "interviews" && entry.kind === "topic") {
            assert.equal(
              entry.topic.hideSidebarConcepts,
              true,
              `${group.id}/${entry.topic.slug}`,
            );
          }
          if (
            section.id === "interviews" &&
            entry.kind === "cluster" &&
            entry.cluster.id === "tasks"
          ) {
            for (const topic of entry.cluster.topics) {
              assert.equal(
                topic.hideSidebarConcepts,
                true,
                `${group.id}/${entry.cluster.id}/${topic.slug}`,
              );
            }
          }
          if (entry.kind !== "subject") {
            continue;
          }
          for (const cluster of allSubjectClusters(entry.subject)) {
            if (!/interview|tasks/i.test(cluster.id)) {
              continue;
            }
            for (const topic of cluster.topics) {
              assert.equal(
                topic.hideSidebarConcepts,
                true,
                `${entry.subject.slug}/${cluster.id}/${topic.slug}`,
              );
            }
          }
        }
      }
    }
  });

  it("lifts Node.js interview topics to the Backend Interviews track", () => {
    const nodejs = findSubject("nodejs");
    assert.equal(
      allSubjectClusters(nodejs).some((cluster) =>
        /interview|tasks/i.test(cluster.id),
      ),
      false,
    );
    const backend = findGroup("backend", "interviews");
    assert.ok(backend);
    const interviewTopics = interviewTopicsInGroup(backend);
    assert.equal(
      interviewTopics.find((topic) => topic.slug === "nodejs-interview")?.title,
      "Node.js",
    );
    assert.equal(
      interviewTopics.find((topic) => topic.slug === "express-questions")
        ?.title,
      "Express",
    );
  });

  it("lifts Vue and Nuxt interview topics to the Frontend Interviews track", () => {
    const vueNuxt = findSubject("vue-nuxt");
    const vueInterview = vueNuxt.sections
      ?.find((section) => section.id === "vue")
      ?.clusters.find((cluster) => cluster.id === "interview");
    const nuxtInterview = vueNuxt.sections
      ?.find((section) => section.id === "nuxt")
      ?.clusters.find((cluster) => cluster.id === "nuxt-interview");
    assert.equal(vueInterview, undefined);
    assert.equal(nuxtInterview, undefined);

    const frontend = findGroup("frontend", "interviews");
    assert.ok(frontend);
    const interviewTopics = interviewTopicsInGroup(frontend);
    const vue = interviewTopics.find((topic) => topic.slug === "vue-interview");
    const nuxt = interviewTopics.find(
      (topic) => topic.slug === "nuxt-interview",
    );
    assert.equal(vue?.title, "Vue");
    assert.equal(nuxt?.title, "Nuxt");
    assert.equal(vue?.hideSidebarConcepts, true);
    assert.equal(nuxt?.hideSidebarConcepts, true);
    assert.ok((vue?.concepts.length ?? 0) > 0);
  });

  it("hides sidebar concepts on the behavior leaf topic", () => {
    const behavior = findGroup("behavior", "interviews");
    assert.equal(behavior?.leafTopic?.hideSidebarConcepts, true);
    assert.ok((behavior?.leafTopic?.concepts.length ?? 0) > 0);
  });

  it("promotes a single testing interview topic to a leaf track", () => {
    const testing = findGroup("testing", "interviews");
    assert.ok(testing);
    assert.equal(testing.entries.length, 0);
    assert.equal(testing.leafTopic?.slug, "interview");
    assert.equal(testing.leafTopic?.href, "/en/testing/interview");
    assert.equal(testing.leafTopic?.hideSidebarConcepts, true);
    assert.equal(
      groupNavigateHref(testing, "interviews"),
      "/en/testing/interview",
    );
  });

  it("infers root section from pathname", () => {
    assert.equal(inferNavRootSection("/en/frontend/css"), "conspect");
    assert.equal(
      inferNavRootSection("/en/frontend/html-interview"),
      "interviews",
    );
    assert.equal(
      inferNavRootSection("/en/frontend/redux-questions"),
      "interviews",
    );
    assert.equal(
      inferNavRootSection("/en/frontend/web-api-websockets"),
      "interviews",
    );
    assert.equal(inferNavRootSection("/en/behavior"), "conspect");
    assert.equal(
      inferNavRootSection("/en/behavior/behavior-questions"),
      "interviews",
    );
    assert.equal(
      inferNavRootSection("/en/other/engineering-fullstack"),
      "conspect",
    );
  });

  it("switches sections on the same track when possible", () => {
    const sections = handbookNavSections("en");
    assert.equal(
      sectionSwitchHref(sections, "/en/frontend/css", "interviews"),
      "/en/frontend/css-interview",
    );
    assert.equal(
      sectionSwitchHref(sections, "/en/frontend/html-interview", "conspect"),
      "/en/frontend/html-core",
    );
    assert.equal(
      sectionSwitchHref(sections, "/en/frontend", "interviews"),
      "/en/frontend/web-security-questions",
    );
    assert.equal(
      sectionSwitchHref(sections, "/en/frontend/redux-questions", "conspect"),
      "/en/frontend/react-redux",
    );
    assert.equal(
      sectionSwitchHref(
        sections,
        "/en/frontend/html-interview-tasks",
        "conspect",
      ),
      "/en/frontend/html-core",
    );
    assert.equal(
      sectionSwitchHref(sections, "/en/frontend/react-redux", "interviews"),
      "/en/frontend/redux-questions",
    );
  });

  it("keeps interview sidebar links on interview topics", () => {
    const frontend = findGroup("frontend", "interviews");
    assert.ok(frontend);
    assert.equal(
      groupNavigateHref(frontend, "interviews"),
      "/en/frontend/web-security-questions",
    );
    const htmlInterview = interviewTopicsInGroup(frontend).find(
      (topic) => topic.slug === "html-interview",
    );
    assert.equal(htmlInterview?.href, "/en/frontend/html-interview");
    const tasks = tasksClusterInGroup(frontend);
    assert.ok(tasks);
    assert.equal(
      clusterNavigateHref(tasks, "interviews", frontend.href),
      tasks.topics[0]?.href,
    );
  });

  it("falls back to the first group when the track is missing", () => {
    const sections = handbookNavSections("en");
    assert.equal(
      sectionSwitchHref(sections, "/en/unknown-track", "conspect"),
      findGroup("frontend", "conspect")?.href,
    );
    assert.equal(
      sectionSwitchHref(sections, "/en/behavior", "conspect"),
      findGroup("behavior", "conspect")?.href,
    );
    assert.equal(
      sectionSwitchHref(sections, "/en/behavior", "interviews"),
      findGroup("behavior", "interviews")?.leafTopic?.href,
    );
  });

  it("lists operators and loops in core between language and arrays", () => {
    const js = findSubject("javascript");
    const core = allSubjectClusters(js).find((item) => item.id === "core");
    assert.ok(core);
    assert.deepEqual(
      core.topics.map((topic) => topic.slug),
      ["js-core-hub"],
    );
    const hub = core.topics[0];
    assert.ok(hub?.nestedTopics);
    const slugs = hub.nestedTopics!.map((topic) => topic.slug);
    assert.ok(slugs.includes("js-operators"));
    assert.ok(slugs.includes("js-loops"));
    const languageIndex = slugs.indexOf("js-core");
    const operatorsIndex = slugs.indexOf("js-operators");
    const loopsIndex = slugs.indexOf("js-loops");
    const arraysIndex = slugs.indexOf("js-array");
    assert.ok(languageIndex >= 0 && operatorsIndex > languageIndex);
    assert.ok(loopsIndex > operatorsIndex && arraysIndex > loopsIndex);
    assert.ok(
      !allSubjectClusters(js).some((item) => item.id === "fundamentals"),
    );
  });

  it("nests module topics under Modules inside Additional", () => {
    const js = findSubject("javascript");
    const additional = allSubjectClusters(js).find(
      (item) => item.id === "additional",
    );
    assert.ok(additional);
    assert.deepEqual(
      additional.topics.map((topic) => topic.slug),
      ["js-modules", "js-extra"],
    );
    const modules = additional.topics.find(
      (topic) => topic.slug === "js-modules",
    );
    assert.ok(modules?.nestedTopics);
    assert.deepEqual(
      modules.nestedTopics!.map((topic) => topic.slug),
      ["js-modules-overview", "js-import-export", "js-dynamic-import"],
    );
    const extra = additional.topics.find((topic) => topic.slug === "js-extra");
    assert.ok(extra);
    assert.equal(extra.title, "Intl API");
  });

  it("lists objects and classes as separate core topics", () => {
    const js = findSubject("javascript");
    const core = allSubjectClusters(js).find((item) => item.id === "core");
    assert.ok(core);
    const hub = core.topics.find((topic) => topic.slug === "js-core-hub");
    assert.ok(hub?.nestedTopics);
    const slugs = hub.nestedTopics!.map((topic) => topic.slug);
    assert.ok(slugs.includes("js-objects"));
    assert.ok(slugs.includes("js-classes"));
    const objectsIndex = slugs.indexOf("js-objects");
    const classesIndex = slugs.indexOf("js-classes");
    assert.ok(objectsIndex >= 0 && classesIndex > objectsIndex);
  });

  it("lists closures on the functions topic page", () => {
    const js = findSubject("javascript");
    const core = allSubjectClusters(js).find((item) => item.id === "core");
    assert.ok(core);
    const hub = core.topics.find((topic) => topic.slug === "js-core-hub");
    assert.ok(hub?.nestedTopics);
    const functions = hub.nestedTopics!.find(
      (topic) => topic.slug === "js-functions",
    );
    assert.ok(functions);
    assert.ok(functions.concepts.some((concept) => concept.id === "closures"));
    assert.ok(!core.topics.some((topic) => topic.slug === "js-closures"));
  });

  it("groups javascript functions concepts by section", () => {
    const js = findSubject("javascript");
    const core = allSubjectClusters(js).find((item) => item.id === "core");
    assert.ok(core);
    const hub = core.topics.find((topic) => topic.slug === "js-core-hub");
    assert.ok(hub?.nestedTopics);
    const functions = hub.nestedTopics!.find(
      (topic) => topic.slug === "js-functions",
    );
    assert.ok(functions);
    const byId = new Map(functions.concepts.map((c) => [c.id, c.group]));
    assert.equal(
      byId.get("rest-parameters-and-spread-syntax"),
      "Parameters & scope",
    );
    assert.equal(
      byId.get("scheduling-settimeout-and-setinterval"),
      "Recursion & scheduling",
    );
    assert.equal(byId.get("call-apply-and-bind"), "this & binding");
  });

  it("groups javascript classes concepts by section", () => {
    const js = findSubject("javascript");
    const core = allSubjectClusters(js).find((item) => item.id === "core");
    assert.ok(core);
    const hub = core.topics.find((topic) => topic.slug === "js-core-hub");
    assert.ok(hub?.nestedTopics);
    const classes = hub.nestedTopics!.find(
      (topic) => topic.slug === "js-classes",
    );
    assert.ok(classes);
    const byId = new Map(classes.concepts.map((c) => [c.id, c.group]));
    assert.equal(byId.get("class-syntax"), "Class basics");
    assert.equal(byId.get("inheritance-and-super"), "Class inheritance");
    assert.equal(
      byId.get("private-and-protected-properties-and-methods"),
      "Encapsulation",
    );
    assert.equal(byId.get("mixins"), "Composition patterns");
  });

  it("groups javascript loops concepts by section", () => {
    const js = findSubject("javascript");
    const core = allSubjectClusters(js).find((item) => item.id === "core");
    assert.ok(core);
    const hub = core.topics.find((topic) => topic.slug === "js-core-hub");
    assert.ok(hub?.nestedTopics);
    const loops = hub.nestedTopics!.find((topic) => topic.slug === "js-loops");
    assert.ok(loops);
    const byId = new Map(loops.concepts.map((c) => [c.id, c.group]));
    assert.equal(byId.get("try-catch"), "Errors and exceptions");
    assert.equal(byId.get("generators"), "Iteration protocols");
    assert.equal(byId.get("advanced-iteration"), "Iteration protocols");
  });

  it("groups browser document concepts by section", () => {
    const js = findSubject("javascript");
    const browser = allSubjectClusters(js).find(
      (item) => item.id === "browser",
    );
    assert.ok(browser);
    const hub = browser.topics.find((topic) => topic.slug === "js-browser");
    assert.ok(hub?.nestedTopics);
    const document = hub.nestedTopics.find(
      (topic) => topic.slug === "js-browser-document",
    );
    assert.ok(document);
    const byId = new Map(document.concepts.map((c) => [c.id, c.group]));
    assert.equal(byId.get("script-loading"), "Environment");
    assert.equal(byId.get("browser-environment"), "Environment");
    assert.equal(byId.get("dom-tree"), "DOM tree");
    assert.equal(byId.get("changing-the-dom"), "Modifying the DOM");
    assert.equal(
      byId.get("element-size-and-scroll"),
      "Size, scroll & coordinates",
    );
    assert.equal(byId.get("bom"), "BOM, forms & observers");
  });

  it("lists destructuring on the variables topic page", () => {
    const js = findSubject("javascript");
    const core = allSubjectClusters(js).find((item) => item.id === "core");
    assert.ok(core);
    const hub = core.topics.find((topic) => topic.slug === "js-core-hub");
    assert.ok(hub?.nestedTopics);
    const variables = hub.nestedTopics!.find(
      (topic) => topic.slug === "js-variables",
    );
    assert.ok(variables);
    for (const id of ["rest", "spread", "destructuring"]) {
      assert.ok(variables.concepts.some((concept) => concept.id === id));
    }
  });

  it("lists compiler fundamentals concepts on one topic like The Basics", () => {
    const frontend = findGroup("frontend", "conspect");
    assert.ok(frontend);
    const ts = frontend.entries.find(
      (entry) =>
        entry.kind === "subject" && entry.subject.slug === "typescript",
    );
    assert.ok(ts && ts.kind === "subject");
    const cluster = ts.subject.clusters.find(
      (item) => item.id === "compiler-fundamentals",
    );
    const basics = ts.subject.clusters.find((item) => item.id === "basics");
    assert.ok(cluster && basics);
    assert.equal(cluster.topics.length, 1);
    assert.equal(basics.topics.length, 1);
    assert.equal(cluster.topics[0].concepts.length, 8);
  });

  it("keeps conspect and interview search corpora separate", () => {
    const sections = handbookNavSections("en");
    const conspectGroups = navGroupsForRootSection(sections, "conspect");
    const interviewGroups = navGroupsForRootSection(sections, "interviews");

    assert.ok(conspectGroups.length > 0);
    assert.ok(interviewGroups.length > 0);
    assert.notEqual(conspectGroups[0], interviewGroups[0]);

    const conspectSolid = searchNav(conspectGroups, "solid", "titles");
    assert.ok(conspectSolid.groups.length > 0);
    assert.ok(conspectSolid.firstHref);
    assert.equal(inferNavRootSection(conspectSolid.firstHref!), "conspect");

    const conspectCompiler = searchNav(
      conspectGroups,
      "compiler fundamentals",
      "titles",
    );
    assert.ok(conspectCompiler.groups.length > 0);
    assert.equal(
      searchNav(interviewGroups, "compiler fundamentals", "titles").groups
        .length,
      0,
    );
  });

  it("nests machine coding interview under React Interview", () => {
    const frontendInterviews = interviewTopicsInGroup(
      findGroup("frontend", "interviews")!,
    );
    const react = frontendInterviews.find(
      (topic) => topic.slug === "react-interview",
    );
    assert.ok(react?.nestedTopics);
    assert.ok(
      react.nestedTopics!.some(
        (topic) => topic.slug === "react-machine-coding-interview",
      ),
    );
    assert.ok(
      !frontendInterviews.some(
        (topic) => topic.slug === "react-machine-coding-interview",
      ),
      "machine coding interview must not lift to frontend track interviews",
    );
  });
});
