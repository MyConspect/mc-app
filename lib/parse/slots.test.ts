import assert from "node:assert/strict";
import test from "node:test";
import { marked } from "marked";
import sanitizeHtml from "sanitize-html";
import { structureConceptBody } from "./slots";

const SANITIZE: sanitizeHtml.IOptions = {
  allowedTags: [
    ...(sanitizeHtml.defaults.allowedTags ?? []),
    "h4",
    "table",
    "thead",
    "tbody",
    "tr",
    "th",
    "td",
  ],
};

async function renderFragment(markdown: string): Promise<string> {
  const parsed = marked.parse(markdown, { async: false });
  return sanitizeHtml(parsed, SANITIZE);
}

test("structureConceptBody keeps When to use and When not to use as separate slots", async () => {
  const html = await structureConceptBody(
    `**When to use:**

- Good fit

**When not to use:**

- Poor fit`,
    renderFragment,
  );

  assert.match(html, /When to use<\/span>/);
  assert.match(html, /When not to use<\/span>/);
  assert.equal((html.match(/slot-cases/g) ?? []).length, 1);
  assert.equal((html.match(/slot-avoid/g) ?? []).length, 1);
});

test("structureConceptBody renders Interview questions slot with links", async () => {
  const html = await structureConceptBody(
    `**Definition:** Short.

**Interview questions:**

- [What is the purpose of the key prop in React?](./4_react_interview.md#what-is-the-purpose-of-the-key-prop-in-react)`,
    async (md) =>
      md.replace(
        /\]\(\.\/4_react_interview\.md#/,
        "](/en/frontend/react-interview#",
      ),
  );

  assert.match(html, /slot-interviewQuestions/);
  assert.match(html, /Interview questions/);
  assert.match(html, /purpose of the key prop/i);
  assert.match(html, /react-interview#/);
});

test("structureConceptBody omits See also slots", async () => {
  const html = await structureConceptBody(
    `**Short answer:** Same five OOP principles.

**See also:** [SOLID in React](./4_react_core.md#solid-in-react)`,
    renderFragment,
  );

  assert.match(html, /Short answer/i);
  assert.match(html, /Same five OOP principles/);
  assert.doesNotMatch(html, /See also/i);
  assert.doesNotMatch(html, /SOLID in React/);
});

test("structureConceptBody omits answer slots when hideAnswers is set", async () => {
  const html = await structureConceptBody(
    `**Advices:**

- Stay positive

**Answer:**

This is a sample answer you should not see.

**Answer 1**

Another leaked answer.

**Answer**:
Colon-outside-bold answer.

**BEST ANSWER:** Generic advice.

**Example:** "Sample quote."

**Example answers**

**If asked about age:**

> "Too old or too young?"`,
    renderFragment,
    { hideAnswers: true },
  );

  assert.match(html, /Stay positive/);
  assert.doesNotMatch(html, /sample answer you should not see/i);
  assert.doesNotMatch(html, /Another leaked answer/i);
  assert.doesNotMatch(html, /Colon-outside-bold answer/i);
  assert.doesNotMatch(html, /Generic advice/i);
  assert.doesNotMatch(html, /Sample quote/i);
  assert.doesNotMatch(html, /Too old or too young/i);
});

test("structureConceptBody classifies behavior Key, Advices, and TRAPS slots", async () => {
  const html = await structureConceptBody(
    `**TRAPS:** This is a trap.

**Key:**

Stay positive.

**Advices:**

- Be concise`,
    renderFragment,
  );

  assert.match(html, /slot-traps/);
  assert.match(html, /slot-key/);
  assert.match(html, /slot-advices/);
  assert.match(html, />TRAPS</);
  assert.match(html, />Key</);
  assert.match(html, />Advices</);
});

test("structureConceptBody renders bullet lists in case slots", async () => {
  const html = await structureConceptBody(
    `**When to use:**

- First item
- Second item`,
    renderFragment,
  );

  assert.match(html, /<ul>[\s\S]*<li>[\s\S]*First item/);
});

test("structureConceptBody omits anchor-only intro slot", async () => {
  const html = await structureConceptBody(
    `<a name="route-handlers"></a>

**Definition:** Short answer.`,
    renderFragment,
  );

  assert.doesNotMatch(html, /slot-intro/);
  assert.match(html, /slot-definition/);
});

test("structureConceptBody wraps post-how slots when concept-depth optional", async () => {
  const html = await structureConceptBody(
    `<!-- concept-depth:optional -->

**Definition:** Short.

**How it works:**

- Step one

**When to use:**

- Case A`,
    renderFragment,
  );

  assert.match(html, /slot-definition/);
  assert.match(html, /slot-how/);
  assert.match(html, /concept-depth-quick/);
  assert.match(html, /slot-cases/);
  assert.doesNotMatch(html, /concept-depth-detailed/);
  assert.match(html, /concept-depth-quick[\s\S]*slot-cases/);
});

test("structureConceptBody hides a ### TL;DR part from Quick markup", async () => {
  const html = await structureConceptBody(
    `<!-- concept-depth:optional -->

**Definition:** Short.

### TL;DR

Executive summary.

### Why it matters

**Detailed:**

Long block.`,
    renderFragment,
  );

  const quickBlock = html.includes("concept-depth-quick")
    ? html.slice(
        html.indexOf("concept-depth-quick"),
        html.indexOf("concept-part--detailed-only"),
      )
    : html;
  assert.doesNotMatch(quickBlock, /Executive summary/);
  assert.doesNotMatch(quickBlock, /concept-part__title[^>]*>TL;DR/);
  assert.match(html, /concept-part--detailed-only[\s\S]*Executive summary/);
});

test("structureConceptBody hides ### detailed-only parts from Quick markup", async () => {
  const html = await structureConceptBody(
    `<!-- concept-depth:optional -->

**Definition:** Short.

### TL;DR

**Detailed:**

Long block.`,
    renderFragment,
  );

  assert.doesNotMatch(
    html.slice(0, html.indexOf("concept-part--detailed-only")),
    /concept-part--detailed-only/,
  );
  assert.match(html, /concept-part--detailed-only/);
});

test("structureConceptBody omits Detailed slot heading in optional-depth Detailed pane", async () => {
  const html = await structureConceptBody(
    `<!-- concept-depth:optional -->

**Definition:** Short.

### Syntax

**Detailed:**

Fragment body.`,
    renderFragment,
  );

  assert.match(html, /concept-part__title/);
  const syntaxPart = html.slice(html.indexOf("Syntax"));
  assert.doesNotMatch(syntaxPart, /concept-slot__heading/);
  assert.match(syntaxPart, /Fragment body/);
});

test("structureConceptBody puts only Detailed slot in concept-depth-detailed", async () => {
  const html = await structureConceptBody(
    `<!-- concept-depth:optional -->

**Definition:** Short.

**How it works:**

- Step one

**Detailed:**

1. First block

**When to use:**

- Case A`,
    renderFragment,
  );

  assert.match(html, /concept-depth-detailed/);
  const detailed = html.slice(html.indexOf("concept-depth-detailed"));
  assert.match(detailed, /First block/);
  assert.doesNotMatch(detailed, /concept-slot__heading/);
  assert.doesNotMatch(detailed, /When to use/);
  const quickEnd = html.indexOf("concept-depth-detailed");
  const quick = html.slice(html.indexOf("concept-depth-quick"), quickEnd);
  assert.match(quick, /When to use/);
  assert.match(quick, /Step one/);
});

test("structureConceptBody keeps Sources in Detailed pane for detailed-only parts", async () => {
  const html = await structureConceptBody(
    `<!-- concept-depth:optional -->

**Definition:** Short.

**Sources:** [MDN](https://developer.mozilla.org/)

### GreatFrontEnd quiz

**Detailed:**

1. Long quiz body

**Sources:** [GreatFrontEnd](https://www.greatfrontend.com/questions/quiz/explain-hoisting)`,
    renderFragment,
  );

  const quickEnd = html.indexOf("concept-depth-detailed");
  const firstQuick = html.slice(
    html.indexOf("concept-depth-quick"),
    html.indexOf("concept-part__title"),
  );
  const detailed = html.slice(quickEnd);
  assert.match(firstQuick, /slot-sources/);
  assert.match(firstQuick, /MDN/);
  assert.doesNotMatch(firstQuick, /GreatFrontEnd/);
  assert.match(detailed, /slot-sources/);
  assert.match(detailed, /GreatFrontEnd/);
  assert.match(detailed, /Long quiz body/);
  assert.doesNotMatch(html.slice(0, quickEnd), /Long quiz body/);
});

test("structureConceptBody keeps post-Detailed Sources in Detailed without a part title", async () => {
  const html = await structureConceptBody(
    `<!-- concept-depth:optional -->

**Definition:** Short.

**Sources:** [MDN](https://developer.mozilla.org/)

**Interview questions:**

- [Q](./q.md#q)

**Detailed:**

1. Quiz body

**Sources:** [GreatFrontEnd](https://www.greatfrontend.com/questions/quiz/explain-hoisting)`,
    renderFragment,
  );

  assert.doesNotMatch(html, /concept-part__title/);
  const quickEnd = html.indexOf("concept-depth-detailed");
  const quick = html.slice(html.indexOf("concept-depth-quick"), quickEnd);
  const detailed = html.slice(quickEnd);
  assert.match(quick, /MDN/);
  assert.doesNotMatch(quick, /GreatFrontEnd/);
  assert.doesNotMatch(quick, /Quiz body/);
  assert.match(detailed, /slot-sources/);
  assert.match(detailed, /GreatFrontEnd/);
  assert.match(detailed, /Quiz body/);
});
