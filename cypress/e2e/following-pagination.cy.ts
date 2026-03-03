describe('팔로잉 패널 페이지네이션 테스트', () => {
  const USERS_TO_CREATE = 15;
  const PAGE_LIMIT = 8;
  const FIRST_PAGE_USERS = Array.from(
    { length: PAGE_LIMIT },
    (_, i) => `User ${i + 1}`,
  );
  const SECOND_PAGE_USERS = Array.from(
    { length: USERS_TO_CREATE - PAGE_LIMIT },
    (_, i) => `User ${i + 1 + PAGE_LIMIT}`,
  );

  beforeEach(() => {
    cy.task('db:cleanup');
    cy.task('db:seedUsers', USERS_TO_CREATE);
    cy.task('db:createFollows', {
      followerLoginId: 'testuser',
      count: USERS_TO_CREATE,
    });
    cy.intercept('GET', '/api/auth/session').as('getSession');

    cy.visit('/login');
    cy.get('input[name="loginId"]').type('testuser');
    cy.get('input[name="password"]').type('test1234!');
    cy.get('button[type="submit"]').click();
    cy.wait('@getSession');
  });

  const openFollowerSelectionPanel = () => {
    cy.get('[data-cy="creator-selector-button"]').click();
    cy.get('[data-cy="follower-selection-panel"]').should('be.visible');
  };

  it('무한 스크롤을 통해 팔로잉 목록의 다음 페이지를 올바르게 불러와야 한다', () => {
    const firstPageResponse = {
      data: FIRST_PAGE_USERS.map((name, index) => ({
        id: `user${index + 1}`,
        name,
        image: null,
      })),
      nextCursor: `user${PAGE_LIMIT}`,
    };
    const secondPageResponse = {
      data: SECOND_PAGE_USERS.map((name, index) => ({
        id: `user${index + 1 + PAGE_LIMIT}`,
        name,
        image: null,
      })),
      nextCursor: undefined,
    };

    cy.intercept('GET', '/api/users/me/following*', (req) => {
      if (req.query.cursor) {
        req.alias = 'getFollowingSecondPage';
        req.reply(secondPageResponse);
      } else {
        req.alias = 'getFollowingFirstPage';
        req.reply(firstPageResponse);
      }
    });

    cy.visit('/districts');
    cy.wait('@getSession');
    cy.get('h2').should('be.visible');
    openFollowerSelectionPanel();

    // 1. 첫 팔로잉 유저 리스트 확인
    cy.wait('@getFollowingFirstPage');
    cy.get('[data-cy="follower-selection-panel"]')
      .find('[data-cy="user-list-item-name"]')
      .should('have.length', PAGE_LIMIT);
    FIRST_PAGE_USERS.forEach((name) => {
      cy.contains('[data-cy="user-list-item-name"]', name).should('exist');
    });
    SECOND_PAGE_USERS.forEach((name) => {
      cy.contains('[data-cy="user-list-item-name"]', name).should('not.exist');
    });

    // 2. 스크롤하여 두 번째 팔로잉 유저 리스트 로드
    cy.get('[data-cy="follower-selection-panel"] > .overflow-y-auto').scrollTo(
      'bottom',
    );
    cy.wait('@getFollowingSecondPage');

    // 3. 내용 확인
    cy.get('[data-cy="follower-selection-panel"]')
      .find('[data-cy="user-list-item-name"]')
      .should('have.length', USERS_TO_CREATE);
    SECOND_PAGE_USERS.forEach((name) => {
      cy.contains('[data-cy="user-list-item-name"]', name).should('exist');
    });

    // 4. 더 이상 로드할 리스트가 없는지 확인 (스크롤을 다시 해도 추가 요청이 없는지 확인)
    cy.get('[data-cy="follower-selection-panel"] > .overflow-y-auto').scrollTo(
      'bottom',
    );
    cy.get('[data-cy="follower-selection-panel"]')
      .find('[data-cy="user-list-item-name"]')
      .should('have.length', USERS_TO_CREATE);
  });
});
