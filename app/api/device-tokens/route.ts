import { NextResponse } from 'next/server';
import { z } from 'zod';
import { apiHandler, apiSuccess } from '~/src/lib/api-handler';
import { db } from '~/lib/db';

const bodySchema = z.object({
  token: z.string().min(1),
  platform: z.enum(['android', 'ios']),
});

// 디바이스 토큰 등록 (앱 실행 시 호출)
export const POST = apiHandler({
  auth: true,
  bodySchema,
  handler: async ({ session, body }) => {
    const userId = session!.user!.id!;

    await db.deviceToken.upsert({
      where: { token: body.token },
      update: { userId, platform: body.platform },
      create: { userId, token: body.token, platform: body.platform },
    });

    return apiSuccess({ ok: true }, 201);
  },
});

// 디바이스 토큰 제거 (로그아웃 시 호출) - DELETE /api/device-tokens?token=xxx
export const DELETE = apiHandler({
  auth: true,
  querySchema: z.object({ token: z.string().min(1) }),
  handler: async ({ session, query }) => {
    const userId = session!.user!.id!;

    await db.deviceToken.deleteMany({
      where: { token: query.token, userId },
    });

    return NextResponse.json({ ok: true });
  },
});
