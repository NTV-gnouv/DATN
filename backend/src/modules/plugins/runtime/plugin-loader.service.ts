import { Injectable, Logger } from '@nestjs/common';
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';

import { PluginRecord, PluginsRepository } from '../plugins.repository';

type PluginManifest = {
  name: string;
  version: string;
  type: string;
  entry: string;
  permissions?: string[];
};

@Injectable()
export class PluginLoaderService {
  private readonly logger = new Logger(PluginLoaderService.name);

  constructor(private readonly pluginsRepository: PluginsRepository) {}

  async scanAndLoad(baseDir = process.cwd()): Promise<PluginRecord[]> {
    const scanRoots = [
      join(baseDir, 'plugins', 'official'),
      join(baseDir, 'plugins', 'marketplace'),
      join(baseDir, 'plugins', 'custom'),
      join(baseDir, 'plugins'),
    ];

    const manifests: PluginRecord[] = [];

    for (const root of scanRoots) {
      const manifestsInRoot = await this.findManifests(root, 2);
      manifests.push(...manifestsInRoot);
    }

    // Dedupe by name + version + source path.
    const uniqueMap = new Map<string, PluginRecord>();
    manifests.forEach((item) => {
      const key = `${item.name}:${item.version}:${item.sourcePath}`;
      uniqueMap.set(key, item);
    });

    const records = Array.from(uniqueMap.values()).map((item, index) => ({
      ...item,
      id: `plugin-${index + 1}`,
    }));

    await this.pluginsRepository.replaceAll(records);
    this.logger.log(`Loaded ${records.length} plugin manifest(s)`);

    return records;
  }

  private async findManifests(dir: string, maxDepth: number): Promise<PluginRecord[]> {
    try {
      const entries = await readdir(dir, { withFileTypes: true });
      const results: PluginRecord[] = [];

      for (const entry of entries) {
        const fullPath = join(dir, entry.name);
        if (entry.isDirectory()) {
          if (maxDepth <= 0) {
            continue;
          }
          const nested = await this.findManifests(fullPath, maxDepth - 1);
          results.push(...nested);
          continue;
        }

        if (!entry.isFile() || entry.name !== 'plugin.json') {
          continue;
        }

        const raw = await readFile(fullPath, 'utf-8');
        const parsed = JSON.parse(raw) as PluginManifest;
        if (!parsed.name || !parsed.version || !parsed.type || !parsed.entry) {
          this.logger.warn(`Skipped invalid plugin manifest: ${fullPath}`);
          continue;
        }

        results.push({
          id: '',
          name: parsed.name,
          version: parsed.version,
          type: parsed.type,
          entry: parsed.entry,
          permissions: parsed.permissions ?? [],
          enabled: true,
          sourcePath: fullPath,
        });
      }

      return results;
    } catch {
      return [];
    }
  }
}
