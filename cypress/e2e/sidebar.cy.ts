describe("handbook sidebar", () => {
  beforeEach(() => {
    cy.viewport(1280, 800);
    cy.clearLocalStorage();
  });

  it("shows CSS Core as a single row instead of nested Fundamentals", () => {
    cy.visit("/en/frontend/css");
    cy.nav("cluster", "core").should("be.visible").and("contain", "Core");
    cy.nav("topic", "css-fundamentals").should("not.exist");
    cy.nav("topic", "css-core").should("not.exist");
    cy.nav("cluster", "core").click();
    cy.location("pathname").should("eq", "/en/frontend/css-core");
    cy.contains("h2", "Core");
  });

  it("highlights Frontend while CSS is the open page", () => {
    cy.visit("/en/frontend/css");
    cy.nav("track", "frontend").should("have.attr", "aria-expanded", "true");
    cy.nav("track", "frontend").should("have.class", "bg-yellow-50");
    cy.nav("subject", "css").should("have.class", "bg-yellow-50");

    cy.nav("track", "frontend").then(($el) => {
      $el[0].click();
    });
    cy.nav("track", "frontend").should("have.attr", "aria-expanded", "false");
    cy.nav("track", "frontend").should("have.class", "bg-yellow-50");
    cy.nav("track", "backend").should("not.have.class", "bg-yellow-50");
  });

  it("opens the Backend hub when that track is chosen from System design", () => {
    cy.visit("/en/system-design");
    cy.contains("h1", "System design");

    cy.nav("track", "backend").click();

    cy.location("pathname").should("eq", "/en/backend");
    cy.contains("h1", "Backend");
    cy.contains("h2", "Node.js");
    cy.contains("h2", "Database");
    cy.nav("track", "backend").should("have.attr", "aria-expanded", "true");
    cy.nav("subject", "nodejs").should("be.visible");
    cy.nav("subject", "database").should("be.visible");
  });

  it("does not keep a concept highlighted after switching tracks", () => {
    cy.visit("/en/frontend/js-loops#error-handling");
    cy.get('#handbook-sidebar [data-concept-id="error-handling"]').should(
      "have.class",
      "bg-yellow-50",
    );

    cy.nav("track", "system-design").click();
    cy.location("pathname").should("eq", "/en/system-design");
    cy.nav("track", "system-design").should("have.class", "bg-yellow-50");
  });

  it("highlights only the current track and collapses other tracks", () => {
    cy.visit("/en/frontend/javascript");
    cy.nav("track", "frontend").should("have.class", "bg-yellow-50");
    cy.nav("subject", "javascript").should("have.class", "bg-yellow-50");

    cy.nav("track", "system-design").click();
    cy.location("pathname").should("eq", "/en/system-design");

    cy.nav("track", "system-design").should("have.class", "bg-yellow-50");
    cy.nav("track", "system-design").should(
      "have.attr",
      "aria-expanded",
      "true",
    );
    cy.nav("track", "frontend").should("not.have.class", "bg-yellow-50");
    cy.nav("track", "frontend").should("have.attr", "aria-expanded", "false");
    cy.nav("subject", "javascript").should("not.exist");
  });

  it("opens only one track at a time when choosing another track", () => {
    cy.visit("/en/frontend/html-structure");
    cy.nav("track", "frontend").should("have.attr", "aria-expanded", "true");

    cy.nav("track", "data-structures").click();
    cy.location("pathname").should("eq", "/en/data-structures");
    cy.nav("track", "data-structures").should(
      "have.attr",
      "aria-expanded",
      "true",
    );
    cy.nav("track", "frontend").should("have.attr", "aria-expanded", "false");

    cy.nav("track", "system-design").click();
    cy.location("pathname").should("eq", "/en/system-design");
    cy.nav("track", "system-design").should(
      "have.attr",
      "aria-expanded",
      "true",
    );
    cy.nav("track", "data-structures").should(
      "have.attr",
      "aria-expanded",
      "false",
    );
  });

  it("keeps Patterns open when opening it from Algorithms Big O", () => {
    cy.visit("/en/algorithms/algorithms-core#time-vs-space-complexity");
    cy.nav("track", "algorithms").should("have.attr", "aria-expanded", "true");
    cy.nav("cluster", "big-o").should("have.attr", "aria-expanded", "true");
    cy.sidebar().contains("Time vs space complexity").should("be.visible");

    cy.nav("cluster", "patterns").click();

    cy.nav("cluster", "patterns").should("have.attr", "aria-expanded", "true");
    cy.sidebar().contains("Patterns").should("be.visible");
    cy.nav("cluster", "big-o").should("have.attr", "aria-expanded", "false");
    cy.nav("cluster", "algorithms").should(
      "have.attr",
      "aria-expanded",
      "false",
    );
    cy.nav("track", "algorithms").should("have.attr", "aria-expanded", "true");
    cy.url().should("include", "/algorithms");
    cy.url().should("include", "patterns");
  });

  it("opens Data Structures as its own track from Algorithms", () => {
    cy.visit("/en/algorithms");
    cy.nav("track", "data-structures").click();

    cy.location("pathname").should("eq", "/en/data-structures");
    cy.contains("h1", "Data Structures");
    cy.nav("track", "data-structures").should(
      "have.attr",
      "aria-expanded",
      "true",
    );
    cy.sidebar().contains("Choosing a data structure").should("be.visible");
  });

  it("shows System design Core as a single row instead of nested Foundations", () => {
    cy.visit("/en/system-design");
    cy.nav("cluster", "core").should("be.visible").and("contain", "Core");
    cy.nav("topic", "sd-foundations").should("not.exist");
    cy.nav("cluster", "core").click();
    cy.location("pathname").should("eq", "/en/system-design/sd-core");
    cy.contains("h1", "Core");
  });

  it("opens SOLID under System design Principles", () => {
    cy.visit("/en/system-design");
    cy.nav("cluster", "principles").click();
    cy.nav("topic", "solid").should("be.visible").and("contain", "OOP & SOLID");
    cy.nav("topic", "sd-principles")
      .should("be.visible")
      .and("contain", "DRY, KISS, YAGNI");
    cy.nav("topic", "sd-grasp").should("be.visible").and("contain", "GRASP");
    cy.nav("topic", "sd-grasp").click();
    cy.location("pathname").should("eq", "/en/system-design/sd-grasp");
    cy.sidebar().contains("GRASP principles").should("not.exist");
    cy.contains("h1", "GRASP");
    cy.contains("General Responsibility Assignment Software Patterns").should(
      "be.visible",
    );
    cy.get("main .concept-list > details").should("not.exist");
    cy.nav("topic", "solid").click();
    cy.location("pathname").should("eq", "/en/system-design/solid");
    cy.contains("h1", "OOP & SOLID");
    cy.sidebar().contains("Single Responsibility (SRP)").should("be.visible");
  });

  it("opens Architecture patterns under System design Architecture", () => {
    cy.visit("/en/system-design");
    cy.nav("cluster", "architecture").click();
    cy.nav("topic", "special-architecture").should("be.visible");
    cy.nav("topic", "sd-architecture").should("be.visible");
    cy.nav("topic", "special-patterns")
      .should("be.visible")
      .and("contain", "Design patterns");
    cy.nav("cluster", "additional").should("not.exist");
    cy.nav("topic", "sd-patterns").should("not.exist");
    cy.nav("topic", "special-patterns").click();
    cy.location("pathname").should("eq", "/en/system-design/special-patterns");
    cy.contains("h1", "Design patterns");
    cy.sidebar().contains("GOF design patterns — catalog").should("be.visible");
    cy.sidebar().contains("Mediator").should("be.visible");
    cy.nav("topic", "special-architecture").click();
    cy.location("pathname").should(
      "eq",
      "/en/system-design/special-architecture",
    );
    cy.contains("h1", "Architecture patterns");
    cy.sidebar().contains("MVC (Model-View-Controller)").should("be.visible");
  });

  it("opens Computer science from Other without sending the track to Algorithms", () => {
    cy.visit("/en/other");
    cy.nav("subject", "git").should("be.visible");
    cy.nav("topic", "special-sdlc").should("not.exist");
    cy.nav("track", "ai").should("be.visible");
    cy.nav("subject", "web-security").should("not.exist");
    cy.nav("topic", "computer-science").should("be.visible");
    cy.nav("subject", "paradigms").should("not.exist");
    cy.nav("cluster", "additional").should("not.exist");
    cy.nav("cluster", "engineering").should("not.exist");

    cy.nav("topic", "computer-science").click();

    cy.location("pathname").should("eq", "/en/other/computer-science");
    cy.contains("h1", "Computer science");
    cy.nav("subject", "web-security").should("not.exist");
  });

  it("opens Patterns from the Algorithms hub without collapsing the track", () => {
    cy.visit("/en/algorithms");
    cy.nav("track", "algorithms").should("have.attr", "aria-expanded", "true");
    cy.nav("cluster", "patterns").click();

    cy.nav("cluster", "patterns").should("have.attr", "aria-expanded", "true");
    cy.sidebar().contains("Patterns").should("be.visible");
    cy.nav("cluster", "algorithms").should(
      "have.attr",
      "aria-expanded",
      "false",
    );
    cy.nav("track", "algorithms").should("have.attr", "aria-expanded", "true");
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

  it("opens React 19 from Hooks and closes Core", () => {
    cy.visit("/en/frontend/react-hooks");
    cy.nav("cluster", "react-19").should("be.visible");
    cy.nav("cluster", "react-19").click();

    cy.location("pathname").should("eq", "/en/frontend/react-server");
    cy.nav("cluster", "react-19").should("have.attr", "aria-expanded", "true");
    cy.sidebar().contains("Overview").should("be.visible");
    cy.nav("cluster", "core").should("have.attr", "aria-expanded", "false");
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
    cy.get("main nav.concept-list").contains("button", "JSX").click();
    cy.location("hash").should("eq", "#jsx");
    cy.conceptArticle("jsx").should("be.visible");
    cy.get("main article.concept-list").should("have.length", 1);
    cy.get('.concept-detail-dock button[aria-label="Back"]').should("exist");

    cy.get('.concept-detail-dock button[aria-label="Next"]').click({
      force: true,
    });
    cy.location("hash").should("eq", "#fragments");
    cy.conceptArticle("fragments").should("be.visible");
    cy.conceptArticle("jsx").should("not.exist");
  });

  it("returns to the previous concept from detail view", () => {
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
    cy.visit("/en/backend/database-foundations");
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

  it("does not show Back on subject hub card grids", () => {
    cy.visit("/en/frontend/css");
    cy.contains("h1", "CSS");
    cy.contains("a", "Core").should("be.visible");
    cy.conceptNavButton("Back").should("not.exist");
    cy.conceptNavButton("Next").should("not.exist");
  });

  it("does not show Back on interview topic index with grouped sections", () => {
    cy.visit("/en/frontend/html-interview");
    cy.contains("h2", "HTML Basics");
    cy.conceptNavButton("Back").should("not.exist");
    cy.conceptNavButton("Next").should("not.exist");
  });

  it("does not expand interview questions in the TypeScript sidebar", () => {
    cy.visit("/en/frontend/ts-interview");
    cy.nav("topic", "ts-interview")
      .should("be.visible")
      .and("not.have.attr", "aria-expanded");
    cy.sidebar().contains("What is TypeScript").should("not.exist");
  });

  it("toggles TypeScript Reference open and closed on the hub", () => {
    cy.visit("/en/frontend/typescript");
    cy.nav("section", "reference").should(
      "have.attr",
      "aria-expanded",
      "false",
    );
    cy.nav("section", "reference").click();
    cy.nav("section", "reference").should("have.attr", "aria-expanded", "true");
    cy.get('#handbook-sidebar [data-nav-id="cheat-sheets"]').should(
      "be.visible",
    );

    cy.nav("section", "reference").click();
    cy.nav("section", "reference").should(
      "have.attr",
      "aria-expanded",
      "false",
    );
  });

  it("toggles Utility Types closed while a utility topic is open", () => {
    cy.visit("/en/frontend/ts-utility-object");
    cy.nav("section", "utility-types").should(
      "have.attr",
      "aria-expanded",
      "true",
    );
    cy.nav("section", "utility-types").click();
    cy.nav("section", "utility-types").should(
      "have.attr",
      "aria-expanded",
      "false",
    );
    cy.nav("section", "utility-types").click();
    cy.nav("section", "utility-types").should(
      "have.attr",
      "aria-expanded",
      "true",
    );
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
    cy.get("main article.concept-list").should("have.length", 1);
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
    cy.visit("/en/backend/database");
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

  it("opens the search sidebar when typing on a phone", () => {
    cy.viewport(390, 844);
    cy.visit("/en/frontend/react-hooks");
    cy.get('input[placeholder="Search topics…"]').clear().type("useEf");
    cy.wait(400);
    cy.contains("button", "Close topics").should("be.visible");
    cy.sidebar().should("be.visible");
    cy.sidebar().should(($nav) => {
      const text = $nav.text().toLowerCase();
      expect(text).to.contain("useeffect");
      expect(text).not.to.contain("javascript");
    });
    cy.sidebar().contains("HTML").should("not.exist");

    cy.get('#handbook-sidebar [data-concept-id="useeffect"]').click();
    cy.get('#handbook-header button[aria-controls="handbook-sidebar"]').should(
      "have.attr",
      "aria-expanded",
      "false",
    );
    cy.location("pathname").should("eq", "/en/frontend/react-hooks");
    cy.location("hash").should("eq", "#useeffect");
    cy.conceptArticle("useeffect").should("be.visible");
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

  it("keeps adjacent mobile subject rows evenly spaced", () => {
    cy.viewport(441, 931);
    cy.visit("/en/backend/database");
    cy.contains("button", "Open topics").click();

    cy.nav("subject", "nodejs").then(($node) => {
      cy.nav("subject", "database").should(($database) => {
        const gap =
          $database[0].getBoundingClientRect().top -
          $node[0].getBoundingClientRect().bottom;
        expect(gap).to.be.closeTo(6, 1);
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
