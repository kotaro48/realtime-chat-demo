-- AlterTable: add officialEventId to HandshakeEvent
ALTER TABLE "HandshakeEvent" ADD COLUMN "officialEventId" TEXT;

-- CreateIndex: unique constraint for auto-import deduplication
CREATE UNIQUE INDEX "HandshakeEvent_userId_officialEventId_key" ON "HandshakeEvent"("userId", "officialEventId");
