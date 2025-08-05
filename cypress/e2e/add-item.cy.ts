describe('Add Item to List Flow', () => {
  const uniqueEmail = `item-adder-${Date.now()}@example.com`;
  const password = 'password123';
  const name = 'Item Adder';
  const newItem = 'Milk';

  before(() => {
    // Create a user and log in before the tests run
    cy.visit('/signup');
    cy.get('input#name').type(name);
    cy.get('input#email').type(uniqueEmail);
    cy.get('input#password').type(password);
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/list');
  });

  it('should allow a logged-in user to add an item to the list', () => {
    // 1. The user is already on the list page from the `before` hook.
    //    Ensure the heading is visible.
    cy.get('h1').contains('Grocery List').should('be.visible');

    // 2. Find the search input and type the new item's name.
    cy.get('input[placeholder="Search to add an item..."]').type(newItem);

    // 3. Click the enter key to add the item.
    cy.get('input[placeholder="Search to add an item..."]').type('{enter}');

    // 4. Verify that the new item now appears in the list.
    //    We check for the label associated with the checkbox for the item.
    cy.get('label').contains(newItem).should('be.visible');

    // 5. Verify the quantity is correct.
    cy.contains(newItem).siblings().find('span').should('contain.text', 'x1');
  });
});
