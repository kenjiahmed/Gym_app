import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create exercises
  const exercises = await Promise.all([
    // Chest
    prisma.exercise.create({
      data: {
        name: 'Bench Press',
        muscleGroup: 'Chest',
        description: 'Compound chest exercise',
      },
    }),
    prisma.exercise.create({
      data: {
        name: 'Incline Dumbbell Press',
        muscleGroup: 'Chest',
        description: 'Upper chest focus',
      },
    }),
    prisma.exercise.create({
      data: {
        name: 'Cable Flyes',
        muscleGroup: 'Chest',
        description: 'Chest isolation',
      },
    }),
    // Back
    prisma.exercise.create({
      data: {
        name: 'Deadlift',
        muscleGroup: 'Back',
        description: 'Full posterior chain',
      },
    }),
    prisma.exercise.create({
      data: {
        name: 'Pull-ups',
        muscleGroup: 'Back',
        description: 'Lat width builder',
      },
    }),
    prisma.exercise.create({
      data: {
        name: 'Barbell Rows',
        muscleGroup: 'Back',
        description: 'Thick back builder',
      },
    }),
    prisma.exercise.create({
      data: {
        name: 'Lat Pulldown',
        muscleGroup: 'Back',
        description: 'Lat isolation',
      },
    }),
    // Shoulders
    prisma.exercise.create({
      data: {
        name: 'Overhead Press',
        muscleGroup: 'Shoulders',
        description: 'Compound shoulder movement',
      },
    }),
    prisma.exercise.create({
      data: {
        name: 'Lateral Raises',
        muscleGroup: 'Shoulders',
        description: 'Side delt isolation',
      },
    }),
    prisma.exercise.create({
      data: {
        name: 'Face Pulls',
        muscleGroup: 'Shoulders',
        description: 'Rear delt and rotator cuff',
      },
    }),
    // Arms
    prisma.exercise.create({
      data: {
        name: 'Barbell Curl',
        muscleGroup: 'Biceps',
        description: 'Bicep mass builder',
      },
    }),
    prisma.exercise.create({
      data: {
        name: 'Hammer Curls',
        muscleGroup: 'Biceps',
        description: 'Bicep and forearm',
      },
    }),
    prisma.exercise.create({
      data: {
        name: 'Tricep Pushdown',
        muscleGroup: 'Triceps',
        description: 'Tricep isolation',
      },
    }),
    prisma.exercise.create({
      data: {
        name: 'Skull Crushers',
        muscleGroup: 'Triceps',
        description: 'Tricep mass builder',
      },
    }),
    // Legs
    prisma.exercise.create({
      data: {
        name: 'Squat',
        muscleGroup: 'Legs',
        description: 'King of leg exercises',
      },
    }),
    prisma.exercise.create({
      data: {
        name: 'Romanian Deadlift',
        muscleGroup: 'Legs',
        description: 'Hamstring focus',
      },
    }),
    prisma.exercise.create({
      data: {
        name: 'Leg Press',
        muscleGroup: 'Legs',
        description: 'Quad mass builder',
      },
    }),
    prisma.exercise.create({
      data: {
        name: 'Leg Curl',
        muscleGroup: 'Legs',
        description: 'Hamstring isolation',
      },
    }),
    prisma.exercise.create({
      data: {
        name: 'Calf Raises',
        muscleGroup: 'Legs',
        description: 'Calf development',
      },
    }),
  ]);

  console.log(`✅ Created ${exercises.length} exercises`);

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
