describe("'좋아요' 기능 플로우", () => {
  let createdPlaceId: string;
  let createdPlaceName: string;

  beforeEach(() => {
    cy.intercept('POST', '/api/places').as('createPlace');
    cy.intercept('POST', '/api/likes').as('addLike');
    cy.intercept('DELETE', '/api/likes').as('removeLike');
    cy.intercept('GET', '/api/likes/info*').as('getLikeInfo');

    cy.visit('/login');

    cy.get('input[name="email"]').type('test2@test.com');
    cy.get('input[name="password"]').type('test1234!');
    cy.get('button[type="submit"]').click();

    cy.url().should('not.include', '/login');

    cy.visit('/mypage');
    cy.contains('button', '내 콘텐츠').click();
    cy.contains('button', '장소 등록').click();

    const placeName = `서울남산초등학교`;
    cy.get('input[placeholder="장소 이름 또는 주소를 검색하세요"]').type(
      placeName,
    );
    cy.contains('button', '검색').click();
    cy.get('ul.border.rounded-md.max-h-40.overflow-y-auto.bg-white.mt-2 > li')
      .first()
      .click();

    cy.get('input[name="description"]').type(
      `Cypress 테스트 장소 설명 - ${Date.now()}`,
    );
    cy.contains('label', '카테고리').next().click();
    cy.contains('li', '식사').click();
    cy.get('button[type="submit"]').contains('등록').click();

    cy.wait('@createPlace').then((interception) => {
      expect(interception.response?.body).to.have.property('id');
      createdPlaceId = interception.response!.body.id;
      createdPlaceName = interception.response!.body.name;
      cy.log(`Created Place ID: ${createdPlaceId}`);
    });

    cy.contains('button', '장소 등록').should('be.visible');
  });

  afterEach(() => {
    if (createdPlaceId) {
      cy.request({
        method: 'DELETE',
        url: `/api/places/${createdPlaceId}`,
        failOnStatusCode: false,
      }).then((response) => {
        cy.log(`Place deletion response: ${response.status}`);
        createdPlaceId = '';
        createdPlaceName = '';
      });
      cy.wait(500); // 삭제 요청 완료 대기
    }
  });

  it("사용자는 장소에 '좋아요'를 누르고 취소할 수 있어야 합니다.", () => {
    cy.visit(`${Cypress.config().baseUrl}/districts/Jung-gu`);

    const likeButtonSelector = '[data-cy="like-button"]';
    const likeCountSelector = '[data-cy="like-count"]';

    cy.contains('h3', createdPlaceName)
      .closest('.bg-white')
      .find(likeButtonSelector)
      .as('likeButton');

    cy.get('@likeButton')
      .find(likeCountSelector)
      .invoke('text')
      .then((initialCountText) => {
        const initialCount = parseInt(initialCountText, 10);

        cy.get('@likeButton').click();
        cy.wait('@addLike').then((interception) => {
          cy.log('Add Like Response:', interception.response);
          cy.log('Add Like Response Body:', interception.response?.body);
          expect(interception.response?.statusCode).to.eq(201);
        });

        cy.get('@likeButton')
          .find(likeCountSelector)
          .should('have.text', String(initialCount + 1));

        cy.get('@likeButton').click();
        cy.wait('@removeLike').then((interception) => {
          expect(interception.response?.statusCode).to.eq(200);
        });

        cy.get('@likeButton')
          .find(likeCountSelector)
          .should('have.text', String(initialCount));
      });
  });

  it("사용자는 마이페이지에서 '좋아요' 한 장소 목록을 확인할 수 있어야 합니다.", () => {
    cy.visit(`${Cypress.config().baseUrl}/districts/Jung-gu`);

    cy.contains('h3', createdPlaceName)
      .closest('.bg-white')
      .find('[data-cy="like-button"]')
      .click();

    cy.wait('@addLike').then((interception) => {
      expect(interception.response?.statusCode).to.eq(201);
    });

    cy.wait(500); // UI 업데이트를 위한 대기 시간 추가

    cy.intercept('GET', '/api/users/me/liked-places*').as('getLikedPlaces');

    cy.visit('/mypage');
    cy.contains('button', '좋아요').click();
    cy.wait('@getLikedPlaces'); // 마이페이지 좋아요 목록 로딩 대기

    cy.contains('[data-cy="liked-item"]', createdPlaceName).should(
      'be.visible',
    );
  });

  it('네트워크 오류 시 낙관적 업데이트가 롤백되어야 합니다.', () => {
    cy.intercept('POST', '/api/likes', {
      statusCode: 500,
      body: { message: 'Server Error' },
    }).as('addLikeFail');

    cy.visit(`${Cypress.config().baseUrl}/districts/Jung-gu`);

    const likeButtonSelector = '[data-cy="like-button"]';
    const likeCountSelector = '[data-cy="like-count"]';

    cy.contains('h3', createdPlaceName)
      .closest('.bg-white')
      .find(likeButtonSelector)
      .as('likeButton');

    cy.get('@likeButton')
      .find(likeCountSelector)
      .invoke('text')
      .then((initialCountText) => {
        const initialCount = parseInt(initialCountText, 10);

        cy.get('@likeButton').click();
        cy.wait('@addLikeFail');

        cy.get('@likeButton')
          .find(likeCountSelector)
          .should('have.text', String(initialCount));
      });
  });
});