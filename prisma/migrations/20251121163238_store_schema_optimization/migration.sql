/*
  Warnings:

  - You are about to drop the column `offsetX` on the `StoreItem` table. All the data in the column will be lost.
  - You are about to drop the column `offsetY` on the `StoreItem` table. All the data in the column will be lost.
  - You are about to drop the column `width` on the `StoreItem` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "StoreItem" DROP COLUMN "offsetX",
DROP COLUMN "offsetY",
DROP COLUMN "width",
ADD COLUMN     "style" JSONB;
