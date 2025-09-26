/*
  Warnings:

  - Made the column `login_id` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."users" ALTER COLUMN "login_id" SET NOT NULL;
