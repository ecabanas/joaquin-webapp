describe('Signup Flow', () => {
  it('should allow a new user to sign up and redirect to the list page', () => {
    // Use a unique email for each test run to avoid conflicts
    const uniqueEmail = `test-user-${Date.now()}@example.com`;

    // 1. Visit the signup page
    cy.visit('/signup');

    // 2. Fill in the form
    cy.get('input#name').type('Test User');
    cy.get('input#email').type(uniqueEmail);
    cy.get('input#password').type('password123');

    // 3. Click the create account button
    cy.get('button[type="submit"]').click();

    // 4. Assert redirection to the list page
    cy.url().should('include', '/list');

    // 5. Assert that the main heading of the list page is visible
    cy.get('h1').contains('Grocery List').should('be.visible');
  });
});
