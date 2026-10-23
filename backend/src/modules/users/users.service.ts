import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });
  }

  async updateProfile(userId: string, data: { name?: string; fitnessGoal?: string }) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
      select: { id: true, email: true, name: true, fitnessGoal: true },
    });
  }

  async getStats(userId: string) {
    const totalSessions = await this.prisma.workoutSession.count({
      where: { userId, completed: true },
    });

    const weeklyWorkouts = await this.prisma.workoutSession.count({
      where: {
        userId,
        completed: true,
        startTime: {
          gte: new Date(new Date().setDate(new Date().getDate() - 7)),
        },
      },
    });

    const lastWorkout = await this.prisma.workoutSession.findFirst({
      where: { userId, completed: true },
      orderBy: { startTime: 'desc' },
      include: {
        workoutPlan: true,
        completedSets: true,
      },
    });

    return {
      totalSessions,
      weeklyWorkouts,
      lastWorkout,
    };
  }
}
