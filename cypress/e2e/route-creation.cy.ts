describe('루트 생성 테스트', () => {
  const createPlace = (
    placeName: string,
    description: string,
    category: '식사' | '음료',
  ) => {
    cy.get('[data-cy="add-place-button"]').click();
    cy.contains('h2', '새 장소 등록').should('be.visible');
    cy.get('input[placeholder="장소 이름 또는 주소를 검색하세요"]').type(
      placeName,
    );
    cy.contains('button', '검색').click();
    cy.get('ul.border.rounded-md.max-h-40.overflow-y-auto.bg-white.mt-2 > li')
      .first()
      .click();
    cy.get('input[name="description"]').type(description);
    cy.contains('label', '카테고리').next().click();
    cy.contains('li', category).click();
    cy.get('button[type="submit"]').contains('등록').click();
    cy.wait('@createPlace').its('response.statusCode').should('eq', 201);
    cy.contains('장소가 성공적으로 등록되었습니다.').should('be.visible');
    cy.contains('h2', '새 장소 등록').should('not.exist');
  };

  beforeEach(() => {
    cy.task('db:cleanup');
    cy.session('user-session', () => {
      cy.visit('/login');
      cy.get('input[name="email"]').type('test2@test.com');
      cy.get('input[name="password"]').type('test1234!');
      cy.get('button[type="submit"]').click();
      cy.url().should('eq', Cypress.config().baseUrl + '/');
    });
    cy.visit('/mypage');
    cy.contains('h1', '마이페이지').should('be.visible');
  });

  afterEach(() => {
    cy.task('db:cleanup');
  });

  it('사용자는 새로운 루트를 성공적으로 생성할 수 있어야 한다', () => {
    const timestamp = Date.now();
    const routeName = `Cypress 테스트 루트 - ${timestamp}`;

    cy.intercept('POST', '/api/routes').as('createRoute');
    cy.intercept('POST', '/api/places').as('createPlace');

    cy.contains('button', '내 콘텐츠').click();
    cy.get('[data-cy="add-place-button"]').should('be.visible');

    createPlace(
      'KFC 강남구청역점',
      `Cypress 테스트 장소 1 - 식사 ${timestamp}`,
      '식사',
    );
    createPlace(
      '스타벅스 강남역점',
      `Cypress 테스트 장소 2 - 음료 ${timestamp}`,
      '음료',
    );

    cy.contains('button', '내가 등록한 루트').click();
    cy.intercept('GET', '/api/users/**/places/all').as('getUserPlaces');
    cy.contains('button', '루트 등록').click();
    cy.wait('@getUserPlaces').its('response.statusCode').should('eq', 200);
    cy.get('[data-testid="district-dropdown-wrapper"]').should('be.visible');

    cy.get('[data-testid="district-dropdown-wrapper"]')
      .find('[class*="cursor-pointer"]')
      .click();
    cy.contains('li', '강남구').click();

    cy.contains('h3', '새 경유지 추가').parent().as('addStopSection');

    cy.get('@addStopSection').contains('span', '장소를 선택하세요').click();
    cy.get('ul.py-1')
      .find('li')
      .should('have.length.at.least', 2)
      .first()
      .click();
    cy.get('@addStopSection').contains('button', '추가').click();

    cy.get('@addStopSection').contains('span', '장소를 선택하세요').click();
    cy.get('ul.py-1')
      .find('li')
      .should('have.length.at.least', 1)
      .first()
      .click();
    cy.get('@addStopSection').contains('button', '추가').click();

    cy.get('input[name="name"]').type(routeName);
    cy.get('input[name="description"]').type(
      'Cypress로 생성한 테스트 루트입니다.',
    );

    cy.get('button[type="submit"]').contains('등록').click();

    cy.wait('@createRoute');

    cy.contains('p.font-semibold', routeName).should('be.visible');
  });
});
