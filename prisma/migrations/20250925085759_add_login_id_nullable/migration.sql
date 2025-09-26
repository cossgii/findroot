/*
  Warnings:

  - A unique constraint covering the columns `[loginId]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "loginId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_loginId_key" ON "public"."users"("loginId");
