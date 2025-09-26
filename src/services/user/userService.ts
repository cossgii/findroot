import { db } from '~/lib/db';
import { User } from '@prisma/client';

export async function getUserById(userId: string) {
  return db.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, loginId: true, email: true, image: true },
  });
}

export async function updateUser(userId: string, data: Partial<User>) {
  return db.user.update({
    where: { id: userId },
    data: data,
    select: { id: true, name: true, loginId: true, email: true, image: true },
  });
}
