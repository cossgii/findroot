declare namespace Cypress {
  interface Chainable {
    login(loginId?: string, password?: string): Chainable<void>;
  }
}
