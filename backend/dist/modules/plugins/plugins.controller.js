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
exports.PluginsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const roles_decorator_1 = require("../../shared/decorators/roles.decorator");
const plugins_service_1 = require("./plugins.service");
let PluginsController = class PluginsController {
    constructor(pluginsService) {
        this.pluginsService = pluginsService;
    }
    list() {
        return this.pluginsService.list();
    }
    get(id) {
        return this.pluginsService.get(id);
    }
    create(body) {
        return this.pluginsService.create(body);
    }
    update(id, body) {
        return this.pluginsService.update(id, body);
    }
    rescan() {
        return this.pluginsService.rescan();
    }
    enable(id) {
        return this.pluginsService.enable(id);
    }
    disable(id) {
        return this.pluginsService.disable(id);
    }
    remove(id) {
        return this.pluginsService.remove(id);
    }
};
exports.PluginsController = PluginsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List plugins', description: 'Return all installed plugins.' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PluginsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get plugin', description: 'Return a plugin by its ID.' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PluginsController.prototype, "get", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create plugin', description: 'Create a plugin record or register a plugin definition.' }),
    (0, swagger_1.ApiBody)({ description: 'Plugin payload' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PluginsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update plugin', description: 'Update plugin metadata or activation state.' }),
    (0, swagger_1.ApiBody)({ description: 'Plugin update payload' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PluginsController.prototype, "update", null);
__decorate([
    (0, common_1.Post)('admin/rescan'),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Rescan plugins', description: 'Admin endpoint to scan plugin manifests and reload registry.' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PluginsController.prototype, "rescan", null);
__decorate([
    (0, common_1.Post)('admin/:id/enable'),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Enable plugin', description: 'Admin endpoint to enable a plugin.' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PluginsController.prototype, "enable", null);
__decorate([
    (0, common_1.Post)('admin/:id/disable'),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Disable plugin', description: 'Admin endpoint to disable a plugin.' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PluginsController.prototype, "disable", null);
__decorate([
    (0, common_1.Post)('admin/:id/remove'),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Remove plugin', description: 'Admin endpoint to remove a plugin.' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PluginsController.prototype, "remove", null);
exports.PluginsController = PluginsController = __decorate([
    (0, swagger_1.ApiTags)('Plugins'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('plugins'),
    __metadata("design:paramtypes", [plugins_service_1.PluginsService])
], PluginsController);
