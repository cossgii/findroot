/*
  Warnings:

  - The values [ENTIRE] on the enum `RoutePurpose` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "RoutePurpose_new" AS ENUM ('FAMILY', 'GATHERING', 'SOLO', 'COUPLE');
ALTER TABLE "public"."routes" ALTER COLUMN "purpose" DROP DEFAULT;
ALTER TABLE "routes" ALTER COLUMN "purpose" TYPE "RoutePurpose_new" USING ("purpose"::text::"RoutePurpose_new");
ALTER TYPE "RoutePurpose" RENAME TO "RoutePurpose_old";
ALTER TYPE "RoutePurpose_new" RENAME TO "RoutePurpose";
DROP TYPE "public"."RoutePurpose_old";
COMMIT;

-- AlterTable
ALTER TABLE "routes" ALTER COLUMN "purpose" DROP DEFAULT;
