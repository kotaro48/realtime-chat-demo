-- CreateTable
CREATE TABLE "ThreadBookmark" (
    "userId" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ThreadBookmark_pkey" PRIMARY KEY ("userId","threadId")
);

-- CreateIndex
CREATE INDEX "ThreadBookmark_userId_idx" ON "ThreadBookmark"("userId");

-- AddForeignKey
ALTER TABLE "ThreadBookmark" ADD CONSTRAINT "ThreadBookmark_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ThreadBookmark" ADD CONSTRAINT "ThreadBookmark_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "Thread"("id") ON DELETE CASCADE ON UPDATE CASCADE;
