import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { 
  AdaptiveTrainingService,
  AdaptiveInsights,
  PerformanceAnalysis
} from './adaptive-training.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { LogPerformanceDto, ApplyAdaptationDto } from './dto/adaptive-training.dto';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('adaptive-training')
@UseGuards(JwtAuthGuard)
export class AdaptiveTrainingController {
  constructor(
    private adaptiveTrainingService: AdaptiveTrainingService,
    private prisma: PrismaService,
  ) {}

  /**
   * Get AI insights for the current user
   */
  @Get('insights')
  async getInsights(@Request() req): Promise<AdaptiveInsights> {
    return this.adaptiveTrainingService.analyzeAndAdapt(req.user.userId);
  }

  /**
   * Get performance summary
   */
  @Get('summary')
  async getSummary(@Request() req) {
    return this.adaptiveTrainingService.getPerformanceSummary(req.user.userId);
  }

  /**
   * Analyze specific exercise
   */
  @Get('exercise/:exerciseId')
  async analyzeExercise(
    @Request() req,
    @Param('exerciseId') exerciseId: string,
  ): Promise<PerformanceAnalysis> {
    return this.adaptiveTrainingService.analyzeExercise(
      req.user.userId,
      exerciseId,
    );
  }

  /**
   * Log workout performance
   */
  @Post('log')
  async logPerformance(
    @Request() req,
    @Body() logData: LogPerformanceDto,
  ) {
    const log = await this.prisma.userPerformanceLog.create({
      data: {
        userId: req.user.userId,
        exerciseId: logData.exerciseId,
        workoutSessionId: logData.workoutSessionId,
        weightUsed: logData.weightUsed,
        repsCompleted: logData.repsCompleted,
        setsCompleted: logData.setsCompleted,
        rpe: logData.rpe,
        notes: logData.notes,
        completedAt: new Date(),
      },
    });

    return {
      message: 'Performance logged successfully',
      log,
    };
  }

  /**
   * Apply adaptation
   */
  @Post('adapt')
  async applyAdaptation(
    @Request() req,
    @Body() adaptData: ApplyAdaptationDto,
  ) {
    await this.adaptiveTrainingService.applyAdaptation(
      req.user.userId,
      adaptData.exerciseId,
      adaptData.adjustmentType,
      adaptData.reason,
      adaptData.previousValue,
      adaptData.newValue,
    );

    return {
      message: 'Adaptation applied successfully',
    };
  }
}
