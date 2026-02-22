import { db } from '~/lib/db';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { apiHandler, apiSuccess } from '~/src/lib/api-handler';
import { NotFoundError, ForbiddenError } from '~/src/utils/api-errors';

const passwordRegex =
  /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$&*?!%])[A-Za-z\d!@$%&*?]{8,15}$/;

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, { message: '현재 비밀번호를 입력해주세요.' }),
  newPassword: z
    .string()
    .min(8, { message: '새 비밀번호는 8자리 이상이어야 합니다' })
    .regex(passwordRegex, {
      message: '영문, 숫자, 특수문자(~!@#$%^&*)를 모두 조합해 주세요',
    }),
});

export const PUT = apiHandler({
  auth: true,
  bodySchema: changePasswordSchema,
  handler: async ({ session, body }) => {
    const { currentPassword, newPassword } = body;

    const user = await db.user.findUnique({ where: { id: session!.user.id } });

    if (!user || !user.password) {
      throw new NotFoundError('사용자 정보를 찾을 수 없거나, 소셜 로그인 유저입니다.');
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
      throw new ForbiddenError('현재 비밀번호가 일치하지 않습니다.');
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await db.user.update({
      where: { id: user.id },
      data: { password: hashedNewPassword },
    });

    return apiSuccess({ message: '비밀번호가 성공적으로 변경되었습니다.' });
  },
});