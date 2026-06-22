import { Module } from '@nestjs/common';

import { PluginsController } from './plugins.controller';
import { PluginsRepository } from './plugins.repository';
import { PluginLoaderService } from './runtime/plugin-loader.service';
import { PluginsService } from './plugins.service';

@Module({
  controllers: [PluginsController],
  providers: [PluginsService, PluginsRepository, PluginLoaderService],
  exports: [PluginLoaderService, PluginsService],
})
export class PluginsModule {}
