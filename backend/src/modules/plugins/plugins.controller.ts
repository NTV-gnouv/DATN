import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

import { Roles } from '@/shared/decorators/roles.decorator';

import { PluginsService } from './plugins.service';

@ApiTags('Plugins')
@ApiBearerAuth()
@Controller('plugins')
export class PluginsController {
  constructor(private readonly pluginsService: PluginsService) {}

  @Get()
  @ApiOperation({ summary: 'List plugins', description: 'Return all installed plugins.' })
  list() {
    return this.pluginsService.list();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get plugin', description: 'Return a plugin by its ID.' })
  get(@Param('id') id: string) {
    return this.pluginsService.get(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create plugin', description: 'Create a plugin record or register a plugin definition.' })
  @ApiBody({ description: 'Plugin payload' })
  create(@Body() body: Record<string, unknown>) {
    return this.pluginsService.create(body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update plugin', description: 'Update plugin metadata or activation state.' })
  @ApiBody({ description: 'Plugin update payload' })
  update(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.pluginsService.update(id, body);
  }

  @Post('admin/rescan')
  @Roles('admin')
  @ApiOperation({ summary: 'Rescan plugins', description: 'Admin endpoint to scan plugin manifests and reload registry.' })
  rescan() {
    return this.pluginsService.rescan();
  }

  @Post('admin/:id/enable')
  @Roles('admin')
  @ApiOperation({ summary: 'Enable plugin', description: 'Admin endpoint to enable a plugin.' })
  enable(@Param('id') id: string) {
    return this.pluginsService.enable(id);
  }

  @Post('admin/:id/disable')
  @Roles('admin')
  @ApiOperation({ summary: 'Disable plugin', description: 'Admin endpoint to disable a plugin.' })
  disable(@Param('id') id: string) {
    return this.pluginsService.disable(id);
  }

  @Post('admin/:id/remove')
  @Roles('admin')
  @ApiOperation({ summary: 'Remove plugin', description: 'Admin endpoint to remove a plugin.' })
  remove(@Param('id') id: string) {
    return this.pluginsService.remove(id);
  }
}
