import assert from "node:assert/strict";
import test from "node:test";
import {
  auditHandbookIndexShellLine,
  auditHandbookIndexShellSource,
} from "./handbookIndexShell";

test("accepts handbook main with max-w-none", () => {
  const line =
    'className={`handbook-topic-main flex min-h-0 w-full max-w-none flex-1`}';
  assert.deepEqual(auditHandbookIndexShellLine(line, 1, "page.tsx"), []);
});

test("rejects max-w-3xl on handbook index main", () => {
  const line =
    'className={`handbook-topic-main flex min-h-0 w-full max-w-3xl flex-1`}';
  const v = auditHandbookIndexShellLine(line, 8, "app/[track]/page.tsx");
  assert.equal(v.length, 1);
  assert.match(v[0]?.reason ?? "", /max-w-3xl/);
});

test("requires max-w-none when handbook main has no max-width token", () => {
  const line = 'className="handbook-subject-main flex w-full flex-1"';
  const v = auditHandbookIndexShellLine(line, 2, "page.tsx");
  assert.equal(v.length, 1);
  assert.match(v[0]?.reason ?? "", /max-w-none/);
});

test("ignores lines without handbook index main", () => {
  assert.deepEqual(
    auditHandbookIndexShellLine('<main className="max-w-3xl">', 1, "x.tsx"),
    [],
  );
});

test("reports multiple violating lines in source", () => {
  const source = [
    '  <main className="handbook-subject-main max-w-2xl" />',
    "  <div />",
    '  <main className={`handbook-topic-main max-w-3xl`} />',
  ].join("\n");
  const v = auditHandbookIndexShellSource(source, "bad.tsx");
  assert.equal(v.length, 2);
});