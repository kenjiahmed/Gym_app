import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ExercisesService } from './exercises.service';
import { CreateExerciseDto, UpdateExerciseDto } from './dto/exercise.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('exercises')
@UseGuards(JwtAuthGuard)
export class ExercisesController {
  constructor(private exercisesService: ExercisesService) {}

  @Post()
  create(@Body() createExerciseDto: CreateExerciseDto) {
    return this.exercisesService.create(createExerciseDto);
  }

  @Get()
  findAll(
    @Query('muscleGroup') muscleGroup?: string,
    @Query('category') category?: string,
    @Query('muscleFocus') muscleFocus?: string,
    @Query('equipmentType') equipmentType?: string,
  ) {
    if (muscleGroup) {
      return this.exercisesService.findByMuscleGroup(muscleGroup);
    }
    if (category) {
      return this.exercisesService.findByCategory(category);
    }
    if (muscleFocus) {
      return this.exercisesService.findByMuscleFocus(muscleFocus);
    }
    if (equipmentType) {
      return this.exercisesService.findByEquipment(equipmentType);
    }
    return this.exercisesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.exercisesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateExerciseDto: UpdateExerciseDto) {
    return this.exercisesService.update(id, updateExerciseDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.exercisesService.remove(id);
  }
}
