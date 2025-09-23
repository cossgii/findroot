import 'server-only';
import { PrismaAdapter } from '@auth/prisma-adapter';
import GoogleProvider from 'next-auth/providers/google';
import KakaoProvider from 'next-auth/providers/kakao';
import CredentialsProvider from 'next-auth/providers/credentials';
import type { AuthOptions } from 'next-auth';
import * as bcrypt from 'bcryptjs';

interface KakaoProfile {
  id: number;
  kakao_account?: {
    profile?: {
      nickname?: string;
      profile_image_url?: string;
    };
    email?: string;
  };
  properties?: {
    nickname?: string;
  };
}

import { db } from '~/lib/db';
import {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  KAKAO_CLIENT_ID,
  KAKAO_CLIENT_SECRET,
  MAIN_ACCOUNT_ID,
  NEXTAUTH_SECRET,
} from '~/config';

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(db),
  providers: [
    GoogleProvider({
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
    }),
    KakaoProvider({
      clientId: KAKAO_CLIENT_ID,
      clientSecret: KAKAO_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('이메일과 비밀번호를 입력해주세요.');
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          throw new Error('가입되지 않은 이메일입니다.');
        }

        if (!user.password) {
          const account = await db.account.findFirst({
            where: { userId: user.id },
          });
          const provider = account?.provider.toUpperCase() || '다른';
          throw new Error(`이 이메일은 ${provider} 계정으로 가입되었습니다.`);
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password,
        );

        if (!isPasswordValid) {
          throw new Error('비밀번호가 일치하지 않습니다.');
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
        };
      },
    }),
  ],
  secret: NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt' as const,
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider && account.provider !== 'credentials') {
        let email = user.email;
        if (!email && account.provider === 'kakao') {
          email = `${account.provider}_${account.providerAccountId}@noemail.com`;
          user.email = email;

          if (!user.name && profile) {
            const kakaoProfile = profile as KakaoProfile;
            if (kakaoProfile.kakao_account?.profile?.nickname) {
              user.name = kakaoProfile.kakao_account.profile.nickname;
            } else if (kakaoProfile.properties?.nickname) {
              user.name = kakaoProfile.properties.nickname;
            }
          }
        }

        if (email) {
          const existingUser = await db.user.findUnique({ where: { email } });

          if (existingUser) {
            const existingAccount = await db.account.findFirst({
              where: {
                provider: account.provider,
                providerAccountId: account.providerAccountId,
              },
            });

            if (!existingAccount) {
              await db.account.create({
                data: {
                  userId: existingUser.id,
                  type: account.type,
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                  accessToken: account.access_token,
                  refreshToken: account.refresh_token,
                  expiresAt: account.expires_at,
                  tokenType: account.token_type,
                  scope: account.scope,
                  idToken: account.id_token,
                  sessionState: account.session_state,
                },
              });
            }
          }
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.id && session.user) {
        const userFromDb = await db.user.findUnique({
          where: { id: token.id },
        });

        if (userFromDb) {
          session.user.name = userFromDb.name;
          session.user.email = userFromDb.email;
          session.user.image = userFromDb.image;
          session.user.id = userFromDb.id;
          session.user.isAdmin = userFromDb.id === MAIN_ACCOUNT_ID;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
};
