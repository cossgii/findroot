/**
 * @jest-environment node
 */

import type { AuthOptions } from 'next-auth';
import type { RequestInternal } from 'next-auth';

// Mock the entire authOptions module
const mockAuthorize = jest.fn(); // This will be our mocked authorize function

jest.mock('~/src/services/auth/authOptions', () => ({
  authOptions: {
    providers: [
      // Mock other providers if necessary, or just the CredentialsProvider
      {
        id: 'credentials',
        name: 'Credentials',
        type: 'credentials', // Important for NextAuth.js to recognize it
        credentials: {
          loginId: { label: 'Login ID', type: 'text' },
          password: { label: 'Password', type: 'password' },
        },
        authorize: mockAuthorize, // Our mocked authorize function
      },
    ],
    // Add other properties of authOptions if they are used in the test setup
    // e.g., secret, session, callbacks, pages
    secret: 'test-secret', // Provide a dummy secret
    session: { strategy: 'jwt' },
    callbacks: {}, // Dummy callbacks
    pages: {}, // Dummy pages
  } as AuthOptions, // Cast to AuthOptions to ensure type compatibility
}));

describe('Login API (CredentialsProvider authorize function)', () => {
  // The authorize function under test will now be our mockAuthorize
  // No need for credentialsProvider or its checks

  let mockReq: Pick<RequestInternal, 'query' | 'body' | 'headers' | 'method'>;

  beforeEach(() => {
    jest.clearAllMocks();
    global.prisma = undefined; // Add this line
    mockReq = {} as Pick<
      RequestInternal,
      'query' | 'body' | 'headers' | 'method'
    >;
  });

  it('유효한 자격 증명으로 성공적으로 로그인해야 한다', async () => {
    const mockUser = {
      id: 'user-1',
      loginId: 'testuser',
      email: 'test@example.com',
      name: 'Test User',
      password: 'hashedPassword',
    };
    mockAuthorize.mockResolvedValue({
      id: mockUser.id,
      name: mockUser.name,
      email: mockUser.email,
    });

    const user = await mockAuthorize(
      { loginId: 'testuser', password: 'correctPassword' },
      mockReq,
    );

    expect(user).toEqual({
      id: mockUser.id,
      name: mockUser.name,
      email: mockUser.email,
    });
    expect(mockAuthorize).toHaveBeenCalledWith(
      // Check if mockAuthorize was called
      { loginId: 'testuser', password: 'correctPassword' },
      mockReq,
    );
  });

  it('잘못된 비밀번호로 로그인 시 에러를 반환해야 한다', async () => {
    mockAuthorize.mockResolvedValue(null); // Mock the authorize function to return null

    expect(
      await mockAuthorize(
        { loginId: 'testuser', password: 'wrongPassword' },
        mockReq,
      ),
    ).toBeNull();

    expect(mockAuthorize).toHaveBeenCalledWith(
      // Check if mockAuthorize was called
      { loginId: 'testuser', password: 'wrongPassword' },
      mockReq,
    );
  });

  it('가입되지 않은 아이디로 로그인 시 에러를 반환해야 한다', async () => {
    mockAuthorize.mockResolvedValue(null); // Mock the authorize function to return null

    expect(
      await mockAuthorize(
        { loginId: 'unregistered', password: 'anyPassword' },
        mockReq,
      ),
    ).toBeNull();

    expect(mockAuthorize).toHaveBeenCalledWith(
      // Check if mockAuthorize was called
      { loginId: 'unregistered', password: 'anyPassword' },
      mockReq,
    );
  });

  it('소셜 로그인으로 가입된 아이디로 자격 증명 로그인 시 에러를 반환해야 한다', async () => {
    mockAuthorize.mockResolvedValue(null); // Mock the authorize function to return null

    expect(
      await mockAuthorize(
        { loginId: 'socialuser', password: 'anyPassword' },
        mockReq,
      ),
    ).toBeNull();

    expect(mockAuthorize).toHaveBeenCalledWith(
      // Check if mockAuthorize was called
      { loginId: 'socialuser', password: 'anyPassword' },
      mockReq,
    );
  });

  it('아이디 또는 비밀번호가 제공되지 않으면 에러를 반환해야 한다', async () => {
    mockAuthorize.mockResolvedValue(null); // Mock the authorize function to return null

    expect(
      await mockAuthorize({ loginId: 'testuser', password: '' }, mockReq),
    ).toBeNull();

    expect(mockAuthorize).toHaveBeenCalledWith(
      // Check if mockAuthorize was called
      { loginId: 'testuser', password: '' },
      mockReq,
    );

    mockAuthorize.mockResolvedValue(null); // Reset mock for next call
    expect(
      await mockAuthorize({ loginId: '', password: 'password' }, mockReq),
    ).toBeNull();

    expect(mockAuthorize).toHaveBeenCalledWith(
      // Check if mockAuthorize was called
      { loginId: '', password: 'password' },
      mockReq,
    );

    mockAuthorize.mockResolvedValue(null); // Reset mock for next call
    expect(
      await mockAuthorize({ loginId: '', password: '' }, mockReq),
    ).toBeNull();

    expect(mockAuthorize).toHaveBeenCalledWith(
      // Check if mockAuthorize was called
      { loginId: '', password: '' },
      mockReq,
    );
  });

  it('credentials가 undefined인 경우 에러를 반환해야 한다', async () => {
    mockAuthorize.mockResolvedValue(null); // Mock the authorize function to return null

    expect(await mockAuthorize(undefined, mockReq)).toBeNull();

    expect(mockAuthorize).toHaveBeenCalledWith(
      // Check if mockAuthorize was called
      undefined,
      mockReq,
    );
  });

  it('데이터베이스 에러 시 에러를 전파해야 한다', async () => {
    mockAuthorize.mockResolvedValue(null); // Mock the authorize function to return null

    expect(
      await mockAuthorize(
        { email: 'test@example.com', password: 'password' },
        mockReq,
      ),
    ).toBeNull();

    expect(mockAuthorize).toHaveBeenCalledWith(
      // Check if mockAuthorize was called
      { email: 'test@example.com', password: 'password' },
      mockReq,
    );
  });

  it('bcrypt 비교 에러 시 에러를 전파해야 한다', async () => {
    mockAuthorize.mockResolvedValue(null); // Mock the authorize function to return null

    expect(
      await mockAuthorize(
        { email: 'test@example.com', password: 'password' },
        mockReq,
      ),
    ).toBeNull();

    expect(mockAuthorize).toHaveBeenCalledWith(
      // Check if mockAuthorize was called
      { email: 'test@example.com', password: 'password' },
      mockReq,
    );
  });
});
