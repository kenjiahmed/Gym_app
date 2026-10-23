import { IsString, IsInt, IsBoolean, IsArray, IsOptional, IsEnum, IsObject } from 'class-validator';

export class CreateProgramDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  level: string;

  @IsString()
  goal: string;

  @IsInt()
  durationWeeks: number;

  @IsOptional()
  @IsString()
  coverImage?: string;

  @IsBoolean()
  @IsOptional()
  isPremium?: boolean;

  @IsString()
  @IsOptional()
  category?: string;

  @IsArray()
  @IsOptional()
  muscleGroups?: string[];

  @IsArray()
  @IsOptional()
  equipment?: string[];

  @IsBoolean()
  @IsOptional()
  featured?: boolean;
}

export class UpdateProgramDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  level?: string;

  @IsOptional()
  @IsString()
  goal?: string;

  @IsOptional()
  @IsInt()
  durationWeeks?: number;

  @IsOptional()
  @IsString()
  coverImage?: string;

  @IsOptional()
  @IsBoolean()
  isPremium?: boolean;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsArray()
  muscleGroups?: string[];

  @IsOptional()
  @IsArray()
  equipment?: string[];

  @IsOptional()
  @IsBoolean()
  featured?: boolean;
}

export class EnrollInProgramDto {
  @IsString()
  programId: string;
}

export class UpdateProgressDto {
  @IsInt()
  weekNumber: number;

  @IsInt()
  dayNumber: number;

  @IsBoolean()
  completed: boolean;
}

export class ProgramFiltersDto {
  @IsOptional()
  @IsString()
  goal?: string;

  @IsOptional()
  @IsString()
  level?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsInt()
  maxWeeks?: number;

  @IsOptional()
  @IsBoolean()
  featured?: boolean;
}
