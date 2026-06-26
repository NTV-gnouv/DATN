import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '@/shared/decorators/current-user.decorator';
import { Public } from '@/shared/decorators/public.decorator';

import { CreatePageDto } from './dto/create-page.dto';
import { PagesService } from './pages.service';

type AuthUserPayload = {
  sub: string;
};

@ApiTags('Pages')
@ApiBearerAuth()
@Controller('pages')
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get my page', description: 'Return the landing page owned by the authenticated user.' })
  getMyPage(@CurrentUser() user: AuthUserPayload) {
    return this.pagesService.getMyPage(user.sub);
  }

  @Get('suggest-domain')
  @ApiOperation({
    summary: 'Suggest unique domain',
    description: 'Suggest a unique slug/username for a new account page.',
  })
  suggestDomain(@CurrentUser() user: AuthUserPayload, @Query('base') base?: string) {
    return this.pagesService.suggestDomain(user.sub, base);
  }

  @Post()
  @ApiOperation({ summary: 'Create page', description: 'Create a new landing page for the authenticated tenant/user.' })
  @ApiBody({ description: 'Page creation payload' })
  create(@Body() body: CreatePageDto, @CurrentUser() user: AuthUserPayload) {
    return this.pagesService.create({
      ...(body as unknown as Record<string, unknown>),
      ownerId: user.sub,
    });
  }

  @Post('template')
  @ApiOperation({ summary: 'Create template page', description: 'Create a starter landing page template with default blocks.' })
  @ApiBody({ description: 'Starter page template payload' })
  createTemplate(@Body() body: CreatePageDto, @CurrentUser() user: AuthUserPayload) {
    return this.pagesService.createTemplate({
      ...(body as unknown as Record<string, unknown>),
      ownerId: user.sub,
    });
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
  @ApiOperation({ summary: 'List pages', description: 'Return pages owned by the authenticated user.' })
  list(@CurrentUser() user: AuthUserPayload) {
    return this.pagesService.listForOwner(user.sub);
  }

  @Get(':id/editor-config')
  @ApiOperation({ summary: 'Get page editor config', description: 'Return editor configuration (theme + header block) for a page.' })
  getEditorConfig(@Param('id') id: string, @CurrentUser() user: AuthUserPayload) {
    return this.pagesService.getEditorConfig(id, user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get page', description: 'Return a landing page by its ID if owned by the current user.' })
  get(@Param('id') id: string, @CurrentUser() user: AuthUserPayload) {
    return this.pagesService.getOwned(id, user.sub);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update page', description: 'Update page metadata and settings.' })
  @ApiBody({ description: 'Page update payload' })
  update(@Param('id') id: string, @Body() body: Record<string, unknown>, @CurrentUser() user: AuthUserPayload) {
    return this.pagesService.update(id, body, user.sub);
  }

  @Patch(':id/slug')
  @ApiOperation({ summary: 'Update page slug', description: 'Persist a page slug directly to the database.' })
  @ApiBody({ description: 'Slug payload' })
  updateSlug(@Param('id') id: string, @Body() body: { slug?: string }, @CurrentUser() user: AuthUserPayload) {
    return this.pagesService.updateSlug(id, String(body.slug ?? ''), user.sub);
  }

  @Patch('user/:username/slug')
  @ApiOperation({ summary: 'Update slug by username', description: 'Persist landing page slug for the authenticated owner.' })
  @ApiBody({ description: 'Slug payload' })
  updateSlugByUsername(
    @Param('username') username: string,
    @Body() body: { slug?: string },
    @CurrentUser() user: AuthUserPayload,
  ) {
    return this.pagesService.updateSlugByUsername(username, String(body.slug ?? ''), user.sub);
  }

  @Patch(':id/editor-config')
  @ApiOperation({ summary: 'Update page editor config', description: 'Persist theme ID and header block configuration for a page.' })
  @ApiBody({ description: 'Editor configuration payload' })
  updateEditorConfig(@Param('id') id: string, @Body() body: Record<string, unknown>, @CurrentUser() user: AuthUserPayload) {
    return this.pagesService.updateEditorConfig(id, body, user.sub);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete page', description: 'Remove a page from the system.' })
  remove(@Param('id') id: string, @CurrentUser() user: AuthUserPayload) {
    return this.pagesService.remove(id, user.sub);
  }
}
