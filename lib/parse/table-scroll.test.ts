import assert from "node:assert/strict";
import test from "node:test";
import { transformMarkdownTables } from "./table-scroll";

test("transformMarkdownTables wraps regular tables for horizontal scroll", () => {
  const html = "<p>Before</p><table><tr><td>A</td><td>B</td></tr></table>";
  const out = transformMarkdownTables(html);
  assert.match(out, /<div class="table-scroll"><table>/);
});

test("transformMarkdownTables still converts pros/cons tables", () => {
  const html = `<table>
<tbody>
<tr><th>Pros</th><th>Cons</th></tr>
<tr><td>Fast</td><td>Heavy</td></tr>
</tbody>
</table>`;
  const out = transformMarkdownTables(html);
  assert.match(out, /class="pros-cons"/);
  assert.match(out, /pros-cons__label">Pluses/);
  assert.match(out, /pros-cons__label">Minuses/);
  assert.doesNotMatch(out, /table-scroll/);
});
