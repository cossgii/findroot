import { db } from '~/lib/db';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { apiHandler, apiError, apiSuccess } from '~/src/lib/api-handler';

const passwordRegex =
  /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$&*?!%])[A-Za-z\d!@$%&*?]{8,15}$/;

const resetPasswordSchema = z.object({
  selector: z.string().min(1, { message: '선택자가 필요합니다.' }),
  validator: z.string().min(1, { message: '검증자가 필요합니다.' }),
  password: z
    .string()
    .min(8, { message: '비밀번호는 8자리 이상이어야 합니다' })
    .regex(passwordRegex, {
      message: '영문, 숫자, 특수문자(~!@#$%^&*)를 모두 조합해 주세요',
    }),
});

export const POST = apiHandler({
  bodySchema: resetPasswordSchema,
  handler: async ({ body }) => {
    const { selector, validator, password } = body;

    const resetToken = await db.passwordResetToken.findUnique({
      where: { selector },
    });

    if (!resetToken || resetToken.expires < new Date()) {
      return apiError('유효하지 않거나 만료된 토큰입니다.', 400);
    }

    const isMatch = await bcrypt.compare(validator, resetToken.hashedValidator);
    if (!isMatch) {
      return apiError('유효하지 않거나 만료된 토큰입니다.', 400);
    }

    const user = await db.user.findFirst({
      where: { email: resetToken.email },
    });
    if (!user) {
      return apiError('사용자를 찾을 수 없습니다.', 404);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.$transaction([
      db.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      }),
      db.passwordResetToken.deleteMany({
        where: { email: resetToken.email },
      }),
    ]);

    return apiSuccess({ message: '비밀번호가 성공적으로 재설정되었습니다.' });
  },
});
