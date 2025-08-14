import { db } from '~/lib/db';

export async function sendMessage(
  senderId: string,
  receiverId: string,
  content: string,
) {
  if (!db) throw new Error('Database client not initialized.');
  return db.message.create({
    data: {
      senderId,
      receiverId,
      content,
    },
  });
}

export async function getReceivedMessages(userId: string) {
  if (!db) throw new Error('Database client not initialized.');
  return db.message.findMany({
    where: {
      receiverId: userId,
    },
    include: {
      sender: {
        select: { id: true, name: true, image: true },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

export async function getSentMessages(userId: string) {
  if (!db) throw new Error('Database client not initialized.');
  return db.message.findMany({
    where: {
      senderId: userId,
    },
    include: {
      receiver: {
        select: { id: true, name: true, image: true },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}
