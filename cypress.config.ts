import { defineConfig } from 'cypress';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

let prisma: PrismaClient;

async function cleanupTestPatterns() {
  const testPatterns = ['Cypress 테스트', 'cypress-test-', 'Test Route'];

  try {
    for (const pattern of testPatterns) {
      if (prisma.routePlace) {
        await prisma.routePlace.deleteMany({
          where: {
            route: {
              OR: [
                { name: { contains: pattern } },
                { description: { contains: pattern } },
              ],
            },
          },
        });
      }

      await prisma.route.deleteMany({
        where: {
          OR: [
            { name: { contains: pattern } },
            { description: { contains: pattern } },
          ],
        },
      });

      await prisma.place.deleteMany({
        where: {
          OR: [
            { name: { contains: pattern } },
            { description: { contains: pattern } },
          ],
        },
      });
    }
  } catch (error) {
    console.error('Pattern cleanup error:', error);
  }
}

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    setupNodeEvents(on, config) {
      if (!prisma) {
        prisma = new PrismaClient();
      }

      on('task', {
        'db:cleanup': async () => {
          try {
            // 1. Run the generic pattern cleanup first
            await cleanupTestPatterns();
            console.log('DB Cleanup: Cleaned up general test patterns.');

            // 2. Now, run the specific user cleanup and creation
            const testUserLoginId = 'testuser';
            const testUserEmail = 'test2@test.com';

            const testUser = await prisma.user.findUnique({
              where: { loginId: testUserLoginId },
              select: { id: true },
            });

            if (testUser) {
              await prisma.like.deleteMany({ where: { userId: testUser.id } });
              await prisma.route.deleteMany({ where: { creatorId: testUser.id } });
              await prisma.place.deleteMany({ where: { creatorId: testUser.id } });
              await prisma.user.delete({ where: { id: testUser.id } });
              console.log(`DB Cleanup: Cleaned data for user ${testUserLoginId}`);
            }
            
            // 3. Create the user fresh
            const hashedPassword = await bcrypt.hash('test1234!', 10);
            await prisma.user.create({
              data: {
                email: testUserEmail,
                loginId: testUserLoginId,
                name: 'Test User',
                password: hashedPassword,
              },
            });
            console.log(`DB Cleanup: Ensured user ${testUserLoginId} exists.`);

            return { success: true };
          } catch (error) {
            console.error('❌ Cleanup error:', error);
            return { success: false, error: String(error) };
          }
        },

        'db:seed': async () => {
          return { success: true };
        },
      });

      on('after:run', () => {
        if (prisma) {
          prisma.$disconnect();
        }
      });

      return config;
    },
  },
});