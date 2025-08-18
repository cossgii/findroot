/*
  Warnings:

  - You are about to drop the column `placeForCafeId` on the `Route` table. All the data in the column will be lost.
  - You are about to drop the column `placeForRound1Id` on the `Route` table. All the data in the column will be lost.
  - You are about to drop the column `placeForRound2Id` on the `Route` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Route" DROP CONSTRAINT "Route_placeForCafeId_fkey";

-- DropForeignKey
ALTER TABLE "Route" DROP CONSTRAINT "Route_placeForRound1Id_fkey";

-- DropForeignKey
ALTER TABLE "Route" DROP CONSTRAINT "Route_placeForRound2Id_fkey";

-- AlterTable
ALTER TABLE "Route" DROP COLUMN "placeForCafeId",
DROP COLUMN "placeForRound1Id",
DROP COLUMN "placeForRound2Id";

-- CreateTable
CREATE TABLE "RoutePlace" (
    "id" TEXT NOT NULL,
    "routeId" TEXT NOT NULL,
    "placeId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "RoutePlace_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RoutePlace_routeId_idx" ON "RoutePlace"("routeId");

-- CreateIndex
CREATE INDEX "RoutePlace_placeId_idx" ON "RoutePlace"("placeId");

-- AddForeignKey
ALTER TABLE "RoutePlace" ADD CONSTRAINT "RoutePlace_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "Route"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoutePlace" ADD CONSTRAINT "RoutePlace_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "Place"("id") ON DELETE CASCADE ON UPDATE CASCADE;
