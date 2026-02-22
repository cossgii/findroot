describe('로그인 및 로그아웃 테스트', () => {
  beforeEach(() => {
    cy.task('db:cleanup');
  });

  it('사용자는 성공적으로 로그인하고 로그아웃할 수 있어야 한다', () => {
    cy.visit('/login');
    cy.wait(1000);
    cy.get('input[name="loginId"]').type('testuser');
    cy.get('input[name="password"]').type('test1234!');
    cy.get('button[type="submit"]').click();
    cy.url().should('eq', Cypress.config().baseUrl + '/');
    cy.get('[data-testid="user-avatar-button"]').should('be.visible');
    cy.get('[data-testid="user-avatar-button"]').click();
    cy.contains('li', '로그아웃').click();
    cy.contains('a', '로그인').should('be.visible');
  });
});
