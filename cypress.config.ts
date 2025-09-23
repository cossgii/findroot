import { defineConfig } from 'cypress';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    setupNodeEvents(on, config) {
      on('task', {
        'db:cleanup': async () => {
          const testUserEmail = 'test2@test.com';

          const testUser = await prisma.user.findUnique({
            where: { email: testUserEmail },
            select: { id: true },
          });

          if (testUser) {
            await prisma.like.deleteMany({ where: { userId: testUser.id } });
            await prisma.route.deleteMany({ where: { creatorId: testUser.id } });
            await prisma.place.deleteMany({ where: { creatorId: testUser.id } });
            console.log(`DB Cleanup: Cleaned data for user ${testUserEmail}`);
          }

          await prisma.user.upsert({
            where: { email: testUserEmail },
            update: {},
            create: {
              email: testUserEmail,
              name: 'Test User',
              password: 'test1234!',
            },
          });
          console.log(`DB Cleanup: Ensured user ${testUserEmail} exists.`);

          return null;
        },
      });
      return config;
    },
  },
});
