import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { ThemesController } from './themes.controller';
import { ThemesRepository } from './themes.repository';
import { ThemeLoaderService } from './runtime/theme-loader.service';
import { ThemesService } from './themes.service';
import { ThemeCustomizerService } from './theme-customizer.service';

@Module({
  imports: [ConfigModule],
  controllers: [ThemesController],
  providers: [ThemesService, ThemesRepository, ThemeLoaderService, ThemeCustomizerService],
  exports: [ThemesService, ThemeLoaderService, ThemeCustomizerService],
})
export class ThemesModule {}
