-- CreateEnum
CREATE TYPE "public"."RoutePurpose" AS ENUM ('FAMILY', 'GATHERING', 'SOLO', 'COUPLE', 'ENTIRE');

-- AlterTable
ALTER TABLE "public"."routes" ADD COLUMN     "purpose" "public"."RoutePurpose" NOT NULL DEFAULT 'ENTIRE';
