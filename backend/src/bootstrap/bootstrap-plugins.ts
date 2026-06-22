import { INestApplication, Logger } from '@nestjs/common';

import { PluginsService } from '@/modules/plugins/plugins.service';

const logger = new Logger('PluginBootstrap');

export async function bootstrapPlugins(app: INestApplication): Promise<void> {
  const pluginService = app.get(PluginsService);
  const loaded = await pluginService.rescan(process.cwd());
  logger.log(`Plugin runtime bootstrap initialized (${loaded.length} loaded)`);
}
