/*
  Warnings:

  - Added the required column `label` to the `RoutePlace` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "RouteStopLabel" AS ENUM ('MEAL', 'CAFE', 'BAR');

-- AlterTable
ALTER TABLE "RoutePlace" ADD COLUMN     "label" "RouteStopLabel" NOT NULL;
