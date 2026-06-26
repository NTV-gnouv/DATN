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
var ThemeLoaderService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThemeLoaderService = void 0;
const common_1 = require("@nestjs/common");
const promises_1 = require("fs/promises");
const path_1 = require("path");
const themes_repository_1 = require("../themes.repository");
let ThemeLoaderService = ThemeLoaderService_1 = class ThemeLoaderService {
    constructor(themesRepository) {
        this.themesRepository = themesRepository;
        this.logger = new common_1.Logger(ThemeLoaderService_1.name);
    }
    async scanAndLoad(baseDir = process.cwd()) {
        const scanRoots = [(0, path_1.join)(baseDir, 'themes'), (0, path_1.join)(baseDir, 'themes', 'official')];
        const manifests = [];
        for (const root of scanRoots) {
            const roots = await this.findManifests(root, 2);
            manifests.push(...roots);
        }
        const unique = new Map();
        manifests.forEach((item) => {
            unique.set(item.id, item);
        });
        const records = Array.from(unique.values());
        await this.themesRepository.replaceAll(records);
        this.logger.log(`Loaded ${records.length} theme manifest(s)`);
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
                    results.push(...(await this.findManifests(fullPath, maxDepth - 1)));
                    continue;
                }
                if (!entry.isFile() || entry.name !== 'theme.json') {
                    continue;
                }
                const raw = await (0, promises_1.readFile)(fullPath, 'utf-8');
                let parsed;
                try {
                    parsed = JSON.parse(raw);
                }
                catch {
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
        }
        catch {
            return [];
        }
    }
};
exports.ThemeLoaderService = ThemeLoaderService;
exports.ThemeLoaderService = ThemeLoaderService = ThemeLoaderService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [themes_repository_1.ThemesRepository])
], ThemeLoaderService);
