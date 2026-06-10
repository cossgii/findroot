Cypress.Commands.add('login', (loginId = 'testuser', password = 'test1234!') => {
  cy.visit('/login');
  cy.get('input[name="loginId"]').type(loginId);
  cy.get('input[name="password"]').type(password);
  cy.get('button[type="submit"]').click();
  cy.url().should('eq', Cypress.config().baseUrl + '/');
});

