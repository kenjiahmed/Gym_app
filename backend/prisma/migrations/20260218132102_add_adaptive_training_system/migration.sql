-- CreateTable
CREATE TABLE "user_performance_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "workoutSessionId" TEXT,
    "weightUsed" DOUBLE PRECISION,
    "repsCompleted" INTEGER NOT NULL,
    "setsCompleted" INTEGER NOT NULL,
    "rpe" INTEGER,
    "notes" TEXT,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_performance_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "adaptation_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "programId" TEXT,
    "exerciseId" TEXT,
    "adjustmentType" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "previousValue" JSONB,
    "newValue" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "adaptation_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_performance_logs_userId_idx" ON "user_performance_logs"("userId");

-- CreateIndex
CREATE INDEX "user_performance_logs_exerciseId_idx" ON "user_performance_logs"("exerciseId");

-- CreateIndex
CREATE INDEX "user_performance_logs_completedAt_idx" ON "user_performance_logs"("completedAt");

-- CreateIndex
CREATE INDEX "user_performance_logs_workoutSessionId_idx" ON "user_performance_logs"("workoutSessionId");

-- CreateIndex
CREATE INDEX "adaptation_logs_userId_idx" ON "adaptation_logs"("userId");

-- CreateIndex
CREATE INDEX "adaptation_logs_programId_idx" ON "adaptation_logs"("programId");

-- CreateIndex
CREATE INDEX "adaptation_logs_createdAt_idx" ON "adaptation_logs"("createdAt");

-- AddForeignKey
ALTER TABLE "user_performance_logs" ADD CONSTRAINT "user_performance_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_performance_logs" ADD CONSTRAINT "user_performance_logs_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "exercises"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "adaptation_logs" ADD CONSTRAINT "adaptation_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
