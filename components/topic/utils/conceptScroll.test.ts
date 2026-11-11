import assert from "node:assert/strict";
import test from "node:test";
import { HANDBOOK_MAIN_ID } from "@/constants";
import { resetHandbookReadingScroll } from "./conceptScroll";

test("resetHandbookReadingScroll zeros main and concept body panes", () => {
  const previousDocument = globalThis.document;
  const previousHTMLElement = globalThis.HTMLElement;
  class FakeHTMLElement {
    scrollTop = 0;
  }
  const main = new FakeHTMLElement();
  main.scrollTop = 840;
  const body = new FakeHTMLElement();
  body.scrollTop = 320;
  Object.defineProperty(globalThis, "HTMLElement", {
    configurable: true,
    value: FakeHTMLElement,
  });
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: {
      getElementById(id: string) {
        return id === HANDBOOK_MAIN_ID ? main : null;
      },
      querySelector(selector: string) {
        return selector.includes("concept-detail-body-scroll") ? body : null;
      },
    },
  });

  try {
    resetHandbookReadingScroll();
    assert.equal(main.scrollTop, 0);
    assert.equal(body.scrollTop, 0);
  } finally {
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: previousDocument,
    });
    Object.defineProperty(globalThis, "HTMLElement", {
      configurable: true,
      value: previousHTMLElement,
    });
  }
});
