import assert from "node:assert/strict";
import { test } from "node:test";
import {
  armSuppressNextConceptHash,
  consumeSuppressNextConceptHash,
} from "./hash";

test("consumeSuppressNextConceptHash is one-shot", () => {
  armSuppressNextConceptHash();
  assert.equal(consumeSuppressNextConceptHash(), true);
  assert.equal(consumeSuppressNextConceptHash(), false);
});