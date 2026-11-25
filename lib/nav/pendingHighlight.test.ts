import assert from "node:assert/strict";
import { afterEach, before, describe, it } from "node:test";
import { shouldUsePendingNavPath } from "./pendingHighlight";
import { persistNavRootSection } from "./rootSectionPreference";

describe("shouldUsePendingNavPath", () => {
  before(() => {
    const store = new Map<string, string>();
    const session = {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => {
        store.set(key, value);
      },
      removeItem: (key: string) => {
        store.delete(key);
      },
      clear: () => {
        store.clear();
      },
    };
    Object.defineProperty(globalThis, "sessionStorage", {
      configurable: true,
      value: session,
    });
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: globalThis,
    });
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it("returns false when pending is empty", () => {
    assert.equal(shouldUsePendingNavPath("/en/interviews", ""), false);
  });

  it("uses pending when both paths share a section", () => {
    assert.equal(
      shouldUsePendingNavPath(
        "/en/interviews/computer-science",
        "/en/interviews/frontend/react",
      ),
      true,
    );
  });

  it("uses pending interviews target while committed path still conspect after tab switch", () => {
    persistNavRootSection("interviews");
    assert.equal(
      shouldUsePendingNavPath(
        "/en/conspect/computer-science/arrays",
        "/en/interviews",
      ),
      true,
    );
  });

  it("drops stale conspect pending when interviews tab is active", () => {
    persistNavRootSection("interviews");
    assert.equal(
      shouldUsePendingNavPath(
        "/en/interviews",
        "/en/conspect/frontend/css",
      ),
      false,
    );
  });
});