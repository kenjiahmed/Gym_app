import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface PerformanceAnalysis {
  exerciseId: string;
  exerciseName: string;
  averageRPE: number;
  completionRate: number;
  volumeTrend: 'increasing' | 'stable' | 'declining';
  recommendation: {
    type: 'increase' | 'maintain' | 'decrease' | 'deload' | 'recovery';
    reason: string;
    adjustment: {
      weight?: number; // percentage change
      sets?: number;
      reps?: number;
    };
  };
}

export interface AdaptiveInsights {
  readinessScore: number; // 0-100
  weeklyVolume: number;
  consistencyScore: number; // 0-100
  performanceTrend: 'improving' | 'stable' | 'declining';
  strengthProgression: number; // percentage
  recentAdaptations: any[];
  recommendations: string[];
  fatigueWarning: boolean;
  shouldDeload: boolean;
}

@Injectable()
export class AdaptiveTrainingService {
  constructor(private prisma: PrismaService) {}

  /**
   * Main method to analyze user performance and generate adaptations
   */
  async analyzeAndAdapt(userId: string): Promise<AdaptiveInsights> {
    // Check if user has premium subscription
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { subscriptionPlan: true },
    });

    if (user.subscriptionPlan === 'free') {
      throw new ForbiddenException('Adaptive AI requires Pro or Elite subscription');
    }

    // Get recent performance logs (last 30 days)
    const recentLogs = await this.prisma.userPerformanceLog.findMany({
      where: {
        userId,
        completedAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
      include: {
        exercise: true,
      },
      orderBy: {
        completedAt: 'desc',
      },
    });

    // Get recent adaptations (last 7 days)
    const recentAdaptations = await this.prisma.adaptationLog.findMany({
      where: {
        userId,
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 5,
    });

    // Calculate metrics
    const weeklyVolume = this.calculateWeeklyVolume(recentLogs);
    const consistencyScore = this.calculateConsistencyScore(userId, recentLogs);
    const performanceTrend = this.calculatePerformanceTrend(recentLogs);
    const strengthProgression = this.calculateStrengthProgression(recentLogs);
    const readinessScore = this.calculateReadinessScore(recentLogs, consistencyScore);
    
    // Detect fatigue
    const fatigueWarning = this.detectFatigue(recentLogs);
    const shouldDeload = this.shouldDeload(recentLogs);

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      recentLogs,
      fatigueWarning,
      shouldDeload,
      performanceTrend,
      readinessScore
    );

    return {
      readinessScore,
      weeklyVolume,
      consistencyScore,
      performanceTrend,
      strengthProgression,
      recentAdaptations,
      recommendations,
      fatigueWarning,
      shouldDeload,
    };
  }

  /**
   * Analyze specific exercise performance and generate adjustment
   */
  async analyzeExercise(
    userId: string,
    exerciseId: string
  ): Promise<PerformanceAnalysis> {
    // Get last 10 performances for this exercise
    const logs = await this.prisma.userPerformanceLog.findMany({
      where: {
        userId,
        exerciseId,
      },
      include: {
        exercise: true,
      },
      orderBy: {
        completedAt: 'desc',
      },
      take: 10,
    });

    if (logs.length === 0) {
      return null;
    }

    const exerciseName = logs[0].exercise.name;

    // Calculate average RPE
    const rpeValues = logs.filter(l => l.rpe !== null).map(l => l.rpe);
    const averageRPE = rpeValues.length > 0
      ? rpeValues.reduce((a, b) => a + b, 0) / rpeValues.length
      : 0;

    // Calculate completion rate (did they complete all prescribed sets/reps?)
    const completionRate = logs.length > 0
      ? (logs.filter(l => l.setsCompleted >= 3 && l.repsCompleted >= 8).length / logs.length) * 100
      : 0;

    // Calculate volume trend
    const volumeTrend = this.calculateVolumeTrend(logs);

    // Generate recommendation based on rules
    const recommendation = this.generateExerciseRecommendation(
      averageRPE,
      completionRate,
      volumeTrend,
      logs
    );

    return {
      exerciseId,
      exerciseName,
      averageRPE,
      completionRate,
      volumeTrend,
      recommendation,
    };
  }

  /**
   * Apply adaptation to user's next workout
   */
  async applyAdaptation(
    userId: string,
    exerciseId: string,
    adjustmentType: string,
    reason: string,
    previousValue: any,
    newValue: any
  ): Promise<void> {
    await this.prisma.adaptationLog.create({
      data: {
        userId,
        exerciseId,
        adjustmentType,
        reason,
        previousValue,
        newValue,
      },
    });
  }

  /**
   * Generate exercise-specific recommendation
   */
  private generateExerciseRecommendation(
    averageRPE: number,
    completionRate: number,
    volumeTrend: 'increasing' | 'stable' | 'declining',
    logs: any[]
  ): PerformanceAnalysis['recommendation'] {
    // Rule 1: Progressive Overload
    if (averageRPE < 8 && completionRate > 90 && volumeTrend !== 'declining') {
      return {
        type: 'increase',
        reason: 'Consistent performance with low RPE. Ready to progress.',
        adjustment: {
          weight: 2.5, // 2.5% increase
        },
      };
    }

    // Rule 2: Failed reps multiple sessions
    if (completionRate < 60) {
      return {
        type: 'decrease',
        reason: 'Low completion rate. Reducing weight to focus on form.',
        adjustment: {
          weight: -10, // 10% decrease
        },
      };
    }

    // Rule 3: High RPE consistently
    if (averageRPE >= 9.5) {
      return {
        type: 'deload',
        reason: 'High RPE indicates excessive fatigue. Time for a deload.',
        adjustment: {
          weight: -15, // 15% decrease
          sets: -1,
        },
      };
    }

    // Rule 4: Declining performance
    if (volumeTrend === 'declining' && logs.length >= 3) {
      const recentThree = logs.slice(0, 3);
      const olderThree = logs.slice(3, 6);
      
      if (olderThree.length > 0) {
        const recentAvgWeight = recentThree.reduce((sum, l) => sum + (l.weightUsed || 0), 0) / recentThree.length;
        const olderAvgWeight = olderThree.reduce((sum, l) => sum + (l.weightUsed || 0), 0) / olderThree.length;
        
        if (recentAvgWeight < olderAvgWeight * 0.9) {
          return {
            type: 'recovery',
            reason: 'Performance declining. Taking a recovery week.',
            adjustment: {
              weight: -20,
              sets: -1,
            },
          };
        }
      }
    }

    // Rule 5: Optimal RPE range (8-9)
    if (averageRPE >= 8 && averageRPE <= 9 && completionRate >= 80) {
      return {
        type: 'maintain',
        reason: 'Perfect training intensity. Maintaining current load.',
        adjustment: {},
      };
    }

    // Default: maintain
    return {
      type: 'maintain',
      reason: 'Continue with current programming.',
      adjustment: {},
    };
  }

  /**
   * Calculate weekly volume (sets × reps × weight)
   */
  private calculateWeeklyVolume(logs: any[]): number {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const weekLogs = logs.filter(l => new Date(l.completedAt) >= oneWeekAgo);
    
    return weekLogs.reduce((total, log) => {
      const volume = (log.setsCompleted || 0) * (log.repsCompleted || 0) * (log.weightUsed || 0);
      return total + volume;
    }, 0);
  }

  /**
   * Calculate consistency score (0-100)
   */
  private calculateConsistencyScore(userId: string, logs: any[]): number {
    const last30Days = 30;
    const totalDays = last30Days;
    const workoutDays = new Set(logs.map(l => 
      new Date(l.completedAt).toDateString()
    )).size;

    // Ideal is 4-5 days per week = ~17-21 days per month
    const idealWorkoutDays = 18;
    const score = Math.min((workoutDays / idealWorkoutDays) * 100, 100);
    
    return Math.round(score);
  }

  /**
   * Calculate performance trend
   */
  private calculatePerformanceTrend(logs: any[]): 'improving' | 'stable' | 'declining' {
    if (logs.length < 6) return 'stable';

    const recentHalf = logs.slice(0, Math.floor(logs.length / 2));
    const olderHalf = logs.slice(Math.floor(logs.length / 2));

    const recentAvgVolume = recentHalf.reduce((sum, l) => 
      sum + (l.setsCompleted * l.repsCompleted * (l.weightUsed || 1)), 0
    ) / recentHalf.length;

    const olderAvgVolume = olderHalf.reduce((sum, l) => 
      sum + (l.setsCompleted * l.repsCompleted * (l.weightUsed || 1)), 0
    ) / olderHalf.length;

    if (recentAvgVolume > olderAvgVolume * 1.1) return 'improving';
    if (recentAvgVolume < olderAvgVolume * 0.9) return 'declining';
    return 'stable';
  }

  /**
   * Calculate strength progression percentage
   */
  private calculateStrengthProgression(logs: any[]): number {
    if (logs.length < 2) return 0;

    const recent = logs.slice(0, 5);
    const older = logs.slice(-5);

    const recentAvgWeight = recent.reduce((sum, l) => sum + (l.weightUsed || 0), 0) / recent.length;
    const olderAvgWeight = older.reduce((sum, l) => sum + (l.weightUsed || 0), 0) / older.length;

    if (olderAvgWeight === 0) return 0;

    const progression = ((recentAvgWeight - olderAvgWeight) / olderAvgWeight) * 100;
    return Math.round(progression * 10) / 10; // Round to 1 decimal
  }

  /**
   * Calculate readiness score
   */
  private calculateReadinessScore(logs: any[], consistencyScore: number): number {
    if (logs.length === 0) return 50;

    // Recent performance quality
    const recentLogs = logs.slice(0, 5);
    const avgRPE = recentLogs
      .filter(l => l.rpe !== null)
      .reduce((sum, l) => sum + l.rpe, 0) / recentLogs.filter(l => l.rpe !== null).length;

    // Lower RPE = better readiness
    const rpeScore = avgRPE > 0 ? Math.max(0, 100 - (avgRPE - 5) * 20) : 70;

    // Combine with consistency
    const readiness = (rpeScore * 0.6) + (consistencyScore * 0.4);

    return Math.round(readiness);
  }

  /**
   * Detect fatigue from performance data
   */
  private detectFatigue(logs: any[]): boolean {
    if (logs.length < 6) return false;

    const recent = logs.slice(0, 3);
    const rpeValues = recent.filter(l => l.rpe !== null);

    // High RPE in recent sessions
    if (rpeValues.length >= 2 && rpeValues.every(l => l.rpe >= 9)) {
      return true;
    }

    // Declining volume
    const volumeTrend = this.calculateVolumeTrend(logs);
    if (volumeTrend === 'declining') {
      return true;
    }

    return false;
  }

  /**
   * Determine if deload is needed
   */
  private shouldDeload(logs: any[]): boolean {
    if (logs.length < 6) return false;

    // Check for 3+ sessions with RPE = 10
    const recent = logs.slice(0, 6);
    const highRPECount = recent.filter(l => l.rpe >= 10).length;

    if (highRPECount >= 3) return true;

    // Check for declining performance over 3+ sessions
    const volumeTrend = this.calculateVolumeTrend(logs);
    if (volumeTrend === 'declining' && logs.length >= 9) {
      const recentThree = logs.slice(0, 3);
      const middleThree = logs.slice(3, 6);
      const olderThree = logs.slice(6, 9);

      const recentAvg = recentThree.reduce((sum, l) => sum + (l.weightUsed || 0), 0) / 3;
      const middleAvg = middleThree.reduce((sum, l) => sum + (l.weightUsed || 0), 0) / 3;
      const olderAvg = olderThree.reduce((sum, l) => sum + (l.weightUsed || 0), 0) / 3;

      if (recentAvg < middleAvg && middleAvg < olderAvg) {
        return true;
      }
    }

    return false;
  }

  /**
   * Calculate volume trend for exercise
   */
  private calculateVolumeTrend(logs: any[]): 'increasing' | 'stable' | 'declining' {
    if (logs.length < 4) return 'stable';

    const volumes = logs.map(l => 
      l.setsCompleted * l.repsCompleted * (l.weightUsed || 1)
    );

    const recentHalf = volumes.slice(0, Math.floor(volumes.length / 2));
    const olderHalf = volumes.slice(Math.floor(volumes.length / 2));

    const recentAvg = recentHalf.reduce((a, b) => a + b, 0) / recentHalf.length;
    const olderAvg = olderHalf.reduce((a, b) => a + b, 0) / olderHalf.length;

    if (recentAvg > olderAvg * 1.1) return 'increasing';
    if (recentAvg < olderAvg * 0.9) return 'declining';
    return 'stable';
  }

  /**
   * Generate personalized recommendations
   */
  private generateRecommendations(
    logs: any[],
    fatigueWarning: boolean,
    shouldDeload: boolean,
    performanceTrend: string,
    readinessScore: number
  ): string[] {
    const recommendations: string[] = [];

    if (shouldDeload) {
      recommendations.push('🔄 Deload week recommended. Reduce weight by 20% and focus on recovery.');
    } else if (fatigueWarning) {
      recommendations.push('⚠️ Fatigue detected. Consider taking an extra rest day this week.');
    }

    if (performanceTrend === 'improving') {
      recommendations.push('📈 Great progress! Your strength is increasing consistently.');
    } else if (performanceTrend === 'declining') {
      recommendations.push('📉 Performance trending down. Check sleep, nutrition, and stress levels.');
    }

    if (readinessScore >= 80) {
      recommendations.push('💪 High readiness! Perfect time to push intensity.');
    } else if (readinessScore < 50) {
      recommendations.push('😴 Low readiness. Focus on recovery and lighter sessions.');
    }

    if (logs.length < 10) {
      recommendations.push('📊 Keep logging workouts for better AI insights.');
    }

    const daysWithLogs = new Set(logs.map(l => new Date(l.completedAt).toDateString())).size;
    if (daysWithLogs < 8) {
      recommendations.push('🎯 Aim for 3-4 workouts per week for optimal progress.');
    }

    return recommendations;
  }

  /**
   * Get performance summary for dashboard
   */
  async getPerformanceSummary(userId: string) {
    const logs = await this.prisma.userPerformanceLog.findMany({
      where: {
        userId,
        completedAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
      include: {
        exercise: true,
      },
      orderBy: {
        completedAt: 'desc',
      },
    });

    const totalSets = logs.reduce((sum, l) => sum + l.setsCompleted, 0);
    const totalReps = logs.reduce((sum, l) => sum + l.repsCompleted, 0);
    const avgRPE = logs.filter(l => l.rpe !== null).length > 0
      ? logs.filter(l => l.rpe !== null).reduce((sum, l) => sum + l.rpe, 0) / logs.filter(l => l.rpe !== null).length
      : 0;

    return {
      totalWorkouts: new Set(logs.map(l => new Date(l.completedAt).toDateString())).size,
      totalSets,
      totalReps,
      averageRPE: Math.round(avgRPE * 10) / 10,
      recentLogs: logs.slice(0, 10),
    };
  }
}
