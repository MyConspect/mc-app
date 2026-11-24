describe("handbook breadcrumbs", () => {
  beforeEach(() => {
    cy.viewport(1280, 800);
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
    cy.location("pathname").should("eq", "/ru/conspect/frontend/html-structure");
    cy.location("hash").should("eq", "#meta-tags");
    cy.get("nav[aria-label='Breadcrumb'] li")
      .last()
      .should("contain", "Meta tags");
  });
});
