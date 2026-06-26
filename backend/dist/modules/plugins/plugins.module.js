"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PluginsModule = void 0;
const common_1 = require("@nestjs/common");
const plugins_controller_1 = require("./plugins.controller");
const plugins_repository_1 = require("./plugins.repository");
const plugin_loader_service_1 = require("./runtime/plugin-loader.service");
const plugins_service_1 = require("./plugins.service");
let PluginsModule = class PluginsModule {
};
exports.PluginsModule = PluginsModule;
exports.PluginsModule = PluginsModule = __decorate([
    (0, common_1.Module)({
        controllers: [plugins_controller_1.PluginsController],
        providers: [plugins_service_1.PluginsService, plugins_repository_1.PluginsRepository, plugin_loader_service_1.PluginLoaderService],
        exports: [plugin_loader_service_1.PluginLoaderService, plugins_service_1.PluginsService],
    })
], PluginsModule);
