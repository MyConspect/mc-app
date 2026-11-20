describe("handbook sidebar", () => {
  beforeEach(() => {
    cy.viewport(1280, 800);
    cy.clearLocalStorage();
  });















  it("switches from Patterns back to Core on the Algorithms hub", () => {
    cy.visit("/en/algorithms#patterns");
    cy.nav("cluster", "patterns").should("have.attr", "aria-expanded", "true");

    cy.nav("cluster", "algorithms").click();

    cy.nav("cluster", "algorithms").should(
      "have.attr",
      "aria-expanded",
      "true",
    );
    cy.sidebar().contains("Algorithm").should("be.visible");
    cy.nav("cluster", "patterns").should("have.attr", "aria-expanded", "false");
  });

  it("shows Redux under React Ecosystem in breadcrumbs", () => {
    cy.visit("/en/frontend/react-redux");
    cy.contains("nav[aria-label='Breadcrumb']", "Ecosystem").should(
      "be.visible",
    );
    cy.contains("nav[aria-label='Breadcrumb']", "Redux").should("be.visible");
    cy.contains("h1", "Redux");
    cy.nav("cluster", "ecosystem").should("have.attr", "aria-expanded", "true");
    cy.nav("topic", "react-redux").should("be.visible").and("contain", "Redux");
  });

  it("shows TanStack under React Ecosystem in breadcrumbs", () => {
    cy.visit("/en/frontend/react-tanstack");
    cy.contains("nav[aria-label='Breadcrumb']", "React").should("be.visible");
    cy.contains("nav[aria-label='Breadcrumb']", "Ecosystem").should(
      "be.visible",
    );
    cy.contains("nav[aria-label='Breadcrumb']", "TanStack").should(
      "be.visible",
    );
    cy.contains("h1", "TanStack");
    cy.nav("cluster", "ecosystem").should("have.attr", "aria-expanded", "true");
    cy.nav("topic", "react-tanstack")
      .should("be.visible")
      .and("contain", "TanStack");
  });


  it("keeps an open Structure topic stuck after its concepts scroll away", () => {
    cy.viewport(1280, 560);
    cy.visit("/en/frontend/html-structure");
    cy.nav("topic", "html-structure").should(
      "have.attr",
      "aria-expanded",
      "true",
    );
    cy.sidebar().contains("Global attributes").should("be.visible");

    cy.get("#handbook-nav-aside").then(($aside) => {
      const aside = $aside[0];
      const forms = aside.querySelector(
        '[data-nav="topic"][data-nav-id="html-forms"]',
      ) as HTMLElement | null;
      expect(forms, "Forms topic").to.exist;
      if (!forms) {
        return;
      }
      aside.scrollTop +=
        forms.getBoundingClientRect().top -
        aside.getBoundingClientRect().top -
        140;
    });

    cy.nav("topic", "html-structure").should("be.visible");
    cy.nav("topic", "html-forms").should("be.visible");
    cy.nav("cluster", "core").should(($core) => {
      const structure = Cypress.$(
        '#handbook-sidebar [data-nav="topic"][data-nav-id="html-structure"]',
      )[0];
      expect(structure.getBoundingClientRect().top).to.be.gte(
        $core[0].getBoundingClientRect().bottom - 1,
      );
    });
  });

  it("keeps Forms in the sidebar view when Structure collapses", () => {
    cy.viewport(1280, 560);
    cy.visit("/en/frontend/html-structure#doctype");
    cy.nav("topic", "html-structure").should(
      "have.attr",
      "aria-expanded",
      "true",
    );
    cy.sidebar().contains("DOCTYPE").should("be.visible");

    cy.get("#handbook-nav-aside").then(($aside) => {
      const aside = $aside[0];
      const forms = aside.querySelector(
        '[data-nav="topic"][data-nav-id="html-forms"]',
      ) as HTMLElement | null;
      expect(forms, "Forms topic").to.exist;
      if (!forms) {
        return;
      }
      aside.scrollTop +=
        forms.getBoundingClientRect().top -
        aside.getBoundingClientRect().top -
        96;
    });

    cy.nav("topic", "html-forms").then(($forms) => {
      cy.wrap($forms).click({ scrollBehavior: false, force: true });
      cy.url().should("include", "/frontend/html-forms");
      cy.nav("topic", "html-forms").should(
        "have.attr",
        "aria-expanded",
        "true",
      );
      cy.nav("topic", "html-structure").should(
        "have.attr",
        "aria-expanded",
        "false",
      );
      cy.nav("topic", "html-forms").should("be.visible");
      cy.nav("topic", "html-forms").should(($el) => {
        const liveAside = Cypress.$("#handbook-nav-aside")[0];
        expect(liveAside, "sidebar scroller").to.exist;
        const box = $el[0].getBoundingClientRect();
        const asideBox = liveAside.getBoundingClientRect();
        expect(box.top).to.be.gte(asideBox.top - 1);
        expect(box.top).to.be.lt(asideBox.bottom);
      });
    });
  });

  it("opens a concept in detail view when chosen from the page list", () => {
    cy.viewport(390, 844);
    cy.visit("/en/frontend/react-core");
    cy.conceptIndexList().contains("button", "JSX").click();
    cy.location("hash").should("eq", "#jsx");
    cy.conceptArticle("jsx").should("be.visible");
    cy.get("main article.concept-detail-article").should("have.length", 1);
    cy.get('.concept-detail-dock button[aria-label="Back"]').should("exist");

    cy.get('.concept-detail-dock button[aria-label="Next"]').click({
      force: true,
    });
    cy.location("hash").should("eq", "#fragments");
    cy.conceptArticle("fragments").should("be.visible");
    cy.conceptArticle("jsx").should("not.exist");
  });

  it("returns to the topic index when Back after opening from the page list", () => {
    cy.viewport(390, 844);
    cy.visit("/en/frontend/core-browser-platform");
    cy.conceptIndexList()
      .contains("button", "Multi-process architecture")
      .click();
    cy.location("hash").should("eq", "#multi-process-architecture");
    cy.conceptArticle("multi-process-architecture").should("be.visible");
    cy.conceptIndexList().should("not.exist");

    cy.conceptNavButton("Back").click({ force: true });
    cy.location("hash").should("eq", "");
    cy.conceptIndexList().should("be.visible");
    cy.conceptArticle("multi-process-architecture").should("not.exist");
  });

  it("returns to the prior concept when Back follows Next in the topic", () => {
    cy.viewport(390, 844);
    cy.visit("/en/frontend/react-core");
    cy.conceptIndexList().contains("button", "JSX").click();
    cy.conceptNavButton("Next").click({ force: true });
    cy.location("hash").should("eq", "#fragments");
    cy.conceptNavButton("Back").click({ force: true });
    cy.location("hash").should("eq", "#jsx");
    cy.conceptArticle("jsx").should("be.visible");
  });

  it("uses topic list order for Back on a direct concept link", () => {
    cy.viewport(390, 844);
    cy.visit("/en/frontend/react-core#fragments");
    cy.conceptArticle("fragments").should("be.visible");
    cy.get('.concept-detail-dock button[aria-label="Back"]').click({
      force: true,
    });
    cy.location("hash").should("eq", "#jsx");
    cy.conceptArticle("jsx").should("be.visible");
  });

  it("navigates concepts with Back and Next on mobile", () => {
    cy.viewport(390, 844);
    cy.visit("/en/frontend/html-structure#basic-html-document-structure");
    cy.get('.concept-detail-dock button[aria-label="Next"]').click({
      force: true,
    });
    cy.location("hash").should("eq", "#doctype");
    cy.get('.concept-detail-dock button[aria-label="Back"]').click({
      force: true,
    });
    cy.location("hash").should("eq", "#basic-html-document-structure");
  });

  it("shows neither Back nor Next on topic index for mobile handbook nav", () => {
    cy.viewport(390, 844);
    cy.visit("/en/frontend/html-structure");
    cy.conceptNavButton("Back").should("not.exist");
    cy.conceptNavButton("Next").should("not.exist");
  });

  it("does not show Back on database foundations topic index", () => {
    cy.viewport(390, 844);
    cy.clearLocalStorage();
    cy.visit("/en/databases/database-foundations");
    cy.contains("h1", "Core");
    cy.contains("button", "Database overview").should("be.visible");
    cy.conceptNavButton("Back").should("not.exist");
    cy.conceptNavButton("Next").should("not.exist");
  });

  it("does not show Back on behavior questions topic index", () => {
    cy.viewport(390, 844);
    cy.visit("/en/behavior");
    cy.contains("button", "Tell me about yourself").should("be.visible");
    cy.conceptNavButton("Back").should("not.exist");
    cy.conceptNavButton("Next").should("not.exist");
  });






  it("opens an HTML topic menu without navigating away from the current topic", () => {
    cy.viewport(441, 931);
    cy.visit("/en/frontend/html-structure");
    cy.contains("button", "Open topics").click();
    cy.nav("topic", "html-semantics").should(
      "have.attr",
      "aria-expanded",
      "false",
    );

    cy.nav("topic", "html-semantics").click();

    cy.location("pathname").should("eq", "/en/frontend/html-structure");
    cy.nav("topic", "html-semantics").should(
      "have.attr",
      "aria-expanded",
      "true",
    );
    cy.nav("topic", "html-structure").should(
      "have.attr",
      "aria-expanded",
      "false",
    );
  });

  it("opens the chosen concept in detail view from the sidebar", () => {
    cy.visit("/en/frontend/html-performance#core-web-vitals");
    cy.conceptArticle("core-web-vitals").should("be.visible");

    const cachingId = "caching-historical-note-applicationcache";
    cy.get(`#handbook-sidebar [data-concept-id="${cachingId}"]`).click({
      scrollBehavior: false,
      force: true,
    });
    cy.location("hash").should("eq", `#${cachingId}`);
    cy.conceptArticle(cachingId).should("be.visible");
    cy.get("main article.concept-detail-article").should("have.length", 1);
    cy.conceptArticle("core-web-vitals").should("not.exist");
  });

  it("restores search and the last page from browser storage", () => {
    cy.visit("/en/frontend/react-core");
    cy.desktopSearchMode("notes").click();
    cy.get('input[placeholder="Search in notes…"]').clear().type("useState");
    cy.wait(400);
    cy.reload();
    cy.get('input[placeholder="Search in notes…"]').should(
      "have.value",
      "useState",
    );
    cy.desktopSearchMode("notes").should("have.attr", "aria-checked", "true");

    cy.visit("/en");
    cy.location("pathname").should("not.eq", "/");
    cy.get('input[placeholder="Search in notes…"]').should(
      "have.value",
      "useState",
    );
  });

  it("does not search inside notes in Topics mode", () => {
    cy.visit("/en/frontend/js-browser-extra");
    cy.desktopSearchMode("titles").should("have.attr", "aria-checked", "true");
    cy.get('input[placeholder="Search topics…"]').should("be.visible");
    cy.get('input[placeholder="Search topics…"]').clear();
    cy.get('input[placeholder="Search topics…"]').type("resize layout");
    cy.wait(400);
    cy.sidebar().should("contain", "No topics or concepts match that search.");
    cy.get("#handbook-sidebar [data-search-in='notes']").should("not.exist");
  });

  it("keeps search mode buttons inside the phone header", () => {
    cy.viewport(384, 844);
    cy.visit("/en/databases");
    cy.get("#handbook-header [data-search-mode]").should(($buttons) => {
      const viewportRight = 384;
      expect($buttons.length).to.be.greaterThan(0);
      for (const button of $buttons) {
        const box = button.getBoundingClientRect();
        expect(box.left).to.be.at.least(0);
        expect(box.right).to.be.at.most(viewportRight);
      }
    });
    cy.get('#handbook-header [data-search-mode="titles"]').should(
      "have.attr",
      "aria-label",
      "Search mode: Topics. Switch to Notes.",
    );
    cy.get('#handbook-header [data-search-mode="titles"]').should(
      "have.attr",
      "aria-pressed",
      "false",
    );
    cy.get('#handbook-header [data-search-mode="titles"] svg').should(
      "be.visible",
    );
    cy.get("#handbook-header > header > div").should(($row) => {
      expect($row[0].scrollWidth).to.be.at.most($row[0].clientWidth + 1);
    });
  });

  it("keeps the overlay open until a concept is chosen", () => {
    cy.viewport(390, 844);
    cy.visit("/en/frontend/web-api");
    cy.contains("button", "Open topics").click();
    cy.get('button[aria-label="Close topics"]').should(
      "have.attr",
      "tabindex",
      "-1",
    );
    cy.get('button[aria-label="Close topics"]').should(
      "have.attr",
      "aria-hidden",
      "true",
    );
    cy.get("#handbook-main").should("have.attr", "inert");
    cy.get("aside").should(($aside) => {
      const box = $aside[0].getBoundingClientRect();
      expect(box.top).to.be.closeTo(56, 2);
      expect(box.left).to.be.closeTo(0, 2);
      expect(box.right).to.be.closeTo(390, 2);
      expect(box.bottom).to.be.closeTo(844, 2);
    });

    cy.nav("cluster", "core").click();
    cy.get('button[aria-label="Close topics"]').should(
      "have.attr",
      "tabindex",
      "-1",
    );
    cy.sidebar().contains("HTTP").should("be.visible");

    cy.nav("topic", "web-api-http").click({ force: true });
    cy.sidebar().contains("HTTP protocol").should("exist");

    cy.get('#handbook-sidebar [data-concept-id="http-protocol"]')
      .should("exist")
      .click({ force: true, scrollBehavior: false });
    cy.get('button[aria-label="Close topics"]').should(
      "have.attr",
      "tabindex",
      "-1",
    );
    cy.get("#handbook-main").should("not.have.attr", "inert");
    cy.location("pathname").should("eq", "/en/frontend/web-api-http");
    cy.location("hash").should("eq", "#http-protocol");
  });

  it("keeps the active item in its natural position when opening the mobile sidebar", () => {
    cy.viewport(441, 931);
    cy.visit("/en/frontend/core#html-parsing-and-the-dom");
    cy.contains("button", "Open topics").click();

    cy.get("#handbook-nav-aside").should("have.prop", "scrollTop", 0);
    cy.nav("track", "frontend").then(($frontend) => {
      cy.nav("subject", "core").should(($active) => {
        expect($active[0].getBoundingClientRect().top).to.be.greaterThan(
          $frontend[0].getBoundingClientRect().bottom,
        );
      });
    });
  });


  it("closes the mobile sidebar when crossing the desktop breakpoint", () => {
    cy.viewport(390, 844);
    cy.visit("/en/frontend/web-api");
    cy.contains("button", "Open topics").click();
    cy.get("#handbook-main").should("have.attr", "inert");

    cy.viewport(1024, 844);
    cy.get('#handbook-header button[aria-controls="handbook-sidebar"]').should(
      "have.attr",
      "aria-expanded",
      "false",
    );
    cy.get("#handbook-main").should("not.have.attr", "inert");

    cy.viewport(390, 844);
    cy.get("#handbook-sidebar").should("not.be.visible");
  });

  it("shows the last updated day, month, and year next to contact links", () => {
    cy.visit("/en");
    cy.get("nav[aria-label='Contact']").should("be.visible");
    cy.contains("Last updated")
      .closest("time")
      .should("have.attr", "datetime")
      .and("match", /^\d{4}-\d{2}-\d{2}$/);
    cy.contains("Last updated")
      .closest("time")
      .invoke("text")
      .should("match", /\d{1,2} [A-Z][a-z]+ \d{4}/);
  });

  it("anchors the desktop sidebar dock button to the header seam center", () => {
    cy.visit("/en/frontend/html-structure");

    cy.get("[data-sidebar-dock]").should("be.visible");
    cy.get("[data-sidebar-dock]").then(($btn) => {
      cy.get("#handbook-header").then(($header) => {
        cy.get("div.relative.flex.min-h-0.flex-1")
          .first()
          .then(($shell) => {
            const btn = $btn[0].getBoundingClientRect();
            const header = $header[0].getBoundingClientRect();
            const shell = $shell[0].getBoundingClientRect();
            const btnCenterY = btn.top + btn.height / 2;
            expect(btnCenterY).to.be.closeTo(header.bottom, 2);
            expect(btnCenterY).to.be.closeTo(shell.top, 2);
          });
      });
    });
    cy.get("[data-sidebar-dock]").should(($dock) => {
      expect($dock.css("left")).to.match(/^(150px|9\.375rem)$/);
    });

    cy.get("[data-sidebar-dock]").click();
    cy.get("[data-sidebar-dock]").should(
      "have.attr",
      "aria-label",
      "Expand topics",
    );
    cy.get("[data-sidebar-dock]").should(($dock) => {
      expect($dock.css("left")).to.match(/^(40px|2\.5rem)$/);
    });
  });

  it("collapses the desktop sidebar and restores it", () => {
    cy.visit("/en/frontend/html-structure");
    cy.sidebar().should("be.visible");
    cy.get('button[aria-label="Collapse topics"]').click();
    cy.sidebar().should("not.be.visible");
    cy.reload();
    cy.sidebar().should("not.be.visible");
    cy.get('button[aria-label="Expand topics"]').should("be.visible").click();
    cy.sidebar().should("be.visible");
  });

  it("toggles the desktop sidebar open and closed repeatedly via the dock", () => {
    cy.visit("/en/frontend/html-structure");
    cy.get('button[aria-label="Collapse topics"]').click();
    cy.sidebar().should("not.be.visible");

    cy.get('button[aria-label="Expand topics"]').click();
    cy.sidebar().should("be.visible");
    cy.get('button[aria-label="Collapse topics"]').click();
    cy.sidebar().should("not.be.visible");

    cy.get('button[aria-label="Expand topics"]').click();
    cy.sidebar().should("be.visible");
    cy.get('button[aria-label="Collapse topics"]').click();
    cy.sidebar().should("not.be.visible");
  });

  it("keeps the sidebar collapsed after dock collapse when the pointer is over the rail", () => {
    cy.visit("/en/frontend/html-structure");
    cy.get('button[aria-label="Collapse topics"]').click();
    cy.get('button[aria-label="Expand topics"]').click();
    cy.sidebar().should("be.visible");
    cy.get('button[aria-label="Collapse topics"]').click({ force: true });
    cy.sidebar().should("not.be.visible");

    cy.pointerOn("aside", "pointerenter");
    cy.wait(350);
    cy.sidebar().should("not.be.visible");
    cy.get('button[aria-label="Expand topics"]').should("be.visible");
  });

  it("collapses the desktop sidebar while a search query is active", () => {
    cy.visit("/en/system-design/sd-core");
    cy.get('input[placeholder="Search topics…"]').clear().type("design");
    cy.wait(400);
    cy.sidebar().should("be.visible");
    cy.get('button[aria-label="Collapse topics"]').click();
    cy.sidebar().should("not.be.visible");
    cy.get('button[aria-label="Expand topics"]').should("be.visible");
    cy.get('input[placeholder="Search topics…"]').should(
      "have.value",
      "design",
    );
  });

  it("peeks the collapsed sidebar while searching", () => {
    cy.visit("/en/system-design/sd-core");
    cy.get('input[placeholder="Search topics…"]').clear().type("design");
    cy.wait(400);
    cy.get("[data-sidebar-dock]").click();
    cy.get("#handbook-nav-aside").should("not.be.visible");

    cy.wait(350);
    cy.pointerOn("aside", "pointerenter");
    cy.wait(200);
    cy.get("#handbook-nav-aside").should("not.be.visible");

    cy.pointerOn("aside", "pointerleave");
    cy.wait(150);
    cy.get("#handbook-nav-aside").should("not.be.visible");
    cy.pointerOn("[data-sidebar-dock]", "pointerenter");
    cy.get("#handbook-nav-aside").should("not.be.visible");
  });

  it("peeks the collapsed sidebar on hover and collapses again on leave", () => {
    cy.visit("/en/frontend/html-structure");
    cy.get('button[aria-label="Collapse topics"]').click();
    cy.get('button[aria-label="Expand topics"]').should("be.visible");

    cy.pointerOn("aside", "pointerenter");
    cy.sidebar().should("be.visible");
    cy.sidebar().contains("HTML").should("be.visible");

    cy.pointerOn("aside", "pointerleave");
    cy.sidebar().should("not.be.visible");
    cy.get('button[aria-label="Expand topics"]').should("be.visible");
  });

  it("does not peek the collapsed sidebar when hovering the dock button", () => {
    cy.visit("/en/frontend/html-structure");
    cy.get('button[aria-label="Collapse topics"]').click();
    cy.sidebar().should("not.be.visible");

    cy.pointerOn('button[aria-label="Expand topics"]', "pointerenter");
    cy.sidebar().should("not.be.visible");
  });

  it("keeps a peeked sidebar open when the pointer moves onto the dock", () => {
    cy.visit("/en/frontend/html-structure");
    cy.get('button[aria-label="Collapse topics"]').click();
    cy.pointerOn("aside", "pointerenter");
    cy.sidebar().should("be.visible");

    cy.pointerOn('button[aria-label="Expand topics"]', "pointerover");
    cy.sidebar().should("be.visible");
  });

  it("opens the sidebar when the dock is clicked during a peek", () => {
    cy.visit("/en/frontend/html-structure");
    cy.get("[data-sidebar-dock]").click();
    cy.get("[data-sidebar-dock]").should(
      "have.attr",
      "aria-label",
      "Expand topics",
    );
    cy.pointerOn("aside", "pointerenter");
    cy.sidebar().contains("HTML").should("be.visible");

    cy.get("[data-sidebar-dock]").click({ force: true });
    cy.get("[data-sidebar-dock]").should(
      "have.attr",
      "aria-label",
      "Collapse topics",
    );
    cy.get("[data-sidebar-dock]").should("have.attr", "aria-expanded", "true");
    cy.sidebar().contains("HTML").should("be.visible");
  });

  it("closes peek after hovering the sidebar, dock, and away", () => {
    cy.visit("/en/frontend/html-structure");
    cy.get('button[aria-label="Collapse topics"]').click();
    cy.pointerOn("aside", "pointerenter");
    cy.sidebar().should("be.visible");

    cy.pointerOn('button[aria-label="Expand topics"]', "pointerover");
    cy.sidebar().should("be.visible");

    cy.get("[data-sidebar-dock]").trigger("pointerleave", {
      pointerType: "mouse",
    });
    cy.wait(100);
    cy.sidebar().should("not.be.visible");
    cy.get('button[aria-label="Expand topics"]').should("be.visible");
  });
});
