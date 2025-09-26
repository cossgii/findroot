/*
  Warnings:

  - You are about to drop the column `loginId` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[login_id]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."users_loginId_key";

-- AlterTable
ALTER TABLE "public"."users" DROP COLUMN "loginId",
ADD COLUMN     "login_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_login_id_key" ON "public"."users"("login_id");
