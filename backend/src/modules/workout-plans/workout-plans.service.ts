import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateWorkoutPlanDto,
  UpdateWorkoutPlanDto,
} from './dto/workout-plan.dto';

@Injectable()
export class WorkoutPlansService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createWorkoutPlanDto: CreateWorkoutPlanDto) {
    const { name, description, exercises } = createWorkoutPlanDto;

    return this.prisma.workoutPlan.create({
      data: {
        name,
        description,
        userId,
        workoutExercises: {
          create: exercises,
        },
      },
      include: {
        workoutExercises: {
          include: {
            exercise: true,
          },
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.workoutPlan.findMany({
      where: { userId },
      include: {
        workoutExercises: {
          include: {
            exercise: true,
          },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const workoutPlan = await this.prisma.workoutPlan.findUnique({
      where: { id },
      include: {
        workoutExercises: {
          include: {
            exercise: true,
          },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!workoutPlan) {
      throw new NotFoundException('Workout plan not found');
    }

    if (workoutPlan.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return workoutPlan;
  }

  async update(
    id: string,
    userId: string,
    updateWorkoutPlanDto: UpdateWorkoutPlanDto,
  ) {
    await this.findOne(id, userId);

    const { name, description, exercises } = updateWorkoutPlanDto;

    // Delete existing exercises if new ones are provided
    if (exercises) {
      await this.prisma.workoutExercise.deleteMany({
        where: { workoutPlanId: id },
      });
    }

    return this.prisma.workoutPlan.update({
      where: { id },
      data: {
        name,
        description,
        ...(exercises && {
          workoutExercises: {
            create: exercises,
          },
        }),
      },
      include: {
        workoutExercises: {
          include: {
            exercise: true,
          },
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);

    return this.prisma.workoutPlan.delete({
      where: { id },
    });
  }
}
