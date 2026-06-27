/*
  Warnings:

  - You are about to drop the column `items` on the `orders` table. All the data in the column will be lost.
  - Added the required column `orderItems` to the `orders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "orders" DROP COLUMN "items",
ADD COLUMN     "orderItems" JSONB NOT NULL;

-- CreateTable
CREATE TABLE "cart" (
    "cartId" TEXT NOT NULL,
    "cartItems" JSONB NOT NULL,
    "totalAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cart_pkey" PRIMARY KEY ("cartId")
);
