import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProgramDto, UpdateProgramDto, EnrollInProgramDto, UpdateProgressDto, ProgramFiltersDto } from './dto/program.dto';

@Injectable()
export class ProgramsService {
  constructor(private prisma: PrismaService) {}

  // Get all programs with optional filters
  async findAll(filters?: ProgramFiltersDto) {
    const where: any = {};

    if (filters?.goal) {
      where.goal = filters.goal;
    }
    if (filters?.level) {
      where.level = filters.level;
    }
    if (filters?.category) {
      where.category = filters.category;
    }
    if (filters?.maxWeeks) {
      where.durationWeeks = { lte: filters.maxWeeks };
    }
    if (filters?.featured !== undefined) {
      where.featured = filters.featured;
    }

    return this.prisma.program.findMany({
      where,
      include: {
        weeks: {
          include: {
            workouts: {
              include: {
                workout: {
                  include: {
                    workoutExercises: {
                      include: {
                        exercise: true,
                      },
                    },
                  },
                },
              },
            },
          },
          orderBy: { weekNumber: 'asc' },
        },
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
      orderBy: [
        { featured: 'desc' },
        { createdAt: 'desc' },
      ],
    });
  }

  // Get featured programs
  async findFeatured() {
    return this.prisma.program.findMany({
      where: { featured: true },
      include: {
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
      take: 6,
      orderBy: { createdAt: 'desc' },
    });
  }

  // Get single program with full details
  async findOne(id: string) {
    const program = await this.prisma.program.findUnique({
      where: { id },
      include: {
        weeks: {
          include: {
            workouts: {
              include: {
                workout: {
                  include: {
                    workoutExercises: {
                      include: {
                        exercise: true,
                      },
                      orderBy: { order: 'asc' },
                    },
                  },
                },
              },
              orderBy: { dayNumber: 'asc' },
            },
          },
          orderBy: { weekNumber: 'asc' },
        },
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
    });

    if (!program) {
      throw new NotFoundException('Program not found');
    }

    return program;
  }

  // Create new program (admin only)
  async create(createProgramDto: CreateProgramDto) {
    return this.prisma.program.create({
      data: createProgramDto,
    });
  }

  // Update program (admin only)
  async update(id: string, updateProgramDto: UpdateProgramDto) {
    try {
      return await this.prisma.program.update({
        where: { id },
        data: updateProgramDto,
      });
    } catch (error) {
      throw new NotFoundException('Program not found');
    }
  }

  // Delete program (admin only)
  async remove(id: string) {
    try {
      return await this.prisma.program.delete({
        where: { id },
      });
    } catch (error) {
      throw new NotFoundException('Program not found');
    }
  }

  // ==========================================
  // USER ENROLLMENT & PROGRESS TRACKING
  // ==========================================

  // Enroll user in a program
  async enrollUser(userId: string, enrollDto: EnrollInProgramDto) {
    const program = await this.prisma.program.findUnique({
      where: { id: enrollDto.programId },
    });

    if (!program) {
      throw new NotFoundException('Program not found');
    }

    // Check if user has required subscription for premium programs
    if (program.isPremium) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { subscriptionPlan: true },
      });

      if (user.subscriptionPlan === 'free') {
        throw new ForbiddenException('This program requires a Pro or Elite subscription');
      }
    }

    // Check if already enrolled
    const existingEnrollment = await this.prisma.userProgramEnrollment.findUnique({
      where: {
        userId_programId: {
          userId,
          programId: enrollDto.programId,
        },
      },
    });

    if (existingEnrollment) {
      if (existingEnrollment.status === 'active') {
        throw new BadRequestException('Already enrolled in this program');
      }
      
      // Re-activate if previously dropped
      return this.prisma.userProgramEnrollment.update({
        where: { id: existingEnrollment.id },
        data: {
          status: 'active',
          startDate: new Date(),
          currentWeek: 1,
          completedWorkouts: {},
        },
      });
    }

    // Create new enrollment
    return this.prisma.userProgramEnrollment.create({
      data: {
        userId,
        programId: enrollDto.programId,
        currentWeek: 1,
        completedWorkouts: {},
        status: 'active',
      },
      include: {
        program: {
          include: {
            weeks: {
              where: { weekNumber: 1 },
              include: {
                workouts: {
                  include: {
                    workout: true,
                  },
                  orderBy: { dayNumber: 'asc' },
                },
              },
            },
          },
        },
      },
    });
  }

  // Get user's active enrollments
  async getUserEnrollments(userId: string) {
    return this.prisma.userProgramEnrollment.findMany({
      where: {
        userId,
        status: 'active',
      },
      include: {
        program: {
          include: {
            weeks: {
              include: {
                workouts: {
                  include: {
                    workout: {
                      include: {
                        workoutExercises: {
                          include: {
                            exercise: true,
                          },
                          orderBy: { order: 'asc' },
                        },
                      },
                    },
                  },
                  orderBy: { dayNumber: 'asc' },
                },
              },
              orderBy: { weekNumber: 'asc' },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Get specific enrollment details
  async getEnrollmentDetails(userId: string, programId: string) {
    const enrollment = await this.prisma.userProgramEnrollment.findUnique({
      where: {
        userId_programId: {
          userId,
          programId,
        },
      },
      include: {
        program: {
          include: {
            weeks: {
              include: {
                workouts: {
                  include: {
                    workout: {
                      include: {
                        workoutExercises: {
                          include: {
                            exercise: true,
                          },
                          orderBy: { order: 'asc' },
                        },
                      },
                    },
                  },
                  orderBy: { dayNumber: 'asc' },
                },
              },
              orderBy: { weekNumber: 'asc' },
            },
          },
        },
      },
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    // Calculate progress
    const completedWorkouts = enrollment.completedWorkouts as any || {};
    let totalWorkouts = 0;
    let completedCount = 0;

    enrollment.program.weeks.forEach(week => {
      week.workouts.forEach(workout => {
        if (!workout.isRestDay) {
          totalWorkouts++;
          if (completedWorkouts[week.weekNumber]?.[workout.dayNumber]) {
            completedCount++;
          }
        }
      });
    });

    const progressPercentage = totalWorkouts > 0 ? Math.round((completedCount / totalWorkouts) * 100) : 0;

    return {
      ...enrollment,
      progressPercentage,
      totalWorkouts,
      completedCount,
    };
  }

  // Mark workout as complete
  async markWorkoutComplete(userId: string, programId: string, updateProgressDto: UpdateProgressDto) {
    const enrollment = await this.prisma.userProgramEnrollment.findUnique({
      where: {
        userId_programId: {
          userId,
          programId,
        },
      },
      include: {
        program: {
          include: {
            weeks: true,
          },
        },
      },
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    const completedWorkouts = (enrollment.completedWorkouts as any) || {};
    const { weekNumber, dayNumber, completed } = updateProgressDto;

    // Initialize week object if not exists
    if (!completedWorkouts[weekNumber]) {
      completedWorkouts[weekNumber] = {};
    }

    // Update completion status
    completedWorkouts[weekNumber][dayNumber] = completed;

    // Check if current week is completed
    const currentWeek = enrollment.program.weeks.find(w => w.weekNumber === enrollment.currentWeek);
    if (currentWeek) {
      const weekWorkouts = await this.prisma.programWorkout.findMany({
        where: {
          weekId: currentWeek.id,
          isRestDay: false,
        },
      });

      const allWorkoutsCompleted = weekWorkouts.every(
        workout => completedWorkouts[enrollment.currentWeek]?.[workout.dayNumber]
      );

      // Advance to next week if current week is completed
      let newCurrentWeek = enrollment.currentWeek;
      let newStatus = enrollment.status;

      if (allWorkoutsCompleted && enrollment.currentWeek < enrollment.program.durationWeeks) {
        newCurrentWeek = enrollment.currentWeek + 1;
      } else if (allWorkoutsCompleted && enrollment.currentWeek === enrollment.program.durationWeeks) {
        // Program completed
        newStatus = 'completed';
        return this.prisma.userProgramEnrollment.update({
          where: { id: enrollment.id },
          data: {
            completedWorkouts,
            currentWeek: newCurrentWeek,
            status: newStatus,
            completedAt: new Date(),
          },
        });
      }

      return this.prisma.userProgramEnrollment.update({
        where: { id: enrollment.id },
        data: {
          completedWorkouts,
          currentWeek: newCurrentWeek,
        },
      });
    }

    // Default update
    return this.prisma.userProgramEnrollment.update({
      where: { id: enrollment.id },
      data: {
        completedWorkouts,
      },
    });
  }

  // Drop program (unsubscribe)
  async dropProgram(userId: string, programId: string) {
    const enrollment = await this.prisma.userProgramEnrollment.findUnique({
      where: {
        userId_programId: {
          userId,
          programId,
        },
      },
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    return this.prisma.userProgramEnrollment.update({
      where: { id: enrollment.id },
      data: {
        status: 'dropped',
      },
    });
  }

  // Get today's workout for user
  async getTodaysWorkout(userId: string) {
    const enrollments = await this.getUserEnrollments(userId);
    
    if (enrollments.length === 0) {
      return null;
    }

    // Get the first active enrollment
    const enrollment = enrollments[0];
    const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
    const dayNumber = today === 0 ? 7 : today; // Convert to 1-7 (Monday-Sunday)

    const currentWeek = enrollment.program.weeks.find(w => w.weekNumber === enrollment.currentWeek);
    
    if (!currentWeek) {
      return null;
    }

    const todaysWorkout = currentWeek.workouts.find(w => w.dayNumber === dayNumber);
    const completedWorkouts = (enrollment.completedWorkouts as any) || {};
    const isCompleted = completedWorkouts[enrollment.currentWeek]?.[dayNumber] || false;

    return {
      enrollment,
      currentWeek,
      todaysWorkout,
      isCompleted,
      dayNumber,
    };
  }
}
