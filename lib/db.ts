import { PrismaClient } from '@prisma/client';

console.log("DATABASE_URL from process.env:", process.env.DATABASE_URL);

declare global {
  // allow global `var` declarations

  var prisma: PrismaClient | undefined;
}

export const db =
  global.prisma ||
  new PrismaClient({
    log: ['query'],
  });

if (process.env.NODE_ENV !== 'production') global.prisma = db;
