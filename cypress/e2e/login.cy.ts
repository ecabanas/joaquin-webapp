describe('Login and Logout Flow', () => {
  // Use a unique email for each test run to ensure independence
  const uniqueEmail = `test-user-${Date.now()}@example.com`;
  const password = 'password123';
  const name = 'Test User';

  before(() => {
    // Before this test file runs, we need a user to exist in Firebase.
    // The most reliable way to do this in a CI environment is to
    // sign them up programmatically via the UI.
    cy.visit('/signup');
    cy.get('input#name').type(name);
    cy.get('input#email').type(uniqueEmail);
    cy.get('input#password').type(password);
    cy.get('button[type="submit"]').click();

    // Wait for redirection and ensure we are on the list page
    cy.url().should('include', '/list');
    cy.get('h1').contains('Grocery List').should('be.visible');

    // Now, log the user out to set up for the login test
    cy.get('button[aria-label="Account Options"]').click();
    cy.contains('Log out').click();

    // Assert we are back on the landing page
    cy.get('h1').contains('gets it.').should('be.visible');
  });

  it('should allow a registered user to log in and log out', () => {
    // 1. Visit the login page
    cy.visit('/login');

    // 2. Fill in the login form with the user created in the `before` hook
    cy.get('input#email').type(uniqueEmail);
    cy.get('input#password').type(password);
    cy.get('button[type="submit"]').click();

    // 3. Assert redirection to the list page
    cy.url().should('include', '/list');
    cy.get('h1').contains('Grocery List').should('be.visible');

    // 4. Assert that the user's name is visible in the sidebar, confirming login
     cy.get('button[aria-label="Account Options"]').trigger('mouseover');
     cy.get('p').contains(name).should('be.visible');
     cy.get('button[aria-label="Account Options"]').trigger('mouseout');


    // 5. Log the user out
    cy.get('button[aria-label="Account Options"]').click();
    cy.contains('Log out').click();

    // 6. Assert we are back on the landing page
    cy.get('h1').contains('gets it.').should('be.visible');
  });
});
