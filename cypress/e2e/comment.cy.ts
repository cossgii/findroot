describe('댓글 기능 테스트', () => {
  let routeId: string;

  beforeEach(() => {
    cy.task('db:cleanup');
    cy.task('db:createTestRoute').then((id) => {
      routeId = id as string;
    });
    cy.login();
  });

  it('댓글을 작성하면 목록에 표시된다', () => {
    cy.intercept('POST', '/api/routes/*/comments').as('postComment');
    cy.intercept('GET', '/api/routes/*/comments*').as('getComments');

    cy.visit(`/routes/${routeId}`);
    cy.wait('@getComments');

    cy.get('textarea[placeholder*="댓글을 입력하세요"]').type('Cypress 테스트 댓글입니다.');
    cy.contains('button', '등록').click();

    cy.wait('@postComment').its('response.statusCode').should('eq', 201);
    cy.contains('Cypress 테스트 댓글입니다.').should('be.visible');
  });

  it('본인 댓글을 삭제할 수 있다', () => {
    cy.intercept('POST', '/api/routes/*/comments').as('postComment');
    cy.intercept('DELETE', '/api/routes/*/comments/*').as('deleteComment');
    cy.intercept('GET', '/api/routes/*/comments*').as('getComments');

    cy.visit(`/routes/${routeId}`);
    cy.wait('@getComments');

    cy.get('textarea[placeholder*="댓글을 입력하세요"]').type('삭제할 댓글입니다.');
    cy.contains('button', '등록').click();
    cy.wait('@postComment');

    cy.contains('삭제할 댓글입니다.').should('be.visible');

    cy.on('window:confirm', () => true);
    cy.contains('삭제할 댓글입니다.')
      .closest('div.flex.space-x-4')
      .contains('button', '삭제')
      .click();

    cy.wait('@deleteComment').its('response.statusCode').should('eq', 200);
    cy.contains('삭제할 댓글입니다.').should('not.exist');
  });

  it('다른 사용자의 댓글에는 삭제 버튼이 표시되지 않는다', () => {
    const secondUser = {
      loginId: 'commenttestuser2',
      email: 'commenttest2@test.com',
      name: '댓글테스트유저2',
      password: 'Test1234!',
    };

    cy.intercept('POST', '/api/routes/*/comments').as('postComment');
    cy.intercept('GET', '/api/routes/*/comments*').as('getComments');

    // testuser가 댓글 작성
    cy.visit(`/routes/${routeId}`);
    cy.wait('@getComments');
    cy.get('textarea[placeholder*="댓글을 입력하세요"]').type('다른 유저 테스트 댓글');
    cy.contains('button', '등록').click();
    cy.wait('@postComment');
    cy.contains('다른 유저 테스트 댓글').should('be.visible');

    // 두 번째 유저 생성 후 로그인 (이전 테스트 잔여 데이터 제거 후 생성)
    cy.task('db:deleteUserByLoginId', secondUser.loginId);
    cy.request('POST', '/api/signup', { ...secondUser, confirmPassword: secondUser.password });
    cy.clearCookies();
    cy.login(secondUser.loginId, secondUser.password);

    // 두 번째 유저가 같은 루트 방문
    cy.visit(`/routes/${routeId}`);
    cy.wait('@getComments');
    cy.contains('다른 유저 테스트 댓글').should('be.visible');

    // testuser 댓글에 삭제 버튼이 없어야 함
    cy.contains('다른 유저 테스트 댓글')
      .closest('div.flex.space-x-4')
      .find('button')
      .should('not.exist');

    cy.task('db:deleteUserByLoginId', secondUser.loginId);
  });
});
