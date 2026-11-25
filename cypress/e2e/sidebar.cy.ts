describe("handbook sidebar", () => {
  beforeEach(() => {
    cy.viewport(1280, 800);
    cy.clearLocalStorage();
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

  it("does not yellow-rail Computer Science while drilling from a Frontend interview", () => {
    cy.viewport(1280, 720);
    cy.visit("/en/interviews/frontend/web-security-questions");
    cy.nav("track", "frontend").should(
      "have.attr",
      "aria-expanded",
      "true",
    );
    cy.nav("track", "computer-science").click();
    cy.nav("track", "computer-science").should(
      "have.attr",
      "aria-expanded",
      "true",
    );
    cy.url().should("include", "/frontend/web-security-questions");
    cy.nav("track", "frontend").should(
      "have.attr",
      "aria-expanded",
      "false",
    );
    cy.nav("track", "computer-science").should(($el) => {
      expect($el.attr("class") ?? "").to.match(/\bbg-yellow-50\b/);
    });
    cy.get(
      '#handbook-sidebar [data-nav="track"][data-nav-id="computer-science"] + ul',
    ).should(($ul) => {
      const cls = $ul.attr("class") ?? "";
      expect(cls).to.match(/border-yellow-200/);
      expect(cls).not.to.match(/border-zinc-200/);
    });
    cy.nav("track", "frontend").should(($el) => {
      expect($el.attr("class") ?? "").not.to.match(/\bbg-yellow-50\b/);
    });
    cy.nav("topic", "hash-tables-questions").should(($el) => {
      expect($el.attr("class") ?? "").not.to.match(/\bbg-yellow-50\b/);
    });
  });

  it("keeps Advanced in the aside when Frontend collapses on conspect home", () => {
    cy.viewport(1280, 560);
    cy.visit("/en/conspect");
    cy.nav("track", "frontend").click();
    cy.nav("track", "frontend").should(
      "have.attr",
      "aria-expanded",
      "true",
    );

    cy.get("#handbook-nav-aside").then(($aside) => {
      const aside = $aside[0];
      const advanced = aside.querySelector(
        '[data-nav="track"][data-nav-id="advanced"]',
      ) as HTMLElement | null;
      expect(advanced, "Advanced track row").to.exist;
      if (!advanced) {
        return;
      }
      aside.scrollTop +=
        advanced.getBoundingClientRect().top -
        aside.getBoundingClientRect().top -
        aside.clientHeight +
        advanced.offsetHeight +
        48;
    });

    cy.nav("track", "advanced").click({ scrollBehavior: false, force: true });
    cy.nav("track", "advanced").should(
      "have.attr",
      "aria-expanded",
      "true",
    );
    cy.nav("track", "frontend").should(
      "have.attr",
      "aria-expanded",
      "false",
    );
    cy.nav("track", "advanced").should(($el) => {
      const liveAside = Cypress.$("#handbook-nav-aside")[0];
      expect(liveAside, "sidebar scroller").to.exist;
      const box = $el[0].getBoundingClientRect();
      const asideBox = liveAside.getBoundingClientRect();
      expect(box.top).to.be.gte(asideBox.top - 1);
      expect(box.top).to.be.lt(asideBox.bottom);
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

    cy.location("pathname").should(
      "eq",
      "/en/conspect/frontend/html-structure",
    );
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
