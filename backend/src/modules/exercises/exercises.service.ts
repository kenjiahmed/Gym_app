import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateExerciseDto, UpdateExerciseDto } from './dto/exercise.dto';

@Injectable()
export class ExercisesService {
  constructor(private prisma: PrismaService) {}

  async create(createExerciseDto: CreateExerciseDto) {
    return this.prisma.exercise.create({
      data: createExerciseDto,
    });
  }

  async findAll() {
    return this.prisma.exercise.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findByMuscleGroup(muscleGroup: string) {
    return this.prisma.exercise.findMany({
      where: { muscleGroup },
      orderBy: { name: 'asc' },
    });
  }

  async findByCategory(category: string) {
    return this.prisma.exercise.findMany({
      where: { category },
      orderBy: { name: 'asc' },
    });
  }

  async findByMuscleFocus(muscleFocus: string) {
    return this.prisma.exercise.findMany({
      where: { muscleFocus },
      orderBy: { name: 'asc' },
    });
  }

  async findByEquipment(equipmentType: string) {
    return this.prisma.exercise.findMany({
      where: { equipmentType },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const exercise = await this.prisma.exercise.findUnique({
      where: { id },
    });

    if (!exercise) {
      throw new NotFoundException('Exercise not found');
    }

    return exercise;
  }

  async update(id: string, updateExerciseDto: UpdateExerciseDto) {
    await this.findOne(id);

    return this.prisma.exercise.update({
      where: { id },
      data: updateExerciseDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.exercise.delete({
      where: { id },
    });
  }
}
