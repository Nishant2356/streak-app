/*
  Warnings:

  - You are about to drop the column `equippedAura` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `equippedBackground` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `equippedFrame` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `equippedHeadgear` on the `User` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_equippedAura_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_equippedBackground_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_equippedFrame_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_equippedHeadgear_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "equippedAura",
DROP COLUMN "equippedBackground",
DROP COLUMN "equippedFrame",
DROP COLUMN "equippedHeadgear";

-- CreateTable
CREATE TABLE "UserEquip" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "itemId" INTEGER NOT NULL,
    "type" "ItemType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserEquip_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserEquip_userId_type_key" ON "UserEquip"("userId", "type");

-- AddForeignKey
ALTER TABLE "UserEquip" ADD CONSTRAINT "UserEquip_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserEquip" ADD CONSTRAINT "UserEquip_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "StoreItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
