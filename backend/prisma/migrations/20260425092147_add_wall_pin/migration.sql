-- CreateTable
CREATE TABLE "WallPin" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "imageUrl" TEXT,
    "authorName" TEXT,
    "authorAvatar" TEXT,
    "siteName" TEXT,
    "memo" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WallPin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WallPin_userId_createdAt_idx" ON "WallPin"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "WallPin_isPublic_createdAt_idx" ON "WallPin"("isPublic", "createdAt");

-- AddForeignKey
ALTER TABLE "WallPin" ADD CONSTRAINT "WallPin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
