/*
  Warnings:

  - You are about to drop the column `date` on the `BookingItem` table. All the data in the column will be lost.
  - Added the required column `roomId` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "BookingItem_bookingId_packageId_date_key";

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "roomId" TEXT NOT NULL,
ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "BookingItem" DROP COLUMN "date";

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;
