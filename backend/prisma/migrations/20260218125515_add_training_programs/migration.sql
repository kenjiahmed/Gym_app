-- CreateTable
CREATE TABLE "programs" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "goal" TEXT NOT NULL,
    "durationWeeks" INTEGER NOT NULL,
    "coverImage" TEXT,
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "category" TEXT NOT NULL DEFAULT 'unisex',
    "muscleGroups" TEXT[],
    "equipment" TEXT[],
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "programs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "program_weeks" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "weekNumber" INTEGER NOT NULL,
    "title" TEXT,
    "description" TEXT,

    CONSTRAINT "program_weeks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "program_workouts" (
    "id" TEXT NOT NULL,
    "weekId" TEXT NOT NULL,
    "dayNumber" INTEGER NOT NULL,
    "workoutId" TEXT NOT NULL,
    "isRestDay" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,

    CONSTRAINT "program_workouts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_program_enrollments" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "currentWeek" INTEGER NOT NULL DEFAULT 1,
    "completedWorkouts" JSONB NOT NULL DEFAULT '{}',
    "status" TEXT NOT NULL DEFAULT 'active',
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_program_enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "programs_level_idx" ON "programs"("level");

-- CreateIndex
CREATE INDEX "programs_goal_idx" ON "programs"("goal");

-- CreateIndex
CREATE INDEX "programs_category_idx" ON "programs"("category");

-- CreateIndex
CREATE INDEX "programs_featured_idx" ON "programs"("featured");

-- CreateIndex
CREATE INDEX "program_weeks_programId_idx" ON "program_weeks"("programId");

-- CreateIndex
CREATE UNIQUE INDEX "program_weeks_programId_weekNumber_key" ON "program_weeks"("programId", "weekNumber");

-- CreateIndex
CREATE INDEX "program_workouts_weekId_idx" ON "program_workouts"("weekId");

-- CreateIndex
CREATE INDEX "program_workouts_workoutId_idx" ON "program_workouts"("workoutId");

-- CreateIndex
CREATE UNIQUE INDEX "program_workouts_weekId_dayNumber_key" ON "program_workouts"("weekId", "dayNumber");

-- CreateIndex
CREATE INDEX "user_program_enrollments_userId_idx" ON "user_program_enrollments"("userId");

-- CreateIndex
CREATE INDEX "user_program_enrollments_programId_idx" ON "user_program_enrollments"("programId");

-- CreateIndex
CREATE INDEX "user_program_enrollments_status_idx" ON "user_program_enrollments"("status");

-- CreateIndex
CREATE UNIQUE INDEX "user_program_enrollments_userId_programId_key" ON "user_program_enrollments"("userId", "programId");

-- AddForeignKey
ALTER TABLE "program_weeks" ADD CONSTRAINT "program_weeks_programId_fkey" FOREIGN KEY ("programId") REFERENCES "programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "program_workouts" ADD CONSTRAINT "program_workouts_weekId_fkey" FOREIGN KEY ("weekId") REFERENCES "program_weeks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "program_workouts" ADD CONSTRAINT "program_workouts_workoutId_fkey" FOREIGN KEY ("workoutId") REFERENCES "workout_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_program_enrollments" ADD CONSTRAINT "user_program_enrollments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_program_enrollments" ADD CONSTRAINT "user_program_enrollments_programId_fkey" FOREIGN KEY ("programId") REFERENCES "programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
