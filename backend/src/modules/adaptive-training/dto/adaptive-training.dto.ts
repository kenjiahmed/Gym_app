import { IsString, IsNumber, IsOptional, Min, Max } from 'class-validator';

export class LogPerformanceDto {
  @IsString()
  exerciseId: string;

  @IsString()
  @IsOptional()
  workoutSessionId?: string;

  @IsNumber()
  @Min(0)
  weightUsed: number;

  @IsNumber()
  @Min(0)
  repsCompleted: number;

  @IsNumber()
  @Min(0)
  setsCompleted: number;

  @IsNumber()
  @Min(1)
  @Max(10)
  @IsOptional()
  rpe?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class ApplyAdaptationDto {
  @IsString()
  exerciseId: string;

  @IsString()
  @IsOptional()
  programId?: string;

  @IsString()
  adjustmentType: string;

  @IsString()
  reason: string;

  previousValue: any;

  newValue: any;
}
