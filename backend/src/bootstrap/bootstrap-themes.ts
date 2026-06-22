import { INestApplication, Logger } from '@nestjs/common';

import { ThemesService } from '@/modules/themes/themes.service';

const logger = new Logger('ThemeBootstrap');

export async function bootstrapThemes(app: INestApplication): Promise<void> {
  const themeService = app.get(ThemesService);
  const loaded = await themeService.rescan(process.cwd());
  logger.log(`Theme runtime bootstrap initialized (${loaded.length} loaded)`);
}
