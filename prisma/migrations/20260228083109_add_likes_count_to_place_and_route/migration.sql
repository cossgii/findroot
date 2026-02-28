-- AlterTable
ALTER TABLE "places" ADD COLUMN     "likesCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "routes" ADD COLUMN     "likesCount" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "places_likesCount_idx" ON "places"("likesCount");

-- CreateIndex
CREATE INDEX "routes_likesCount_idx" ON "routes"("likesCount");
