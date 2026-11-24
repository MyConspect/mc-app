describe("handbook breadcrumbs", () => {
  beforeEach(() => {
    cy.viewport(1280, 800);
  });

  it("keeps the concept hash when switching language", () => {
    cy.visit("/en/frontend/html-structure#meta-tags");
    cy.get("nav[aria-label='Breadcrumb'] li")
      .last()
      .should("contain", "Meta tags");
    cy.get('[aria-label="Language"] a[hreflang="ru"]').click();
    cy.location("pathname").should(
      "eq",
      "/ru/conspect/frontend/html-structure",
    );
    cy.location("hash").should("eq", "#meta-tags");
    cy.get("nav[aria-label='Breadcrumb'] li")
      .last()
      .should("contain", "Meta tags");
  });
});
