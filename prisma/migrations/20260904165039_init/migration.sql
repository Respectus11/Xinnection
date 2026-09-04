-- CreateEnum
CREATE TYPE "ThreadStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'ESCALATED');

-- CreateEnum
CREATE TYPE "SenderRole" AS ENUM ('SEEKER', 'PROFESSIONAL');

-- CreateEnum
CREATE TYPE "ProfessionalStatus" AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('ADMIN', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "CrisisFlagSource" AS ENUM ('SEEKER_SELECTION', 'KEYWORD_SCREEN', 'PROFESSIONAL');

-- CreateEnum
CREATE TYPE "AuditActorType" AS ENUM ('ADMIN', 'PROFESSIONAL', 'SYSTEM');

-- CreateTable
CREATE TABLE "AnonymousSession" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AnonymousSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Thread" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "status" "ThreadStatus" NOT NULL DEFAULT 'OPEN',
    "claimedById" TEXT,
    "claimedAt" TIMESTAMP(3),
    "wrappedDek" TEXT NOT NULL,
    "dekVersion" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Thread_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "senderRole" "SenderRole" NOT NULL,
    "ciphertext" TEXT NOT NULL,
    "iv" TEXT NOT NULL,
    "authTag" TEXT NOT NULL,
    "keyVersion" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "isCrisis" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Professional" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "totpSecretEnc" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "credentials" TEXT NOT NULL,
    "licenseNumber" TEXT NOT NULL,
    "specialty" TEXT NOT NULL,
    "languages" TEXT[],
    "status" "ProfessionalStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Professional_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "totpSecretEnc" TEXT NOT NULL,
    "role" "AdminRole" NOT NULL DEFAULT 'ADMIN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLogEntry" (
    "id" TEXT NOT NULL,
    "actorType" "AuditActorType" NOT NULL,
    "actorId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLogEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrisisFlag" (
    "id" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "source" "CrisisFlagSource" NOT NULL,
    "reason" TEXT,
    "raisedById" TEXT,
    "raisedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "resolvedById" TEXT,

    CONSTRAINT "CrisisFlag_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AnonymousSession_tokenHash_key" ON "AnonymousSession"("tokenHash");

-- CreateIndex
CREATE INDEX "AnonymousSession_expiresAt_idx" ON "AnonymousSession"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "Thread_sessionId_key" ON "Thread"("sessionId");

-- CreateIndex
CREATE INDEX "Thread_status_claimedById_idx" ON "Thread"("status", "claimedById");

-- CreateIndex
CREATE INDEX "Thread_categoryId_idx" ON "Thread"("categoryId");

-- CreateIndex
CREATE INDEX "Thread_createdAt_idx" ON "Thread"("createdAt");

-- CreateIndex
CREATE INDEX "Message_threadId_createdAt_idx" ON "Message"("threadId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Professional_email_key" ON "Professional"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Professional_licenseNumber_key" ON "Professional"("licenseNumber");

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- CreateIndex
CREATE INDEX "AuditLogEntry_action_idx" ON "AuditLogEntry"("action");

-- CreateIndex
CREATE INDEX "AuditLogEntry_actorId_idx" ON "AuditLogEntry"("actorId");

-- CreateIndex
CREATE INDEX "AuditLogEntry_createdAt_idx" ON "AuditLogEntry"("createdAt");

-- CreateIndex
CREATE INDEX "CrisisFlag_resolvedAt_raisedAt_idx" ON "CrisisFlag"("resolvedAt", "raisedAt");

-- CreateIndex
CREATE INDEX "CrisisFlag_threadId_idx" ON "CrisisFlag"("threadId");

-- AddForeignKey
ALTER TABLE "Thread" ADD CONSTRAINT "Thread_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "AnonymousSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Thread" ADD CONSTRAINT "Thread_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Thread" ADD CONSTRAINT "Thread_claimedById_fkey" FOREIGN KEY ("claimedById") REFERENCES "Professional"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "Thread"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrisisFlag" ADD CONSTRAINT "CrisisFlag_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "Thread"("id") ON DELETE CASCADE ON UPDATE CASCADE;
