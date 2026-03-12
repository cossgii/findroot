import { PlaceCategory } from '@prisma/client';

interface SerializablePlace {
  id: string;
  name: string;
  address: string;
  roadAddress: string;
  district: string;
  category: PlaceCategory;
  description: string;
  latitude: number;
  longitude: number;
  creatorId: string;
  createdAt: string;
  updatedAt: string;
}

interface PlaceWithLikes extends SerializablePlace {
  likesCount: number;
  isLiked: boolean;
}

interface _DistrictPlacesResponse {
  places: PlaceWithLikes[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

interface CreatePlaceResponse extends SerializablePlace {
  id: string;
  name: string;
}

interface _LikeResponse {
  count: number;
  liked: boolean;
}

describe("'좋아요' 기능 플로우", () => {
  let createdPlaceId: string;
  let createdPlaceName: string;
  let createdDistrictId: string;
  let createdAdminPlaceId: string | null = null;
  let _testUserId: string;

  const DISTRICT_MAP: Record<string, string> = {
    종로구: 'Jongno-gu',
    중구: 'Jung-gu',
    용산구: 'Yongsan-gu',
    성동구: 'Seongdong-gu',
    광진구: 'Gwangjin-gu',
    동대문구: 'Dongdaemun-gu',
    중랑구: 'Jungnang-gu',
    성북구: 'Seongbuk-gu',
    강북구: 'Gangbuk-gu',
    도봉구: 'Dobong-gu',
    노원구: 'Nowon-gu',
    은평구: 'Eunpyeong-gu',
    서대문구: 'Seodaemun-gu',
    마포구: 'Mapo-gu',
    양천구: 'Yangcheon-gu',
    강서구: 'Gangseo-gu',
    구로구: 'Guro-gu',
    금천구: 'Geumcheon-gu',
    영등포구: 'Yeongdeungpo-gu',
    동작구: 'Dongjak-gu',
    관악구: 'Gwanak-gu',
    서초구: 'Seocho-gu',
    강남구: 'Gangnam-gu',
    송파구: 'Songpa-gu',
    강동구: 'Gangdong-gu',
  };

  beforeEach(() => {
    cy.task('db:cleanup');
    cy.task('db:findUserByLoginId', 'testuser').then((userId) => {
      _testUserId = userId as string;
    });

    cy.intercept('GET', '/api/auth/session').as('getSession');
    cy.intercept('POST', '/api/places').as('createPlace');
    cy.intercept('POST', '/api/likes').as('addLike');
    cy.intercept('DELETE', '/api/likes*').as('removeLike');
    cy.intercept('GET', '/api/districts/places*').as('getDistrictPlaces');
    cy.intercept('GET', '/api/users/*/places*').as('getUserPlaces');

    cy.visit('/login');
    cy.get('input[name="loginId"]').type('testuser');
    cy.get('input[name="password"]').type('test1234!');
    cy.get('button[type="submit"]').click();
    cy.url().should('not.include', '/login');
    cy.wait('@getSession');

    cy.visit('/mypage');
    cy.contains('button', '내 콘텐츠').click();
    cy.contains('button', '장소 등록').click();

    cy.get('input[placeholder="장소 이름 또는 주소를 검색하세요"]').type(
      '서울남산초등학교',
    );
    cy.contains('button', '검색').click();
    cy.get('ul.border.rounded-md.max-h-40.overflow-y-auto.bg-white.mt-2 > li')
      .first()
      .click();

    cy.get('input[name="description"]').type('Cypress 테스트 장소 설명');
    cy.contains('label', '카테고리').next().click();
    cy.contains('li', '식사').click();
    cy.get('button[type="submit"]').contains('등록').click();

    cy.wait('@createPlace').then((interception) => {
      const response = interception.response?.body as CreatePlaceResponse;
      expect(response).to.have.property('id');
      createdPlaceId = response.id;
      createdPlaceName = response.name;

      const address: string = response.address ?? response.roadAddress ?? '';

      const matched = Object.entries(DISTRICT_MAP).find(([kor]) =>
        address.includes(kor),
      );
      createdDistrictId = matched ? matched[1] : 'Jung-gu';
    });

    cy.wait('@getUserPlaces');
    cy.contains('button', '장소 등록').should('be.visible');
  });

  afterEach(() => {
    if (createdPlaceId) {
      cy.task('db:deletePlaceById', createdPlaceId);
      createdPlaceId = '';
    }
    if (createdAdminPlaceId) {
      cy.task('db:deletePlaceById', createdAdminPlaceId);
      createdAdminPlaceId = null;
    }
  });

  const resetContentCreatorAtom = (): void => {
    cy.visit('/');
    cy.window().then((win) => {
      const localStorageKeys = Object.keys(win.localStorage);
      localStorageKeys.forEach((key) => {
        if (
          key.includes('atom') ||
          key.includes('creator') ||
          key.includes('jotai')
        ) {
          win.localStorage.removeItem(key);
        }
      });

      const sessionStorageKeys = Object.keys(win.sessionStorage);
      sessionStorageKeys.forEach((key) => {
        if (
          key.includes('atom') ||
          key.includes('creator') ||
          key.includes('jotai')
        ) {
          win.sessionStorage.removeItem(key);
        }
      });
    });
    cy.wait(500);
  };
  const visitDistrictWithMyTab = (districtId: string): void => {
    cy.visit(`${Cypress.config().baseUrl}/districts/${districtId}`);
    cy.wait('@getDistrictPlaces');
    cy.contains('button', '추천').click();

    cy.contains('my', { timeout: 10000 }).click();
    cy.wait('@getDistrictPlaces');
  };

  const clickLikeButton = (placeName: string): void => {
    cy.contains('h3', placeName, { timeout: 30000 })
      .closest('div.bg-white.rounded-lg.shadow-md')
      .find('[data-cy="like-button"]', { timeout: 30000 })
      .should('not.be.disabled')
      .click({ force: true });
  };

  it("사용자는 장소에 '좋아요'를 누르고 취소할 수 있어야 합니다.", () => {
    resetContentCreatorAtom();

    visitDistrictWithMyTab(createdDistrictId);

    cy.contains('h3', createdPlaceName, { timeout: 20000 }).should(
      'be.visible',
    );

    cy.contains('h3', createdPlaceName)
      .closest('div.bg-white.rounded-lg.shadow-md')
      .find('[data-cy="like-count"]')
      .invoke('text')
      .then((initialCountText: string) => {
        const initialCount: number = parseInt(initialCountText, 10);
        clickLikeButton(createdPlaceName);
        cy.wait('@addLike').then((interception) => {
          expect(interception.response?.statusCode).to.eq(201);
        });
        cy.wait('@getDistrictPlaces');
        cy.contains('h3', createdPlaceName, { timeout: 15000 })
          .closest('div.bg-white.rounded-lg.shadow-md')
          .find('[data-cy="like-count"]')
          .should('have.text', String(initialCount + 1));
        clickLikeButton(createdPlaceName);
        cy.wait('@removeLike').then((interception) => {
          expect(interception.response?.statusCode).to.eq(200);
        });
        cy.wait('@getDistrictPlaces');

        cy.contains('h3', createdPlaceName, { timeout: 15000 })
          .closest('div.bg-white.rounded-lg.shadow-md')
          .find('[data-cy="like-count"]')
          .should('have.text', String(initialCount));
      });
  });

  it("사용자는 마이페이지에서 '좋아요' 한 장소 목록을 확인할 수 있어야 합니다.", () => {
    resetContentCreatorAtom();
    visitDistrictWithMyTab(createdDistrictId);

    cy.contains('h3', createdPlaceName, { timeout: 20000 }).should(
      'be.visible',
    );

    clickLikeButton(createdPlaceName);
    cy.wait('@addLike').then((interception) => {
      expect(interception.response?.statusCode).to.eq(201);
    });
    cy.wait('@getDistrictPlaces');

    cy.intercept('GET', '/api/users/me/liked-places*').as('getLikedPlaces');
    cy.visit('/mypage');
    cy.contains('button', '좋아요').click();
    cy.wait('@getLikedPlaces');

    cy.contains('li', createdPlaceName).should('be.visible');
  });

  it('네트워크 오류 시 낙관적 업데이트가 롤백되어야 합니다.', () => {
    cy.intercept('POST', '/api/likes', {
      statusCode: 500,
      body: { message: 'Server Error' },
    }).as('addLikeFail');

    resetContentCreatorAtom();

    visitDistrictWithMyTab(createdDistrictId);

    cy.contains('h3', createdPlaceName, { timeout: 20000 }).should(
      'be.visible',
    );

    cy.contains('h3', createdPlaceName)
      .closest('div.bg-white.rounded-lg.shadow-md')
      .find('[data-cy="like-count"]')
      .invoke('text')
      .then((initialCountText: string) => {
        const initialCount: number = parseInt(initialCountText, 10);

        clickLikeButton(createdPlaceName);
        cy.wait('@addLikeFail');

        cy.contains('h3', createdPlaceName, { timeout: 10000 })
          .closest('div.bg-white.rounded-lg.shadow-md')
          .find('[data-cy="like-count"]')
          .should('have.text', String(initialCount));
      });
  });

  it("비로그인 상태에서 '좋아요' 버튼 클릭 시 로그인 안내 모달이 표시되어야 합니다.", () => {
    const adminPlace = {
      name: 'Admin Test Place',
      address: '서울특별시 중구 태평로1가 31',
      latitude: 37.5665,
      longitude: 126.978,
      description: 'Admin place for guest like test',
      category: 'MEAL',
      district: '중구',
    };

    cy.task('db:createAdminPlace', adminPlace).then((place) => {
      createdAdminPlaceId = (place as typeof adminPlace & { id: string }).id;

      cy.request({
        method: 'POST',
        url: '/api/auth/signout',
        failOnStatusCode: false,
      });
      cy.clearCookies();
      cy.clearLocalStorage();

      cy.visit(`${Cypress.config().baseUrl}/districts/Jung-gu`);
      cy.wait('@getDistrictPlaces');

      cy.contains('h3', adminPlace.name)
        .should('be.visible')
        .closest('div.bg-white.rounded-lg.shadow-md')
        .find('[data-cy="like-button"]')
        .click();

      cy.contains('h2', '로그인이 필요합니다').should('be.visible');
      cy.contains('p', '로그인하고 나만의 장소를 저장해보세요!').should(
        'be.visible',
      );
      cy.contains('button', '확인').should('be.visible');
      cy.contains('button', '취소').click();
      cy.contains('h2', '로그인이 필요합니다').should('not.exist');
    });
  });
});
