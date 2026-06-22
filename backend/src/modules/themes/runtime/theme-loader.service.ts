import { Injectable, Logger } from '@nestjs/common';
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';

import { ThemeRecord, ThemesRepository } from '../themes.repository';

type ThemeFieldDefinition = {
  key: string;
  type: string;
  label: string;
  help?: string;
  options?: string[];
};

type ThemeManifest = {
  id?: string;
  name: string;
  version: string;
  preview?: string;
  description?: string;
  cssDefaults?: Record<string, unknown>;
  themeTokens?: Record<string, unknown>;
  fields?: ThemeFieldDefinition[];
  layout?: string;
};

@Injectable()
export class ThemeLoaderService {
  private readonly logger = new Logger(ThemeLoaderService.name);

  constructor(private readonly themesRepository: ThemesRepository) {}

  async scanAndLoad(baseDir = process.cwd()): Promise<ThemeRecord[]> {
    const scanRoots = [join(baseDir, 'themes'), join(baseDir, 'themes', 'official')];

    const manifests: ThemeRecord[] = [];
    for (const root of scanRoots) {
      const roots = await this.findManifests(root, 2);
      manifests.push(...roots);
    }

    const unique = new Map<string, ThemeRecord>();
    manifests.forEach((item) => {
      unique.set(item.id, item);
    });

    const records = Array.from(unique.values());

    await this.themesRepository.replaceAll(records);
    this.logger.log(`Loaded ${records.length} theme manifest(s)`);

    return records;
  }

  private async findManifests(dir: string, maxDepth: number): Promise<ThemeRecord[]> {
    try {
      const entries = await readdir(dir, { withFileTypes: true });
      const results: ThemeRecord[] = [];

      for (const entry of entries) {
        const fullPath = join(dir, entry.name);
        if (entry.isDirectory()) {
          if (maxDepth <= 0) {
            continue;
          }
          results.push(...(await this.findManifests(fullPath, maxDepth - 1)));
          continue;
        }

        if (!entry.isFile() || entry.name !== 'theme.json') {
          continue;
        }

        const raw = await readFile(fullPath, 'utf-8');
        let parsed: ThemeManifest;
        try {
          parsed = JSON.parse(raw) as ThemeManifest;
        } catch {
          this.logger.warn(`Skipped invalid JSON theme manifest: ${fullPath}`);
          continue;
        }

        if (!parsed.id || !parsed.name || !parsed.version) {
          this.logger.warn(`Skipped invalid theme manifest: ${fullPath}`);
          continue;
        }

        results.push({
          id: String(parsed.id),
          name: parsed.name,
          version: parsed.version,
          preview: parsed.preview,
          description: parsed.description,
          cssDefaults: parsed.cssDefaults,
          themeTokens: parsed.themeTokens,
          fields: parsed.fields,
          layout: parsed.layout ?? 'default',
          sourcePath: fullPath,
          enabled: true,
        });
      }

      return results;
    } catch {
      return [];
    }
  }
}
