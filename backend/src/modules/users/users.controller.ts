import { Body, Controller, Delete, Get, Param, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '@/shared/decorators/current-user.decorator';

import { UsersService } from './users.service';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile', description: 'Return the authenticated user profile.' })
  getMe(@CurrentUser() user: { sub?: string } | null) {
    return this.usersService.getMe(user?.sub ?? 'current-user');
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update current user profile', description: 'Update profile data for the authenticated user.' })
  @ApiBody({ description: 'Profile update payload' })
  updateMe(@Body() body: Record<string, unknown>) {
    return this.usersService.updateMe(body);
  }

  @Delete('me')
  @ApiOperation({ summary: 'Delete current user profile', description: 'Soft delete the authenticated user account.' })
  deleteMe() {
    return this.usersService.deleteMe();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID', description: 'Return the profile for a specific user ID.' })
  getById(@Param('id') id: string) {
    return this.usersService.getById(id);
  }

  @Get()
  @ApiOperation({ summary: 'List users', description: 'Return all users currently stored in the system.' })
  getAll() {
    return this.usersService.getAll();
  }
}
