"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bootstrapPlugins = bootstrapPlugins;
const common_1 = require("@nestjs/common");
const plugins_service_1 = require("../modules/plugins/plugins.service");
const logger = new common_1.Logger('PluginBootstrap');
async function bootstrapPlugins(app) {
    const pluginService = app.get(plugins_service_1.PluginsService);
    const loaded = await pluginService.rescan(process.cwd());
    logger.log(`Plugin runtime bootstrap initialized (${loaded.length} loaded)`);
}
