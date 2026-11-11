import assert from "node:assert/strict";
import test from "node:test";
import {
  canonicalLinkHash,
  collectConceptBlocks,
  extractInterviewAnchorTitles,
  parseTopicOutline,
} from "./parse";

test("canonicalLinkHash turns nodejs hashes into slugify(title) ids", () => {
  assert.equal(
    canonicalLinkHash(
      "How does Node.js handle child threads?",
      "#how-does-nodejs-handle-child-threads",
    ),
    "#how-does-node-js-handle-child-threads",
  );
  assert.equal(canonicalLinkHash("Event loop", "#event-loop"), "#event-loop");
  assert.equal(
    canonicalLinkHash("Interview", "#interview-practice"),
    "#interview-practice",
  );
});

test("collectConceptBlocks strips duplicate heading after anchor preamble", () => {
  const blocks = collectConceptBlocks(`
<details>
  <summary>Observer</summary>

<a name="observer"></a>

### Observer

**Definition:** One-to-many notification.
</details>
`);

  assert.equal(blocks.length, 1);
  assert.equal(blocks[0].title, "Observer");
  assert.match(blocks[0].body, /<a name="observer"><\/a>/);
  assert.doesNotMatch(blocks[0].body, /^#{1,3}\s+Observer/m);
  assert.match(blocks[0].body, /\*\*Definition:\*\*/);
});

test("collectConceptBlocks keeps non-matching heading after anchor preamble", () => {
  const blocks = collectConceptBlocks(`
<details>
  <summary>Observer</summary>

<a name="observer"></a>

### Implementation notes

**Definition:** One-to-many notification.
</details>
`);

  assert.equal(blocks.length, 1);
  assert.match(blocks[0].body, /### Implementation notes/);
});

test("collectConceptBlocks still strips duplicate heading without anchor preamble", () => {
  const blocks = collectConceptBlocks(`
<details>
  <summary>Factory</summary>

### Factory

**Definition:** Creates objects.
</details>
`);

  assert.equal(blocks.length, 1);
  assert.doesNotMatch(blocks[0].body, /^#{1,3}\s+Factory/m);
});

test("collectConceptBlocks ignores preamble before first horizontal rule", () => {
  const blocks = collectConceptBlocks(`
# Data Structures — hub

### Navigation

| Topic | Covers |
| --- | --- |
| [Linear](./7_special_data_structures_linear.md) | Arrays. |

---

<details>
  <summary>Choosing a data structure</summary>

### Choosing a data structure

**Definition:** Lookup table.
</details>
`);

  assert.equal(blocks.length, 1);
  assert.equal(blocks[0].title, "Choosing a data structure");
});

test("collectConceptBlocks keeps short interview task bodies", () => {
  const blocks = collectConceptBlocks(`
## Coding tasks

<details>
<summary>Task 1 — Short prompt</summary>

Implement \`Pick\` without the built-in utility.
</details>
`);

  assert.equal(blocks.length, 1);
  assert.equal(blocks[0].title, "Task 1 — Short prompt");
});

test("interview topic headings group the following questions", () => {
  const outline = parseTopicOutline(`
## Interview Practice

### HTML Basics

<details>
<summary>What does HTML stand for?</summary>

### What does HTML stand for?

**Definition:**

</details>

### Lists

<details>
<summary>What types of lists exist?</summary>

### What types of lists exist?

**Definition:**

</details>
`);

  assert.deepEqual(
    outline.map((item) => [item.group, item.title]),
    [
      ["HTML Basics", "What does HTML stand for?"],
      ["Lists", "What types of lists exist?"],
    ],
  );
});

test("parseTopicOutline uses English anchors for Russian interview titles", () => {
  const enMarkdown = `
## Interview Practice

<details>
<summary>What does HTML stand for?</summary>

### What does HTML stand for?

**Definition:**
</details>
`;

  const ruMarkdown = `
## Interview Practice

<details>
<summary>Что означает HTML?</summary>

### Что означает HTML?

**Definition:**
</details>
`;

  const outline = parseTopicOutline(ruMarkdown, "ru", {
    anchorMarkdown: enMarkdown,
  });

  assert.equal(outline.length, 1);
  assert.equal(outline[0].title, "Что означает HTML?");
  assert.equal(outline[0].id, "what-does-html-stand-for");
  assert.match(outline[0].titleSearchText ?? "", /Что означает HTML/);
  assert.match(outline[0].titleSearchText ?? "", /What does HTML stand for/);
});

test("parseTopicOutline omits hidden answers from search text", () => {
  const markdown = `
<details>
  <summary>Strengths</summary>

**Definition:** What you are good at.

**Answer:**

My greatest strengths are problem-solving at a private company.
</details>

## Interview Practice

<details>
<summary>Q1. Tell me more</summary>

**Definition:** A follow-up.

**Answer:**

Secret interview answer.
</details>
`;

  const hidden = parseTopicOutline(markdown, "en", { hideAnswers: true });
  assert.equal(hidden.length, 2);
  assert.match(hidden[0]?.searchText ?? "", /good at/);
  assert.doesNotMatch(hidden[0]?.searchText ?? "", /problem-solving/);
  assert.match(hidden[1]?.searchText ?? "", /follow-up/);
  assert.doesNotMatch(hidden[1]?.searchText ?? "", /Secret interview answer/);

  const shown = parseTopicOutline(markdown, "en");
  assert.match(shown[0]?.searchText ?? "", /problem-solving/);
  assert.match(shown[1]?.searchText ?? "", /Secret interview answer/);
});

test("parseTopicOutline keeps content after horizontal rules in the body", () => {
  const outline = parseTopicOutline(`
# Topic

<details>
  <summary>First</summary>

**Definition:** Alpha.

---

**How it works:** Beta.
</details>
`);

  assert.deepEqual(
    outline.map((item) => item.title),
    ["First"],
  );
});

test("extractInterviewAnchorTitles returns cleaned question titles in order", () => {
  const titles = extractInterviewAnchorTitles(`
## Interview Practice

<details>
<summary>Q1. What is a closure?</summary>

### Q1. What is a closure?

**Definition:**
</details>

<details>
<summary>Task 1 — Implement debounce</summary>

### Task 1 — Implement debounce

Short prompt.
</details>
`);

  assert.deepEqual(titles, ["What is a closure?", "Implement debounce"]);
});

test("stripDuplicateHeadingsInDetails removes redundant h3 after summary", () => {
  const blocks = collectConceptBlocks(`
<details>
<summary>What is Redux?</summary>

### What is Redux?

**Definition:** Store.
</details>
`);
  assert.equal(blocks.length, 1);
  assert.doesNotMatch(blocks[0].body, /^### What is Redux/m);
});

test("interview collection wrappers stay one block in collectConceptBlocks", () => {
  const blocks = collectConceptBlocks(`
## Interview Practice

<details>
<summary>100+ React questions (GFE)</summary>

<!-- gfe-article-wrapper -->

<details>
<summary>1. What is React?</summary>

**Definition:** Library.
</details>

</details>
`);

  assert.equal(blocks.length, 1);
  assert.equal(blocks[0].title, "100+ React questions (GFE)");
});

test("interview collection wrappers flatten to grouped questions in the outline", () => {
  const outline = parseTopicOutline(`
## Interview Practice

<details>
<summary>JavaScript Fundamentals</summary>

<!-- interview-group-wrapper -->

<details>
<summary>What are the data types present in JavaScript?</summary>

**Definition:** Primitive and composite types.
</details>

<details>
<summary>What is the difference between null and undefined?</summary>

**Definition:** Distinct empty values.
</details>

</details>
`);

  assert.equal(outline.length, 2);
  assert.equal(outline[0]?.group, "JavaScript Fundamentals");
  assert.equal(
    outline[0]?.title,
    "What are the data types present in JavaScript?",
  );
  assert.equal(
    outline[0]?.id,
    "what-are-the-data-types-present-in-javascript",
  );
  assert.equal(outline[1]?.group, "JavaScript Fundamentals");
  assert.equal(
    outline[1]?.title,
    "What is the difference between null and undefined?",
  );
});

test("gfe article wrappers flatten to child questions in the outline", () => {
  const outline = parseTopicOutline(`
## Interview Practice

<details>
<summary>100+ React questions (GFE)</summary>

<!-- gfe-article-wrapper -->

<details>
<summary>1. What is React?</summary>

**Definition:** Library.
</details>

</details>
`);

  assert.equal(outline.length, 1);
  assert.equal(outline[0]?.group, "100+ React questions (GFE)");
  assert.equal(outline[0]?.title, "1. What is React?");
  assert.equal(outline[0]?.id, "1-what-is-react");
});
