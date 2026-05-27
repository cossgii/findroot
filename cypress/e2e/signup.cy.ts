const TEST_USER = {
  loginId: 'signuptestuser',
  email: 'signuptest@test.com',
  name: '가입테스트',
  password: 'Test1234!',
};

describe('회원가입 테스트', () => {
  beforeEach(() => {
    cy.task('db:cleanup');
    cy.task('db:deleteUserByLoginId', TEST_USER.loginId);
  });

  afterEach(() => {
    cy.task('db:deleteUserByLoginId', TEST_USER.loginId);
  });

  const fillSignupForm = (overrides: Partial<typeof TEST_USER & { confirmPassword: string }> = {}) => {
    const data = { ...TEST_USER, confirmPassword: TEST_USER.password, ...overrides };
    cy.get('input[name="loginId"]').type(data.loginId);
    cy.get('input[name="email"]').type(data.email);
    cy.get('input[name="name"]').type(data.name);
    cy.get('input[name="password"]').type(data.password);
    cy.get('input[name="confirmPassword"]').type(data.confirmPassword ?? data.password);
  };

  it('올바른 정보로 회원가입 후 홈으로 이동한다', () => {
    cy.intercept('POST', '/api/signup').as('signup');

    cy.visit('/signup');
    fillSignupForm();
    cy.get('button[type="submit"]').click();

    cy.wait('@signup').its('response.statusCode').should('eq', 201);
    cy.url().should('eq', Cypress.config().baseUrl + '/');
    cy.get('[data-testid="user-avatar-button"]').should('be.visible');
  });

  it('이미 사용 중인 이메일로 가입 시 에러 메시지를 표시한다', () => {
    cy.visit('/signup');
    // testuser의 이메일(test2@test.com)은 db:cleanup이 항상 생성함
    fillSignupForm({ loginId: 'otherid', email: 'test2@test.com' });
    cy.get('button[type="submit"]').click();

    cy.contains('이미').should('be.visible');
  });

  it('비밀번호 불일치 시 클라이언트 에러 메시지를 표시한다', () => {
    cy.visit('/signup');
    fillSignupForm({ confirmPassword: 'Wrong999!' });
    cy.get('button[type="submit"]').click();

    cy.contains('비밀번호가 일치하지 않습니다').should('be.visible');
    cy.url().should('include', '/signup');
  });

  it('비밀번호 형식 오류 시 에러 메시지를 표시한다', () => {
    cy.visit('/signup');
    fillSignupForm({ password: '12345678', confirmPassword: '12345678' });
    cy.get('button[type="submit"]').click();

    cy.contains('영문, 숫자, 특수문자').should('be.visible');
    cy.url().should('include', '/signup');
  });
});
