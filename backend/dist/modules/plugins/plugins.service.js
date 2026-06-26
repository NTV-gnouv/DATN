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
exports.PluginsService = void 0;
const common_1 = require("@nestjs/common");
const plugin_loader_service_1 = require("./runtime/plugin-loader.service");
const plugins_repository_1 = require("./plugins.repository");
let PluginsService = class PluginsService {
    constructor(pluginsRepository, pluginLoaderService) {
        this.pluginsRepository = pluginsRepository;
        this.pluginLoaderService = pluginLoaderService;
    }
    list() {
        return this.pluginsRepository.list();
    }
    get(id) {
        return this.pluginsRepository.get(id);
    }
    create(payload) {
        return this.pluginsRepository.create(payload);
    }
    update(id, payload) {
        return this.pluginsRepository.update(id, payload);
    }
    rescan(baseDir) {
        return this.pluginLoaderService.scanAndLoad(baseDir);
    }
    enable(id) {
        return this.pluginsRepository.update(id, { enabled: true });
    }
    disable(id) {
        return this.pluginsRepository.update(id, { enabled: false });
    }
    remove(id) {
        return this.pluginsRepository.remove(id);
    }
};
exports.PluginsService = PluginsService;
exports.PluginsService = PluginsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [plugins_repository_1.PluginsRepository,
        plugin_loader_service_1.PluginLoaderService])
], PluginsService);
