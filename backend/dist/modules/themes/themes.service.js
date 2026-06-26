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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThemesService = void 0;
const common_1 = require("@nestjs/common");
const theme_loader_service_1 = require("./runtime/theme-loader.service");
const themes_repository_1 = require("./themes.repository");
const theme_customizer_service_1 = require("./theme-customizer.service");
let ThemesService = class ThemesService {
    constructor(themesRepository, themeLoaderService, customizer) {
        this.themesRepository = themesRepository;
        this.themeLoaderService = themeLoaderService;
        this.customizer = customizer;
    }
    list() {
        return this.themesRepository.list();
    }
    get(id) {
        return this.themesRepository.get(id);
    }
    getDefaultId() {
        return this.themesRepository.getDefaultId();
    }
    create(payload) {
        return this.themesRepository.create(payload);
    }
    update(id, payload) {
        return this.themesRepository.update(id, payload);
    }
    rescan(baseDir) {
        return this.themeLoaderService.scanAndLoad(baseDir);
    }
    enable(id) {
        return this.themesRepository.update(id, { enabled: true });
    }
    disable(id) {
        return this.themesRepository.update(id, { enabled: false });
    }
    remove(id) {
        return this.themesRepository.remove(id);
    }
    async generateThemeFromProfile(input) {
        return this.customizer.generateThemeFromProfile(input);
    }
    async customizeTheme(theme, customization) {
        return this.customizer.customizeTheme(theme, customization);
    }
    generateThemeCSS(theme) {
        return this.customizer.generateThemeCSS(theme);
    }
    async saveTheme(pageId, themeConfig) {
        return this.customizer.saveTheme(pageId, themeConfig);
    }
    async updateTheme(id, updates) {
        return this.customizer.updateTheme(id, updates);
    }
    async getTheme(id) {
        return this.customizer.getTheme(id);
    }
    async listThemesForPage(pageId) {
        return this.customizer.listThemesForPage(pageId);
    }
    async deleteTheme(id) {
        return this.customizer.deleteTheme(id);
    }
};
exports.ThemesService = ThemesService;
exports.ThemesService = ThemesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [themes_repository_1.ThemesRepository,
        theme_loader_service_1.ThemeLoaderService,
        theme_customizer_service_1.ThemeCustomizerService])
], ThemesService);
