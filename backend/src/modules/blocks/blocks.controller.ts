import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

import { Public } from '@/shared/decorators/public.decorator';
import { BlocksService } from './blocks.service';

@ApiTags('Blocks')
@ApiBearerAuth()
@Controller('blocks')
export class BlocksController {
  constructor(private readonly blocksService: BlocksService) {}

  @Get()
  @ApiOperation({ summary: 'List blocks', description: 'Return all blocks currently registered in the system.' })
  list() {
    return this.blocksService.list();
  }

  @Get('defaults/id')
  @Public()
  @ApiOperation({ summary: 'Get default block ID', description: 'Return the default block ID used when creating a landing page.' })
  getDefaultId() {
    return this.blocksService.getDefaultId();
  }

  @Get('defaults/header')
  @Public()
  @ApiOperation({ summary: 'Get default header block', description: 'Return full default header block payload for landing page editor bootstrap.' })
  getDefaultHeaderBlock() {
    return this.blocksService.getDefaultHeaderBlock();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get block', description: 'Return a block by its ID.' })
  get(@Param('id') id: string) {
    return this.blocksService.get(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create block', description: 'Create a new block definition or instance.' })
  @ApiBody({ description: 'Block payload' })
  create(@Body() body: Record<string, unknown>) {
    return this.blocksService.create(body);
  }

  @Post('import')
  @ApiOperation({ summary: 'Import block definition', description: 'Import a block definition payload (for plugin-like workflow).' })
  @ApiBody({ description: 'Imported block JSON payload' })
  importDefinition(@Body() body: Record<string, unknown>) {
    return this.blocksService.importDefinition(body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update block', description: 'Update a block by its ID.' })
  @ApiBody({ description: 'Block update payload' })
  update(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.blocksService.update(id, body);
  }
}
