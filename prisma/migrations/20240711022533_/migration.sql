/*
  Warnings:

  - A unique constraint covering the columns `[spotId]` on the table `Ticket` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `Ticket` MODIFY `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX `Ticket_spotId_key` ON `Ticket`(`spotId`);
