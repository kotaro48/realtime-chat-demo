-- CreateEnum
CREATE TYPE "ActivityEventType" AS ENUM ('HANDSHAKE', 'CONCERT', 'THEATER', 'PILGRIMAGE', 'OTHER');

-- CreateEnum
CREATE TYPE "ActivityVisibility" AS ENUM ('PRIVATE', 'PUBLIC');

-- CreateEnum
CREATE TYPE "LocationPrecision" AS ENUM ('EXACT', 'VENUE', 'CITY');

-- AlterTable
ALTER TABLE "Report" ADD COLUMN     "activityLogId" TEXT;

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "eventType" "ActivityEventType" NOT NULL,
    "venueName" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "locationPrecision" "LocationPrecision" NOT NULL DEFAULT 'VENUE',
    "memo" TEXT,
    "visibility" "ActivityVisibility" NOT NULL DEFAULT 'PRIVATE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityLogMember" (
    "activityLogId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,

    CONSTRAINT "ActivityLogMember_pkey" PRIMARY KEY ("activityLogId","memberId")
);

-- CreateIndex
CREATE INDEX "ActivityLog_userId_date_idx" ON "ActivityLog"("userId", "date");

-- CreateIndex
CREATE INDEX "ActivityLog_visibility_date_id_idx" ON "ActivityLog"("visibility", "date", "id");

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_activityLogId_fkey" FOREIGN KEY ("activityLogId") REFERENCES "ActivityLog"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLogMember" ADD CONSTRAINT "ActivityLogMember_activityLogId_fkey" FOREIGN KEY ("activityLogId") REFERENCES "ActivityLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLogMember" ADD CONSTRAINT "ActivityLogMember_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
