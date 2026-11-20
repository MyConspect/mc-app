import assert from "node:assert/strict";
import test from "node:test";
import { SEARCH_CONTENT_MARK_CLASS } from "../searchMarkClass";
import { highlightQueryInHtml } from "./highlightQueryInHtml";

const mark = (text: string) =>
  `<mark class="${SEARCH_CONTENT_MARK_CLASS}">${text}</mark>`;

test("highlightQueryInHtml leaves html unchanged when all tokens are too short", () => {
  const html = "<p>go routines</p>";
  assert.equal(highlightQueryInHtml(html, "go"), html);
});

test("highlightQueryInHtml marks tokens at or above BODY_QUERY_MIN_LENGTH", () => {
  const html = "<p>Programming paradigm overview</p>";
  const out = highlightQueryInHtml(html, "programming");
  assert.equal(out, `<p>${mark("Programming")} paradigm overview</p>`);
});

test("highlightQueryInHtml highlights each qualifying token in a multi-word query", () => {
  const html = "<p>Programming paradigm</p>";
  const out = highlightQueryInHtml(html, "programming para");
  assert.equal(
    out,
    `<p>${mark("Programming")} ${mark("para")}digm</p>`,
  );
});

test("highlightQueryInHtml skips pre and code blocks", () => {
  const html =
    "<p>event loop</p><pre>event loop</pre><code>event loop</code>";
  const out = highlightQueryInHtml(html, "event");
  assert.equal(
    out,
    `<p>${mark("event")} loop</p><pre>event loop</pre><code>event loop</code>`,
  );
});