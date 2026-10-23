import { IsString, IsOptional } from 'class-validator';

export class CreateExerciseDto {
  @IsString()
  name: string;

  @IsString()
  muscleGroup: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateExerciseDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  muscleGroup?: string;

  @IsString()
  @IsOptional()
  description?: string;
}
