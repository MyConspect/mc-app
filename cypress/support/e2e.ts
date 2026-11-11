Cypress.on("uncaught:exception", (err) => {
  if (
    /Minified React error #418|Hydration failed|ResizeObserver loop/.test(
      err.message,
    )
  ) {
    return false;
  }
});

function desktopSearchMode(mode: "titles" | "notes") {
  return cy.get(`[role=radiogroup] [data-search-mode="${mode}"]`);
}

function nav(
  kind: "track" | "subject" | "cluster" | "topic" | "section",
  id: string,
) {
  return cy.get(
    `#handbook-sidebar a[data-nav="${kind}"][data-nav-id="${id}"], #handbook-sidebar button[data-nav="${kind}"][data-nav-id="${id}"]`,
  );
}

function conceptArticle(id: string) {
  return cy.get(`main article.concept-detail-article#${id}`);
}

function conceptIndexList() {
  return cy.get("main nav.concept-list");
}

function sidebar() {
  return cy.get("#handbook-sidebar");
}

function pointerOn(
  selector: string,
  type: "pointerenter" | "pointerleave" | "pointerover",
) {
  cy.get(selector).then(($el) => {
    $el[0].dispatchEvent(
      new PointerEvent(type, {
        bubbles: type === "pointerover",
        cancelable: true,
        pointerType: "mouse",
        isPrimary: true,
      }),
    );
  });
}

function mainScroller() {
  return cy.get("#handbook-main");
}

function conceptNavButton(label: "Back" | "Next") {
  return cy.get(`.concept-detail-dock button[aria-label="${label}"]`);
}

function sidebarHydrated() {
  cy.get("#handbook-sidebar [data-nav]").should(($nodes) => {
    const names = Object.getOwnPropertyNames($nodes[0]);
    const hydrated = names.some((name) => name.toLowerCase().includes("react"));
    const marker = names.filter((name) => name.includes("$")).join(" ");
    expect(hydrated, marker || "no react props").to.equal(true);
  });
}

declare global {
  namespace Cypress {
    interface Chainable {
      nav(
        kind: "track" | "subject" | "cluster" | "topic" | "section",
        id: string,
      ): Chainable<JQuery<HTMLElement>>;
      conceptArticle(id: string): Chainable<JQuery<HTMLElement>>;
      conceptIndexList(): Chainable<JQuery<HTMLElement>>;
      sidebar(): Chainable<JQuery<HTMLElement>>;
      pointerOn(
        selector: string,
        type: "pointerenter" | "pointerleave" | "pointerover",
      ): Chainable<void>;
      mainScroller(): Chainable<JQuery<HTMLElement>>;
      desktopSearchMode(
        mode: "titles" | "notes",
      ): Chainable<JQuery<HTMLElement>>;
      conceptNavButton(label: "Back" | "Next"): Chainable<JQuery<HTMLElement>>;
    }
  }
}

Cypress.Commands.add("nav", nav);
Cypress.Commands.add("conceptArticle", conceptArticle);
Cypress.Commands.add("conceptIndexList", conceptIndexList);
Cypress.Commands.add("sidebar", sidebar);
Cypress.Commands.add("pointerOn", pointerOn);
Cypress.Commands.add("mainScroller", mainScroller);
Cypress.Commands.add("desktopSearchMode", desktopSearchMode);
Cypress.Commands.add("conceptNavButton", conceptNavButton);

Cypress.Commands.overwrite("visit", (originalFn, url, options) => {
  originalFn(url, options);
  sidebarHydrated();
});

export {};
