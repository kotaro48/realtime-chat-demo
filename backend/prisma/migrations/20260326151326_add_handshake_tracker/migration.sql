-- CreateTable
CREATE TABLE "Member" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameKana" TEXT,
    "team" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HandshakeEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HandshakeEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HandshakeTicket" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "note" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HandshakeTicket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserMemberWatch" (
    "userId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "UserMemberWatch_pkey" PRIMARY KEY ("userId","memberId")
);

-- CreateIndex
CREATE INDEX "HandshakeEvent_userId_date_idx" ON "HandshakeEvent"("userId", "date");

-- CreateIndex
CREATE INDEX "HandshakeTicket_userId_idx" ON "HandshakeTicket"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "HandshakeTicket_userId_eventId_memberId_key" ON "HandshakeTicket"("userId", "eventId", "memberId");

-- AddForeignKey
ALTER TABLE "HandshakeEvent" ADD CONSTRAINT "HandshakeEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HandshakeTicket" ADD CONSTRAINT "HandshakeTicket_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HandshakeTicket" ADD CONSTRAINT "HandshakeTicket_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "HandshakeEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HandshakeTicket" ADD CONSTRAINT "HandshakeTicket_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserMemberWatch" ADD CONSTRAINT "UserMemberWatch_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserMemberWatch" ADD CONSTRAINT "UserMemberWatch_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
