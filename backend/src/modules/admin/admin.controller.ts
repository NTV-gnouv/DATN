import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

import { AdminService } from './admin.service';

@ApiTags('Admin')
@ApiBearerAuth()
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
  @ApiOperation({ summary: 'List admin records', description: 'Return admin dashboard records or system snapshots.' })
  list() {
    return this.adminService.list();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get admin record', description: 'Return a specific admin resource by ID.' })
  get(@Param('id') id: string) {
    return this.adminService.get(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create admin record', description: 'Create a new admin dashboard resource.' })
  @ApiBody({ description: 'Admin create payload' })
  create(@Body() body: Record<string, unknown>) {
    return this.adminService.create(body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update admin record', description: 'Update an admin dashboard resource.' })
  @ApiBody({ description: 'Admin update payload' })
  update(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.adminService.update(id, body);
  }
}
