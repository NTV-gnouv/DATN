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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThemesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const roles_decorator_1 = require("../../shared/decorators/roles.decorator");
const public_decorator_1 = require("../../shared/decorators/public.decorator");
const themes_service_1 = require("./themes.service");
const theme_dto_1 = require("./dto/theme.dto");
let ThemesController = class ThemesController {
    constructor(themesService) {
        this.themesService = themesService;
    }
    list() {
        return this.themesService.list();
    }
    getDefaultId() {
        return this.themesService.getDefaultId();
    }
    get(id) {
        return this.themesService.get(id);
    }
    create(body) {
        return this.themesService.create(body);
    }
    update(id, body) {
        return this.themesService.update(id, body);
    }
    rescan() {
        return this.themesService.rescan();
    }
    enable(id) {
        return this.themesService.enable(id);
    }
    disable(id) {
        return this.themesService.disable(id);
    }
    remove(id) {
        return this.themesService.remove(id);
    }
    async generateTheme(generateThemeDto) {
        return await this.themesService.generateThemeFromProfile(generateThemeDto);
    }
    async createCustomTheme(body) {
        const themeConfig = await this.themesService.generateThemeFromProfile({
            username: body.username,
            displayName: body.displayName,
            description: body.description_text,
            industry: body.industry,
            socialLinks: body.socialLinks,
            tone: body.tone,
            preferredStyle: body.preferredStyle,
        });
        return await this.themesService.saveTheme(body.pageId, {
            ...themeConfig.suggestedTheme,
            id: `custom-theme-${Date.now()}`,
            pageId: body.pageId,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    }
    async getCustomTheme(id) {
        const theme = await this.themesService.getTheme(id);
        if (!theme) {
            return { error: 'Theme not found' };
        }
        return theme;
    }
    async listThemesForPage(pageId) {
        return await this.themesService.listThemesForPage(pageId);
    }
    async updateCustomTheme(id, updateThemeDto) {
        return await this.themesService.updateTheme(id, updateThemeDto);
    }
    async deleteCustomTheme(id) {
        const deleted = await this.themesService.deleteTheme(id);
        return { deleted, id };
    }
    async getThemeCSS(id) {
        const theme = await this.themesService.getTheme(id);
        if (!theme) {
            return { error: 'Theme not found' };
        }
        const css = this.themesService.generateThemeCSS(theme);
        return { css };
    }
};
exports.ThemesController = ThemesController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List themes', description: 'Return all themes available in the system.' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ThemesController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('defaults/id'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get default theme ID', description: 'Return the default theme ID used when creating a landing page.' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ThemesController.prototype, "getDefaultId", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get theme', description: 'Return a theme by its ID.' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ThemesController.prototype, "get", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create theme', description: 'Create a new theme definition.' }),
    (0, swagger_1.ApiBody)({ description: 'Theme payload' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ThemesController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update theme', description: 'Update a theme by its ID.' }),
    (0, swagger_1.ApiBody)({ description: 'Theme update payload' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ThemesController.prototype, "update", null);
__decorate([
    (0, common_1.Post)('admin/rescan'),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Rescan themes', description: 'Admin endpoint to rescan the themes directory and reload manifests.' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ThemesController.prototype, "rescan", null);
__decorate([
    (0, common_1.Post)('admin/:id/enable'),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Enable theme', description: 'Admin endpoint to enable a theme.' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ThemesController.prototype, "enable", null);
__decorate([
    (0, common_1.Post)('admin/:id/disable'),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Disable theme', description: 'Admin endpoint to disable a theme.' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ThemesController.prototype, "disable", null);
__decorate([
    (0, common_1.Post)('admin/:id/remove'),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Remove theme', description: 'Admin endpoint to remove a theme.' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ThemesController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)('generate'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate theme from profile', description: 'Generate a theme configuration based on user profile data.' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [theme_dto_1.GenerateThemeDto]),
    __metadata("design:returntype", Promise)
], ThemesController.prototype, "generateTheme", null);
__decorate([
    (0, common_1.Post)('custom/create'),
    (0, swagger_1.ApiOperation)({ summary: 'Create custom theme', description: 'Create and save a custom theme for a page.' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ThemesController.prototype, "createCustomTheme", null);
__decorate([
    (0, common_1.Get)('custom/:id/details'),
    (0, swagger_1.ApiOperation)({ summary: 'Get custom theme', description: 'Get detailed information about a custom theme.' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ThemesController.prototype, "getCustomTheme", null);
__decorate([
    (0, common_1.Get)('custom/page/:pageId'),
    (0, swagger_1.ApiOperation)({ summary: 'List page themes', description: 'List all custom themes for a specific page.' }),
    __param(0, (0, common_1.Param)('pageId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ThemesController.prototype, "listThemesForPage", null);
__decorate([
    (0, common_1.Patch)('custom/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update custom theme', description: 'Update a custom theme configuration.' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, theme_dto_1.UpdateThemeDto]),
    __metadata("design:returntype", Promise)
], ThemesController.prototype, "updateCustomTheme", null);
__decorate([
    (0, common_1.Delete)('custom/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete custom theme', description: 'Delete a custom theme.' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ThemesController.prototype, "deleteCustomTheme", null);
__decorate([
    (0, common_1.Get)('custom/:id/css'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get theme CSS', description: 'Generate and return CSS for a theme.' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ThemesController.prototype, "getThemeCSS", null);
exports.ThemesController = ThemesController = __decorate([
    (0, swagger_1.ApiTags)('Themes'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('themes'),
    __metadata("design:paramtypes", [themes_service_1.ThemesService])
], ThemesController);
