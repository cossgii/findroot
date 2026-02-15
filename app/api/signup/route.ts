import { Prisma } from '@prisma/client';
import { db } from '~/lib/db';
import bcrypt from 'bcryptjs';
import { signupSchema } from '~/src/schemas/auth-schema';
import { MAIN_ACCOUNT_ID } from '~/config';
import { apiHandler, apiSuccess } from '~/src/lib/api-handler';
import { ConflictError } from '~/src/utils/api-errors';

export const POST = apiHandler({
  bodySchema: signupSchema,
  handler: async ({ body }) => {
    const { email, password, name, loginId } = body;

    const existingUserByEmail = await db.user.findFirst({ where: { email } });
    if (existingUserByEmail) {
      throw new ConflictError('이미 사용중인 이메일입니다.');
    }

    const existingUserByLoginId = await db.user.findUnique({
      where: { loginId },
    });
    if (existingUserByLoginId) {
      throw new ConflictError('이미 사용중인 아이디입니다.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await db.$transaction(
      async (prisma: Prisma.TransactionClient) => {
        const createdUser = await prisma.user.create({
          data: {
            email,
            name,
            loginId,
            password: hashedPassword,
          },
        });

        const mainAccountExists = await prisma.user.findUnique({
          where: { id: MAIN_ACCOUNT_ID },
        });

        if (mainAccountExists && createdUser.id !== MAIN_ACCOUNT_ID) {
          await prisma.follow.create({
            data: {
              followerId: createdUser.id,
              followingId: MAIN_ACCOUNT_ID,
            },
          });
        }
        return createdUser;
      },
    );

    return apiSuccess(
      {
        message: 'User registered successfully',
        user: { id: newUser.id, email: newUser.email, name: newUser.name },
      },
      201,
    );
  },
});
