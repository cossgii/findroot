import { defineConfig } from 'cypress';
import {
  PrismaClient,
  Prisma,
  PlaceCategory,
  RouteStopLabel,
  RoutePurpose,
} from '@prisma/client';
import bcrypt from 'bcryptjs';
require('dotenv').config();

let prisma: PrismaClient | null = null;

function getPrismaClient() {
  if (!prisma) {
    const DATABASE_URL = process.env.DATABASE_URL;
    if (!DATABASE_URL) {
      throw new Error(
        'DATABASE_URL is not set in environment variables for Prisma Client in Cypress.',
      );
    }

    const { PrismaPg } = require('@prisma/adapter-pg');
    const { Pool } = require('pg');

    const pool = new Pool({ connectionString: DATABASE_URL });

    prisma = new PrismaClient({
      adapter: new PrismaPg(pool),
      log: process.env.DEBUG ? ['query', 'error', 'warn'] : ['error'],
    });
  }
  return prisma;
}

async function cleanupTestPatterns(client: PrismaClient) {
  const testPatterns = [
    'Cypress 테스트',
    'cypress-test-',
    'Test Route',
    'Test Place',
  ];

  const whereCondition = {
    OR: testPatterns.flatMap((pattern) => [
      { name: { contains: pattern } },
      { description: { contains: pattern } },
    ]),
  };

  await client.$transaction(async (tx) => {
    await tx.routePlace.deleteMany({
      where: {
        route: whereCondition,
      },
    });

    await tx.route.deleteMany({
      where: whereCondition,
    });

    await tx.place.deleteMany({
      where: whereCondition,
    });

    console.log('✅ Pattern cleanup completed');
  });
}

async function cleanupAndCreateTestUser(client: PrismaClient) {
  const testUserLoginId = 'testuser';
  const testUserEmail = 'test2@test.com';
  const testUserPassword = 'test1234!';

  await client.$transaction(async (tx) => {
    const testUser = await tx.user.findUnique({
      where: { loginId: testUserLoginId },
      select: { id: true },
    });

    if (testUser) {
      await tx.like.deleteMany({ where: { userId: testUser.id } });
      await tx.routePlace.deleteMany({
        where: { route: { creatorId: testUser.id } },
      });
      await tx.route.deleteMany({ where: { creatorId: testUser.id } });
      await tx.place.deleteMany({ where: { creatorId: testUser.id } });
      await tx.user.delete({ where: { id: testUser.id } });

      console.log(`✅ Cleaned up existing user: ${testUserLoginId}`);
    }

    const hashedPassword = await bcrypt.hash(testUserPassword, 10);
    await tx.user.create({
      data: {
        email: testUserEmail,
        loginId: testUserLoginId,
        name: 'Test User',
        password: hashedPassword,
      },
    });

    console.log(`✅ Created test user: ${testUserLoginId}`);
  });
}

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',

    setupNodeEvents(on, config) {
      const client = getPrismaClient();

      on('task', {
        'db:cleanup': async () => {
          try {
            await cleanupTestPatterns(client);
            await cleanupAndCreateTestUser(client);
            return null;
          } catch (error) {
            console.error('❌ db:cleanup failed:', error);
            throw error;
          }
        },

        'store:clear': async () => {
          return null;
        },

        'db:findUserByLoginId': async (loginId: string) => {
          try {
            const user = await client.user.findUnique({
              where: { loginId },
              select: { id: true },
            });
            if (!user) {
              throw new Error(`User with loginId "${loginId}" not found.`);
            }
            return user.id;
          } catch (error) {
            console.error(
              `❌ db:findUserByLoginId failed for "${loginId}":`,
              error,
            );
            throw error;
          }
        },

        'db:seedUsers': async (count: number) => {
          try {
            const usersToCreate = [];
            for (let i = 1; i <= count; i++) {
              const loginId = `user${i}`;
              const email = `user${i}@test.com`;
              const password = await bcrypt.hash('password123!', 10);
              usersToCreate.push({
                loginId,
                email,
                name: `User ${i}`,
                password,
              });
            }
            await client.user.createMany({
              data: usersToCreate,
              skipDuplicates: true,
            });
            console.log(`✅ Seeded ${count} users.`);
            return null;
          } catch (error) {
            console.error('❌ db:seedUsers failed:', error);
            throw error;
          }
        },

        'db:createFollows': async ({
          followerLoginId,
          count,
        }: {
          followerLoginId: string;
          count: number;
        }) => {
          try {
            const follower = await client.user.findUnique({
              where: { loginId: followerLoginId },
            });

            if (!follower) {
              throw new Error(
                `Follower with loginId "${followerLoginId}" not found.`,
              );
            }

            const usersToFollow = await client.user.findMany({
              where: {
                NOT: {
                  id: follower.id,
                },
              },
              take: count,
            });

            const followData = usersToFollow.map((user) => ({
              followerId: follower.id,
              followingId: user.id,
            }));

            await client.follow.createMany({
              data: followData,
              skipDuplicates: true,
            });
            console.log(
              `✅ User "${followerLoginId}" now follows ${count} users.`,
            );
            return null;
          } catch (error) {
            console.error('❌ db:createFollows failed:', error);
            throw error;
          }
        },

        'db:createAdminPlace': async (
          placeData: Omit<Prisma.PlaceUncheckedCreateInput, 'creatorId'>,
        ) => {
          const adminId = process.env.MAIN_ACCOUNT_ID;
          if (!adminId) {
            throw new Error('MAIN_ACCOUNT_ID is not set in .env file');
          }
          const place = await client.place.create({
            data: {
              ...placeData,
              creatorId: adminId,
            },
          });
          return place;
        },

        'db:deletePlaceById': async (id: string) => {
          if (!id) return null;
          try {
            await client.place.delete({ where: { id } });
          } catch (_error) {
            console.log(
              `Note: Could not delete place with id ${id}. It may have already been removed.`,
            );
          }
          return null;
        },

        'db:deleteUserByLoginId': async (loginId: string) => {
          try {
            const user = await client.user.findUnique({ where: { loginId } });
            if (user) {
              await client.user.delete({ where: { id: user.id } });
              console.log(`✅ Deleted user: ${loginId}`);
            }
          } catch (_error) {
            console.log(
              `Note: Could not delete user "${loginId}". It may not exist.`,
            );
          }
          return null;
        },

        'db:createTestRoute': async () => {
          try {
            const testUser = await client.user.findUnique({
              where: { loginId: 'testuser' },
              select: { id: true },
            });
            if (!testUser)
              throw new Error('testuser not found. Run db:cleanup first.');

            const [place1, place2] = await Promise.all([
              client.place.create({
                data: {
                  name: 'Cypress 테스트 장소 1',
                  address: '서울특별시 중구 테스트로 1',
                  latitude: 37.5665,
                  longitude: 126.978,
                  description: 'Cypress test place 1',
                  category: PlaceCategory.MEAL,
                  district: '중구',
                  creatorId: testUser.id,
                },
              }),
              client.place.create({
                data: {
                  name: 'Cypress 테스트 장소 2',
                  address: '서울특별시 중구 테스트로 2',
                  latitude: 37.567,
                  longitude: 126.979,
                  description: 'Cypress test place 2',
                  category: PlaceCategory.DRINK,
                  district: '중구',
                  creatorId: testUser.id,
                },
              }),
            ]);

            const route = await client.route.create({
              data: {
                name: 'Cypress 테스트 루트',
                description: 'Cypress 댓글 테스트용 루트',
                creatorId: testUser.id,
                places: {
                  create: [
                    {
                      placeId: place1.id,
                      order: 1,
                      label: RouteStopLabel.MEAL,
                    },
                    {
                      placeId: place2.id,
                      order: 2,
                      label: RouteStopLabel.CAFE,
                    },
                  ],
                },
                purpose: RoutePurpose.ENTIRE,
              },
            });

            console.log(`✅ Created test route: ${route.id}`);
            return route.id;
          } catch (error) {
            console.error('❌ db:createTestRoute failed:', error);
            throw error;
          }
        },
      });

      return config;
    },
  },
});
