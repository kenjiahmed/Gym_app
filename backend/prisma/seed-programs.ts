import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding training programs...');

  // First, ensure we have a test user for creating workouts
  let testUser = await prisma.user.findFirst({
    where: { email: 'admin@test.com' },
  });

  if (!testUser) {
    testUser = await prisma.user.create({
      data: {
        email: 'admin@test.com',
        password: '$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/1u', // password123
        name: 'Admin User',
        role: 'admin',
      },
    });
  }

  // Get existing exercises
  const exercises = await prisma.exercise.findMany();
  
  // Helper function to create workouts
  async function createWorkout(
    name: string,
    description: string,
    exercisesList: { exercise: any; sets: number; reps: number; restTime: number }[],
    options: {
      category?: string;
      muscleFocus?: string;
      workoutType?: string;
      location?: string;
      difficulty?: string;
      durationMinutes?: number;
      isPremium?: boolean;
    } = {}
  ) {
    const workout = await prisma.workoutPlan.create({
      data: {
        name,
        description,
        userId: testUser!.id,
        isPublic: true,
        category: options.category || 'unisex',
        muscleFocus: options.muscleFocus || 'full_body',
        workoutType: options.workoutType || 'strength',
        location: options.location || 'gym',
        difficulty: options.difficulty || 'intermediate',
        durationMinutes: options.durationMinutes || 60,
        isPremium: options.isPremium || false,
      },
    });

    // Add exercises to workout
    for (let i = 0; i < exercisesList.length; i++) {
      await prisma.workoutExercise.create({
        data: {
          workoutPlanId: workout.id,
          exerciseId: exercisesList[i].exercise.id,
          sets: exercisesList[i].sets,
          reps: exercisesList[i].reps,
          restTime: exercisesList[i].restTime,
          order: i + 1,
        },
      });
    }

    return workout;
  }

  // Find exercises by muscle group for workout creation
  const chestExercises = exercises.filter(e => e.muscleGroup === 'Chest');
  const backExercises = exercises.filter(e => e.muscleGroup === 'Back');
  const shoulderExercises = exercises.filter(e => e.muscleGroup === 'Shoulders');
  const legExercises = exercises.filter(e => e.muscleGroup === 'Legs');
  const bicepExercises = exercises.filter(e => e.muscleGroup === 'Biceps');
  const tricepExercises = exercises.filter(e => e.muscleGroup === 'Triceps');

  console.log('Creating workouts for programs...');

  // Create workouts for Push/Pull/Legs program
  const pushWorkout = await createWorkout(
    'Push Day - Chest, Shoulders, Triceps',
    'Focus on pushing movements for upper body development',
    [
      { exercise: chestExercises[0], sets: 4, reps: 8, restTime: 120 },
      { exercise: chestExercises[1], sets: 3, reps: 10, restTime: 90 },
      { exercise: shoulderExercises[0], sets: 4, reps: 8, restTime: 120 },
      { exercise: shoulderExercises[1], sets: 3, reps: 12, restTime: 60 },
      { exercise: tricepExercises[0], sets: 3, reps: 12, restTime: 60 },
    ],
    { muscleFocus: 'chest', workoutType: 'strength', durationMinutes: 75 }
  );

  const pullWorkout = await createWorkout(
    'Pull Day - Back, Biceps',
    'Focus on pulling movements for back and arm development',
    [
      { exercise: backExercises[0], sets: 4, reps: 6, restTime: 180 },
      { exercise: backExercises[1], sets: 3, reps: 8, restTime: 120 },
      { exercise: backExercises[2], sets: 3, reps: 10, restTime: 90 },
      { exercise: bicepExercises[0], sets: 3, reps: 10, restTime: 60 },
      { exercise: bicepExercises[1], sets: 3, reps: 12, restTime: 60 },
    ],
    { muscleFocus: 'back', workoutType: 'strength', durationMinutes: 75 }
  );

  const legWorkout = await createWorkout(
    'Leg Day - Quads, Hamstrings, Glutes',
    'Complete lower body workout with progressive overload',
    [
      { exercise: legExercises[0], sets: 4, reps: 8, restTime: 180 },
      { exercise: legExercises[1], sets: 3, reps: 10, restTime: 120 },
      { exercise: legExercises[2], sets: 3, reps: 12, restTime: 90 },
      { exercise: legExercises[3], sets: 3, reps: 12, restTime: 60 },
      { exercise: legExercises[4], sets: 4, reps: 15, restTime: 60 },
    ],
    { muscleFocus: 'legs', workoutType: 'strength', durationMinutes: 80 }
  );

  // Glute-focused workouts
  const gluteWorkout1 = await createWorkout(
    'Glute Builder - Lower Body Power',
    'Heavy compound movements for glute development',
    [
      { exercise: legExercises[0], sets: 4, reps: 10, restTime: 150 },
      { exercise: legExercises[1], sets: 4, reps: 10, restTime: 120 },
      { exercise: legExercises[2], sets: 3, reps: 15, restTime: 90 },
      { exercise: legExercises[3], sets: 3, reps: 12, restTime: 60 },
    ],
    { category: 'women', muscleFocus: 'glutes', workoutType: 'strength', durationMinutes: 70, isPremium: true }
  );

  const gluteWorkout2 = await createWorkout(
    'Glute Activation & Sculpt',
    'Isolation work and high-rep glute activation',
    [
      { exercise: legExercises[1], sets: 3, reps: 12, restTime: 90 },
      { exercise: legExercises[2], sets: 4, reps: 15, restTime: 75 },
      { exercise: legExercises[3], sets: 4, reps: 15, restTime: 60 },
      { exercise: legExercises[0], sets: 3, reps: 20, restTime: 60 },
    ],
    { category: 'women', muscleFocus: 'glutes', workoutType: 'sculpt', durationMinutes: 60, isPremium: true }
  );

  // Cardio/HIIT workouts
  const hiitWorkout = await createWorkout(
    'HIIT Fat Burn Circuit',
    'High-intensity intervals for maximum calorie burn',
    [
      { exercise: legExercises[0], sets: 4, reps: 20, restTime: 30 },
      { exercise: backExercises[1], sets: 3, reps: 15, restTime: 30 },
      { exercise: chestExercises[0], sets: 3, reps: 15, restTime: 30 },
      { exercise: legExercises[4], sets: 3, reps: 25, restTime: 30 },
    ],
    { workoutType: 'hiit', durationMinutes: 30, difficulty: 'intermediate' }
  );

  // Full body workouts
  const fullBodyWorkout = await createWorkout(
    'Full Body Strength',
    'Complete body workout hitting all major muscle groups',
    [
      { exercise: legExercises[0], sets: 3, reps: 10, restTime: 120 },
      { exercise: chestExercises[0], sets: 3, reps: 10, restTime: 90 },
      { exercise: backExercises[2], sets: 3, reps: 10, restTime: 90 },
      { exercise: shoulderExercises[0], sets: 3, reps: 10, restTime: 90 },
      { exercise: legExercises[1], sets: 3, reps: 10, restTime: 90 },
    ],
    { muscleFocus: 'full_body', workoutType: 'strength', durationMinutes: 65 }
  );

  // Bodyweight workouts
  const bodyweightWorkout = await createWorkout(
    'Bodyweight Full Body',
    'No equipment needed - perfect for home training',
    [
      { exercise: legExercises[0], sets: 4, reps: 15, restTime: 60 },
      { exercise: chestExercises[0], sets: 4, reps: 12, restTime: 60 },
      { exercise: backExercises[1], sets: 3, reps: 10, restTime: 90 },
      { exercise: legExercises[4], sets: 3, reps: 20, restTime: 45 },
    ],
    { location: 'home', difficulty: 'beginner', durationMinutes: 40 }
  );

  console.log('✅ Created program workouts');

  // ============================================
  // PROGRAM 1: Muscle Building (8 Weeks)
  // ============================================
  const muscleBuildingProgram = await prisma.program.create({
    data: {
      title: '8-Week Muscle Builder',
      description: 'Progressive push/pull/legs split designed for maximum hypertrophy. Train 5 days per week with strategic rest days for optimal recovery and growth.',
      level: 'Intermediate',
      goal: 'Muscle Gain',
      durationWeeks: 8,
      category: 'men',
      muscleGroups: ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms'],
      equipment: ['Barbell', 'Dumbbells', 'Cables', 'Machines'],
      coverImage: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800',
      isPremium: false,
      featured: true,
    },
  });

  // Create 8 weeks for muscle building
  for (let week = 1; week <= 8; week++) {
    const programWeek = await prisma.programWeek.create({
      data: {
        programId: muscleBuildingProgram.id,
        weekNumber: week,
        title: week <= 2 ? 'Foundation Phase' : week <= 5 ? 'Progressive Overload' : 'Peak Intensity',
        description: week <= 2 
          ? 'Focus on proper form and establishing baseline strength'
          : week <= 5 
          ? 'Increase weight by 5-10% weekly while maintaining form'
          : 'Push your limits with peak intensity and volume',
      },
    });

    // Monday - Push
    await prisma.programWorkout.create({
      data: {
        weekId: programWeek.id,
        dayNumber: 1,
        workoutId: pushWorkout.id,
        notes: week <= 2 ? 'Focus on form' : week <= 5 ? 'Increase weight by 5%' : 'Push to near failure',
      },
    });

    // Tuesday - Pull
    await prisma.programWorkout.create({
      data: {
        weekId: programWeek.id,
        dayNumber: 2,
        workoutId: pullWorkout.id,
        notes: 'Mind-muscle connection on back exercises',
      },
    });

    // Wednesday - Rest
    await prisma.programWorkout.create({
      data: {
        weekId: programWeek.id,
        dayNumber: 3,
        workoutId: legWorkout.id,
        isRestDay: true,
        notes: 'Active recovery - light stretching or walk',
      },
    });

    // Thursday - Legs
    await prisma.programWorkout.create({
      data: {
        weekId: programWeek.id,
        dayNumber: 4,
        workoutId: legWorkout.id,
        notes: 'Go deep on squats, control the weight',
      },
    });

    // Friday - Push
    await prisma.programWorkout.create({
      data: {
        weekId: programWeek.id,
        dayNumber: 5,
        workoutId: pushWorkout.id,
        notes: 'Second push day with slightly higher reps',
      },
    });

    // Saturday - Pull
    await prisma.programWorkout.create({
      data: {
        weekId: programWeek.id,
        dayNumber: 6,
        workoutId: pullWorkout.id,
        notes: 'Focus on back thickness',
      },
    });

    // Sunday - Rest
    await prisma.programWorkout.create({
      data: {
        weekId: programWeek.id,
        dayNumber: 7,
        workoutId: legWorkout.id,
        isRestDay: true,
        notes: 'Full rest day',
      },
    });
  }

  console.log('✅ Created Muscle Building Program (8 weeks)');

  // ============================================
  // PROGRAM 2: Fat Loss (6 Weeks)
  // ============================================
  const fatLossProgram = await prisma.program.create({
    data: {
      title: '6-Week Fat Shredder',
      description: 'Strategic combination of strength training and HIIT to maximize fat loss while preserving muscle. Train 5-6 days per week with progressive intensity.',
      level: 'Intermediate',
      goal: 'Fat Loss',
      durationWeeks: 6,
      category: 'unisex',
      muscleGroups: ['Full Body', 'Core', 'Cardio'],
      equipment: ['Dumbbells', 'Bodyweight', 'Cables'],
      coverImage: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800',
      isPremium: false,
      featured: true,
    },
  });

  for (let week = 1; week <= 6; week++) {
    const programWeek = await prisma.programWeek.create({
      data: {
        programId: fatLossProgram.id,
        weekNumber: week,
        title: week <= 2 ? 'Metabolic Kickstart' : week <= 4 ? 'Intensity Ramp' : 'Final Burn Phase',
        description: week <= 2 
          ? 'Build your conditioning base'
          : week <= 4 
          ? 'Increase intensity and reduce rest times'
          : 'Maximum fat burning intensity',
      },
    });

    // Monday - Full Body Strength
    await prisma.programWorkout.create({
      data: {
        weekId: programWeek.id,
        dayNumber: 1,
        workoutId: fullBodyWorkout.id,
        notes: 'Compound movements to preserve muscle',
      },
    });

    // Tuesday - HIIT
    await prisma.programWorkout.create({
      data: {
        weekId: programWeek.id,
        dayNumber: 2,
        workoutId: hiitWorkout.id,
        notes: 'Maximum effort intervals',
      },
    });

    // Wednesday - Upper Body
    await prisma.programWorkout.create({
      data: {
        weekId: programWeek.id,
        dayNumber: 3,
        workoutId: pushWorkout.id,
        notes: 'Maintain strength in deficit',
      },
    });

    // Thursday - HIIT
    await prisma.programWorkout.create({
      data: {
        weekId: programWeek.id,
        dayNumber: 4,
        workoutId: hiitWorkout.id,
        notes: 'Shorter rest, higher intensity',
      },
    });

    // Friday - Lower Body
    await prisma.programWorkout.create({
      data: {
        weekId: programWeek.id,
        dayNumber: 5,
        workoutId: legWorkout.id,
        notes: 'Big muscles = big calorie burn',
      },
    });

    // Saturday - Active Recovery or HIIT
    await prisma.programWorkout.create({
      data: {
        weekId: programWeek.id,
        dayNumber: 6,
        workoutId: hiitWorkout.id,
        notes: week % 2 === 0 ? 'Light cardio and stretching' : 'Optional HIIT session',
      },
    });

    // Sunday - Rest
    await prisma.programWorkout.create({
      data: {
        weekId: programWeek.id,
        dayNumber: 7,
        workoutId: legWorkout.id,
        isRestDay: true,
        notes: 'Rest and meal prep',
      },
    });
  }

  console.log('✅ Created Fat Loss Program (6 weeks)');

  // ============================================
  // PROGRAM 3: Glute Builder (8 Weeks)
  // ============================================
  const gluteProgram = await prisma.program.create({
    data: {
      title: '8-Week Glute Builder',
      description: 'Science-backed program focused on maximum glute development with progressive overload. Combines heavy compounds and targeted isolation for peak results.',
      level: 'Intermediate',
      goal: 'Glutes',
      durationWeeks: 8,
      category: 'women',
      muscleGroups: ['Glutes', 'Hamstrings', 'Quads', 'Hips'],
      equipment: ['Dumbbells', 'Barbell', 'Resistance Bands', 'Cables'],
      coverImage: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
      isPremium: true,
      featured: true,
    },
  });

  for (let week = 1; week <= 8; week++) {
    const programWeek = await prisma.programWeek.create({
      data: {
        programId: gluteProgram.id,
        weekNumber: week,
        title: week <= 2 ? 'Activation Phase' : week <= 5 ? 'Growth Phase' : 'Sculpting Phase',
        description: week <= 2 
          ? 'Learn to feel the glute activation properly'
          : week <= 5 
          ? 'Progressive overload for maximum growth'
          : 'High-volume sculpting work',
      },
    });

    // Monday - Heavy Lower Body
    await prisma.programWorkout.create({
      data: {
        weekId: programWeek.id,
        dayNumber: 1,
        workoutId: gluteWorkout1.id,
        notes: 'Heavy compound movements - focus on glute squeeze',
      },
    });

    // Tuesday - Upper Body (maintenance)
    await prisma.programWorkout.create({
      data: {
        weekId: programWeek.id,
        dayNumber: 2,
        workoutId: pushWorkout.id,
        notes: 'Maintain upper body while focusing on lower',
      },
    });

    // Wednesday - Glute Activation
    await prisma.programWorkout.create({
      data: {
        weekId: programWeek.id,
        dayNumber: 3,
        workoutId: gluteWorkout2.id,
        notes: 'Lighter weight, perfect form, feel the burn',
      },
    });

    // Thursday - Rest
    await prisma.programWorkout.create({
      data: {
        weekId: programWeek.id,
        dayNumber: 4,
        workoutId: legWorkout.id,
        isRestDay: true,
        notes: 'Recovery day - muscles grow during rest',
      },
    });

    // Friday - Lower Body Power
    await prisma.programWorkout.create({
      data: {
        weekId: programWeek.id,
        dayNumber: 5,
        workoutId: gluteWorkout1.id,
        notes: 'Push heavier than Monday',
      },
    });

    // Saturday - Glute Pump
    await prisma.programWorkout.create({
      data: {
        weekId: programWeek.id,
        dayNumber: 6,
        workoutId: gluteWorkout2.id,
        notes: 'High-rep pump work',
      },
    });

    // Sunday - Rest
    await prisma.programWorkout.create({
      data: {
        weekId: programWeek.id,
        dayNumber: 7,
        workoutId: legWorkout.id,
        isRestDay: true,
        notes: 'Full recovery',
      },
    });
  }

  console.log('✅ Created Glute Builder Program (8 weeks)');

  // ============================================
  // PROGRAM 4: Home Bodyweight (4 Weeks)
  // ============================================
  const bodyweightProgram = await prisma.program.create({
    data: {
      title: '4-Week Home Body Transformation',
      description: 'No gym? No problem. Complete bodyweight program that builds strength, burns fat, and tones your entire body from the comfort of home.',
      level: 'Beginner',
      goal: 'Strength',
      durationWeeks: 4,
      category: 'unisex',
      muscleGroups: ['Full Body', 'Core', 'Legs'],
      equipment: ['None'],
      coverImage: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800',
      isPremium: false,
      featured: true,
    },
  });

  for (let week = 1; week <= 4; week++) {
    const programWeek = await prisma.programWeek.create({
      data: {
        programId: bodyweightProgram.id,
        weekNumber: week,
        title: week === 1 ? 'Foundation Week' : week === 2 ? 'Build Endurance' : week === 3 ? 'Increase Volume' : 'Challenge Week',
        description: week === 1 
          ? 'Master the basic movements'
          : week === 2 
          ? 'Increase reps and reduce rest'
          : week === 3
          ? 'Add more sets and variations'
          : 'Push your limits with advanced variations',
      },
    });

    // Monday - Full Body
    await prisma.programWorkout.create({
      data: {
        weekId: programWeek.id,
        dayNumber: 1,
        workoutId: bodyweightWorkout.id,
        notes: 'No equipment needed - just effort',
      },
    });

    // Tuesday - Rest
    await prisma.programWorkout.create({
      data: {
        weekId: programWeek.id,
        dayNumber: 2,
        workoutId: bodyweightWorkout.id,
        isRestDay: true,
        notes: 'Active recovery - walk or stretch',
      },
    });

    // Wednesday - Full Body
    await prisma.programWorkout.create({
      data: {
        weekId: programWeek.id,
        dayNumber: 3,
        workoutId: bodyweightWorkout.id,
        notes: 'Focus on controlled movements',
      },
    });

    // Thursday - Rest
    await prisma.programWorkout.create({
      data: {
        weekId: programWeek.id,
        dayNumber: 4,
        workoutId: bodyweightWorkout.id,
        isRestDay: true,
        notes: 'Recovery',
      },
    });

    // Friday - Full Body
    await prisma.programWorkout.create({
      data: {
        weekId: programWeek.id,
        dayNumber: 5,
        workoutId: bodyweightWorkout.id,
        notes: 'Increase intensity',
      },
    });

    // Saturday - Light Activity
    await prisma.programWorkout.create({
      data: {
        weekId: programWeek.id,
        dayNumber: 6,
        workoutId: bodyweightWorkout.id,
        notes: week % 2 === 0 ? 'Light stretching' : 'Optional bonus workout',
      },
    });

    // Sunday - Rest
    await prisma.programWorkout.create({
      data: {
        weekId: programWeek.id,
        dayNumber: 7,
        workoutId: bodyweightWorkout.id,
        isRestDay: true,
        notes: 'Prepare for next week',
      },
    });
  }

  console.log('✅ Created Home Bodyweight Program (4 weeks)');

  // ============================================
  // BONUS PROGRAMS
  // ============================================

  // Strength Program
  const strengthProgram = await prisma.program.create({
    data: {
      title: '12-Week Powerlifting Strength',
      description: 'Focused on the big three: Squat, Bench, Deadlift. Build raw strength with proven powerlifting methods and progressive periodization.',
      level: 'Advanced',
      goal: 'Strength',
      durationWeeks: 12,
      category: 'men',
      muscleGroups: ['Legs', 'Chest', 'Back'],
      equipment: ['Barbell', 'Power Rack', 'Bench'],
      coverImage: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800',
      isPremium: true,
      featured: false,
    },
  });

  // Create 12 weeks (simplified for now, just structure)
  for (let week = 1; week <= 12; week++) {
    const programWeek = await prisma.programWeek.create({
      data: {
        programId: strengthProgram.id,
        weekNumber: week,
        title: `Week ${week} - Strength Block`,
        description: 'Focus on compound lifts',
      },
    });

    // Just add basic structure - could expand this
    for (let day = 1; day <= 7; day++) {
      const isRestDay = day === 4 || day === 7;
      const workout = day === 1 || day === 5 ? legWorkout : day === 2 ? pushWorkout : pullWorkout;
      
      await prisma.programWorkout.create({
        data: {
          weekId: programWeek.id,
          dayNumber: day,
          workoutId: workout.id,
          isRestDay,
          notes: isRestDay ? 'Rest and recovery' : 'Progressive overload',
        },
      });
    }
  }

  console.log('✅ Created Powerlifting Strength Program (12 weeks)');

  // Endurance Program
  const enduranceProgram = await prisma.program.create({
    data: {
      title: '6-Week Athletic Endurance',
      description: 'Build cardiovascular endurance and muscular stamina. Perfect for athletes and those looking to improve overall fitness and work capacity.',
      level: 'Beginner',
      goal: 'Endurance',
      durationWeeks: 6,
      category: 'unisex',
      muscleGroups: ['Full Body', 'Core', 'Cardio'],
      equipment: ['Bodyweight', 'Light Dumbbells'],
      coverImage: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800',
      isPremium: false,
      featured: false,
    },
  });

  for (let week = 1; week <= 6; week++) {
    const programWeek = await prisma.programWeek.create({
      data: {
        programId: enduranceProgram.id,
        weekNumber: week,
        title: `Endurance Week ${week}`,
        description: 'Build work capacity',
      },
    });

    for (let day = 1; day <= 7; day++) {
      const isRestDay = day === 7;
      const workout = day % 2 === 0 ? hiitWorkout : fullBodyWorkout;
      
      await prisma.programWorkout.create({
        data: {
          weekId: programWeek.id,
          dayNumber: day,
          workoutId: workout.id,
          isRestDay,
          notes: isRestDay ? 'Recovery day' : 'Focus on endurance',
        },
      });
    }
  }

  console.log('✅ Created Athletic Endurance Program (6 weeks)');

  console.log('🎉 Training programs seeding completed!');
  console.log(`📊 Total programs created: 6`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding programs:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
