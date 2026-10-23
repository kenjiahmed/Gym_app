import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { WorkoutPlansService } from './workout-plans.service';
import {
  CreateWorkoutPlanDto,
  UpdateWorkoutPlanDto,
} from './dto/workout-plan.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('workout-plans')
@UseGuards(JwtAuthGuard)
export class WorkoutPlansController {
  constructor(private workoutPlansService: WorkoutPlansService) {}

  @Post()
  create(
    @CurrentUser() user: any,
    @Body() createWorkoutPlanDto: CreateWorkoutPlanDto,
  ) {
    return this.workoutPlansService.create(user.id, createWorkoutPlanDto);
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.workoutPlansService.findAll(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.workoutPlansService.findOne(id, user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() updateWorkoutPlanDto: UpdateWorkoutPlanDto,
  ) {
    return this.workoutPlansService.update(id, user.id, updateWorkoutPlanDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.workoutPlansService.remove(id, user.id);
  }
}
