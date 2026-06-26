"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var PluginLoaderService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PluginLoaderService = void 0;
const common_1 = require("@nestjs/common");
const promises_1 = require("fs/promises");
const path_1 = require("path");
const plugins_repository_1 = require("../plugins.repository");
let PluginLoaderService = PluginLoaderService_1 = class PluginLoaderService {
    constructor(pluginsRepository) {
        this.pluginsRepository = pluginsRepository;
        this.logger = new common_1.Logger(PluginLoaderService_1.name);
    }
    async scanAndLoad(baseDir = process.cwd()) {
        const scanRoots = [
            (0, path_1.join)(baseDir, 'plugins', 'official'),
            (0, path_1.join)(baseDir, 'plugins', 'marketplace'),
            (0, path_1.join)(baseDir, 'plugins', 'custom'),
            (0, path_1.join)(baseDir, 'plugins'),
        ];
        const manifests = [];
        for (const root of scanRoots) {
            const manifestsInRoot = await this.findManifests(root, 2);
            manifests.push(...manifestsInRoot);
        }
        const uniqueMap = new Map();
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
    async findManifests(dir, maxDepth) {
        try {
            const entries = await (0, promises_1.readdir)(dir, { withFileTypes: true });
            const results = [];
            for (const entry of entries) {
                const fullPath = (0, path_1.join)(dir, entry.name);
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
                const raw = await (0, promises_1.readFile)(fullPath, 'utf-8');
                const parsed = JSON.parse(raw);
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
        }
        catch {
            return [];
        }
    }
};
exports.PluginLoaderService = PluginLoaderService;
exports.PluginLoaderService = PluginLoaderService = PluginLoaderService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [plugins_repository_1.PluginsRepository])
], PluginLoaderService);
