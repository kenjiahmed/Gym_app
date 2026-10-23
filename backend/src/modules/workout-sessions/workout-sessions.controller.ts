import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { WorkoutSessionsService } from './workout-sessions.service';
import {
  StartWorkoutSessionDto,
  CompleteWorkoutSessionDto,
} from './dto/workout-session.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('workout-sessions')
@UseGuards(JwtAuthGuard)
export class WorkoutSessionsController {
  constructor(private workoutSessionsService: WorkoutSessionsService) {}

  @Post('start')
  startSession(
    @CurrentUser() user: any,
    @Body() startWorkoutDto: StartWorkoutSessionDto,
  ) {
    return this.workoutSessionsService.startSession(user.id, startWorkoutDto);
  }

  @Patch(':id/complete')
  completeSession(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() completeWorkoutDto: CompleteWorkoutSessionDto,
  ) {
    return this.workoutSessionsService.completeSession(
      id,
      user.id,
      completeWorkoutDto,
    );
  }

  @Get('active')
  getActiveSession(@CurrentUser() user: any) {
    return this.workoutSessionsService.getActiveSession(user.id);
  }

  @Get('history')
  getHistory(@CurrentUser() user: any) {
    return this.workoutSessionsService.getHistory(user.id);
  }

  @Get(':id')
  getSessionById(@Param('id') id: string, @CurrentUser() user: any) {
    return this.workoutSessionsService.getSessionById(id, user.id);
  }

  @Delete(':id')
  cancelSession(@Param('id') id: string, @CurrentUser() user: any) {
    return this.workoutSessionsService.cancelSession(id, user.id);
  }
}
