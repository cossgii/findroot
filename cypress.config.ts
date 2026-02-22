import { defineConfig } from 'cypress';
import { PrismaClient } from '@prisma/client';
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
  const testPatterns = ['Cypress 테스트', 'cypress-test-', 'Test Route'];

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
      });

      return config;
    },
  },
});
