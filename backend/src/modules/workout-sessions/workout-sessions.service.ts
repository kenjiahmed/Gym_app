import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  StartWorkoutSessionDto,
  CompleteWorkoutSessionDto,
} from './dto/workout-session.dto';

@Injectable()
export class WorkoutSessionsService {
  constructor(private prisma: PrismaService) {}

  async startSession(userId: string, startWorkoutDto: StartWorkoutSessionDto) {
    const { workoutPlanId } = startWorkoutDto;

    // Verify workout plan exists and belongs to user
    const workoutPlan = await this.prisma.workoutPlan.findUnique({
      where: { id: workoutPlanId },
    });

    if (!workoutPlan) {
      throw new NotFoundException('Workout plan not found');
    }

    if (workoutPlan.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    // Check if there's an active session
    const activeSession = await this.prisma.workoutSession.findFirst({
      where: {
        userId,
        completed: false,
      },
    });

    if (activeSession) {
      throw new BadRequestException('You have an active workout session');
    }

    return this.prisma.workoutSession.create({
      data: {
        userId,
        workoutPlanId,
      },
      include: {
        workoutPlan: {
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
    });
  }

  async completeSession(
    id: string,
    userId: string,
    completeWorkoutDto: CompleteWorkoutSessionDto,
  ) {
    const session = await this.prisma.workoutSession.findUnique({
      where: { id },
    });

    if (!session) {
      throw new NotFoundException('Workout session not found');
    }

    if (session.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    if (session.completed) {
      throw new BadRequestException('Session already completed');
    }

    const { completedSets, notes } = completeWorkoutDto;

    return this.prisma.workoutSession.update({
      where: { id },
      data: {
        endTime: new Date(),
        completed: true,
        notes,
        completedSets: {
          create: completedSets,
        },
      },
      include: {
        workoutPlan: true,
        completedSets: true,
      },
    });
  }

  async getActiveSession(userId: string) {
    return this.prisma.workoutSession.findFirst({
      where: {
        userId,
        completed: false,
      },
      include: {
        workoutPlan: {
          include: {
            workoutExercises: {
              include: {
                exercise: true,
              },
              orderBy: { order: 'asc' },
            },
          },
        },
        completedSets: true,
      },
    });
  }

  async getHistory(userId: string) {
    return this.prisma.workoutSession.findMany({
      where: {
        userId,
        completed: true,
      },
      include: {
        workoutPlan: true,
        completedSets: true,
      },
      orderBy: { startTime: 'desc' },
      take: 50,
    });
  }

  async getSessionById(id: string, userId: string) {
    const session = await this.prisma.workoutSession.findUnique({
      where: { id },
      include: {
        workoutPlan: {
          include: {
            workoutExercises: {
              include: {
                exercise: true,
              },
            },
          },
        },
        completedSets: true,
      },
    });

    if (!session) {
      throw new NotFoundException('Workout session not found');
    }

    if (session.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return session;
  }

  async cancelSession(id: string, userId: string) {
    const session = await this.prisma.workoutSession.findUnique({
      where: { id },
    });

    if (!session) {
      throw new NotFoundException('Workout session not found');
    }

    if (session.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    if (session.completed) {
      throw new BadRequestException('Cannot cancel completed session');
    }

    return this.prisma.workoutSession.delete({
      where: { id },
    });
  }
}
