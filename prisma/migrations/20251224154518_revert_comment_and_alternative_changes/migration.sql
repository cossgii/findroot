/*
  Warnings:

  - You are about to drop the `alternative_route_places` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `comments` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."alternative_route_places" DROP CONSTRAINT "alternative_route_places_place_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."alternative_route_places" DROP CONSTRAINT "alternative_route_places_route_place_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."comments" DROP CONSTRAINT "comments_author_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."comments" DROP CONSTRAINT "comments_route_id_fkey";

-- DropTable
DROP TABLE "public"."alternative_route_places";

-- DropTable
DROP TABLE "public"."comments";
