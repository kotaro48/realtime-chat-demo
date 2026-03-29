-- CreateTable
CREATE TABLE "OfficialEvent" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "category" TEXT NOT NULL,
    "parentCategory" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "openDate" TIMESTAMP(3),
    "memberCodes" TEXT,
    "cssClass" TEXT,
    "articleImage" TEXT,
    "syncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OfficialEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OfficialEvent_date_idx" ON "OfficialEvent"("date");
