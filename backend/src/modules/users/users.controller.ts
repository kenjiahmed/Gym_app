import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('stats')
  async getStats(@CurrentUser() user: any) {
    return this.usersService.getStats(user.id);
  }

  @Patch('profile')
  async updateProfile(@CurrentUser() user: any, @Body() data: UpdateProfileDto) {
    return this.usersService.updateProfile(user.id, data);
  }
}
