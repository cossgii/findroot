import { defineConfig } from 'cypress';
import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    setupNodeEvents(on, config) {
      if (!prisma) {
        prisma = new PrismaClient();
      }

      on('task', {
        'db:cleanup': async (options?: { userId?: string; email?: string }) => {
          try {
            const targetEmail = options?.email || 'test2@test.com';

            const testUser = await prisma.user.findUnique({
              where: { email: targetEmail },
              select: { id: true },
            });

            if (testUser) {
              if (prisma.routePlace) {
                await prisma.routePlace.deleteMany({
                  where: {
                    route: { creatorId: testUser.id },
                  },
                });
              }

              await prisma.route.deleteMany({
                where: { creatorId: testUser.id },
              });

              await prisma.place.deleteMany({
                where: { creatorId: testUser.id },
              });

              await cleanupTestPatterns();
            } else {
              await cleanupTestPatterns();
            }

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
