/*
  Warnings:

  - Made the column `description` on table `Place` required. This step will fail if there are existing NULL values in that column.
  - Made the column `description` on table `Route` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."Place" ADD COLUMN     "link" TEXT,
ALTER COLUMN "description" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."Route" ALTER COLUMN "description" SET NOT NULL;
