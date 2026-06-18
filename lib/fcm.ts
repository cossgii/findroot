import 'server-only';
import { App, cert, getApps, initializeApp } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import { db } from './db';

function getFirebaseApp(): App {
  if (getApps().length > 0) return getApps()[0];
  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

export async function sendPushNotification(
  userId: string,
  title: string,
  body: string,
  data?: Record<string, string>,
): Promise<void> {
  const deviceTokens = await db.deviceToken.findMany({ where: { userId } });
  if (!deviceTokens.length) return;

  const app = getFirebaseApp();
  const messaging = getMessaging(app);

  const invalidTokenIds: string[] = [];

  await Promise.allSettled(
    deviceTokens.map(async ({ id, token }: { id: string; token: string }) => {
      try {
        await messaging.send({
          token,
          data: { title, body, ...(data ?? {}) },
          android: { priority: 'high' },
          apns: {
            payload: {
              aps: { alert: { title, body }, sound: 'default' },
            },
          },
        });
      } catch (error: unknown) {
        // 유효하지 않은 토큰은 DB에서 제거
        const code = (error as { errorInfo?: { code?: string } })?.errorInfo?.code;
        if (
          code === 'messaging/invalid-registration-token' ||
          code === 'messaging/registration-token-not-registered'
        ) {
          invalidTokenIds.push(id);
        }
      }
    }),
  );

  if (invalidTokenIds.length > 0) {
    await db.deviceToken.deleteMany({ where: { id: { in: invalidTokenIds } } });
  }
}
