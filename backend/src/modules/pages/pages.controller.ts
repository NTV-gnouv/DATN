import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CreatePageDto } from './dto/create-page.dto';
import { PagesService } from './pages.service';
import { Public } from '@/shared/decorators/public.decorator';

@ApiTags('Pages')
@ApiBearerAuth()
@Controller('pages')
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Post()
  @ApiOperation({ summary: 'Create page', description: 'Create a new landing page for the authenticated tenant/user.' })
  @ApiBody({ description: 'Page creation payload' })
  create(@Body() body: CreatePageDto) {
    return this.pagesService.create(body as unknown as Record<string, unknown>);
  }

  @Post('template')
  @ApiOperation({ summary: 'Create template page', description: 'Create a starter landing page template with default blocks.' })
  @ApiBody({ description: 'Starter page template payload' })
  createTemplate(@Body() body: CreatePageDto) {
    return this.pagesService.createTemplate(body as unknown as Record<string, unknown>);
  }

  @Public()
  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get page by slug', description: 'Return a public landing page by slug.' })
  getBySlug(@Param('slug') slug: string) {
    return this.pagesService.getBySlug(slug);
  }

  @Public()
  @Get('user/:username')
  @ApiOperation({ summary: 'Get page by username', description: 'Return the public landing page linked to a creator account.' })
  getByUsername(@Param('username') username: string) {
    return this.pagesService.getByUsername(username);
  }

  @Public()
  @Get('slug/:slug/available')
  @ApiOperation({ summary: 'Check slug availability', description: 'Return whether a slug is available before page creation.' })
  checkSlug(@Param('slug') slug: string, @Query('excludeId') excludeId?: string) {
    return this.pagesService.checkSlug(slug, excludeId);
  }

  @Get()
  @ApiOperation({ summary: 'List pages', description: 'Return all pages available in the current scope.' })
  list() {
    return this.pagesService.list();
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get page', description: 'Return a landing page by its ID.' })
  get(@Param('id') id: string) {
    return this.pagesService.get(id);
  }

  @Get(':id/editor-config')
  @Public()
  @ApiOperation({ summary: 'Get page editor config', description: 'Return editor configuration (theme + header block) for a page.' })
  getEditorConfig(@Param('id') id: string) {
    return this.pagesService.getEditorConfig(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update page', description: 'Update page metadata and settings.' })
  @ApiBody({ description: 'Page update payload' })
  update(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.pagesService.update(id, body);
  }

  @Patch(':id/slug')
  @Public()
  @ApiOperation({ summary: 'Update page slug', description: 'Persist a page slug directly to the database.' })
  @ApiBody({ description: 'Slug payload' })
  updateSlug(@Param('id') id: string, @Body() body: { slug?: string }) {
    return this.pagesService.updateSlug(id, String(body.slug ?? ''));
  }

  @Patch('user/:username/slug')
  @Public()
  @ApiOperation({ summary: 'Update slug by username', description: 'Persist landing page slug for a specific account username.' })
  @ApiBody({ description: 'Slug payload' })
  updateSlugByUsername(@Param('username') username: string, @Body() body: { slug?: string }) {
    return this.pagesService.updateSlugByUsername(username, String(body.slug ?? ''));
  }

  @Patch(':id/editor-config')
  @Public()
  @ApiOperation({ summary: 'Update page editor config', description: 'Persist theme ID and header block configuration for a page.' })
  @ApiBody({ description: 'Editor configuration payload' })
  updateEditorConfig(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.pagesService.updateEditorConfig(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete page', description: 'Remove a page from the system.' })
  remove(@Param('id') id: string) {
    return this.pagesService.remove(id);
  }

}
