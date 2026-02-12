import { db } from '~/lib/db';
import { sendPasswordResetEmail } from '~/lib/mailer';
import { z } from 'zod';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { apiHandler, apiSuccess } from '~/src/lib/api-handler';

const requestResetSchema = z.object({
  loginId: z.string().min(1, { message: '아이디를 입력해주세요.' }),
  email: z.string().email({ message: '유효한 이메일을 입력해주세요.' }),
});

export const POST = apiHandler({
  bodySchema: requestResetSchema,
  handler: async ({ body }) => {
    const { loginId, email } = body;

    const user = await db.user.findFirst({
      where: { loginId, email },
    });

    if (user) {
      const selector = crypto.randomBytes(16).toString('hex');
      const validator = crypto.randomBytes(32).toString('hex');
      const hashedValidator = await bcrypt.hash(validator, 10);
      const tokenExpires = new Date(Date.now() + 3600000); // 1 hour

      await db.passwordResetToken.create({
        data: {
          email: user.email,
          selector: selector,
          hashedValidator: hashedValidator,
          expires: tokenExpires,
        },
      });

      await sendPasswordResetEmail(user.email, selector, validator);
    }

    // 보안을 위해 사용자의 존재 여부와 관계없이 항상 동일한 성공 메시지를 반환
    return apiSuccess({
      message:
        '비밀번호 재설정 이메일이 전송되었습니다. 이메일함을 확인해주세요.',
    });
  },
});
