describe("handbook breadcrumbs", () => {
  beforeEach(() => {
    cy.viewport(1280, 800);
  });

  it("lives in the content pane and stays stuck while that pane scrolls", () => {
    cy.visit("/en/data-structures/data-structures-trees#tree");
    cy.contains("h2", "Tree");
    cy.mainScroller()
      .find("nav[aria-label='Breadcrumb']")
      .should("be.visible")
      .and("contain", "Tree");
    cy.get("#handbook-header nav[aria-label='Breadcrumb']").should("not.exist");

    cy.mainScroller().scrollTo("bottom");
    cy.mainScroller().find("nav[aria-label='Breadcrumb']").should("be.visible");
    cy.mainScroller().then(($main) => {
      const main = $main[0];
      const nav = main.querySelector("nav[aria-label='Breadcrumb']");
      expect(nav, "breadcrumb nav").to.exist;
      const sticky = nav!.closest(".sticky");
      expect(sticky, "sticky breadcrumb bar").to.exist;
      const mainBox = main.getBoundingClientRect();
      const stickyBox = sticky!.getBoundingClientRect();
      expect(stickyBox.top).to.be.closeTo(mainBox.top, 2);
    });
  });

  it("keeps Node.js current on the hub when the URL has an HTTP cluster hash", () => {
    cy.visit("/en/backend/nodejs#http");
    cy.contains("h1", "HTTP");
    cy.get("nav[aria-label='Breadcrumb'] li")
      .last()
      .should("contain", "Node.js");
    cy.get("nav[aria-label='Breadcrumb']").should("not.contain", "HTTP");
  });

  it("shows Core once on the Node.js Core topic", () => {
    cy.visit("/en/backend/nodejs-core");
    cy.contains("h1", "Core");
    cy.get("nav[aria-label='Breadcrumb']").then(($nav) => {
      const labels = [...$nav.find("li")].map((li) =>
        li.innerText.replace(/\//g, "").trim(),
      );
      expect(labels.filter((label) => label === "Core")).to.have.length(1);
      expect(labels).to.deep.equal(["Home", "Backend", "Node.js", "Core"]);
    });
  });

  it("shows React 19 once on the React React 19 topic", () => {
    cy.visit("/en/frontend/react-server");
    cy.contains("h1", "React 19");
    cy.get("nav[aria-label='Breadcrumb']").then(($nav) => {
      const labels = [...$nav.find("li")].map((li) =>
        li.innerText.replace(/\//g, "").trim(),
      );
      expect(labels.filter((label) => label === "React 19")).to.have.length(1);
      expect(labels).to.deep.equal(["Home", "Frontend", "React", "React 19"]);
    });
  });

  it("keeps the concept hash when switching language", () => {
    cy.visit("/en/frontend/html-structure#meta-tags");
    cy.get("nav[aria-label='Breadcrumb'] li")
      .last()
      .should("contain", "Meta tags");
    cy.get('[aria-label="Language"] a[hreflang="ru"]').click();
    cy.location("pathname").should("eq", "/ru/frontend/html-structure");
    cy.location("hash").should("eq", "#meta-tags");
    cy.get("nav[aria-label='Breadcrumb'] li")
      .last()
      .should("contain", "Meta tags");
  });
});
