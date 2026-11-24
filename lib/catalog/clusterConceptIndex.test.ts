import assert from "node:assert/strict";
import test from "node:test";
import { getSubject } from "@/lib/catalog";
import { subjectClusterSectionsForLocale } from "./localizeSubjectClusters";

test("computer-science Core hub lists Core concepts on the subject index", () => {
  const core = getSubject("computer-science", "core");
  assert.ok(core);
  const sections = subjectClusterSectionsForLocale("en", core);
  assert.equal(sections.length, 1);
  assert.equal(sections[0]?.cluster.title, "Core");
  assert.ok((sections[0]?.items.length ?? 0) > 0);
  assert.match(sections[0]?.headingHref ?? "", /computer-science$/);
  const titles = sections[0]?.items.map((item) => item.title) ?? [];
  assert.ok(titles.includes("Programming paradigm"));
  assert.ok(titles.includes("Logic programming"));
});

test("data-structures subject hub lists concepts under each cluster", () => {
  const dataStructures = getSubject("computer-science", "data-structures");
  assert.ok(dataStructures);
  const sections = subjectClusterSectionsForLocale("en", dataStructures);
  const linear = sections.find((section) => section.cluster.id === "linear");
  const trees = sections.find((section) => section.cluster.id === "trees");
  const advanced = sections.find(
    (section) => section.cluster.id === "advanced",
  );
  assert.ok(linear);
  assert.ok(trees);
  assert.ok(advanced);
  assert.ok((linear.items.length ?? 0) > 0);
  assert.ok((trees.items.length ?? 0) > 0);
  assert.ok((advanced.items.length ?? 0) > 0);
});

test("frontend Core Accessibility index omits GFE interview group row", () => {
  const core = getSubject("frontend", "core");
  assert.ok(core);
  const sections = subjectClusterSectionsForLocale("en", core);
  const accessibility = sections.find(
    (section) => section.cluster.id === "accessibility",
  );
  assert.ok(accessibility);
  assert.equal(
    accessibility.items.some((item) => /\binterview\b/i.test(item.title)),
    false,
  );
});

test("message broker Brokers omits title-twin Kafka headings", () => {
  const messageBroker = getSubject("advanced", "message-broker");
  assert.ok(messageBroker);
  const sections = subjectClusterSectionsForLocale("en", messageBroker);
  const brokers = sections.find((section) => section.cluster.id === "brokers");
  assert.ok(brokers);
  const titles = brokers.items.map((item) => item.title);
  assert.ok(titles.includes("Kafka"));
  assert.ok(titles.includes("RabbitMQ"));
  assert.ok(titles.includes("NATS"));
  const kafkaHeadings = brokers.items.filter(
    (item) => item.indexRowKind === "group-heading" && item.title === "Kafka",
  );
  assert.equal(kafkaHeadings.length, 0);
  assert.equal(
    brokers.items.filter((item) => item.title === "Kafka").length,
    1,
  );
});

test("System design subject hub index depth", () => {
  const systemDesign = getSubject("computer-science", "system-design");
  assert.ok(systemDesign);
  const sections = subjectClusterSectionsForLocale("en", systemDesign);
  const sdCore = sections.find((section) => section.cluster.id === "core");
  assert.ok(sdCore);
  assert.ok(sdCore.items.length > 0);
  assert.match(sdCore.headingHref ?? "", /sd-core/);
  const principles = sections.find(
    (section) => section.cluster.id === "principles",
  );
  const architecture = sections.find(
    (section) => section.cluster.id === "architecture",
  );
  assert.ok(principles);
  assert.equal(principles.cluster.title, "Principles");
  assert.deepEqual(
    principles.items.map((item) => item.title),
    ["OOP & SOLID", "DRY, KISS, YAGNI", "GRASP"],
  );
  assert.ok(
    principles.items.every((item) => item.indexRowKind !== "group-heading"),
  );
  assert.ok(architecture);
  assert.equal(architecture.cluster.title, "Architecture");
  assert.deepEqual(
    architecture.items.map((item) => item.title),
    [
      "Styles",
      "Architecture patterns",
      "Design patterns",
      "Data",
    ],
  );
  assert.equal(
    architecture.items.some((item) => item.title === "Monolithic architecture"),
    false,
  );
});

test("nested multi-topic mode inlines concept rows under topic headings", () => {
  const systemDesign = getSubject("computer-science", "system-design");
  assert.ok(systemDesign);
  const sections = subjectClusterSectionsForLocale("en", systemDesign, {
    multiTopicChildren: "nested",
  });
  const architecture = sections.find(
    (section) => section.cluster.id === "architecture",
  );
  assert.ok(architecture);
  assert.ok(
    architecture.items.some(
      (item) =>
        item.indexRowKind === "group-heading" && item.title === "Styles",
    ),
  );
  assert.ok(
    architecture.items.some((item) => item.title === "Monolithic architecture"),
  );
});
