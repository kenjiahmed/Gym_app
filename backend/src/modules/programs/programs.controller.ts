import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ProgramsService } from './programs.service';
import { CreateProgramDto, UpdateProgramDto, EnrollInProgramDto, UpdateProgressDto, ProgramFiltersDto } from './dto/program.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('programs')
export class ProgramsController {
  constructor(private readonly programsService: ProgramsService) {}

  // Public endpoints
  @Get()
  findAll(@Query() filters: ProgramFiltersDto) {
    return this.programsService.findAll(filters);
  }

  @Get('featured')
  findFeatured() {
    return this.programsService.findFeatured();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.programsService.findOne(id);
  }

  // Protected endpoints (require authentication)
  @UseGuards(JwtAuthGuard)
  @Post('enroll')
  enrollUser(@Request() req, @Body() enrollDto: EnrollInProgramDto) {
    return this.programsService.enrollUser(req.user.sub, enrollDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('enrollments/my')
  getUserEnrollments(@Request() req) {
    return this.programsService.getUserEnrollments(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Get('enrollments/:programId')
  getEnrollmentDetails(@Request() req, @Param('programId') programId: string) {
    return this.programsService.getEnrollmentDetails(req.user.sub, programId);
  }

  @UseGuards(JwtAuthGuard)
  @Put('enrollments/:programId/progress')
  markWorkoutComplete(
    @Request() req,
    @Param('programId') programId: string,
    @Body() updateProgressDto: UpdateProgressDto,
  ) {
    return this.programsService.markWorkoutComplete(req.user.sub, programId, updateProgressDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('enrollments/:programId')
  dropProgram(@Request() req, @Param('programId') programId: string) {
    return this.programsService.dropProgram(req.user.sub, programId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('today/workout')
  getTodaysWorkout(@Request() req) {
    return this.programsService.getTodaysWorkout(req.user.sub);
  }

  // Admin endpoints
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createProgramDto: CreateProgramDto) {
    return this.programsService.create(createProgramDto);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(@Param('id') id: string, @Body() updateProgramDto: UpdateProgramDto) {
    return this.programsService.update(id, updateProgramDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.programsService.remove(id);
  }
}
