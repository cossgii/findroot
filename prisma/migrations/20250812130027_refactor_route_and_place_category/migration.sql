/*
  Warnings:

  - You are about to drop the `RoutePlace` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `category` to the `Place` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PlaceCategory" AS ENUM ('MEAL', 'DRINK');

-- DropForeignKey
ALTER TABLE "RoutePlace" DROP CONSTRAINT "RoutePlace_placeId_fkey";

-- DropForeignKey
ALTER TABLE "RoutePlace" DROP CONSTRAINT "RoutePlace_routeId_fkey";

-- AlterTable
ALTER TABLE "Place" DROP COLUMN "category",
ADD COLUMN     "category" "PlaceCategory" NOT NULL;

-- AlterTable
ALTER TABLE "Route" ADD COLUMN     "placeForCafeId" TEXT,
ADD COLUMN     "placeForRound1Id" TEXT,
ADD COLUMN     "placeForRound2Id" TEXT;

-- DropTable
DROP TABLE "RoutePlace";

-- AddForeignKey
ALTER TABLE "Route" ADD CONSTRAINT "Route_placeForRound1Id_fkey" FOREIGN KEY ("placeForRound1Id") REFERENCES "Place"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Route" ADD CONSTRAINT "Route_placeForRound2Id_fkey" FOREIGN KEY ("placeForRound2Id") REFERENCES "Place"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Route" ADD CONSTRAINT "Route_placeForCafeId_fkey" FOREIGN KEY ("placeForCafeId") REFERENCES "Place"("id") ON DELETE SET NULL ON UPDATE CASCADE;
