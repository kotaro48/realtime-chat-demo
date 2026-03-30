-- AlterTable: add new fields to Member
ALTER TABLE "Member" ADD COLUMN "memberId" TEXT;
ALTER TABLE "Member" ADD COLUMN "nameEn" TEXT;
ALTER TABLE "Member" ADD COLUMN "imageUrl" TEXT;

-- CreateIndex: memberId unique
CREATE UNIQUE INDEX "Member_memberId_key" ON "Member"("memberId");
