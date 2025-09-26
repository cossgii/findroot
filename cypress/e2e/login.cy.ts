describe('로그인 및 로그아웃 테스트', () => {
  beforeEach(() => {
    cy.task('db:cleanup');
  });

  it('사용자는 성공적으로 로그인하고 로그아웃할 수 있어야 한다', () => {
    // 1. 로그인 페이지 방문
    cy.visit('/login');

    // 2. 테스트 계정 정보 입력
    cy.get('input[name="loginId"]').type('testuser');
    cy.get('input[name="password"]').type('test1234!');

    // 3. 로그인 버튼 클릭
    cy.get('button[type="submit"]').click();

    // 4. 메인 페이지로 리디렉션되었는지 확인
    cy.url().should('eq', Cypress.config().baseUrl + '/');

    // 5. 사용자 메뉴(아바타)가 보이는지 확인
    cy.get('[data-testid="user-avatar-button"]').should('be.visible');

    // 6. 사용자 메뉴 클릭하여 드롭다운 열기
    cy.get('[data-testid="user-avatar-button"]').click();

    // 7. 로그아웃 버튼 클릭
    cy.contains('li', '로그아웃').click();

    // 8. 로그아웃 후 로그인 버튼이 다시 보이는지 확인
    cy.contains('a', '로그인').should('be.visible');
  });
});