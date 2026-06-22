import { Injectable } from '@nestjs/common';

import { PluginLoaderService } from './runtime/plugin-loader.service';
import { PluginsRepository } from './plugins.repository';

@Injectable()
export class PluginsService {
  constructor(
    private readonly pluginsRepository: PluginsRepository,
    private readonly pluginLoaderService: PluginLoaderService,
  ) {}

  list() {
    return this.pluginsRepository.list();
  }

  get(id: string) {
    return this.pluginsRepository.get(id);
  }

  create(payload: Record<string, unknown>) {
    return this.pluginsRepository.create(payload);
  }

  update(id: string, payload: Record<string, unknown>) {
    return this.pluginsRepository.update(id, payload);
  }

  rescan(baseDir?: string) {
    return this.pluginLoaderService.scanAndLoad(baseDir);
  }

  enable(id: string) {
    return this.pluginsRepository.update(id, { enabled: true });
  }

  disable(id: string) {
    return this.pluginsRepository.update(id, { enabled: false });
  }

  remove(id: string) {
    return this.pluginsRepository.remove(id);
  }
}
