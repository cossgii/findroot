import { PrismaAdapter } from '@auth/prisma-adapter';
import GoogleProvider from 'next-auth/providers/google';
import KakaoProvider from 'next-auth/providers/kakao';
import CredentialsProvider from 'next-auth/providers/credentials';
import type { AuthOptions } from 'next-auth';
import * as bcrypt from 'bcryptjs';

import { db } from '~/lib/db';

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(db),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    KakaoProvider({
      clientId: process.env.KAKAO_CLIENT_ID!,
      clientSecret: process.env.KAKAO_CLIENT_SECRET!,
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
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt' as const,
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider && account.provider !== 'credentials') {
        let email = user.email;

        // 이메일이 없는 경우 (예: 카카오 비즈니스 앱 미사용), 고유한 더미 이메일 생성
        if (!email && account.provider === 'kakao') {
          // providerAccountId는 각 소셜 계정의 고유 ID이므로 이를 활용하여 고유성 보장
          email = `${account.provider}_${account.providerAccountId}@noemail.com`;
          user.email = email; // user 객체에 할당하여 PrismaAdapter가 사용하도록 함

          // user.name이 비어있을 경우 프로필에서 닉네임 가져오기 시도 (이전 로직 유지)
          if (!user.name && profile) {
            const kakaoProfile = profile as any;
            if (kakaoProfile.kakao_account?.profile?.nickname) {
              user.name = kakaoProfile.kakao_account.profile.nickname;
            } else if (kakaoProfile.properties?.nickname) {
              user.name = kakaoProfile.properties.nickname;
            }
          }
        }

        // 이메일이 있는 경우 (또는 더미 이메일이 생성된 경우)에만 계정 통합 로직 실행
        if (email) {
          const existingUser = await db.user.findUnique({ where: { email } });

          if (existingUser) {
            const existingAccount = await db.account.findUnique({
              where: {
                provider_providerAccountId: {
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                },
              },
            });

            if (!existingAccount) {
              await db.account.create({
                data: {
                  userId: existingUser.id,
                  type: account.type,
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                  access_token: account.access_token,
                  refresh_token: account.refresh_token,
                  expires_at: account.expires_at,
                  token_type: account.token_type,
                  scope: account.scope,
                  id_token: account.id_token,
                  session_state: account.session_state,
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
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
};
