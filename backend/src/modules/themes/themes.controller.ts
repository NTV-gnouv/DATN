import { Body, Controller, Get, Param, Patch, Post, Delete } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

import { Roles } from '@/shared/decorators/roles.decorator';
import { Public } from '@/shared/decorators/public.decorator';

import { ThemesService } from './themes.service';
import { CreateThemeDto, UpdateThemeDto, GenerateThemeDto } from './dto/theme.dto';

@ApiTags('Themes')
@ApiBearerAuth()
@Controller('themes')
export class ThemesController {
  constructor(private readonly themesService: ThemesService) {}

  @Get()
  @ApiOperation({ summary: 'List themes', description: 'Return all themes available in the system.' })
  list() {
    return this.themesService.list();
  }

  @Get('defaults/id')
  @Public()
  @ApiOperation({ summary: 'Get default theme ID', description: 'Return the default theme ID used when creating a landing page.' })
  getDefaultId() {
    return this.themesService.getDefaultId();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get theme', description: 'Return a theme by its ID.' })
  get(@Param('id') id: string) {
    return this.themesService.get(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create theme', description: 'Create a new theme definition.' })
  @ApiBody({ description: 'Theme payload' })
  create(@Body() body: Record<string, unknown>) {
    return this.themesService.create(body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update theme', description: 'Update a theme by its ID.' })
  @ApiBody({ description: 'Theme update payload' })
  update(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.themesService.update(id, body);
  }

  @Post('admin/rescan')
  @Roles('admin')
  @ApiOperation({ summary: 'Rescan themes', description: 'Admin endpoint to rescan the themes directory and reload manifests.' })
  rescan() {
    return this.themesService.rescan();
  }

  @Post('admin/:id/enable')
  @Roles('admin')
  @ApiOperation({ summary: 'Enable theme', description: 'Admin endpoint to enable a theme.' })
  enable(@Param('id') id: string) {
    return this.themesService.enable(id);
  }

  @Post('admin/:id/disable')
  @Roles('admin')
  @ApiOperation({ summary: 'Disable theme', description: 'Admin endpoint to disable a theme.' })
  disable(@Param('id') id: string) {
    return this.themesService.disable(id);
  }

  @Post('admin/:id/remove')
  @Roles('admin')
  @ApiOperation({ summary: 'Remove theme', description: 'Admin endpoint to remove a theme.' })
  remove(@Param('id') id: string) {
    return this.themesService.remove(id);
  }

  // Custom theme endpoints
  @Post('generate')
  @ApiOperation({ summary: 'Generate theme from profile', description: 'Generate a theme configuration based on user profile data.' })
  async generateTheme(@Body() generateThemeDto: GenerateThemeDto) {
    return await this.themesService.generateThemeFromProfile(generateThemeDto);
  }

  @Post('custom/create')
  @ApiOperation({ summary: 'Create custom theme', description: 'Create and save a custom theme for a page.' })
  async createCustomTheme(
    @Body() body: { pageId: string } & CreateThemeDto,
  ) {
    const themeConfig = await this.themesService.generateThemeFromProfile({
      username: body.username,
      displayName: body.displayName,
      description: body.description_text,
      industry: body.industry,
      socialLinks: body.socialLinks,
      tone: body.tone,
      preferredStyle: body.preferredStyle,
    });

    return await this.themesService.saveTheme(body.pageId, {
      ...themeConfig.suggestedTheme,
      id: `custom-theme-${Date.now()}`,
      pageId: body.pageId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  @Get('custom/:id/details')
  @ApiOperation({ summary: 'Get custom theme', description: 'Get detailed information about a custom theme.' })
  async getCustomTheme(@Param('id') id: string) {
    const theme = await this.themesService.getTheme(id);
    if (!theme) {
      return { error: 'Theme not found' };
    }
    return theme;
  }

  @Get('custom/page/:pageId')
  @ApiOperation({ summary: 'List page themes', description: 'List all custom themes for a specific page.' })
  async listThemesForPage(@Param('pageId') pageId: string) {
    return await this.themesService.listThemesForPage(pageId);
  }

  @Patch('custom/:id')
  @ApiOperation({ summary: 'Update custom theme', description: 'Update a custom theme configuration.' })
  async updateCustomTheme(
    @Param('id') id: string,
    @Body() updateThemeDto: UpdateThemeDto,
  ) {
    return await this.themesService.updateTheme(id, updateThemeDto as unknown as Partial<any>);
  }

  @Delete('custom/:id')
  @ApiOperation({ summary: 'Delete custom theme', description: 'Delete a custom theme.' })
  async deleteCustomTheme(@Param('id') id: string) {
    const deleted = await this.themesService.deleteTheme(id);
    return { deleted, id };
  }

  @Get('custom/:id/css')
  @Public()
  @ApiOperation({ summary: 'Get theme CSS', description: 'Generate and return CSS for a theme.' })
  async getThemeCSS(@Param('id') id: string) {
    const theme = await this.themesService.getTheme(id);
    if (!theme) {
      return { error: 'Theme not found' };
    }
    const css = this.themesService.generateThemeCSS(theme);
    return { css };
  }
}
