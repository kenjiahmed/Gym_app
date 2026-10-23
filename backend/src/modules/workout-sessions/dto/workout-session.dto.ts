import {
  IsUUID,
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
  IsInt,
  IsNumber,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class StartWorkoutSessionDto {
  @IsUUID()
  workoutPlanId: string;
}

class CompletedSetDto {
  @IsUUID()
  exerciseId: string;

  @IsInt()
  @Min(1)
  setNumber: number;

  @IsInt()
  @Min(1)
  reps: number;

  @IsNumber()
  @IsOptional()
  weight?: number;
}

export class CompleteWorkoutSessionDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CompletedSetDto)
  completedSets: CompletedSetDto[];

  @IsString()
  @IsOptional()
  notes?: string;
}
