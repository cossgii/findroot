/*
  Warnings:

  - You are about to drop the column `place_id` on the `comments` table. All the data in the column will be lost.
  - Added the required column `route_id` to the `comments` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."comments" DROP CONSTRAINT "comments_place_id_fkey";

-- DropIndex
DROP INDEX "public"."comments_place_id_idx";

-- AlterTable
ALTER TABLE "public"."comments" DROP COLUMN "place_id",
ADD COLUMN     "route_id" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "comments_route_id_idx" ON "public"."comments"("route_id");

-- AddForeignKey
ALTER TABLE "public"."comments" ADD CONSTRAINT "comments_route_id_fkey" FOREIGN KEY ("route_id") REFERENCES "public"."routes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
