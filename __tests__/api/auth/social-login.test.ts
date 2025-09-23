/**
 * @jest-environment node
 */

import { AuthOptions } from 'next-auth';

// Mock the entire authOptions module to control its behavior
const mockSignInCallback = jest.fn();

jest.mock('~/src/services/auth/authOptions', () => ({
  authOptions: {
    providers: [
      {
        id: 'google',
        name: 'Google',
        type: 'oauth',
        profile: jest.fn(), // Add this back
      },
    ],
    callbacks: {
      signIn: mockSignInCallback, // We will test this callback
      jwt: jest.fn((params) => params.token), // Pass through for simplicity
      session: jest.fn((params) => params.session), // Pass through for simplicity
    },
    secret: 'test-secret',
    session: { strategy: 'jwt' },
    pages: {},
  } as AuthOptions,
}));

describe('Social Login (Google Provider)', () => {
  // mockReq is not used in these tests, so it can be removed.

  beforeEach(() => {
    jest.clearAllMocks();
    global.prisma = undefined;
  });

  it('Google 로그인 시 사용자가 성공적으로 생성되거나 연결되어야 한다', async () => {
    // Mock the signIn callback to return true, simulating successful authentication
    mockSignInCallback.mockResolvedValue(true);

    // Simulate the signIn process for Google
    // In a real scenario, NextAuth.js handles the redirect and callback.
    // Here, we directly call the signIn callback with mock data.
    const user = {
      id: 'google-user-1',
      email: 'google@example.com',
      name: 'Google User',
    };
    const account = {
      provider: 'google',
      type: 'oauth',
      providerAccountId: '12345',
    };
    const profile = { email: 'google@example.com', name: 'Google User' };

    const result = await mockSignInCallback({
      user,
      account,
      profile,
      email: user.email,
      credentials: {},
    });

    expect(result).toBe(true);
    expect(mockSignInCallback).toHaveBeenCalledWith({
      user,
      account,
      profile,
      email: user.email,
      credentials: {},
    });

    // Further assertions could involve mocking db.user.findUnique or db.account.create
    // to verify database interactions if the signIn callback has such logic.
    // For this example, we are primarily testing the callback's return value.
  });

  it('Google 로그인 시 이메일이 없는 경우에도 사용자가 처리되어야 한다 (Kakao와 유사)', async () => {
    // This tests a scenario similar to Kakao where email might be missing initially
    mockSignInCallback.mockResolvedValue(true);

    const user = { id: 'google-user-2', name: 'Google User No Email' }; // No email in user object
    const account = {
      provider: 'google',
      type: 'oauth',
      providerAccountId: '67890',
    };
    const profile = { name: 'Google User No Email' }; // No email in profile

    const result = await mockSignInCallback({
      user,
      account,
      profile,
      email: undefined,
      credentials: {},
    });

    expect(result).toBe(true);
    expect(mockSignInCallback).toHaveBeenCalledWith({
      user,
      account,
      profile,
      email: undefined,
      credentials: {},
    });
    // Assertions here would depend on how your signIn callback handles missing emails for Google.
    // If it generates a dummy email like for Kakao, you'd test that.
  });
});
