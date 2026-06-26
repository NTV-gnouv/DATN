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
exports.PagesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../../shared/decorators/current-user.decorator");
const public_decorator_1 = require("../../shared/decorators/public.decorator");
const create_page_dto_1 = require("./dto/create-page.dto");
const pages_service_1 = require("./pages.service");
let PagesController = class PagesController {
    constructor(pagesService) {
        this.pagesService = pagesService;
    }
    getMyPage(user) {
        return this.pagesService.getMyPage(user.sub);
    }
    suggestDomain(user, base) {
        return this.pagesService.suggestDomain(user.sub, base);
    }
    create(body, user) {
        return this.pagesService.create({
            ...body,
            ownerId: user.sub,
        });
    }
    createTemplate(body, user) {
        return this.pagesService.createTemplate({
            ...body,
            ownerId: user.sub,
        });
    }
    getBySlug(slug) {
        return this.pagesService.getBySlug(slug);
    }
    getByUsername(username) {
        return this.pagesService.getByUsername(username);
    }
    checkSlug(slug, excludeId) {
        return this.pagesService.checkSlug(slug, excludeId);
    }
    list(user) {
        return this.pagesService.listForOwner(user.sub);
    }
    getEditorConfig(id, user) {
        return this.pagesService.getEditorConfig(id, user.sub);
    }
    get(id, user) {
        return this.pagesService.getOwned(id, user.sub);
    }
    update(id, body, user) {
        return this.pagesService.update(id, body, user.sub);
    }
    updateSlug(id, body, user) {
        return this.pagesService.updateSlug(id, String(body.slug ?? ''), user.sub);
    }
    updateSlugByUsername(username, body, user) {
        return this.pagesService.updateSlugByUsername(username, String(body.slug ?? ''), user.sub);
    }
    updateEditorConfig(id, body, user) {
        return this.pagesService.updateEditorConfig(id, body, user.sub);
    }
    remove(id, user) {
        return this.pagesService.remove(id, user.sub);
    }
};
exports.PagesController = PagesController;
__decorate([
    (0, common_1.Get)('me'),
    (0, swagger_1.ApiOperation)({ summary: 'Get my page', description: 'Return the landing page owned by the authenticated user.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PagesController.prototype, "getMyPage", null);
__decorate([
    (0, common_1.Get)('suggest-domain'),
    (0, swagger_1.ApiOperation)({
        summary: 'Suggest unique domain',
        description: 'Suggest a unique slug/username for a new account page.',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('base')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], PagesController.prototype, "suggestDomain", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create page', description: 'Create a new landing page for the authenticated tenant/user.' }),
    (0, swagger_1.ApiBody)({ description: 'Page creation payload' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_page_dto_1.CreatePageDto, Object]),
    __metadata("design:returntype", void 0)
], PagesController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('template'),
    (0, swagger_1.ApiOperation)({ summary: 'Create template page', description: 'Create a starter landing page template with default blocks.' }),
    (0, swagger_1.ApiBody)({ description: 'Starter page template payload' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_page_dto_1.CreatePageDto, Object]),
    __metadata("design:returntype", void 0)
], PagesController.prototype, "createTemplate", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('slug/:slug'),
    (0, swagger_1.ApiOperation)({ summary: 'Get page by slug', description: 'Return a public landing page by slug.' }),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PagesController.prototype, "getBySlug", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('user/:username'),
    (0, swagger_1.ApiOperation)({ summary: 'Get page by username', description: 'Return the public landing page linked to a creator account.' }),
    __param(0, (0, common_1.Param)('username')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PagesController.prototype, "getByUsername", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('slug/:slug/available'),
    (0, swagger_1.ApiOperation)({ summary: 'Check slug availability', description: 'Return whether a slug is available before page creation.' }),
    __param(0, (0, common_1.Param)('slug')),
    __param(1, (0, common_1.Query)('excludeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PagesController.prototype, "checkSlug", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List pages', description: 'Return pages owned by the authenticated user.' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PagesController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id/editor-config'),
    (0, swagger_1.ApiOperation)({ summary: 'Get page editor config', description: 'Return editor configuration (theme + header block) for a page.' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PagesController.prototype, "getEditorConfig", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get page', description: 'Return a landing page by its ID if owned by the current user.' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PagesController.prototype, "get", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update page', description: 'Update page metadata and settings.' }),
    (0, swagger_1.ApiBody)({ description: 'Page update payload' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], PagesController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/slug'),
    (0, swagger_1.ApiOperation)({ summary: 'Update page slug', description: 'Persist a page slug directly to the database.' }),
    (0, swagger_1.ApiBody)({ description: 'Slug payload' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], PagesController.prototype, "updateSlug", null);
__decorate([
    (0, common_1.Patch)('user/:username/slug'),
    (0, swagger_1.ApiOperation)({ summary: 'Update slug by username', description: 'Persist landing page slug for the authenticated owner.' }),
    (0, swagger_1.ApiBody)({ description: 'Slug payload' }),
    __param(0, (0, common_1.Param)('username')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], PagesController.prototype, "updateSlugByUsername", null);
__decorate([
    (0, common_1.Patch)(':id/editor-config'),
    (0, swagger_1.ApiOperation)({ summary: 'Update page editor config', description: 'Persist theme ID and header block configuration for a page.' }),
    (0, swagger_1.ApiBody)({ description: 'Editor configuration payload' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], PagesController.prototype, "updateEditorConfig", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete page', description: 'Remove a page from the system.' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PagesController.prototype, "remove", null);
exports.PagesController = PagesController = __decorate([
    (0, swagger_1.ApiTags)('Pages'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('pages'),
    __metadata("design:paramtypes", [pages_service_1.PagesService])
], PagesController);
